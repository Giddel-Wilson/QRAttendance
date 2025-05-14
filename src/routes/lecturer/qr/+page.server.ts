import { db } from '$lib/server/db';
import { validateUserRole } from '$lib/utils/auth';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !validateUserRole(locals.user.role, ['LECTURER'])) {
		redirect(302, '/auth/login');
	}

	try {
		// Get lecturer's courses
		const courses = await db.course.findMany({
			where: { lecturerId: locals.user.id },
			select: {
				id: true,
				code: true,
				name: true
			},
			orderBy: { name: 'asc' }
		});

		// Get recent QR sessions
		const recentSessions = await db.qrSession.findMany({
			where: { lecturerId: locals.user.id },
			include: {
				course: true,
				schedule: true
			},
			orderBy: { createdAt: 'desc' },
			take: 10
		});

		return {
			courses,
			recentSessions
		};
	} catch (err) {
		console.error('Error loading QR data:', err);
		error(500, 'Failed to load course data');
	}
};

export const actions: Actions = {
	generateQR: async ({ request, locals }) => {
		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const courseId = formData.get('courseId') as string;
		const duration = parseInt(formData.get('duration') as string);
		const location = formData.get('location') as string;

		// Validate input
		if (!courseId) {
			return { error: 'Please select a course' };
		}

		try {
			// First check if the lecturer is assigned to this course
			const course = await db.course.findFirst({
				where: {
					id: courseId,
					lecturerId: locals.user.id
				}
			});

			if (!course) {
				return { error: 'You are not assigned to this course' };
			}

			// Create a schedule entry
			const schedule = await db.schedule.create({
				data: {
					courseId,
					date: new Date(),
					startTime: new Date().toISOString().split('T')[1].substring(0, 5),
					endTime: new Date(Date.now() + duration * 60000)
						.toISOString()
						.split('T')[1]
						.substring(0, 5),
					location
				}
			});

			// Generate a signature for the QR code
			const timestamp = Date.now().toString();
			const dataToSign = `${courseId}:${schedule.id}:${timestamp}`;
			const signature = generateSignature(dataToSign);

			// Create QR session
			const qrSession = await db.qrSession.create({
				data: {
					courseId,
					scheduleId: schedule.id,
					lecturerId: locals.user.id,
					duration,
					expiresAt: new Date(Date.now() + duration * 60000),
					qrData: `${courseId}:${schedule.id}:${timestamp}:${signature}`
				}
			});

			// Log activity
			await db.activityLog.create({
				data: {
					userId: locals.user.id,
					action: 'QR_GENERATED',
					details: `QR code generated for ${course.code}`,
					entityId: schedule.id,
					entityType: 'SCHEDULE',
					timestamp: new Date()
				}
			});

			return {
				success: true,
				qrSession: {
					...qrSession,
					course: {
						code: course.code,
						name: course.name
					}
				}
			};
		} catch (err) {
			console.error('Error generating QR code:', err);
			return { error: 'Failed to generate QR code' };
		}
	},

	invalidateQR: async ({ request, locals }) => {
		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;

		try {
			// Update the QR session to be expired
			await db.qrSession.update({
				where: {
					id: sessionId,
					lecturerId: locals.user.id
				},
				data: {
					expiresAt: new Date()
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Error invalidating QR session:', err);
			return { error: 'Failed to invalidate QR session' };
		}
	}
};

// Helper function to generate a signature for QR data
function generateSignature(data: string): string {
	// In a real implementation, this would use a proper secret key and HMAC
	const hash = crypto.createHash('sha256');
	hash.update(data + 'your-secret-key');
	return hash.digest('hex').substring(0, 16);
}
