import { writable } from 'svelte/store';

// Define user type
export type User = {
	id: string;
	name: string;
	email: string;
	role: 'ADMIN' | 'LECTURER' | 'STUDENT';
	department?: string;
	phone?: string;
	matric?: string;
	level?: string;
	createdAt?: Date;
};

// Create a writable store with default null value
const createUserStore = () => {
	const { subscribe, set, update } = writable<User | null>(null);

	return {
		subscribe,
		setUser: (userData: User) => set(userData),
		updateUser: (userData: Partial<User>) =>
			update((user) => {
				if (user) {
					return { ...user, ...userData };
				}
				return user;
			}),
		clearUser: () => set(null)
	};
};

export const user = createUserStore();
