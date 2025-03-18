<!-- /routes/login/+page.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/auth';
	import LoginComponent from '$lib/components/auth/Login.svelte';

	// Get return URL from query params if available
	$: returnUrl = page.url.searchParams.get('redirect') || '/';

	// Redirect if already authenticated
	onMount(() => {
		if ($isAuthenticated) {
			goto(returnUrl);
		}
	});

	function handleLoginSuccess(event) {
		console.log('Login successful for:', event.detail.email);
		goto(returnUrl);
	}

	function handleLoginError(event) {
		console.error('Login error:', event.detail.message);
	}
</script>

<div class="container mx-auto max-w-md px-4 py-10">
	<!-- Header Section -->
	<header class="mb-8 text-center">
		<h1 class="h1 text-primary-500 mb-2 font-bold">Welcome Back</h1>
		<p class="preset-typo-subtitle text-lg">Sign in to your account to continue</p>
	</header>

	<LoginComponent {returnUrl} on:success={handleLoginSuccess} on:error={handleLoginError} />
</div>
