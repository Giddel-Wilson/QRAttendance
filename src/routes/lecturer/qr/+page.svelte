<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import QrCode from 'qrcode';
	import { onMount } from 'svelte';

	export let data;
	export let form;

	const { courses, recentSessions } = data;

	let qrImageURL = '';
	let countdownInterval;
	let remainingTime = 0;
	let selectedDuration = '15';
	const durations = [
		{ value: '5', label: '5 minutes' },
		{ value: '10', label: '10 minutes' },
		{ value: '15', label: '15 minutes' },
		{ value: '30', label: '30 minutes' },
		{ value: '60', label: '1 hour' },
		{ value: '120', label: '2 hours' }
	];

	// Generate QR code from data
	async function generateQRCode(data) {
		try {
			qrImageURL = await QrCode.toDataURL(data);
		} catch (err) {
			console.error('Error generating QR code:', err);
		}
	}

	// Start countdown timer for QR code expiration
	function startCountdown(expiresAt) {
		// Clear any existing interval
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}

		// Calculate initial remaining time
		const expiryTime = new Date(expiresAt).getTime();
		remainingTime = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));

		// Set up interval to update countdown every second
		countdownInterval = setInterval(() => {
			remainingTime -= 1;
			if (remainingTime <= 0) {
				clearInterval(countdownInterval);
				remainingTime = 0;
			}
		}, 1000);
	}

	// Format remaining time as MM:SS
	function formatRemainingTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Handle successful QR generation
	$: if (form?.success && form?.qrSession) {
		generateQRCode(form.qrSession.qrData);
		startCountdown(form.qrSession.expiresAt);
	}

	// Clean up on unmount
	onMount(() => {
		return () => {
			if (countdownInterval) {
				clearInterval(countdownInterval);
			}
		};
	});

	function formatDate(dateString) {
		return new Date(dateString).toLocaleString();
	}
</script>

<DashboardLayout role="LECTURER" userName={data.userProfile?.name || 'Lecturer'}>
	<div class="qr-page">
		<h1 class="page-title">Attendance QR Code</h1>

		<div class="qr-grid">
			<div class="qr-section">
				<Card title="Generate QR Code">
					<form method="POST" action="?/generateQR" use:enhance>
						<div class="form-group">
							<label for="courseId">Select Course</label>
							<select id="courseId" name="courseId" required>
								<option value="">-- Select Course --</option>
								{#each courses as course}
									<option value={course.id}>{course.code}: {course.name}</option>
								{/each}
							</select>
						</div>

						<div class="form-group">
							<label for="location">Location</label>
							<input
								type="text"
								id="location"
								name="location"
								placeholder="e.g. LT1, Room 203"
								required
							/>
						</div>

						<div class="form-group">
							<label for="duration">QR Code Duration</label>
							<select id="duration" name="duration" bind:value={selectedDuration}>
								{#each durations as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>

						<div class="form-actions">
							<button type="submit" class="submit-button">Generate QR Code</button>
						</div>

						{#if form?.error && !form?.success}
							<div class="error-message">
								{form.error}
							</div>
						{/if}
					</form>
				</Card>
			</div>

			<div class="qr-section">
				{#if form?.success && form?.qrSession}
					<Card
						title="Attendance QR Code"
						subtitle={`${form.qrSession.course.code}: ${form.qrSession.course.name}`}
					>
						<div class="qr-display">
							<div class="qr-code">
								<img src={qrImageURL} alt="QR Code" />
							</div>

							<div class="qr-info">
								<div class="countdown {remainingTime < 60 ? 'expiring' : ''}">
									<div class="countdown-label">Time remaining:</div>
									<div class="countdown-time">{formatRemainingTime(remainingTime)}</div>
								</div>

								<form method="POST" action="?/invalidateQR" use:enhance>
									<input type="hidden" name="sessionId" value={form.qrSession.id} />
									<button type="submit" class="danger-button"> End Session Early </button>
								</form>

								<p class="qr-help">
									Show this QR code to your students to mark their attendance. Students need to scan
									it with the attendance app.
								</p>
							</div>
						</div>
					</Card>
				{:else}
					<Card title="QR Code Preview">
						<div class="no-qr-message">
							<div class="no-qr-icon">📱</div>
							<p>Generate a QR code from the form to display it here.</p>
						</div>
					</Card>
				{/if}
			</div>
		</div>

		<div class="recent-sessions">
			<Card title="Recent QR Sessions">
				<table class="sessions-table">
					<thead>
						<tr>
							<th>Date & Time</th>
							<th>Course</th>
							<th>Duration</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{#if recentSessions.length === 0}
							<tr>
								<td colspan="4" class="empty-message">No recent QR sessions</td>
							</tr>
						{:else}
							{#each recentSessions as session}
								<tr>
									<td>{formatDate(session.createdAt)}</td>
									<td>{session.course.code}: {session.course.name}</td>
									<td>{session.duration} minutes</td>
									<td>
										{#if new Date(session.expiresAt) > new Date()}
											<span class="status-badge active">Active</span>
										{:else}
											<span class="status-badge expired">Expired</span>
										{/if}
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</Card>
		</div>
	</div>
</DashboardLayout>

<style>
	.qr-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.qr-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #4a5568;
		font-weight: 500;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
	}

	.form-actions {
		margin-top: 1.5rem;
	}

	.submit-button {
		background-color: #4299e1;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-weight: 500;
	}

	.danger-button {
		background-color: #f56565;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-weight: 500;
		width: 100%;
	}

	.qr-display {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.qr-code {
		background-color: white;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.qr-code img {
		width: 250px;
		height: 250px;
	}

	.qr-info {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.countdown {
		background-color: #ebf8ff;
		padding: 1rem;
		border-radius: 0.25rem;
		text-align: center;
	}

	.countdown.expiring {
		background-color: #fed7d7;
	}

	.countdown-label {
		color: #4a5568;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.countdown-time {
		font-size: 2rem;
		font-weight: 600;
		color: #2d3748;
	}

	.countdown.expiring .countdown-time {
		color: #e53e3e;
	}

	.qr-help {
		margin-top: 1rem;
		font-size: 0.875rem;
		color: #718096;
		text-align: center;
	}

	.no-qr-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		background-color: #f7fafc;
		border-radius: 0.25rem;
	}

	.no-qr-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: #a0aec0;
	}

	.no-qr-message p {
		color: #718096;
		text-align: center;
	}

	.sessions-table {
		width: 100%;
		border-collapse: collapse;
	}

	.sessions-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		background-color: #f7fafc;
		color: #4a5568;
		font-weight: 500;
	}

	.sessions-table td {
		padding: 0.75rem 1rem;
		border-top: 1px solid #edf2f7;
	}

	.empty-message {
		text-align: center;
		color: #a0aec0;
		padding: 1rem;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-badge.active {
		background-color: #c6f6d5;
		color: #2f855a;
	}

	.status-badge.expired {
		background-color: #e2e8f0;
		color: #718096;
	}

	.error-message {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background-color: #fed7d7;
		color: #e53e3e;
		border-radius: 0.25rem;
	}

	/* Mobile responsive styles */
	@media (max-width: 900px) {
		.qr-grid {
			grid-template-columns: 1fr;
		}

		.qr-code img {
			max-width: 200px;
			max-height: 200px;
		}
	}

	@media (max-width: 480px) {
		.page-title {
			font-size: 1.25rem;
		}

		.qr-code {
			padding: 0.5rem;
		}

		.countdown-time {
			font-size: 1.5rem;
		}
	}
</style>
