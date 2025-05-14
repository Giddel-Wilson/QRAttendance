import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	try {
		console.log('Loading student dashboard data for:', locals.user.id);

		// Get real course enrollment data
		let enrolledCourses = [];
		try {
			const courses = await db.$queryRaw`
        SELECT 
          c.id, c.code, c.name, c.semester
        FROM Course c
        JOIN StudentCourse sc ON c.id = sc.courseId
        WHERE sc.studentId = ${locals.user.id}
        ORDER BY c.code ASC
      `;

			// For each course, calculate attendance rate
			if (Array.isArray(courses) && courses.length > 0) {
				for (const course of courses) {
					// Get total sessions for this course
					const totalSessions = await db.$queryRaw`
            SELECT COUNT(*) as count
            FROM Session
            WHERE courseId = ${course.id}
          `
						.then((result) =>
							Array.isArray(result) && result.length > 0 ? Number(result[0].count) : 0
						)
						.catch(() => 0);

					// Get attendance for this course
					const attendedSessions = await db.$queryRaw`
            SELECT COUNT(*) as count
            FROM Attendance a
            JOIN Session s ON a.sessionId = s.id
            WHERE s.courseId = ${course.id} AND a.userId = ${locals.user.id} AND a.status = 'PRESENT'
          `
						.then((result) =>
							Array.isArray(result) && result.length > 0 ? Number(result[0].count) : 0
						)
						.catch(() => 0);

					// Calculate attendance rate
					const attendanceRate =
						totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

					enrolledCourses.push({
						...course,
						totalClasses: totalSessions,
						attendance: attendedSessions,
						attendanceRate
					});
				}
			}
		} catch (err) {
			console.error('Error fetching enrolled courses:', err);
		}

		// Get recent attendance
		let recentAttendance = [];
		try {
			// Check if Attendance table exists
			const tableCheck = await db.$queryRaw`
        SELECT name FROM sqlite_master WHERE type='table' AND name='Attendance'
      `;

			if (Array.isArray(tableCheck) && tableCheck.length > 0) {
				const records = await db.$queryRaw`
          SELECT 
            a.id, a.status, a.timestamp,
            s.id as sessionId, s.date as sessionDate, s.title as sessionTitle,
            c.id as courseId, c.code as courseCode, c.name as courseName
          FROM Attendance a
          JOIN Session s ON a.sessionId = s.id
          JOIN Course c ON s.courseId = c.id
          WHERE a.userId = ${locals.user.id}
          ORDER BY a.timestamp DESC
          LIMIT 5
        `;

				if (Array.isArray(records)) {
					recentAttendance = records.map((record) => {
						const recordDate = new Date(record.timestamp || record.sessionDate);
						return {
							date: recordDate.toISOString(),
							time: recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
							course: record.courseCode,
							title: record.sessionTitle || 'Class Session',
							status: record.status || 'Present'
						};
					});
				}
			}
		} catch (err) {
			console.error('Error fetching recent attendance:', err);
		}

		// Calculate dashboard stats
		let totalCourses = enrolledCourses.length;
		let totalAttendance = 0;
		let totalSessions = 0;
		let attendanceRate = 0;

		// Sum up attendance from all courses
		enrolledCourses.forEach((course) => {
			totalAttendance += course.attendance;
			totalSessions += course.totalClasses;
		});

		attendanceRate = totalSessions > 0 ? Math.round((totalAttendance / totalSessions) * 100) : 0;

		// Get upcoming classes data (placeholder for now)
		const upcomingClasses = [];

		// Return all data for the UI
		return {
			userProfile: locals.user,
			stats: {
				totalCourses,
				totalAttendance,
				attendanceRate,
				upcomingClasses: 0
			},
			enrolledCourses,
			upcomingClasses,
			recentAttendance
		};
	} catch (err) {
		console.error('Error loading student dashboard data:', err);
		// Return default data on error
		return {
			userProfile: locals.user,
			stats: {
				totalCourses: 0,
				totalAttendance: 0,
				attendanceRate: 0,
				upcomingClasses: 0
			},
			enrolledCourses: [],
			upcomingClasses: [],
			recentAttendance: []
		};
	}
};
