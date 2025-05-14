import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	try {
		console.log('Loading admin dashboard...');

		// Initialize stats with default values to prevent undefined errors
		let stats = {
			students: 0,
			lecturers: 0,
			courses: 0,
			attendanceRate: 0
		};

		// Use try-catch blocks for each independent query to handle potential errors
		try {
			// Student count
			const studentsResult =
				await db.$queryRaw`SELECT COUNT(*) as count FROM "User" WHERE role = 'STUDENT'`;
			stats.students =
				Array.isArray(studentsResult) && studentsResult.length > 0
					? Number(studentsResult[0].count)
					: 0;
		} catch (err) {
			console.error('Error counting students:', err);
		}

		try {
			// Lecturer count
			const lecturersResult =
				await db.$queryRaw`SELECT COUNT(*) as count FROM "User" WHERE role = 'LECTURER'`;
			stats.lecturers =
				Array.isArray(lecturersResult) && lecturersResult.length > 0
					? Number(lecturersResult[0].count)
					: 0;
		} catch (err) {
			console.error('Error counting lecturers:', err);
		}

		try {
			// Courses count
			const coursesResult = await db.$queryRaw`SELECT COUNT(*) as count FROM "Course"`;
			stats.courses =
				Array.isArray(coursesResult) && coursesResult.length > 0
					? Number(coursesResult[0].count)
					: 0;
		} catch (err) {
			console.error('Error counting courses:', err);
		}

		try {
			// Calculate attendance rate
			// First check if Attendance table exists to avoid errors
			const tableCheck = await db.$queryRaw`
        SELECT name FROM sqlite_master WHERE type='table' AND name='Attendance'
      `;

			if (Array.isArray(tableCheck) && tableCheck.length > 0) {
				const totalAttendances = await db.$queryRaw`SELECT COUNT(*) as count FROM "Attendance"`;
				const presentAttendances =
					await db.$queryRaw`SELECT COUNT(*) as count FROM "Attendance" WHERE status = 'PRESENT'`;

				const total =
					Array.isArray(totalAttendances) && totalAttendances.length > 0
						? Number(totalAttendances[0].count)
						: 0;
				const present =
					Array.isArray(presentAttendances) && presentAttendances.length > 0
						? Number(presentAttendances[0].count)
						: 0;

				stats.attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
			}
		} catch (err) {
			console.error('Error calculating attendance rate:', err);
		}

		// Get recent activities
		let recentActivities = [];
		try {
			// Check if ActivityLog table exists
			const tableCheck = await db.$queryRaw`
        SELECT name FROM sqlite_master WHERE type='table' AND name='ActivityLog'
      `;

			if (Array.isArray(tableCheck) && tableCheck.length > 0) {
				const rawActivities = await db.$queryRaw`
          SELECT 
            a.id, a.action, a.entityType, a.entityId, a.details, a.timestamp,
            u.id as userId, u.name as userName, u.email as userEmail
          FROM "ActivityLog" a
          LEFT JOIN "User" u ON a.userId = u.id
          ORDER BY a.timestamp DESC
          LIMIT 10
        `;

				if (Array.isArray(rawActivities)) {
					recentActivities = rawActivities.map((act) => ({
						id: act.id,
						action: act.action,
						entityType: act.entityType,
						entityId: act.entityId,
						details: act.details,
						timestamp: act.timestamp,
						user: {
							id: act.userId,
							name: act.userName || act.userEmail || 'Unknown User'
						}
					}));
				}
			} else {
				console.log("ActivityLog table doesn't exist yet");
			}
		} catch (err) {
			console.error('Error fetching recent activities:', err);
		}

		return {
			stats,
			recentActivities,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading admin dashboard:', err);

		// Return default values to avoid 500 errors
		return {
			stats: {
				students: 0,
				lecturers: 0,
				courses: 0,
				attendanceRate: 0
			},
			recentActivities: [],
			userProfile: locals.user
		};
	}
};
