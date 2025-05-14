import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showDatabase() {
	console.log('=== DATABASE CONTENTS ===');

	// View all users
	console.log('\n=== USERS ===');
	const users = await prisma.user.findMany();
	console.table(
		users.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			role: u.role,
			department: u.department
		}))
	);

	// View all courses
	console.log('\n=== COURSES ===');
	const courses = await prisma.course.findMany({
		include: { lecturer: true }
	});
	console.table(
		courses.map((c) => ({
			id: c.id,
			code: c.code,
			name: c.name,
			department: c.department,
			semester: c.semester,
			lecturer: c.lecturer ? c.lecturer.name : 'Unassigned'
		}))
	);

	// Close Prisma client
	await prisma.$disconnect();
}

showDatabase().catch((e) => {
	console.error('Error viewing database:', e);
	prisma.$disconnect();
});
