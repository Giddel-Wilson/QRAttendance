import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { hashPassword } from '$lib/utils/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	const lecturerCount = await db.user.count({
		where: { role: 'LECTURER' }
	});

	return {
		lecturerCount
	};
};

export const actions: Actions = {
	createTestLecturers: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'ADMIN') {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const count = parseInt(formData.get('count') as string) || 3;
			const defaultPassword = await hashPassword('password123');

			const departments = [
				'Computer Science',
				'Electrical Engineering',
				'Mathematics',
				'Physics',
				'Business Administration'
			];

			const createdLecturers = [];

			for (let i = 1; i <= count; i++) {
				const department = departments[Math.floor(Math.random() * departments.length)];
				const lecturer = await db.user.create({
					data: {
						name: `Test Lecturer ${i}`,
						email: `lecturer${i}@example.com`,
						role: 'LECTURER',
						department,
						passwordHash: defaultPassword
					}
				});

				createdLecturers.push({
					name: lecturer.name,
					email: lecturer.email,
					department
				});
			}

			return {
				success: true,
				message: `Created ${count} test lecturer accounts`,
				lecturers: createdLecturers
			};
		} catch (err) {
			console.error('Error creating test lecturers:', err);
			return { error: 'Failed to create test lecturers' };
		}
	}
};
