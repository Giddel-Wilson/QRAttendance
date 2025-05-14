import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/utils/auth.js';

const prisma = new PrismaClient();

async function seed() {
	try {
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

		console.log('Admin user created successfully!');
		console.log('Login with: admin@example.com / admin123');
	} catch (error) {
		console.error('Seeding failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seed();
