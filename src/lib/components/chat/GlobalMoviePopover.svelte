<script lang="ts">
	import { fade } from 'svelte/transition';
	import { derived } from 'svelte/store';
	import type { Movie } from './types';
	import { onMount, onDestroy } from 'svelte';

	// Import from the service instead of defining here
	import { moviePopoverStore } from './MoviePopoverService';

	// Create derived values
	const visible = derived(moviePopoverStore, ($store) => $store.visible);
	const movie = derived(moviePopoverStore, ($store) => $store.movie);
	const position = derived(moviePopoverStore, ($store) => $store.position);

	// Calculate optimal position
	function getOptimalPosition(x: number, y: number): { top: number; left: number } {
		// Get viewport dimensions
		if (typeof window === 'undefined') {
			return { top: y, left: x }; // SSR fallback
		}

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// Assume popover dimensions
		const popoverWidth = 280;
		const popoverHeight = 350;

		// Initial position is to the right of cursor/element
		let left = x + 15;
		let top = y - 20;

		// Check if too close to right edge
		if (left + popoverWidth > viewportWidth - 20) {
			// Position to the left of cursor/element
			left = x - popoverWidth - 140;
		}

		// Check if too close to bottom edge
		if (top + popoverHeight > viewportHeight - 20) {
			// Align at the bottom of the viewport
			top = viewportHeight - popoverHeight - 20;
		}

		// Make sure it doesn't go off the top or left
		top = Math.max(20, top);
		left = Math.max(20, left);

		return { top, left };
	}

	// Format runtime to hours and minutes
	function formatRuntime(minutes: number | undefined): string {
		if (!minutes) return '';
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	// Import the hide function from the service
	import { hideMoviePopover } from './MoviePopoverService';

	// Store window click handler to close popover when clicking outside
	function handleWindowClick(): void {
		hideMoviePopover();
	}

	// Prevent click propagation within popover
	function handlePopoverClick(e: MouseEvent): void {
		e.stopPropagation();
	}

	// Add/remove event listeners safely with browser check
	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('click', handleWindowClick);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('click', handleWindowClick);
		}
	});
</script>

<!-- Global movie popover (visible throughout the app) -->
{#if $visible && $movie}
	{@const { top, left } = getOptimalPosition($position.x, $position.y)}

	<div
		class="movie-popover"
		style="top: {top}px; left: {left}px;"
		transition:fade={{ duration: 150 }}
		on:click={handlePopoverClick}
	>
		<div class="popover-backdrop">
			{#if $movie.backdrop || $movie.details?.artwork?.background}
				<img
					src={$movie.backdrop || $movie.details?.artwork?.background}
					alt="Backdrop"
					class="backdrop-image"
				/>
			{:else if $movie.poster || $movie.details?.artwork?.poster}
				<img
					src={$movie.poster || $movie.details?.artwork?.poster}
					alt="Poster"
					class="backdrop-image poster-as-backdrop"
				/>
			{/if}
			<div class="backdrop-overlay"></div>
		</div>

		<div class="popover-content">
			<h3 class="movie-title">{$movie.title || $movie.details?.title || 'Unknown Title'}</h3>

			<div class="meta-info">
				<span class="year">{$movie.year || $movie.details?.releaseYear || 'N/A'}</span>
				{#if $movie.runtime}
					<span class="runtime">{formatRuntime($movie.runtime)}</span>
				{/if}
				{#if $movie.rating || $movie.details?.userRating}
					<span class="rating">★ {$movie.rating || $movie.details?.userRating || 0}</span>
				{/if}
			</div>

			{#if ($movie.genres && $movie.genres.length > 0) || ($movie.details?.genres && $movie.details.genres.length > 0)}
				<div class="genres">
					{($movie.genres || $movie.details?.genres || []).slice(0, 3).join(' • ')}
				</div>
			{/if}

			{#if $movie.overview || $movie.details?.description}
				<p class="overview">{$movie.overview || $movie.details?.description}</p>
			{/if}

			{#if $movie.reason}
				<div class="reason">
					<span class="reason-label">Why recommended:</span>
					<p>{$movie.reason}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.movie-popover {
		position: fixed;
		width: 280px;
		background-color: #202020;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		z-index: 9999; /* Ultra high z-index to ensure it's above everything */
		pointer-events: auto;
	}

	.popover-backdrop {
		position: relative;
		height: 120px;
		overflow: hidden;
	}

	.backdrop-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.poster-as-backdrop {
		object-position: center 20%;
	}

	.backdrop-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%);
	}

	.popover-content {
		padding: 12px;
	}

	.movie-title {
		font-size: 1.2rem;
		font-weight: 600;
		margin: 0 0 8px;
		line-height: 1.2;
	}

	.meta-info {
		display: flex;
		gap: 10px;
		font-size: 0.8rem;
		margin-bottom: 8px;
	}

	.rating {
		color: gold;
	}

	.genres {
		font-size: 0.8rem;
		font-style: italic;
		margin-bottom: 10px;
		opacity: 0.8;
	}

	.overview {
		font-size: 0.85rem;
		line-height: 1.4;
		margin: 0 0 12px;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.reason {
		font-size: 0.8rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding-top: 8px;
	}

	.reason-label {
		font-weight: 600;
		color: #bb86fc;
	}

	.reason p {
		margin: 5px 0 0;
		font-style: italic;
	}
</style>

