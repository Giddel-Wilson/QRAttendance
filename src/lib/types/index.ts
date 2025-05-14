// User types
export interface User {
	id: string;
	email: string;
	role: 'ADMIN' | 'LECTURER' | 'STUDENT';
	createdAt: string;
	updatedAt: string;
}

// Student types
export interface Student {
	id: string;
	userId: string;
	fullName: string;
	matricNumber: string;
	department: string;
	level: number;
	phoneNumber: string;
	createdAt: string;
	updatedAt: string;
}

// Lecturer types
export interface Lecturer {
	id: string;
	userId: string;
	fullName: string;
	department: string;
	position: string;
	phoneNumber: string;
	createdAt: string;
	updatedAt: string;
}

// Admin types
export interface Admin {
	id: string;
	userId: string;
	fullName: string;
	phoneNumber: string;
	createdAt: string;
	updatedAt: string;
}

// Course types
export interface Course {
	id: string;
	courseCode: string;
	title: string;
	description?: string;
	semester: 'FIRST' | 'SECOND';
	academicYear: string;
	createdAt: string;
	updatedAt: string;
}

// Dashboard statistics types
export interface CourseBasicInfo {
	id: string;
	courseCode: string;
	title: string;
	semester: 'FIRST' | 'SECOND';
	academicYear: string;
	description?: string;
}

export interface CourseWithLecturer extends CourseBasicInfo {
	lecturer: string;
}

export interface CourseWithAttendance {
	courseId: string;
	courseCode: string;
	title: string;
	attendanceRate: number;
}

export interface CourseWithLecturerAndAttendance extends CourseWithAttendance {
	lecturer: string;
}

export interface ScheduledClass extends CourseBasicInfo {
	time: string;
}

export interface Activity {
	id: string;
	action: string;
	courseId: string;
	courseCode: string;
	description: string;
	timestamp: string;
}

// Admin dashboard stats
export interface AdminDashboardStats {
	totalStudents: number;
	totalLecturers: number;
	totalCourses: number;
	newRegistrations: number;
	departmentDistribution: Array<{
		department: string;
		studentCount: number;
	}>;
	levelDistribution: Array<{
		level: number;
		studentCount: number;
	}>;
	courseDistribution: Array<{
		semester: 'FIRST' | 'SECOND';
		courseCount: number;
	}>;
	recentActivity: Activity[];
}

// Lecturer dashboard stats
export interface LecturerDashboardStats {
	totalStudents: number;
	assignedCourses: number;
	courseAttendance: CourseWithAttendance[];
	averageAttendance: number;
	qrSessionsToday: number;
	activeQrSessions: number;
	courses: CourseBasicInfo[];
	upcomingClasses: ScheduledClass[];
	todaysClasses: number;
	lowAttendanceCourses: CourseWithAttendance[];
	recentActivity: Activity[];
}

// Student dashboard stats
export interface StudentDashboardStats {
	courses: CourseWithLecturer[];
	courseAttendance: CourseWithLecturerAndAttendance[];
	averageAttendance: number;
	todaysClasses: ScheduledClass[];
	lowAttendanceCourses: CourseWithLecturerAndAttendance[];
	recentActivity: Activity[];
}

// Auth types
export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface RegisterStudentData {
	fullName: string;
	email: string;
	password: string;
	phoneNumber: string;
	matricNumber: string;
	department: string;
	level: number;
}

export interface RegisterLecturerData {
	fullName: string;
	email: string;
	password: string;
	phoneNumber: string;
	department: string;
	position: string;
}

export interface RegisterAdminData {
	fullName: string;
	email: string;
	password: string;
	phoneNumber: string;
	adminCode: string;
}

export type RegistrationData = RegisterStudentData | RegisterLecturerData | RegisterAdminData;
