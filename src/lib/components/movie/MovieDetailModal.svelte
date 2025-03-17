<!-- MovieDetailModal.svelte -->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Play, Calendar, Star, Bookmark, Check } from '@lucide/svelte';

	export let movie;
	export let isInWatchlist;
	export let show = false;

	function closeModal() {
		dispatch('close');
	}

	function toggleWatchlist() {
		dispatch('toggleWatchlist', movie);
	}

	function requestDownload() {
		dispatch('requestDownload', movie);
	}

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

{#if show && movie}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
		transition:fade={{ duration: 200 }}
		on:click={closeModal}
	>
		<div
			class="bg-surface-100-900 relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl"
			transition:fly={{ y: 20, duration: 300 }}
			on:click|stopPropagation={() => {}}
		>
			<button
				class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white"
				on:click={closeModal}
			>
				×
			</button>

			<div
				class="relative h-[300px] w-full bg-cover bg-center sm:h-[400px]"
				style="background-image: url('{movie.backdrop}');"
			>
				<div class="from-surface-100-900 absolute inset-0 bg-gradient-to-t to-transparent"></div>
				<div class="absolute bottom-0 left-0 p-6 text-white">
					<h2 class="text-3xl font-bold">{movie.title}</h2>
					<div class="mt-2 flex flex-wrap items-center gap-3 text-sm">
						<span class="flex items-center gap-1">
							<Calendar size={14} />
							{movie.year}
						</span>
						<span class="flex items-center gap-1">
							<Star size={14} class="text-yellow-400" />
							{movie.rating}
						</span>
						<span class="bg-surface-200-800 rounded-full px-2 py-0.5">
							{movie.type === 'movie' ? 'Movie' : 'Series'}
						</span>
						{#each movie.genres as genre}
							<span class="bg-surface-200-800 rounded-full px-2 py-0.5">{genre}</span>
						{/each}
					</div>
				</div>
			</div>

			<div class="p-6">
				<p class="mb-6">{movie.overview}</p>

				<div class="mb-6 flex flex-wrap gap-2">
					<button class="btn preset-filled-primary-500 flex items-center gap-2">
						<Play size={16} />
						<span>Watch Now</span>
					</button>

					<button
						class="btn preset-outlined-surface-500 flex items-center gap-2"
						on:click={toggleWatchlist}
					>
						{#if isInWatchlist(movie.id)}
							<Check size={16} />
							<span>In Watchlist</span>
						{:else}
							<Bookmark size={16} />
							<span>Add to Watchlist</span>
						{/if}
					</button>

					<button
						class="btn preset-outlined-surface-500 flex items-center gap-2"
						on:click={requestDownload}
					>
						<Calendar size={16} />
						<span>Request Download</span>
					</button>
				</div>

				<div class="border-surface-200-800 border-t pt-4">
					<h3 class="mb-2 text-lg font-bold">Why we recommend this</h3>
					<p class="text-sm opacity-80">
						Based on your watching preferences and history, our AI found similarities with other
						content you've enjoyed. You tend to watch {movie.genres.join(', ')} content frequently and
						rate them highly.
					</p>
				</div>

				<div class="mt-4 text-sm">
					<p class="opacity-60">
						Available on: <span class="text-primary-500 font-medium">{movie.source}</span>
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}
