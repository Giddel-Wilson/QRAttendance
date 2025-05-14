<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card } from '$lib/components';

	export let data;
	const { records } = data;
</script>

<DashboardLayout>
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-6 text-2xl font-bold">Attendance Records</h1>

		{#if records.length > 0}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each records as record}
					<Card>
						<h2 class="text-lg font-semibold">{record.course.name}</h2>
						<p>Date: {new Date(record.createdAt).toLocaleDateString()}</p>
						<p>Students: {record._count.attendances}</p>
					</Card>
				{/each}
			</div>
		{:else}
			<p>No attendance records found.</p>
		{/if}
	</div>
</DashboardLayout>
