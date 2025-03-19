<script lang="ts">
	import { Star, Check, Plus } from '@lucide/svelte';
	import type { Movie } from './types';

	export let movie: Movie;
	export let selected: boolean = false;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function toggleSelection() {
		dispatch('toggleSelection', movie);
	}
</script>

<div
	class="card hover:ring-primary-500 w-full max-w-[150px] overflow-hidden transition-all hover:ring-2"
>
	<div class="relative">
		<img src={movie.poster} alt={movie.title} class="h-[120px] w-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
		<div class="absolute bottom-0 left-0 p-2 text-white">
			<h4 class="text-sm font-bold">{movie.title}</h4>
			<div class="flex items-center gap-1 text-xs">
				<span>{movie.year}</span>
				<span class="flex items-center gap-1">
					<Star size={10} class="text-yellow-400" />
					{movie.rating}
				</span>
			</div>
		</div>

		<button
			class="hover:bg-primary-500 absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full {selected
				? 'bg-primary-500'
				: 'bg-black/70'} z-10 text-white"
			on:click={toggleSelection}
		>
			{#if selected}
				<Check size={14} />
			{:else}
				<Plus size={14} />
			{/if}
		</button>
	</div>
	<div class="p-2">
		<div class="flex flex-wrap gap-1">
			{#each movie.genres.slice(0, 2) as genre}
				<span class="bg-surface-200-800 rounded-full p-1 px-1.5 py-0 text-xs">{genre}</span>
			{/each}
		</div>
	</div>
</div>
