import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'LECTURER') {
		redirect(302, '/auth/login');
	}

	try {
		// Get courses for this lecturer using the CourseLecturer junction table
		const rawCourses = await db.$queryRaw`
      SELECT 
        c.id, c.code, c.name, c.description, c.department, c.semester, c.createdAt, c.updatedAt
      FROM 
        Course c
      JOIN 
        CourseLecturer cl ON c.id = cl.courseId
      WHERE 
        cl.lecturerId = ${locals.user.id}
      ORDER BY 
        c.code ASC
    `;

		// Process the raw courses data
		const courses = Array.isArray(rawCourses)
			? await Promise.all(
					rawCourses.map(async (course) => {
						// Get student count
						const studentCount = await db.studentCourse
							.count({
								where: { courseId: course.id }
							})
							.catch(() => 0);

						// Get session count
						const sessionCount = await db.session
							.count({
								where: { courseId: course.id }
							})
							.catch(() => 0);

						// Get most recent session
						const recentSession = await db.session
							.findFirst({
								where: { courseId: course.id },
								orderBy: { date: 'desc' }
							})
							.catch(() => null);

						// Calculate actual attendance rate from real data
						let attendanceRate = 0;
						try {
							const totalAttendances = await db.attendance.count({
								where: {
									session: {
										courseId: course.id
									}
								}
							});

							const presentAttendances = await db.attendance.count({
								where: {
									status: 'PRESENT',
									session: {
										courseId: course.id
									}
								}
							});

							attendanceRate =
								totalAttendances > 0
									? Math.round((presentAttendances / totalAttendances) * 100)
									: 0;
						} catch (err) {
							console.log(`Error calculating attendance for ${course.code}:`, err);
						}

						return {
							id: course.id,
							code: course.code,
							name: course.name,
							description: course.description,
							department: course.department,
							semester: course.semester,
							createdAt: course.createdAt,
							studentCount,
							sessionCount,
							lastSession: recentSession?.date || null,
							attendanceRate // Real calculated value
						};
					})
				)
			: [];

		return {
			courses,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading lecturer courses:', err);
		return {
			courses: [],
			userProfile: locals.user
		};
	}
};
