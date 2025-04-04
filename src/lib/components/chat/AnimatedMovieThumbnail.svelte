<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Movie } from './types';
	import { showMoviePopover, hideMoviePopover } from './MoviePopoverService';

	// export let movie: Movie;
	// export let selected = false;
	// export let index = 0;
	// export let inLibrary = false;
	// export let onToggleSelection: () => void;
	//
	type AnimatedMovieThumbnailProps = {
		movie: Movie;
		selected: boolean;
		index: number;
		inLibrary: boolean;
		onToggleSelection: (movie: Movie) => void;
	};

	let { movie, selected, index, inLibrary, onToggleSelection }: AnimatedMovieThumbnailProps =
		$props();

	// Animate with a staggered delay based on index
	const animationDelay = 100 * index;
	const animationDuration = 400;

	// Track thumbnail element and popover state
	let thumbElement: HTMLElement;
	let hoverTimeout: number;

	// Functions to handle hover state with global popover
	function handleMouseEnter() {
		clearTimeout(hoverTimeout);
		hoverTimeout = window.setTimeout(() => {
			if (thumbElement) {
				const rect = thumbElement.getBoundingClientRect();
				showMoviePopover(movie, rect.right, rect.top);
			}
		}, 400); // Delay before showing popover
	}

	function handleMouseLeave() {
		clearTimeout(hoverTimeout);
		hoverTimeout = window.setTimeout(() => {
			hideMoviePopover();
		}, 300); // Small delay before hiding popover
	}

	// Handle showing popover separately from selection
	function showMovieDetails(event: MouseEvent) {
		// Don't interfere with other events
		event.stopPropagation();

		// Get position for the popover
		const rect = thumbElement.getBoundingClientRect();
		// Show the popover
		showMoviePopover(movie, rect.right, rect.top);
	}

	// We need to ensure the movie can be selected by clicking it
	// This will allow it to be added to the SelectedMoviesBar

	import { onDestroy } from 'svelte';

	function handleClick(event: MouseEvent | KeyboardEvent) {
		// Prevent duplicated events
		event.stopPropagation();
		// Toggle selection for this movie to add/remove it from selectedMovies
		onToggleSelection(movie);
		selected = !selected;
	}

	// Clean up timeout on component destroy
	onDestroy(() => {
		clearTimeout(hoverTimeout);
	});
</script>

<div
	class="movie-thumb relative"
	aria-haspopup="true"
	in:fly={{
		y: 20,
		duration: animationDuration,
		delay: animationDelay,
		easing: cubicOut
	}}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onclick={showMovieDetails}
	bind:this={thumbElement}
>
	<div
		class="relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
		class:ring-2={selected}
		class:ring-primary-500={selected}
		class:brightness-75={selected}
		onclick={handleClick}
		onkeypress={(e) => e.key === 'Enter' && handleClick(e)}
		tabindex="0"
		role="button"
		aria-pressed={selected}
	>
		<img
			src={movie.poster ||
				movie.details?.artwork?.poster ||
				`https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || movie.details?.title || 'Movie')}`}
			alt={movie.title || movie.details?.title || 'Movie'}
			class="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
			loading="lazy"
		/>

		<!-- Library indicator -->
		{#if inLibrary}
			<div
				class="bg-success-500 absolute top-2 right-2 z-10 rounded-full p-1 text-white"
				title="In your library"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
		{/if}

		<!-- Overlay with movie info -->
		<div
			class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-black/0 p-2"
		>
			<h3 class="line-clamp-2 text-sm font-semibold text-white">
				{movie.title || movie.details?.title || 'Unknown'}
			</h3>
			<div class="text-xs text-white/70">{movie.year || movie.details?.releaseYear || 'N/A'}</div>
		</div>
	</div>

	<!-- Movie popover is now managed by GlobalMoviePopover -->
</div>

<style>
	.movie-thumb {
		will-change: transform;
		position: relative;
	}
</style>
