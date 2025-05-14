<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import QrCode from 'qrcode';

	export let data;
	export let form;

	const { courses, selectedCourse, enrolledStudents, activeSession } = data;

	// Use a writable variable instead of binding to the constant from data
	let selectedCourseId = data.selectedCourseId || '';
	let qrImageURL = '';
	let countdownInterval;
	let remainingTime = 0;
	let duration = '15'; // Default duration 15 minutes
	let location = '';
	let manualAttendance = false;
	let attendanceStatus = {};

	// Initialize attendance status for all students
	$: if (enrolledStudents && enrolledStudents.length > 0) {
		enrolledStudents.forEach((student) => {
			if (!attendanceStatus[student.id]) {
				attendanceStatus[student.id] = 'PRESENT';
			}
		});
	}

	// Course selection change handler
	function handleCourseChange() {
		goto(`/lecturer/attendance?courseId=${selectedCourseId}`);
	}

	// Toggle manual attendance mode
	function toggleManualAttendance() {
		manualAttendance = !manualAttendance;
	}

	// Generate QR code image
	async function generateQRCode(data) {
		if (typeof window !== 'undefined') {
			try {
				const QRCode = await import('qrcode');
				qrImageURL = await QRCode.toDataURL(data);
			} catch (err) {
				console.error('Error generating QR code:', err);
				qrImageURL = '';
			}
		}
	}

	// Start countdown timer
	function startCountdown(expiresAt) {
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}

		const updateCountdown = () => {
			const now = new Date().getTime();
			const expiry = new Date(expiresAt).getTime();
			remainingTime = Math.max(0, Math.floor((expiry - now) / 1000));

			if (remainingTime <= 0) {
				clearInterval(countdownInterval);
			}
		};

		updateCountdown();
		countdownInterval = setInterval(updateCountdown, 1000);
	}

	// Format time as MM:SS
	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Generate QR code when session is created/retrieved
	$: if (form?.success && form?.qrData) {
		console.log('QR data received from server:', form.qrData);
		generateQRCode(form.qrData);
		startCountdown(form.expiresAt);
	} else if (activeSession?.qrData) {
		console.log('Using existing active session QR data');
		generateQRCode(activeSession.qrData);
		startCountdown(activeSession.expiresAt);
	}

	// Improved session handling - recognize active sessions on page load
	onMount(async () => {
		if (activeSession?.qrData) {
			console.log('Found existing active session on page load');
			await tick();
			generateQRCode(activeSession.qrData);

			// Calculate remaining time based on expiry timestamp
			if (activeSession.expiresAt) {
				const expiryTime = new Date(activeSession.expiresAt).getTime();
				const currentTime = new Date().getTime();
				const remainingMs = Math.max(0, expiryTime - currentTime);
				remainingTime = Math.floor(remainingMs / 1000);

				console.log(`Session expires in ${remainingTime} seconds`);
				startCountdown(activeSession.expiresAt);
			}
		}
	});

	// More robust QR code generation that works with active sessions
	$: if (form?.success && form?.qrData) {
		console.log('QR data received from form submission:', form.qrData);
		generateQRCode(form.qrData);
		startCountdown(form.expiresAt);
	} else if (activeSession?.qrData && !qrImageURL) {
		console.log('Using existing active session QR data');
		generateQRCode(activeSession.qrData);
		if (activeSession.expiresAt && !countdownInterval) {
			startCountdown(activeSession.expiresAt);
		}
	}

	onDestroy(() => {
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
	});

	// Handle end session
	function handleEndSession() {
		return async ({ result }) => {
			if (result.type === 'success') {
				console.log('Session ended successfully');

				// Clear any UI state related to the active session
				qrImageURL = '';
				if (countdownInterval) {
					clearInterval(countdownInterval);
					countdownInterval = null;
				}

				// Redirect to review page
				if (result.data?.sessionId) {
					window.location.href = `/lecturer/attendance/review?sessionId=${result.data.sessionId}`;
				} else {
					// Reload if no session ID
					window.location.reload();
				}
			} else {
				console.error('Failed to end session:', result);
			}
		};
	}
</script>

