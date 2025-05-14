<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	const { diagnostics } = data;
</script>

<DashboardLayout role="ADMIN" userName="Administrator">
	<div class="db-test-page">
		<h1>Database Diagnostics</h1>

		<Card>
			<div class="overall-status {diagnostics.success ? 'success' : 'error'}">
				<h2>Overall Status: {diagnostics.success ? '✅ Good' : '❌ Issues Detected'}</h2>
				<p>Environment: {diagnostics.nodeEnv}</p>
				<p>Database URL: {diagnostics.dbUrl}</p>
			</div>

			{#if diagnostics.errors.length > 0}
				<div class="errors-section">
					<h3>Errors</h3>
					<ul>
						{#each diagnostics.errors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="tests-section">
				<h3>Test Results</h3>

				<div class="tests-grid">
					{#each diagnostics.tests as test}
						<div class="test-card {test.success ? 'success' : 'failure'}">
							<div class="test-header">
								<h4>{test.name}</h4>
								<span class="test-status">{test.success ? '✅' : '❌'}</span>
							</div>

							{#if test.success}
								<p class="test-result">{test.result}</p>
								{#if test.details}
									<pre class="test-details">{test.details}</pre>
								{/if}
							{:else}
								<p class="test-error">{test.error}</p>
								{#if test.stack}
									<details>
										<summary>Stack Trace</summary>
										<pre class="error-stack">{test.stack}</pre>
									</details>
								{/if}
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="actions">
				<a href="/admin/debug/db-test" class="run-again-button">Run Tests Again</a>
				<a href="/admin/users" class="back-button">Back to User Management</a>
			</div>
		</Card>
	</div>
</DashboardLayout>

<style>
	.db-test-page {
		padding: 1rem;
	}

	h1 {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.overall-status {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.overall-status.success {
		background-color: #c6f6d5;
	}

	.overall-status.error {
		background-color: #fed7d7;
	}

	.overall-status h2 {
		margin-top: 0;
		font-size: 1.25rem;
	}

	.errors-section {
		padding: 1rem;
		background-color: #fed7d7;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.errors-section h3 {
		margin-top: 0;
		color: #c53030;
	}

	.errors-section ul {
		margin-bottom: 0;
	}

	.errors-section li {
		margin-bottom: 0.5rem;
	}

	.tests-section h3 {
		margin-bottom: 1rem;
	}

	.tests-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.test-card {
		padding: 1rem;
		border-radius: 0.5rem;
	}

	.test-card.success {
		background-color: #f0fff4;
		border: 1px solid #c6f6d5;
	}

	.test-card.failure {
		background-color: #fff5f5;
		border: 1px solid #fed7d7;
	}

	.test-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.test-header h4 {
		margin: 0;
		font-size: 1rem;
	}

	.test-status {
		font-size: 1.25rem;
	}

	.test-result {
		color: #2f855a;
		margin: 0.5rem 0;
	}

	.test-error {
		color: #c53030;
		margin: 0.5rem 0;
	}

	.test-details,
	.error-stack {
		background-color: rgba(255, 255, 255, 0.5);
		padding: 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		overflow-x: auto;
		white-space: pre-wrap;
	}

	details {
		margin-top: 0.5rem;
	}

	summary {
		cursor: pointer;
		color: #4a5568;
		font-weight: 500;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.run-again-button,
	.back-button {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		text-decoration: none;
		font-weight: 500;
	}

	.run-again-button {
		background-color: #4299e1;
		color: white;
	}

	.back-button {
		background-color: #f7fafc;
		color: #4a5568;
		border: 1px solid #e2e8f0;
	}

	@media (max-width: 640px) {
		.tests-grid {
			grid-template-columns: 1fr;
		}

		.actions {
			flex-direction: column;
		}

		.run-again-button,
		.back-button {
			text-align: center;
		}
	}
</style>
