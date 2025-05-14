<script>
  import { onMount } from 'svelte';
  import NotificationPanel from './NotificationPanel.svelte';
  
  export let userName = '';
  export let userRole = ''; // Make sure this prop is properly passed from parent components
  
  let showNotifications = false;
  let notifications = [];
  let unreadCount = 0;

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        notifications = await response.json();
        unreadCount = notifications.length; // You could implement read/unread status in the future
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  function toggleNotifications() {
    showNotifications = !showNotifications;
    if (showNotifications) {
      unreadCount = 0; // Mark as read when opened
    }
  }

  onMount(() => {
    fetchNotifications();
  });
</script>

<header class="header">
  <div class="logo">
    <span>Attendance System</span>
  </div>
  
  <div class="actions">
    <!-- Notification Icon -->
    <div class="notification-container">
      <button class="notification-btn" on:click={toggleNotifications}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {#if unreadCount > 0}
          <span class="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        {/if}
      </button>
      
      {#if showNotifications}
        <NotificationPanel 
          {notifications} 
          {userRole} <!-- Make sure userRole is passed -->
          on:close={() => showNotifications = false} 
          on:refresh={fetchNotifications}
        />
      {/if}
    </div>
    
    <div class="user">
      <span class="user-name">{userName}</span>
      <span class="user-role">{userRole}</span>
    </div>
  </div>
</header>

<style>
  /* ...existing styles... */
  
  .notification-container {
    position: relative;
  }
  
  .notification-btn {
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    padding: 0.5rem;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #f56565;
    color: white;
    border-radius: 9999px;
    font-size: 10px;
    padding: 2px 5px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* ...existing styles... */
</style>
