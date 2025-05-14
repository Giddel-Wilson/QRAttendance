import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { hashPassword } from '$lib/utils/auth';
import { createAuditLog } from '$lib/server/auditLog';

export const load: PageServerLoad = async ({ locals }) => {
	// Auth check
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	try {
		// Use findMany but handle possible missing columns gracefully
		const users = await db.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				department: true,
				createdAt: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		// Try to get matricNumber and level directly from SQLite
		// This is a fallback approach
		let usersWithExtendedFields = users;

		try {
			// Attempt direct database query to get these fields
			// This will work even if Prisma doesn't know about them yet
			const rawUsers = await db.$queryRaw`
        SELECT id, matricNumber, level FROM "User"
      `;

			// Merge the raw data with the Prisma data
			if (Array.isArray(rawUsers)) {
				usersWithExtendedFields = users.map((user) => {
					const rawUser = rawUsers.find((raw) => raw.id === user.id);
					return {
						...user,
						matricNumber: rawUser?.matricNumber || null,
						level: rawUser?.level || null
					};
				});
			}
		} catch (error) {
			console.log('Could not fetch matricNumber and level directly, using placeholders');

			// Use placeholder values
			usersWithExtendedFields = users.map((user) => ({
				...user,
				matricNumber: 'Update with SQL',
				level: 'Update with SQL'
			}));
		}

		return {
			users: usersWithExtendedFields,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading users:', err);
		return {
			users: [],
			userProfile: locals.user
		};
	}
};

export const actions = {
	createUser: async ({ locals, request, getClientAddress }) => {
		try {
			const formData = await request.formData();
			const name = formData.get('name') as string;
			const email = formData.get('email') as string;
			const role = formData.get('role') as string;
			const password = formData.get('password') as string;

			// Validate input
			if (!name || !email || !role || !password) {
				return { error: 'All fields are required' };
			}

			// Check if email is already in use
			const existingUser = await db.user.findUnique({
				where: { email }
			});

			if (existingUser) {
				return { error: 'Email is already in use' };
			}

			// Hash password
			const passwordHash = await hashPassword(password);

			// Create user
			const newUser = await db.user.create({
				data: {
					name,
					email,
					role,
					passwordHash
				}
			});

			// Log user creation
			await createAuditLog({
				userId: locals.user.id,
				action: 'USER_CREATED',
				entityType: 'User',
				entityId: newUser.id,
				details: `Created ${newUser.role} user: ${newUser.email}`,
				ipAddress: getClientAddress ? getClientAddress() : null
			});

			return {
				success: true,
				message: `User ${name} created successfully`
			};
		} catch (err) {
			console.error('Error creating user:', err);
			return { error: 'Failed to create user' };
		}
	},

	updateUser: async ({ locals, request, getClientAddress }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const role = formData.get('role')?.toString();

		if (!id || !name || !email || !role) {
			return { error: 'Missing required fields' };
		}

		try {
			// Create base update object
			const updateData: any = {
				name,
				email,
				role
			};

			// Add student-specific fields if role is STUDENT
			if (role === 'STUDENT') {
				const matricNumber = formData.get('matricNumber')?.toString() || null;
				const level = formData.get('level')?.toString() || null;
				const department = formData.get('department')?.toString() || null;

				// Use raw query to update student fields that might not be in Prisma model
				const query = `
                    UPDATE "User"
                    SET 
                        name = '${name}',
                        email = '${email}',
                        role = '${role}',
                        "matricNumber" = ${matricNumber ? `'${matricNumber}'` : 'NULL'},
                        level = ${level ? `'${level}'` : 'NULL'},
                        department = ${department ? `'${department}'` : 'NULL'}
                    WHERE id = '${id}'
                `;

				await db.$executeRawUnsafe(query);
				return { success: true };
			} else {
				// For non-student roles, use Prisma's update
				await db.user.update({
					where: { id },
					data: updateData
				});
				// Log the user update action
				// Log user update with role changes if applicable
				const roleChanged = oldUser.role !== newRole;
				await createAuditLog({
					userId: locals.user.id,
					action: roleChanged ? 'USER_ROLE_CHANGED' : 'USER_UPDATED',
					entityType: 'User',
					entityId: id,
					details: roleChanged
						? `Changed user role from ${oldUser.role} to ${newRole} for ${oldUser.email}`
						: `Updated user: ${oldUser.email}`,
					ipAddress: getClientAddress ? getClientAddress() : null
				});
				return { success: true };
			}
		} catch (error) {
			console.error('Error updating user:', error);
			return { error: 'Failed to update user' };
		}
	},

	deleteUser: async ({ locals, request, getClientAddress }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return { error: 'User ID is required' };
		}

		try {
			const userId = formData.get('id')?.toString();
			const userToDelete = await db.user.findUnique({
				where: { id: userId },
				select: { email: true, name: true, role: true }
			});

			await db.user.delete({
				where: { id }
			});
			// Log the user deletion action
			await createAuditLog({
				userId: locals.user.id,
				action: 'USER_DELETED',
				entityType: 'User',
				entityId: userId,
				details: `Deleted ${userToDelete.role} user: ${userToDelete.email}`,
				ipAddress: getClientAddress ? getClientAddress() : null
			});
			return { success: true };
		} catch (error) {
			console.error('Error deleting user:', error);
			return { error: 'Failed to delete user' };
		}
	},

	resetPassword: async ({ request }) => {
		try {
			const formData = await request.formData();
			const id = formData.get('id') as string;
			const password = formData.get('password') as string;

			if (!id || !password) {
				return { error: 'User ID and password are required' };
			}

			// Hash the new password
			const passwordHash = await hashPassword(password);

			// Update user's password
			await db.user.update({
				where: { id },
				data: { passwordHash }
			});

			return {
				success: true,
				message: 'Password reset successfully'
			};
		} catch (err) {
			console.error('Error resetting password:', err);
			return { error: 'Failed to reset password' };
		}
	}
};
