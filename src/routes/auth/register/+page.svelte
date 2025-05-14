<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let form: ActionData;

	let selectedRole: 'STUDENT' | 'LECTURER' | 'ADMIN' = 'STUDENT';
	let redirectTimer: ReturnType<typeof setTimeout> | null = null;
	let countdown = 5;

	function selectRole(role: 'STUDENT' | 'LECTURER' | 'ADMIN') {
		selectedRole = role;
	}

	// Set up redirect timer when registration is successful
	$: if (form?.success) {
		countdown = 5;
		startCountdown();
	}

	function startCountdown() {
		redirectTimer = setInterval(() => {
			countdown -= 1;

			if (countdown <= 0) {
				if (redirectTimer) clearInterval(redirectTimer);
				goto('/auth/login');
			}
		}, 1000);
	}

	// Clean up timer on unmount
	onMount(() => {
		return () => {
			if (redirectTimer) clearInterval(redirectTimer);
		};
	});

	// Department options - Faculty of Computing departments
	const departments = ['Computer Science', 'Information Technology', 'CyberSecurity'];

	// Level options
	const levels = ['100', '200', '300', '400', '500'];

	// Role options
	const roles = [
		{ value: 'STUDENT', label: 'Student' },
		{ value: 'LECTURER', label: 'Lecturer' },
		{ value: 'ADMIN', label: 'Administrator' }
	];

	// Function to handle successful registration
	function handleSubmit() {
		return async ({ result }) => {
			if (result.data?.success) {
				// Wait a moment for the user to see the success message
				setTimeout(() => {
					goto('/auth/login?registered=true');
				}, 1500);
			}
		};
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Create an account</h1>
			<p>Complete the form below to register for the attendance system</p>
		</div>

		<form method="POST" use:enhance={handleSubmit} class="auth-form">
			{#if form?.message}
				<div class={form.success ? 'success-message' : 'error-message'}>
					{form.message}
					{#if form.success}
						<div class="redirect-info">
							Redirecting to login page in <span class="countdown">{countdown}</span> seconds...
						</div>
					{/if}
				</div>
			{/if}

			<div class="role-selection">
				<button
					type="button"
					class="role-btn {selectedRole === 'STUDENT' ? 'active' : ''}"
					on:click={() => selectRole('STUDENT')}
				>
					<div class="icon">👨‍🎓</div>
					Student
				</button>

				<button
					type="button"
					class="role-btn {selectedRole === 'LECTURER' ? 'active' : ''}"
					on:click={() => selectRole('LECTURER')}
				>
					<div class="icon">👨‍🏫</div>
					Lecturer
				</button>

				<button
					type="button"
					class="role-btn {selectedRole === 'ADMIN' ? 'active' : ''}"
					on:click={() => selectRole('ADMIN')}
				>
					<div class="icon">👨‍💼</div>
					Admin
				</button>
			</div>

			<input type="hidden" name="role" value={selectedRole} />

			<div class="form-group">
				<label for="name">Full Name</label>
				<input
					type="text"
					id="name"
					name="name"
					placeholder="John Doe"
					value={form?.data?.name || ''}
					required
				/>
				{#if form?.errors?.name}
					<span class="error-text">{form.errors.name}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="you@uniport.edu.ng"
					value={form?.data?.email || ''}
					required
				/>
				{#if form?.errors?.email}
					<span class="error-text">{form.errors.email}</span>
				{/if}
			</div>

			<div class="form-row">
				<div class="form-group flex-1">
					<label for="password">Password</label>
					<input type="password" id="password" name="password" placeholder="••••••••" required />
					{#if form?.errors?.password}
						<span class="error-text">{form.errors.password}</span>
					{/if}
				</div>

				<div class="form-group flex-1">
					<label for="confirmPassword">Confirm Password</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						placeholder="••••••••"
						required
					/>
					{#if form?.errors?.confirmPassword}
						<span class="error-text">{form.errors.confirmPassword}</span>
					{/if}
				</div>
			</div>

			{#if selectedRole === 'STUDENT'}
				<div class="form-row">
					<div class="form-group flex-1">
						<label for="matric">Matriculation Number</label>
						<input
							type="text"
							id="matric"
							name="matric"
							placeholder="U2021/5570123"
							value={form?.data?.matric || ''}
						/>
					</div>

					<div class="form-group flex-1">
						<label for="level">Level</label>
						<select id="level" name="level">
							<option value="">-- Select Level --</option>
							{#each levels as level}
								<option value={level}>{level}L</option>
							{/each}
						</select>
					</div>
				</div>
			{/if}

			<div class="form-group">
				<label for="department">Department</label>
				<select id="department" name="department" required>
					<option value="">-- Select Department --</option>
					{#each departments as dept}
						<option value={dept}>{dept}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="phone">Phone Number</label>
				<input
					type="tel"
					id="phone"
					name="phone"
					placeholder="1234 123 456 7890"
					value={form?.data?.phone || ''}
				/>
			</div>

			<button type="submit" class="auth-button">Create Account</button>

			<div class="auth-footer">
				Already have an account? <a href="/auth/login">Login here</a>
			</div>
		</form>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.auth-card {
		width: 100%;
		max-width: 550px;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		padding: 2rem;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-header h1 {
		font-size: 1.75rem;
		color: #2d3748;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.auth-header p {
		color: #718096;
		font-size: 0.95rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.role-selection {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		gap: 0.5rem;
	}

	.role-btn {
		flex: 1;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.role-btn.active {
		background-color: #ebf8ff;
		border-color: #4299e1;
		color: #2b6cb0;
	}

	.role-btn .icon {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}

	/* Fix for alignment issues */
	.form-row {
		display: flex;
		gap: 1rem;
		align-items: flex-start; /* Ensures top alignment */
	}

	.flex-1 {
		flex: 1;
		min-width: 0; /* Prevents flex items from overflowing */
	}

	/* Make sure all form groups have consistent spacing */
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	/* Ensure consistent input heights */
	.form-group input,
	.form-group select {
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		background-color: #f8fafc;
		color: #1a202c;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		height: 45px; /* Set a fixed height for consistency */
		width: 100%; /* Ensure full width */
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
	}

	.auth-button {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 4px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.auth-button:hover {
		background-color: #3182ce;
	}

	.auth-footer {
		text-align: center;
		margin-top: 1rem;
		font-size: 0.875rem;
		color: #4a5568;
	}

	.auth-footer a {
		color: #4299e1;
		text-decoration: none;
		font-weight: 500;
	}

	.auth-footer a:hover {
		text-decoration: underline;
	}

	.error-message {
		background-color: #fed7d7;
		color: #c53030;
		padding: 0.75rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.success-message {
		background-color: #c6f6d5;
		color: #2f855a;
		padding: 0.75rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.redirect-info {
		font-size: 0.75rem;
		margin-top: 0.5rem;
		font-style: italic;
	}

	.countdown {
		font-weight: bold;
		font-size: 0.85rem;
	}

	.error-text {
		color: #c53030;
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	@media (max-width: 640px) {
		.form-row {
			flex-direction: column;
			gap: 1.5rem;
		}
	}

	select {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 16px;
		margin-top: 5px;
	}
</style>
