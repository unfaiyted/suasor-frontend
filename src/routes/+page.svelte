<script lang="ts">
	import { isAuthenticated, authUser } from '$lib/stores/auth';
	import Dashboard from '$lib/components/dashboard/Dashboard.svelte';

	let user = $state(null);

	// Subscribe to authentication changes
	authUser.subscribe((change) => {
		if (change) {
			user = change;
		}
	});
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	{#if isAuthenticated}
		<Dashboard {user} />
	{:else}
		<div class="py-12 text-center">
			<h2 class="mb-4 text-2xl font-bold">Please log in to access your dashboard</h2>
			<a href="/login" class="btn btn-primary">Log In</a>
		</div>
	{/if}
</div>
