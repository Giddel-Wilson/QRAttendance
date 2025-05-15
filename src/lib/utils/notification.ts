import { prisma } from '../server/prisma';

export type NotificationTarget = 'ALL' | 'STUDENT' | 'LECTURER' | 'ADMIN';

export async function createNotification(
	title: string,
	message: string,
	targetRole: NotificationTarget = 'ALL',
	createdBy?: string
) {
	try {
		const notification = await prisma.notification.create({
			data: {
				title,
				message,
				targetRole,
				createdBy
			}
		});

		// Create user notifications for all targeted users
		const userQuery = targetRole === 'ALL' 
			? {} 
			: { role: targetRole };
			
		const users = await prisma.user.findMany({
			where: userQuery,
			select: { id: true }
		});

		if (users.length > 0) {
			await prisma.userNotification.createMany({
				data: users.map(user => ({
					userId: user.id,
					notificationId: notification.id
				}))
			});
		}

		return notification;
	} catch (error) {
		console.error('Failed to create notification:', error);
		throw error;
	}
}

export async function getUserNotifications(userId: string, includeRead = false) {
	try {
		return await prisma.userNotification.findMany({
			where: {
				userId,
				...(includeRead ? {} : { read: false })
			},
			include: {
				notification: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
	} catch (error) {
		console.error('Failed to get user notifications:', error);
		return [];
	}
}

export async function markNotificationAsRead(id: string) {
	try {
		return await prisma.userNotification.update({
			where: { id },
			data: {
				read: true,
				readAt: new Date()
			}
		});
	} catch (error) {
		console.error('Failed to mark notification as read:', error);
		throw error;
	}
}
