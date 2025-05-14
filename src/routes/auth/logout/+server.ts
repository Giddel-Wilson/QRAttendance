import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuditLog } from '$lib/server/auditLog';

// Add GET handler for direct URL navigation
export const GET: RequestHandler = async ({ locals, cookies, getClientAddress }) => {
	// Get user info before logout for audit logging
	const userId = locals.user?.id;
	const email = locals.user?.email;

	// Clear session cookie
	cookies.delete('user_session', { path: '/' });

	// Log the logout event
	if (userId) {
		try {
			await createAuditLog({
				userId,
				action: 'USER_LOGOUT',
				entityType: 'User',
				entityId: userId,
				details: `User ${email || userId} logged out`,
				ipAddress: getClientAddress?.() || null
			});
			console.log("Logout activity logged for user:", userId);
		} catch (error) {
			console.error("Failed to log logout activity:", error);
		}
	}

	// Redirect to login page
	return redirect(302, '/auth/login');
};

export const POST: RequestHandler = async ({ locals, cookies, getClientAddress }) => {
	// Get user info before logout for audit logging
	const userId = locals.user?.id;
	const email = locals.user?.email;

	// Clear session cookie
	cookies.delete('user_session', { path: '/' });

	// Log the logout event
	if (userId) {
		try {
			await createAuditLog({
				userId,
				action: 'USER_LOGOUT',
				entityType: 'User',
				entityId: userId,
				details: `User ${email || userId} logged out`,
				ipAddress: getClientAddress?.() || null
			});
			console.log("Logout activity logged for user:", userId);
		} catch (error) {
			console.error("Failed to log logout activity:", error);
		}
	}

	// Redirect to login page
	return redirect(302, '/auth/login');
};
