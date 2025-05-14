<script lang="ts">
	import { goto } from '$app/navigation';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	// Format date function
	function formatDate(dateStr) {
		if (!dateStr) return 'N/A';
		const date = new Date(dateStr);
		return date.toLocaleDateString();
	}

	// Navigate to session details
	function viewSessionDetails(sessionId) {
		window.location.href = `/lecturer/records/${sessionId}`;
	}
</script>

<DashboardLayout role="LECTURER" userName={data.userProfile?.name || 'Lecturer'}>
	<div class="records-page">
		<h1 class="page-title">Attendance Sessions</h1>

		<!-- Filters Card -->
		<Card>
			<div class="filters-section">
				<h3>Filter Sessions</h3>
				<div class="filters-grid">
					<div class="filter-group">
						<label for="courseFilter">Course:</label>
						<select id="courseFilter" bind:value={data.filters.courseId}>
							<option value="">All Courses</option>
							{#each data.courses as course}
								<option value={course.id}>{course.code} - {course.name}</option>
							{/each}
						</select>
					</div>

					<div class="filter-group">
						<label for="startDate">From:</label>
						<input type="date" id="startDate" bind:value={data.filters.startDate} />
					</div>

					<div class="filter-group">
						<label for="endDate">To:</label>
						<input type="date" id="endDate" bind:value={data.filters.endDate} />
					</div>
				</div>

				<div class="filter-actions">
					<button
						class="button primary"
						on:click={() => {
							const params = new URLSearchParams();
							if (data.filters.courseId) params.append('courseId', data.filters.courseId);
							if (data.filters.startDate) params.append('startDate', data.filters.startDate);
							if (data.filters.endDate) params.append('endDate', data.filters.endDate);
							window.location.href = `/lecturer/records?${params.toString()}`;
						}}>Apply Filters</button
					>
					<button
						class="button secondary"
						on:click={() => {
							window.location.href = '/lecturer/records';
						}}>Reset</button
					>
				</div>
			</div>
		</Card>

		<!-- Sessions Table -->
		<Card>
			{#if data.sessions.length === 0}
				<div class="empty-state">
					<p>No attendance sessions found</p>
					<p>Create a session from the Attendance page to get started</p>
				</div>
			{:else}
				<div class="table-container">
					<table class="sessions-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Course</th>
								<th>Location</th>
								<th>Level</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.sessions as session}
								<tr class="session-row">
									<td>{formatDate(session.date)}</td>
									<td>{session.course?.code || 'Unknown'}</td>
									<td>{session.topic || 'N/A'}</td>
									<td>{session.level || 'All'}</td>
									<td>
										<button class="view-btn" on:click={() => viewSessionDetails(session.id)}>
											View Details
										</button>
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

	.filters-section {
		padding: 1rem;
	}

	.filters-section h3 {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
	}

	.filter-group label {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		color: #4a5568;
	}

	.filter-group select,
	.filter-group input {
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
	}

	.filter-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.button {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
	}

	.button.primary {
		background-color: #4299e1;
		color: white;
	}

	.button.secondary {
		background-color: #e2e8f0;
		color: #4a5568;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
	}

	.table-container {
		overflow-x: auto;
	}

	.sessions-table {
		width: 100%;
		border-collapse: collapse;
	}

	.sessions-table th,
	.sessions-table td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	.sessions-table th {
		font-weight: 500;
		color: #4a5568;
		background-color: #f7fafc;
	}

	.session-row {
		cursor: pointer;
	}

	.session-row:hover {
		background-color: #f7fafc;
	}

	.view-btn {
		padding: 0.25rem 0.5rem;
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.filters-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
