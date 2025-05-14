import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { hash, compare } from 'bcrypt';

// Add utility function to create audit logs
async function createAuditLog(data) {
	try {
		await db.$executeRaw`
      INSERT INTO "AuditLog" (id, timestamp, userId, action, entityType, entityId, details)
      VALUES (
        ${crypto.randomUUID()},
        datetime('now'),
        ${data.userId || null},
        ${data.action},
        ${data.entityType},
        ${data.entityId || null},
        ${data.details || null}
      )
    `;
		console.log('Audit log created successfully');
	} catch (error) {
		console.error('Failed to create audit log:', error);
		// Non-blocking - application continues even if logging fails
	}
}

export const load = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw redirect(302, '/auth/login');
	}

	// For admin, we can use the standard Prisma model since we only need basic fields
	const user = await db.user.findUnique({
		where: {
			id: locals.user.id
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true
		}
	});

	return {
		user
	};
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

			// Create audit log for profile update
			await createAuditLog({
				userId: locals.user.id,
				action: 'PROFILE_UPDATE',
				entityType: 'User',
				entityId: locals.user.id,
				details: `Admin user ${locals.user.email} updated their profile name to "${name}"`
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

			// Create audit log for password change
			await createAuditLog({
				userId: locals.user.id,
				action: 'PASSWORD_CHANGE',
				entityType: 'User',
				entityId: locals.user.id,
				details: `Admin user ${locals.user.email} changed their password`
			});

			return { passwordSuccess: true };
		} catch (error) {
			console.error('Error updating password:', error);
			return fail(500, { passwordError: 'Failed to update password' });
		}
	}
};
