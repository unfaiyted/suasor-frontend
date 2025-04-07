<script lang="ts">
	import type { Movie } from './types';
	import { onDestroy } from 'svelte';
	import { showMoviePopover, hideMoviePopover } from './MoviePopoverService';

	type EnhancedMovieCardProps = {
		movie: Movie;
		showPopoverOnHover?: boolean;
		isSelected?: boolean;
		toggleSelection?: (movie: Movie) => void;
		isInLibrary?: boolean;
	};

	let {
		movie,
		showPopoverOnHover = true, // Enable by default
		isSelected = false,
		toggleSelection,
		isInLibrary = false
	}: EnhancedMovieCardProps = $props();

	let cardElement;
	let hoverTimeout;

	function handleClick() {
		if (toggleSelection) {
			toggleSelection(movie);
		}
	}

	// Show popover on hover
	function handleMouseEnter(event: MouseEvent) {
		if (!showPopoverOnHover) return;

		clearTimeout(hoverTimeout);
		hoverTimeout = setTimeout(() => {
			// Get the element's position
			const rect = cardElement.getBoundingClientRect();
			// Position to the right of the card
			const x = rect.right;
			const y = rect.top + 20;
			// Show the popover with the movie data
			showMoviePopover(movie, x, y);
		}, 300); // Small delay to prevent flickering
	}

	// Hide popover when mouse leaves
	function handleMouseLeave() {
		if (!showPopoverOnHover) return;

		clearTimeout(hoverTimeout);
		hoverTimeout = setTimeout(() => {
			hideMoviePopover();
		}, 200);
	}

	onDestroy(() => {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
		}
	});

	// Format a concise reason (keeps only the first 1-2 sentences)
	function formatReason(reason: string): string {
		if (!reason) return '';
		const sentences = reason.split(/[.!?]+/);
		const firstTwoSentences = sentences.slice(0, 2).join('. ');
		return firstTwoSentences.trim() + '.';
	}
	let poster = $state(movie.poster);
	$effect(() => {
		console.log('Effect triggered for poster');
		// poster =
		// 	movie.poster ||
		// 	movie.details?.artwork?.poster ||
		// 	`https://via.placeholder.com/300x450.png?text=${encodeURIComponent(
		// 		movie.title || movie.details?.title || 'Movie'
		// 	)}`;
		if (movie.poster) {
			poster = movie.poster;
		}
	});
</script>

<div
	class="relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl"
	class:ring-2={isSelected}
	class:ring-primary-500={isSelected}
	class:brightness-75={isSelected}
	onclick={handleClick}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	bind:this={cardElement}
	role="button"
>
	<img
		src={poster}
		alt={movie.title || movie.details?.title || 'Movie'}
		class="h-full w-full object-cover"
		loading="lazy"
	/>
	<!-- Overlay with movie info -->
	<div
		class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-black/0 p-2"
	>
		<h3 class="line-clamp-2 text-sm font-semibold text-white">{movie.title}</h3>
		<div class="mb-1 text-xs text-white/70">{movie.year || 'N/A'}</div>

		<!-- Recommendation reason - new feature -->
		{#if movie.reason}
			<div class="mt-1 line-clamp-3 text-xs text-white/90">
				{formatReason(movie.reason)}
			</div>
		{/if}
	</div>

	<!-- Library indicator -->
	{#if isInLibrary}
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
</div>
