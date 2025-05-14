/**
 * User role types in the system
 */
export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

/**
 * Admin dashboard statistics
 */
export interface AdminDashboardStats {
	totalStudents: number;
	totalLecturers: number;
	totalCourses: number;
	totalAttendance: number;
	totalUsers: number; // Added for admin page
	systemHealth: number; // Added for admin page
}

/**
 * Lecturer dashboard statistics
 */
export interface LecturerDashboardStats {
	totalStudents: number;
	totalCourses: number;
	totalSchedules?: number;
	totalAttendance: number;
	attendanceRate: number;
}

/**
 * Student dashboard statistics
 */
export interface StudentDashboardStats {
	totalCourses: number;
	totalSchedules?: number;
	totalAttendance: number;
	attendanceRate: number;
	upcomingClasses: number;
}

/**
 * Activity log entry
 */
export interface Activity {
	id: string;
	timestamp: Date;
	action: string;
	details: string;
	entityId?: string;
	entityType?: string; // Added for admin page
	performedBy?: string;
	performedByEmail?: string; // Added for admin page
}
