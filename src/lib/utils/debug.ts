import { dev } from '$app/environment';

/**
 * Helper function to log debug information in development mode
 */
export function debugLog(label: string, data: any): void {
	if (dev) {
		console.log(`[DEBUG] ${label}:`, data);
	}
}
