import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user || locals.user.role !== 'LECTURER') {
		redirect(302, '/auth/login');
	}

	const sessionId = url.searchParams.get('sessionId');

	if (!sessionId) {
		redirect(302, '/lecturer/attendance');
	}

	try {
		// Get session details
		const sessionDetails = await db.$queryRaw`
      SELECT * FROM Session WHERE id = ${sessionId}
    `;

		if (!Array.isArray(sessionDetails) || sessionDetails.length === 0) {
			redirect(302, '/lecturer/attendance');
		}

		const session = sessionDetails[0];

		// Check if lecturer is assigned to this course
		const isAssigned = await db.$queryRaw`
      SELECT 1 FROM CourseLecturer
      WHERE courseId = ${session.courseId}
      AND lecturerId = ${locals.user.id}
    `;

		if (!Array.isArray(isAssigned) || isAssigned.length === 0) {
			redirect(302, '/lecturer/attendance');
		}

		// Get course details
		const courseDetails = await db.$queryRaw`
      SELECT * FROM Course WHERE id = ${session.courseId}
    `;

		// Get attendance records
		const attendanceRecords = await db.$queryRaw`
      SELECT 
        a.id, a.status, a.timestamp,
        u.id as studentId, u.name as studentName, u.email as studentEmail,
        u.matricNumber, u.level
      FROM Attendance a
      JOIN "User" u ON a.userId = u.id
      WHERE a.sessionId = ${sessionId}
      ORDER BY u.name ASC
    `;

		// Get enrolled students who didn't mark attendance
		const enrolledStudents = await db.$queryRaw`
      SELECT 
        u.id, u.name, u.email, u.matricNumber, u.level
      FROM StudentCourse sc
      JOIN "User" u ON sc.studentId = u.id
      WHERE sc.courseId = ${session.courseId}
      AND u.id NOT IN (
        SELECT userId FROM Attendance WHERE sessionId = ${sessionId}
      )
    `;

		// Format attendance records
		let formattedRecords = [];

		if (Array.isArray(attendanceRecords)) {
			formattedRecords = attendanceRecords.map((record) => ({
				id: record.id,
				status: record.status,
				timestamp: record.timestamp,
				student: {
					id: record.studentId,
					name: record.studentName || record.studentEmail,
					email: record.studentEmail,
					matricNumber: record.matricNumber || 'N/A',
					level: record.level || 'N/A'
				}
			}));
		}

		// Add absent records for enrolled students who didn't mark attendance
		if (Array.isArray(enrolledStudents)) {
			enrolledStudents.forEach((student) => {
				formattedRecords.push({
					id: null,
					status: 'ABSENT',
					timestamp: session.date,
					student: {
						id: student.id,
						name: student.name || student.email,
						email: student.email,
						matricNumber: student.matricNumber || 'N/A',
						level: student.level || 'N/A'
					}
				});
			});
		}

		return {
			sessionDetails: session,
			courseDetails: Array.isArray(courseDetails) ? courseDetails[0] : null,
			attendanceRecords: formattedRecords,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading attendance review:', err);
		redirect(302, '/lecturer/attendance');
	}
};
