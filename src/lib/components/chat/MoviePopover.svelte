<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { onMount, afterUpdate } from 'svelte';
	import type { Movie } from './types';

	export let movie;
	export let visible = false;
	export let anchorElement = null; // Element to position relative to

	let popoverElement;
	let position = { top: 0, left: 0 };

	// Calculate the best position for the popover
	function calculatePosition() {
		if (!visible || !anchorElement || !popoverElement) return;

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const anchorRect = anchorElement.getBoundingClientRect();
		const popoverWidth = popoverElement.offsetWidth;
		const popoverHeight = popoverElement.offsetHeight;

		// Try to position to the right of the anchor
		let left = anchorRect.right + 10;
		let top = anchorRect.top;

		// If not enough space on right, position to the left
		if (left + popoverWidth > viewportWidth - 20) {
			left = anchorRect.left - popoverWidth - 10;
		}

		// If not enough space on either side, center it
		if (left < 20) {
			left = Math.max(
				20,
				Math.min(
					viewportWidth - popoverWidth - 20,
					anchorRect.left + (anchorRect.width - popoverWidth) / 2
				)
			);
		}

		// Adjust vertical position to ensure it fits
		if (top + popoverHeight > viewportHeight - 20) {
			top = Math.max(20, viewportHeight - popoverHeight - 20);
		}

		position = { top, left };
	}

	// Format runtime to hours and minutes
	function formatRuntime(minutes) {
		if (!minutes) return '';
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	// Update position when visibility changes or when component updates
	$: if (visible) {
		setTimeout(calculatePosition, 0);
	}

	afterUpdate(calculatePosition);

	// Handle window resize
	onMount(() => {
		const handleResize = () => {
			if (visible) calculatePosition();
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	// Handle click on the popover to prevent it from closing
	function handlePopoverClick(e) {
		e.stopPropagation();
	}
</script>

<!-- Create a portal at the document root to ensure the popover is not clipped -->
{#if visible}
	<div
		class="movie-popover"
		bind:this={popoverElement}
		in:fly={{ y: 5, duration: 150 }}
		out:fade={{ duration: 100 }}
		style="top: {position.top}px; left: {position.left}px;"
		on:click={handlePopoverClick}
	>
		<div class="backdrop">
			{#if movie.backdrop || movie.Details?.Artwork?.background}
				<img
					src={movie.backdrop || movie.Details?.Artwork?.background}
					alt="Backdrop"
					class="backdrop-image"
				/>
			{:else if movie.poster || movie.Details?.Artwork?.poster}
				<img
					src={movie.poster || movie.Details?.Artwork?.poster}
					alt="Poster"
					class="backdrop-image poster-backdrop"
				/>
			{/if}
			<div class="backdrop-overlay"></div>
		</div>

		<div class="content">
			<h3 class="title">{movie.title || movie.Details?.title || 'Unknown'}</h3>
			<div class="meta">
				<span class="year">{movie.year || movie.Details?.releaseYear || 'N/A'}</span>
				{#if movie.runtime}
					<span class="runtime">{formatRuntime(movie.runtime)}</span>
				{/if}
				{#if movie.rating || movie.Details?.userRating}
					<span class="rating">★ {movie.rating || movie.Details?.userRating || 0}</span>
				{/if}
			</div>

			{#if (movie.genres && movie.genres.length) || (movie.Details?.genres && movie.Details.genres.length)}
				<div class="genres">
					{(movie.genres || movie.Details?.genres || []).slice(0, 3).join(' • ')}
				</div>
			{/if}

			{#if movie.overview || movie.Details?.description}
				<p class="overview">{movie.overview || movie.Details?.description}</p>
			{/if}

			{#if movie.reason}
				<div class="reason">
					<span class="reason-label">Why recommended:</span>
					<p>{movie.reason}</p>
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
		pointer-events: auto; /* Ensures clicks work */
	}

	.backdrop {
		position: relative;
		height: 120px;
		overflow: hidden;
	}

	.backdrop-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.poster-backdrop {
		object-position: center 20%;
	}

	.backdrop-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%);
	}

	.content {
		padding: 12px;
	}

	.title {
		font-size: 1.2rem;
		font-weight: 600;
		margin: 0 0 8px;
		line-height: 1.2;
	}

	.meta {
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
