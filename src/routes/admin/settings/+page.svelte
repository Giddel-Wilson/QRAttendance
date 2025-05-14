<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	// Password form state management
	let showPasswordMessage = false;

	function handlePasswordSubmit() {
		showPasswordMessage = true;
		// Reset the message after some time
		setTimeout(() => {
			showPasswordMessage = false;
		}, 5000);
	}
</script>

<DashboardLayout role="ADMIN" userName="Administrator">
	<div class="settings-page">
		<h1 class="page-title">System Settings</h1>

		<!-- Account Security Card -->
		<Card class="settings-card">
			<h2 class="section-title">Account Security</h2>

			<form
				method="POST"
				action="?/updatePassword"
				use:enhance={({ form }) => {
					return async ({ result, update }) => {
						await update();
						handlePasswordSubmit();
					};
				}}
			>
				<div class="form-section">
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
						<h4>Password Requirements:</h4>
						<ul>
							<li>At least 8 characters</li>
							<li>Includes 3 of: uppercase, lowercase, numbers, symbols</li>
						</ul>
					</div>

					{#if showPasswordMessage}
						{#if form?.passwordSuccess}
							<div class="success-message">Password updated successfully!</div>
						{:else if form?.passwordError}
							<div class="error-message">{form.passwordError}</div>
						{/if}
					{/if}

					<button class="btn-primary" type="submit">Change Password</button>
				</div>
			</form>
		</Card>

		<!-- Applications Settings Card -->
		<Card class="settings-card">
			<h2 class="section-title">Application Settings</h2>

			<div class="coming-soon-notice">
				<p>Application settings features will be available in a future update.</p>
			</div>

			<div class="settings-group">
				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">Allow Student Registration</h3>
						<p class="setting-description">Enable students to register their own accounts</p>
					</div>
					<div class="setting-control">
						<input type="checkbox" id="studentRegistration" disabled />
						<label for="studentRegistration" class="toggle disabled"></label>
					</div>
				</div>

				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">QR Code Expiry</h3>
						<p class="setting-description">Time in minutes before attendance QR codes expire</p>
					</div>
					<div class="setting-control">
						<select disabled>
							<option value="5">5 minutes</option>
							<option value="10" selected>10 minutes</option>
							<option value="15">15 minutes</option>
							<option value="30">30 minutes</option>
						</select>
					</div>
				</div>

				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">Session Auto-Close</h3>
						<p class="setting-description">
							Automatically close attendance sessions after specified time
						</p>
					</div>
					<div class="setting-control">
						<select disabled>
							<option value="30">30 minutes</option>
							<option value="60" selected>1 hour</option>
							<option value="120">2 hours</option>
							<option value="240">4 hours</option>
						</select>
					</div>
				</div>
			</div>
		</Card>

		<!-- System Maintenance Card -->
		<Card class="settings-card">
			<h2 class="section-title">System Maintenance</h2>

			<div class="coming-soon-notice">
				<p>System maintenance features will be available in a future update.</p>
			</div>

			<div class="settings-group">
				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">Database Cleanup</h3>
						<p class="setting-description">Remove old and unused data to optimize performance</p>
					</div>
					<div class="setting-control">
						<button disabled class="btn-secondary disabled">Run Cleanup</button>
					</div>
				</div>

				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">System Logs</h3>
						<p class="setting-description">View and export system logs for troubleshooting</p>
					</div>
					<div class="setting-control">
						<button disabled class="btn-secondary disabled">View Logs</button>
					</div>
				</div>
			</div>
		</Card>

		<!-- Backup & Recovery Card -->
		<Card class="settings-card">
			<h2 class="section-title">Backup & Recovery</h2>

			<div class="coming-soon-notice">
				<p>Backup and recovery features will be available in a future update.</p>
			</div>

			<div class="settings-group">
				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">Create Backup</h3>
						<p class="setting-description">Generate a complete backup of all system data</p>
					</div>
					<div class="setting-control">
						<button disabled class="btn-secondary disabled">Create Backup</button>
					</div>
				</div>

				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">Restore Backup</h3>
						<p class="setting-description">Restore system from a previous backup point</p>
					</div>
					<div class="setting-control">
						<button disabled class="btn-secondary disabled">Restore</button>
					</div>
				</div>

				<div class="setting-item disabled">
					<div class="setting-content">
						<h3 class="setting-title">Schedule Backups</h3>
						<p class="setting-description">Set automatic backup frequency</p>
					</div>
					<div class="setting-control">
						<select disabled>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly">Monthly</option>
						</select>
					</div>
				</div>
			</div>
		</Card>
	</div>
</DashboardLayout>

<style>
	.settings-page {
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.5rem;
		grid-column: 1 / -1;
	}

	.settings-card {
		display: flex;
		flex-direction: column;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 1.25rem;
	}

	.settings-group {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.setting-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.setting-content {
		flex: 1;
	}

	.setting-title {
		font-size: 1rem;
		font-weight: 600;
		color: #2d3748;
		margin: 0 0 0.25rem;
	}

	.setting-description {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
	}

	.setting-control {
		display: flex;
		align-items: center;
	}

	/* Toggle switch styles */
	input[type='checkbox'] {
		display: none;
	}

	.toggle {
		position: relative;
		display: inline-block;
		width: 48px;
		height: 24px;
		background-color: #cbd5e0;
		border-radius: 24px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.toggle:before {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.3s;
	}

	input[type='checkbox']:checked + .toggle {
		background-color: #4299e1;
	}

	input[type='checkbox']:checked + .toggle:before {
		transform: translateX(24px);
	}

	/* Form styles for Account Security */
	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 500px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
	}

	.form-group input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.password-requirements {
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 0.75rem 1rem;
		margin: 0.5rem 0;
	}

	.password-requirements h4 {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #4a5568;
	}

	.password-requirements ul {
		padding-left: 1.25rem;
		margin: 0;
	}

	.password-requirements li {
		font-size: 0.813rem;
		margin-bottom: 0.25rem;
		color: #718096;
	}

	.success-message {
		background-color: #c6f6d5;
		color: #2f855a;
		padding: 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}

	.error-message {
		background-color: #fed7d7;
		color: #c53030;
		padding: 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}

	.btn-primary {
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

	.btn-primary:hover {
		background-color: #3182ce;
	}

	.btn-secondary {
		background-color: #edf2f7;
		color: #4a5568;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-secondary:hover {
		background-color: #e2e8f0;
	}

	select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background-color: white;
		min-width: 120px;
	}

	/* Disabled styles */
	.setting-item.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.toggle.disabled {
		cursor: not-allowed;
	}

	.btn-secondary.disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	select:disabled {
		background-color: #f7fafc;
		cursor: not-allowed;
	}

	/* Coming soon notice */
	.coming-soon-notice {
		padding: 1rem;
		background-color: #ebf8ff;
		color: #4299e1;
		border-radius: 0.375rem;
		margin-bottom: 1.5rem;
	}

	.coming-soon-notice p {
		margin: 0;
		font-weight: 500;
	}

	/* Responsive grid for larger screens */
	@media (min-width: 1024px) {
		.settings-page {
			grid-template-columns: repeat(2, 1fr);
		}

		.page-title {
			grid-column: 1 / -1;
		}
	}
</style>
