import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { verifyPassword } from '$lib/utils/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	// This is just a debug endpoint - should be removed in production
	const email = url.searchParams.get('email');
	const password = url.searchParams.get('password');

	if (!email || !password) {
		return json(
			{
				error: 'Email and password parameters are required'
			},
			{ status: 400 }
		);
	}

	try {
		// Find the user
		const user = await db.user.findUnique({
			where: { email }
		});

		if (!user) {
			return json(
				{
					error: 'User not found',
					email
				},
				{ status: 404 }
			);
		}

		// Verify password
		const isValid = await verifyPassword(password, user.passwordHash);

		return json({
			success: true,
			email,
			passwordValid: isValid,
			userExists: true,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				name: user.name
			}
		});
	} catch (error) {
		console.error('Error verifying password:', error);
		return json(
			{
				error: 'Failed to verify password',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
