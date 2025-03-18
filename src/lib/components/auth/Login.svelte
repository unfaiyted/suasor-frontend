<!-- $lib/components/auth/Login.svelte -->
<script lang="ts">
	import IconTriangle from '$lib/components/icons/IconTriangle.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { Eye, EyeOff, Github, Mail } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';

	// Import auth store
	import { authStore, authLoading, authError } from '$lib/stores/auth';

	// Props with defaults
	export let returnUrl = '/';
	export let redirectAfterLogin = true;
	export let showSocialLogins = true;
	export let showSignUpLink = true;
	export let showSecurityNote = true;

	// Component state
	let email = '';
	let password = '';
	let rememberMe = false;
	let showPassword = false;
	let error = '';

	// Setup event dispatcher
	const dispatch = createEventDispatcher<{
		success: { email: string };
		error: { message: string };
	}>();

	// Use reactive stores for loading and errors
	$: isLoading = $authLoading;

	// Update error message when authError changes
	$: if ($authError) {
		error = $authError instanceof Error ? $authError.message : String($authError);
		if (error) {
			dispatch('error', { message: error });
		}
	}

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter both email and password';
			dispatch('error', { message: error });
			return;
		}

		error = '';

		try {
			// Use the auth store login method
			const success = await authStore.login(email, password);

			if (success) {
				dispatch('success', { email });
				if (redirectAfterLogin) {
					goto(returnUrl);
				}
			} else {
				if (!error) {
					// Only set this if no error was set by the store
					error = 'Invalid email or password';
					dispatch('error', { message: error });
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed. Please try again.';
			dispatch('error', { message: error });
			console.error(err);
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function handleSocialLogin(provider: string) {
		// Implement social login logic here
		console.log(`Logging in with ${provider}`);
		// For now, just show a message that this isn't implemented
		error = `${provider} login is not implemented yet`;
		dispatch('error', { message: error });
	}
</script>

<div
	class="card preset-filled-surface-100-900 relative mb-10 flex flex-col p-6 shadow-xl backdrop-blur-sm"
>
	<div class="card-header">
		<h3 class="h3 font-bold">Sign In</h3>
		<p class="preset-typo-cation">Enter your credentials to access your account</p>
	</div>

	<div class="card-body flex flex-col py-4">
		{#if error}
			<div class="alert alert-error mb-4" transition:fade>
				<div
					class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
					transition:fade
				>
					<IconTriangle />
					<div>
						<p class="font-bold">Error</p>
						<p class="text-xs opacity-60">{error}</p>
					</div>
				</div>
			</div>
		{/if}

		<form on:submit|preventDefault={handleLogin} class="space-y-4">
			<!-- Email Input -->
			<label class="label">
				<span class="label-text">Email</span>
				<input
					type="email"
					class="input !bg-surface-200-800"
					placeholder="you@example.com"
					bind:value={email}
					required
					autocomplete="email"
				/>
			</label>

			<!-- Password Input -->
			<label class="label">
				<span class="label-text">Password</span>
				<div class="relative w-full">
					<input
						type={showPassword ? 'text' : 'password'}
						class="input !bg-surface-200-800 w-full pr-10"
						placeholder="••••••••"
						bind:value={password}
						required
						autocomplete="current-password"
					/>
					<button
						type="button"
						class="absolute inset-y-0 right-0 flex items-center px-3 text-sm"
						on:click={togglePasswordVisibility}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeOff size={18} />
						{:else}
							<Eye size={18} />
						{/if}
					</button>
				</div>
			</label>

			<!-- Remember Me and Forgot Password -->
			<div class="flex items-center justify-between">
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={rememberMe} class="checkbox" />
					<span class="text-sm">Remember me</span>
				</label>

				<a href="/forgot-password" class="text-primary-500 text-sm hover:underline">
					Forgot password?
				</a>
			</div>

			<!-- Login Button -->
			<button
				type="submit"
				class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
				disabled={isLoading}
			>
				{isLoading ? 'Signing in...' : 'Sign In'}
			</button>

			{#if showSocialLogins}
				<!-- Divider -->
				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-current opacity-20"></div>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-surface-100-900 px-2">Or continue with</span>
					</div>
				</div>

				<!-- Social Logins -->
				<div class="grid grid-cols-2 gap-4">
					<button
						type="button"
						class="btn preset-outlined-surface-900 flex items-center justify-center gap-2"
						on:click={() => handleSocialLogin('Google')}
						disabled={isLoading}
					>
						<Mail size={18} />
						<span>Google</span>
					</button>
					<button
						type="button"
						class="btn preset-outlined-surface-900 flex items-center justify-center gap-2"
						on:click={() => handleSocialLogin('GitHub')}
						disabled={isLoading}
					>
						<Github size={18} />
						<span>GitHub</span>
					</button>
				</div>
			{/if}
		</form>

		{#if showSignUpLink}
			<!-- Sign Up Link -->
			<div class="mt-6 text-center">
				<p class="text-sm">
					Don't have an account?
					<a href="/register" class="text-primary-500 font-medium hover:underline"> Sign up </a>
				</p>
			</div>
		{/if}
	</div>
</div>

{#if showSecurityNote}
	<!-- Security Note -->
	<div class="text-surface-700-300 text-center text-sm">
		<p class="mb-2">
			<span class="font-semibold">Secure Login:</span> Your connection to this site is encrypted
		</p>
		<p>
			By logging in, you agree to our
			<a href="/terms" class="text-primary-500 hover:underline">Terms of Service</a> and
			<a href="/privacy" class="text-primary-500 hover:underline">Privacy Policy</a>
		</p>
	</div>
{/if}
