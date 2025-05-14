<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Props
	export let userRole = '';
	
	// Local state
	let isOpen = false;
	let showNotificationModal = false;
	let notificationTitle = '';
	let notificationMessage = '';
	let forStudents = true;
	let forLecturers = true;
	let notifications = [];
	let unreadCount = 0;
	
	// Format date
	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	// Toggle dropdown
	function toggleDropdown() {
		isOpen = !isOpen;
	}
	
	// Open notification creation modal
	function openCreateNotification() {
		showNotificationModal = true;
		notificationTitle = '';
		notificationMessage = '';
		forStudents = true;
		forLecturers = true;
	}
	
	// Submit new notification
	async function submitNotification() {
		try {
			const response = await fetch('/api/notifications', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: notificationTitle,
					message: notificationMessage,
					forStudents,
					forLecturers
				})
			});
			
			if (response.ok) {
				showNotificationModal = false;
				// Refresh notifications
				fetchNotifications();
			} else {
				alert('Failed to send notification');
			}
		} catch (error) {
			console.error('Error sending notification:', error);
			alert('Failed to send notification');
		}
	}
	
	// Improved fetch notifications function with better error handling
	async function fetchNotifications() {
		try {
			console.log("Fetching notifications...");
			const response = await fetch('/api/notifications');
			if (response.ok) {
				const data = await response.json();
				console.log("Received notifications:", data);
				notifications = Array.isArray(data) ? data : [];
				unreadCount = notifications.filter(n => !n.read).length;
			} else {
				console.error("Failed to fetch notifications:", await response.text());
			}
		} catch (error) {
			console.error('Error fetching notifications:', error);
		}
	}

	// Mark notification as read
	async function markAsRead(id) {
		try {
			// Mark locally as read immediately for better UX
			notifications = notifications.map((n) => {
				if (n.id === id) {
					return { ...n, read: true };
				}
				return n;
			});
			
			// Recalculate unread count
			unreadCount = notifications.filter((n) => !n.read).length;
			
			// Mark on server
			const response = await fetch(`/api/notifications/read?id=${id}`, {
				method: 'POST'
			});

			if (!response.ok) {
				console.error('Error marking notification as read:', await response.text());
			}
		} catch (err) {
			console.error('Error marking notification as read:', err);
		}
	}

	// Mark all as read
	async function markAllAsRead() {
		try {
			// Update UI first for responsiveness
			notifications = notifications.map(n => ({ ...n, read: true }));
			unreadCount = 0;
			
			// Send request to server
			const response = await fetch('/api/notifications/read-all', {
				method: 'POST'
			});

			if (!response.ok) {
				console.error('Error marking all as read:', await response.text());
			}
		} catch (err) {
			console.error('Error marking all notifications as read:', err);
		}
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event) {
		const dropdown = document.querySelector('.notifications-dropdown');
		const bell = document.querySelector('.notification-bell');

		if (dropdown && bell && !dropdown.contains(event.target) && !bell.contains(event.target)) {
			isOpen = false;
		}
	}

	// Set up event listener for clicks outside dropdown and fetch notifications
	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		// Fetch notifications when component mounts
		fetchNotifications();
		
		// Set up interval to refresh notifications (every 30 seconds)
		const interval = setInterval(fetchNotifications, 30000);
		
		return () => {
			document.removeEventListener('click', handleClickOutside);
			clearInterval(interval);
		};
	});
</script>

