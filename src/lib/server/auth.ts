import crypto from 'crypto';
import { db } from '$lib/server/db';
import type { Cookies } from '@sveltejs/kit';

// Password utilities
export function hashPassword(password: string): string {
	// Simple SHA-256 hash for development - in production use a better method
	return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
	// Try different methods to verify password

	// 1. Direct comparison (for development)
	if (password === hash) return true;

	// 2. SHA-256 hash
	const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
	if (sha256Hash === hash) return true;

	// 3. MD5 hash (older systems)
	const md5Hash = crypto.createHash('md5').update(password).digest('hex');
	if (md5Hash === hash) return true;

	return false;
}

// User management
export async function findUserByEmail(email: string) {
	try {
		const users = await db.$queryRawUnsafe('SELECT * FROM "User" WHERE email = ? LIMIT 1', email);

		return Array.isArray(users) && users.length > 0 ? users[0] : null;
	} catch (err) {
		console.error('Error finding user:', err);
		return null;
	}
}

// Create user (only one implementation)
export async function createUser(userData: any) {
	try {
		// Hash the password if it exists
		if (userData.password) {
			userData.passwordHash = hashPassword(userData.password);
			delete userData.password;
		}

		// Generate a UUID
		userData.id = userData.id || crypto.randomUUID();

		// Build the SQL
		const fields = Object.keys(userData).join(', ');
		const placeholders = Object.keys(userData)
			.map(() => '?')
			.join(', ');
		const values = Object.values(userData);

		// Insert the user
		const sql = `INSERT INTO "User" (${fields}) VALUES (${placeholders})`;
		await db.$executeRawUnsafe(sql, ...values);

		// Return the user without sensitive data
		delete userData.passwordHash;
		return userData;
	} catch (err) {
		console.error('Error creating user:', err);
		throw new Error(`Failed to create user: ${err.message}`);
	}
}

// Session management
export function createSession(cookies: Cookies, user: any) {
	// Create session data
	const sessionData = {
		userId: user.id,
		name: user.name || '',
		email: user.email,
		role: user.role
	};

	// Set the cookie
	cookies.set('user_session', JSON.stringify(sessionData), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});

	return sessionData;
}
