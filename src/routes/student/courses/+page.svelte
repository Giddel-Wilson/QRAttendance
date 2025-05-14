<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;
	export let form;

	$: ({ enrolledCourses, userProfile } = data);

	// Split courses by semester
	$: firstSemesterCourses = enrolledCourses.filter(
		(course) => course.semester === 'FIRST' || course.semester === 'First'
	);

	$: secondSemesterCourses = enrolledCourses.filter(
		(course) => course.semester === 'SECOND' || course.semester === 'Second'
	);

	// Any courses without semester info
	$: otherCourses = enrolledCourses.filter(
		(course) => !['FIRST', 'First', 'SECOND', 'Second'].includes(course.semester)
	);

	// Show success/error messages
	let showMessage = !!form;
	let messageType = form?.success ? 'success' : 'error';

	// Auto-hide messages after 3 seconds
	$: if (showMessage) {
		setTimeout(() => {
			showMessage = false;
		}, 3000);
	}
</script>

<DashboardLayout role="STUDENT" userName={userProfile?.name || 'Student'}>
	<div class="courses-page">
		<h1 class="page-title">My Courses</h1>

		{#if showMessage}
			<div class="message {messageType}-message">
				{form.message}
			</div>
		{/if}

		{#if enrolledCourses.length === 0}
			<div class="empty-state">You are not enrolled in any courses yet.</div>
		{:else}
			{#if firstSemesterCourses.length > 0}
				<section class="semester-section">
					<h2 class="semester-heading">First Semester</h2>
					<div class="courses-grid">
						{#each firstSemesterCourses as course}
							<Card>
								<div class="course-card">
									<div class="course-header">
										<h3 class="course-code">{course.code}</h3>
									</div>
									<h4 class="course-name">{course.name}</h4>
									<div class="course-details">
										<div class="detail">
											<span class="detail-label">Department:</span>
											<span class="detail-value">{course.department || 'N/A'}</span>
										</div>
										<div class="detail">
											<span class="detail-label">Lecturer(s):</span>
											<span class="detail-value">{course.lecturers}</span>
										</div>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				</section>
			{/if}

			{#if secondSemesterCourses.length > 0}
				<section class="semester-section">
					<h2 class="semester-heading">Second Semester</h2>
					<div class="courses-grid">
						{#each secondSemesterCourses as course}
							<Card>
								<div class="course-card">
									<div class="course-header">
										<h3 class="course-code">{course.code}</h3>
									</div>
									<h4 class="course-name">{course.name}</h4>
									<div class="course-details">
										<div class="detail">
											<span class="detail-label">Department:</span>
											<span class="detail-value">{course.department || 'N/A'}</span>
										</div>
										<div class="detail">
											<span class="detail-label">Lecturer(s):</span>
											<span class="detail-value">{course.lecturers}</span>
										</div>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				</section>
			{/if}

			{#if otherCourses.length > 0}
				<section class="semester-section">
					<h2 class="semester-heading">Other Courses</h2>
					<div class="courses-grid">
						{#each otherCourses as course}
							<Card>
								<div class="course-card">
									<div class="course-header">
										<h3 class="course-code">{course.code}</h3>
									</div>
									<h4 class="course-name">{course.name}</h4>
									<div class="course-details">
										<div class="detail">
											<span class="detail-label">Department:</span>
											<span class="detail-value">{course.department || 'N/A'}</span>
										</div>
										<div class="detail">
											<span class="detail-label">Lecturer(s):</span>
											<span class="detail-value">{course.lecturers}</span>
										</div>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</div>
</DashboardLayout>

<style>
	.courses-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.semester-section {
		margin-bottom: 2rem;
	}

	.semester-heading {
		margin-bottom: 1rem;
		font-size: 1.25rem;
		color: #4a5568;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.courses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.course-card {
		padding: 0.5rem 0.25rem;
	}

	.course-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.course-code {
		font-size: 1.125rem;
		font-weight: 600;
		color: #2b6cb0;
		margin: 0;
	}

	.course-semester {
		font-size: 0.75rem;
		background-color: #ebf8ff;
		color: #2b6cb0;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
	}

	.course-name {
		font-size: 1rem;
		color: #4a5568;
		margin-top: 0;
		margin-bottom: 0.75rem;
	}

	.course-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.detail {
		display: flex;
		font-size: 0.875rem;
	}

	.detail-label {
		font-weight: 500;
		color: #4a5568;
		margin-right: 0.5rem;
		min-width: 6rem;
	}

	.detail-value {
		color: #718096;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		background-color: #f7fafc;
		border-radius: 0.375rem;
		color: #a0aec0;
	}

	.message {
		padding: 0.75rem;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
	}

	.success-message {
		background-color: #c6f6d5;
		color: #2f855a;
	}

	.error-message {
		background-color: #fed7d7;
		color: #c53030;
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.courses-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
