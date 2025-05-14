import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
	try {
		// Check if there are any users in the database
		const usersCount = await db.user.count();
		console.log(`Found ${usersCount} users in database`);

		if (usersCount > 0) {
			// Get all users without passwords for security
			const users = await db.user.findMany({
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					createdAt: true
					// Don't include passwordHash for security
				}
			});

			return json({ success: true, count: usersCount, users });
		} else {
			return json({
				success: false,
				message: 'No users found in the database. Please register a user first.'
			});
		}
	} catch (error) {
		console.error('Error in debug users endpoint:', error);
		return json(
			{
				success: false,
				message: 'Error fetching users',
				error: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
