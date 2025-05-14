<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	const { stats, recentActivities } = data;

	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleString();
	}
</script>

<DashboardLayout role="ADMIN" userName={data.userProfile?.name || 'Administrator'}>
	<div class="admin-dashboard">
		<h1 class="page-title">Admin Dashboard</h1>

		<div class="stats-grid">
			<Card>
				<div class="stat-card">
					<div class="stat-value">{stats.students}</div>
					<div class="stat-label">Students</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-value">{stats.lecturers}</div>
					<div class="stat-label">Lecturers</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-value">{stats.courses}</div>
					<div class="stat-label">Courses</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-value">{stats.attendanceRate}%</div>
					<div class="stat-label">Attendance Rate</div>
				</div>
			</Card>
		</div>

		<div class="dashboard-grid">
			<Card title="Recent Activity">
				{#if recentActivities.length === 0}
					<div class="empty-state">No recent activities found</div>
				{:else}
					<div class="activity-list">
						{#each recentActivities as activity}
							<div class="activity-item">
								<div class="activity-header">
									<span class="activity-user">{activity.user?.name || 'Unknown User'}</span>
									<span class="activity-time">{formatDate(activity.timestamp)}</span>
								</div>
								<div class="activity-action">
									<span class="activity-badge">{activity.action}</span>
									<span class="activity-details"
										>{activity.details || `${activity.entityType} ${activity.entityId}`}</span
									>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>

			<Card title="Quick Actions">
				<div class="actions-grid">
					<a href="/admin/users" class="quick-action">
						<div class="action-icon">👥</div>
						<div class="action-label">Manage Users</div>
					</a>

					<a href="/admin/courses" class="quick-action">
						<div class="action-icon">📚</div>
						<div class="action-label">Manage Courses</div>
					</a>

					<a href="/admin/notifications" class="quick-action">
						<div class="action-icon">🔔</div>
						<div class="action-label">Send Notifications</div>
					</a>

					<a href="/admin/reports" class="quick-action">
						<div class="action-icon">📊</div>
						<div class="action-label">Generate Reports</div>
					</a>
				</div>
			</Card>
		</div>
	</div>
</DashboardLayout>

<style>
	.admin-dashboard {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
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

	.dashboard-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1.5rem;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
	}

	.activity-item {
		padding: 1rem;
		border-bottom: 1px solid #edf2f7;
	}

	.activity-item:last-child {
		border-bottom: none;
	}

	.activity-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.activity-user {
		font-weight: 500;
		color: #4a5568;
	}

	.activity-time {
		font-size: 0.75rem;
		color: #a0aec0;
	}

	.activity-action {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.activity-badge {
		padding: 0.25rem 0.5rem;
		background-color: #edf2f7;
		color: #4a5568;
		border-radius: 9999px;
		font-size: 0.75rem;
	}

	.activity-details {
		font-size: 0.875rem;
		color: #718096;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.quick-action {
		text-decoration: none;
		padding: 1.25rem;
		background-color: #f7fafc;
		border-radius: 0.375rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		transition: background-color 0.2s;
	}

	.quick-action:hover {
		background-color: #edf2f7;
	}

	.action-icon {
		font-size: 1.75rem;
	}

	.action-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
		text-align: center;
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
