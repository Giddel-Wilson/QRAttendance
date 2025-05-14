import { db } from '$lib/database';
import type { Actions } from './$types';

export const actions: Actions = {
	updateUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const role = data.get('role') as string;
		const matricNumber = data.get('matricNumber') as string;
		const level = data.get('level') as string;

		if (!id || !name || !email || !role || !matricNumber || !level) {
			return {
				status: 400,
				body: {
					error: 'All fields are required'
				}
			};
		}

		try {
			await db.user.update({
				where: { id },
				data: {
					name,
					email,
					role,
					matricNumber,
					level
				}
			});

			return {
				status: 200,
				body: {
					message: 'User updated successfully'
				}
			};
		} catch (err) {
			return {
				status: 500,
				body: {
					error: 'An error occurred while updating the user'
				}
			};
		}
	}
};
