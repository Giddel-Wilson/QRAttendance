import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { hash, compare } from 'bcrypt';

export const load = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'STUDENT') {
		throw redirect(302, '/auth/login');
	}

	// Fetch student info directly using raw query to get all fields from database
	// This bypasses Prisma's model limitations
	try {
		const user = await db.$queryRaw`
			SELECT 
				id, 
				name, 
				email, 
				role, 
				"matricNumber", 
				level, 
				department
			FROM "User"
			WHERE id = ${locals.user.id}
		`;

		return {
			user: Array.isArray(user) && user.length > 0 ? user[0] : locals.user
		};
	} catch (error) {
		console.error('Error fetching student data:', error);
		return { user: locals.user };
	}
};

export const actions = {
	updateProfile: async ({ locals, request }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const data = await request.formData();
		const name = data.get('name')?.toString();

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		try {
			await db.user.update({
				where: {
					id: locals.user.id
				},
				data: {
					name
				}
			});

			return { success: true };
		} catch (error) {
			console.error('Error updating profile:', error);
			return fail(500, { error: 'Failed to update profile' });
		}
	},

	updatePassword: async ({ locals, request }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const data = await request.formData();
		const currentPassword = data.get('currentPassword')?.toString();
		const newPassword = data.get('newPassword')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { passwordError: 'All fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { passwordError: 'New passwords do not match' });
		}

		// Password requirements
		const hasMinLength = newPassword.length >= 8;
		const hasUppercase = /[A-Z]/.test(newPassword);
		const hasLowercase = /[a-z]/.test(newPassword);
		const hasNumber = /[0-9]/.test(newPassword);
		const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
		const criteriaCount = [hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(Boolean).length;

		if (!hasMinLength || criteriaCount < 3) {
			return fail(400, {
				passwordError: 'Password must be at least 8 characters and include 3 of: uppercase, lowercase, numbers, symbols'
			});
		}

		try {
			// Get current user with password
			const user = await db.user.findUnique({
				where: { id: locals.user.id },
				select: { password: true }
			});

			if (!user?.password) {
				return fail(500, { passwordError: 'Could not verify current password' });
			}

			// Verify current password
			const valid = await compare(currentPassword, user.password);
			if (!valid) {
				return fail(400, { passwordError: 'Current password is incorrect' });
			}

			// Hash and update the new password
			const hashedPassword = await hash(newPassword, 10);
			await db.user.update({
				where: { id: locals.user.id },
				data: { password: hashedPassword }
			});

			return { passwordSuccess: true };
		} catch (error) {
			console.error('Error updating password:', error);
			return fail(500, { passwordError: 'Failed to update password' });
		}
	}
};
