<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	// Ensure we have default values for everything
	$: ({
		courses = [],
		attendanceRecords = [],
		attendanceStats = {
			totalSessions: 0,
			presentCount: 0,
			absentCount: 0,
			lateCount: 0,
			attendanceRate: 0
		},
		filters = { courseId: '', startDate: '', endDate: '' },
		userProfile
	} = data || {});

	// Set filter state with default values
	let selectedCourseId = filters?.courseId || '';
	let startDate = filters?.startDate || '';
	let endDate = filters?.endDate || '';

	// Check if we arrived from QR scan success
	let showScanSuccess = false;
	onMount(() => {
		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search);
			showScanSuccess = urlParams.get('scan') === 'success';

			if (showScanSuccess) {
				setTimeout(() => {
					showScanSuccess = false;
				}, 5000);
			}
		}
	});

	// Apply filters
	function applyFilters() {
		const params = new URLSearchParams();
		if (selectedCourseId) params.append('courseId', selectedCourseId);
		if (startDate) params.append('startDate', startDate);
		if (endDate) params.append('endDate', endDate);

		window.location.href = `/student/records?${params.toString()}`;
	}

	// Reset filters
	function resetFilters() {
		selectedCourseId = '';
		startDate = '';
		endDate = '';
		window.location.href = '/student/records';
	}

	// Format date for display
	function formatDate(dateStr) {
		if (!dateStr) return 'N/A';
		const date = new Date(dateStr);
		return date.toLocaleString();
	}

	// Status display helpers
	function getStatusClass(status) {
		switch (status) {
			case 'PRESENT':
				return 'status-present';
			case 'ABSENT':
				return 'status-absent';
			case 'LATE':
				return 'status-late';
			default:
				return '';
		}
	}

	function getStatusText(status) {
		return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
	}
</script>

<DashboardLayout role="STUDENT" userName={userProfile?.name || 'Student'}>
	<div class="records-page">
		<h1 class="page-title">Attendance Records</h1>

		<!-- Success message when coming from scan -->
		{#if showScanSuccess}
			<div class="success-message">
				<span class="success-icon">✓</span>
				Attendance marked successfully! Your records have been updated.
			</div>
		{/if}

		<!-- Stats overview -->
		<div class="stats-grid">
			<Card>
				<div class="stat-card">
					<div class="stat-value">{attendanceStats.totalSessions}</div>
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

		<!-- Filters section -->
		<Card>
			<div class="filters-section">
				<h3>Filter Records</h3>
				<div class="filters-grid">
					<div class="filter-group">
						<label for="course-filter">Course:</label>
						<select id="course-filter" bind:value={selectedCourseId}>
							<option value="">All Courses</option>
							{#each courses as course}
								<option value={course.id}>{course.code} - {course.name}</option>
							{/each}
						</select>
					</div>

					<div class="filter-group">
						<label for="start-date">From:</label>
						<input type="date" id="start-date" bind:value={startDate} />
					</div>

					<div class="filter-group">
						<label for="end-date">To:</label>
						<input type="date" id="end-date" bind:value={endDate} />
					</div>

					<div class="filter-actions">
						<button class="button primary" on:click={applyFilters}>Apply Filters</button>
						<button class="button secondary" on:click={resetFilters}>Reset</button>
					</div>
				</div>
			</div>
		</Card>

		<!-- Records table -->
		<Card title="Detailed Attendance Records">
			{#if attendanceRecords.length === 0}
				<div class="empty-state">
					<p>No attendance records found</p>
					<a href="/student/attendance/scan" class="button primary">Scan Attendance QR Code</a>
				</div>
			{:else}
				<div class="records-actions">
					<a href="/student/attendance/scan" class="button primary">Scan Attendance QR Code</a>
				</div>

				<div class="table-container">
					<table class="records-table">
						<thead>
							<tr>
								<th>Date & Time</th>
								<th>Course</th>
								<th>Session</th>
								<th>Lecturer</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each attendanceRecords as record}
								<tr>
									<td>{formatDate(record.timestamp)}</td>
									<td>
										<div class="course-name">{record.course.code}</div>
										<div class="course-details">{record.course.name}</div>
									</td>
									<td>
										<div class="session-title">{record.session.title || 'Class Session'}</div>
										{#if record.session.topic}
											<div class="session-topic">{record.session.topic}</div>
										{/if}
									</td>
									<td>{record.lecturer}</td>
									<td>
										<span class={`status-badge ${getStatusClass(record.status)}`}>
											{getStatusText(record.status)}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</Card>
	</div>
</DashboardLayout>

<style>
	.records-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.success-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background-color: #c6f6d5;
		color: #2f855a;
		border-radius: 0.375rem;
		margin-bottom: 1.5rem;
	}

	.success-icon {
		font-size: 1.25rem;
		font-weight: bold;
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

	.filters-section {
		padding: 0.5rem;
	}

	.filters-section h3 {
		margin-bottom: 1rem;
		color: #4a5568;
	}

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-group label {
		font-size: 0.875rem;
		color: #4a5568;
	}

	.filter-group select,
	.filter-group input {
		padding: 0.5rem;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
	}

	.filter-actions {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.records-actions {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.button {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		border: none;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.button.primary {
		background-color: #4299e1;
		color: white;
	}

	.button.secondary {
		background-color: #e2e8f0;
		color: #4a5568;
	}

	.table-container {
		overflow-x: auto;
	}

	.records-table {
		width: 100%;
		border-collapse: collapse;
	}

	.records-table th,
	.records-table td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #edf2f7;
	}

	.records-table th {
		font-weight: 500;
		background-color: #f7fafc;
		color: #4a5568;
	}

	.course-name {
		font-weight: 500;
	}

	.course-details,
	.session-topic {
		font-size: 0.875rem;
		color: #718096;
	}

	.session-title {
		font-weight: 500;
	}

	.status-badge {
		display: inline-block;
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

	.empty-state {
		padding: 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		color: #a0aec0;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.filters-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