<DashboardLayout role="LECTURER" userName={data.userProfile?.name || 'Lecturer'}>
	<div class="qr-page">
		<!-- <h1 class="page-title">Take Attendance</h1> -->

		<div class="attendance-page">
			<div class="page-header">
				<h1 class="page-title">Take Attendance</h1>

				<div class="course-selector">
					<label for="courseSelect">Course:</label>
					<select id="courseSelect" bind:value={selectedCourseId} on:change={handleCourseChange}>
						{#each courses as course}
							<option value={course.id}
								>{course.code}: {course.name} ({course._count?.enrollments || 0} students)</option
							>
						{/each}
					</select>
				</div>
			</div>

			{#if courses.length === 0}
				<div class="empty-state">
					<div class="empty-icon">📚</div>
					<h2>No Courses Found</h2>
					<p>You don't have any courses assigned to you yet. Please contact the administrator.</p>
				</div>
			{:else if !selectedCourseId}
				<div class="empty-state">
					<div class="empty-icon">🔍</div>
					<h2>No Course Selected</h2>
					<p>Please select a course to take attendance.</p>
				</div>
			{:else}
				<div class="attendance-container">
					<div class="qr-section">
						<Card title="Generate Attendance QR Code">
							{#if activeSession || (form?.success && form?.sessionId)}
								<div class="active-session">
									<div class="qr-code">
										{#if qrImageURL}
											<img src={qrImageURL} alt="QR Code" />
										{:else}
											<div class="loading-qr">Loading QR Code...</div>
										{/if}
									</div>

									<div class="session-info">
										<div class="countdown-container {remainingTime < 60 ? 'expiring' : ''}">
											<div class="countdown-label">Expires in:</div>
											<div class="countdown-time">{formatTime(remainingTime)}</div>
										</div>

										<form method="POST" action="?/endSession" use:enhance={handleEndSession}>
											<input
												type="hidden"
												name="sessionId"
												value={activeSession?.id || form?.sessionId}
											/>
											<button type="submit" class="button danger">End Session</button>

											<!-- Add debug info (can be removed later) -->
											<div
												class="debug-info"
												style="font-size: 0.8rem; margin-top: 0.5rem; color: #666;"
											>
												Session ID: {activeSession?.id || form?.sessionId}
											</div>
										</form>

										<button class="button secondary" on:click={toggleManualAttendance}>
											{manualAttendance ? 'Hide' : 'Show'} Manual Attendance
										</button>
									</div>
								</div>
							{:else}
								<form method="POST" action="?/generateCode" use:enhance>
									<input type="hidden" name="courseId" value={selectedCourseId} />

									<div class="form-group">
										<label for="location">Location</label>
										<input
											type="text"
											id="location"
											name="location"
											bind:value={location}
											placeholder="e.g. LT1, Room 203"
											required
										/>
									</div>

									<div class="form-group">
										<label for="duration">QR Code Duration</label>
										<select id="duration" name="duration" bind:value={duration}>
											<option value="5">5 minutes</option>
											<option value="10">10 minutes</option>
											<option value="15">15 minutes</option>
											<option value="30">30 minutes</option>
											<option value="60">1 hour</option>
											<option value="120">2 hours</option>
										</select>
									</div>

									<button type="submit" class="button primary">Generate QR Code</button>

									{#if form?.error}
										<div class="error-message">{form.error}</div>
									{/if}
								</form>
							{/if}
						</Card>
					</div>

					{#if manualAttendance && enrolledStudents.length > 0}
						<div class="students-section">
							<Card title="Manual Attendance">
								<div class="attendance-list">
									<table class="students-table">
										<thead>
											<tr>
												<th>Name</th>
												<th>Matric Number</th>
												<th>Status</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{#each enrolledStudents as student}
												<tr>
													<td>{student.name}</td>
													<td>{student.matricNumber || '-'}</td>
													<td>
														<div class="status-selector">
															<select bind:value={attendanceStatus[student.id]}>
																<option value="PRESENT">Present</option>
																<option value="ABSENT">Absent</option>
																<option value="EXCUSED">Excused</option>
															</select>
														</div>
													</td>
													<td>
														<form method="POST" action="?/markAttendance" use:enhance>
															<input
																type="hidden"
																name="scheduleId"
																value={activeSession?.scheduleId}
															/>
															<input type="hidden" name="studentId" value={student.id} />
															<input
																type="hidden"
																name="status"
																value={attendanceStatus[student.id]}
															/>
															<button type="submit" class="small-button">Save</button>
														</form>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</Card>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</DashboardLayout>

<style>
	.attendance-page {
		padding: 1rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		font-size: 1.5rem;
		color: #2d3748;
		margin: 0;
	}

	.course-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.course-selector label {
		color: #4a5568;
	}

	.course-selector select {
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
		min-width: 250px;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		color: #a0aec0;
	}

	.empty-state h2 {
		color: #2d3748;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #718096;
	}

	.attendance-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.qr-section {
		width: 100%;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #4a5568;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
	}

	.active-session {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.qr-code {
		background-color: white;
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		width: fit-content;
	}

	.qr-code img {
		display: block;
		width: 250px;
		height: 250px;
	}

	.loading-qr {
		width: 250px;
		height: 250px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f7fafc;
		color: #718096;
	}

	.session-info {
		width: 100%;
		max-width: 300px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.countdown-container {
		background-color: #ebf8ff;
		border-radius: 0.5rem;
		padding: 1rem;
		text-align: center;
	}

	.countdown-container.expiring {
		background-color: #fed7d7;
	}

	.countdown-label {
		font-size: 0.875rem;
		color: #4a5568;
		margin-bottom: 0.25rem;
	}

	.countdown-time {
		font-size: 2rem;
		font-weight: bold;
		color: #2b6cb0;
	}

	.countdown-container.expiring .countdown-time {
		color: #c53030;
	}

	.button {
		display: inline-block;
		padding: 0.75rem 1rem;
		border-radius: 0.25rem;
		font-weight: 500;
		text-align: center;
		cursor: pointer;
		border: none;
		width: 100%;
	}

	.button.primary {
		background-color: #4299e1;
		color: white;
	}

	.button.secondary {
		background-color: #edf2f7;
		color: #4a5568;
	}

	.button.danger {
		background-color: #f56565;
		color: white;
	}

	.error-message {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #fed7d7;
		color: #c53030;
		border-radius: 0.25rem;
	}

	.students-section {
		width: 100%;
	}

	.attendance-list {
		overflow-x: auto;
	}

	.students-table {
		width: 100%;
		border-collapse: collapse;
	}

	.students-table th,
	.students-table td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	.students-table th {
		font-weight: 600;
		color: #4a5568;
		background-color: #f7fafc;
	}

	.status-selector select {
		padding: 0.25rem 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
		width: 100%;
	}

	.small-button {
		padding: 0.25rem 0.75rem;
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		cursor: pointer;
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.course-selector {
			width: 100%;
		}

		.course-selector select {
			flex: 1;
			min-width: unset;
		}

		.active-session {
			flex-direction: column;
		}

		.session-info {
			max-width: 100%;
		}
	}

	@media (max-width: 480px) {
		.qr-code img,
		.loading-qr {
			width: 200px;
			height: 200px;
		}

		.countdown-time {
			font-size: 1.5rem;
		}
	}
</style>
