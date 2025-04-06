<script lang="ts">
	import { showPopover, hidePopover } from './MoviePopoverManager.svelte';
	import type { Movie } from './types';

	type MovieCardProps = {
		movie: Movie;
		showPopoverOnHover?: boolean;
	};

	let { movie, showPopoverOnHover }: MovieCardProps = $props();

	let cardElement;
	let hoverTimeout;

	function handleMouseEnter() {
		if (!showPopoverOnHover) return;

		clearTimeout(hoverTimeout);
		hoverTimeout = setTimeout(() => {
			if (cardElement) {
				const rect = cardElement.getBoundingClientRect();
				showPopover(movie, rect.right, rect.top + 20);
			}
		}, 400);
	}

	function handleMouseLeave() {
		if (!showPopoverOnHover) return;

		clearTimeout(hoverTimeout);
		hoverTimeout = setTimeout(() => {
			hidePopover();
		}, 200);
	}

	import { onDestroy } from 'svelte';

	onDestroy(() => {
		clearTimeout(hoverTimeout);
	});
</script>

<div
	class="movie-card"
	bind:this={cardElement}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="card-image">
		<img
			src={movie.poster ||
				movie.details?.artwork?.poster ||
				`https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || movie.details?.title || 'Movie')}`}
			alt={movie.title || movie.details?.title || 'Movie'}
		/>
	</div>
	<div class="card-content">
		<h3 class="card-title">{movie.title || movie.details?.title || 'Unknown'}</h3>
		<div class="card-meta">
			<span class="year">{movie.year || movie.details?.releaseYear || 'N/A'}</span>
			{#if movie.rating || movie.details?.userRating}
				<span class="rating">★ {movie.rating || movie.details?.userRating || 0}</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.movie-card {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		background-color: #2a2a2a;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		cursor: pointer;
	}

	.movie-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
	}

	.card-image {
		aspect-ratio: 2/3;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.movie-card:hover .card-image img {
		transform: scale(1.05);
	}

	.card-content {
		padding: 12px;
	}

	.card-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 5px 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		opacity: 0.8;
	}

	.rating {
		color: gold;
	}
</style>
