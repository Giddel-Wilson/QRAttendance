<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	export let data;

	let { users = [] } = data;
	let userCount = users.length;

	// Debug output to verify data in the browser console
	console.log('Users data from server:', data.users);

	// Check if matric/level data exists
	const hasMatricData = data.users.some((user) => user.matricNumber);
	const hasLevelData = data.users.some((user) => user.level);
	console.log(`Has Matric Data: ${hasMatricData}, Has Level Data: ${hasLevelData}`);

	// For debugging - log users array
	onMount(() => {
		console.log('[Admin Users] Client-side users array:', users);
		console.log(`[Admin Users] Client received ${users.length} users`);

		// Add a fallback if users is undefined
		if (!users || !Array.isArray(users)) {
			console.error('[Admin Users] Users data is invalid:', users);
			users = [];
		}

		userCount = users.length;
	});

	function formatDate(dateString: any): string {
		if (!dateString) return '-';
		try {
			return new Date(dateString).toLocaleDateString();
		} catch (e) {
			return '-';
		}
	}

	function getRoleBadgeClass(role: string | null): string {
		if (!role) return 'unknown';
		const normalizedRole = String(role).toLowerCase();
		if (normalizedRole.includes('admin')) return 'admin';
		if (normalizedRole.includes('lecturer')) return 'lecturer';
		if (normalizedRole.includes('student')) return 'student';
		return 'unknown';
	}

	// User edit/delete modal state
	let showEditModal = false;
	let showDeleteModal = false;
	let selectedUser = null;

	// Edit form fields
	let editName = '';
	let editEmail = '';
	let editRole = '';
	let editMatricNumber = '';
	let editLevel = '';
	let editDepartment = '';

	// Open edit modal with user data
	function openEditModal(user) {
		selectedUser = user;
		// Set individual form fields
		editName = user.name || '';
		editEmail = user.email || '';
		editRole = user.role || '';
		editMatricNumber = user.matricNumber || '';
		editLevel = user.level || '';
		editDepartment = user.department || '';
		showEditModal = true;
	}

	// Open delete confirmation modal
	function openDeleteModal(user) {
		selectedUser = user;
		showDeleteModal = true;
	}

	// Close any modal
	function closeModals() {
		showEditModal = false;
		showDeleteModal = false;
		selectedUser = null;
	}

	// Handle form submission
	function handleSubmit() {
		// Form is submitted via enhance, this is just for extra logic if needed
		closeModals();
	}
</script>

