import { db } from '$lib/server/db';
import { createAuditLog } from '$lib/server/auditLog';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Auth check
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	try {
		console.log('Admin courses page loading...');

		// Get all courses
		const courses = await db.course.findMany({
			orderBy: {
				code: 'asc'
			}
		});

		// For each course, get its lecturers
		const coursesWithLecturers = await Promise.all(
			courses.map(async (course) => {
				// Get lecturers assigned to this course from the CourseLecturer table
				const courseLecturers = await db.$queryRaw`
        SELECT cl.lecturerId, u.name, u.email 
        FROM "CourseLecturer" cl
        JOIN "User" u ON cl.lecturerId = u.id
        WHERE cl.courseId = ${course.id}
      `;

				// Format the lecturer data
				const lecturers = Array.isArray(courseLecturers)
					? courseLecturers.map((l) => ({
							lecturerId: l.lecturerId,
							name: l.name || l.email || 'Unknown'
						}))
					: [];

				// Create a display string for all lecturers
				const lecturerDisplay =
					lecturers.length > 0 ? lecturers.map((l) => l.name).join(', ') : 'Unassigned';

				return {
					...course,
					lecturers,
					lecturerDisplay
				};
			})
		);

		console.log(`Found ${coursesWithLecturers.length} courses`);

		// Get lecturers for assignment
		const lecturerAccounts = await db.user.findMany({
			where: {
				role: {
					in: ['LECTURER', 'ADMIN']
				}
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				department: true
			}
		});

		return {
			courses: coursesWithLecturers,
			lecturers: lecturerAccounts,
			userProfile: locals.user
		};
	} catch (err) {
		console.error('Error loading admin courses:', err);
		return {
			courses: [],
			lecturers: [],
			userProfile: locals.user
		};
	}
};

