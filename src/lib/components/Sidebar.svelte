<script context="module">
	// Icon rendering function
	function getIcon(iconName: string): string {
		switch (iconName) {
			case 'dashboard':
				return '📊';
			case 'users':
				return '👥';
			case 'courses':
				return '📚';
			case 'audit':
				return '📋';
			case 'reports':
				return '📈';
			case 'settings':
				return '⚙️';
			case 'qr':
				return '📱';
			case 'camera':
				return '📷';
			case 'profile':
				return '👤';
			default:
				return '•';
		}
	}

	// Add this to handle body overflow
	function toggleBodyOverflow(isVisible) {
		if (typeof document !== 'undefined') {
			if (isVisible) {
				document.body.classList.add('sidebar-open');
			} else {
				document.body.classList.remove('sidebar-open');
			}
		}
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';

	export let role: 'ADMIN' | 'LECTURER' | 'STUDENT';
	export let visible = false; // For mobile toggling

	// Determine which navigation items to show based on user role
	let navItems = [];

	switch (role) {
		case 'ADMIN':
			navItems = [
				{ name: 'Dashboard', path: '/admin', icon: 'dashboard' },
				{ name: 'User Management', path: '/admin/users', icon: 'users' },
				{ name: 'Course Management', path: '/admin/courses', icon: 'courses' },
				{ name: 'Audit Logs', path: '/admin/audit', icon: 'audit' },
				{ name: 'Reports', path: '/admin/reports', icon: 'reports' },
				{ name: 'Settings', path: '/admin/settings', icon: 'settings' }
			];
			break;
		case 'LECTURER':
			navItems = [
				{ name: 'Dashboard', path: '/lecturer', icon: 'dashboard' },
				{ name: 'My Courses', path: '/lecturer/courses', icon: 'courses' },
				{ name: 'Students', path: '/lecturer/students', icon: 'users' }, // Changed from "Student Roster" to "Students"
				{ name: 'Take Attendance', path: '/lecturer/attendance', icon: 'qr' },
				{ name: 'Attendance Records', path: '/lecturer/records', icon: 'audit' },
				{ name: 'Profile', path: '/lecturer/profile', icon: 'profile' }
			];
			break;
		case 'STUDENT':
			navItems = [
				{ name: 'Dashboard', path: '/student', icon: 'dashboard' },
				{ name: 'My Courses', path: '/student/courses', icon: 'courses' },
				{ name: 'Take Attendance', path: '/student/attendance', icon: 'camera' },
				{ name: 'Attendance Records', path: '/student/records', icon: 'audit' },
				{ name: 'Profile', path: '/student/profile', icon: 'profile' }
			];
			break;
	}
</script>

<aside class="sidebar" class:visible>
	<div class="sidebar-header">
		<a href="/" class="logo-link">
			<h1 class="logo-text">Attendance</h1>
		</a>
	</div>

	<nav class="nav-menu">
		<ul class="nav-list">
			{#each navItems as item}
				<li class="nav-item {$page.url.pathname === item.path ? 'active' : ''}">
					<a href={item.path} class="nav-link">
						<span class="nav-icon">{getIcon(item.icon)}</span>
						<span class="nav-text">{item.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="sidebar-footer">
		<form action="/auth/logout" method="POST">
			<button type="submit" class="logout-button">
				<span class="logout-icon">🚪</span>
				<span class="logout-text">Logout</span>
			</button>
		</form>
	</div>
</aside>

<style>
	.sidebar {
		width: 250px;
		height: 100vh; /* Full height of viewport */
		background-color: #ffffff;
		color: #1a202c;
		position: fixed;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		z-index: 100;
		border-right: 1px solid #e2e8f0;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.sidebar-header {
		padding: 16px;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.logo-link {
		text-decoration: none;
		color: inherit;
	}

	.logo-text {
		color: #4299e1;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	.nav-menu {
		flex: 1;
		padding-top: 16px;
	}

	.nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.nav-item {
		margin-bottom: 2px;
	}

	.nav-link {
		display: flex;
		align-items: center;
		padding: 12px 16px;
		color: #4a5568;
		text-decoration: none;
		transition: all 0.2s ease;
		border-radius: 4px;
		margin: 0 8px;
	}

	.nav-link:hover {
		background-color: #edf2f7;
		color: #4299e1;
	}

	.nav-item.active .nav-link {
		background-color: #ebf8ff;
		color: #4299e1;
		font-weight: 500;
	}

	.nav-icon {
		width: 24px;
		height: 24px;
		margin-right: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sidebar-footer {
		padding: 16px;
		border-top: 1px solid #e2e8f0;
		margin-top: auto;
	}

	.logout-button {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px;
		background-color: #f1f5f9;
		border: none;
		border-radius: 4px;
		color: #4a5568;
		cursor: pointer;
		transition: background-color 0.2s;
		font-weight: 500;
	}

	.logout-button:hover {
		background-color: #fee2e2;
		color: #e53e3e;
	}

	.logout-icon {
		margin-right: 12px;
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
			width: 280px;
			box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

			/* Full height styling - remove height: 100% */
			height: 100vh !important; /* Use viewport height */
			min-height: 100vh !important; /* Minimum full viewport height */
			max-height: none; /* Remove max height constraints */

			/* Fix positioning */
			position: fixed;
			inset: 0 auto 0 0; /* shorthand for top right bottom left */

			/* High z-index */
			z-index: 9999;
		}

		/* Ensure content fills the height */
		.nav-menu {
			flex: 1 1 auto;
		}

		.sidebar.visible {
			transform: translateX(0);
		}
	}
</style>
