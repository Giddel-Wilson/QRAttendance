<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;
	export let form;

	const { lecturerCount } = data;

	let formData = {
		name: '',
		email: '',
		department: '',
		password: '',
		confirmPassword: ''
	};
</script>

<DashboardLayout role="ADMIN" userName={data.userProfile?.name || 'Administrator'}>
	<div class="create-lecturer-page">
		<div class="page-header">
			<h1>Create Lecturer Account</h1>
			<a href="/admin/courses" class="back-link">Back to Courses</a>
		</div>

		<div class="info-card">
			<Card title="Lecturer Accounts">
				<p>
					You currently have <strong>{lecturerCount}</strong> lecturer account{lecturerCount === 1
						? ''
						: 's'} in the database.
				</p>
			</Card>
		</div>

		<Card title="Create Lecturer Account">
			<form method="POST" action="?/createLecturer" use:enhance>
				<div class="form-group">
					<label for="name">Full Name</label>
					<input type="text" id="name" name="name" bind:value={formData.name} required />
				</div>

				<div class="form-group">
					<label for="email">Email Address</label>
					<input type="email" id="email" name="email" bind:value={formData.email} required />
				</div>

				<div class="form-group">
					<label for="department">Department</label>
					<input type="text" id="department" name="department" bind:value={formData.department} />
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={formData.password}
						required
					/>
				</div>

				<div class="form-group">
					<label for="confirmPassword">Confirm Password</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={formData.confirmPassword}
						required
					/>
				</div>

				{#if formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword}
					<div class="error-message">Passwords do not match</div>
				{/if}

				<div class="form-actions">
					<button
						type="submit"
						class="submit-button"
						disabled={!formData.name ||
							!formData.email ||
							!formData.password ||
							formData.password !== formData.confirmPassword}
					>
						Create Lecturer
					</button>
				</div>

				{#if form?.success}
					<div class="success-message">
						<p>{form.message}</p>
						<div class="account-details">
							<strong>ID:</strong>
							{form.lecturer.id}<br />
							<strong>Name:</strong>
							{form.lecturer.name}<br />
							<strong>Email:</strong>
							{form.lecturer.email}
						</div>
					</div>
				{/if}

				{#if form?.error}
					<div class="error-message">{form.error}</div>
				{/if}
			</form>
		</Card>

		<div class="additional-actions">
			<a href="/admin/users" class="link-button">Manage All Users</a>
		</div>
	</div>
</DashboardLayout>

<style>
	.create-lecturer-page {
		padding: 1rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		font-size: 1.5rem;
		color: #2d3748;
		margin: 0;
	}

	.back-link {
		background-color: #edf2f7;
		color: #4a5568;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.info-card {
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #4a5568;
		font-weight: 500;
	}

	.form-group input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
	}

	.form-actions {
		margin-top: 1.5rem;
	}

	.submit-button {
		background-color: #4299e1;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-weight: 500;
		cursor: pointer;
	}

	.submit-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.success-message {
		margin-top: 1.5rem;
		padding: 1rem;
		background-color: #c6f6d5;
		color: #2f855a;
		border-radius: 0.25rem;
	}

	.account-details {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background-color: #f0fff4;
		border-radius: 0.25rem;
	}

	.error-message {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #fed7d7;
		color: #e53e3e;
		border-radius: 0.25rem;
	}

	.additional-actions {
		margin-top: 1.5rem;
		display: flex;
		justify-content: center;
	}

	.link-button {
		background-color: #f7fafc;
		color: #4a5568;
		border: 1px solid #e2e8f0;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		text-decoration: none;
	}

	@media (max-width: 640px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.back-link {
			width: 100%;
			text-align: center;
		}
	}
</style>
