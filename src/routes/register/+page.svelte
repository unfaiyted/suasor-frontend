<script lang="ts">
	import IconTriangle from '$lib/components/icons/IconTriangle.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { Eye, EyeOff, Github, Mail } from '@lucide/svelte';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let agreeTerms = false;
	let isLoading = false;
	let error = '';

	// Password strength indicators
	$: hasMinLength = password.length >= 8;
	$: hasUppercase = /[A-Z]/.test(password);
	$: hasLowercase = /[a-z]/.test(password);
	$: hasNumber = /[0-9]/.test(password);
	$: hasSpecialChar = /[^A-Za-z0-9]/.test(password);
	$: passwordsMatch = password === confirmPassword;

	$: isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
	$: isFormValid = name && email && isPasswordValid && passwordsMatch && agreeTerms;

	function togglePasswordVisibility(field: 'password' | 'confirm') {
		if (field === 'password') {
			showPassword = !showPassword;
		} else {
			showConfirmPassword = !showConfirmPassword;
		}
	}

	async function handleRegister() {
		if (!isFormValid) {
			if (!name || !email || !password || !confirmPassword) {
				error = 'Please fill in all required fields';
			} else if (!passwordsMatch) {
				error = 'Passwords do not match';
			} else if (!isPasswordValid) {
				error = 'Please ensure your password meets all requirements';
			} else if (!agreeTerms) {
				error = 'You must agree to the Terms of Service and Privacy Policy';
			}
			return;
		}

		error = '';
		isLoading = true;

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Replace with actual registration logic
			console.log('Registering user:', { name, email });
			goto('/login?registered=true');
		} catch (err) {
			error = 'Registration failed. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	function handleSocialSignup(provider: string) {
		isLoading = true;
		// Implement social signup logic here
		console.log(`Signing up with ${provider}`);
		setTimeout(() => {
			isLoading = false;
		}, 1000);
	}
</script>

<div class="container mx-auto max-w-md px-4 py-10">
	<!-- Header Section -->
	<header class="mb-8 text-center">
		<h1 class="h1 text-primary-500 mb-2 font-bold">Create Account</h1>
		<p class="preset-typo-subtitle text-lg">Sign up to get started with our service</p>
	</header>

	<!-- Registration Form -->
	<div class="card preset-filled-surface-100-900 relative mb-10 p-6 shadow-xl backdrop-blur-sm">
		<div class="card-header">
			<h3 class="h3 font-bold">Sign Up</h3>
			<p class="preset-typo-cation">Create your account to begin</p>
		</div>

		<div class="card-body py-4">
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

			<form on:submit|preventDefault={handleRegister} class="space-y-4">
				<!-- Name Input -->
				<label class="label">
					<span class="label-text">Full Name</span>
					<input
						type="text"
						class="input !bg-surface-200-800"
						placeholder="John Doe"
						bind:value={name}
						required
						autocomplete="name"
					/>
				</label>

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
							autocomplete="new-password"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center px-3 text-sm"
							on:click={() => togglePasswordVisibility('password')}
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

				<!-- Password Strength Indicators -->
				<div class="space-y-1 text-xs">
					<p class="font-medium">Password must contain:</p>
					<div class="grid grid-cols-2 gap-1">
						<div class={hasMinLength ? 'text-success-500' : 'text-error-500'}>
							• At least 8 characters
						</div>
						<div class={hasUppercase ? 'text-success-500' : 'text-error-500'}>
							• At least one uppercase letter
						</div>
						<div class={hasLowercase ? 'text-success-500' : 'text-error-500'}>
							• At least one lowercase letter
						</div>
						<div class={hasNumber ? 'text-success-500' : 'text-error-500'}>
							• At least one number
						</div>
						<div class={hasSpecialChar ? 'text-success-500' : 'text-error-500'}>
							• At least one special character
						</div>
					</div>
				</div>

				<!-- Confirm Password Input -->
				<label class="label">
					<span class="label-text">Confirm Password</span>
					<div class="relative w-full">
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							class="input !bg-surface-200-800 w-full pr-10"
							placeholder="••••••••"
							bind:value={confirmPassword}
							required
							autocomplete="new-password"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center px-3 text-sm"
							on:click={() => togglePasswordVisibility('confirm')}
							aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
						>
							{#if showConfirmPassword}
								<EyeOff size={18} />
							{:else}
								<Eye size={18} />
							{/if}
						</button>
					</div>
				</label>
				{#if confirmPassword && !passwordsMatch}
					<div class="text-error-500 text-xs" transition:fade>Passwords do not match</div>
				{/if}

				<!-- Terms and Conditions -->
				<label class="flex items-start gap-2">
					<input type="checkbox" bind:checked={agreeTerms} class="checkbox mt-1" required />
					<span class="text-sm">
						I agree to the
						<a href="/terms" class="text-primary-500 hover:underline">Terms of Service</a> and
						<a href="/privacy" class="text-primary-500 hover:underline">Privacy Policy</a>
					</span>
				</label>

				<!-- Register Button -->
				<button
					type="submit"
					class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
					disabled={!isFormValid || isLoading}
				>
					{isLoading ? 'Creating account...' : 'Create Account'}
				</button>

				<!-- Divider -->
				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-current opacity-20"></div>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-surface-100-900 px-2">Or sign up with</span>
					</div>
				</div>

				<!-- Social Signups -->
				<div class="grid grid-cols-2 gap-4">
					<button
						type="button"
						class="btn preset-outlined-surface-900 flex items-center justify-center gap-2"
						on:click={() => handleSocialSignup('google')}
						disabled={isLoading}
					>
						<Mail size={18} />
						<span>Google</span>
					</button>
					<button
						type="button"
						class="btn preset-outlined-surface-900 flex items-center justify-center gap-2"
						on:click={() => handleSocialSignup('github')}
						disabled={isLoading}
					>
						<Github size={18} />
						<span>GitHub</span>
					</button>
				</div>
			</form>

			<!-- Sign In Link -->
			<div class="mt-6 text-center">
				<p class="text-sm">
					Already have an account?
					<a href="/login" class="text-primary-500 font-medium hover:underline"> Sign in </a>
				</p>
			</div>
		</div>
	</div>

	<!-- Security Note -->
	<div class="text-surface-700-300 text-center text-sm">
		<p class="mb-2">
			<span class="font-semibold">Secure Registration:</span> Your information is protected with encryption
		</p>
		<p>
			By creating an account, you agree to our
			<a href="/terms" class="text-primary-500 hover:underline">Terms of Service</a> and
			<a href="/privacy" class="text-primary-500 hover:underline">Privacy Policy</a>
		</p>
	</div>
</div>
