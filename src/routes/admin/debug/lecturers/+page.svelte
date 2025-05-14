<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	const { diagnostics, lecturers } = data;

	function formatDate(date) {
		return new Date(date).toLocaleString();
	}
</script>

<DashboardLayout role="ADMIN" userName={data.userProfile?.name || 'Administrator'}>
	<div class="debug-page">
		<h1 class="page-title">Lecturer Accounts Diagnostic</h1>

		<Card title="System Diagnostics">
			<div class="stats">
				<div class="stat-item">
					<div class="stat-label">Total User Accounts:</div>
					<div class="stat-value">{diagnostics.totalUsers || 0}</div>
				</div>

				<div class="stat-item">
					<div class="stat-label">Lecturer Accounts:</div>
					<div class="stat-value">{diagnostics.totalLecturers || 0}</div>
				</div>
			</div>

			{#if diagnostics.error}
				<div class="error-message">
					<div class="error-title">{diagnostics.error}</div>
					<div class="error-detail">{diagnostics.message}</div>
				</div>
			{/if}
		</Card>

		<Card title="Available Lecturers">
			{#if lecturers.length === 0}
				<div class="empty-state">
					<div class="empty-icon">👨‍🏫</div>
					<h3>No lecturer accounts found</h3>
					<p>You need to create lecturer accounts before you can assign courses to them.</p>
					<a href="/admin/users" class="action-link">Create Lecturer Accounts</a>
				</div>
			{:else}
				<div class="table-container">
					<table class="lecturers-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Department</th>
								<th>Created</th>
							</tr>
						</thead>
						<tbody>
							{#each lecturers as lecturer}
								<tr>
									<td>{lecturer.name}</td>
									<td>{lecturer.email}</td>
									<td>{lecturer.department || 'Not set'}</td>
									<td>{formatDate(lecturer.createdAt)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</Card>

		<div class="actions">
			<a href="/admin/users?role=LECTURER" class="button">Manage Lecturer Accounts</a>
			<a href="/admin/courses" class="button">Back to Course Management</a>
		</div>
	</div>
</DashboardLayout>

<style>
	.debug-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.stats {
		display: flex;
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.stat-item {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.stat-label {
		font-weight: 600;
		color: #4a5568;
	}

	.stat-value {
		font-size: 1.25rem;
		color: #2b6cb0;
	}

	.error-message {
		padding: 1rem;
		background-color: #fed7d7;
		border-radius: 0.25rem;
		color: #c53030;
	}

	.error-title {
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: #a0aec0;
	}

	.empty-state h3 {
		color: #4a5568;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #718096;
		margin-bottom: 1.5rem;
	}

	.action-link {
		display: inline-block;
		background-color: #4299e1;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		text-decoration: none;
	}

	.table-container {
		overflow-x: auto;
	}

	.lecturers-table {
		width: 100%;
		border-collapse: collapse;
	}

	.lecturers-table th {
		background-color: #f7fafc;
		color: #4a5568;
		font-weight: 600;
		text-align: left;
		padding: 0.75rem 1rem;
	}

	.lecturers-table td {
		padding: 0.75rem 1rem;
		border-top: 1px solid #edf2f7;
	}

	.actions {
		margin-top: 1.5rem;
		display: flex;
		gap: 1rem;
	}

	.button {
		display: inline-block;
		padding: 0.5rem 1rem;
		background-color: #4299e1;
		color: white;
		text-decoration: none;
		border-radius: 0.25rem;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.stats {
			flex-direction: column;
			gap: 1rem;
		}

		.actions {
			flex-direction: column;
		}

		.button {
			text-align: center;
		}
	}
</style>
