/**
 * Database Check Utility
 * Run this script to check users in your database:
 *
 * Command: node scripts/check-database.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	try {
		console.log('🔍 Checking database connection...');
		await prisma.$executeRaw`SELECT 1`;
		console.log('✅ Database connection successful\n');

		console.log('📊 Counting users in database...');
		const userCount = await prisma.user.count();
		console.log(`Found ${userCount} users in total\n`);

		if (userCount > 0) {
			console.log('👤 Listing all users:');
			const users = await prisma.user.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					createdAt: true
				}
			});

			users.forEach((user, i) => {
				console.log(`[${i + 1}] ${user.name || 'No Name'} (${user.email}) - Role: ${user.role}`);
				console.log(`    Created: ${user.createdAt}`);
				console.log(`    ID: ${user.id}`);
				console.log('');
			});
		}

		console.log('🔄 Checking user roles distribution:');
		const adminCount = await prisma.user.count({
			where: { role: { equals: 'ADMIN', mode: 'insensitive' } }
		});

		const lecturerCount = await prisma.user.count({
			where: { role: { equals: 'LECTURER', mode: 'insensitive' } }
		});

		const studentCount = await prisma.user.count({
			where: { role: { equals: 'STUDENT', mode: 'insensitive' } }
		});

		console.log(`Admins: ${adminCount}`);
		console.log(`Lecturers: ${lecturerCount}`);
		console.log(`Students: ${studentCount}`);
		console.log(`Other/Unknown: ${userCount - (adminCount + lecturerCount + studentCount)}`);
	} catch (error) {
		console.error('❌ Database error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

main();
