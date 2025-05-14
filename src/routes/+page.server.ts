import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { redirectBasedOnRole } from '$lib/utils/auth';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is logged in, redirect based on role
	if (locals.user) {
		redirectBasedOnRole(locals.user.role);
	}

	// Otherwise redirect to login page
	redirect(302, '/auth/login');
};
