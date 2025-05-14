import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { hashPassword } from '$lib/utils/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	// Get count of lecturer accounts
	const lecturerCount = await db.user.count({
		where: { role: 'LECTURER' }
	});

	return {
		lecturerCount
	};
};

export const actions: Actions = {
	createLecturer: async ({ request }) => {
		try {
			const formData = await request.formData();
			const name = formData.get('name') as string;
			const email = formData.get('email') as string;
			const department = formData.get('department') as string;
			const password = formData.get('password') as string;

			if (!name || !email || !password) {
				return { error: 'Name, email and password are required' };
			}

			// Check if email already exists
			const existingUser = await db.user.findUnique({
				where: { email }
			});

			if (existingUser) {
				return { error: 'Email already in use' };
			}

			// Hash the password
			const passwordHash = await hashPassword(password);

			// Create the lecturer account
			const lecturer = await db.user.create({
				data: {
					name,
					email,
					role: 'LECTURER',
					department,
					passwordHash
				}
			});

			return {
				success: true,
				message: `Created lecturer account for ${name}`,
				lecturer: {
					id: lecturer.id,
					name: lecturer.name,
					email: lecturer.email
				}
			};
		} catch (err) {
			console.error('Error creating lecturer:', err);
			return { error: 'Failed to create lecturer account' };
		}
	}
};
