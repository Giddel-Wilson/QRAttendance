import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	// Get the authenticated user
	const session = await locals.auth.validate();
	if (!session) {
		return {
			records: []
		};
	}

	// Fetch attendance records for the lecturer
	const lecturerId = session.user.userId;
	const records = await prisma.attendanceSession.findMany({
		where: {
			lecturerId: lecturerId
		},
		include: {
			course: true,
			_count: {
				select: {
					attendances: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	return {
		records: records
	};
}) satisfies PageServerLoad;
