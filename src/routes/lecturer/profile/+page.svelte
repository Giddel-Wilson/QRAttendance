<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	let { profile } = data;
	let saving = false;
	let changingPassword = false;

	// Department options
	const departments = ['Computer Science', 'Information Technology', 'CyberSecurity'];

	// Form handling with page refresh
	function handleSubmit({ form, data, action, cancel }) {
		saving = true;

		return async ({ result }) => {
			saving = false;
			console.log('Profile update result:', result);

			// Refresh entire page on success
			if (result.type === 'success') {
				window.location.reload();
			}
		};
	}

	// Enhanced password validation
	let newPassword = '';
	let confirmPassword = '';
	let passwordsMatch = true;

	// Password requirements state
	let passwordRequirements = {
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		special: false,
		complexity: false
	};

	// Check password strength and requirements as user types
	function checkPasswordStrength() {
		// Check length
		passwordRequirements.length = newPassword.length >= 8;

		// Check character types
		passwordRequirements.uppercase = /[A-Z]/.test(newPassword);
		passwordRequirements.lowercase = /[a-z]/.test(newPassword);
		passwordRequirements.number = /\d/.test(newPassword);
		passwordRequirements.special = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

		// Count how many requirements are met
		const metCount = [
			passwordRequirements.uppercase,
			passwordRequirements.lowercase,
			passwordRequirements.number,
			passwordRequirements.special
		].filter(Boolean).length;

		// Need at least 3 of 4 character types
		passwordRequirements.complexity = metCount >= 3;

		// Check if passwords match
		if (newPassword && confirmPassword) {
			passwordsMatch = newPassword === confirmPassword;
		} else {
			passwordsMatch = true; // Don't show error until both fields have input
		}
	}

	// Combined validation for form submission
	const isPasswordValid = () =>
		passwordRequirements.length &&
		passwordRequirements.complexity &&
		passwordsMatch &&
		confirmPassword;

	function handlePasswordSubmit({ form, data, action, cancel }) {
		// Check all password requirements before submission
		if (!isPasswordValid()) {
			return cancel(); // Prevent form submission
		}

		changingPassword = true;

		return async ({ result }) => {
			changingPassword = false;
			console.log('Password update result:', result);

			if (result.type === 'success') {
				// Clear password fields
				form.reset();
				newPassword = '';
				confirmPassword = '';

				// Refresh page on success
				window.location.reload();
			}
		};
	}

	// Make sure profile is updated when data changes
	$: if (data.profile) {
		profile = data.profile;
	}
</script>

