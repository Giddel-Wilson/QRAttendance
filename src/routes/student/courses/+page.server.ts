import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	try {
		// Check if the StudentCourse table exists
		const tableCheck = await db.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='StudentCourse'
    `;

		const tableExists = Array.isArray(tableCheck) && tableCheck.length > 0;

		if (!tableExists) {
			console.log('StudentCourse table not found - creating table');

			// Create the StudentCourse table
			await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS "StudentCourse" (
          id TEXT PRIMARY KEY,
          studentId TEXT NOT NULL,
          courseId TEXT NOT NULL,
          enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES "User" (id) ON DELETE CASCADE,
          FOREIGN KEY (courseId) REFERENCES "Course" (id) ON DELETE CASCADE,
          UNIQUE(studentId, courseId)
        )
      `;
		}

		// Auto-enroll student in level-appropriate courses
		if (locals.user.level) {
			const studentLevel = locals.user.level.charAt(0); // First digit of level

			// Fix: Use string concatenation rather than template literals in parameters
			// to avoid parameter count mismatch
			const levelPrefix = studentLevel + '%';

			// Get all courses matching student's level
			const levelCourses = await db.$queryRaw`
        SELECT id, code, name FROM Course 
        WHERE code LIKE ${levelPrefix}
      `;

			// Get currently enrolled courses
			const enrolledCourses = await db.$queryRaw`
        SELECT courseId FROM StudentCourse WHERE studentId = ${locals.user.id}
      `;

			// Create set of enrolled course IDs for faster lookup
			const enrolledIds = new Set();
			if (Array.isArray(enrolledCourses)) {
				enrolledCourses.forEach((c) => enrolledIds.add(c.courseId));
			}

			// Enroll in matching courses not already enrolled in
			if (Array.isArray(levelCourses)) {
				for (const course of levelCourses) {
					if (!enrolledIds.has(course.id)) {
						try {
							await db.$executeRaw`
                INSERT INTO StudentCourse (id, studentId, courseId, enrolledAt)
                VALUES (lower(hex(randomblob(16))), ${locals.user.id}, ${course.id}, datetime('now'))
                ON CONFLICT DO NOTHING
              `;
							console.log(`Auto-enrolled in level-matching course: ${course.code}`);
						} catch (err) {
							console.error(`Error enrolling in course ${course.code}:`, err);
						}
					}
				}
			}
		}

		// Get enrolled courses
		let enrolledCourses = [];
		try {
			enrolledCourses = await db.$queryRaw`
        SELECT 
          c.id, c.code, c.name, c.department, c.semester,
          (
            SELECT GROUP_CONCAT(u.name, ', ')
            FROM CourseLecturer cl
            JOIN "User" u ON cl.lecturerId = u.id
            WHERE cl.courseId = c.id
          ) as lecturers
        FROM Course c
        JOIN StudentCourse sc ON c.id = sc.courseId
        WHERE sc.studentId = ${locals.user.id}
        ORDER BY c.code ASC
      `;
		} catch (err) {
			console.error('Error fetching enrolled courses:', err);
		}

		// Get available courses (not enrolled)
		let availableCourses = [];
		try {
			// Fix: Use string concatenation for SQL LIKE patterns
			const levelPrefix = locals.user.level ? locals.user.level.charAt(0) + '%' : '_';

			availableCourses = await db.$queryRaw`
        SELECT 
          c.id, c.code, c.name, c.department, c.semester,
          (
            SELECT GROUP_CONCAT(u.name, ', ')
            FROM CourseLecturer cl
            JOIN "User" u ON cl.lecturerId = u.id
            WHERE cl.courseId = c.id
          ) as lecturers
        FROM Course c
        WHERE c.id NOT IN (
          SELECT courseId FROM StudentCourse WHERE studentId = ${locals.user.id}
        )
        AND c.code NOT LIKE ${levelPrefix}
        ORDER BY c.code ASC
      `;
		} catch (err) {
			console.error('Error fetching available courses:', err);
		}

		return {
			enrolledCourses: Array.isArray(enrolledCourses)
				? enrolledCourses.map((c) => ({
						id: c.id,
						code: c.code,
						name: c.name,
						department: c.department || 'N/A',
						semester: c.semester || 'N/A',
						lecturers: c.lecturers || 'Unassigned'
					}))
				: [],
			availableCourses: Array.isArray(availableCourses)
				? availableCourses.map((c) => ({
						id: c.id,
						code: c.code,
						name: c.name,
						department: c.department || 'N/A',
						semester: c.semester || 'N/A',
						lecturers: c.lecturers || 'Unassigned'
					}))
				: [],
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading student courses:', err);
		return {
			enrolledCourses: [],
			availableCourses: [],
			userProfile: locals.user
		};
	}
};

export const actions: Actions = {
	enrollCourse: async ({ request, locals }) => {
		if (!locals.user) {
			return { error: 'You must be logged in to enroll in courses' };
		}

		const formData = await request.formData();
		const courseId = formData.get('courseId') as string;

		if (!courseId) {
			return { error: 'Course ID is required' };
		}

		try {
			// Check if the course exists
			const course = await db.course.findUnique({
				where: { id: courseId }
			});

			if (!course) {
				return { error: 'Course not found' };
			}

			// Check if student is already enrolled
			const existing = await db.courseEnrollment.findFirst({
				where: {
					studentId: locals.user.id,
					courseId
				}
			});

			if (existing) {
				return { error: 'You are already enrolled in this course' };
			}

			// Create enrollment
			await db.courseEnrollment.create({
				data: {
					studentId: locals.user.id,
					courseId
				}
			});

			// Log activity if ActivityLog table exists
			try {
				await db.activityLog.create({
					data: {
						userId: locals.user.id,
						action: 'ENROLL_COURSE',
						details: `Enrolled in course ${course.code}`,
						entityId: courseId,
						entityType: 'COURSE',
						timestamp: new Date()
					}
				});
			} catch (logError) {
				// Silently fail if activity logging fails
				console.log('Failed to log activity (table may not exist yet)');
			}

			return { success: true };
		} catch (err) {
			console.error('Error enrolling in course:', err);
			return { error: 'Failed to enroll in course. Please try again later.' };
		}
	}
};

// Helper function to format day of week
function formatDay(dateString: Date | string): string {
	const date = new Date(dateString);
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	return days[date.getDay()];
}
