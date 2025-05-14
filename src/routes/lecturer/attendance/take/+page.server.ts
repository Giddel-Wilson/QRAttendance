import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createAuditLog } from '$lib/server/auditLog';

// export const load = async ({ locals }) => {
	// if (!locals.user || locals.user.role !== 'LECTURER') {
	// 	throw redirect(302, '/auth/login');
	// }
	
	// const courses = await db.course.findMany({
	// 	where: {
	// 		lecturerId: locals.user.id
	// 	},
	// 	include: {
	// 		sessions: true
	// 	}
	// });
	
	// return {
	// 	courses
	// };
// };

export const actions = {
	// Create attendance session
	createSession: async ({ locals, request, getClientAddress }) => {
		const formData = await request.formData();
		const courseId = formData.get('courseId');
		const date = formData.get('date');
		const time = formData.get('time');
		const duration = formData.get('duration');
	
		// Validate and parse inputs
		if (!courseId || !date || !time || !duration) {
			return { success: false, error: 'All fields are required' };
		}
	
		// Create session logic
		const newSession = await db.session.create({
			data: {
				courseId,
				date: new Date(date),
				time,
				duration,
				lecturerId: locals.user.id // Associate session with the lecturer
			}
		});
	
		// Log session creation
		await createAuditLog({
			userId: locals.user.id,
			action: 'SESSION_CREATED',
			entityType: 'Session',
			entityId: newSession.id,
			details: `Created attendance session for ${course.code} on ${new Date(date).toLocaleDateString()}`,
			ipAddress: getClientAddress ? getClientAddress() : null
		});
	
		return { success: true };
	},
	
	// Record attendance 
	recordAttendance: async ({ locals, request, getClientAddress }) => {
		const formData = await request.formData();
		const sessionId = formData.get('sessionId');
		const studentId = formData.get('studentId');
		const status = formData.get('status');
		const date = formData.get('date');
	
		// Validate and parse inputs
		if (!sessionId || !studentId || !status || !date) {
			return { success: false, error: 'All fields are required' };
		}
	
		// Record attendance logic
		const attendance = await db.attendance.create({
			data: {
				sessionId,
				studentId,
				status,
				date: new Date(date),
				lecturerId: locals.user.id // Associate attendance with the lecturer
			}
		});
	
		// Log attendance record
		await createAuditLog({
			userId: locals.user.id,
			action: 'ATTENDANCE_RECORDED',
			entityType: 'Attendance',
			entityId: attendance.id,
			details: `Recorded attendance for ${student.email} in ${course.code}`,
			ipAddress: getClientAddress ? getClientAddress() : null
		});
	
		return { success: true };
	}
};