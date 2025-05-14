<script lang="ts">
	export let title: string | undefined = undefined;
	export let subtitle: string | undefined = undefined;
	export let footer = false;
	export let headerClass = '';
	export let contentClass = '';
	export let footerClass = '';
</script>

<div class="card">
	{#if title || subtitle}
		<div class="card-header {headerClass}">
			{#if title}
				<h3 class="card-title">{title}</h3>
			{/if}
			{#if subtitle}
				<p class="card-description">{subtitle}</p>
			{/if}
		</div>
	{/if}

	<div class="card-content {contentClass}">
		<slot />
	</div>

	{#if footer}
		<div class="card-footer {footerClass}">
			<slot name="footer" />
		</div>
	{/if}
</div>

<style>
	.card {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
		overflow: hidden;
		width: 100%;
	}

	.card-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #f1f1f1;
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: #2d3748;
	}

	.card-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.card-content {
		padding: 1.5rem;
	}

	.card-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #f1f1f1;
		background-color: #fafafa;
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		.card {
			margin-bottom: 1rem;
		}

		.card-content {
			padding: 1.25rem;
		}
	}

	@media (max-width: 480px) {
		.card-header,
		.card-footer {
			padding: 0.75rem 1rem;
		}

		.card-content {
			padding: 1rem;
		}

		.card-title {
			font-size: 1.125rem;
		}
	}
</style>
