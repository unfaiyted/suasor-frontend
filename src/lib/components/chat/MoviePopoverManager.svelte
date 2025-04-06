<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { writable, derived } from 'svelte/store';

	// Import the Movie type
	import type { Movie } from './types';

	// Store to track the current popover state
	const popoverStore = writable({
		visible: false,
		movie: null as Movie | null,
		position: { x: 0, y: 0 }
	});

	// Derived store for visibility
	const popoverVisible = derived(popoverStore, ($store) => $store.visible);

	// Functions to show/hide popover
	function showPopover(movie: Movie, x: number, y: number) {
		popoverStore.update((state) => ({
			visible: true,
			movie,
			position: { x, y }
		}));
	}

	function hidePopover() {
		popoverStore.update((state) => ({
			...state,
			visible: false
		}));
	}

	// Export these functions for external use
	export { showPopover, hidePopover };

	// Portal container reference
	let portalContainer: HTMLElement | null = null;
	let popoverElement: HTMLElement | null = null;

	// Format runtime to hours and minutes
	function formatRuntime(minutes: number): string {
		if (!minutes) return '';
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	// Format rating to display as stars
	function formatRating(rating: number): string {
		if (!rating) return '';
		// Convert to a scale of 5 stars if rating is out of 10
		const stars = rating > 5 ? Math.round(rating / 2) : Math.round(rating);
		return '★'.repeat(stars) + '☆'.repeat(5 - stars);
	}

	// Calculate optimal position based on viewport
	function calculateOptimalPosition(x: number, y: number) {
		if (!popoverElement) return { top: y, left: x + 20 };

		const popoverWidth = 350; // Fixed width of our popover
		const popoverHeight = popoverElement.offsetHeight || 400;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// Default position is to the right of the cursor
		let left = x + 20;
		let top = y - 20;

		// Check if popover would go off right edge
		if (left + popoverWidth > viewportWidth - 20) {
			// Position to the left of the cursor instead
			left = x - popoverWidth - 20;
		}

		// Make sure it doesn't go off the left edge either
		left = Math.max(20, left);

		// Check if popover would go off bottom edge
		if (top + popoverHeight > viewportHeight - 20) {
			// Position it so the bottom aligns with the bottom of the viewport
			top = viewportHeight - popoverHeight - 20;
		}

		// Make sure it doesn't go off the top edge
		top = Math.max(20, top);

		return { top, left };
	}

	// Set up the portal and event listeners
	onMount(() => {
		// Create a dedicated portal container for the movie popover
		portalContainer = document.getElementById('movie-popover-portal');
		if (!portalContainer) {
			portalContainer = document.createElement('div');
			portalContainer.id = 'movie-popover-portal';
			portalContainer.className = 'movie-popover-portal';
			document.body.appendChild(portalContainer);
		}

		// Move the popover element to the portal if created
		if (popoverElement && portalContainer) {
			portalContainer.appendChild(popoverElement);
		}

		// Add global mouse move handler to track mouse position
		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			stopMouseTracking();
		};
	});

	onDestroy(() => {
		// Clean up by removing element from DOM
		if (popoverElement && popoverElement.parentNode) {
			popoverElement.parentNode.removeChild(popoverElement);
		}
	});

	// Track the mouse position to monitor when cursor gets too far from popover
	let currentMousePosition = { x: 0, y: 0 };
	let mouseTrackingInterval: number | null = null;

	function startMouseTracking() {
		if (mouseTrackingInterval) return;

		// Check every 300ms if mouse has moved far from popover
		mouseTrackingInterval = window.setInterval(() => {
			if (!$popoverStore.visible) return;

			const dx = currentMousePosition.x - $popoverStore.position.x;
			const dy = currentMousePosition.y - $popoverStore.position.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// If mouse is far away (300px) from the source position, hide the popover
			if (distance > 300) {
				hidePopover();
			}
		}, 300);
	}

	function stopMouseTracking() {
		if (mouseTrackingInterval) {
			clearInterval(mouseTrackingInterval);
			mouseTrackingInterval = null;
		}
	}

	// Handle tracking mouse position
	function handleMouseMove(e: MouseEvent) {
		currentMousePosition = { x: e.clientX, y: e.clientY };
	}

	// Subscribe to the store to recalculate position when visible
	$: if ($popoverStore.visible && $popoverStore.position) {
		// Calculate optimal position in the next tick to ensure DOM is updated
		setTimeout(() => {
			const { top, left } = calculateOptimalPosition(
				$popoverStore.position.x,
				$popoverStore.position.y
			);

			if (popoverElement) {
				popoverElement.style.top = `${top}px`;
				popoverElement.style.left = `${left}px`;
			}

			// Start tracking mouse when popover is visible
			startMouseTracking();
		}, 0);
	} else if (!$popoverStore.visible) {
		// Stop tracking when popover is hidden
		stopMouseTracking();
	}

	// Clean up any intervals when component is destroyed
	onDestroy(() => {
		stopMouseTracking();
	});
</script>

