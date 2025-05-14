import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user || locals.user.role !== 'LECTURER') {
		redirect(302, '/auth/login');
	}

	try {
		console.log('Loading lecturer/students page for lecturer ID:', locals.user.id);

		// Get courseId from URL if present
		const courseId = url.searchParams.get('courseId');

		// Get courses taught by this lecturer with accurate student counts
		const courses = await db.$queryRaw`
      SELECT 
        c.id, c.code, c.name,
        (
          SELECT COUNT(DISTINCT u.id)
          FROM "User" u
          JOIN StudentCourse sc ON u.id = sc.studentId
          WHERE sc.courseId = c.id
        ) as studentCount
      FROM Course c
      JOIN CourseLecturer cl ON c.id = cl.courseId
      WHERE cl.lecturerId = ${locals.user.id}
      ORDER BY c.code ASC
    `;

		console.log('Lecturer courses retrieved:', courses?.length || 0);

		let formattedCourses = [];

		if (Array.isArray(courses)) {
			formattedCourses = courses.map((c) => ({
				id: c.id,
				code: c.code,
				name: c.name,
				studentCount: Number(c.studentCount) || 0
			}));
		}

		// Auto-enroll students based on level if needed
		await autoEnrollStudents(formattedCourses);

		// Set default course or use selected
		let selectedCourseId = courseId;
		if (!selectedCourseId && formattedCourses.length > 0) {
			selectedCourseId = formattedCourses[0].id;
		}

		// Initialize data structures
		let students = [];
		let studentsByLevel = {};
		let selectedCourse = null;

		if (selectedCourseId) {
			// Get selected course details
			selectedCourse = formattedCourses.find((c) => c.id === selectedCourseId) || null;

			// Get enrolled students for the course
			const rawStudents = await db.$queryRaw`
        SELECT 
          u.id, u.name, u.email, u.matricNumber, u.level, u.department
        FROM StudentCourse sc
        JOIN "User" u ON sc.studentId = u.id
        WHERE sc.courseId = ${selectedCourseId}
        ORDER BY u.level ASC, u.name ASC
      `;

			console.log('Students found for selected course:', rawStudents?.length || 0);

			if (Array.isArray(rawStudents) && rawStudents.length > 0) {
				// Process students
				students = rawStudents.map((s) => ({
					id: s.id,
					name: s.name || s.email,
					email: s.email,
					matricNumber: s.matricNumber || 'N/A',
					level: s.level || 'Unknown',
					department: s.department || 'N/A'
				}));

				// Group students by level
				studentsByLevel = students.reduce((acc, student) => {
					const level = student.level || 'Unknown';
					if (!acc[level]) {
						acc[level] = [];
					}
					acc[level].push(student);
					return acc;
				}, {});
			}
		}

		// Update the course count
		if (selectedCourse) {
			selectedCourse.studentCount = students.length;
		}

		return {
			courses: formattedCourses,
			selectedCourseId,
			selectedCourse,
			students,
			studentsByLevel,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading lecturer students:', err);
		return {
			courses: [],
			selectedCourseId: null,
			selectedCourse: null,
			students: [],
			studentsByLevel: {},
			userProfile: locals.user
		};
	}
};

// Helper function to auto-enroll students by level
async function autoEnrollStudents(courses) {
	try {
		for (const course of courses) {
			// Skip courses without a proper code format
			if (!course.code || !course.code.match(/\d+/)) continue;

			// Extract level from course code (e.g., CSC 480 → 4)
			const codeMatch = course.code.match(/\s*(\d+)/);
			if (!codeMatch) continue;

			const courseLevel = codeMatch[1].charAt(0); // First digit of course number

			// Find students with matching level who aren't enrolled
			await db.$executeRaw`
        INSERT INTO StudentCourse (id, studentId, courseId, enrolledAt)
        SELECT 
          lower(hex(randomblob(16))),
          u.id,
          ${course.id},
          datetime('now')
        FROM "User" u
        WHERE 
          u.role = 'STUDENT'
          AND u.level IS NOT NULL
          AND substr(u.level, 1, 1) = ${courseLevel}
          AND NOT EXISTS (
            SELECT 1 FROM StudentCourse sc 
            WHERE sc.studentId = u.id AND sc.courseId = ${course.id}
          )
      `;
		}
	} catch (err) {
		console.error('Error during auto-enrollment:', err);
	}
}
