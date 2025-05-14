<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
</script>

<svelte:head>
	<title>UNIPORT CS Attendance Tracker</title>
</svelte:head>

<Navigation />

<div class="bg-white dark:bg-gray-900">
	<div class="relative isolate overflow-hidden">
		<!-- Hero section background -->
		<div
			class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),white)] opacity-20 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.900),theme(colors.gray.900))]"
		></div>

		<!-- Hero content -->
		<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
			<div class="max-w-2xl">
				<h1
					class="hero-title text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white"
				>
					Class Attendance Tracker
				</h1>
				<p class="hero-subtitle mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
					A modern attendance management system for the Computer Science Department at the
					University of Port Harcourt's Faculty of Computing.
				</p>
				<div class="cta-buttons mt-10 flex items-center gap-x-6">
					<a href="/auth/login" class="btn btn-primary btn-lg"> Sign in </a>
					<a
						href="/auth/register"
						class="text-base font-semibold leading-7 text-gray-900 dark:text-white"
					>
						Create account <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Features section -->
	<div class="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
		<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
			Features
		</h2>
		<div class="feature-grid mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Student features -->
			<div class="card">
				<div class="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						/>
					</svg>
				</div>
				<h3 class="mt-5 text-xl font-semibold text-gray-900 dark:text-white">For Students</h3>
				<p class="mt-2 text-base text-gray-600 dark:text-gray-400">
					Register for courses, scan QR codes for attendance, and track your attendance record with
					detailed analytics.
				</p>
				<ul class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						Course registration management
					</li>
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						QR code scanning for attendance
					</li>
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						Attendance analytics and reports
					</li>
				</ul>
			</div>

			<!-- Lecturer features -->
			<div class="card">
				<div class="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
				</div>
				<h3 class="mt-5 text-xl font-semibold text-gray-900 dark:text-white">For Lecturers</h3>
				<p class="mt-2 text-base text-gray-600 dark:text-gray-400">
					Generate QR codes for attendance, monitor student participation, and gain insights into
					class attendance trends.
				</p>
				<ul class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						Generate timed QR codes for classes
					</li>
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						View and manage student rosters
					</li>
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						Detailed attendance reports and analytics
					</li>
				</ul>
			</div>

			<!-- Admin features -->
			<div class="card">
				<div class="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				</div>
				<h3 class="mt-5 text-xl font-semibold text-gray-900 dark:text-white">For Administrators</h3>
				<p class="mt-2 text-base text-gray-600 dark:text-gray-400">
					Manage courses, assign lecturers, monitor system usage, and access comprehensive auditing
					tools.
				</p>
				<ul class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						User management and role assignment
					</li>
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						Course creation and lecturer assignment
					</li>
					<li class="flex items-center">
						<svg class="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							></path>
						</svg>
						Comprehensive audit logs and system monitoring
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="bg-gray-100 dark:bg-gray-800">
		<div class="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8">
			<div class="md:flex md:items-center md:justify-between">
				<div>
					<p class="text-center text-sm text-gray-500 md:text-left dark:text-gray-400">
						&copy; {new Date().getFullYear()} University of Port Harcourt, Faculty of Computing. All
						rights reserved.
					</p>
				</div>
				<div class="mt-8 flex justify-center md:mt-0">
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Developed for the Computer Science Department
					</p>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.hero-content {
			padding: 2rem 1rem;
		}

		.hero-title {
			font-size: 2rem;
		}

		.feature-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.hero-title {
			font-size: 1.75rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.cta-buttons {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}
	}
</style>
