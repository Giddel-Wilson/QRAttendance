<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';

	// Page data
	export let data;

	// Destructure data
	const { userProfile, stats, enrolledCourses, upcomingClasses, recentAttendance } = data;

	// Format date using native JavaScript
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<DashboardLayout role="STUDENT" userName={userProfile?.name || 'Student'}>
	<div class="dashboard-stats">
		<div class="stat-card">
			<div class="stat-value">{stats.totalCourses}</div>
			<div class="stat-label">Enrolled Courses</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{stats.attendanceRate}%</div>
			<div class="stat-label">Attendance Rate</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{stats.totalAttendance}</div>
			<div class="stat-label">Classes Attended</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{stats.upcomingClasses}</div>
			<div class="stat-label">Upcoming Classes</div>
		</div>
	</div>

	<div class="dashboard-main">
		<div class="dashboard-section">
			<h2>Enrolled Courses</h2>
			<div class="course-list">
				{#each enrolledCourses as course}
					<div class="course-card">
						<div class="course-header">
							<h3>{course.code}: {course.name}</h3>
							<span
								class="attendance-badge"
								class:high={course.attendanceRate >= 80}
								class:medium={course.attendanceRate >= 60 && course.attendanceRate < 80}
								class:low={course.attendanceRate < 60}
							>
								{course.attendanceRate}%
							</span>
						</div>
						<div class="course-attendance">
							<div class="progress-bar">
								<div class="progress" style="width: {course.attendanceRate}%"></div>
							</div>
							<div class="attendance-text">
								{course.attendance} of {course.totalClasses} classes
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="dashboard-section">
			<h2>Recent Attendance</h2>
			<table class="attendance-table">
				<thead>
					<tr>
						<th>Date</th>
						<th>Course</th>
						<th>Title</th>
						<th>Status</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					{#each recentAttendance as attendance}
						<tr>
							<td>{formatDate(attendance.date)}</td>
							<td>{attendance.course}</td>
							<td>{attendance.title}</td>
							<td>
								<span
									class="status-badge"
									class:present={attendance.status === 'Present'}
									class:absent={attendance.status === 'Absent'}
								>
									{attendance.status}
								</span>
							</td>
							<td>{attendance.time}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</DashboardLayout>

<style>
	/* Keep only the styles relevant to the content, not the layout */
	.dashboard-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
		padding: 1.5rem;
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 600;
		color: #4299e1;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		color: #718096;
		font-size: 0.9rem;
	}

	.dashboard-section {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.dashboard-section h2 {
		font-size: 1.25rem;
		color: #2d3748;
		margin-bottom: 1.25rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.course-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.course-card {
		background-color: #f8fafc;
		border-radius: 6px;
		padding: 1rem;
	}

	.course-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.course-header h3 {
		font-size: 1rem;
		color: #2d3748;
		margin: 0;
	}

	.attendance-badge {
		font-weight: 600;
		font-size: 0.875rem;
		border-radius: 16px;
		padding: 0.25rem 0.75rem;
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
		color: #c53030;
	}

	.progress-bar {
		height: 8px;
		background-color: #e2e8f0;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress {
		height: 100%;
		background-color: #4299e1;
	}

	.attendance-text {
		font-size: 0.875rem;
		color: #718096;
	}

	.schedule-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.schedule-card {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background-color: #f8fafc;
		border-radius: 6px;
	}

	.schedule-time {
		min-width: 110px;
	}

	.schedule-time .time {
		font-weight: 600;
		color: #2d3748;
	}

	.schedule-time .date {
		font-size: 0.875rem;
		color: #718096;
	}

	.schedule-details h3 {
		font-size: 1rem;
		color: #2d3748;
		margin: 0 0 0.25rem 0;
	}

	.venue {
		font-size: 0.875rem;
		color: #718096;
	}

	.attendance-table {
		width: 100%;
		border-collapse: collapse;
	}

	.attendance-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		color: #718096;
		font-weight: 500;
		font-size: 0.875rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.attendance-table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e2e8f0;
		color: #2d3748;
		font-size: 0.875rem;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.status-badge.present {
		background-color: #c6f6d5;
		color: #2f855a;
	}

	.status-badge.absent {
		background-color: #fed7d7;
		color: #c53030;
	}

	@media (max-width: 768px) {
		.dashboard-stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 480px) {
		.dashboard-stats {
			grid-template-columns: 1fr;
		}
	}
</style>
