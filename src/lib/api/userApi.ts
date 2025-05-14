import type { User } from '../stores/userStore';

/**
 * Fetch user profile data from the server
 */
export async function fetchUserProfile(userId: string): Promise<User> {
	try {
		const response = await fetch(`/api/users/${userId}`);

		if (!response.ok) {
			throw new Error(`Error fetching profile: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Failed to fetch user profile:', error);
		throw error;
	}
}

/**
 * Update user profile data
 */
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
	try {
		const response = await fetch(`/api/users/${userId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			throw new Error(`Error updating profile: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Failed to update user profile:', error);
		throw error;
	}
}
