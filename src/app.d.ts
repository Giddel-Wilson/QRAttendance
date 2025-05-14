// See https://kit.svelte.dev/docs/types#app

import type { UserRole } from '$lib/utils/auth';

declare global {
	namespace App {
		// interface Error {}
		// interface PageData {}
		// interface Platform {}
		interface Locals {
			user: {
				id: string;
				email: string;
				role: UserRole;
				name?: string;
			} | null;
			session: {
				user: {
					id: string;
					email: string;
					role: UserRole;
					name?: string;
				};
				sessionId: string;
				activePeriodExpiresAt: Date;
				idlePeriodExpiresAt: Date;
				state: 'active' | 'idle' | 'grace';
				fresh: boolean;
			} | null;
		}
	}
}

export {};
