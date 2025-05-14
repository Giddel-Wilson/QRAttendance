<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import { goto } from '$app/navigation';

	export let data;

	$: ({ sessionDetails, attendanceRecords, courseDetails, userProfile } = data);

	// Format date
	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString();
	}

	// Format time
	function formatTime(dateString) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleTimeString();
	}

	// Calculate statistics
	$: totalStudents = attendanceRecords.length;
	$: presentStudents = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
	$: absentStudents = attendanceRecords.filter((r) => r.status === 'ABSENT').length;
	$: attendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
</script>

<DashboardLayout role="LECTURER" userName={userProfile?.name || 'Lecturer'}>
	<div class="attendance-review">
		<h1 class="page-title">Attendance Session Review</h1>

		<div class="session-details">
			<Card title="Session Information">
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Course:</span>
						<span class="info-value">{courseDetails?.code} - {courseDetails?.name}</span>
					</div>

					<div class="info-item">
						<span class="info-label">Date:</span>
						<span class="info-value">{formatDate(sessionDetails?.date)}</span>
					</div>

					<div class="info-item">
						<span class="info-label">Time:</span>
						<span class="info-value">{formatTime(sessionDetails?.date)}</span>
					</div>

					<div class="info-item">
						<span class="info-label">Location:</span>
						<span class="info-value">{sessionDetails?.topic || 'N/A'}</span>
					</div>
				</div>
			</Card>

			<Card title="Attendance Summary">
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-value">{totalStudents}</div>
						<div class="stat-label">Total Students</div>
					</div>

					<div class="stat-card">
						<div class="stat-value">{presentStudents}</div>
						<div class="stat-label">Present</div>
					</div>

					<div class="stat-card">
						<div class="stat-value">{absentStudents}</div>
						<div class="stat-label">Absent</div>
					</div>

					<div class="stat-card">
						<div class="stat-value">{attendanceRate}%</div>
						<div class="stat-label">Attendance Rate</div>
					</div>
				</div>
			</Card>
		</div>

		<Card title="Attendance Records">
			{#if attendanceRecords.length === 0}
				<div class="empty-state">No attendance records for this session.</div>
			{:else}
				<table class="attendance-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Matric Number</th>
							<th>Level</th>
							<th>Status</th>
							<th>Time</th>
						</tr>
					</thead>
					<tbody>
						{#each attendanceRecords as record}
							<tr class={record.status === 'PRESENT' ? 'present' : 'absent'}>
								<td>{record.student.name}</td>
								<td>{record.student.matricNumber}</td>
								<td>{record.student.level || 'N/A'}</td>
								<td>
									<span class={`status-badge ${record.status.toLowerCase()}`}>
										{record.status}
									</span>
								</td>
								<td>{formatTime(record.timestamp)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</Card>

		<div class="actions">
			<button class="button" on:click={() => goto('/lecturer/records')}> View All Records </button>
			<button class="button primary" on:click={() => goto('/lecturer/attendance')}>
				Back to Attendance
			</button>
		</div>
	</div>
</DashboardLayout>

<style>
	.attendance-review {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.session-details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.875rem;
		color: #718096;
	}

	.info-value {
		font-weight: 500;
		color: #2d3748;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.stat-card {
		padding: 1rem;
		text-align: center;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #4299e1;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #718096;
	}

	.attendance-table {
		width: 100%;
		border-collapse: collapse;
	}

	.attendance-table th,
	.attendance-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #edf2f7;
	}

	.attendance-table th {
		background-color: #f7fafc;
		color: #4a5568;
		font-weight: 500;
	}

	.status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-badge.present {
		background-color: #c6f6d5;
		color: #22543d;
	}

	.status-badge.absent {
		background-color: #fed7d7;
		color: #822727;
	}

	tr.present {
		background-color: #f0fff4;
	}

	tr.absent {
		background-color: #fff5f5;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.button {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid #e2e8f0;
		background-color: white;
	}

	.button.primary {
		background-color: #4299e1;
		color: white;
		border-color: #4299e1;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
	}
</style>
