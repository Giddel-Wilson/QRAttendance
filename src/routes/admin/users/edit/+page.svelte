<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	
	let data;
	let submitting = false;

	onMount(() => {
		data = get(page).data;
	});
	
	// More reliable form submission with guaranteed redirect
	function handleFormSubmit(event) {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form);
		
		fetch(form.action, {
			method: 'POST',
			body: formData
		})
		.then(response => {
			if (response.ok) {
				alert('User updated successfully!');
				
				// Force a hard refresh after exactly 200ms
				setTimeout(() => {
					document.location.href = "/admin/users";
				}, 200);
			} else {
				throw new Error('Update failed');
			}
		})
		.catch(error => {
			console.error('Error:', error);
			alert('Failed to update user');
		});
		
		return false; // Prevent default form submission
	}
</script>

<form method="POST" action="?/updateUser" on:submit={handleFormSubmit}>
	<input type="hidden" name="id" value={data.user.id} />

	<div class="form-group">
		<label for="name">Name</label>
		<input type="text" id="name" name="name" value={data.user.name || ''} />
	</div>

	<div class="form-group">
		<label for="email">Email</label>
		<input type="email" id="email" name="email" value={data.user.email} />
	</div>

	<div class="form-group">
		<label for="role">Role</label>
		<select id="role" name="role">
			<option value="ADMIN" selected={data.user.role === 'ADMIN'}>Admin</option>
			<option value="LECTURER" selected={data.user.role === 'LECTURER'}>Lecturer</option>
			<option value="STUDENT" selected={data.user.role === 'STUDENT'}>Student</option>
		</select>
	</div>

	<div class="form-group">
		<label for="department">Department</label>
		<select id="department" name="department">
			<option value="">-- Select Department --</option>
			<option value="Computer Science" selected={data.user.department === 'Computer Science'}
				>Computer Science</option
			>
			<option
				value="Information Technology"
				selected={data.user.department === 'Information Technology'}>Information Technology</option
			>
			<option value="CyberSecurity" selected={data.user.department === 'CyberSecurity'}
				>CyberSecurity</option
			>
		</select>
	</div>

	<div class="form-group">
		<label for="matricNumber">Matriculation Number</label>
		<input type="text" id="matricNumber" name="matricNumber" value={data.user.matricNumber || ''} />
	</div>

	<div class="form-group">
		<label for="level">Level</label>
		<select id="level" name="level">
			<option value="">-- Select Level --</option>
			<option value="100" selected={data.user.level === '100'}>100L</option>
			<option value="200" selected={data.user.level === '200'}>200L</option>
			<option value="300" selected={data.user.level === '300'}>300L</option>
			<option value="400" selected={data.user.level === '400'}>400L</option>
			<option value="500" selected={data.user.level === '500'}>500L</option>
		</select>
	</div>

	<div class="form-actions">
		<button type="submit" class="save-button" disabled={submitting}>
			{#if submitting}
				<span class="loader"></span> Saving...
			{:else}
				Save Changes
			{/if}
		</button>
	</div>
</form>

<style>
	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #cbd5e0;
		border-radius: 0.375rem;
	}

	.form-actions {
		margin-top: 1.5rem;
		text-align: right;
	}

	.save-button {
		padding: 0.75rem 1.5rem;
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s;
		display: inline-flex;
		align-items: center;
	}

	.save-button:disabled {
		background-color: #a0aec0;
		cursor: not-allowed;
	}

	.loader {
		border: 2px solid rgba(255, 255, 255, 0.6);
		border-top: 2px solid white;
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
		animation: spin 0.6s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
