<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	const { courses } = data;

	function formatDate(dateString) {
		if (!dateString) return 'No sessions yet';
		return new Date(dateString).toLocaleDateString();
	}
</script>

<DashboardLayout role="LECTURER" userName={data.userProfile?.name || 'Lecturer'}>
	<div class="courses-page">
		<div class="page-header">
			<h1>My Courses</h1>
		</div>

		{#if courses.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📚</div>
				<h2>No Courses Assigned</h2>
				<p>You don't have any courses assigned to you yet. Please contact the administrator.</p>
			</div>
		{:else}
			<div class="courses-grid">
				{#each courses as course}
					<Card>
						<div class="course-header">
							<h2 class="course-code">{course.code}</h2>
							<span
								class="attendance-badge"
								class:high={course.attendanceRate >= 80}
								class:medium={course.attendanceRate >= 60 && course.attendanceRate < 80}
								class:low={course.attendanceRate < 60}
							>
								{course.attendanceRate}% attendance
							</span>
						</div>

						<h3 class="course-name">{course.name}</h3>

						{#if course.description}
							<p class="course-description">{course.description}</p>
						{/if}

						<div class="course-stats">
							<div class="stat">
								<span class="stat-value">{course.studentCount}</span>
								<span class="stat-label">Students</span>
							</div>

							<div class="stat">
								<span class="stat-value">{course.sessionCount}</span>
								<span class="stat-label">Sessions</span>
							</div>

							<div class="stat">
								<span class="stat-value">{formatDate(course.lastSession)}</span>
								<span class="stat-label">Last Session</span>
							</div>
						</div>

						<div class="course-actions">
							<a href={`/lecturer/attendance?courseId=${course.id}`} class="action-button primary">
								Take Attendance
							</a>
							<a href={`/lecturer/students?courseId=${course.id}`} class="action-button secondary">
								View Students
							</a>
							<a href={`/lecturer/records?courseId=${course.id}`} class="action-button secondary">
								View Records
							</a>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</DashboardLayout>

<style>
	.courses-page {
		padding: 1rem;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		font-size: 1.5rem;
		color: #2d3748;
	}

	.courses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		color: #a0aec0;
	}

	.empty-state h2 {
		color: #2d3748;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #718096;
	}

	.course-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.course-code {
		font-size: 1.25rem;
		color: #2d3748;
		margin: 0;
	}

	.attendance-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
	}

	.attendance-badge.high {
		background-color: #c6f6d5;
		color: #2f855a;
	}

	.attendance-badge.medium {
		background-color: #feebc8;
		color: #c05621;
	}

	.attendance-badge.low {
		background-color: #fed7d7;
		color: #e53e3e;
	}

	.course-name {
		font-size: 1rem;
		color: #4a5568;
		margin-top: 0;
		margin-bottom: 0.75rem;
	}

	.course-description {
		color: #718096;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.course-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.stat {
		text-align: center;
		padding: 0.5rem;
	}

	.stat-value {
		display: block;
		font-weight: 600;
		color: #4a5568;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #718096;
	}

	.course-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.action-button {
		flex: 1;
		display: inline-block;
		padding: 0.5rem 0;
		text-align: center;
		border-radius: 0.25rem;
		text-decoration: none;
		font-size: 0.875rem;
		min-width: 100px;
	}

	.action-button.primary {
		background-color: #4299e1;
		color: white;
	}

	.action-button.secondary {
		background-color: #edf2f7;
		color: #4a5568;
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		.courses-grid {
			grid-template-columns: 1fr;
		}

		.course-stats {
			grid-template-columns: 1fr 1fr;
		}

		.course-actions {
			flex-direction: column;
		}

		.action-button {
			width: 100%;
		}
	}
</style>
