<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import NotificationBell from './NotificationBell.svelte';
	import { onMount } from 'svelte';

	export let role: 'ADMIN' | 'LECTURER' | 'STUDENT';
	export let userName: string = '';

	// Mobile menu toggle for sidebar
	let sidebarVisible = false;

	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}

	// State
	let notifications = [];
	let unreadCount = 0;

	// Get current route
	let currentRoute = '';

	// Fetch notifications
	async function fetchNotifications() {
		try {
			const response = await fetch('/api/notifications');
			if (response.ok) {
				const data = await response.json();
				notifications = data.notifications || [];
				unreadCount = notifications.filter((n) => !n.read).length;
			}
		} catch (err) {
			console.error('Error fetching notifications:', err);
		}
	}

	// On mount
	onMount(() => {
		currentRoute = window.location.pathname;
		fetchNotifications();

		// Poll for new notifications every minute
		const interval = setInterval(fetchNotifications, 60000);
		return () => clearInterval(interval);
	});

	// Add state for logout modal
	let showLogoutModal = false;

	// Function to show logout confirmation modal
	function showLogoutConfirmation(event) {
		event.preventDefault();
		showLogoutModal = true;
	}

	// Function to cancel logout
	function cancelLogout() {
		showLogoutModal = false;
	}

	// Function to confirm and perform logout - use direct navigation
	function confirmLogout() {
		// Use direct navigation to the GET endpoint
		window.location.href = '/auth/logout';
	}
</script>

<div class="layout">
	<Sidebar {role} visible={sidebarVisible} />

	<div class="sidebar-overlay" class:visible={sidebarVisible} on:click={toggleSidebar}></div>

	<main class="content">
		<header class="header">
			<button class="menu-toggle" on:click={toggleSidebar}>
				<span class="menu-icon">≡</span>
			</button>
			<div class="welcome-text">Welcome, {userName}</div>
			<div class="header-actions">
				<!-- Notification Bell -->
				<NotificationBell 
					{notifications}
					{unreadCount}
					userRole={role}
				/>
			</div>
		</header>

		<div class="main-content">
			<slot />
		</div>
	</main>
</div>

<!-- Find the logout link in your sidebar/navigation and update it with the onClick handler -->
<!-- Something like: -->
<a href="/auth/logout" on:click|preventDefault={showLogoutConfirmation} class="sidebar-link">
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="nav-icon">
		<!-- logout icon svg path -->
	</svg>
	<span>Log out</span>
</a>

<!-- Add the logout confirmation modal -->
{#if showLogoutModal}
	<div class="modal-overlay">
		<div class="modal-container">
			<div class="modal-header">
				<h2>Confirm Logout</h2>
			</div>
			<div class="modal-content">
				<p>Are you sure you want to log out?</p>
			</div>
			<div class="modal-actions">
				<button class="btn-cancel" on:click={cancelLogout}>Cancel</button>
				<button class="btn-confirm" on:click={confirmLogout}>Log Out</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.layout {
		display: flex;
		min-height: 100vh;
		background-color: #f8fafc;
		position: relative;
	}

	.content {
		flex: 1;
		margin-left: 250px;
		display: flex;
		flex-direction: column;
		transition: margin-left 0.3s;
	}

	.header {
		height: 64px;
		background-color: #ffffff;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
	}

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #4a5568;
		cursor: pointer;
		margin-right: 10px;
	}

	.welcome-text {
		font-size: 1.125rem;
		font-weight: 500;
		color: #1a202c;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.notification-button,
	.profile-button {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}

	.notification-button:hover,
	.profile-button:hover {
		background-color: #f7fafc;
	}

	.main-content {
		padding: 24px;
		flex: 1;
	}

	.sidebar-overlay {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 90;
	}

	.sidebar-overlay.visible {
		display: block;
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.content {
			margin-left: 0;
		}

		.menu-toggle {
			display: block;
		}

		.header {
			padding: 0 16px;
		}

		.main-content {
			padding: 16px;
		}
	}

	@media (max-width: 480px) {
		.welcome-text {
			font-size: 1rem;
			max-width: 150px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.notification-button,
		.profile-button {
			width: 34px;
			height: 34px;
			font-size: 1.1rem;
		}
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-container {
		background-color: white;
		border-radius: 0.5rem;
		width: 400px;
		max-width: 90%;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.modal-header {
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #2d3748;
	}

	.modal-content {
		padding: 1.5rem 1rem;
		text-align: center;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		padding: 1rem;
		gap: 0.5rem;
		border-top: 1px solid #e2e8f0;
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		background-color: #e2e8f0;
		color: #4a5568;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.btn-confirm {
		padding: 0.5rem 1rem;
		background-color: #f56565;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.nav-icon {
		/* Fix the issue with extra space */
		width: 20px;  /* Set a fixed width */
		height: 20px; /* Set a fixed height */
		flex-shrink: 0; /* Prevent shrinking */
		display: inline-flex; /* Better alignment */
		align-items: center;
		justify-content: center;
	}

	/* Target empty SVG elements that might be causing space issues */
	svg.nav-icon:empty {
		display: none; /* Hide empty SVGs */
	}
</style>
