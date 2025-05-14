import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load = async ({ locals, url }) => {
	// Ensure the user is an admin
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw redirect(302, '/auth/login');
	}

	// Get date range filter parameters
	const startDateParam = url.searchParams.get('startDate');
	const endDateParam = url.searchParams.get('endDate');

	// Default to last 30 days if no dates provided
	const endDate = endDateParam ? new Date(endDateParam) : new Date();
	const startDate = startDateParam ? new Date(startDateParam) : new Date(endDate);
	startDate.setDate(startDate.getDate() - (startDateParam ? 0 : 30)); // Default 30 days back

	// Format dates for SQL queries
	const startDateStr = startDate.toISOString().split('T')[0];
	const endDateStr = endDate.toISOString().split('T')[0];

	console.log(`Loading admin reports from ${startDateStr} to ${endDateStr}`);

	// Initialize report data structure
	const reportData = {
		userStats: {
			total: 0,
			students: 0,
			lecturers: 0,
			admins: 0
		},
		courseStats: {
			total: 0,
			avgStudentsPerCourse: 0,
			withoutLecturers: 0,
			withoutStudents: 0
		},
		attendanceStats: {
			totalSessions: 0,
			totalAttendances: 0,
			overallRate: 0,
			courseBreakdown: [],
			dateRange: {
				start: startDateStr,
				end: endDateStr
			}
		},
		recentActivity: []
	};

	try {
		// User statistics
		const userCounts = await db.$queryRaw`
      SELECT role, COUNT(*) as count
      FROM "User"
      GROUP BY role
    `;

		if (Array.isArray(userCounts)) {
			userCounts.forEach((entry) => {
				const count = Number(entry.count) || 0;
				switch (entry.role) {
					case 'STUDENT':
						reportData.userStats.students = count;
						break;
					case 'LECTURER':
						reportData.userStats.lecturers = count;
						break;
					case 'ADMIN':
						reportData.userStats.admins = count;
						break;
				}
			});
			reportData.userStats.total =
				reportData.userStats.students +
				reportData.userStats.lecturers +
				reportData.userStats.admins;
		}

		// Course statistics
		const courseCount = await db.course.count();
		reportData.courseStats.total = courseCount;

		// Courses without lecturers
		const coursesWithoutLecturers = await db.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Course" c
      WHERE NOT EXISTS (
        SELECT 1 FROM "CourseLecturer" cl
        WHERE cl."courseId" = c.id
      )
    `;
		reportData.courseStats.withoutLecturers = Number(
			coursesWithoutLecturers[0]?.count
		) || 0;

		// Courses without students
		const coursesWithoutStudents = await db.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Course" c
      WHERE NOT EXISTS (
        SELECT 1 FROM "StudentCourse" sc
        WHERE sc."courseId" = c.id
      )
    `;
		reportData.courseStats.withoutStudents = Number(
			coursesWithoutStudents[0]?.count
		) || 0;

		// Average students per course
		if (courseCount > 0) {
			const totalEnrollments = await db.$queryRaw`
        SELECT COUNT(*) as count
        FROM "StudentCourse"
      `;
			const enrollmentCount = Number(totalEnrollments[0]?.count) || 0;
			reportData.courseStats.avgStudentsPerCourse =
				Math.round((enrollmentCount / courseCount) * 10) / 10;
		}

		// Time-filtered attendance statistics
		const sessionCountQuery = await db.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Session"
      WHERE DATE(date) BETWEEN ${startDateStr} AND ${endDateStr}
    `;
		reportData.attendanceStats.totalSessions = Number(sessionCountQuery[0]?.count) || 0;

		const attendanceCountQuery = await db.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Attendance" a
      JOIN "Session" s ON a."sessionId" = s.id
      WHERE DATE(s.date) BETWEEN ${startDateStr} AND ${endDateStr}
    `;
		reportData.attendanceStats.totalAttendances = Number(attendanceCountQuery[0]?.count) || 0;

		// Course-specific attendance data with date filtering
		const attendanceQuery = await db.$queryRaw`
      SELECT 
        c.id as "courseId",
        c.code as "courseCode",
        c.name as "courseName",
        COUNT(DISTINCT s.id) as "sessionCount",
        COUNT(DISTINCT a."userId") as "attendanceCount",
        (
          SELECT COUNT(DISTINCT sc."studentId")
          FROM "StudentCourse" sc
          WHERE sc."courseId" = c.id
        ) as "enrolledCount"
      FROM "Course" c
      LEFT JOIN "Session" s ON s."courseId" = c.id AND DATE(s.date) BETWEEN ${startDateStr} AND ${endDateStr}
      LEFT JOIN "Attendance" a ON a."sessionId" = s.id
      GROUP BY c.id, c.code, c.name
      ORDER BY c.code
    `;

		let totalExpected = 0;
		let totalActual = 0;

		if (Array.isArray(attendanceQuery)) {
			reportData.attendanceStats.courseBreakdown = attendanceQuery.map((course) => {
				const sessions = Number(course.sessionCount) || 0;
				const students = Number(course.enrolledCount) || 0;
				const attended = Number(course.attendanceCount) || 0;

				const expectedAttendances = sessions * students;
				totalExpected += expectedAttendances;
				totalActual += attended;

				const rate =
					expectedAttendances > 0
						? Math.min(100, Math.round((attended / expectedAttendances) * 100))
						: 0;

				// Add additional data for charting
				return {
					courseId: course.courseId,
					courseCode: course.courseCode,
					courseName: course.courseName,
					sessionCount: sessions,
					studentCount: students,
					attendanceCount: attended,
					attendanceRate: rate,
					expectedAttendances: expectedAttendances
				};
			});
		}

		// Calculate overall attendance rate for the time period
		reportData.attendanceStats.overallRate =
			totalExpected > 0
				? Math.min(100, Math.round((totalActual / totalExpected) * 100))
				: 0;

		// Recent activity from audit logs if available
		try {
			const recentActivity = await db.$queryRaw`
        SELECT a.*, u.name as "userName", u.role as "userRole"
        FROM "AuditLog" a
        LEFT JOIN "User" u ON a."userId" = u.id
        ORDER BY a."timestamp" DESC
        LIMIT 10
      `;

			if (Array.isArray(recentActivity)) {
				reportData.recentActivity = recentActivity;
			}
		} catch (e) {
			console.log('AuditLog table may not exist:', e);
		}

		return {
			reportData,
			timeFilters: {
				startDate: startDateStr,
				endDate: endDateStr
			}
		};
	} catch (error) {
		console.error('Error generating admin reports:', error);
		return {
			reportData,
			timeFilters: {
				startDate: startDateStr,
				endDate: endDateStr
			},
			error: 'Failed to generate reports. See server logs for details.'
		};
	}
};
