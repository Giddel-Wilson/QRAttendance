<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  // Props
  export let notifications = [];
  export let userRole = '';
  
  // Local state
  let showingNotificationModal = false;
  let notificationTitle = '';
  let notificationMessage = '';
  let forStudents = true;
  let forLecturers = true;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle close event
  function close() {
    dispatch('close');
  }
  
  // For admin only - open modal to create notification
  function openCreateNotification() {
    notificationTitle = '';
    notificationMessage = '';
    forStudents = true;
    forLecturers = true;
    showingNotificationModal = true;
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
        showingNotificationModal = false;
        // Refresh notifications
        dispatch('refresh');
      } else {
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  }
</script>

<div class="notification-panel" transition:fade={{duration: 200}}>
  <div class="panel-header">
    <h3>Notifications</h3>
    
    <!-- Make the admin create button more visible and prominent -->
    {#if userRole === 'ADMIN'}
      <button class="create-btn" on:click={openCreateNotification} title="Create new notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>New</span>
      </button>
    {/if}
    
    <button class="close-btn" on:click={close}>×</button>
  </div>

  <div class="notification-list">
    {#if notifications.length === 0}
      <div class="empty-state">
        <p>No notifications at this time.</p>
      </div>
    {:else}
      {#each notifications as notification}
        <div class="notification-item">
          <h4 class="notification-title">{notification.title}</h4>
          <p class="notification-message">{notification.message}</p>
          <span class="notification-time">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<!-- Create notification modal -->
{#if showingNotificationModal}
  <div class="modal-overlay" on:click|self={() => showingNotificationModal = false}>
    <div class="modal-container">
      <div class="modal-header">
        <h2>Create Notification</h2>
        <button class="close-btn" on:click={() => showingNotificationModal = false}>×</button>
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
        <button class="cancel-btn" on:click={() => showingNotificationModal = false}>Cancel</button>
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

<style>
  .notification-panel {
    position: absolute;
    top: 60px;
    right: 20px;
    width: 350px;
    max-width: calc(100vw - 40px);
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #2d3748;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 0.875rem;
    cursor: pointer;
    margin-left: auto;
    margin-right: 10px;
  }
  
  .create-btn:hover {
    background-color: #3182ce;
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

  .notification-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .notification-item {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-title {
    margin: 0 0 0.25rem;
    font-size: 0.875rem;
    color: #2d3748;
  }

  .notification-message {
    margin: 0 0 0.5rem;
    font-size: 0.813rem;
    color: #4a5568;
    line-height: 1.4;
  }

  .notification-time {
    display: block;
    font-size: 0.75rem;
    color: #a0aec0;
    text-align: right;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #a0aec0;
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
    display: flex;
    flex-direction: column;
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
