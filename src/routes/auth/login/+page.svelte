<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	export let form: ActionData;

	// Handle redirect after successful login
	$: if (form?.success && form?.redirectTo) {
		goto(form.redirectTo);
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Login to your account</h1>
			<p>Enter your credentials below to access your attendance portal</p>
		</div>

		<form method="POST" use:enhance class="auth-form">
			{#if form?.message}
				<div class="error-message">
					{form.message}
				</div>
			{/if}

			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="you@example.com"
					value={form?.data?.email || ''}
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" id="password" name="password" placeholder="••••••••" required />
			</div>

			<div class="form-options">
				<div class="remember-me">
					<input type="checkbox" id="remember" name="remember" />
					<label for="remember">Remember me</label>
				</div>
				<a href="/auth/reset-password" class="forgot-link">Forgot password?</a>
			</div>

			<button type="submit" class="auth-button">Sign In</button>

			<div class="auth-footer">
				Don't have an account? <a href="/auth/register">Register here</a>
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
		max-width: 450px;
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

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		color: #4a5568;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.form-group input {
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		background-color: #f8fafc;
		color: #1a202c;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		height: 45px;
	}

	.form-group input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
	}

	.form-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
	}

	.remember-me {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #4a5568;
	}

	.remember-me input {
		accent-color: #4299e1;
	}

	.forgot-link {
		color: #4299e1;
		text-decoration: none;
		transition: color 0.2s;
	}

	.forgot-link:hover {
		color: #2b6cb0;
		text-decoration: underline;
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
</style>
