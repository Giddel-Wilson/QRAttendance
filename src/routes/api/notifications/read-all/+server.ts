import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function POST({ locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Update all notifications to be marked as read
		await db.$executeRaw`
      UPDATE "Notification"
      SET "read" = true
      WHERE id IN (
        SELECT id FROM "Notification"
        WHERE 
          (${locals.user.role} = 'ADMIN') OR
          (${locals.user.role} = 'LECTURER' AND "forLecturers" = true) OR
          (${locals.user.role} = 'STUDENT' AND "forStudents" = true)
      )
    `;

		return json({ success: true });
	} catch (error) {
		console.error('Error marking notifications as read:', error);
		return json({ error: 'Failed to mark notifications as read' }, { status: 500 });
	}
}