<div class="notification-container">
	<button
		class="notification-bell"
		on:click|stopPropagation={toggleDropdown}
		aria-label="Notifications"
	>
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
			<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
			<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
		</svg>
		{#if unreadCount > 0}
			<span class="notification-badge">{unreadCount}</span>
		{/if}
	</button>

	{#if isOpen}
		<div class="notifications-dropdown">
			<div class="notifications-header">
				<h3>Notifications</h3>

				<!-- Add edit button for admins -->
				{#if userRole === 'ADMIN'}
					<button
						class="edit-btn"
						on:click={openCreateNotification}
						title="Create new notification"
					>
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
							<line x1="12" y1="5" x2="12" y2="19"></line>
							<line x1="5" y1="12" x2="19" y2="12"></line>
						</svg>
						<span>New</span>
					</button>
				{/if}

				{#if unreadCount > 0}
					<button class="mark-all-read" on:click={markAllAsRead}>Mark all as read</button>
				{/if}
			</div>

			<div class="notifications-list">
				{#if notifications.length === 0}
					<div class="empty-notifications">No notifications</div>
				{:else}
					{#each notifications as notification}
						<div
							class="notification-item"
							class:unread={!notification.read}
							on:click={() => markAsRead(notification.id)}
						>
							<div class="notification-title">{notification.title}</div>
							<div class="notification-message">{notification.message}</div>
							<div class="notification-time">{formatDate(notification.createdAt)}</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
	
	<!-- Create notification modal -->
	{#if showNotificationModal}
		<div class="modal-overlay" on:click|self={() => showNotificationModal = false} transition:fade={{ duration: 200 }}>
			<div class="modal-container" on:click|stopPropagation>
				<div class="modal-header">
					<h2>Create Notification</h2>
					<button class="close-btn" on:click={() => showNotificationModal = false}>×</button>
				</div>
				
				<div class="modal-content">
					<div class="form-group">
						<label for="notificationTitle">Notification Title</label>
						<input 
							type="text" 
							id="notificationTitle" 
							bind:value={notificationTitle} 
							placeholder="Enter notification title"
							required
						/>
					</div>
					
					<div class="form-group">
						<label for="notificationMessage">Message</label>
						<textarea 
							id="notificationMessage" 
							bind:value={notificationMessage} 
							placeholder="Enter notification message"
							rows="4"
							required
						></textarea>
					</div>
					
					<div class="notification-targets">
						<h3>Send to:</h3>
						<div class="checkbox-group">
							<label class="checkbox-label">
								<input type="checkbox" bind:checked={forStudents} />
								<span>Students</span>
							</label>
							
							<label class="checkbox-label">
								<input type="checkbox" bind:checked={forLecturers} />
								<span>Lecturers</span>
							</label>
						</div>
					</div>
				</div>
				
				<div class="modal-footer">
					<button class="cancel-btn" on:click={() => showNotificationModal = false}>Cancel</button>
					<button 
						class="send-btn" 
						on:click={submitNotification}
						disabled={!notificationTitle || !notificationMessage || (!forStudents && !forLecturers)}
					>
						Send Notification
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.notification-container {
		position: relative;
	}

	.notification-bell {
		background: none;
		border: none;
		cursor: pointer;
		position: relative;
		color: #718096;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.notification-bell:hover {
		color: #4a5568;
	}

	.notification-badge {
		position: absolute;
		top: 0;
		right: 0;
		background-color: #e53e3e;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 1.25rem;
		height: 1.25rem;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.25rem;
	}

	.notifications-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		width: 320px;
		background-color: white;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		z-index: 50;
		margin-top: 0.5rem;
		border: 1px solid #e2e8f0;
	}

	.notifications-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.notifications-header h3 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a5568;
	}

	.mark-all-read {
		background: none;
		border: none;
		padding: 0;
		font-size: 0.75rem;
		color: #4299e1;
		cursor: pointer;
	}

	.notifications-list {
		max-height: 320px;
		overflow-y: auto;
	}

	.empty-notifications {
		padding: 2rem 1rem;
		text-align: center;
		color: #a0aec0;
		font-size: 0.875rem;
	}

	.notification-item {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f7fafc;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.notification-item:hover {
		background-color: #f7fafc;
	}

	.notification-item.unread {
		background-color: #ebf8ff;
	}

	.notification-item.unread:hover {
		background-color: #e6f6ff;
	}

	.notification-title {
		font-weight: 500;
		font-size: 0.875rem;
		color: #2d3748;
		margin-bottom: 0.25rem;
	}

	.notification-message {
		font-size: 0.75rem;
		color: #718096;
		margin-bottom: 0.5rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.notification-time {
		font-size: 0.75rem;
		color: #a0aec0;
	}

	.edit-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 6px 10px;
		font-size: 0.75rem;
		cursor: pointer;
		margin-right: 8px;
	}

	.edit-btn:hover {
		background-color: #3182ce;
	}
	
	/* Modal styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-container {
		background-color: white;
		border-radius: 8px;
		width: 500px;
		max-width: 90%;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.modal-header {
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.125rem;
		color: #2d3748;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		line-height: 1;
		padding: 0;
		color: #718096;
		cursor: pointer;
	}

	.modal-content {
		padding: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.875rem;
		color: #4a5568;
	}

	input, textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	textarea {
		resize: vertical;
	}

	.notification-targets {
		margin-top: 1rem;
	}

	.notification-targets h3 {
		font-size: 0.875rem;
		margin: 0 0 0.5rem;
		color: #4a5568;
	}

	.checkbox-group {
		display: flex;
		gap: 1rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.modal-footer {
		padding: 1rem;
		border-top: 1px solid #e2e8f0;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.cancel-btn {
		background-color: #edf2f7;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		color: #4a5568;
		cursor: pointer;
	}

	.send-btn {
		background-color: #4299e1;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		color: white;
		cursor: pointer;
	}

	.send-btn:disabled {
		background-color: #a0aec0;
		cursor: not-allowed;
	}
</style>
