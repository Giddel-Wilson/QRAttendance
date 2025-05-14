<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	$: ({ attendanceRecords, attendanceStats, userProfile } = data);

	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	function getStatusClass(status) {
		switch (status) {
			case 'PRESENT':
				return 'status-present';
			case 'ABSENT':
				return 'status-absent';
			case 'LATE':
				return 'status-late';
			default:
				return 'status-unknown';
		}
	}
</script>

<DashboardLayout role="STUDENT" userName={userProfile?.name || 'Student'}>
	<div class="attendance-page">
		<h1 class="page-title">My Attendance Records</h1>

		<div class="scan-button-container">
			<a href="/student/attendance/scan" class="button primary">
				<span class="icon">📷</span>
				Scan QR Code for Attendance
			</a>
		</div>

		<div class="stats-grid">
			<Card>
				<div class="stat-card">
					<div class="stat-value">{attendanceStats.totalClasses}</div>
					<div class="stat-label">Total Classes</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-value">{attendanceStats.presentCount}</div>
					<div class="stat-label">Present</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-value">{attendanceStats.absentCount}</div>
					<div class="stat-label">Absent</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-value">{attendanceStats.attendanceRate}%</div>
					<div class="stat-label">Attendance Rate</div>
				</div>
			</Card>
		</div>

		<Card title="Recent Attendance">
			{#if attendanceRecords.length === 0}
				<div class="empty-state">No attendance records found</div>
			{:else}
				<table class="records-table">
					<thead>
						<tr>
							<th>Course</th>
							<th>Date</th>
							<th>Status</th>
							<th>Recorded</th>
						</tr>
					</thead>
					<tbody>
						{#each attendanceRecords as record}
							<tr>
								<td>
									<div class="course-code">{record.course.code}</div>
									<div class="course-name">{record.course.name}</div>
								</td>
								<td>
									{formatDate(record.session.date)}
								</td>
								<td>
									<span class={`status-badge ${getStatusClass(record.status)}`}>
										{record.status}
									</span>
								</td>
								<td>{formatDate(record.timestamp)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</Card>
	</div>
</DashboardLayout>

<style>
	.attendance-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.scan-button-container {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.button {
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		text-decoration: none;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.button.primary {
		background-color: #4299e1;
		color: white;
	}

	.icon {
		font-size: 1.25rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		padding: 1.25rem;
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
		font-size: 0.875rem;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
	}

	.records-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	.records-table th,
	.records-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #edf2f7;
	}

	.records-table th {
		font-weight: 500;
		color: #4a5568;
		background-color: #f7fafc;
	}

	.course-code {
		font-weight: 500;
		color: #4a5568;
	}

	.course-name {
		font-size: 0.875rem;
		color: #718096;
	}

	.status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-present {
		background-color: #c6f6d5;
		color: #2f855a;
	}

	.status-absent {
		background-color: #fed7d7;
		color: #c53030;
	}

	.status-late {
		background-color: #feebc8;
		color: #c05621;
	}

	.status-unknown {
		background-color: #e2e8f0;
		color: #4a5568;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
