<script lang="ts">
	import { isAuthenticated, authUser } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Dashboard from '$lib/components/dashboard/Dashboard.svelte';
	import type { UserResponse } from '$lib/api/authService';

	let user = $state<UserResponse | null>(null);
	let isAuth = $state<boolean>(false);

	isAuthenticated.subscribe((change) => {
		isAuth = change;
	});

	// Subscribe to authentication changes
	authUser.subscribe((change) => {
		if (change) {
			user = change;
		}
	});

	onMount(() => {
		// Redirect to welcome page if not authenticated
		// if (!isAuthenticated) {
		// 	// Use window.location for a full page reload to avoid any SvelteKit routing issues
		// 	window.location.href = '/welcome';
		// }
	});
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	{#if isAuth}
		<Dashboard {user} />
	{:else}
		<div class="py-12 text-center">
			<!-- This is just a fallback while redirecting -->
			<p>Redirecting...</p>
		</div>
	{/if}
</div>
