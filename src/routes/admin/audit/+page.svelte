<script lang="ts">
  import DashboardLayout from '$lib/components/DashboardLayout.svelte';
  import { Card } from '$lib/components';
  
  export let data;
  
  $: logs = data.logs || [];
  $: stats = data.stats || { totalUsers: 0, totalSessions: 0, totalAttendances: 0 };
  
  // Filter options
  let selectedActionType = 'all';
  let selectedEntityType = 'all';
  let searchTerm = '';
  
  // Apply filters to logs
  $: filteredLogs = logs.filter(log => {
    // Filter by action type
    if (selectedActionType !== 'all' && !log.action?.toLowerCase().includes(selectedActionType)) {
      return false;
    }
    
    // Filter by Activity type
    if (selectedEntityType !== 'all' && log.entityType?.toLowerCase() !== selectedEntityType.toLowerCase()) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !log.details?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  function getActionClass(action) {
    if (!action) return 'unknown';
    
    const lowercaseAction = action.toLowerCase();
    if (lowercaseAction.includes('creat')) return 'create';
    if (lowercaseAction.includes('updat') || lowercaseAction.includes('modif')) return 'update';
    if (lowercaseAction.includes('delet')) return 'delete';
    if (lowercaseAction.includes('login')) return 'login';
    if (lowercaseAction.includes('logout')) return 'logout';
    if (lowercaseAction.includes('assign')) return 'assign';
    if (lowercaseAction.includes('enroll')) return 'enroll';
    if (lowercaseAction.includes('attend')) return 'attendance';
    
    return 'info';
  }
</script>

<DashboardLayout role="ADMIN" userName="Administrator">
  <div class="audit-page">
    <h1 class="page-title">System Audit</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-value">{stats.totalUsers}</p>
      </div>
      
      <div class="stat-card">
        <h3>Total Sessions</h3>
        <p class="stat-value">{stats.totalSessions}</p>
      </div>
      
      <div class="stat-card">
        <h3>Total Attendances</h3>
        <p class="stat-value">{stats.totalAttendances}</p>
      </div>
    </div>
    
    <Card>
      <div class="card-header">
        <h2>System Activity Logs</h2>
        <p class="subtitle">Complete record of all system events</p>
      </div>
      
      <div class="filters">
        <div class="filter-group">
          <label for="actionType">Action Type</label>
          <select id="actionType" bind:value={selectedActionType}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="assign">Assignment</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="entityType">Activity Type</label>
          <select id="entityType" bind:value={selectedEntityType}>
            <option value="all">All Activities</option>
            <option value="user">Users</option>
            <option value="course">Courses</option>
            <option value="session">Sessions</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="search">Search</label>
          <input type="text" id="search" placeholder="Search details..." bind:value={searchTerm}>
        </div>
      </div>
      
      {#if filteredLogs.length === 0}
        <div class="empty-state">
          No audit logs match your filters
        </div>
      {:else}
        <div class="table-container">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Name</th>
                <th>Role</th>
                <th>Action</th>
                <th>Activity Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredLogs as log}
                <tr>
                  <td>{formatDateTime(log.timestamp)}</td>
                  <td>{log.userName || 'System'}</td>
                  <td>{log.userRole || 'N/A'}</td>
                  <td>
                    <span class="tag {getActionClass(log.action)}">
                      {log.action || 'Unknown'}
                    </span>
                  </td>
                  <td>{log.entityType || 'N/A'}</td>
                  <td class="details-cell">{log.details || 'No details'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </Card>
  </div>
</DashboardLayout>

<style>
  .audit-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1.5rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    padding: 1rem;
    text-align: center;
    border-radius: 0.375rem;
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
  }
  
  .stat-card h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    color: #4a5568;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #4299e1;
    margin: 0;
  }
  
  .card-header {
    margin-bottom: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.875rem;
    color: #718096;
    margin: 0.25rem 0 1.5rem;
  }
  
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    background-color: #f7fafc;
    padding: 1rem;
    border-radius: 0.375rem;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    min-width: 200px;
  }
  
  .filter-group label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: #4a5568;
  }
  
  .filter-group select,
  .filter-group input {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e2e8f0;
    font-size: 0.875rem;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .audit-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
  }
  
  .audit-table th,
  .audit-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .audit-table th {
    background-color: #f7fafc;
    color: #4a5568;
    font-weight: 600;
    white-space: nowrap;
  }
  
  .tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .tag.create {
    background-color: #c6f6d5;
    color: #276749;
  }
  
  .tag.update {
    background-color: #bee3f8;
    color: #2b6cb0;
  }
  
  .tag.delete {
    background-color: #fed7d7;
    color: #c53030;
  }
  
  .tag.login {
    background-color: #e9d8fd;
    color: #6b46c1;
  }
  
  .tag.logout {
    background-color: #fbd38d;
    color: #c05621;
  }
  
  .tag.assign, .tag.enroll {
    background-color: #fefcbf;
    color: #975a16;
  }
  
  .tag.attendance {
    background-color: #b2f5ea;
    color: #285e61;
  }
  
  .tag.info {
    background-color: #e2e8f0;
    color: #4a5568;
  }
  
  .details-cell {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .empty-state {
    padding: 3rem;
    text-align: center;
    color: #a0aec0;
    font-style: italic;
    background-color: #f7fafc;
    border-radius: 0.375rem;
    border: 1px dashed #e2e8f0;
  }
</style>
