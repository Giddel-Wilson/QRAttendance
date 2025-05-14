<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import { goto } from '$app/navigation';

	export let data;

	$: ({ courses, selectedCourseId, selectedCourse, students, studentsByLevel, userProfile } = data);

	// Filter controls
	let searchQuery = '';
	let selectedDepartment = '';

	// Function to change selected course
	function selectCourse(event) {
		const courseId = event.target.value;
		if (courseId) {
			window.location.href = `/lecturer/students?courseId=${courseId}`;
		}
	}

	// Get sorted department keys for consistent display order
	$: departmentKeys = Object.keys(studentsByLevel).sort((a, b) => {
		// Sort by alphabetical order
		return a.localeCompare(b);
	});

	// Filter students based on search query and department filter
	$: filteredStudents = students.filter((student) => {
		const matchesSearch =
			!searchQuery ||
			student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;

		return matchesSearch && matchesDepartment;
	});

	// Get unique departments for filter dropdown
	$: availableDepartments = [...new Set(students.map((s) => s.department).filter(Boolean))].sort();
</script>

<DashboardLayout role="LECTURER" userName={userProfile?.name || 'Lecturer'}>
	<div class="students-page">
		<h1 class="page-title">Course Students</h1>

		<!-- Course selection dropdown with improved styling -->
		<div class="course-selector-container">
			<label for="course-selector" class="selector-label">Select Course:</label>
			<div class="select-wrapper">
				<select
					id="course-selector"
					value={selectedCourseId}
					on:change={selectCourse}
					class="course-selector"
				>
					<option value="" disabled selected={!selectedCourseId}>Choose a course...</option>
					{#each courses as course}
						<option value={course.id}>
							{course.code} - {course.name} ({course.studentCount || students.length} students)
						</option>
					{/each}
				</select>
			</div>
		</div>

		{#if selectedCourseId}
			<!-- Fixed filter section with better alignment and consistent card-like styling -->
			<div class="filter-section">
				<div class="search-container">
					<label for="searchInput" class="filter-label">Search Students</label>
					<div class="input-wrapper">
						<input
							id="searchInput"
							type="text"
							placeholder="Search by name, email or matric number..."
							bind:value={searchQuery}
							class="search-input"
						/>
						<span class="input-icon">🔍</span>
					</div>
				</div>
				<div class="filter-dropdown">
					<label for="departmentFilter" class="filter-label">Department</label>
					<select
						id="departmentFilter"
						name="department"
						class="department-select"
						bind:value={selectedDepartment}
						aria-label="Filter by department"
					>
						<option value="">All Departments</option>
						{#each availableDepartments as dept}
							<option value={dept}>{dept}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- View by department -->
			<div class="departments-container">
				{#if Object.keys(studentsByLevel).length === 0}
					<Card>
						<div class="empty-state">No students enrolled in this course yet.</div>
					</Card>
				{:else}
					{#each departmentKeys as department}
						<Card title="{department} Students ({studentsByLevel[department].length})">
							{#if studentsByLevel[department].length > 0}
								<table class="students-table">
									<thead>
										<tr>
											<th>Name</th>
											<th>Matric Number</th>
											<th>Email</th>
											<th>Department</th>
										</tr>
									</thead>
									<tbody>
										{#each studentsByLevel[department] as student}
											<tr>
												<td>{student.name}</td>
												<td>{student.matricNumber}</td>
												<td>{student.email}</td>
												<td>{student.department}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{:else}
								<div class="empty-state">No {department} students enrolled.</div>
							{/if}
						</Card>
					{/each}
				{/if}
			</div>

			<!-- Filtered view -->
			{#if searchQuery || selectedDepartment}
				<Card title="Search Results ({filteredStudents.length})">
					{#if filteredStudents.length > 0}
						<table class="students-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Matric Number</th>
									<th>Department</th>
									<th>Email</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredStudents as student}
									<tr>
										<td>{student.name}</td>
										<td>{student.matricNumber}</td>
										<td>{student.department}</td>
										<td>{student.email}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="empty-state">No students match your search criteria.</div>
					{/if}
				</Card>
			{/if}
		{:else}
			<Card>
				<div class="empty-state">
					You have no assigned courses. Contact the administrator to assign courses to you.
				</div>
			</Card>
		{/if}
	</div>
</DashboardLayout>

<style>
	.students-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
		font-weight: 600;
	}

	.course-selector-container {
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.selector-label {
		font-weight: 500;
		color: #4a5568;
	}

	.select-wrapper {
		position: relative;
		flex: 1;
		max-width: 400px;
	}

	.course-selector {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
		color: #2d3748;
		background-color: white;
		appearance: none;
		padding-right: 2rem;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234299e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
	}

	.course-selector:focus {
		border-color: #4299e1;
		outline: none;
		box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.5);
	}

	/* Fixed filter section styling */
	.filter-section {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
		align-items: end;
	}

	.filter-label {
		display: block;
		font-weight: 500;
		color: #4a5568;
		margin-bottom: 0.375rem;
		font-size: 0.875rem;
	}

	.input-wrapper {
		position: relative;
	}

	.search-container {
		position: relative;
	}

	.input-icon {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #a0aec0;
	}

	.search-input {
		width: 100%;
		padding: 0.625rem 0.75rem;
		padding-right: 2.5rem;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
		font-size: 0.875rem;
		background-color: white;
		height: 40px;
	}

	.filter-dropdown {
		width: 100%;
	}

	.department-select {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
		background-color: white;
		color: #2d3748;
		font-size: 0.875rem;
		height: 40px;
		cursor: pointer;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234299e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
		padding-right: 2.5rem;
		-webkit-appearance: none;
		-moz-appearance: none;
	}

	.departments-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.students-table {
		width: 100%;
		border-collapse: collapse;
	}

	.students-table th,
	.students-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #edf2f7;
	}

	.students-table th {
		background-color: #f0f5ff;
		color: #2d4380;
		font-weight: 500;
		border-bottom: 2px solid #e2e8f0;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: #a0aec0;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.filter-section {
			grid-template-columns: 1fr;
		}
	}
</style>
