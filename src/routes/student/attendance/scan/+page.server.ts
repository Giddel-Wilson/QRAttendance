import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateSignature } from '$lib/utils/qrCode'; // Import shared function

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	// Make sure the user is a student
	if (locals.user.role !== 'STUDENT') {
		redirect(302, '/');
	}

	return {
		userProfile: locals.user
	};
};

export const actions: Actions = {
	submitAttendance: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, message: 'Not authenticated' };
		}

		const data = await request.formData();
		const qrData = data.get('qrData') as string;

		console.log('Processing QR data:', qrData);

		if (!qrData) {
			return { success: false, message: 'Invalid QR code data' };
		}

		try {
			// QR data format: courseId:sessionId:timestamp:signature
			const parts = qrData.split(':');

			if (parts.length !== 4) {
				return { success: false, message: 'Invalid QR code format' };
			}

			const [courseId, sessionId, timestamp, signature] = parts;

			// Verify QR code signature using the shared function
			const dataToVerify = `${courseId}:${sessionId}:${timestamp}`;
			const expectedSignature = generateSignature(dataToVerify); // Use shared function

			console.log('Verifying QR signature:', {
				received: signature,
				expected: expectedSignature,
				data: dataToVerify
			});

			if (signature !== expectedSignature) {
				return { success: false, message: 'Invalid QR code signature' };
			}

			// Check if QR code has expired (typically 15 minutes)
			const qrTimestamp = parseInt(timestamp);
			const currentTime = Date.now();
			const fifteenMinutes = 15 * 60 * 1000;

			if (currentTime - qrTimestamp > fifteenMinutes) {
				return { success: false, message: 'QR code has expired' };
			}

			// Get course details
			const courseDetails = await db.$queryRaw`
        SELECT id, code, name FROM Course WHERE id = ${courseId}
      `;

			if (!Array.isArray(courseDetails) || courseDetails.length === 0) {
				return { success: false, message: 'Course not found' };
			}

			const course = courseDetails[0];

			// Get session details
			const sessionDetails = await db.$queryRaw`
        SELECT id, date FROM Session WHERE id = ${sessionId}
      `;

			if (!Array.isArray(sessionDetails) || sessionDetails.length === 0) {
				return { success: false, message: 'Session not found' };
			}

			const session = sessionDetails[0];

			// Check if student is enrolled in this course
			const enrollment = await db.$queryRaw`
        SELECT id FROM StudentCourse 
        WHERE studentId = ${locals.user.id} AND courseId = ${courseId}
      `;

			// If not enrolled, try to auto-enroll based on level
			if (!Array.isArray(enrollment) || enrollment.length === 0) {
				const userLevel = locals.user.level?.charAt(0);
				const courseLevel = course.code.match(/\d/)?.[0];

				if (userLevel && courseLevel && userLevel === courseLevel) {
					// Auto-enroll student
					await db.$executeRaw`
            INSERT INTO StudentCourse (id, studentId, courseId, enrolledAt)
            VALUES (lower(hex(randomblob(16))), ${locals.user.id}, ${courseId}, datetime('now'))
          `;
					console.log(`Auto-enrolled student ${locals.user.id} in course ${courseId}`);
				} else {
					return {
						success: false,
						message: 'You are not enrolled in this course'
					};
				}
			}

			// Check if attendance was already recorded
			const existingAttendance = await db.$queryRaw`
        SELECT id FROM Attendance 
        WHERE userId = ${locals.user.id} AND sessionId = ${sessionId}
      `;

			if (Array.isArray(existingAttendance) && existingAttendance.length > 0) {
				return {
					success: true,
					message: 'Your attendance was already recorded',
					course,
					session
				};
			}

			// Create tables if they don't exist
			await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Attendance" (
          "id" TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PRESENT',
          "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "notes" TEXT,
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
          FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE,
          UNIQUE("userId", "sessionId")
        )
      `;

			// Record attendance
			const now = new Date().toISOString();

			await db.$executeRaw`
        INSERT INTO Attendance (id, userId, sessionId, status, timestamp, notes)
        VALUES (
          lower(hex(randomblob(16))),
          ${locals.user.id},
          ${sessionId},
          'PRESENT',
          ${now},
          ${'Recorded via QR code'}
        )
      `;

			console.log(`Attendance recorded for student ${locals.user.id}`);

			return {
				success: true,
				message: 'Attendance recorded successfully',
				course,
				session,
				// Add redirect information
				redirect: '/student/records?scan=success'
			};
		} catch (err) {
			console.error('Error processing QR code:', err);
			return {
				success: false,
				message: `Error: ${err.message}`
			};
		}
	}
};