export const actions: Actions = {
	createCourse: async ({ locals, request, getClientAddress }) => {
		try {
			const formData = await request.formData();
			const code = formData.get('code') as string;
			const name = formData.get('name') as string;
			const description = formData.get('description') as string;
			const department = formData.get('department') as string;
			const semester = formData.get('semester') as string;

			// Fix: Correctly get all lecturer IDs from form data
			// Note: The way FormData handles multiple values with the same name is special
			const lecturerIds = formData.getAll('lecturerIds[]');

			console.log('Selected lecturer IDs:', lecturerIds); // Debug log

			// Basic validation
			if (!code || !name) {
				return { error: 'Course code and name are required' };
			}

			// Create course
			const course = await db.course.create({
				data: {
					code,
					name,
					description,
					department,
					semester
				}
			});

			// Assign all lecturers
			if (lecturerIds && lecturerIds.length > 0) {
				console.log(`Assigning ${lecturerIds.length} lecturers to course ${course.id}`);

				// Important: Use Promise.all to make all insertions parallel
				await Promise.all(
					lecturerIds.map(async (lecturerId) => {
						try {
							await db.$executeRawUnsafe(
								`
                INSERT INTO "CourseLecturer" (id, courseId, lecturerId, assignedAt)
                VALUES (lower(hex(randomblob(16))), ?, ?, datetime('now'))
              `,
								course.id,
								lecturerId
							);
							console.log(`Assigned lecturer ${lecturerId} to course ${course.id}`);
						} catch (insertErr) {
							console.error(`Error assigning lecturer ${lecturerId}:`, insertErr);
						}
					})
				);
			}

			// Log course creation
			await createAuditLog({
				userId: locals.user.id,
				action: 'COURSE_CREATED',
				entityType: 'Course',
				entityId: course.id,
				details: `Course ${course.code}: ${course.name} was created`,
				ipAddress: getClientAddress()
			});

			return {
				success: true,
				message: `Course ${code} created successfully with ${lecturerIds.length} lecturers`
			};
		} catch (err) {
			console.error('Error creating course:', err);
			return {
				error: `Failed to create course: ${err instanceof Error ? err.message : String(err)}`
			};
		}
	},

	updateCourse: async ({ locals, request, getClientAddress }) => {
		try {
			const formData = await request.formData();
			const id = formData.get('id') as string;
			const code = formData.get('code') as string;
			const name = formData.get('name') as string;
			const description = formData.get('description') as string;
			const department = formData.get('department') as string;
			const semester = formData.get('semester') as string;

			// Fix: Correctly get all lecturer IDs from form data
			const lecturerIds = formData.getAll('lecturerIds[]');

			console.log('Selected lecturer IDs for update:', lecturerIds); // Debug log

			// Basic validation
			if (!id || !code || !name) {
				return { error: 'Course ID, code and name are required' };
			}

			// Update course
			const course = await db.course.update({
				where: { id },
				data: {
					code,
					name,
					description,
					department,
					semester
				}
			});

			// Update lecturers using raw SQL
			try {
				// First remove all existing assignments
				await db.$executeRawUnsafe(
					`
          DELETE FROM "CourseLecturer" WHERE courseId = ?
        `,
					id
				);

				console.log(`Deleted existing lecturer assignments for course ${id}`);

				// Then add the new assignments
				if (lecturerIds && lecturerIds.length > 0) {
					console.log(`Assigning ${lecturerIds.length} lecturers to course ${id}`);

					// Important: Use Promise.all to make all insertions parallel
					await Promise.all(
						lecturerIds.map(async (lecturerId) => {
							try {
								await db.$executeRawUnsafe(
									`
                  INSERT INTO "CourseLecturer" (id, courseId, lecturerId, assignedAt)
                  VALUES (lower(hex(randomblob(16))), ?, ?, datetime('now'))
                `,
									id,
									lecturerId
								);
								console.log(`Assigned lecturer ${lecturerId} to course ${id}`);
							} catch (insertErr) {
								console.error(`Error assigning lecturer ${lecturerId}:`, insertErr);
							}
						})
					);
				}
			} catch (lecturerErr) {
				console.error('Error updating course lecturers:', lecturerErr);
				// Continue anyway since the course was updated
			}

			// Log course update
			await createAuditLog({
				userId: locals.user.id,
				action: 'COURSE_UPDATED',
				entityType: 'Course',
				entityId: course.id,
				details: `Course ${course.code} was updated`,
				ipAddress: getClientAddress()
			});

			return {
				success: true,
				message: `Course ${code} updated successfully with ${lecturerIds.length} lecturers`
			};
		} catch (err) {
			console.error('Error updating course:', err);
			return {
				error: `Failed to update course: ${err instanceof Error ? err.message : String(err)}`
			};
		}
	},

	// For assigning lecturers to courses
	assignLecturer: async ({ locals, request, getClientAddress }) => {
		const data = await request.formData();
		const courseId = data.get('courseId')?.toString();
		const lecturerId = data.get('lecturerId')?.toString();

		// Get course and lecturer details for the audit log
		const course = await db.course.findUnique({ where: { id: courseId }, select: { code: true } });
		const lecturer = await db.user.findUnique({ where: { id: lecturerId }, select: { email: true } });

		try {
			// Assign lecturer to course
			await db.$executeRawUnsafe(
				`
        INSERT INTO "CourseLecturer" (id, courseId, lecturerId, assignedAt)
        VALUES (lower(hex(randomblob(16))), ?, ?, datetime('now'))
      `,
				courseId,
				lecturerId
			);

			// Log lecturer assignment
			await createAuditLog({
				userId: locals.user.id,
				action: 'LECTURER_ASSIGNED',
				entityType: 'Course',
				entityId: courseId,
				details: `Assigned lecturer ${lecturer.email} to course ${course.code}`,
				ipAddress: getClientAddress()
			});

			return {
				success: true,
				message: `Lecturer assigned successfully`
			};
		} catch (err) {
			console.error('Error assigning lecturer:', err);
			return {
				error: `Failed to assign lecturer: ${err instanceof Error ? err.message : String(err)}`
			};
		}
	},

	// For enrolling students in courses
	enrollStudent: async ({ locals, request, getClientAddress }) => {
		const data = await request.formData();
		const courseId = data.get('courseId')?.toString();
		const studentId = data.get('studentId')?.toString();

		// Get course and student details for the audit log
		const course = await db.course.findUnique({ where: { id: courseId }, select: { code: true } });
		const student = await db.user.findUnique({ where: { id: studentId }, select: { email: true } });

		try {
			// Enroll student in course
			await db.$executeRawUnsafe(
				`
        INSERT INTO "CourseStudent" (id, courseId, studentId, enrolledAt)
        VALUES (lower(hex(randomblob(16))), ?, ?, datetime('now'))
      `,
				courseId,
				studentId
			);

			// Log student enrollment
			await createAuditLog({
				userId: locals.user.id,
				action: 'STUDENT_ENROLLED',
				entityType: 'Course',
				entityId: courseId,
				details: `Enrolled student ${student.email} in course ${course.code}`,
				ipAddress: getClientAddress()
			});

			return {
				success: true,
				message: `Student enrolled successfully`
			};
		} catch (err) {
			console.error('Error enrolling student:', err);
			return {
				error: `Failed to enroll student: ${err instanceof Error ? err.message : String(err)}`
			};
		}
	}

	// ...existing code for deleteCourse and other actions...
};
