<!-- MovieCard.svelte -->
<script lang="ts">
	import { Plus, Check, Star, ShoppingCart, Sparkles } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';
	import { movieCart, type CartMovie } from '../../stores/movieCart';
	import { goto } from '$app/navigation';

	export let movie;
	export let isInWatchlist = false;
	export let isInCart = false;

	const dispatch = createEventDispatcher();

	// Check if movie has AI recommendation score
	const hasAiRecommendation = movie.aiScore !== undefined;

	function handleClick() {
		// If this is a modal view, use the event
		if (typeof dispatch === 'function') {
			dispatch('showDetails', movie);
		} else {
			// Navigate to the movie details page
			goto(`/movies/${movie.id}`);
		}
	}

	function handleWatchlistClick(e) {
		e.stopPropagation();
		dispatch('toggleWatchlist', movie);
	}

	function handleCartClick(e) {
		e.stopPropagation();
		dispatch('toggleCart', movie);
	}

	// Format AI score as percentage
	function getAiMatchPercentage() {
		return hasAiRecommendation ? `${movie.aiScore}% match` : '';
	}
</script>

<div
	class="group relative cursor-pointer overflow-hidden rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-black/20"
	on:click={handleClick}
>
	<!-- AI Score Badge -->
	{#if hasAiRecommendation}
		<div class="absolute top-2 left-2 z-10 flex items-center gap-1 rounded bg-secondary-500/80 px-2 py-1 text-xs font-medium text-white">
			<Sparkles size={10} />
			<span>{movie.aiScore}% Match</span>
		</div>
	{/if}

	<!-- Media Source Badge -->
	<div class="absolute top-2 left-2 z-10 {hasAiRecommendation ? 'translate-y-7' : ''} flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
		<span>{movie.source}</span>
	</div>

	<!-- Poster Image -->
	<img src={movie.poster} alt={movie.title} class="h-[300px] w-full object-cover" />
	
	<!-- Action Buttons -->
	<div class="absolute top-2 right-2 flex flex-col gap-2">
		<!-- Watchlist Button -->
		<button
			class="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors 
				{isInWatchlist ? 'bg-primary-500 hover:bg-primary-600' : 'hover:bg-primary-500'}"
			on:click={handleWatchlistClick}
			title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
		>
			{#if isInWatchlist}
				<Check size={16} />
			{:else}
				<Plus size={16} />
			{/if}
		</button>
		
		<!-- Collection Button -->
		<button
			class="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors
				{isInCart ? 'bg-primary-700 hover:bg-primary-800' : 'hover:bg-primary-700'}"
			on:click={handleCartClick}
			title={isInCart ? "Remove from Collection" : "Add to Collection"}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
				<path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
				<path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4z"/>
			</svg>
		</button>
	</div>

	<!-- Show progress bar for "Continue Watching" items -->
	{#if movie.progress !== undefined}
		<div class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4">
			<h4 class="font-bold text-white">{movie.title}</h4>
			<div class="mt-1 flex items-center gap-2 text-sm text-gray-300">
				<span>{movie.year}</span>
				<span>•</span>
				<span>{movie.type === 'movie' ? 'Movie' : 'Series'}</span>
			</div>
			<div class="mt-2 h-1 w-full rounded bg-gray-700">
				<div class="bg-primary-500 h-full rounded" style="width: {movie.progress}%"></div>
			</div>
		</div>
	{:else}
		<div class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4">
			<h4 class="font-bold text-white">{movie.title}</h4>
			<div class="mt-1 flex items-center gap-2 text-sm text-gray-300">
				<span>{movie.year}</span>
				<span>•</span>
				<span>{movie.type === 'movie' ? 'Movie' : 'Series'}</span>
			</div>
			<div class="mt-1 flex items-center gap-1 text-sm text-yellow-400">
				<Star size={14} />
				<span>{movie.rating}</span>
			</div>
			
			<!-- AI Recommendation Reason (if available) -->
			{#if movie.aiReason}
				<div class="mt-2 text-xs text-secondary-200 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<Sparkles size={10} />
					<p class="line-clamp-2">{movie.aiReason}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
