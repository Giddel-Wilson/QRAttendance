import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user || locals.user.role !== 'LECTURER') {
		redirect(302, '/auth/login');
	}

	const sessionId = params.id;

	if (!sessionId) {
		error(404, 'Session not found');
	}

	try {
		// Get session details
		const sessionQuery = `
      SELECT 
        s.id, s.date, s.title, s.topic, s.courseId,
        c.id as courseId, c.code as courseCode, c.name as courseName
      FROM Session s
      JOIN Course c ON s.courseId = c.id
      WHERE s.id = ?
    `;

		const sessions = await db.$queryRawUnsafe(sessionQuery, sessionId);

		if (!Array.isArray(sessions) || sessions.length === 0) {
			error(404, 'Session not found');
		}

		const session = {
			id: sessions[0].id,
			date: sessions[0].date,
			title: sessions[0].title,
			topic: sessions[0].topic,
			level: 'Various',
			course: {
				id: sessions[0].courseId,
				code: sessions[0].courseCode,
				name: sessions[0].courseName
			}
		};

		// Verify this lecturer has access to this course
		const hasAccess = await db.$queryRaw`
      SELECT 1 FROM CourseLecturer
      WHERE courseId = ${session.course.id} AND lecturerId = ${locals.user.id}
      LIMIT 1
    `;

		if (!Array.isArray(hasAccess) || hasAccess.length === 0) {
			error(403, "You don't have access to this session");
		}

		// Get all students enrolled in this course
		const enrolledStudents = await db.$queryRaw`
      SELECT 
        u.id, u.name, u.email, u.matricNumber, u.level
      FROM "User" u
      JOIN StudentCourse sc ON u.id = sc.studentId
      WHERE sc.courseId = ${session.course.id}
      ORDER BY u.name ASC
    `;

		// Get attendance records for this session
		const attendanceQuery = `
      SELECT 
        a.id, a.status, a.timestamp, a.userId
      FROM Attendance a
      WHERE a.sessionId = ?
    `;

		const attendanceRecords = await db.$queryRawUnsafe(attendanceQuery, sessionId);

		// Create a map of user IDs to attendance records
		const attendanceMap = {};
		if (Array.isArray(attendanceRecords)) {
			attendanceRecords.forEach((record) => {
				attendanceMap[record.userId] = record;
			});
		}

		// Combine the data to include all students (present or absent)
		const attendance = [];
		let presentCount = 0;
		let absentCount = 0;

		if (Array.isArray(enrolledStudents)) {
			enrolledStudents.forEach((student) => {
				const record = attendanceMap[student.id];
				const status = record ? record.status : 'ABSENT';

				if (status === 'PRESENT') {
					presentCount++;
				} else if (status === 'ABSENT') {
					absentCount++;
				}

				attendance.push({
					id: record ? record.id : `no-record-${student.id}`,
					status: status,
					timestamp: record ? record.timestamp : null,
					student: {
						id: student.id,
						name: student.name || student.email || 'Unknown',
						email: student.email,
						matricNumber: student.matricNumber || 'N/A',
						level: student.level || 'N/A'
					}
				});
			});
		}

		// Sort with present students first, then absent
		attendance.sort((a, b) => {
			// First sort by status (PRESENT first, then others)
			if (a.status === 'PRESENT' && b.status !== 'PRESENT') return -1;
			if (a.status !== 'PRESENT' && b.status === 'PRESENT') return 1;

			// Then sort by student name
			return (a.student.name || '').localeCompare(b.student.name || '');
		});

		const totalStudents = attendance.length;

		const stats = {
			totalStudents,
			presentCount,
			absentCount,
			attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0
		};

		return {
			session,
			attendance,
			stats,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading session details:', err);
		error(500, 'Failed to load session details');
	}
};
