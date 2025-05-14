import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user || locals.user.role !== 'LECTURER') {
		redirect(302, '/auth/login');
	}

	try {
		// Get query parameters
		const courseId = url.searchParams.get('courseId') || '';
		const startDate = url.searchParams.get('startDate') || '';
		const endDate = url.searchParams.get('endDate') || '';

		console.log('Loading lecturer session records with filters:', { courseId, startDate, endDate });

		// Get courses taught by this lecturer
		const coursesQuery = `
      SELECT 
        c.id, c.code, c.name
      FROM Course c
      JOIN CourseLecturer cl ON c.id = cl.courseId
      WHERE cl.lecturerId = ?
      ORDER BY c.code ASC
    `;

		const courses = await db.$queryRawUnsafe(coursesQuery, locals.user.id);

		// Fetch session list (simplified view)
		let whereConditions = [];

		if (courseId) {
			whereConditions.push(`s.courseId = '${courseId}'`);
		} else {
			// If no course is selected, include all lecturer's courses
			whereConditions.push(`s.courseId IN (
        SELECT c.id FROM Course c
        JOIN CourseLecturer cl ON c.id = cl.courseId
        WHERE cl.lecturerId = '${locals.user.id}'
      )`);
		}

		if (startDate) {
			whereConditions.push(`DATE(s.date) >= DATE('${startDate}')`);
		}

		if (endDate) {
			whereConditions.push(`DATE(s.date) <= DATE('${endDate}')`);
		}

		const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

		const sessionsQuery = `
      SELECT 
        s.id, s.date, s.title, s.topic,
        c.id as courseId, c.code as courseCode, c.name as courseName,
        (
          SELECT MAX(u.level) 
          FROM StudentCourse sc
          JOIN "User" u ON sc.studentId = u.id
          WHERE sc.courseId = c.id
        ) as level
      FROM Session s
      JOIN Course c ON s.courseId = c.id
      ${whereClause}
      ORDER BY s.date DESC
    `;

		const sessions = await db.$queryRawUnsafe(sessionsQuery);

		// Format sessions for display
		const formattedSessions = Array.isArray(sessions)
			? sessions.map((s) => ({
					id: s.id,
					date: s.date,
					title: s.title,
					topic: s.topic, // Using topic field for location
					level: s.level,
					course: {
						id: s.courseId,
						code: s.courseCode,
						name: s.courseName
					}
				}))
			: [];

		return {
			courses: Array.isArray(courses) ? courses : [],
			sessions: formattedSessions,
			filters: {
				courseId,
				startDate,
				endDate
			},
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading lecturer session records:', err);
		return {
			courses: [],
			sessions: [],
			filters: {},
			userProfile: locals.user
		};
	}
};