<!-- The popover itself, rendered in the portal -->
{#if $popoverStore.visible && $popoverStore.movie}
	<div
		class="popover-container"
		bind:this={popoverElement}
		in:scale={{ duration: 200, start: 0.95 }}
		out:fade={{ duration: 150 }}
	>
		<div class="movie-popover">
			<!-- Backdrop header with gradient overlay -->
			<div class="backdrop-header">
				{#if $popoverStore.movie.backdrop || $popoverStore.movie.details?.artwork?.background}
					<img
						src={$popoverStore.movie.backdrop || $popoverStore.movie.details?.artwork?.background}
						alt={`${$popoverStore.movie.title || $popoverStore.movie.details?.title || 'Movie'} backdrop`}
						class="backdrop-image"
					/>
				{:else if $popoverStore.movie.poster || $popoverStore.movie.details?.artwork?.poster}
					<img
						src={$popoverStore.movie.poster || $popoverStore.movie.details?.artwork?.poster}
						alt={`${$popoverStore.movie.title || $popoverStore.movie.details?.title || 'Movie'} poster`}
						class="backdrop-image poster-as-backdrop"
					/>
				{/if}
				<div class="backdrop-gradient"></div>

				<!-- Title and year overlay -->
				<div class="title-container">
					<h3 class="movie-title">
						{$popoverStore.movie.title || $popoverStore.movie.details?.title || 'Unknown Title'}
					</h3>
					<div class="movie-year">
						{$popoverStore.movie.year || $popoverStore.movie.details?.releaseYear || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Content area -->
			<div class="movie-content">
				<!-- Quick facts row -->
				<div class="quick-facts">
					{#if $popoverStore.movie.rating}
						<div class="rating">
							<span class="stars">{formatRating($popoverStore.movie.rating)}</span>
							<span class="rating-value">{$popoverStore.movie.rating.toFixed(1)}</span>
						</div>
					{/if}

					{#if $popoverStore.movie.runtime}
						<div class="runtime">{formatRuntime($popoverStore.movie.runtime)}</div>
					{/if}

					{#if ($popoverStore.movie.genres && $popoverStore.movie.genres.length > 0) || ($popoverStore.movie.details?.genres && $popoverStore.movie.details.genres.length > 0)}
						<div class="genres">
							{($popoverStore.movie.genres || $popoverStore.movie.details?.genres || [])
								.slice(0, 3)
								.join(' • ')}
						</div>
					{/if}
				</div>

				<!-- Overview -->
				{#if $popoverStore.movie.overview || $popoverStore.movie.details?.description}
					<p class="overview">
						{$popoverStore.movie.overview ||
							$popoverStore.movie.details?.description ||
							'No description available.'}
					</p>
				{/if}

				<!-- Cast and director -->
				{#if $popoverStore.movie.director || ($popoverStore.movie.cast && $popoverStore.movie.cast.length > 0)}
					<div class="credits">
						{#if $popoverStore.movie.director}
							<p class="director">
								<span class="label">Director:</span>
								{$popoverStore.movie.director}
							</p>
						{/if}

						{#if $popoverStore.movie.cast && $popoverStore.movie.cast.length > 0}
							<p class="cast">
								<span class="label">Cast:</span>
								{$popoverStore.movie.cast.slice(0, 5).join(', ')}
								{#if $popoverStore.movie.cast.length > 5}
									<span class="more">+{$popoverStore.movie.cast.length - 5} more</span>
								{/if}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Why recommended (reason) -->
				{#if $popoverStore.movie.reason}
					<div class="reason">
						<h4>Why we recommend this:</h4>
						<p>{$popoverStore.movie.reason}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Container for the popover */
	:global(.movie-popover-portal) {
		position: fixed;
		z-index: 9999;
		pointer-events: none;
	}

	:global(.movie-popover-portal *) {
		pointer-events: auto;
	}

	.popover-container {
		position: fixed;
		z-index: 9999;
		width: 350px;
		box-shadow:
			0 14px 28px rgba(0, 0, 0, 0.25),
			0 10px 10px rgba(0, 0, 0, 0.22);
		border-radius: 8px;
		overflow: visible;
		background-color: #2a2a2a;
		color: #e2e2e2;
		max-height: 90vh;
		overflow-y: auto;
	}

	.movie-popover {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.backdrop-header {
		position: relative;
		height: 150px;
		overflow: hidden;
	}

	.backdrop-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.poster-as-backdrop {
		object-position: center 20%;
		filter: blur(1px);
	}

	.backdrop-gradient {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			rgba(0, 0, 0, 0.5) 70%,
			rgba(0, 0, 0, 0.8) 100%
		);
	}

	.title-container {
		position: absolute;
		bottom: 10px;
		left: 15px;
		right: 15px;
		color: white;
	}

	.movie-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		line-height: 1.2;
	}

	.movie-year {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.movie-content {
		padding: 15px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.quick-facts {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		font-size: 0.9rem;
		margin-bottom: 5px;
	}

	.rating {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.stars {
		color: gold;
		letter-spacing: -2px;
	}

	.rating-value {
		font-weight: 600;
	}

	.runtime {
		color: #e2e2e2;
		opacity: 0.85;
	}

	.genres {
		font-style: italic;
		color: #e2e2e2;
		opacity: 0.85;
	}

	.overview {
		font-size: 0.9rem;
		line-height: 1.4;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.credits {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.85rem;
	}

	.director,
	.cast {
		margin: 0;
	}

	.label {
		font-weight: 600;
		opacity: 0.9;
	}

	.more {
		font-style: italic;
		opacity: 0.7;
	}

	.reason {
		margin-top: 5px;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.reason h4 {
		font-size: 0.9rem;
		margin: 0 0 5px 0;
		color: #7e57c2;
	}

	.reason p {
		font-size: 0.85rem;
		font-style: italic;
		line-height: 1.4;
		margin: 0;
		opacity: 0.9;
	}
</style>
