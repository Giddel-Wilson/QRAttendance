import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	try {
		// Use raw SQL queries instead of Prisma models

		// Get attendance records
		const attendanceRecords = await db.$queryRaw`
      SELECT 
        a.id, a.status, a.timestamp, a.notes,
        s.id as sessionId, s.date as sessionDate, s.title as sessionTitle,
        c.id as courseId, c.code as courseCode, c.name as courseName
      FROM Attendance a
      JOIN Session s ON a.sessionId = s.id
      JOIN Course c ON s.courseId = c.id
      WHERE a.userId = ${locals.user.id} 
      ORDER BY a.timestamp DESC
      LIMIT 20
    `;

		// Calculate attendance stats
		const totalClasses = await db.$queryRaw`
      SELECT COUNT(*) as count
      FROM Session s
      JOIN Course c ON s.courseId = c.id
      JOIN StudentCourse sc ON c.id = sc.courseId
      WHERE sc.studentId = ${locals.user.id}
    `.then((result) => (Array.isArray(result) && result.length > 0 ? Number(result[0].count) : 0));

		const presentCount = await db.$queryRaw`
      SELECT COUNT(*) as count
      FROM Attendance a
      WHERE a.userId = ${locals.user.id} AND a.status = 'PRESENT'
    `.then((result) => (Array.isArray(result) && result.length > 0 ? Number(result[0].count) : 0));

		const absentCount = totalClasses - presentCount;
		const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

		return {
			userProfile: locals.user,
			attendanceRecords: Array.isArray(attendanceRecords)
				? attendanceRecords.map((rec) => ({
						id: rec.id,
						status: rec.status,
						timestamp: rec.timestamp,
						notes: rec.notes,
						session: {
							id: rec.sessionId,
							date: rec.sessionDate,
							title: rec.sessionTitle
						},
						course: {
							id: rec.courseId,
							code: rec.courseCode,
							name: rec.courseName
						}
					}))
				: [],
			attendanceStats: {
				totalClasses,
				presentCount,
				absentCount,
				attendanceRate
			}
		};
	} catch (err) {
		console.error('Error loading student attendance:', err);
		return {
			userProfile: locals.user,
			attendanceRecords: [],
			attendanceStats: {
				totalClasses: 0,
				presentCount: 0,
				absentCount: 0,
				attendanceRate: 0
			}
		};
	}
};
