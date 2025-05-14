<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;

	// Extract course trends from data
	$: ({ lecturer, stats, courses, recentActivity, attendanceTrends, courseTrends = {} } = data);

	// Format date function
	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTimeAgo(dateString) {
		if (!dateString) return '';

		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 1) {
			return 'today';
		} else if (diffDays === 1) {
			return 'yesterday';
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else if (diffDays < 30) {
			const weeks = Math.floor(diffDays / 7);
			return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
		} else {
			const months = Math.floor(diffDays / 30);
			return `${months} ${months === 1 ? 'month' : 'months'} ago`;
		}
	}

	// Add new function for short date format
	function formatShortDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);

		// Format like "Apr 24"
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}

	// Add state for selected course filter
	let selectedFilter = 'cumulative';

	// Function to handle filter button clicks
	function selectFilter(filter) {
		selectedFilter = filter;
	}

	// Filter attendance trends data based on selected course
	$: filteredTrends = selectedFilter === 'cumulative' 
		? attendanceTrends 
		: courseTrends[selectedFilter] || attendanceTrends;
</script>

<DashboardLayout role="LECTURER" userName={lecturer?.name || 'Lecturer'}>
	<div class="dashboard">
		<div class="dashboard-header">
			<h1 class="page-title">Dashboard</h1>

			<a href="/lecturer/attendance" class="btn-take-attendance">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
					<path d="M18 2l4 4-10 10H8v-4l10-10z"></path>
				</svg>
				Take Attendance
			</a>
		</div>

		<!-- Stats Cards -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon books">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
					</svg>
				</div>
				<div class="stat-content">
					<h3 class="stat-label">Total Courses</h3>
					<p class="stat-value">{stats.totalCourses}</p>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon users">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
						<circle cx="9" cy="7" r="4"></circle>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
					</svg>
				</div>
				<div class="stat-content">
					<h3 class="stat-label">Total Students</h3>
					<p class="stat-value">{stats.totalStudents}</p>
				</div>
			</div>

			<!-- <div class="stat-card">
				<div class="stat-icon chart">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M12 20V10"></path>
						<path d="M18 20V4"></path>
						<path d="M6 20v-4"></path>
					</svg>
				</div>
				<div class="stat-content">
					<h3 class="stat-label">Avg. Attendance</h3>
					<p class="stat-value">{stats.avgAttendance}%</p>
					<p class="stat-detail">from {stats.totalSessions} sessions</p>
				</div>
			</div> -->

			<div class="stat-card">
				<div class="stat-icon calendar">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
				</div>
				<div class="stat-content">
					<h3 class="stat-label">Total Sessions</h3>
					<p class="stat-value">{stats.totalSessions}</p>
				</div>
			</div>

			<!-- <div class="stat-card">
				<div class="stat-icon chart">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="3" y="12" width="4" height="8"></rect>
						<rect x="10" y="8" width="4" height="12"></rect>
						<rect x="17" y="4" width="4" height="16"></rect>
					</svg>
				</div>
				<div class="stat-content">
					<h3 class="stat-label">Total Attendance</h3>
					<p class="stat-value">{stats.totalAttendances || 0}</p>
					<p class="stat-detail">across {stats.totalSessions} sessions</p>
				</div>
			</div> -->
		</div>

		<!-- Main Content -->
		<div class="main-content">
			<!-- Attendance Trends -->
			<Card class="trends-card">
				<div class="card-header">
					<h2 class="section-title">Attendance Trends</h2>
					<p class="subtitle">Attendance rates over the past 30 days</p>
				</div>

				<div class="chart-container">
					<!-- Chart legend -->
					<div class="chart-legend">
						<span class="legend-item">
							<span class="legend-color"></span>
							<span>Attendance Rate (%)</span>
						</span>
					</div>

					<!-- Improved chart visualization with fixed tooltip -->
					<div id="chart" class="chart">
						{#each filteredTrends as point, i}
							<div
								class="chart-bar"
								style="height: {point.rate || 0}%; left: {i * (100 / filteredTrends.length)}%"
								title="{formatDate(point.date)}: {Math.round(point.rate || 0)}% ({point.present || 0} students attended by scanning QR code out of {point.total || 0} enrolled)"
							></div>
						{/each}

						<!-- Chart labels -->
						<div class="chart-labels">
							<span>100%</span>
							<span>75%</span>
							<span>50%</span>
							<span>25%</span>
							<span>0%</span>
						</div>

						<!-- X-axis date labels -->
						<div class="date-labels">
							{#each [0, Math.floor(filteredTrends.length / 4), Math.floor(filteredTrends.length / 2), Math.floor((3 * filteredTrends.length) / 4), filteredTrends.length - 1] as index}
								{#if filteredTrends[index]}
									<span style="left: {index * (100 / filteredTrends.length)}%">
										{formatShortDate(filteredTrends[index].date)}
									</span>
								{/if}
							{/each}
						</div>
					</div>
				</div>

				<div class="filters">
					<div class="filter-label">Filter by active courses:</div>
					<div class="filter-buttons">
						<button
							class="filter-btn {selectedFilter === 'cumulative' ? 'active' : ''}"
							on:click={() => selectFilter('cumulative')}
						>
							Cumulative
						</button>
						{#each courses as course}
							<button
								class="filter-btn {selectedFilter === course.id ? 'active' : ''}"
								on:click={() => selectFilter(course.id)}
							>
								{course.code}
							</button>
						{/each}
					</div>
				</div>
			</Card>

			<!-- Recent Activity -->
			<Card class="activity-card">
				<div class="card-header-with-action">
					<h2 class="section-title">Recent Activity</h2>
					<a href="/lecturer/attendance/history" class="view-all">View all</a>
				</div>

				<p class="subtitle">Latest actions and events</p>

				<div class="activity-list">
					{#if recentActivity.length > 0}
						{#each recentActivity as activity, i}
							<div class="activity-item">
								<div class="activity-icon {activity.type}">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
										<polyline points="22 4 12 14.01 9 11.01"></polyline>
									</svg>
								</div>
								<div class="activity-content">
									<h4 class="activity-title">
										Attendance taken for {activity.courseCode}
									</h4>
									<p class="activity-detail">{formatDate(activity.date)}</p>
									<p class="activity-time">{formatTimeAgo(activity.date)}</p>
								</div>
							</div>
						{/each}
					{:else}
						<div class="empty-state">No recent activity to display</div>
					{/if}
				</div>
			</Card>
		</div>
	</div>
</DashboardLayout>

<style>
	.dashboard {
		padding: 1rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: #2d3748;
		margin: 0;
	}

	.btn-take-attendance {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: #4299e1; /* Changed from purple to blue */
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		text-decoration: none;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.btn-take-attendance:hover {
		background-color: #3182ce; /* Darker shade of blue */
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		background-color: white;
		border-radius: 0.5rem;
		padding: 1.25rem;
		display: flex;
		align-items: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1rem;
		color: white;
		flex-shrink: 0;
	}

	.stat-icon.books {
		background-color: rgba(66, 153, 225, 0.1); /* Blue instead of purple */
		color: #4299e1;
	}

	.stat-icon.users {
		background-color: rgba(79, 209, 197, 0.1);
		color: #4fd1c5;
	}

	.stat-icon.chart {
		background-color: rgba(246, 173, 85, 0.1);
		color: #f6ad55;
	}

	.stat-icon.calendar {
		background-color: rgba(72, 187, 120, 0.1);
		color: #48bb78;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #718096;
		margin: 0 0 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #2d3748;
		margin: 0;
		line-height: 1.2;
	}

	.stat-detail {
		font-size: 0.75rem;
		color: #718096;
		margin: 0.25rem 0 0;
	}

	/* Main Content - restored to original size */
	.main-content {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.card-header {
		margin-bottom: 1rem;
	}

	.card-header-with-action {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #2d3748;
		margin: 0;
	}

	.subtitle {
		font-size: 0.875rem;
		color: #718096;
		margin: 0.25rem 0 1rem;
	}

	.view-all {
		font-size: 0.875rem;
		color: #4299e1; /* Blue instead of purple */
		text-decoration: none;
	}

	/* Attendance Trends Chart - restored height */
	.chart-container {
		height: 350px;
		position: relative;
		margin: 1rem 0;
		padding: 1rem 0.5rem 4rem 3rem; /* Increased bottom padding from 3rem to 4rem */
		overflow: visible; /* Changed from hidden to visible */
	}

	.chart-legend {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.5rem;
		padding-right: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		font-size: 0.75rem;
		color: #718096;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		margin-right: 4px;
		background-color: #4299e1; /* Changed from purple to blue */
		border-radius: 2px;
	}

	.chart {
		height: 100%;
		width: 100%;
		position: relative;
		border-bottom: 1px solid #e2e8f0;
		border-left: 1px solid #e2e8f0;
		background: linear-gradient(to bottom, rgba(226, 232, 240, 0.1) 1px, transparent 1px);
		background-size: 100% 25%;
	}

	.chart-bar {
		position: absolute;
		bottom: 0;
		width: 10px;
		margin-left: -5px;
		background-color: #4299e1; /* Changed from purple to blue */
		border-radius: 3px 3px 0 0;
		transition: height 0.3s ease;
	}

	.chart-labels {
		position: absolute;
		left: -3rem;
		top: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		color: #718096;
		font-size: 0.75rem;
	}

	.date-labels {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -2.5rem; /* Moved down from -2rem to -2.5rem */
		height: 20px;
	}

	.date-labels span {
		position: absolute;
		transform: translateX(-50%);
		font-size: 0.75rem;
		color: #718096;
		white-space: nowrap; /* Prevent wrapping */
	}

	.filters {
		margin-top: 3rem; /* Increased from 2.5rem to 3rem */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-label {
		font-size: 0.875rem;
		color: #4a5568;
		margin-bottom: 0.25rem;
	}

	.filter-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-btn {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		color: #718096;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-btn:hover {
		background-color: #edf2f7;
		border-color: #cbd5e0;
	}

	.filter-btn.active {
		background-color: #4299e1; /* Changed from purple to blue */
		color: white;
		border-color: #4299e1; /* Changed from purple to blue */
		font-weight: 500;
	}

	/* Activity List */
	.activity-list {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.activity-item {
		display: flex;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.activity-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.activity-icon {
		width: 32px;
		height: 32px;
		background-color: rgba(66, 153, 225, 0.1); /* Blue background */
		color: #4299e1; /* Blue icon */
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.activity-content {
		flex: 1;
	}

	.activity-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #2d3748;
		margin: 0;
	}

	.activity-detail {
		font-size: 0.813rem;
		color: #718096;
		margin: 0.25rem 0 0;
	}

	.activity-time {
		font-size: 0.75rem;
		color: #a0aec0;
		margin: 0.25rem 0 0;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
		border: 1px dashed #e2e8f0;
		border-radius: 0.375rem;
	}

	/* Responsive Layout */
	@media (min-width: 768px) {
		.main-content {
			grid-template-columns: 2fr 1fr; /* Restored to original ratio */
		}

		.chart-container {
			padding-right: 1rem; /* Add some space on the right */
		}
	}
</style>
