/**
 * Date and time formatting utilities
 */

/**
 * Format a date string to a more readable format
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2023")
 */
export function formatDate(dateString: string | Date): string {
	if (!dateString) return '';

	const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

/**
 * Format a time string to a more readable format
 * @param timeString - Time string to format (e.g., "14:30:00")
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(timeString: string): string {
	if (!timeString) return '';

	// Handle formats like "14:30:00"
	if (timeString.includes(':')) {
		const [hours, minutes] = timeString.split(':');
		const h = parseInt(hours, 10);
		const m = parseInt(minutes, 10);
		const ampm = h >= 12 ? 'PM' : 'AM';
		const hour = h % 12 || 12;

		return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
	}

	return timeString;
}
