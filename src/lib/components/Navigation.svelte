<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let userRole: 'ADMIN' | 'LECTURER' | 'STUDENT' | undefined = undefined;

	let isDarkMode = false;
	let isMobileMenuOpen = false;

	// Toggle dark mode
	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	// Toggle mobile menu
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Initialize theme from localStorage
	onMount(() => {
		const theme = localStorage.getItem('theme');
		if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			isDarkMode = true;
			document.documentElement.classList.add('dark');
		} else {
			isDarkMode = false;
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<header class="bg-white shadow transition-colors duration-300 dark:bg-gray-800">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<a href="/" class="flex items-center">
						<span class="text-xl font-bold text-blue-600 dark:text-blue-400">UNIPORT CS</span>
						<span class="ml-2 text-gray-700 dark:text-gray-300">Attendance</span>
					</a>
				</div>
				<div class="hidden md:ml-10 md:block">
					<div class="flex items-baseline space-x-4">
						{#if userRole === 'ADMIN'}
							<a
								href="/admin"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Dashboard</a
							>
							<a
								href="/admin/users"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>User Management</a
							>
							<a
								href="/admin/courses"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Courses</a
							>
							<a
								href="/admin/audit"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Audit Logs</a
							>
						{:else if userRole === 'LECTURER'}
							<a
								href="/lecturer"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Dashboard</a
							>
							<a
								href="/lecturer/courses"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>My Courses</a
							>
							<a
								href="/lecturer/students"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Students</a
							>
							<a
								href="/lecturer/attendance"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Attendance</a
							>
						{:else if userRole === 'STUDENT'}
							<a
								href="/student"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Dashboard</a
							>
							<a
								href="/student/courses"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>My Courses</a
							>
							<a
								href="/student/attendance"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Attendance</a
							>
							<a
								href="/student/scan"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Scan QR</a
							>
						{/if}
					</div>
				</div>
			</div>
			<div class="hidden md:block">
				<div class="ml-4 flex items-center md:ml-6">
					<!-- Theme toggle -->
					<button
						on:click={toggleDarkMode}
						class="rounded-md p-2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
						aria-label="Toggle dark mode"
					>
						{#if isDarkMode}
							<!-- Sun icon for light mode -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<!-- Moon icon for dark mode -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
							</svg>
						{/if}
					</button>

					<!-- Profile dropdown -->
					{#if userRole}
						<div class="relative ml-3">
							<a
								href="/auth/profile"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Profile</a
							>
							<form action="/auth/logout" method="POST" class="inline-block">
								<button
									type="submit"
									class="rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
									>Logout</button
								>
							</form>
						</div>
					{:else}
						<div class="relative ml-3">
							<a
								href="/auth/login"
								class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Login</a
							>
							<a
								href="/auth/register"
								class="ml-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
								>Register</a
							>
						</div>
					{/if}
				</div>
			</div>
			<div class="-mr-2 flex md:hidden">
				<!-- Mobile menu button -->
				<button
					on:click={toggleMobileMenu}
					class="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none dark:bg-gray-800 dark:hover:bg-gray-700"
					aria-label="Open main menu"
				>
					<span class="sr-only">Open main menu</span>
					<!-- Menu icon -->
					<svg
						class:hidden={isMobileMenuOpen}
						class="h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
					<!-- X icon -->
					<svg
						class:hidden={!isMobileMenuOpen}
						class="h-6 w-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if isMobileMenuOpen}
		<div class="md:hidden">
			<div class="space-y-1 px-2 pb-3 pt-2 sm:px-3">
				{#if userRole === 'ADMIN'}
					<a
						href="/admin"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Dashboard</a
					>
					<a
						href="/admin/users"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>User Management</a
					>
					<a
						href="/admin/courses"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Courses</a
					>
					<a
						href="/admin/audit"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Audit Logs</a
					>
				{:else if userRole === 'LECTURER'}
					<a
						href="/lecturer"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Dashboard</a
					>
					<a
						href="/lecturer/courses"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>My Courses</a
					>
					<a
						href="/lecturer/students"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Students</a
					>
					<a
						href="/lecturer/attendance"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Attendance</a
					>
				{:else if userRole === 'STUDENT'}
					<a
						href="/student"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Dashboard</a
					>
					<a
						href="/student/courses"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>My Courses</a
					>
					<a
						href="/student/attendance"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Attendance</a
					>
					<a
						href="/student/scan"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Scan QR</a
					>
				{:else}
					<a
						href="/auth/login"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Login</a
					>
					<a
						href="/auth/register"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
						>Register</a
					>
				{/if}
			</div>
			<div class="border-t border-gray-200 pb-3 pt-4 dark:border-gray-700">
				<div class="flex items-center px-5">
					<button
						on:click={toggleDarkMode}
						class="rounded-md p-2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
						aria-label="Toggle dark mode"
					>
						{#if isDarkMode}
							<!-- Sun icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<!-- Moon icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
							</svg>
						{/if}
					</button>
					{#if userRole}
						<div class="ml-3">
							<a
								href="/auth/profile"
								class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>Profile</a
							>
							<form action="/auth/logout" method="POST" class="inline-block">
								<button
									type="submit"
									class="block rounded-md px-3 py-2 text-base font-medium text-red-600 transition-colors duration-200 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
									>Logout</button
								>
							</form>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</header>
