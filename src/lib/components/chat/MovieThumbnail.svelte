<script lang="ts">
	import { Star, Check, Plus } from '@lucide/svelte';
	import type { Movie } from './types';

	interface AnimatedMovieThumbnailProps {
		movie: Movie;
		selected: boolean;
		toggleSelection: (movie: Movie) => void;
	}
	let { toggleSelection, movie, selected }: AnimatedMovieThumbnailProps = $props();
</script>

<div
	class="card hover:ring-primary-500 w-full max-w-[150px] overflow-hidden transition-all hover:ring-2"
>
	<div class="relative">
		<img
			src={$derived(movie.poster || movie.details?.artwork?.poster || `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || movie.details?.title || 'Movie')}`)}
			alt={movie.title || movie.details?.title || 'Movie'}
			class="h-[120px] w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
		<div class="absolute bottom-0 left-0 p-2 text-white">
			<h4 class="text-sm font-bold">{movie.title || movie.details?.title || 'Unknown'}</h4>
			<div class="flex items-center gap-1 text-xs">
				<span>{movie.year || movie.details?.releaseYear || 'N/A'}</span>
				<span class="flex items-center gap-1">
					<Star size={10} class="text-yellow-400" />
					{movie.rating ||
						movie.details?.userRating ||
						(movie.details?.ratings?.imdb ? movie.details.ratings.imdb : 0)}
				</span>
			</div>
		</div>

		<button
			class="hover:bg-primary-500 absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full {selected
				? 'bg-primary-500'
				: 'bg-black/70'} z-100 text-white"
			onclick={() => toggleSelection(movie)}
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
			{#each (movie.genres || movie.details?.genres || []).slice(0, 2) as genre}
				<span class="bg-surface-200-800 rounded-full p-1 px-1.5 py-0 text-xs">{genre}</span>
			{/each}
		</div>
	</div>
</div>
