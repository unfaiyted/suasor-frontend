<!-- components/SelectedMoviesBar.svelte -->
<script lang="ts">
	import { Check, List, MoreVertical } from '@lucide/svelte';
	import type { Movie } from './types';
	import ActionMenu from './ActionMenu.svelte';

	export let selectedMovies: Movie[] = [];
	export let showActionsMenu = false;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function toggleMovieSelection(movie: Movie) {
		dispatch('toggleSelection', movie);
	}

	function createList() {
		dispatch('createList');
	}

	function handleAction(actionId: string) {
		dispatch('handleAction', actionId);
		showActionsMenu = false;
	}
</script>

<div class="border-surface-200-800 flex items-center justify-between border-t p-2">
	<div class="flex gap-2 overflow-x-auto">
		{#each selectedMovies as movie}
			<div class="relative w-16 flex-shrink-0">
				<img
					src={movie.poster ||
						movie.details?.artwork?.poster ||
						`https://via.placeholder.com/160x240?text=${encodeURIComponent(movie.title || movie.details?.title || 'Movie')}`}
					alt={movie.title || movie.details?.title || 'Movie'}
					class="h-24 w-16 rounded object-cover"
				/>
				<button
					class="bg-primary-500 absolute flex h-5 w-5 items-center justify-center rounded-full text-white"
					style={'top: 3px; left: 8px'}
					on:click={() => toggleMovieSelection(movie)}
				>
					<Check size={12} />
				</button>
				<div class="absolute right-0 bottom-0 left-0 bg-black/80 p-1">
					<p class="truncate text-xs text-white">
						{movie.title || movie.details?.title || 'Unknown'}
					</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="flex gap-2">
		<nav class="btn-group preset-outlined-surface-200-800 flex-col p-1">
			<button
				type="button"
				class="btn preset-filled flex items-center gap-1 p-2"
				on:click={createList}
			>
				<List size={16} />
			</button>

			<ActionMenu
				show={showActionsMenu}
				on:select={(e) => handleAction(e.detail)}
				on:close={() => (showActionsMenu = false)}
			>
				<button
					slot="trigger"
					type="button"
					class="btn hover:preset-tonal p-2"
					on:click={() => (showActionsMenu = !showActionsMenu)}
				>
					<MoreVertical size={16} />
				</button>
			</ActionMenu>
		</nav>
	</div>
</div>
