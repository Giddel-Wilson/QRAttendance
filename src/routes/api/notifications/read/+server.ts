import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const notificationId = url.searchParams.get('id');
	if (!notificationId) {
		return json({ success: false, message: 'Notification ID is required' }, { status: 400 });
	}

	try {
		// Mark the notification as read
		await db.$executeRaw`
      UPDATE "Notification"
      SET "read" = true
      WHERE id = ${notificationId}
    `;

		return json({ success: true });
	} catch (error) {
		console.error('Error marking notification as read:', error);
		return json({ success: false, message: 'Failed to mark notification as read' }, { status: 500 });
	}
}
