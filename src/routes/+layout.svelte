<script lang="ts">
	import '../app.css';
	import HeaderBar from '$lib/components/layout/HeaderBar.svelte';
	import SideBar from '$lib/components/layout/SideBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { PanelRight } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { navigating } from '$app/state';
	import { page } from '$app/state';

	import { authStore } from '$lib/stores/auth';

	let { children } = $props();
	let authInitialized = $state(false);
	let isAuthPath = $state(false);
	onMount(() => {
		// Initialize auth once for the entire application
		authStore.syncWithClient();
		authInitialized = true;
	});

	$effect(() => {
		if (navigating && authInitialized) {
			// This is a lightweight check that happens on navigation
			authStore.validateSession();
		}

		isAuthPath = page?.url?.pathname === '/login' || page?.url?.pathname === '/register';
	});

	// Check if current path is login or register
</script>

{#if authInitialized}
	<div class="mx-auto grid w-full 2xl:max-w-[2000px]">
		<!-- Page -->
		<div class="mx-auto grid w-full grid-cols-[auto_1fr_auto]">
			<SideBar />
			<div class="container">
				<!-- Header -->
				<header><HeaderBar /></header>
				<!-- Main -->
				<div class="flex flex-row">
					<main class="col-span-1 w-full space-y-4 p-4 pt-0">
						{@render children()}
					</main>
					<aside class="bg-surface-100-900/20 sticky top-0 col-span-1 hidden h-dvh 2xl:block">
						<PanelRight />
					</aside>
				</div>
			</div>
		</div>
		<!-- Footer -->
		<Footer />
	</div>
{:else if isAuthPath}
	<!-- Simple layout for login/register pages -->
	<div class="flex min-h-screen w-full flex-col items-center justify-center">
		{@render children()}
	</div>
{:else}
	<!-- Redirect message for all other pages when not authenticated -->
	<div class="flex min-h-screen w-full flex-col items-center justify-center">
		<p class="mb-4">Please log in to continue</p>
		<a href="/login" class="text-blue-500 hover:underline">Go to Login</a>
	</div>
{/if}
