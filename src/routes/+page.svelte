<script lang="ts">
	import IconLogo from '$lib/components/icons/IconLogo.svelte';
	import IconDown from '$lib/components/icons/IconDown.svelte';
	import IconUp from '$lib/components/icons/IconUp.svelte';
	import { fade } from 'svelte/transition';
	import { shortensStore, shortensLoading } from '$lib/stores/shortens';
	import { ApiError } from '$lib/api/errors';
	import { PORTUS_API_BASE_URL } from '$lib/api/client';
	import { ModelsErrorType as ErrorType } from '$lib/api/portus.v1.d';
	import IconTriangle from '$lib/components/icons/IconTriangle.svelte';

	let longUrl = '';
	let shortUrl = '';
	let customShortCode = ''; // New variable for custom shortcode
	let isLoading = false;
	let copied = false;
	let error = '';
	let customSectionExpanded = false; // Track whether custom section is expanded
	let domain = PORTUS_API_BASE_URL.split('//')[1].split('/')[0];
	// Mock database of already taken shortcodes
	// let takenShortCodes = ['premium', 'admin', 'test123'];
	$: isLoading = $shortensLoading;

	async function handleSubmit() {
		if (!longUrl) {
			error = 'Please enter a URL';
			return;
		}

		error = '';

		try {
			// Use the API to create or fetch the shortened URL
			const result = await shortensStore.fetchOrCreate(longUrl, customShortCode || undefined);

			if (result && result.shorten) {
				// Construct the full shortened URL with the returned shortcode
				shortUrl = result.shortUrl || 'Error producing short url';

				// Clear inputs after successful submission
				longUrl = '';
				customShortCode = '';
			} else {
				error = 'Failed to create short URL. Please try again.';
			}
		} catch (err) {
			if (err instanceof ApiError) {
				console.log('err.message', err.message);
				error = err.message || 'API Error occurred';

				// Handle specific error types
				if (err.type === ErrorType.ErrorTypeServiceUnavailable) {
					error = 'This custom shortcode is already taken. Please try another.';
				} else if (err.type === ErrorType.ErrorTypeBadRequest) {
					error = 'Invalid URL or shortcode format. Please check your input.';
				}
			} else {
				error = 'Failed to create short URL. Please try again.';
				console.error(err);
			}
		}
	}

	function copyToClipboard() {
		if (!shortUrl) return;
		navigator.clipboard.writeText(shortUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function toggleCustomSection() {
		customSectionExpanded = !customSectionExpanded;
	}
</script>

<div class="container mx-auto max-w-4xl px-4 py-10">
	<!-- Hero Section -->
	<header class="mb-12 text-center">
		<h1 class="h1 text-primary-500 mb-2 font-bold">A Shorter Trip</h1>
		<p class="preset-typo-subtitle mb-6 text-lg">
			Transform your lengthy URLs to concise, memorable destinations
		</p>
	</header>

	<!-- URL Shortener Form -->
	<div class="card preset-filled-surface-100-900 relative mb-10 p-6 shadow-xl backdrop-blur-sm">
		<!-- Icon in top right corner -->
		<div class="pointer-events-none absolute -top-0 -right-0 h-24 w-24 opacity-0 sm:opacity-80">
			<IconLogo />
		</div>
		<div class="card-header">
			<h3 class="h3 font-bold">Transform Your URL</h3>
			<p class="preset-typo-cation">
				Enter your long URL below and we'll instantly port it to a shorter dimension
			</p>
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
						<div class="flex gap-1">
							<!-- <button class="btn preset-tonal hover:preset-filled">Dismiss</button> -->
						</div>
					</div>
				</div>
			{/if}

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<label class="label">
					<span class="label-text">Long URL</span>
					<input
						type="url"
						class="input !bg-surface-200-800"
						placeholder="https://example.com/very/long/url/that/needs/teleporting"
						bind:value={longUrl}
						required
					/>
				</label>

				<div class="mt-4">
					<button
						type="button"
						class="flex w-full items-center justify-between text-left font-medium"
						on:click={toggleCustomSection}
					>
						<span class="text-secondary-900-100">Custom shortcode (optional)</span>
						<span class="ml-2"
							>{#if !customSectionExpanded}<IconDown />{:else}
								<IconUp />{/if}</span
						>
					</button>

					{#if customSectionExpanded}
						<div transition:fade={{ duration: 150 }} class="mt-2">
							<div class="mt-2 flex items-center gap-2">
								<span class="label-text text-sm">{domain}/</span>
								<input
									type="text"
									class="input !bg-surface-200-800 mb-4"
									placeholder="e.g., myproduct"
									bind:value={customShortCode}
									pattern="[a-zA-Z0-9-_]+"
									title="Alphanumeric characters, hyphens, and underscores only"
								/>
							</div>
							<span class="text-surface-800-200 text-sm"
								>Leave empty to generate a random shortcode</span
							>
							<div class="text-surface-700-300 text-sm">
								<p>Create a memorable, easy-to-share link by choosing your own shortcode.</p>
								<p class="text-surface-900-100 mt-4">For best results:</p>
								<ul class="text-surface-800-200 ml-4 list-inside list-disc">
									<li>Use alphanumeric characters, hyphens and underscores only</li>
									<li>Keep it short and relevant to your content</li>
									<li>Avoid common terms that might be reserved</li>
								</ul>
							</div>
						</div>
					{/if}
				</div>

				<button
					type="submit"
					class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
				>
					{isLoading ? 'Teleporting...' : 'Port My URL'}
				</button>
			</form>

			{#if shortUrl}
				<div
					class="border-primary-500/30 bg-primary-500/10 mt-6 rounded-lg border p-4"
					transition:fade
				>
					<div class="flex items-center justify-between">
						<div>
							<p class="mb-1 text-sm font-semibold">Your Portus URL:</p>
							<a
								href={shortUrl}
								class="text-primary-700 text-lg font-bold hover:underline"
								target="_blank"
							>
								{shortUrl}
							</a>
							{#if shortUrl.includes(customShortCode) && customShortCode}
								<p class="mt-1 text-xs text-emerald-600">
									✓ Your custom shortcode was successfully reserved!
								</p>
							{/if}
						</div>
						<button class="btn preset-filled-primary-500" on:click={copyToClipboard}>
							{copied ? '✓ Copied' : 'Copy'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Features Section -->
	<div class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
		<div class="card p-4">
			<div class="card-header pb-2">
				<h3 class="h4 font-bold">Instant Transport</h3>
			</div>
			<div class="card-body">
				<p class="">Transform your links to their shorter form within milliseconds.</p>
			</div>
		</div>

		<div class="card p-4">
			<div class="card-header pb-2">
				<h3 class="h4 font-bold">Journey Tracking</h3>
			</div>
			<div class="card-body">
				<p class="">
					Follow your link's travels with comprehensive analytics and geographic insights.
				</p>
			</div>
		</div>

		<div class="card p-4">
			<div class="card-header pb-2">
				<h3 class="h4 font-bold">Open Source</h3>
			</div>
			<div class="card-body">
				<p class="">Design your own destination with branded domains and personalized paths.</p>
			</div>
		</div>
	</div>

	<footer class="text-center text-sm text-gray-500">
		<p>© {new Date().getFullYear()} Prt.ad - Where URLs get teleported. All rights reserved.</p>
	</footer>
</div>

<style lang="postcss">
</style>
