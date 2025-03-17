<!-- MovieCard.svelte -->
<script lang="ts">
	import { Plus, Check, Star } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';

	export let movie;
	export let isInWatchlist = false;

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('showDetails', movie);
	}

	function handleWatchlistClick(e) {
		e.stopPropagation();
		dispatch('toggleWatchlist', movie);
	}
</script>

<div
	class="group relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
	on:click={handleClick}
>
	<img src={movie.poster} alt={movie.title} class="h-[300px] w-full object-cover" />
	<div class="absolute top-2 right-2 flex flex-col gap-2">
		<button
			class="hover:bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors"
			on:click={handleWatchlistClick}
		>
			{#if isInWatchlist}
				<Check size={16} />
			{:else}
				<Plus size={16} />
			{/if}
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
		</div>
	{/if}
</div>
