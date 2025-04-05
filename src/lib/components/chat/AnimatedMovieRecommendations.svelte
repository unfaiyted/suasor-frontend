<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Movie } from './types';
	import AnimatedMovieThumbnail from './AnimatedMovieThumbnail.svelte';

	interface AnimatedMovieRecommendationsProps {
		movies: Movie[];
		isVisible: boolean;
		selectedMovies: Movie[];
		libraryStatus: Record<string, boolean>;
		onToggleSelection?: (movie: Movie) => void;
		delay?: number; // ms to wait after text finishes before showing movies
	}

	// Props using Svelte 5 $props syntax
	let {
		movies = [],
		isVisible = false,
		selectedMovies = [],
		libraryStatus = {},
		delay = 500,
		onToggleSelection = (movie: Movie) => {}
	}: AnimatedMovieRecommendationsProps = $props();

	// State using Svelte 5's $state rune
	let showMovies = $state(false);
	let timer = $state<ReturnType<typeof setTimeout> | null>(null);

	function handleToggleSelection(movie: Movie) {
		onToggleSelection(movie);
	}

	function isMovieSelected(id: string): boolean {
		return selectedMovies.some((m) => m.id === id);
	}

	// Watch for visibility changes using Svelte 5's effect rune
	$effect(() => {
		console.log('AnimatedMovieRecommendations: isVisible changed to', isVisible);

		if (isVisible && !showMovies) {
			console.log('Setting up timer to show movies after', delay, 'ms');

			// Clear any existing timers
			if (timer) clearTimeout(timer);

			// Start a new timer to show movies after delay
			timer = setTimeout(() => {
				console.log('Timer expired, showing movies');
				showMovies = true;
			}, delay);
		} else if (!isVisible && showMovies) {
			console.log('Hiding movies');
			showMovies = false;
		}
	});

	// Cleanup timer on component destroy
	onMount(() => {
		return () => {
			if (timer) clearTimeout(timer);
		};
	});
</script>

{#if showMovies}
	<div class="movie-recommendations mt-4" in:fade={{ duration: 300 }}>
		<h4 class="mb-2 text-sm font-medium" in:fade={{ duration: 300 }}>Movie Recommendations:</h4>

		<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each movies as movie, i}
				<AnimatedMovieThumbnail
					{movie}
					selected={isMovieSelected(movie.id)}
					index={i}
					inLibrary={!!libraryStatus[movie.id]}
					onToggleSelection={() => handleToggleSelection(movie)}
				/>
			{/each}
		</div>
	</div>
{/if}