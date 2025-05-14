import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		redirect(302, '/auth/login');
	}

	const diagnostics = {
		success: false,
		errors: [],
		tests: [],
		dbUrl: process.env.DATABASE_URL ? '✅ Set' : '❌ Not set',
		nodeEnv: process.env.NODE_ENV || 'Not set'
	};

	try {
		// Test 1: Connection test
		try {
			const result = await db.$queryRaw`SELECT 1 as test`;
			diagnostics.tests.push({
				name: 'Database Connection',
				success: true,
				result: 'Connected successfully',
				details: JSON.stringify(result)
			});
		} catch (err) {
			diagnostics.tests.push({
				name: 'Database Connection',
				success: false,
				error: err.message,
				stack: err.stack
			});
			diagnostics.errors.push(`Connection error: ${err.message}`);
		}

		// Test 2: User table test
		try {
			const count = await db.user.count();
			diagnostics.tests.push({
				name: 'User Table Check',
				success: true,
				result: `Found ${count} users in the database`
			});
		} catch (err) {
			diagnostics.tests.push({
				name: 'User Table Check',
				success: false,
				error: err.message
			});
			diagnostics.errors.push(`User table error: ${err.message}`);
		}

		// Test 3: Create test user
		try {
			const testUser = await db.user.create({
				data: {
					name: 'Test User',
					email: `test-${Date.now()}@example.com`,
					role: 'STUDENT',
					passwordHash: 'test-hash'
				}
			});
			diagnostics.tests.push({
				name: 'Create Test User',
				success: true,
				result: `Created test user with ID: ${testUser.id}`
			});

			// Delete the test user
			await db.user.delete({
				where: { id: testUser.id }
			});
			diagnostics.tests.push({
				name: 'Delete Test User',
				success: true,
				result: 'Deleted test user successfully'
			});
		} catch (err) {
			diagnostics.tests.push({
				name: 'Create/Delete Test User',
				success: false,
				error: err.message
			});
			diagnostics.errors.push(`Test user operation error: ${err.message}`);
		}

		// Overall success if no errors
		diagnostics.success = diagnostics.errors.length === 0;
	} catch (err) {
		diagnostics.errors.push(`Unexpected error: ${err.message}`);
	}

	return { diagnostics };
};