<DashboardLayout role="ADMIN" userName={data.userProfile?.name || 'Administrator'}>
	<div class="user-management">
		<div class="page-header">
			<h1>User Management</h1>
		</div>

		{#if data.error}
			<div class="error-banner">
				Error loading users: {data.error}
			</div>
		{/if}

		<Card>
			<!-- Debug information -->
			<div class="debug-info">
				Database contains {userCount} users.
				{#if userCount === 0}
					<button on:click={() => console.log('[Admin Users] Current data:', data)}>
						Log Data to Console
					</button>
				{/if}
			</div>

			<div class="user-table-container">
				<table class="user-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Department</th>
							<th>Matric Number</th>
							<th>Level</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#if !users || users.length === 0}
							<tr>
								<td colspan="7" class="empty-message">No users found</td>
							</tr>
						{:else}
							{#each users as user}
								<tr>
									<td>{user.name || 'N/A'}</td>
									<td>{user.email}</td>
									<td>
										<span class="role-badge {getRoleBadgeClass(user.role)}">
											{user.role || 'Unknown'}
										</span>
									</td>
									<td>{user.department || 'N/A'}</td>
									<td class="matric-cell">{user.matricNumber || 'N/A'}</td>
									<td class="level-cell">{user.level ? `${user.level}L` : 'N/A'}</td>
									<td class="actions-cell">
										<div class="actions-container">
											<button 
												class="action-btn edit-btn" 
												on:click={() => openEditModal(user)}
												title="Edit User"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
													<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
												</svg>
											</button>
											<button 
												class="action-btn delete-btn" 
												on:click={() => openDeleteModal(user)}
												title="Delete User"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M3 6h18"></path>
													<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
													<line x1="10" y1="11" x2="10" y2="17"></line>
													<line x1="14" y1="11" x2="14" y2="17"></line>
												</svg>
											</button>
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

	<!-- Edit User Modal -->
	{#if showEditModal && selectedUser}
		<div class="modal-overlay" on:click|self={closeModals}>
			<div class="modal-container">
				<div class="modal-header">
					<h2>Edit User</h2>
					<button class="close-btn" on:click={closeModals}>×</button>
				</div>
				<form method="POST" action="?/updateUser" use:enhance on:submit={handleSubmit}>
					<input type="hidden" name="id" value={selectedUser.id} />
					<div class="form-group">
						<label for="name">Name</label>
						<input 
							type="text" 
							id="name" 
							name="name" 
							bind:value={editName} 
							required 
						/>
					</div>
					<div class="form-group">
						<label for="email">Email</label>
						<input 
							type="email" 
							id="email" 
							name="email" 
							bind:value={editEmail}
							required 
						/>
					</div>
					<div class="form-group">
						<label for="role">Role</label>
						<select id="role" name="role" bind:value={editRole}>
							<option value="STUDENT">Student</option>
							<option value="LECTURER">Lecturer</option>
							<option value="ADMIN">Admin</option>
						</select>
					</div>
					
					<!-- Show student-specific fields only for students -->
					{#if editRole === 'STUDENT'}
						<div class="form-group">
							<label for="matricNumber">Matric Number</label>
							<input 
								type="text" 
								id="matricNumber" 
								name="matricNumber" 
								bind:value={editMatricNumber}
							/>
						</div>
						<div class="form-group">
							<label for="level">Level</label>
							<input 
								type="text" 
								id="level" 
								name="level" 
								bind:value={editLevel}
							/>
						</div>
						<div class="form-group">
							<label for="department">Department</label>
							<select 
								id="department" 
								name="department" 
								bind:value={editDepartment}
							>
								<option value="">-- Select Department --</option>
								<option value="Computer Science">Computer Science</option>
								<option value="Information Technology">Information Technology</option>
								<option value="CyberSecurity">CyberSecurity</option>
							</select>
						</div>
					{/if}
					
					<div class="form-actions">
						<button type="button" class="cancel-btn" on:click={closeModals}>Cancel</button>
						<button type="submit" class="save-btn">Save Changes</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Delete Confirmation Modal -->
	{#if showDeleteModal && selectedUser}
		<div class="modal-overlay" on:click|self={closeModals}>
			<div class="modal-container delete-modal">
				<div class="modal-header">
					<h2>Delete User</h2>
					<button class="close-btn" on:click={closeModals}>×</button>
				</div>
				<div class="modal-content">
					<p class="warning-text">Are you sure you want to delete {selectedUser.name}?</p>
					<p class="delete-note">This action cannot be undone.</p>
				</div>
				<form method="POST" action="?/deleteUser" use:enhance on:submit={handleSubmit}>
					<input type="hidden" name="id" value={selectedUser.id} />
					<div class="form-actions">
						<button type="button" class="cancel-btn" on:click={closeModals}>Cancel</button>
						<button type="submit" class="delete-confirm-btn">Delete User</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</DashboardLayout>

<style>
	.user-management {
		padding: 1rem;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		font-size: 1.5rem;
		color: #2d3748;
		margin: 0;
	}

	.debug-info {
		background-color: #ebf8ff;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.25rem;
		color: #4299e1;
		font-size: 0.875rem;
	}

	.debug-info button {
		background-color: #4299e1;
		color: white;
		border: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		margin-left: 0.5rem;
		cursor: pointer;
	}

	.error-banner {
		background-color: #fed7d7;
		color: #c53030;
		padding: 1rem;
		border-radius: 0.25rem;
		margin-bottom: 1rem;
	}

	.user-table-container {
		overflow-x: auto;
	}

	.user-table {
		width: 100%;
		border-collapse: collapse;
	}

	.user-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		background-color: #f7fafc;
		color: #4a5568;
		font-weight: 600;
		border-bottom: 2px solid #e2e8f0;
	}

	.user-table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #edf2f7;
		color: #4a5568;
	}

	.empty-message {
		text-align: center;
		padding: 2rem;
		color: #a0aec0;
	}

	.role-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.role-badge.admin {
		background-color: #fed7d7;
		color: #c53030;
	}

	.role-badge.lecturer {
		background-color: #feebc8;
		color: #c05621;
	}

	.role-badge.student {
		background-color: #bee3f8;
		color: #2b6cb0;
	}

	.role-badge.unknown {
		background-color: #e2e8f0;
		color: #4a5568;
	}

	/* Highlight the matric and level cells for better visibility */
	.matric-cell,
	.level-cell {
		font-weight: 500;
	}

	.actions-cell {
		width: 100px;
	}
	
	.actions-container {
		display: flex;
		gap: 8px;
		justify-content: center;
	}
	
	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.edit-btn {
		background-color: #ebf8ff;
		color: #4299e1;
	}
	
	.edit-btn:hover {
		background-color: #bee3f8;
	}
	
	.delete-btn {
		background-color: #fff5f5;
		color: #f56565;
	}
	
	.delete-btn:hover {
		background-color: #fed7d7;
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
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	
	.delete-modal {
		width: 400px;
	}
	
	.modal-header {
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #e2e8f0;
	}
	
	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #2d3748;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #718096;
	}
	
	.modal-content {
		padding: 1rem;
	}
	
	.warning-text {
		color: #2d3748;
		margin-bottom: 0.5rem;
	}
	
	.delete-note {
		color: #f56565;
		font-size: 0.875rem;
		font-style: italic;
	}
	
	.form-group {
		margin-bottom: 1rem;
		padding: 0 1rem;
	}
	
	.form-group label {
		display: block;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
		color: #4a5568;
	}
	
	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		font-size: 0.875rem;
	}
	
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1rem;
		border-top: 1px solid #e2e8f0;
	}
	
	.cancel-btn {
		background-color: #edf2f7;
		color: #4a5568;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		cursor: pointer;
	}
	
	.save-btn {
		background-color: #4299e1;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		cursor: pointer;
	}
	
	.delete-confirm-btn {
		background-color: #f56565;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		cursor: pointer;
	}
</style>
