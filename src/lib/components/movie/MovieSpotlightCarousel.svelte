<!-- MovieSpotlightCarousel.svelte -->
<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import {
		Play,
		Info,
		Plus,
		Check,
		ChevronLeft,
		ChevronRight,
		Calendar,
		Star
	} from '@lucide/svelte';

	// Props
	export let movies = [];
	export let autoplay = true;
	export let autoplayInterval = 8000;

	// State
	let currentIndex = 0;

	// Event dispatcher to communicate with parent
	const dispatch = createEventDispatcher();

	// Navigation functions
	function next() {
		currentIndex = (currentIndex + 1) % movies.length;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + movies.length) % movies.length;
	}

	function setIndex(index) {
		currentIndex = index;
	}

	// Handle showing movie details
	function showDetails(movie) {
		dispatch('showDetails', movie);
	}

	// Handle watchlist toggle
	function toggleWatchlist(movie) {
		dispatch('toggleWatchlist', movie);
	}

	// Check if movie is in watchlist
	function isInWatchlist(id) {
		// We'll let the parent component handle this logic
		dispatch('checkWatchlist', id);
		// This is just a placeholder - actual state will come from parent
		return false;
	}

	onMount(() => {
		// Autoplay functionality
		let interval;

		if (autoplay && movies.length > 1) {
			interval = setInterval(() => {
				next();
			}, autoplayInterval);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<div class="relative h-[600px] w-full overflow-hidden">
	<!-- Background Image -->
	{#if movies.length > 0}
		<div
			class="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
			style="background-image: url('{movies[currentIndex].backdrop}');"
		>
			<div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"></div>
		</div>

		<!-- Content -->
		<div class="relative container mx-auto flex h-full flex-col justify-end px-6 pb-16">
			<span
				class="bg-primary-500/10 mb-4 inline-block justify-start self-start rounded px-2 py-1 text-sm font-bold text-white"
			>
				Featured Recommendation
			</span>
			<h1 class="mb-6 text-5xl font-bold text-white">{movies[currentIndex].title}</h1>
			<div class="mb-4 flex flex-wrap items-center gap-4 text-white">
				<span class="flex items-center gap-1">
					<Calendar size={16} />
					{movies[currentIndex].year}
				</span>
				<span class="flex items-center gap-1">
					<Star size={16} class="text-yellow-400" />
					{movies[currentIndex].rating}
				</span>
				{#each movies[currentIndex].genres.slice(0, 3) as genre}
					<span class="rounded-full bg-black/30 px-3 py-1">{genre}</span>
				{/each}
			</div>
			<p class="mb-6 max-w-2xl text-lg text-white">
				{movies[currentIndex].overview.substring(0, 180)}...
			</p>
			<div class="flex flex-wrap gap-4">
				<button class="btn preset-filled-primary-500 flex items-center gap-2">
					<Play size={18} />
					<span>Watch Now</span>
				</button>
				<button
					class="btn preset-outlined-surface-500 flex items-center gap-2"
					on:click={() => showDetails(movies[currentIndex])}
				>
					<Info size={18} />
					<span>More Info</span>
				</button>
				<button
					class="btn preset-outlined-surface-500 flex items-center gap-2"
					on:click|stopPropagation={() => toggleWatchlist(movies[currentIndex])}
				>
					<slot name="watchlist-button" movie={movies[currentIndex]}>
						<!-- Default watchlist button, can be overridden -->
						<Plus size={18} />
						<span>Add to Watchlist</span>
					</slot>
				</button>
			</div>

			<!-- Navigation Dots -->
			{#if movies.length > 1}
				<div class="absolute right-0 bottom-6 left-0 flex justify-center gap-2">
					{#each movies as _, index}
						<button
							class="h-3 w-3 rounded-full transition-colors {index === currentIndex
								? 'bg-primary-500'
								: 'bg-white/50 hover:bg-white/80'}"
							on:click={() => setIndex(index)}
							aria-label="View recommendation {index + 1}"
						></button>
					{/each}
				</div>

				<!-- Arrow Navigation -->
				<!-- <button -->
				<!-- 	class="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/60" -->
				<!-- 	on:click={prev} -->
				<!-- 	aria-label="Previous recommendation" -->
				<!-- > -->
				<!-- 	<ChevronLeft size={24} /> -->
				<!-- </button> -->
				<button
					class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/60"
					on:click={next}
					aria-label="Next recommendation"
				>
					<ChevronRight size={24} />
				</button>
			{/if}
		</div>
	{:else}
		<div class="flex h-full items-center justify-center text-white">
			<p>No spotlight movies available</p>
		</div>
	{/if}
</div>
