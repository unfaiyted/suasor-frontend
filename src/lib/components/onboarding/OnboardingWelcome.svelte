<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Film, Tv, Music, Bot } from '@lucide/svelte';

	// Event dispatcher to notify parent component when step is completed
	const dispatch = createEventDispatcher();

	// Function to handle continuation to next step
	function handleContinue() {
		// Just dispatch the event with stepData directly
		dispatch('complete', { stepData: {} });
	}
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="mb-2 text-2xl font-bold">Welcome to Suasor</h2>
		<p class="text-surface-900-50 mx-auto max-w-lg">Your personal media recommendation service</p>
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
		<div
			class="bg-surface-200-800/20 space-y-4 rounded-xl p-6 shadow-sm transition-shadow hover:shadow"
		>
			<div class="flex items-center space-x-4">
				<div class="bg-primary-500/20 rounded-full p-3">
					<Bot size={24} class="text-primary-500" />
				</div>
				<h3 class="text-lg font-semibold">Personalized Recommendations</h3>
			</div>
			<p class="text-surface-900-50">
				Get personalized recommendations based on your preferences and viewing history.
			</p>
		</div>

		<div
			class="bg-surface-200-800/20 space-y-4 rounded-xl p-6 shadow-sm transition-shadow hover:shadow"
		>
			<div class="flex items-center space-x-4">
				<div class="bg-primary-500/20 rounded-full p-3">
					<Film size={24} class="text-primary-500" />
				</div>
				<h3 class="text-lg font-semibold">Movies & TV Shows</h3>
			</div>
			<p class="text-surface-900-50">
				Discover new movies and TV shows you'll love based on your taste profile.
			</p>
		</div>

		<div
			class="bg-surface-200-800/20 space-y-4 rounded-xl p-6 shadow-sm transition-shadow hover:shadow"
		>
			<div class="flex items-center space-x-4">
				<div class="bg-primary-500/20 rounded-full p-3">
					<Music size={24} class="text-primary-500" />
				</div>
				<h3 class="text-lg font-semibold">Music Discovery</h3>
			</div>
			<p class="text-surface-900-50">
				Find new music, artists, and albums tailored to your listening preferences.
			</p>
		</div>

		<div
			class="bg-surface-200-800/20 space-y-4 rounded-xl p-6 shadow-sm transition-shadow hover:shadow"
		>
			<div class="flex items-center space-x-4">
				<div class="bg-primary-500/20 rounded-full p-3">
					<Tv size={24} class="text-primary-500" />
				</div>
				<h3 class="text-lg font-semibold">Connect Your Accounts</h3>
			</div>
			<p class="text-surface-900-50">
				Connect your media accounts to get recommendations based on what you already enjoy.
			</p>
		</div>
	</div>

	<div class="mt-10 text-center">
		<p class="text-surface-900-50 mb-4">
			Let's set up your account in just a few steps to get started with Suasor.
		</p>
		<button
			class="btn preset-filled-primary-500 rounded-full px-10 py-3 text-lg shadow-md transition-shadow hover:shadow-lg"
			onclick={handleContinue}
		>
			Let's Get Started
		</button>
	</div>
</div>

