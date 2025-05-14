import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { hashPassword } from '$lib/utils/auth';
import type { UserRole } from '$lib/utils/auth';
import type { Actions } from './$types';

export function load({ locals }) {
	if (locals.user) {
		const { role } = locals.user;
		redirectBasedOnRole(role);
	}
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		// Extract form data
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;
		const name = formData.get('name') as string;
		const role = (formData.get('role') as UserRole) || 'STUDENT'; // Default to 'STUDENT' if not provided
		const matric = formData.get('matric') as string | null;
		const level = formData.get('level') as string | null;
		const phone = formData.get('phone') as string | null;
		const department = formData.get('department') as string; // Added department field
		const matricNumber = formData.get('matricNumber') as string; // Added field

		// Validate form data
		const errors: Record<string, string> = {};

		if (!email) {
			errors.email = 'Email is required';
		} else if (!validateEmail(email)) {
			errors.email = 'Invalid email format';
		}

		if (!password) {
			errors.password = 'Password is required';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters';
		}

		if (password !== confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}

		if (!name) {
			errors.name = 'Name is required';
		}

		if (!role || !['ADMIN', 'LECTURER', 'STUDENT'].includes(role)) {
			errors.role = 'Valid role is required';
		}

		// Check if email is already registered
		try {
			if (email) {
				const existingUser = await db.user.findUnique({
					where: { email }
				});

				if (existingUser) {
					errors.email = 'Email is already registered';
				}
			}
		} catch (err) {
			console.error('Error checking existing user:', err);
		}

		// Return errors if any
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				data: Object.fromEntries(formData)
			});
		}

		try {
			// Hash the password
			const hashedPassword = await hashPassword(password);

			console.log('Creating user with data:', {
				email,
				name,
				department,
				matricNumber,
				level,
				role // Log the role to verify it's being captured
			});

			// Create the user
			const user = await db.user.create({
				data: {
					email,
					passwordHash: hashedPassword,
					name,
					department, // Include department field
					role: role // Use the role from the form
				},
				// Select only needed fields for faster response
				select: {
					id: true,
					email: true,
					role: true
				}
			});

			// If the user was created successfully, try to update the matricNumber and level directly with SQL
			try {
				if (matricNumber || level) {
					await db.$executeRaw`
            			UPDATE "User" 
            			SET "matricNumber" = ${matricNumber || null}, "level" = ${level || null}
            			WHERE "id" = ${user.id}
          			`;
					console.log('Added matricNumber and level via raw SQL');
				}
			} catch (sqlError) {
				console.log('Could not set matricNumber/level via SQL:', sqlError);
				// Continue anyway since the user was created
			}

			// Log the successful registration
			console.log(`User registered: ${name} (${email}) with role ${role}`);

			// Return success response instead of redirecting
			return {
				success: true,
				message: 'Registration successful! You can now log in.'
			};
		} catch (error) {
			console.error('Registration error:', error);

			// Return a more detailed error for debugging
			return fail(500, {
				message: 'An error occurred during registration. Please try again later.',
				error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
				data: Object.fromEntries(formData)
			});
		}
	}
};

// Email validation helper
function validateEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

// Redirect helper
function redirectBasedOnRole(role: UserRole): void {
	if (role === 'ADMIN') {
		redirect(302, '/admin');
	} else if (role === 'LECTURER') {
		redirect(302, '/lecturer');
	} else if (role === 'STUDENT') {
		redirect(302, '/student');
	} else {
		redirect(302, '/auth/login');
	}
}
