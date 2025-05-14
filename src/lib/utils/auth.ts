import { redirect } from '@sveltejs/kit';
import { createHash, randomBytes } from 'crypto'; // Node.js built-in, works with Bun

// Define UserRole type locally if the import isn't working
export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

/**
 * Hashes a plain text password using SHA-256 with salt
 * This is a fallback method in case bcrypt isn't working with Bun
 */
export async function hashPassword(password: string): Promise<string> {
	try {
		console.log('Hashing password with crypto...');
		// Create a unique salt using randomBytes instead of crypto.randomUUID
		const salt = randomBytes(16).toString('hex');
		// Combine salt and password, then hash
		const hash = createHash('sha256')
			.update(salt + password)
			.digest('hex');
		// Store both salt and hash, separated by a dot
		const result = `${salt}.${hash}`;
		console.log('Password hashed successfully');
		return result;
	} catch (error) {
		console.error('Error hashing password:', error);
		throw new Error(
			'Failed to hash password: ' + (error instanceof Error ? error.message : String(error))
		);
	}
}

/**
 * Verifies a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	try {
		console.log('Starting password verification...');
		if (!password || !hashedPassword) {
			console.error('Invalid inputs for password verification');
			return false;
		}

		// Split the stored value to get salt and hash
		const [salt, storedHash] = hashedPassword.split('.');

		// If no dot is found or missing parts, it might be a bcrypt hash (old format)
		if (!salt || !storedHash) {
			console.error('Invalid hash format');
			return false;
		}

		// Hash the input password with the same salt
		const inputHash = createHash('sha256')
			.update(salt + password)
			.digest('hex');

		// Compare the computed hash with the stored hash
		const result = inputHash === storedHash;
		console.log('Password verification complete, result:', result);
		return result;
	} catch (error) {
		console.error('Error verifying password:', error);
		throw new Error(
			'Failed to verify password: ' + (error instanceof Error ? error.message : String(error))
		);
	}
}

/**
 * Validates that the user has the required role
 */
export function validateUserRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
	return allowedRoles.includes(userRole);
}

/**
 * Redirects the user based on their role
 */
export function redirectBasedOnRole(role: UserRole): void {
	switch (role) {
		case 'ADMIN':
			redirect(302, '/admin');
			break;
		case 'LECTURER':
			redirect(302, '/lecturer');
			break;
		case 'STUDENT':
			redirect(302, '/student');
			break;
		default:
			redirect(302, '/auth/login');
	}
}
