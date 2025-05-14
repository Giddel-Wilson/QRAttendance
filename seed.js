import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/utils/auth.js';

const prisma = new PrismaClient();

async function seed() {
	try {
		console.log('Creating test accounts...');

		// Create admin
		const adminPassword = await hashPassword('admin123');
		const admin = await prisma.user.create({
			data: {
				name: 'System Administrator',
				email: 'admin@example.com',
				passwordHash: adminPassword,
				role: 'ADMIN'
			}
		});

		// Create lecturer for each department
		const lecturerPassword = await hashPassword('password');
		const lecturer1 = await prisma.user.create({
			data: {
				name: 'Dr. John Smith',
				email: 'john@example.com',
				passwordHash: lecturerPassword,
				role: 'LECTURER',
				department: 'Computer Science'
			}
		});

		const lecturer2 = await prisma.user.create({
			data: {
				name: 'Prof. Sarah Johnson',
				email: 'sarah@example.com',
				passwordHash: lecturerPassword,
				role: 'LECTURER',
				department: 'Information Technology'
			}
		});

		const lecturer3 = await prisma.user.create({
			data: {
				name: 'Dr. Michael Chen',
				email: 'michael@example.com',
				passwordHash: lecturerPassword,
				role: 'LECTURER',
				department: 'CyberSecurity'
			}
		});

		// Create student accounts
		const studentPassword = await hashPassword('password');
		const student1 = await prisma.user.create({
			data: {
				name: 'Jane Student',
				email: 'jane@example.com',
				passwordHash: studentPassword,
				role: 'STUDENT',
				department: 'Computer Science'
			}
		});

		// Create courses
		const course1 = await prisma.course.create({
			data: {
				code: 'CS101',
				name: 'Introduction to Programming',
				description: 'Basic programming concepts using Python',
				department: 'Computer Science',
				semester: 'FIRST',
				lecturerId: lecturer1.id
			}
		});

		const course2 = await prisma.course.create({
			data: {
				code: 'IT205',
				name: 'Database Management',
				description: 'Introduction to database design and SQL',
				department: 'Information Technology',
				semester: 'FIRST',
				lecturerId: lecturer2.id
			}
		});

		const course3 = await prisma.course.create({
			data: {
				code: 'CS301',
				name: 'Network Security',
				description: 'Advanced topics in network security',
				department: 'CyberSecurity',
				semester: 'SECOND',
				lecturerId: lecturer3.id
			}
		});

		console.log('Database seeded successfully!');
		console.log('\n===== TEST ACCOUNTS =====');
		console.log('Admin: admin@example.com / admin123');
		console.log('Lecturer: john@example.com / password');
		console.log('Student: jane@example.com / password');
	} catch (error) {
		console.error('Seeding failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seed();
