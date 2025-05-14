/**
 * Fetch courses for a lecturer
 */
export async function fetchCourses(lecturerId: string) {
	try {
		const response = await fetch(`/api/lecturers/${lecturerId}/courses`);

		if (!response.ok) {
			throw new Error(`Error fetching courses: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Failed to fetch courses:', error);
		throw error;
	}
}
