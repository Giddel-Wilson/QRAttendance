<script>
	import { onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;
	export let form;

	let scanning = false;
	let videoElem;
	let canvasElem;
	let scanInterval;
	let scannerInitialized = false;

	// Status states
	let status = 'idle'; // idle, scanning, success, error
	let message = '';

	onMount(async () => {
		// Check for camera permissions and load QR scanning library
		try {
			await import('jsqr');
			scannerInitialized = true;
		} catch (err) {
			console.error('Error loading QR scanner:', err);
			message = 'Failed to initialize scanner';
			status = 'error';
		}
	});

	onDestroy(() => {
		stopScanning();
	});

	async function startScanning() {
		if (scanning || !scannerInitialized) return;

		status = 'scanning';
		message = 'Accessing camera...';

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});

			if (!videoElem) return;

			videoElem.srcObject = stream;
			await videoElem.play();

			message = 'Point camera at QR code';

			// Start scanning
			scanInterval = setInterval(scanQRCode, 500);
			scanning = true;
		} catch (err) {
			console.error('Error accessing camera:', err);
			status = 'error';
			message = 'Camera access failed: ' + err.message;
		}
	}

	function stopScanning() {
		scanning = false;

		if (scanInterval) {
			clearInterval(scanInterval);
			scanInterval = null;
		}

		if (videoElem && videoElem.srcObject) {
			const tracks = videoElem.srcObject.getTracks();
			tracks.forEach((track) => track.stop());
			videoElem.srcObject = null;
		}
	}

	async function scanQRCode() {
		if (!scanning || !videoElem || !videoElem.readyState === videoElem.HAVE_ENOUGH_DATA) return;

		try {
			const { default: jsQR } = await import('jsqr');
			const canvas = canvasElem;
			const context = canvas.getContext('2d');

			// Set canvas dimensions to match video
			canvas.width = videoElem.videoWidth;
			canvas.height = videoElem.videoHeight;

			// Draw video frame to canvas
			context.drawImage(videoElem, 0, 0, canvas.width, canvas.height);

			// Get image data for QR code detection
			const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

			// Scan for QR code
			const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
				inversionAttempts: 'dontInvert'
			});

			if (qrCode) {
				console.log('QR code detected:', qrCode.data);
				stopScanning();

				// Submit the form with QR data
				document.getElementById('qr-data-input').value = qrCode.data;
				document.getElementById('attendance-form').submit();

				status = 'processing';
				message = 'Processing QR code...';
			}
		} catch (err) {
			console.error('Error scanning QR code:', err);
		}
	}

	// Handle form submission result
	function handleSubmit() {
		return async ({ result }) => {
			if (result.type === 'success') {
				if (result.data?.success) {
					status = 'success';
					message = result.data.message;

					// If redirect is specified, go there after a short delay
					if (result.data.redirect) {
						setTimeout(() => {
							window.location.href = result.data.redirect;
						}, 1500);
					}
				} else {
					status = 'error';
					message = result.data.message || 'Unknown error';
				}
			} else {
				status = 'error';
				message = 'Submission failed. Please try again.';
			}

			scanning = false;
		};
	}

	// Reset when form response comes back
	$: if (form) {
		status = form.success ? 'success' : 'error';
		message = form.message;
		scanning = false;
	}
</script>

<DashboardLayout role="STUDENT" userName={data.userProfile?.name || 'Student'}>
	<div class="scan-page">
		<h1 class="page-title">Scan Attendance QR Code</h1>

		<Card>
			<div class="scan-container">
				{#if status === 'success'}
					<div class="success-message">
						<div class="success-icon">✓</div>
						<h3>Attendance Recorded!</h3>
						{#if form?.course}
							<div class="attendance-details">
								<p><strong>Course:</strong> {form.course.code} - {form.course.name}</p>
								<p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
								<p><strong>Status:</strong> PRESENT</p>
							</div>
						{/if}
						<a href="/student/attendance" class="button">View All Attendance</a>
					</div>
				{:else if status === 'error'}
					<div class="error-message">
						<div class="error-icon">×</div>
						<p>{message}</p>
						<button
							class="button"
							on:click={() => {
								status = 'idle';
								message = '';
							}}>Try Again</button
						>
					</div>
				{:else if status === 'scanning'}
					<div class="scanner-container">
						<div class="video-container">
							<video bind:this={videoElem} autoplay playsinline></video>
							<canvas bind:this={canvasElem} class="hidden"></canvas>
							<div class="scan-overlay">
								<div class="scan-frame"></div>
							</div>
						</div>
						<div class="scanner-controls">
							<p class="scanner-status">{message}</p>
							<button class="button cancel" on:click={stopScanning}>Cancel</button>
						</div>
					</div>
				{:else}
					<div class="start-scan">
						<div class="instructions">
							<h3>Scan QR Code for Attendance</h3>
							<ol>
								<li>Click "Start Scanning" below</li>
								<li>Point your camera at the QR code shown by your lecturer</li>
								<li>Hold steady until the code is recognized</li>
							</ol>
						</div>
						<button class="button primary" on:click={startScanning}>Start Scanning</button>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Hidden form to submit QR data -->
		<form
			id="attendance-form"
			method="POST"
			action="?/submitAttendance"
			use:enhance
			style="display:none"
		>
			<input id="qr-data-input" type="hidden" name="qrData" value="" />
		</form>
	</div>
</DashboardLayout>

<style>
	.scan-page {
		padding: 1rem;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		color: #2d3748;
	}

	.scan-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
	}

	.scanner-container {
		width: 100%;
		max-width: 500px;
	}

	.video-container {
		position: relative;
		width: 100%;
		height: 0;
		padding-bottom: 75%;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.video-container video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hidden {
		display: none;
	}

	.scan-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.scan-frame {
		width: 65%;
		height: 65%;
		border: 2px solid #4299e1;
		box-shadow: 0 0 0 5000px rgba(0, 0, 0, 0.5);
		border-radius: 10px;
	}

	.scanner-controls {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.scanner-status {
		margin-bottom: 1rem;
		color: #4a5568;
		text-align: center;
	}

	.button {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		text-decoration: none;
		display: inline-block;
		text-align: center;
	}

	.button.primary {
		background-color: #4299e1;
		color: white;
	}

	.button.cancel {
		background-color: #e53e3e;
		color: white;
	}

	.start-scan {
		width: 100%;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.instructions {
		margin-bottom: 1.5rem;
		width: 100%;
	}

	.instructions h3 {
		text-align: center;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.instructions ol {
		padding-left: 1.5rem;
	}

	.instructions li {
		margin-bottom: 0.5rem;
		color: #4a5568;
	}

	.success-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.success-icon {
		font-size: 3rem;
		color: #48bb78;
		background-color: #c6f6d5;
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.error-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.error-icon {
		font-size: 3rem;
		color: #e53e3e;
		background-color: #fed7d7;
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.attendance-details {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e2e8f0;
		width: 100%;
		text-align: left;
	}
</style>
