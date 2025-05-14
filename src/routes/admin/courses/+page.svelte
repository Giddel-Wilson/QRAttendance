<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;
	export let form;

	const { courses, lecturers, pagination, filters } = data;

	// More detailed debug output
	console.log(`Client received ${lecturers?.length || 0} lecturers`);
	console.log('All lecturers data:', lecturers);
	if (lecturers?.length > 0) {
		console.log('First lecturer:', lecturers[0]);
	} else {
		console.log('No lecturers found in data');
	}

	// Modal states
	let showCreateModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let showDiagnosticModal = false;

	// Form data
	let newCourse = {
		code: '',
		name: '',
		department: '',
		semester: 'FIRST', // Default to FIRST semester
		description: '',
		lecturerIds: [] // Changed from lecturerId to lecturerIds array
	};

	let editingCourse = {
		id: '',
		code: '',
		name: '',
		department: '',
		semester: 'FIRST',
		description: '',
		lecturerIds: [] // Changed from lecturerId to lecturerIds array
	};

	let deletingCourse = {
		id: '',
		code: '',
		name: ''
	};

	// Department options - updated to Faculty of Computing departments
	const departments = ['Computer Science', 'Information Technology', 'CyberSecurity'];

	// Modal functions
	function openCreateModal() {
		console.log('Opening create modal. Available lecturers:', lecturers);
		newCourse = {
			code: '',
			name: '',
			department: '',
			semester: 'FIRST',
			description: '',
			lecturerIds: []
		};
		showCreateModal = true;
	}

	// Function to open edit modal with selected course
	async function openEditModal(course) {
		editingCourse = {
			id: course.id,
			code: course.code,
			name: course.name,
			department: course.department || '',
			semester: course.semester || 'FIRST',
			description: course.description || '',
			lecturerIds: [] // Initialize empty array
		};

		// Populate with lecturer IDs from the course
		if (course.lecturers && Array.isArray(course.lecturers)) {
			editingCourse.lecturerIds = course.lecturers.map((l) => l.lecturerId);
		}

		console.log('Editing course with lecturers:', editingCourse.lecturerIds);
		showEditModal = true;
	}

	function openDeleteModal(course) {
		deletingCourse = {
			id: course.id,
			code: course.code,
			name: course.name
		};
		showDeleteModal = true;
	}

	// Add this diagnostic function
	function openDiagnosticModal() {
		showDiagnosticModal = true;
	}

	// Close all modals
	function closeModals() {
		showCreateModal = false;
		showEditModal = false;
		showDeleteModal = false;
		showDiagnosticModal = false;
	}

	// Handle lecturer selection/deselection
	function toggleLecturerSelection(lecturerId) {
		if (editingCourse.lecturerIds.includes(lecturerId)) {
			editingCourse.lecturerIds = editingCourse.lecturerIds.filter((id) => id !== lecturerId);
		} else {
			editingCourse.lecturerIds = [...editingCourse.lecturerIds, lecturerId];
		}
	}

	// Same for the new course form
	function toggleNewCourseLecturerSelection(lecturerId) {
		if (newCourse.lecturerIds.includes(lecturerId)) {
			newCourse.lecturerIds = newCourse.lecturerIds.filter((id) => id !== lecturerId);
		} else {
			newCourse.lecturerIds = [...newCourse.lecturerIds, lecturerId];
		}
	}

	// Function to handle form submission and refreshing
	function handleSubmit(closeModalFunction) {
		return ({ form, data, action, cancel }) => {
			return async ({ result }) => {
				if (result.type === 'success' || result.data?.success) {
					// Close the modal
					closeModalFunction();

					// Refresh the page after a short delay
					setTimeout(() => {
						goto('/admin/courses', { replaceState: true, invalidateAll: true });
					}, 300);
				}
			};
		};
	}

	// Enhanced form submission with immediate page reload
	function handleFormSubmit() {
		return async ({ result }) => {
			if (result.type === 'success' || result.data?.success) {
				// Close modals first
				closeModals();

				// Reload the page immediately
				console.log('Reloading page after successful operation');
				window.location.reload(); // Force a complete page reload
			}
		};
	}
