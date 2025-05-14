import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	try {
		// Get all users
		const allUsers = await db.user.count();

		// Get lecturer accounts
		const lecturers = await db.user.findMany({
			where: {
				role: 'LECTURER'
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				department: true,
				createdAt: true
			},
			orderBy: { name: 'asc' }
		});

		return {
			diagnostics: {
				totalUsers: allUsers,
				totalLecturers: lecturers.length
			},
			lecturers
		};
	} catch (err) {
		console.error('Error fetching lecturers:', err);
		return {
			diagnostics: {
				error: 'Failed to fetch data',
				message: err.message
			},
			lecturers: []
		};
	}
};
