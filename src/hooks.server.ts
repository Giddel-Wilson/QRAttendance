import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		// Get session data from cookie
		const sessionCookie = event.cookies.get('user_session');

		if (!sessionCookie) {
			event.locals.user = null;
			return await resolve(event);
		}

		// Parse session data from cookie
		const sessionData = JSON.parse(sessionCookie);

		// Set user in locals for use in routes
		event.locals.user = {
			id: sessionData.userId,
			role: sessionData.role,
			name: sessionData.name,
			email: sessionData.email
		};
	} catch (error) {
		// Invalid session data, clear it
		console.error('Failed to parse session:', error);
		event.cookies.delete('user_session', { path: '/' });
		event.locals.user = null;
	}

	// Special case for profile update
	if (event.url.pathname.includes('/profile') && event.request.method === 'POST') {
		const response = await resolve(event);

		// Check if the response contains updated user data
		try {
			const responseClone = response.clone();
			const data = await responseClone.json();

			if (data.success && data.user) {
				// Update the session with new user data
				event.locals.user = {
					...event.locals.user,
					...data.user
				};

				console.log('Updated session with new profile data');
			}
		} catch (err) {
			// Not a JSON response or other error, continue normally
		}

		return response;
	}

	return await resolve(event);
};
