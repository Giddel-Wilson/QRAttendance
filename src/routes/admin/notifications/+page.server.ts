import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	try {
		// Check if Notification table exists
		let notifications = [];
		const tableExists = await db.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Notification'
    `;

		if (Array.isArray(tableExists) && tableExists.length > 0) {
			// Get notifications with read stats
			notifications = await db.$queryRaw`
        SELECT 
          n.id, n.title, n.message, n.targetRole, n.createdAt, n.createdBy,
          u.name as createdByName,
          (SELECT COUNT(*) FROM UserNotification un WHERE un.notificationId = n.id) as totalCount,
          (SELECT COUNT(*) FROM UserNotification un WHERE un.notificationId = n.id AND un.read = 1) as readCount
        FROM Notification n
        LEFT JOIN "User" u ON n.createdBy = u.id
        ORDER BY n.createdAt DESC
      `;
		}

		return {
			notifications: Array.isArray(notifications) ? notifications : [],
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading notifications:', err);
		return {
			notifications: [],
			userProfile: locals.user
		};
	}
};

export const actions: Actions = {
	createNotification: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'ADMIN') {
			return { error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const message = formData.get('message') as string;
		const targetRole = formData.get('targetRole') as string;

		if (!title || !message) {
			return { error: 'Title and message are required' };
		}

		try {
			// Check if Notification table exists, create if not
			const notificationTableExists = await db.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='Notification'
      `;

			if (!Array.isArray(notificationTableExists) || notificationTableExists.length === 0) {
				await db.$executeRaw`
          CREATE TABLE "Notification" (
            "id" TEXT PRIMARY KEY,
            "title" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "targetRole" TEXT DEFAULT 'ALL',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdBy" TEXT,
            FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL
          )
        `;
			}

			// Check if UserNotification table exists, create if not
			const userNotificationTableExists = await db.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='UserNotification'
      `;

			if (!Array.isArray(userNotificationTableExists) || userNotificationTableExists.length === 0) {
				await db.$executeRaw`
          CREATE TABLE "UserNotification" (
            "id" TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "notificationId" TEXT NOT NULL,
            "read" BOOLEAN NOT NULL DEFAULT 0,
            "readAt" DATETIME,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
            FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE,
            UNIQUE("userId", "notificationId")
          )
        `;
			}

			// Generate ID for the notification
			const notificationId = crypto.randomUUID();
			const now = new Date().toISOString();

			// Insert notification
			await db.$executeRaw`
        INSERT INTO "Notification" (id, title, message, targetRole, createdAt, createdBy)
        VALUES (${notificationId}, ${title}, ${message}, ${targetRole}, ${now}, ${locals.user.id})
      `;

			// Get target users based on role
			let targetUsers;
			if (targetRole === 'ALL') {
				targetUsers = await db.$queryRaw`SELECT id FROM "User"`;
			} else {
				targetUsers = await db.$queryRaw`SELECT id FROM "User" WHERE role = ${targetRole}`;
			}

			// Create user notifications
			if (Array.isArray(targetUsers) && targetUsers.length > 0) {
				for (const user of targetUsers) {
					const userNotificationId = crypto.randomUUID();
					await db.$executeRaw`
            INSERT INTO "UserNotification" (id, userId, notificationId, createdAt)
            VALUES (${userNotificationId}, ${user.id}, ${notificationId}, ${now})
          `;
				}

				console.log(`Created notification for ${targetUsers.length} users`);
			}

			return {
				success: true,
				message: `Notification sent to ${targetUsers ? targetUsers.length : 0} users`
			};
		} catch (err) {
			console.error('Error creating notification:', err);
			return { error: 'Failed to create notification' };
		}
	}
};
