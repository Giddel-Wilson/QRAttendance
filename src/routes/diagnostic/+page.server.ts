import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Basic structure check
	const tables = await db.$queryRaw`
    SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
  `;

	// Check User table structure
	const userColumns = await db.$queryRaw`
    PRAGMA table_info("User")
  `;

	const sampleUsers = await db.$queryRaw`
    SELECT id, name, email, role FROM "User" LIMIT 2
  `;

	return {
		dbStatus: 'Connected',
		tables: Array.isArray(tables) ? tables.map((t) => t.name) : [],
		userColumns: Array.isArray(userColumns) ? userColumns : [],
		sampleUsers: Array.isArray(sampleUsers) ? sampleUsers : [],
		sessionUser: locals.user || null
	};
};
