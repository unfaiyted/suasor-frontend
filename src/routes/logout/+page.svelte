<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let isLoggingOut = $state(true);

	// Add direct logout functionality to ensure localStorage is properly cleared
	async function forceLogout() {
		console.log('Logout page - forcing logout');

		// Make sure we're on the client side to avoid server errors
		if (!browser || typeof window === 'undefined') {
			console.log('Not running in browser environment, skipping logout process');
			return;
		}

		// First clear localStorage directly
		console.log('Directly clearing localStorage');
		try {
			// Use localStorage.clear() for simplicity and reliability
			localStorage.clear();
			console.log('localStorage cleared');
		} catch (err) {
			console.error('Error clearing localStorage:', err);
		}

		// Then use the store's logout method
		try {
			console.log('Calling authStore.logout()');
			await authStore.logout();
		} catch (error) {
			console.error('Error during logout:', error);
		}

		// Wait a moment before redirecting
		console.log('Logout process completed, redirecting soon...');
		// Use a smaller timeout
		setTimeout(() => {
			if (browser && typeof window !== 'undefined') {
				console.log('Redirecting to login page');
				goto('/login');
			}
		}, 300);
	}

	// Only run the logout process on the client side
	onMount(() => {
		console.log('Logout page mounted - calling logout safely on client side');
		// Call the forceLogout function now that we're on the client
		forceLogout()
			.then(() => {
				console.log('forceLogout completed');
				isLoggingOut = false;
			})
			.catch((error) => {
				console.error('Error in forceLogout:', error);
				isLoggingOut = false;
			});
	});
</script>

{#if isLoggingOut}
	<div class="container flex h-full items-center justify-center">
		<div class="card p-8 text-center">
			<h2 class="h2 mb-4">Logging out...</h2>
			<p>Please wait while we log you out.</p>
		</div>
	</div>
{:else}
	<div class="container flex h-full items-center justify-center">
		<div class="card p-8 text-center">
			<h2 class="h2 mb-4">Logged Out</h2>
			<p>You have been successfully logged out.</p>
			<p class="mt-4">Redirecting to login page...</p>
		</div>
	</div>
{/if}