<DashboardLayout role="LECTURER" userName={profile?.name || 'Lecturer'}>
	<div class="profile-page">
		<h1 class="page-title">My Profile</h1>

		<!-- Success message with improved visibility -->
		{#if form?.success}
			<div class="notification success" role="alert">
				{form.message || 'Profile updated successfully'}
			</div>
		{/if}

		<!-- Error message with improved visibility -->
		{#if form?.error}
			<div class="notification error" role="alert">
				{form.message || 'Failed to update profile'}
			</div>
		{/if}

		<div class="profile-grid">
			<!-- Personal Information Card -->
			<Card class="card personal-info">
				<div class="card-header">
					<h2>Personal Information</h2>
					<p class="subtitle">Update your personal details</p>
				</div>

				<form method="POST" action="?/update" class="form" use:enhance={handleSubmit}>
					<div class="form-grid">
						<div class="form-group">
							<label for="name">Full Name</label>
							<input
								type="text"
								id="name"
								name="name"
								value={profile?.name || ''}
								class="form-control"
								required
							/>
						</div>

						<div class="form-group">
							<label for="title">Title</label>
							<input
								type="text"
								id="title"
								name="title"
								value={profile?.title || ''}
								placeholder="e.g. Prof., Dr., etc."
								class="form-control"
							/>
						</div>

						<div class="form-group">
							<label for="email">Email Address</label>
							<input
								type="email"
								id="email"
								name="email"
								value={profile?.email || ''}
								class="form-control"
								required
							/>
						</div>

						<div class="form-group">
							<label for="phone">Phone Number</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								value={profile?.phone || ''}
								class="form-control"
							/>
						</div>

						<div class="form-group">
							<label for="staffId">Staff ID</label>
							<input
								type="text"
								id="staffId"
								name="staffId"
								value={profile?.staffId || ''}
								class="form-control"
							/>
						</div>

						<div class="form-group">
							<label for="department">Department</label>
							<select id="department" name="department" class="form-control">
								<option value="" disabled>Select Department</option>
								{#each departments as dept}
									<option value={dept} selected={profile?.department === dept}>{dept}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn primary" disabled={saving}>
							{saving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</Card>

			<!-- Security Card with Password Change Form -->
			<Card class="card security">
				<div class="card-header">
					<h2>Security Settings</h2>
					<p class="subtitle">Update your password</p>
				</div>

				<form
					method="POST"
					action="?/changePassword"
					class="form"
					use:enhance={handlePasswordSubmit}
				>
					<div class="form-group password-group">
						<label for="currentPassword">Current Password</label>
						<input
							type="password"
							id="currentPassword"
							name="currentPassword"
							class="form-control"
							required
						/>
					</div>

					<div class="form-group password-group">
						<label for="newPassword">New Password</label>
						<input
							type="password"
							id="newPassword"
							name="newPassword"
							class="form-control"
							required
							minlength="8"
							bind:value={newPassword}
							on:input={checkPasswordStrength}
						/>
					</div>

					<div class="form-group password-group">
						<label for="confirmPassword">Confirm New Password</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							class="form-control"
							required
							minlength="8"
							bind:value={confirmPassword}
							on:input={checkPasswordStrength}
						/>
						{#if !passwordsMatch && confirmPassword}
							<small class="password-mismatch">Passwords do not match</small>
						{/if}
					</div>

					<!-- Password strength indicator -->
					<div class="password-requirements">
						<!-- Length requirement -->
						<div class="requirement {passwordRequirements.length ? 'met' : ''}">
							<span class="indicator">{passwordRequirements.length ? '✓' : ''}</span>
							<span class="req-text">At least 8 characters</span>
						</div>

						<!-- Complexity requirement -->
						<div class="requirement {passwordRequirements.complexity ? 'met' : ''}">
							<span class="indicator">{passwordRequirements.complexity ? '✓' : ''}</span>
							<span class="req-text">Includes 3 of: uppercase, lowercase, numbers, symbols</span>
						</div>

						<!-- Character types grid -->
						<div class="character-types">
							<div class="char-type {passwordRequirements.uppercase ? 'met' : ''}">
								<span class="char-label">Uppercase</span>
								<span class="char-status">{passwordRequirements.uppercase ? '✓' : ''}</span>
							</div>

							<div class="char-type {passwordRequirements.lowercase ? 'met' : ''}">
								<span class="char-label">Lowercase</span>
								<span class="char-status">{passwordRequirements.lowercase ? '✓' : ''}</span>
							</div>

							<div class="char-type {passwordRequirements.number ? 'met' : ''}">
								<span class="char-label">Number</span>
								<span class="char-status">{passwordRequirements.number ? '✓' : ''}</span>
							</div>

							<div class="char-type {passwordRequirements.special ? 'met' : ''}">
								<span class="char-label">Symbol</span>
								<span class="char-status">{passwordRequirements.special ? '✓' : ''}</span>
							</div>
						</div>
					</div>

					{#if form?.passwordError}
						<div class="password-error">
							{form.passwordError}
						</div>
					{/if}

					{#if form?.success && form?.message && form.message.includes('Password')}
						<div class="password-success">
							{form.message}
						</div>
					{/if}

					<div class="form-actions">
						<button
							type="submit"
							class="btn primary change-password-btn"
							disabled={changingPassword || !isPasswordValid()}
						>
							{changingPassword ? 'Updating...' : 'Change Password'}
						</button>
					</div>
				</form>
			</Card>
		</div>
	</div>
</DashboardLayout>

<style>
	.profile-page {
		padding: 1rem;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 1.5rem;
	}

	.notification {
		margin-bottom: 1.5rem;
		padding: 1rem;
		border-radius: 0.375rem;
		font-size: 0.95rem;
		font-weight: 500;
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.notification.success {
		background-color: #c6f6d5;
		color: #2f855a;
		border: 1px solid #9ae6b4;
	}

	.notification.error {
		background-color: #fed7d7;
		color: #c53030;
		border: 1px solid #feb2b2;
	}

	.profile-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.card {
		padding: 1.5rem;
		border-radius: 0.5rem;
		background-color: white;
	}

	.card-header {
		margin-bottom: 1.5rem;
	}

	.card-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #2d3748;
	}

	.subtitle {
		color: #718096;
		font-size: 0.875rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 500;
		color: #4a5568;
		font-size: 0.875rem;
	}

	.form-control {
		padding: 0.625rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		color: #2d3748;
		width: 100%;
	}

	.form-control:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.5);
	}

	.form-actions {
		margin-top: 1.5rem;
		display: flex;
		justify-content: flex-end;
	}

	.btn {
		padding: 0.5rem 1rem;
		font-weight: 500;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn.primary {
		background-color: #4299e1;
		color: white;
		border: none;
	}

	.btn.primary:hover {
		background-color: #3182ce;
	}

	.btn.outline {
		background-color: transparent;
		border: 1px solid #cbd5e0;
		color: #4a5568;
	}

	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.password-group {
		margin-bottom: 1.5rem;
	}

	.password-error {
		color: #c53030;
		font-size: 0.875rem;
		margin: 1rem 0;
		padding: 0.75rem;
		background-color: #fed7d7;
		border-radius: 0.25rem;
	}

	.password-success {
		color: #2f855a;
		font-size: 0.875rem;
		margin: 1rem 0;
		padding: 0.75rem;
		background-color: #c6f6d5;
		border-radius: 0.25rem;
	}

	.change-password-btn {
		background-color: #4299e1;
		padding: 0.6rem 1.25rem;
		font-size: 0.9rem;
		width: 100%;
		margin-top: 0.5rem;
	}

	.password-mismatch {
		color: #e53e3e;
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	.password-requirements {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #f8fafc;
		border-radius: 0.25rem;
		border: 1px solid #e2e8f0;
	}

	.requirement {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.85rem;
	}

	.requirement.met {
		color: #2f855a;
		font-weight: 500;
	}

	.indicator {
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin-right: 0.5rem;
		color: #2f855a;
		font-weight: bold;
	}

	.character-types {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem 1rem;
		margin-top: 0.5rem;
		margin-left: 1.5rem;
		font-size: 0.75rem;
		padding-top: 0.5rem;
		border-top: 1px dashed #e2e8f0;
	}

	.char-type {
		display: flex;
		justify-content: space-between;
		color: #718096;
	}

	.char-type.met {
		color: #2f855a;
	}

	.char-status {
		font-weight: bold;
	}

	@media (min-width: 768px) {
		.profile-grid {
			grid-template-columns: 2fr 1fr;
		}

		.personal-info {
			grid-column: 1;
		}

		.security {
			grid-column: 2;
			grid-row: 1;
		}

		.change-password-btn {
			width: auto;
		}
	}

	@media (max-width: 767px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
