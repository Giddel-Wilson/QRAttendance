<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	const { session, attendance, stats } = data;

	// Format date function
	function formatDate(dateStr) {
		if (!dateStr) return 'N/A';
		const date = new Date(dateStr);
		return date.toLocaleDateString();
	}

	// Format time function with absent handling
	function formatTime(dateStr, status) {
		if (!dateStr || status === 'ABSENT') return '--';
		const date = new Date(dateStr);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<DashboardLayout role="LECTURER" userName={data.userProfile?.name || 'Lecturer'}>
	<div class="session-detail-page">
		<div class="page-header">
			<h1 class="page-title">Attendance Details</h1>
			<a href="/lecturer/records" class="back-link">Back to Sessions</a>
		</div>

		<!-- Session Info Card -->
		<Card>
			<div class="session-info">
				<div class="session-header">
					<h2>{session.course?.code}: {session.course?.name}</h2>
					<div class="session-date">{formatDate(session.date)}</div>
				</div>

				<div class="session-meta">
					<div class="meta-item">
						<span class="meta-label">Location:</span>
						<span class="meta-value">{session.topic || 'N/A'}</span>
					</div>
				</div>
			</div>
		</Card>

		<!-- Attendance Summary Card -->
		<Card>
			<h2>Attendance Summary</h2>

			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-title">Attendance Rate</div>
					<div class="stat-value">{stats.attendanceRate}%</div>
				</div>

				<div class="stat-card">
					<div class="stat-title">Present</div>
					<div class="stat-value">{stats.presentCount}/{stats.totalStudents}</div>
				</div>

				<div class="stat-card">
					<div class="stat-title">Absent</div>
					<div class="stat-value">{stats.absentCount}/{stats.totalStudents}</div>
				</div>
			</div>
		</Card>

		<!-- Attendance Records Table -->
		<Card>
			{#if attendance.length === 0}
				<div class="empty-state">
					<p>No students enrolled in this course</p>
				</div>
			{:else}
				<table class="attendance-table">
					<thead>
						<tr>
							<th>Student</th>
							<th>Matric Number</th>
							<th>Level</th>
							<th>Time</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{#each attendance as record}
							<tr class={record.status.toLowerCase()}>
								<td>{record.student.name}</td>
								<td>{record.student.matricNumber}</td>
								<td>{record.student.level}</td>
								<td>{formatTime(record.timestamp, record.status)}</td>
								<td>
									<span class={`status-badge ${record.status.toLowerCase()}`}>
										{record.status}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</Card>
	</div>
</DashboardLayout>

<style>
	.session-detail-page {
		padding: 1rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.page-title {
		margin: 0;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.back-link {
		color: #4299e1;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.session-info {
		padding: 0.5rem;
	}

	.session-header {
		margin-bottom: 1rem;
	}

	.session-header h2 {
		margin: 0 0 0.5rem 0;
		color: #2d3748;
	}

	.session-date {
		color: #718096;
		font-size: 0.875rem;
	}

	.session-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.meta-item {
		margin-bottom: 0.5rem;
	}

	.meta-label {
		font-weight: 500;
		color: #4a5568;
		margin-right: 0.5rem;
	}

	.meta-value {
		color: #2d3748;
	}

	.stats-summary-container {
		margin: 1.5rem 0;
	}

	.summary-card {
		padding: 1rem;
	}

	.summary-title {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.125rem;
		color: #4a5568;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		padding: 1rem;
	}

	.stat-card {
		text-align: center;
	}

	.stat-title {
		color: #718096;
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: 600;
		color: #2d3748;
	}

	.table-container {
		overflow-x: auto;
	}

	.attendance-table {
		width: 100%;
		border-collapse: collapse;
	}

	.attendance-table th,
	.attendance-table td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	.attendance-table th {
		font-weight: 500;
		color: #4a5568;
		background-color: #f7fafc;
	}

	tr.absent {
		background-color: #fff5f5;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-badge.present {
		background-color: #c6f6d5;
		color: #2f855a;
	}

	.status-badge.absent {
		background-color: #fed7d7;
		color: #c53030;
	}

	.status-badge.late {
		background-color: #feebc8;
		color: #c05621;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.session-meta {
			flex-direction: column;
		}
	}
</style>
