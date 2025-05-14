import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	try {
		// Initialize with safe default values
		const courseId = url.searchParams.get('courseId') || '';
		const startDate = url.searchParams.get('startDate') || '';
		const endDate = url.searchParams.get('endDate') || '';

		let courses = [];
		let attendanceRecords = [];
		let attendanceStats = {
			totalSessions: 0,
			presentCount: 0,
			absentCount: 0,
			lateCount: 0,
			attendanceRate: 0
		};

		// First check if all needed tables exist
		const tablesExist = await checkTablesExist(db);

		if (tablesExist) {
			// Get enrolled courses
			const enrolledCourses = await db.$queryRaw`
        SELECT 
          c.id, c.code, c.name,
          (
            SELECT COUNT(*) 
            FROM Session s
            WHERE s.courseId = c.id
          ) as sessionCount
        FROM Course c
        JOIN StudentCourse sc ON c.id = sc.courseId
        WHERE sc.studentId = ${locals.user.id}
        ORDER BY c.code ASC
      `;

			courses =
				Array.isArray(enrolledCourses) &&
				enrolledCourses.map((c) => ({
					id: c.id,
					code: c.code,
					name: c.name,
					sessionCount: Number(c.sessionCount) || 0
				}));

			// Build attendance record query
			let whereConditions = [`a.userId = '${locals.user.id}'`];

			if (courseId) {
				whereConditions.push(`s.courseId = '${courseId}'`);
			}

			if (startDate) {
				whereConditions.push(`DATE(a.timestamp) >= DATE('${startDate}')`);
			}

			if (endDate) {
				whereConditions.push(`DATE(a.timestamp) <= DATE('${endDate}')`);
			}

			const whereClause = whereConditions.join(' AND ');

			// Since createdById column already exists, we can use it directly
			const query = `
        SELECT DISTINCT
          a.id, a.status, a.timestamp, a.notes,
          s.id as sessionId, s.date as sessionDate, s.title as sessionTitle, s.topic as sessionTopic,
          c.id as courseId, c.code as courseCode, c.name as courseName,
          (
            SELECT u.name 
            FROM CourseLecturer cl
            JOIN "User" u ON cl.lecturerId = u.id
            WHERE cl.courseId = c.id
            ORDER BY 
              CASE WHEN cl.lecturerId = s.createdById THEN 0 ELSE 1 END, 
              u.name
            LIMIT 1
          ) as lecturerName
        FROM Attendance a
        JOIN Session s ON a.sessionId = s.id
        JOIN Course c ON s.courseId = c.id
        WHERE ${whereClause}
        ORDER BY a.timestamp DESC
      `;

			try {
				// Execute query and process results
				const records = await db.$queryRawUnsafe(query);

				attendanceRecords = Array.isArray(records)
					? records.map((r) => ({
							id: r.id,
							status: r.status,
							timestamp: r.timestamp,
							notes: r.notes || '',
							session: {
								id: r.sessionId,
								date: r.sessionDate,
								title: r.sessionTitle || 'Class Session',
								topic: r.sessionTopic || ''
							},
							course: {
								id: r.courseId,
								code: r.courseCode,
								name: r.courseName
							},
							lecturer: r.lecturerName || 'Unknown'
						}))
					: [];
			} catch (err) {
				console.error('Error in records query:', err);

				// Fallback query without the createdById reference in case of issues
				const fallbackQuery = `
          SELECT DISTINCT
            a.id, a.status, a.timestamp, a.notes,
            s.id as sessionId, s.date as sessionDate, s.title as sessionTitle, s.topic as sessionTopic,
            c.id as courseId, c.code as courseCode, c.name as courseName,
            (
              SELECT u.name 
              FROM CourseLecturer cl
              JOIN "User" u ON cl.lecturerId = u.id
              WHERE cl.courseId = c.id
              ORDER BY u.name
              LIMIT 1
            ) as lecturerName
          FROM Attendance a
          JOIN Session s ON a.sessionId = s.id
          JOIN Course c ON s.courseId = c.id
          WHERE ${whereClause}
          ORDER BY a.timestamp DESC
        `;

				const fallbackRecords = await db.$queryRawUnsafe(fallbackQuery);

				attendanceRecords = Array.isArray(fallbackRecords)
					? fallbackRecords.map((r) => ({
							id: r.id,
							status: r.status,
							timestamp: r.timestamp,
							notes: r.notes || '',
							session: {
								id: r.sessionId,
								date: r.sessionDate,
								title: r.sessionTitle || 'Class Session',
								topic: r.sessionTopic || ''
							},
							course: {
								id: r.courseId,
								code: r.courseCode,
								name: r.courseName
							},
							lecturer: r.lecturerName || 'Unknown'
						}))
					: [];
			}

			// Calculate attendance statistics
			attendanceStats = await calculateAttendanceStats(locals.user.id, courseId, db);
		}

		return {
			courses,
			attendanceRecords,
			attendanceStats,
			filters: {
				courseId,
				startDate,
				endDate
			},
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading student records:', err);
		return {
			courses: [],
			attendanceRecords: [],
			attendanceStats: {
				totalSessions: 0,
				presentCount: 0,
				absentCount: 0,
				lateCount: 0,
				attendanceRate: 0
			},
			filters: {
				courseId: '',
				startDate: '',
				endDate: ''
			},
			userProfile: locals.user
		};
	}
};

