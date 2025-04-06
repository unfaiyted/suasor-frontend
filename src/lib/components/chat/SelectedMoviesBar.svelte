<!-- components/SelectedMoviesBar.svelte -->
<script lang="ts">
	import { Check, List, MoreVertical } from '@lucide/svelte';
	import type { Movie } from './types';
	import ActionMenu from './ActionMenu.svelte';
	import ListCreationModal from './ListCreationModal.svelte';

	interface SelectedMoviesBarProps {
		selectedMovies: Movie[];
		showActionsMenu: boolean;
		toggleSelection: (movie: Movie) => void;
		createList: () => void;
		handleAction: (actionId: string) => void;
		toggleMenu: () => void;
	}

	let {
		selectedMovies,
		showActionsMenu = $bindable(false),
		toggleSelection,
		handleAction,
		createList,
		toggleMenu
	}: SelectedMoviesBarProps = $props();

	// State for list creation modal using Svelte 5 syntax
	let showListModal = $state(false);

	// Define our own actions for the menu
	const actionItems = [
		{ id: 'recommend', label: 'Recommend based on these' },
		{ id: 'clear', label: 'Clear selection' }
	];

	function toggleMovieSelection(movie: Movie) {
		toggleSelection(movie);
	}

	function handleActionBar(actionId: string) {
		// Handle actions specific to this component
		if (actionId === 'recommend') {
			// Pass to parent for chat message creation
			handleAction('recommend');
		} else if (actionId === 'clear') {
			// Clear all selected movies
			selectedMovies.forEach((movie) => {
				toggleSelection(movie);
			});
		} else {
			// Pass through any other actions to parent
			handleAction(actionId);
		}

		showActionsMenu = false;
	}

	function handleCreateList() {
		showListModal = true;
	}

	function handleListCreated(event: CustomEvent) {
		// Log the created list - in a real app you'd save this to your store or API
		console.log('List created:', event.detail);
		showListModal = false;
	}
</script>

<div
	class="border-surface-200-800 bg-surface-100-900 mt-2 flex items-center justify-between border-b p-2 shadow-sm"
>
	<div class="flex gap-2 overflow-x-auto">
		{#each selectedMovies as movie (movie.id)}
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
					style="top: 3px; left: 8px"
					onclick={() => toggleMovieSelection(movie)}
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
				onclick={handleCreateList}
				title="Create a list from selected movies"
			>
				<List size={16} />
			</button>
			<button
				type="button"
				class="action-menu-btn btn hover:preset-tonal p-2"
				onclick={toggleMenu}
				title="More actions"
			>
				<MoreVertical size={16} />
			</button>
		</nav>
		<ActionMenu
			show={showActionsMenu}
			actions={actionItems}
			onSelect={(e) => handleActionBar(e)}
			onClose={() => (showActionsMenu = false)}
		></ActionMenu>
	</div>
</div>

<!-- List Creation Modal -->
<ListCreationModal
	show={showListModal}
	{selectedMovies}
	on:close={() => (showListModal = false)}
	on:listCreated={handleListCreated}
/>

