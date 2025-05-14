import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check authentication
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	try {
		// Use raw SQL query instead of Prisma models to avoid schema mismatch
		const userData = await db.$queryRaw`
			SELECT id, name, email, role, department, matricNumber, level
			FROM "User"
			WHERE id = ${locals.user.id}
		`;

		// Format the user data properly
		const userProfile = Array.isArray(userData) && userData.length > 0 ? userData[0] : locals.user;

		return {
			userProfile
		};
	} catch (err) {
		console.error('Error loading user profile data:', err);
		// Fallback to session user data
		return {
			userProfile: locals.user
		};
	}
};