// Helper function to check if all required tables exist
async function checkTablesExist(db) {
	try {
		const tables = ['Attendance', 'Session', 'Course', 'StudentCourse', 'CourseLecturer'];

		for (const table of tables) {
			const result = await db.$queryRaw`
        SELECT name FROM sqlite_master WHERE type='table' AND name=${table}
      `;

			if (!Array.isArray(result) || result.length === 0) {
				console.log(`Table ${table} doesn't exist`);
				return false;
			}
		}

		return true;
	} catch (err) {
		console.error('Error checking tables:', err);
		return false;
	}
}

// Calculate accurate attendance statistics
async function calculateAttendanceStats(userId, courseId, db) {
	try {
		let courseFilter = '';
		if (courseId) {
			courseFilter = ` AND s.courseId = '${courseId}'`;
		}

		// Total sessions for the student
		const sessionsQuery = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM Session s
      JOIN Course c ON s.courseId = c.id
      JOIN StudentCourse sc ON c.id = sc.courseId
      WHERE sc.studentId = '${userId}'${courseFilter}
    `;

		// Present attendances
		const presentQuery = `
      SELECT COUNT(*) as count
      FROM Attendance a
      JOIN Session s ON a.sessionId = s.id
      WHERE a.userId = '${userId}' AND a.status = 'PRESENT'${courseFilter}
    `;

		// Late attendances
		const lateQuery = `
      SELECT COUNT(*) as count
      FROM Attendance a
      JOIN Session s ON a.sessionId = s.id
      WHERE a.userId = '${userId}' AND a.status = 'LATE'${courseFilter}
    `;

		// Get all count results
		const [totalSessions, presentAttendances, lateAttendances] = await Promise.all([
			db
				.$queryRawUnsafe(sessionsQuery)
				.then((r) => (Array.isArray(r) && r.length > 0 ? Number(r[0].count) : 0)),
			db
				.$queryRawUnsafe(presentQuery)
				.then((r) => (Array.isArray(r) && r.length > 0 ? Number(r[0].count) : 0)),
			db
				.$queryRawUnsafe(lateQuery)
				.then((r) => (Array.isArray(r) && r.length > 0 ? Number(r[0].count) : 0))
		]);

		// Calculate derived statistics
		const absentCount = Math.max(0, totalSessions - presentAttendances - lateAttendances);
		const attendanceRate =
			totalSessions > 0
				? Math.round(((presentAttendances + lateAttendances) / totalSessions) * 100)
				: 0;

		return {
			totalSessions,
			presentCount: presentAttendances,
			lateCount: lateAttendances,
			absentCount,
			attendanceRate
		};
	} catch (err) {
		console.error('Error calculating attendance stats:', err);
		return {
			totalSessions: 0,
			presentCount: 0,
			lateCount: 0,
			absentCount: 0,
			attendanceRate: 0
		};
	}
}
