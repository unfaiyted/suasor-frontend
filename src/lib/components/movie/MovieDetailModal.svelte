<!-- MovieDetailModal.svelte -->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Play, Calendar, Star, Bookmark, Check, Sparkles, ShoppingCart } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';

	export let movie;
	export let isInWatchlist;
	export let isInCart = id => false;
	export let show = false;

	const dispatch = createEventDispatcher();

	function closeModal() {
		dispatch('close');
	}

	function toggleWatchlist() {
		dispatch('toggleWatchlist', movie);
	}

	function toggleCart() {
		dispatch('toggleCart', movie);
	}

	function requestDownload() {
		dispatch('requestDownload', movie);
	}
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

			<!-- Movie backdrop with AI match badge if available -->
			<div
				class="relative h-[300px] w-full bg-cover bg-center sm:h-[400px]"
				style="background-image: url('{movie.backdrop}');"
			>
				<div class="from-surface-100-900 absolute inset-0 bg-gradient-to-t to-transparent"></div>
				
				<!-- AI Score Badge -->
				{#if movie.aiScore}
					<div class="absolute top-4 left-4 z-10 flex items-center gap-1 rounded bg-secondary-500/80 px-3 py-1.5 text-sm font-medium text-white">
						<Sparkles size={14} />
						<span>{movie.aiScore}% Match</span>
					</div>
				{/if}
				
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
					
					<!-- Add to Collection Button -->
					<button
						class="btn {isInCart(movie.id) ? 'preset-filled-primary-600' : 'preset-outlined-surface-500'} flex items-center gap-2"
						on:click={toggleCart}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
							<path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
							<path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4z"/>
						</svg>
						<span>{isInCart(movie.id) ? 'In Collection' : 'Add to Collection'}</span>
					</button>

					<button
						class="btn preset-outlined-surface-500 flex items-center gap-2"
						on:click={requestDownload}
					>
						<Calendar size={16} />
						<span>Request Download</span>
					</button>
				</div>

				<!-- AI Recommendation Section -->
				<div class="border-surface-200-800 border-t pt-4">
					<h3 class="mb-2 text-lg font-bold flex items-center gap-2">
						<Sparkles size={16} class="text-secondary-500" />
						Why We Recommend This
						{#if movie.aiScore}
							<span class="ml-2 text-sm font-normal bg-secondary-500/20 text-secondary-400 px-2 py-0.5 rounded">
								{movie.aiScore}% Match
							</span>
						{/if}
					</h3>
					<p class="text-sm opacity-80">
						{#if movie.aiReason}
							{movie.aiReason}
						{:else}
							Based on your watching preferences and history, our AI found similarities with other
							content you've enjoyed. You tend to watch {movie.genres.join(', ')} content frequently and
							rate them highly.
						{/if}
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