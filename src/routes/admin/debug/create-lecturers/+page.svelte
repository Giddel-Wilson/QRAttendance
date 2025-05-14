<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;
	export let form;

	const { lecturerCount } = data;
	let count = 3;
</script>

<DashboardLayout role="ADMIN" userName={data.userProfile?.name || 'Administrator'}>
	<div class="debug-page">
		<h1 class="page-title">Create Test Lecturer Accounts</h1>

		<Card title="Current Status">
			<div class="status-info">
				<p>
					You currently have <strong>{lecturerCount}</strong> lecturer account{lecturerCount === 1
						? ''
						: 's'} in the system.
				</p>
			</div>
		</Card>

		<Card title="Create Test Lecturers">
			<form method="POST" action="?/createTestLecturers" use:enhance>
				<div class="form-group">
					<label for="count">Number of test lecturers to create:</label>
					<input type="number" id="count" name="count" bind:value={count} min="1" max="10" />
				</div>

				<div class="info-box">
					<p><strong>Note:</strong> This will create test lecturer accounts with:</p>
					<ul>
						<li>Emails like: lecturer1@example.com</li>
						<li>Default password: password123</li>
						<li>Random departments assigned</li>
					</ul>
				</div>

				<div class="form-actions">
					<button type="submit" class="create-button">Create Test Lecturers</button>
					<a href="/admin/courses" class="back-button">Back to Course Management</a>
				</div>
			</form>

			{#if form?.success}
				<div class="success-message">
					<h3>{form.message}</h3>
					<ul class="lecturers-list">
						{#each form.lecturers as lecturer}
							<li>
								<strong>{lecturer.name}</strong> ({lecturer.email}) - {lecturer.department}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if form?.error}
				<div class="error-message">{form.error}</div>
			{/if}
		</Card>
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

	.status-info {
		padding: 1rem 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #4a5568;
	}

	.form-group input {
		width: 100%;
		max-width: 200px;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
	}

	.info-box {
		background-color: #ebf8ff;
		border-left: 4px solid #4299e1;
		padding: 1rem;
		margin-bottom: 1.5rem;
		border-radius: 0.25rem;
	}

	.info-box p {
		margin: 0 0 0.5rem 0;
	}

	.info-box ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.info-box li {
		margin-bottom: 0.25rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.create-button {
		background-color: #48bb78;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-weight: 500;
		cursor: pointer;
	}

	.back-button {
		background-color: #f7fafc;
		color: #4a5568;
		border: 1px solid #e2e8f0;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-weight: 500;
		text-decoration: none;
	}

	.success-message {
		margin-top: 1.5rem;
		padding: 1rem;
		background-color: #c6f6d5;
		border-radius: 0.25rem;
		color: #2f855a;
	}

	.success-message h3 {
		margin-top: 0;
		margin-bottom: 0.75rem;
		font-size: 1rem;
	}

	.lecturers-list {
		margin: 0;
		padding-left: 1.25rem;
	}

	.lecturers-list li {
		margin-bottom: 0.5rem;
	}

	.error-message {
		margin-top: 1.5rem;
		padding: 1rem;
		background-color: #fed7d7;
		border-radius: 0.25rem;
		color: #c53030;
	}

	@media (max-width: 640px) {
		.form-actions {
			flex-direction: column;
		}

		.create-button,
		.back-button {
			width: 100%;
			text-align: center;
		}
	}
</style>
