<script lang="ts">
	import '../app.css';
	import HeaderBar from '$lib/components/layout/HeaderBar.svelte';
	import SideBar from '$lib/components/layout/SideBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import GlobalMoviePopover from '$lib/components/chat/GlobalMoviePopover.svelte';
	// import { PanelRight } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { navigating } from '$app/state';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import { authStore } from '$lib/stores/auth';

	let isAuth = $state(false);

	authStore.subscribe((change) => {
		console.log('Auth store changed:', change);
		isAuth = change.isAuthenticated;
	});

	let { children } = $props();
	let authInitialized = $state(false);

	// Define the public paths that don't require authentication
	const publicPaths = ['/login', '/register', '/forgot-password'];

	// Variables for reactive state
	let isPublicPath = $state(false);
	let shouldRedirect = $state(false);
	let isOnboarding = $state(false);

	// Update isOnboarding reactively based on the current path
	$effect(() => {
		isOnboarding = page?.url?.pathname === '/onboarding';
	});

	// Update derived values using $effect
	$effect(() => {
		const pathname = page?.url?.pathname || '';
		isPublicPath = publicPaths.includes(pathname);

		// Only redirect if:
		// 1. Auth is initialized
		// 2. User is not authenticated
		// 3. Current path is not a public path
		shouldRedirect = authInitialized && !isAuth && !isPublicPath;

		// Debug auth state
		console.log('Auth state:', {
			isAuth,
			currentPath: pathname,
			isPublicPath,
			shouldRedirect,
			authInitialized
		});
	});

	onMount(async () => {
		console.log('Layout mounted, initializing auth...');

		// Initialize auth once for the entire application
		authStore.syncWithClient();

		// Also manually check local storage for a more direct check
		const hasToken = localStorage.getItem('suasor_access_token') !== null;
		const hasRefreshToken = localStorage.getItem('suasor_refresh_token') !== null;
		console.log('Direct localStorage check:', { hasToken, hasRefreshToken });

		// If we have tokens but isAuthenticated is false, try to validate the session
		if (hasToken && hasRefreshToken && !isAuth) {
			console.log('Found tokens but not authenticated, validating session...');
			await authStore.validateSession();
		}

		authInitialized = true;
		console.log('Auth initialized, isAuthenticated:', isAuth);
	});

	// Handle navigation changes
	$effect(() => {
		if (navigating && authInitialized) {
			// This is a lightweight check that happens on navigation
			authStore.validateSession();
		}
	});

	// Handle redirection when needed
	$effect(() => {
		if (shouldRedirect) {
			const currentPath = page?.url?.pathname || '';
			console.log('Redirecting unauthenticated user to login from:', currentPath);
			const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
			goto(redirectUrl);
		} else if (authInitialized && isAuth && page?.url?.pathname === '/login') {
			// If we're authenticated but on the login page, redirect to home or the redirect param
			const redirectTo = page?.url?.searchParams?.get('redirect') || '/';
			console.log('Redirecting authenticated user from login page to:', redirectTo);
			goto(redirectTo);
		}
	});
</script>

<div class="mx-auto w-full">
	{#if !isAuth || isPublicPath || isOnboarding}
		<!-- Simple layout for login/register/public pages or when not logged in -->
		<div class="flex min-h-screen w-full flex-col items-center justify-center">
			{@render children()}
		</div>
	{:else}
		<!-- Main application layout for authenticated users -->
		<div class="mx-auto grid w-full">
			<!-- Page -->
			<div class="mx-auto grid w-full grid-cols-[auto_1fr]">
				<SideBar />
				<div class=" w-full">
					<!-- Header -->
					<header><HeaderBar /></header>
					<!-- Main -->
					<div class="flex flex-row">
						<main class="col-span-1 w-full space-y-4 p-4 pt-0">
							{@render children()}
						</main>
					</div>
				</div>
			</div>
			<!-- Footer -->
			<!-- <Footer /> -->
		</div>
	{/if}
	<!-- Global Movie Popover that's managed at the top level (outside any containers) -->
	<GlobalMoviePopover />
</div>
