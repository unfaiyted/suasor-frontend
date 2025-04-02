<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/auth';
	import Login from '$lib/components/auth/Login.svelte';

	let isAuth = $state(false);
	isAuthenticated.subscribe((change) => {
		console.log('isAuthenticated state changed:', change);
		isAuth = change;
	});

	// Get return URL from query params
	let returnUrl = $state('/');

	// console.log('Login page mounted, auth state:');
	// $effect(() => {
	// 	returnUrl = page.url.searchParams.get('redirect') || '/';
	// });
	//
	// // Check authentication state whenever it changes
	// $effect(() => {
	// 	console.log('Login page: auth state changed:', {
	// 		isAuth,
	// 		returnUrl
	// 	});
	//
	// 	// Redirect if authenticated (do this in both onMount and when auth state changes)
	// 	if (isAuth) {
	// 		console.log('Already logged in, redirecting to:', returnUrl);
	// 		goto(returnUrl);
	// 	}
	// });
</script>

<div class="container mx-auto max-w-md px-4 py-10">
	<!-- Header Section -->
	<header class="mb-8 text-center">
		<h1 class="h1 text-primary-500 mb-2 font-bold">Welcome Back</h1>
		<p class="preset-typo-subtitle text-lg">Sign in to your account to continue</p>
	</header>

	<Login {returnUrl} />
</div>

