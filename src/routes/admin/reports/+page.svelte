<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	export let data;
	
	$: reportData = data.reportData || {
	  userStats: { total: 0, students: 0, lecturers: 0, admins: 0 },
	  courseStats: { total: 0, avgStudentsPerCourse: 0, withoutLecturers: 0, withoutStudents: 0 },
	  attendanceStats: { 
		totalSessions: 0, 
		totalAttendances: 0, 
		overallRate: 0, 
		courseBreakdown: [],
		dateRange: { start: '', end: '' }
	  },
	  recentActivity: []
	};
	
	// Time filter state
	let startDate = data.timeFilters?.startDate || getDefaultStartDate();
	let endDate = data.timeFilters?.endDate || getDefaultEndDate();
	let timeFilterPreset = 'last30days';
	
	// Helper functions for dates
	function getDefaultStartDate() {
	  const date = new Date();
	  date.setDate(date.getDate() - 30);
	  return date.toISOString().split('T')[0];
	}
	
	function getDefaultEndDate() {
	  return new Date().toISOString().split('T')[0];
	}
	
	function formatDate(dateString) {
	  if (!dateString) return 'N/A';
	  const date = new Date(dateString);
	  return date.toLocaleDateString();
	}
	
	// Apply time filter presets
	function applyPreset(preset) {
	  // Declare with 'let' instead of 'const' to allow reassignment
	  let endD = new Date();
	  let startD = new Date();
	  
	  timeFilterPreset = preset;
	  
	  switch(preset) {
		case 'last7days':
		  startD.setDate(endD.getDate() - 7);
		  break;
		case 'last30days':
		  startD.setDate(endD.getDate() - 30);
		  break;
		case 'last90days':
		  startD.setDate(endD.getDate() - 90);
		  break;
		case 'thisMonth':
		  startD = new Date(endD.getFullYear(), endD.getMonth(), 1);
		  break;
		case 'lastMonth':
		  startD = new Date(endD.getFullYear(), endD.getMonth() - 1, 1);
		  endD = new Date(endD.getFullYear(), endD.getMonth(), 0); // This was the issue
		  break;
		case 'thisYear':
		  startD = new Date(endD.getFullYear(), 0, 1);
		  break;
		default:
		  // Custom range, don't change dates
		  return;
	  }
	  
	  startDate = startD.toISOString().split('T')[0];
	  endDate = endD.toISOString().split('T')[0];
	}
	
	// Apply date filter and reload data
	function applyDateFilter() {
	  const url = new URL(window.location.href);
	  url.searchParams.set('startDate', startDate);
	  url.searchParams.set('endDate', endDate);
	  goto(url.toString());
	}
	
	// Chart rendering
	let chartCanvas;
	let pieChartCanvas;
	
	onMount(async () => {
	  if (typeof window !== 'undefined') {
		// Import Chart.js dynamically when in browser
		const ChartModule = await import('chart.js/auto');
		const Chart = ChartModule.default;
		
		// Initialize bar chart for attendance rates
		if (chartCanvas && reportData.attendanceStats.courseBreakdown.length > 0) {
		  const ctx = chartCanvas.getContext('2d');
		  
		  const labels = reportData.attendanceStats.courseBreakdown.map(c => c.courseCode);
		  const rates = reportData.attendanceStats.courseBreakdown.map(c => c.attendanceRate);
		  
		  new Chart(ctx, {
			type: 'bar',
			data: {
			  labels: labels,
			  datasets: [{
				label: 'Attendance Rate (%)',
				data: rates,
				backgroundColor: '#4299e1',
				borderColor: '#3182ce',
				borderWidth: 1
			  }]
			},
			options: {
			  scales: {
				y: {
				  beginAtZero: true,
				  max: 100,
				  title: {
					display: true,
					text: 'Percentage (%)'
				  }
				},
				x: {
				  title: {
					display: true,
					text: 'Course Code'
				  }
				}
			  },
			  plugins: {
				title: {
				  display: true,
				  text: 'Attendance Rates by Course'
				}
			  },
			  responsive: true,
			  maintainAspectRatio: false
			}
		  });
		}
		
		// Initialize pie chart for student distribution
		if (pieChartCanvas && reportData.attendanceStats.courseBreakdown.length > 0) {
		  const ctx = pieChartCanvas.getContext('2d');
		  
		  const labels = reportData.attendanceStats.courseBreakdown.map(c => c.courseCode);
		  const data = reportData.attendanceStats.courseBreakdown.map(c => c.studentCount);
		  
		  // Generate distinct colors
		  const colors = reportData.attendanceStats.courseBreakdown.map((_, i) => {
			const hue = (i * 137) % 360; // Using golden ratio for good distribution
			return `hsl(${hue}, 70%, 60%)`;
		  });
		  
		  new Chart(ctx, {
			type: 'pie',
			data: {
			  labels: labels,
			  datasets: [{
				data: data,
				backgroundColor: colors,
				borderWidth: 1
			  }]
			},
			options: {
			  plugins: {
				title: {
				  display: true,
				  text: 'Student Distribution by Course'
				},
				legend: {
				  position: 'right'
				}
			  },
			  responsive: true,
			  maintainAspectRatio: false
			}
		  });
		}
	  }
	});
  </script>
  
  <DashboardLayout role="ADMIN" userName="Administrator">
	<div class="reports-page">
	  <div class="page-header">
		<h1>Admin Reports</h1>
		
		<div class="report-actions">
		  <button class="btn-export" on:click={() => window.print()}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M6 9L6 2L18 2L18 9"></path>
			  <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18"></path>
			  <path d="M18 14H6V22H18V14Z"></path>
			</svg>
			Print Report
		  </button>
		</div>
	  </div>
	  
	  <!-- Date filter controls -->
	  <Card class="time-filter-card">
		<h2 class="filter-title">Filter by Time Period</h2>
		
		<div class="time-filter-controls">
		  <div class="date-inputs">
			<div class="date-field">
			  <label for="startDate">Start Date</label>
			  <input 
				type="date" 
				id="startDate" 
				bind:value={startDate} 
				max={endDate}
			  />
			</div>
			
			<div class="date-field">
			  <label for="endDate">End Date</label>
			  <input 
				type="date" 
				id="endDate" 
				bind:value={endDate} 
				min={startDate}
			  />
			</div>
			
			<button class="btn-apply" on:click={applyDateFilter}>
			  Apply Filter
			</button>
		  </div>
		  
		  <div class="presets">
			<span>Quick Select:</span>
			<button 
			  class="preset-btn {timeFilterPreset === 'last7days' ? 'active' : ''}" 
			  on:click={() => applyPreset('last7days')}
			>
			  Last 7 Days
			</button>
			<button 
			  class="preset-btn {timeFilterPreset === 'last30days' ? 'active' : ''}" 
			  on:click={() => applyPreset('last30days')}
			>
			  Last 30 Days
			</button>
			<button 
			  class="preset-btn {timeFilterPreset === 'thisMonth' ? 'active' : ''}" 
			  on:click={() => applyPreset('thisMonth')}
			>
			  This Month
			</button>
			<button 
			  class="preset-btn {timeFilterPreset === 'lastMonth' ? 'active' : ''}" 
			  on:click={() => applyPreset('lastMonth')}
			>
			  Last Month
			</button>
		  </div>
		</div>
		
		<div class="selected-range">
		  <span>Currently viewing: </span>
		  <strong>{formatDate(startDate)} to {formatDate(endDate)}</strong>
		</div>
	  </Card>
  
	  <div class="report-section">
		<h2>System Overview</h2>
		
		<div class="stats-grid">
		  <Card>
			<h3>User Statistics</h3>
			<div class="stat-item">
			  <span>Total Users</span>
			  <span class="stat-value">{reportData.userStats.total}</span>
			</div>
			<div class="stat-item">
			  <span>Students</span>
			  <span class="stat-value">{reportData.userStats.students}</span>
			</div>
			<div class="stat-item">
			  <span>Lecturers</span>
			  <span class="stat-value">{reportData.userStats.lecturers}</span>
			</div>
			<div class="stat-item">
			  <span>Administrators</span>
			  <span class="stat-value">{reportData.userStats.admins}</span>
			</div>
		  </Card>
		  
		  <Card>
			<h3>Course Statistics</h3>
			<div class="stat-item">
			  <span>Total Courses</span>
			  <span class="stat-value">{reportData.courseStats.total}</span>
			</div>
			<div class="stat-item">
			  <span>Avg. Students / Course</span>
			  <span class="stat-value">{reportData.courseStats.avgStudentsPerCourse}</span>
			</div>
			<div class="stat-item">
			  <span>Courses without Lecturers</span>
			  <span class="stat-value">{reportData.courseStats.withoutLecturers}</span>
			</div>
			<div class="stat-item">
			  <span>Courses without Students</span>
			  <span class="stat-value">{reportData.courseStats.withoutStudents}</span>
			</div>
		  </Card>
		  
		  <Card>
			<h3>Attendance Overview</h3>
			<div class="stat-item">
			  <span>Total Sessions</span>
			  <span class="stat-value">{reportData.attendanceStats.totalSessions}</span>
			</div>
			<div class="stat-item">
			  <span>Total Attendances</span>
			  <span class="stat-value">{reportData.attendanceStats.totalAttendances}</span>
			</div>
			<div class="stat-item">
			  <span>Overall Attendance Rate</span>
			  <span class="stat-value attendance-rate">{reportData.attendanceStats.overallRate}%</span>
			</div>
		  </Card>
		</div>
	  </div>
  
	  <div class="report-section">
		<h2>Attendance by Course</h2>
		
		<div class="chart-grid">
		  <!-- Bar chart for attendance rates -->
		  <Card class="chart-card">
			<div class="chart-container">
			  <canvas bind:this={chartCanvas}></canvas>
			</div>
		  </Card>
		  
		  <!-- Pie chart for student distribution -->
		  <Card class="chart-card">
			<div class="chart-container">
			  <canvas bind:this={pieChartCanvas}></canvas>
			</div>
		  </Card>
		</div>
		
		<Card>
		  <div class="table-container">
			<table class="report-table">
			  <thead>
				<tr>
				  <th>Course Code</th>
				  <th>Course Name</th>
				  <th>Sessions</th>
				  <th>Students Enrolled</th>
				  <th>Attendances Recorded</th>
				  <th>Attendance Rate</th>
				</tr>
			  </thead>
			  <tbody>
				{#if reportData.attendanceStats.courseBreakdown.length === 0}
				  <tr>
					<td colspan="6" class="empty-state">No course data available</td>
				  </tr>
				{:else}
				  {#each reportData.attendanceStats.courseBreakdown as course}
					<tr>
					  <td>{course.courseCode}</td>
					  <td>{course.courseName}</td>
					  <td>{course.sessionCount}</td>
					  <td>{course.studentCount}</td>
					  <td>{course.attendanceCount}</td>
					  <td class="attendance-cell">
						<div class="progress-bar">
						  <div class="progress" style="width: {course.attendanceRate}%"></div>
						  <span>{course.attendanceRate}%</span>
						</div>
					  </td>
					</tr>
				  {/each}
				{/if}
			  </tbody>
			</table>
		  </div>
		</Card>
	  </div>
  
	  <div class="report-section">
		<h2>Recent System Activity</h2>
		
		<Card>
		  <div class="table-container">
			<table class="report-table">
			  <thead>
				<tr>
				  <th>Time</th>
				  <th>User</th>
				  <th>Role</th>
				  <th>Action</th>
				  <th>Details</th>
				</tr>
			  </thead>
			  <tbody>
				{#if reportData.recentActivity.length === 0}
				  <tr>
					<td colspan="5" class="empty-state">No recent activity recorded</td>
				  </tr>
				{:else}
				  {#each reportData.recentActivity as activity}
					<tr>
					  <td>{formatDate(activity.timestamp)}</td>
					  <td>{activity.userName || 'System'}</td>
					  <td>{activity.userRole || 'N/A'}</td>
					  <td>{activity.action}</td>
					  <td>{activity.details}</td>
					</tr>
				  {/each}
				{/if}
			  </tbody>
			</table>
		  </div>
		</Card>
	  </div>
	</div>
  </DashboardLayout>
  
  <style>
	.reports-page {
	  padding: 1rem;
	}
	
	.page-header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 1.5rem;
	}
	
	.page-header h1 {
	  font-size: 1.75rem;
	  font-weight: 600;
	  color: #2d3748;
	  margin: 0;
	}
	
	.btn-export {
	  display: flex;
	  align-items: center;
	  gap: 0.5rem;
	  background-color: #4299e1;
	  color: white;
	  border: none;
	  padding: 0.5rem 1rem;
	  border-radius: 0.375rem;
	  cursor: pointer;
	  font-weight: 500;
	}
	
	.btn-export:hover {
	  background-color: #3182ce;
	}
	
	.report-section {
	  margin-bottom: 2rem;
	}
	
	.report-section h2 {
	  font-size: 1.25rem;
	  font-weight: 600;
	  color: #2d3748;
	  margin-bottom: 1rem;
	}
	
	.stats-grid {
	  display: grid;
	  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	  gap: 1rem;
	}
	
	.stat-item {
	  display: flex;
	  justify-content: space-between;
	  padding: 0.75rem 0;
	  border-bottom: 1px solid #e2e8f0;
	}
	
	.stat-item:last-child {
	  border-bottom: none;
	}
	
	.stat-value {
	  font-weight: 600;
	  color: #2d3748;
	}
	
	.attendance-rate {
	  color: #4299e1;
	}
	
	.table-container {
	  overflow-x: auto;
	}
	
	.report-table {
	  width: 100%;
	  border-collapse: collapse;
	}
	
	.report-table th,
	.report-table td {
	  padding: 0.75rem 1rem;
	  text-align: left;
	  border-bottom: 1px solid #e2e8f0;
	}
	
	.report-table th {
	  background-color: #f7fafc;
	  font-weight: 600;
	  color: #4a5568;
	}
	
	.attendance-cell {
	  width: 150px;
	}
	
	.progress-bar {
	  height: 20px;
	  background-color: #edf2f7;
	  border-radius: 9999px;
	  position: relative;
	  overflow: hidden;
	}
	
	.progress {
	  position: absolute;
	  top: 0;
	  left: 0;
	  height: 100%;
	  background-color: #4299e1;
	  transition: width 0.3s ease;
	}
	
	.progress-bar span {
	  position: absolute;
	  width: 100%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  font-size: 0.75rem;
	  font-weight: 600;
	  color: #4a5568;
	}
	
	.empty-state {
	  text-align: center;
	  padding: 2rem;
	  color: #a0aec0;
	}
	
	.time-filter-card {
	  margin-bottom: 1.5rem;
	}
	
	.filter-title {
	  font-size: 1.125rem;
	  font-weight: 600;
	  color: #2d3748;
	  margin-bottom: 1rem;
	}
	
	.time-filter-controls {
	  display: flex;
	  flex-direction: column;
	  gap: 1rem;
	}
	
	.date-inputs {
	  display: flex;
	  flex-wrap: wrap;
	  gap: 1rem;
	  align-items: flex-end;
	}
	
	.date-field {
	  display: flex;
	  flex-direction: column;
	  gap: 0.25rem;
	}
	
	.date-field label {
	  font-size: 0.875rem;
	  color: #4a5568;
	}
	
	.date-field input {
	  padding: 0.5rem;
	  border: 1px solid #e2e8f0;
	  border-radius: 0.375rem;
	}
	
	.btn-apply {
	  background-color: #4299e1;
	  color: white;
	  border: none;
	  padding: 0.5rem 1rem;
	  border-radius: 0.375rem;
	  cursor: pointer;
	}
	
	.btn-apply:hover {
	  background-color: #3182ce;
	}
	
	.presets {
	  display: flex;
	  flex-wrap: wrap;
	  gap: 0.5rem;
	  align-items: center;
	}
	
	.presets span {
	  font-size: 0.875rem;
	  color: #4a5568;
	}
	
	.preset-btn {
	  background-color: #f7fafc;
	  border: 1px solid #e2e8f0;
	  padding: 0.25rem 0.75rem;
	  border-radius: 9999px;
	  font-size: 0.75rem;
	  cursor: pointer;
	  color: #4a5568;
	}
	
	.preset-btn:hover {
	  background-color: #edf2f7;
	}
	
	.preset-btn.active {
	  background-color: #4299e1;
	  color: white;
	  border-color: #4299e1;
	}
	
	.selected-range {
	  margin-top: 1rem;
	  padding-top: 1rem;
	  border-top: 1px solid #e2e8f0;
	  font-size: 0.875rem;
	  color: #4a5568;
	}
	
	.chart-grid {
	  display: grid;
	  grid-template-columns: 1fr;
	  gap: 1.5rem;
	  margin-bottom: 1.5rem;
	}
	
	.chart-container {
	  height: 350px;
	  position: relative;
	}
	
	@media (min-width: 1024px) {
	  .chart-grid {
		grid-template-columns: 1fr 1fr;
	  }
	}
  
	/* Print styles */
	@media print {
	  .btn-export {
		display: none;
	  }
	  
	  :global(nav), 
	  :global(header),
	  :global(footer) {
		display: none !important;
	  }
	  
	  :global(body) {
		background-color: white !important;
	  }
	  
	  .reports-page {
		padding: 0;
	  }
	  
	  .page-header h1 {
		text-align: center;
		margin-bottom: 2rem;
		font-size: 24pt;
	  }
	  
	  .report-section {
		page-break-inside: avoid;
	  }
	  
	  .time-filter-card {
		display: none;
	  }
	  
	  .chart-container {
		break-inside: avoid;
		page-break-inside: avoid;
		height: 300px;
	  }
	}
  </style>
  