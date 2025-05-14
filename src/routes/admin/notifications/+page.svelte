<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;
	export let form;

	const { notifications, userProfile } = data;

	// New notification data
	let newNotification = {
		title: '',
		message: '',
		targetRole: 'ALL'
	};

	// Format date
	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	// Reset form after submission
	function handleSubmit() {
		return async ({ result }) => {
			if (result.type === 'success') {
				newNotification = {
					title: '',
					message: '',
					targetRole: 'ALL'
				};

				setTimeout(() => {
					window.location.reload();
				}, 1000);
			}
		};
	}
</script>

<DashboardLayout role="ADMIN" userName={data.userProfile?.name || 'Administrator'}>
	<div class="notifications-page">
		<h1 class="page-title">Notifications Management</h1>

		<div class="notifications-grid">
			<Card title="Send New Notification">
				<form method="POST" action="?/createNotification" use:enhance={handleSubmit}>
					{#if form?.success}
						<div class="success-message">{form.message}</div>
					{:else if form?.error}
						<div class="error-message">{form.error}</div>
					{/if}

					<div class="form-group">
						<label for="title">Title</label>
						<input
							type="text"
							id="title"
							name="title"
							required
							bind:value={newNotification.title}
							placeholder="Notification Title"
						/>
					</div>

					<div class="form-group">
						<label for="message">Message</label>
						<textarea
							id="message"
							name="message"
							required
							bind:value={newNotification.message}
							rows="5"
							placeholder="Enter notification message here..."
						></textarea>
					</div>

					<div class="form-group">
						<label for="targetRole">Target Recipients</label>
						<select id="targetRole" name="targetRole" bind:value={newNotification.targetRole}>
							<option value="ALL">All Users</option>
							<option value="STUDENT">Students Only</option>
							<option value="LECTURER">Lecturers Only</option>
							<option value="ADMIN">Administrators Only</option>
						</select>
					</div>

					<button type="submit" class="button primary">Send Notification</button>
				</form>
			</Card>

			<Card title="Recent Notifications">
				{#if notifications.length === 0}
					<div class="empty-state">No notifications have been sent yet.</div>
				{:else}
					<div class="notifications-list">
						{#each notifications as notification}
							<div class="notification-item">
								<div class="notification-header">
									<h3>{notification.title}</h3>
									<div class="notification-meta">
										<span class="notification-target">{notification.targetRole}</span>
										<span class="notification-date">{formatDate(notification.createdAt)}</span>
									</div>
								</div>
								<p class="notification-message">{notification.message}</p>
								<div class="notification-stats">
									<span>{notification.readCount} read / {notification.totalCount} recipients</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>
		</div>
	</div>
</DashboardLayout>

<style>
	.notifications-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.notifications-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #4a5568;
		font-size: 0.875rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		font-size: 1rem;
	}

	.button {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid #e2e8f0;
		background-color: white;
		font-size: 1rem;
	}

	.button.primary {
		background-color: #4299e1;
		color: white;
		border-color: #4299e1;
	}

	.success-message {
		padding: 0.75rem;
		background-color: #c6f6d5;
		color: #22543d;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
	}

	.error-message {
		padding: 0.75rem;
		background-color: #fed7d7;
		color: #822727;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
	}

	.notifications-list {
		display: flex;
		flex-direction: column;
	}

	.notification-item {
		padding: 1rem;
		border-bottom: 1px solid #edf2f7;
	}

	.notification-item:last-child {
		border-bottom: none;
	}

	.notification-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.notification-header h3 {
		margin: 0;
		font-size: 1rem;
		color: #2d3748;
	}

	.notification-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.notification-target {
		font-size: 0.75rem;
		color: #4a5568;
		font-weight: 500;
		background-color: #edf2f7;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
	}

	.notification-date {
		font-size: 0.75rem;
		color: #a0aec0;
		margin-top: 0.25rem;
	}

	.notification-message {
		margin: 0 0 0.75rem 0;
		color: #4a5568;
		font-size: 0.875rem;
		white-space: pre-wrap;
	}

	.notification-stats {
		font-size: 0.75rem;
		color: #718096;
		text-align: right;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
	}

	@media (max-width: 768px) {
		.notifications-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
