import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { hash, compare } from 'bcrypt';

export const load = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw redirect(302, '/auth/login');
	}

	return {
		user: locals.user
	};
};

export const actions = {
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

			// Log the password change
			try {
				await db.$executeRaw`
          INSERT INTO "AuditLog" (
            id, timestamp, userId, action, entityType, entityId, details
          ) VALUES (
            ${crypto.randomUUID()},
            datetime('now'),
            ${locals.user.id},
            ${'PASSWORD_CHANGED'},
            ${'User'},
            ${locals.user.id},
            ${'Admin changed their password'}
          )
        `;
			} catch (e) {
				console.log('Failed to log password change:', e);
			}

			return { passwordSuccess: true };
		} catch (error) {
			console.error('Error updating password:', error);
			return fail(500, { passwordError: 'Failed to update password' });
		}
	}
};
