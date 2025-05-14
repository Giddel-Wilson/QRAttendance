<script lang="ts">
	import '../app.css';
	import '../lib/styles/responsive.css';
</script>

<slot />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		overflow-x: hidden; /* Prevent horizontal scrolling on mobile */
	}

	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(button) {
		cursor: pointer;
	}

	/* Basic responsive image rule */
	:global(img) {
		max-width: 100%;
		height: auto;
	}
</style>
