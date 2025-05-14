<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="error-container">
	<div class="error-content">
		<div class="error-icon">
			{#if $page.status === 404}🔍{:else}⚠️{/if}
		</div>
		<h1>{$page.status}: {$page.error?.message || 'Error'}</h1>
		<p>{$page.error?.message || 'Something went wrong while processing your request.'}</p>

		<div class="error-actions">
			<a href="/" class="home-link">Go to Home</a>
			<button class="retry-button" on:click={() => window.location.reload()}> Try Again </button>
		</div>
	</div>
</div>

<style>
	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background-color: #f8fafc;
		padding: 1rem;
	}

	.error-content {
		max-width: 500px;
		padding: 2.5rem;
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
		text-align: center;
	}

	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		color: #2d3748;
	}

	p {
		margin: 0 0 1.5rem 0;
		color: #718096;
	}

	.error-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.home-link,
	.retry-button {
		padding: 0.75rem 1.5rem;
		border-radius: 0.375rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
	}

	.home-link {
		background-color: #4299e1;
		color: white;
	}

	.retry-button {
		background-color: #edf2f7;
		color: #4a5568;
		border: 1px solid #e2e8f0;
	}
</style>
