<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	$: ({ user } = data);
</script>

<DashboardLayout role="STUDENT" userName={user?.name || 'Student'}>
	<div class="profile-container">
		<h1 class="page-title">My Profile</h1>

		<div class="profile-layout">
			<!-- Profile Information Card -->
			<Card class="profile-card">
				<h2 class="card-title">Profile Information</h2>
				<p class="description">View and update your personal information</p>

				<form method="POST" action="?/updateProfile" use:enhance class="form">
					<div class="form-group">
						<label for="name">Full Name</label>
						<input type="text" id="name" name="name" value={user?.name || ''} />
					</div>

					<div class="form-group">
						<label for="email">Email Address</label>
						<input 
							type="email" 
							id="email" 
							name="email" 
							value={user?.email || ''} 
							readonly 
							class="readonly"
						/>
						<span class="helper-text">Email cannot be changed</span>
					</div>

					<div class="form-group">
						<label for="matricNumber">Matric Number</label>
						<input 
							type="text" 
							id="matricNumber" 
							name="matricNumber" 
							value={user?.matricNumber || ''} 
							readonly 
							class="readonly"
						/>
						<span class="helper-text">Matric number cannot be changed</span>
					</div>

					<div class="form-group">
						<label for="level">Level</label>
						<input 
							type="text" 
							id="level" 
							name="level" 
							value={user?.level || ''} 
							readonly 
							class="readonly"
						/>
						<span class="helper-text">Level is assigned by administrators</span>
					</div>

					<div class="form-group">
						<label for="department">Department</label>
						<input 
							type="text" 
							id="department" 
							name="department" 
							value={user?.department || ''} 
							readonly 
							class="readonly"
						/>
						<span class="helper-text">Department can only be modified by administrators</span>
					</div>

					{#if form?.success}
						<div class="success-message">Profile updated successfully!</div>
					{:else if form?.error}
						<div class="error-message">{form.error}</div>
					{/if}

					<button class="btn-submit" type="submit">Update Profile</button>
				</form>
			</Card>

			<!-- Security Settings Card -->
			<Card class="security-card">
				<h2 class="card-title">Security Settings</h2>
				<p class="description">Update your password</p>

				<form method="POST" action="?/updatePassword" use:enhance class="form">
					<div class="form-group">
						<label for="currentPassword">Current Password</label>
						<input type="password" id="currentPassword" name="currentPassword" required />
					</div>

					<div class="form-group">
						<label for="newPassword">New Password</label>
						<input type="password" id="newPassword" name="newPassword" required />
					</div>

					<div class="form-group">
						<label for="confirmPassword">Confirm New Password</label>
						<input type="password" id="confirmPassword" name="confirmPassword" required />
					</div>

					<div class="password-requirements">
						<p>At least 8 characters</p>
						<p>Includes 3 of: uppercase, lowercase, numbers, symbols</p>
						
						<div class="requirement-grid">
							<span>Uppercase</span>
							<span>Lowercase</span>
							<span>Number</span>
							<span>Symbol</span>
						</div>
					</div>

					{#if form?.passwordSuccess}
						<div class="success-message">Password updated successfully!</div>
					{:else if form?.passwordError}
						<div class="error-message">{form.passwordError}</div>
					{/if}

					<button class="btn-submit" type="submit">Change Password</button>
				</form>
			</Card>
		</div>
	</div>
</DashboardLayout>

<style>
	.profile-container {
		padding: 1rem;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 1.5rem;
	}

	.profile-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.profile-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #2d3748;
		margin: 0 0 0.5rem;
	}

	.description {
		color: #718096;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
	}

	input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 1px #4299e1;
	}

	.readonly {
		background-color: #f7fafc;
		color: #718096;
		cursor: not-allowed;
	}

	.helper-text {
		font-size: 0.75rem;
		color: #718096;
	}

	.success-message {
		background-color: #c6f6d5;
		color: #2f855a;
		padding: 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.error-message {
		background-color: #fed7d7;
		color: #c53030;
		padding: 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.btn-submit {
		background-color: #4299e1;
		color: white;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		align-self: flex-start;
		margin-top: 0.5rem;
	}

	.btn-submit:hover {
		background-color: #3182ce;
	}

	.password-requirements {
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 0.75rem;
		font-size: 0.75rem;
		color: #4a5568;
	}

	.requirement-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
</style>
