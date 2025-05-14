<script lang="ts">
	export let component: string = 'page';
</script>

<div class="setup-notice">
	<div class="notice-content">
		<div class="notice-icon">🔧</div>
		<h3>Database Setup Required</h3>
		<p>The database tables required for this {component} have not been set up yet.</p>
		<p class="secondary-text">This is normal if you're still setting up your application.</p>

		<div class="action-hint">
			<h4>Next Steps:</h4>
			<ol>
				<li>Ensure your database is properly configured</li>
				<li>Run <code>npx prisma db push</code> to create the tables</li>
				<li>Refresh this page to see your data</li>
			</ol>
		</div>
	</div>
</div>

<style>
	.setup-notice {
		padding: 2rem;
		background-color: #f8fafc;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.notice-content {
		max-width: 600px;
		margin: 0 auto;
	}

	.notice-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	h3 {
		margin-bottom: 1rem;
		color: #2d3748;
		font-size: 1.5rem;
	}

	p {
		margin-bottom: 1rem;
		color: #4a5568;
	}

	.secondary-text {
		font-size: 0.875rem;
		color: #718096;
	}

	.action-hint {
		margin-top: 2rem;
		text-align: left;
		background-color: #ebf8ff;
		padding: 1.5rem;
		border-radius: 6px;
	}

	.action-hint h4 {
		margin-bottom: 1rem;
		color: #2c5282;
	}

	.action-hint ol {
		padding-left: 1.5rem;
	}

	.action-hint li {
		margin-bottom: 0.5rem;
	}

	code {
		background-color: #edf2f7;
		padding: 0.25rem 0.5rem;
		border-radius: 3px;
		font-family: monospace;
	}
</style>
