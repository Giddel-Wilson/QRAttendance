import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { verifyPassword } from '$lib/utils/auth';
import { createAuditLog } from '$lib/server/auditLog';
import type { Actions } from './$types';

export function load({ locals }) {
	// If user is already logged in, redirect to appropriate page
	if (locals.user) {
		const { role } = locals.user;

		if (role === 'ADMIN') {
			redirect(302, '/admin');
		} else if (role === 'LECTURER') {
			redirect(302, '/lecturer');
		} else if (role === 'STUDENT') {
			redirect(302, '/student');
		}
	}
}

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const rememberMe = formData.get('remember') === 'on';

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, {
				message: 'Invalid form submission',
				data: Object.fromEntries(formData)
			});
		}

		try {
			// Find the user by email first
			let user;

			try {
				user = await db.user.findUnique({
					where: { email: email as string }
				});
			} catch (dbError) {
				console.error('Database query error:', dbError);
				return fail(500, {
					message: 'Database connection error. Please try again.',
					data: { email }
				});
			}

			if (!user) {
				return fail(400, {
					message: 'Incorrect email or password',
					data: { email }
				});
			}

			// Verify the password separately with proper error handling
			let validPassword;
			try {
				validPassword = await verifyPassword(password as string, user.passwordHash);
			} catch (pwError) {
				console.error('Password verification error:', pwError);
				return fail(500, {
					message: 'Error verifying credentials. Please try again.',
					data: { email }
				});
			}

			if (!validPassword) {
				return fail(400, {
					message: 'Incorrect email or password',
					data: { email }
				});
			}

			// At this point authentication was successful, create session
			const sessionData = {
				userId: user.id,
				role: user.role,
				name: user.name,
				email: user.email
			};

			// Log successful login
			await createAuditLog({
				userId: user.id,
				action: 'USER_LOGIN',
				entityType: 'User',
				entityId: user.id,
				details: `User ${email} logged in successfully`,
				ipAddress: getClientAddress()
			});

			// Set cookie directly with no try/catch to avoid false errors
			cookies.set('user_session', JSON.stringify(sessionData), {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax', // Important for security
				maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
			});

			// Use the redirect function with string parameters
			if (user.role === 'ADMIN') {
				return { success: true, redirectTo: '/admin' };
			} else if (user.role === 'LECTURER') {
				return { success: true, redirectTo: '/lecturer' };
			} else if (user.role === 'STUDENT') {
				return { success: true, redirectTo: '/student' };
			} else {
				return { success: true, redirectTo: '/' };
			}
		} catch (e) {
			console.error('Login error:', e);
			return fail(500, {
				message: 'An error occurred during login. Please try again.',
				data: { email }
			});
		}
	}
};
