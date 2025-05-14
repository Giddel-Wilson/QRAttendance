import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import crypto from 'crypto';
import { generateSignature } from '$lib/utils/qrCode'; // Import shared function

export const load: PageServerLoad = async ({ locals, depends, url }) => {
	if (!locals.user || locals.user.role !== 'LECTURER') {
		redirect(302, '/auth/login');
	}

	depends('app:qrSessions');

	try {
		// Get the selected course ID from the URL
		const selectedCourseId = url.searchParams.get('courseId') || '';

		// Fetch courses taught by this lecturer
		const userCourses = await db.$queryRaw`
			SELECT 
				c.id, c.code, c.name,
				(SELECT COUNT(*) FROM StudentCourse sc WHERE sc.courseId = c.id) as enrollmentCount
			FROM Course c
			JOIN CourseLecturer cl ON c.id = cl.courseId
			WHERE cl.lecturerId = ${locals.user.id}
			ORDER BY c.code
		`;

		const courses = Array.isArray(userCourses)
			? userCourses.map((course) => ({
					id: course.id,
					code: course.code,
					name: course.name,
					_count: {
						enrollments: Number(course.enrollmentCount) || 0
					}
				}))
			: [];

		console.log(`Found ${courses.length} courses for lecturer`);

		// Fetch enrolled students if a course is selected
		let enrolledStudents = [];
		if (selectedCourseId) {
			try {
				const students = await db.$queryRaw`
					SELECT 
						u.id, 
						u.name, 
						u.email, 
						u.matricNumber, 
						u.department, 
						u.level
					FROM "User" u
					JOIN StudentCourse sc ON u.id = sc.studentId
					WHERE sc.courseId = ${selectedCourseId}
					ORDER BY u.name ASC
				`;

				enrolledStudents = Array.isArray(students) ? students : [];
				console.log(
					`Found ${enrolledStudents.length} students enrolled in course ${selectedCourseId}`
				);
			} catch (err) {
				console.error('Error fetching enrolled students:', err);
			}
		}

		// Check for active QR sessions
		console.log('Checking for active sessions...');
		let activeSession = null;

		try {
			// First check if QrSession table exists
			const tableCheck = await db.$queryRaw`
				SELECT name FROM sqlite_master WHERE type='table' AND name='QrSession'
			`;

			if (Array.isArray(tableCheck) && tableCheck.length > 0) {
				// Use raw SQL query instead of Prisma model
				const now = new Date();

				const activeSessions = await db.$queryRaw`
					SELECT 
						qs.*, 
						c.code as courseCode, 
						c.name as courseName
					FROM QrSession qs
					JOIN Course c ON qs.courseId = c.id
					WHERE qs.lecturerId = ${locals.user.id}
						AND qs.expiresAt > ${now.toISOString()}
				`;

				if (Array.isArray(activeSessions) && activeSessions.length > 0) {
					activeSession = {
						...activeSessions[0],
						course: {
							id: activeSessions[0].courseId,
							code: activeSessions[0].courseCode,
							name: activeSessions[0].courseName
						}
					};
				} else {
					console.log('No active sessions found');
				}
			} else {
				// QrSession table doesn't exist yet
				console.log("QrSession table doesn't exist yet");
			}
		} catch (err) {
			console.error('Error checking for active session:', err);
		}

		return {
			courses,
			selectedCourseId,
			enrolledStudents,
			activeSession,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading attendance page:', err);
		return {
			courses: [],
			selectedCourseId: '',
			enrolledStudents: [],
			activeSession: null,
			userProfile: locals.user
		};
	}
};

export const actions: Actions = {
	generateCode: async ({ request, locals }) => {
		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const courseId = formData.get('courseId') as string;
		const location = formData.get('location') as string;
		const duration = parseInt(formData.get('duration') as string);

		if (!courseId || !location || isNaN(duration)) {
			return { error: 'Invalid form data' };
		}

		try {
			console.log(
				`Generating QR code for course ${courseId} at ${location} for ${duration} minutes`
			);

			// Verify course belongs to lecturer using CourseLecturer table
			const isLecturersCourse = await db.$queryRaw`
				SELECT 1 FROM CourseLecturer 
				WHERE courseId = ${courseId} AND lecturerId = ${locals.user.id}
				LIMIT 1
			`;

			if (!Array.isArray(isLecturersCourse) || isLecturersCourse.length === 0) {
				return { error: 'Course not found or not assigned to you' };
			}

			// Create a session entry
			const sessionId = crypto.randomUUID();
			const now = new Date().toISOString();

			// Check if Session table has createdById column
			const hasCreatedByField = await db.$queryRaw`
        SELECT count(*) as count FROM pragma_table_info('Session') 
        WHERE name = 'createdById'
      `
				.then((res) => Array.isArray(res) && res.length > 0 && Number(res[0].count) > 0)
				.catch(() => false);

			// Insert session with appropriate fields based on schema
			if (hasCreatedByField) {
				await db.$executeRaw`
					INSERT INTO "Session" (
						id, courseId, date, title, topic, notes, createdById, createdAt, updatedAt
					)
					VALUES (
						${sessionId}, 
						${courseId}, 
						${now}, 
						${'Attendance Session ' + new Date().toLocaleDateString()}, 
						${location + ' - ' + new Date().toLocaleTimeString()},
						${'QR code attendance session for ' + duration + ' minutes'},
						${locals.user.id},
						${now},
						${now}
					)
				`;
			} else {
				// Fallback without createdById
				await db.$executeRaw`
					INSERT INTO "Session" (
						id, courseId, date, title, topic, notes, createdAt, updatedAt
					)
					VALUES (
						${sessionId}, 
						${courseId}, 
						${now}, 
						${'Attendance Session ' + new Date().toLocaleDateString()}, 
						${location + ' - ' + new Date().toLocaleTimeString()},
						${'QR code attendance session for ' + duration + ' minutes'},
						${now},
						${now}
					)
				`;
			}

			// Generate QR code data using the shared function
			const timestamp = Date.now().toString();
			const dataToSign = `${courseId}:${sessionId}:${timestamp}`;
			const signature = generateSignature(dataToSign); // Use shared function
			const qrData = `${courseId}:${sessionId}:${timestamp}:${signature}`;

			console.log('Generated QR signature:', {
				data: dataToSign,
				signature
			});

			// Calculate expiry date
			const expiryDate = new Date(Date.now() + duration * 60000).toISOString();

			// Generate QR session ID
			const qrSessionId = crypto.randomUUID();

			// Insert into QrSession table
			await db.$executeRaw`
				INSERT INTO "QrSession" (id, courseId, lecturerId, qrData, duration, expiresAt, createdAt)
				VALUES (
					${qrSessionId},
					${courseId},
					${locals.user.id},
					${qrData},
					${duration},
					${expiryDate},
					${now}
				)
			`;

			// Log activity
			try {
				await db.$executeRaw`
					INSERT INTO ActivityLog (id, userId, action, entityType, entityId, details, timestamp)
					VALUES (
						lower(hex(randomblob(16))),
						${locals.user.id},
						'QR_GENERATED',
						'Course',
						${courseId},
						${'Generated attendance QR code for ' + duration + ' minutes'},
						${now}
					)
				`;
			} catch (logErr) {
				console.error('Failed to log activity:', logErr);
			}

			console.log('QR code generated successfully with session ID:', sessionId);

			return {
				success: true,
				qrData,
				expiresAt: expiryDate,
				sessionId: qrSessionId,
				courseId: courseId,
				courseSessionId: sessionId
			};
		} catch (err) {
			console.error('Error generating QR:', err);
			return { error: `Failed to generate QR code: ${err.message}` };
		}
	},

	endSession: async ({ request, locals }) => {
		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;

		console.log(`Attempting to end session: ${sessionId}`);

		if (!sessionId) {
			return { error: 'Session ID is required' };
		}

		try {
			// Check if QrSession table exists
			const tableCheck = await db.$queryRaw`
				SELECT name FROM sqlite_master 
				WHERE type='table' AND name='QrSession'
			`;

			if (!Array.isArray(tableCheck) || tableCheck.length === 0) {
				return { error: 'QR session table does not exist' };
			}

			// Get QR session details to find the associated course and session
			const qrSession = await db.$queryRaw`
				SELECT * FROM QrSession 
				WHERE id = ${sessionId} AND lecturerId = ${locals.user.id}
			`;

			if (!Array.isArray(qrSession) || qrSession.length === 0) {
				return { error: 'Session not found' };
			}

			const courseId = qrSession[0].courseId;

			// First look for the course session ID in the database
			let courseSessionId = null;

			// Try all possible field names
			if (qrSession[0].sessionId) {
				courseSessionId = qrSession[0].sessionId;
				console.log('Found sessionId:', courseSessionId);
			} else if (qrSession[0].courseSessionId) {
				courseSessionId = qrSession[0].courseSessionId;
				console.log('Found courseSessionId:', courseSessionId);
			}

			// If not found in fields, try to extract from QR data
			if (!courseSessionId && qrSession[0].qrData) {
				try {
					console.log('Attempting to extract session ID from QR data:', qrSession[0].qrData);
					const qrParts = qrSession[0].qrData.split(':');
					if (qrParts.length >= 2) {
						courseSessionId = qrParts[1]; // Format is courseId:sessionId:timestamp:signature
						console.log('Extracted sessionId from QR data:', courseSessionId);
					}
				} catch (e) {
					console.error('Error extracting session ID from QR data:', e);
				}
			}

			if (!courseSessionId) {
				console.error('No course session ID found in QR session');
				return { error: 'Could not determine the class session ID' };
			}

			console.log(`Processing attendance for course session: ${courseSessionId}`);

			// 1. Get all students enrolled in this course
			const enrolledStudents = await db.$queryRaw`
				SELECT u.id 
				FROM "User" u
				JOIN StudentCourse sc ON u.id = sc.studentId
				WHERE sc.courseId = ${courseId}
			`;

			if (!Array.isArray(enrolledStudents) || enrolledStudents.length === 0) {
				console.log('No enrolled students found for this course');
			} else {
				console.log(`Found ${enrolledStudents.length} enrolled students`);

				// Get the IDs of students who already have attendance records for this session
				const attendedRecords = await db.$queryRaw`
					SELECT userId, status
					FROM Attendance
					WHERE sessionId = ${courseSessionId}
				`;

				// Create a map of student IDs to their current status
				const studentAttendanceMap = {};
				if (Array.isArray(attendedRecords)) {
					attendedRecords.forEach((record) => {
						studentAttendanceMap[record.userId] = record.status;
					});
				}

				console.log(
					`${Object.keys(studentAttendanceMap).length} students already have attendance records`
				);
				console.log('Students with attendance records:', Object.keys(studentAttendanceMap));

				// Mark students without any attendance record as absent
				const now = new Date().toISOString();
				let absentCount = 0;

				for (const student of enrolledStudents) {
					if (!studentAttendanceMap[student.id]) {
						// No record exists - create ABSENT record
						const attendanceId = crypto.randomUUID();
						await db.$executeRaw`
							INSERT INTO Attendance (id, userId, sessionId, status, timestamp)
							VALUES (
								${attendanceId},
								${student.id},
								${courseSessionId},
								${'ABSENT'},
								${now}
							)
						`;
						absentCount++;
						console.log(`Marked student ${student.id} as ABSENT`);
					}
				}

				console.log(`Marked ${absentCount} students as absent`);
			}

			// End the QR session
			const now = new Date().toISOString();
			const result = await db.$executeRaw`
				UPDATE "QrSession" 
				SET expiresAt = ${now}
				WHERE id = ${sessionId} AND lecturerId = ${locals.user.id}
			`;

			console.log(`Session ${sessionId} ended successfully. Rows affected: ${result}`);

			// Return the session IDs for redirection
			return {
				success: true,
				message: "Session ended successfully. Students who didn't scan were marked absent.",
				sessionId: sessionId,
				data: { sessionId: courseSessionId }
			};
		} catch (err) {
			console.error('Error ending session:', err);
			return {
				error: `Failed to end session: ${err.message}`
			};
		}
	},

	markAttendance: async ({ request, locals }) => {
		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;
		const studentId = formData.get('studentId') as string;
		const status = formData.get('status') as string;

		if (!sessionId || !studentId || !status) {
			return { error: 'Missing required fields' };
		}

		try {
			console.log(
				`Marking attendance for student ${studentId} in session ${sessionId} as ${status}`
			);

			// Check if attendance record exists
			const existingRecord = await db.$queryRaw`
				SELECT id FROM Attendance 
				WHERE userId = ${studentId} AND sessionId = ${sessionId}
			`;

			const now = new Date().toISOString();
			const attendanceId = crypto.randomUUID();

			if (Array.isArray(existingRecord) && existingRecord.length > 0) {
				// Update existing record
				await db.$executeRaw`
					UPDATE Attendance 
					SET status = ${status}
					WHERE userId = ${studentId} AND sessionId = ${sessionId}
				`;
				console.log('Updated existing attendance record');
			} else {
				// Create new record
				await db.$executeRaw`
					INSERT INTO Attendance (id, userId, sessionId, status, timestamp)
					VALUES (
						${attendanceId},
						${studentId}, 
						${sessionId}, 
						${status}, 
						${now}
					)
				`;
				console.log('Created new attendance record');
			}

			return {
				success: true,
				message: `Attendance marked as ${status}`
			};
		} catch (err) {
			console.error('Error marking attendance:', err);
			return {
				error: `Failed to mark attendance: ${err.message}`
			};
		}
	}
};