</script>

<DashboardLayout role="ADMIN" userName={data.userProfile?.name || 'Administrator'}>
	<div class="course-management">
		<div class="page-header">
			<h1>Course Management</h1>
			<div class="header-actions">
				<button class="debug-button" on:click={openDiagnosticModal}> Check Database </button>
				<button class="add-button" on:click={openCreateModal}> Add Course </button>
			</div>
		</div>

		<Card>
			<div class="course-table-container">
				<table class="course-table">
					<thead>
						<tr>
							<th>Code</th>
							<th>Name</th>
							<th>Department</th>
							<th>Semester</th>
							<th>Lecturers</th>
							<!-- Changed from "Lecturer" to "Lecturers" -->
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#if courses.length === 0}
							<tr>
								<td colspan="6" class="empty-message">No courses found</td>
							</tr>
						{:else}
							{#each courses as course}
								<tr>
									<td>{course.code}</td>
									<td>{course.name}</td>
									<td>{course.department || 'Not specified'}</td>
									<td>{course.semester || 'FIRST'}</td>
									<td>{course.lecturerDisplay}</td>
									<td>
										<div class="action-buttons">
											<button class="icon-button edit" on:click={() => openEditModal(course)}
												>✏️</button
											>
											<button class="icon-button delete" on:click={() => openDeleteModal(course)}
												>🗑️</button
											>
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

	<!-- Create Course Modal -->
	{#if showCreateModal}
		<div class="modal-overlay">
			<div class="modal">
				<div class="modal-header">
					<h2>Add New Course</h2>
					<button class="close-button" on:click={closeModals}>&times;</button>
				</div>

				<form method="POST" action="?/createCourse" use:enhance={handleFormSubmit}>
					<div class="form-group">
						<label for="courseCode">Course Code</label>
						<input type="text" id="courseCode" name="code" bind:value={newCourse.code} required />
					</div>

					<div class="form-group">
						<label for="courseName">Course Name</label>
						<input type="text" id="courseName" name="name" bind:value={newCourse.name} required />
					</div>

					<div class="form-group">
						<label for="department">Department</label>
						<select id="department" name="department" bind:value={newCourse.department} required>
							<option value="">-- Select Department --</option>
							{#each departments as dept}
								<option value={dept}>{dept}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="semester">Semester</label>
						<select id="semester" name="semester" bind:value={newCourse.semester} required>
							<option value="FIRST">First Semester</option>
							<option value="SECOND">Second Semester</option>
						</select>
					</div>

					<!-- Replace single lecturer dropdown with multi-select -->
					<div class="form-group">
						<label>Assigned Lecturers</label>
						<div class="lecturer-selection">
							{#if Array.isArray(data.lecturers) && data.lecturers.length > 0}
								{#each data.lecturers as lecturer}
									<div class="lecturer-option">
										<input
											type="checkbox"
											id="new-lecturer-{lecturer.id}"
											name="lecturerIds[]"
											value={lecturer.id}
											on:change={() => toggleNewCourseLecturerSelection(lecturer.id)}
											checked={newCourse.lecturerIds.includes(lecturer.id)}
										/>
										<label for="new-lecturer-{lecturer.id}">
											{lecturer.name || lecturer.email} ({lecturer.email})
										</label>
									</div>
								{/each}
							{:else}
								<p class="hint-text">
									No lecturers found. Use "Check Database" button to find accounts.
								</p>
							{/if}
						</div>
					</div>

					<div class="form-group">
						<label for="description">Description (optional)</label>
						<textarea id="description" name="description" bind:value={newCourse.description}
						></textarea>
					</div>

					<div class="form-actions">
						<button type="button" class="cancel-button" on:click={closeModals}> Cancel </button>
						<button
							type="submit"
							class="submit-button"
							disabled={!newCourse.code || !newCourse.name}
						>
							Create Course
						</button>
					</div>

					{#if form?.error && !form?.success}
						<div class="error-message">{form.error}</div>
					{/if}
				</form>
			</div>
		</div>
	{/if}

	<!-- Edit Course Modal -->
	{#if showEditModal}
		<div class="modal-overlay">
			<div class="modal">
				<div class="modal-header">
					<h2>Edit Course</h2>
					<button class="close-button" on:click={closeModals}>&times;</button>
				</div>

				<form method="POST" action="?/updateCourse" use:enhance={handleFormSubmit}>
					<input type="hidden" name="id" value={editingCourse.id} />

					<div class="form-group">
						<label for="editCourseCode">Course Code</label>
						<input
							type="text"
							id="editCourseCode"
							name="code"
							bind:value={editingCourse.code}
							required
						/>
					</div>

					<div class="form-group">
						<label for="editCourseName">Course Name</label>
						<input
							type="text"
							id="editCourseName"
							name="name"
							bind:value={editingCourse.name}
							required
						/>
					</div>

					<div class="form-group">
						<label for="editDepartment">Department</label>
						<select
							id="editDepartment"
							name="department"
							bind:value={editingCourse.department}
							required
						>
							<option value="">-- Select Department --</option>
							{#each departments as dept}
								<option value={dept}>{dept}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="editSemester">Semester</label>
						<select id="editSemester" name="semester" bind:value={editingCourse.semester} required>
							<option value="FIRST">First Semester</option>
							<option value="SECOND">Second Semester</option>
						</select>
					</div>

					<!-- Replace single lecturer dropdown with multi-select -->
					<div class="form-group">
						<label>Assigned Lecturers</label>
						<div class="lecturer-selection">
							{#if Array.isArray(data.lecturers) && data.lecturers.length > 0}
								{#each data.lecturers as lecturer}
									<div class="lecturer-option">
										<input
											type="checkbox"
											id="edit-lecturer-{lecturer.id}"
											name="lecturerIds[]"
											value={lecturer.id}
											checked={editingCourse.lecturerIds.includes(lecturer.id)}
											on:change={() => toggleLecturerSelection(lecturer.id)}
										/>
										<label for="edit-lecturer-{lecturer.id}">
											{lecturer.name || lecturer.email} ({lecturer.email})
										</label>
									</div>
								{/each}
							{:else}
								<p class="hint-text">No lecturers found in database.</p>
							{/if}
						</div>
					</div>

					<div class="form-group">
						<label for="editDescription">Description (optional)</label>
						<textarea id="editDescription" name="description" bind:value={editingCourse.description}
						></textarea>
					</div>

					<div class="form-actions">
						<button type="button" class="cancel-button" on:click={closeModals}> Cancel </button>
						<button
							type="submit"
							class="submit-button"
							disabled={!editingCourse.code || !editingCourse.name}
						>
							Update Course
						</button>
					</div>

					{#if form?.error && !form?.success}
						<div class="error-message">{form.error}</div>
					{/if}
				</form>
			</div>
		</div>
	{/if}

	<!-- Delete Course Modal -->
	{#if showDeleteModal}
		<div class="modal-overlay">
			<div class="modal">
				<div class="modal-header">
					<h2>Delete Course</h2>
					<button class="close-button" on:click={closeModals}>&times;</button>
				</div>

				<form method="POST" action="?/deleteCourse" use:enhance={handleFormSubmit}>
					<input type="hidden" name="id" value={deletingCourse.id} />

					<div class="confirmation-message">
						<p>
							Are you sure you want to delete the course <strong
								>{deletingCourse.code}: {deletingCourse.name}</strong
							>?
						</p>
						<p>This action cannot be undone.</p>
					</div>

					<div class="form-actions">
						<button type="button" class="cancel-button" on:click={closeModals}> Cancel </button>
						<button type="submit" class="delete-button"> Delete Course </button>
					</div>

					{#if form?.error && !form?.success}
						<div class="error-message">{form.error}</div>
					{/if}
				</form>
			</div>
		</div>
	{/if}

	<!-- Diagnostic Modal -->
	{#if showDiagnosticModal}
		<div class="modal-overlay">
			<div class="modal">
				<div class="modal-header">
					<h2>Database Account Check</h2>
					<button class="close-button" on:click={closeModals}>&times;</button>
				</div>

				<form method="POST" action="?/checkLecturers" use:enhance>
					<p>Click the button below to check for user accounts in the database.</p>
					<p>Currently showing: {Array.isArray(lecturers) ? lecturers.length : 0} accounts</p>

					<div class="form-actions">
						<button type="submit" class="submit-button"> Load All Users </button>
					</div>

					{#if form?.success && form?.message}
						<div class="info-message">{form.message}</div>
					{/if}

					{#if form?.success && form?.allUsers}
						<div class="success-message">
							<p>Found {form.allUsers.length} accounts in the database.</p>

							{#if form.allUsers && form.allUsers.length > 0}
								<h4>User Accounts in Database:</h4>
								<div class="user-list-container">
									<table class="user-list">
										<thead>
											<tr>
												<th>Name</th>
												<th>Email</th>
												<th>Role</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{#each form.allUsers as user}
												<tr>
													<td>{user.name || 'No name'}</td>
													<td>{user.email}</td>
													<td>{user.role || 'Unknown'}</td>
													<td>
														<form method="POST" action="?/setAsLecturer">
															<input type="hidden" name="userId" value={user.id} />
															<button type="submit" class="small-action-button">
																Make Lecturer
															</button>
														</form>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{:else}
								<p class="warning">No user accounts found in the database at all.</p>
							{/if}
						</div>
					{/if}

					{#if form?.error}
						<div class="error-message">{form.error}</div>
					{/if}
				</form>

				<hr class="divider" />

				<!-- Emergency lecturer role assignment -->
				<form method="POST" action="?/makeLecturer" use:enhance>
					<h4>Make User a Lecturer</h4>
					<p>Enter the email address of an existing user to make them a lecturer:</p>

					<div class="form-group">
						<label for="userEmail">User Email</label>
						<input type="email" id="userEmail" name="email" required />
					</div>

					<div class="form-actions">
						<button type="submit" class="emergency-button"> Make User a Lecturer </button>
					</div>

					{#if form?.error}
						<div class="error-message">{form.error}</div>
					{/if}
				</form>
			</div>
		</div>
	{/if}

	<!-- Success Toast -->
	{#if form?.success}
		<div class="success-toast">
			{form.message || 'Operation completed successfully'}
		</div>
	{/if}
</DashboardLayout>

<style>
	.course-management {
		padding: 1rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 1.5rem;
		color: #2d3748;
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.debug-button {
		background-color: #ecc94b;
		color: #744210;
		border: none;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-weight: 500;
	}

	.add-button {
		background-color: #48bb78;
		color: white;
		border: none;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-weight: 500;
	}

	.course-table-container {
		overflow-x: auto;
	}

	.course-table {
		width: 100%;
		border-collapse: collapse;
	}

	.course-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		background-color: #f7fafc;
		color: #4a5568;
		font-weight: 600;
	}

	.course-table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #edf2f7;
		color: #4a5568;
	}

	.description-cell {
		max-width: 250px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.icon-button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		padding: 0.25rem;
		border-radius: 0.25rem;
	}

	.icon-button.edit:hover {
		background-color: #bee3f8;
	}

	.icon-button.delete:hover {
		background-color: #fed7d7;
	}

	.empty-message {
		text-align: center;
		padding: 2rem;
		color: #a0aec0;
	}

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
		z-index: 50;
		padding: 1rem;
	}

	.modal {
		width: 100%;
		max-width: 600px;
		background-color: white;
		border-radius: 0.5rem;
		overflow: hidden;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
	}

	.modal-header {
		padding: 1rem 1.5rem;
		background-color: #f7fafc;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.modal-header h2 {
		font-size: 1.25rem;
		color: #2d3748;
		margin: 0;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		color: #a0aec0;
	}

	.modal form {
		padding: 1.5rem;
		overflow-y: auto;
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
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
	}

	.form-group textarea {
		min-height: 100px;
		resize: vertical;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.cancel-button {
		padding: 0.5rem 1rem;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.25rem;
		color: #4a5568;
		cursor: pointer;
		font-weight: 500;
	}

	.submit-button {
		padding: 0.5rem 1rem;
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: 500;
	}

	.delete-button {
		padding: 0.5rem 1rem;
		background-color: #f56565;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: 500;
	}

	.submit-button:disabled {
		opacity: 0.5;
		font-size: 0.875rem;
	}

	.success-message {
		margin-top: 1rem;
		padding: 0.5rem;
		color: #2f855a;
		background-color: #c6f6d5;
		border-radius: 0.25rem;
	}

	.hint-text {
		font-size: 0.8rem;
		color: #718096;
		margin-top: 0.5rem;
	}

	.success-toast {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background-color: #48bb78;
		color: white;
		padding: 1rem 1.5rem;
		border-radius: 0.25rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 40;
		animation: fadeOut 4s forwards;
	}

	@keyframes fadeOut {
		0% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.header-actions {
			flex-direction: column;
			gap: 0.5rem;
		}

		.debug-button,
		.add-button {
			width: 100%;
		}
	}

	@media (max-width: 640px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
	}

	.user-list-container {
		max-height: 200px;
		overflow-y: auto;
		margin: 1rem 0;
	}

	.user-list {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.user-list th {
		background-color: #edf2f7;
		padding: 0.5rem;
		text-align: left;
	}

	.user-list td {
		padding: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.highlight-row {
		background-color: #c6f6d5;
	}

	.fix-button {
		background-color: #d69e2e;
		color: white;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		width: 100%;
	}

	.single-action {
		justify-content: center;
		margin-top: 0.5rem;
		margin-bottom: 1rem;
	}

	.warning {
		color: #e53e3e;
		font-weight: 500;
	}

	.lecturer-info {
		margin-top: 0.5rem;
		font-size: 0.875rem;
	}

	.success-text {
		color: #2f855a;
	}

	.info-message {
		margin-top: 1rem;
		padding: 0.5rem;
		color: #2b6cb0;
		background-color: #bee3f8;
		border-radius: 0.25rem;
	}

	.lecturer-detail {
		background-color: #f0fff4;
		padding: 1rem;
		border-radius: 0.25rem;
		margin: 1rem 0;
	}

	.lecturer-detail p {
		margin: 0.25rem 0;
	}

	.emergency-section {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #fff5f5;
		border: 1px solid #fed7d7;
		border-radius: 0.25rem;
	}

	.emergency-button {
		background-color: #e53e3e;
		color: white;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		width: 100%;
	}

	.small-action-button {
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.lecturer-button {
		background-color: #805ad5;
		color: white;
		border: none;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-weight: 500;
	}

	.divider {
		margin: 1.5rem 0;
		border: none;
		border-top: 1px solid #e2e8f0;
	}

	.lecturer-selection {
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 0.5rem;
		margin-bottom: 1rem;
	}

	.lecturer-option {
		padding: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid #f7fafc;
	}

	.lecturer-option:last-child {
		border-bottom: none;
	}

	.lecturer-option input[type='checkbox'] {
		width: auto;
		margin-right: 0.5rem;
	}
</style>
