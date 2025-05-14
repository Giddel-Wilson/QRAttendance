import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
	try {
		const users = await db.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true
				// Exclude passwordHash for security
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		return json({
			success: true,
			count: users.length,
			users
		});
	} catch (error) {
		console.error('Error listing users:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
