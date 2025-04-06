<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { X, Save, MoveVertical, Film, List } from '@lucide/svelte';
	import Portal from '../portal/Portal.svelte';
	import type { Movie } from './types';
	import { mediaClients } from '$lib/stores/api';

	interface ListCreationModalProps {
		show: boolean;
		selectedMovies: Movie[];
	}

	let { show = false, selectedMovies = [] }: ListCreationModalProps = $props();

	// State management with Svelte 5 syntax
	let listName = $state('');
	let selectedClientId = $state<number | null>(null);
	let listType = $state<'playlist' | 'collection'>('playlist');
	let errorMessage = $state('');
	let successMessage = $state('');
	let draggedIndex = $state<number | null>(null);
	let isSubmitting = $state(false);
	let orderedMovies = $state<Movie[]>([]);

	// Create event dispatcher
	const dispatch = createEventDispatcher();

	// Reset form fields
	function resetForm() {
		listName = '';
		selectedClientId = null;
		listType = 'playlist';
		errorMessage = '';
		successMessage = '';
		isSubmitting = false;
	}

	// Initialize orderedMovies when selectedMovies change
	$effect(() => {
		orderedMovies = [...selectedMovies];
	});

	// Close the modal
	function closeModal() {
		resetForm();
		dispatch('close');
	}

	// Handle click outside modal to close
	function handleOutsideClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('modal-backdrop')) {
			closeModal();
		}
	}

	// Client selection logic
	let availableClients = $derived([...$mediaClients].filter((client) => client.isEnabled));

	function handleClientChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectedClientId = parseInt(select.value);
	}

	// Drag and drop functionality
	function startDrag(index: number) {
		draggedIndex = index;
	}

	function onDragOver(index: number) {
		if (draggedIndex === null || draggedIndex === index) return;

		// Reorder the movies
		const moviesToReorder = [...orderedMovies];
		const [draggedMovie] = moviesToReorder.splice(draggedIndex, 1);
		moviesToReorder.splice(index, 0, draggedMovie);

		// Update the state
		orderedMovies = moviesToReorder;
		draggedIndex = index;
	}

	function endDrag() {
		draggedIndex = null;
	}

	// Save the list
	async function saveList() {
		// Validate form
		if (!listName.trim()) {
			errorMessage = 'Please enter a list name';
			return;
		}

		if (!selectedClientId) {
			errorMessage = 'Please select a media client';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			// In a real implementation, make API call to create list
			// Simulate API call with delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Create list payload
			const listPayload = {
				name: listName,
				clientId: selectedClientId,
				type: listType,
				movies: orderedMovies.map((movie) => movie.id)
			};

			// Show success message
			successMessage = `Successfully created ${listType} "${listName}" with ${orderedMovies.length} movies`;

			// Emit event with the created list data
			dispatch('listCreated', listPayload);

			// Close modal after delay
			setTimeout(() => {
				closeModal();
			}, 1500);
		} catch (error) {
			errorMessage = `Error creating list: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			isSubmitting = false;
		}
	}

	// Keyboard handling
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	// Setup and cleanup event listeners
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if show}
	<Portal>
		<div
			class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			transition:fade={{ duration: 200 }}
			onclick={handleOutsideClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="list-creation-title"
		>
			<div
				class="bg-surface-100-900 relative flex h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl shadow-xl"
				transition:fly={{ y: 20, duration: 300 }}
				onclick={() => {}}
			>
				<!-- Header -->
				<div class="border-surface-200-800 flex items-center justify-between border-b p-4">
					<h2 id="list-creation-title" class="text-lg font-semibold">Create a List</h2>
					<button
						class="hover:bg-surface-200-800 rounded-full p-1.5 transition-colors"
						onclick={closeModal}
						aria-label="Close modal"
					>
						<X size={20} />
					</button>
				</div>

				<!-- Form - scrollable content area -->
				<div class="flex-1 overflow-y-auto p-5">
					{#if errorMessage}
						<div class="mb-4 rounded bg-red-500/10 p-3 text-red-500">
							{errorMessage}
						</div>
					{/if}

					{#if successMessage}
						<div class="mb-4 rounded bg-green-500/10 p-3 text-green-500">
							{successMessage}
						</div>
					{/if}

					<!-- List name -->
					<div class="mb-4">
						<label for="list-name" class="mb-1 block text-sm font-medium">List Name</label>
						<input
							id="list-name"
							type="text"
							bind:value={listName}
							class="input w-full"
							placeholder="My Movie List"
							required
							disabled={isSubmitting}
						/>
					</div>

					<!-- Media client selection -->
					<div class="mb-4">
						<label for="media-client" class="mb-1 block text-sm font-medium">Media Client</label>
						<select
							id="media-client"
							class="select w-full"
							onchange={handleClientChange}
							disabled={isSubmitting}
							required
						>
							<option value="">Select a media client</option>
							{#each availableClients as client (client.id)}
								<option value={client.id}>{client.name}</option>
							{/each}
						</select>
					</div>

					<!-- List type selection -->
					<div class="mb-4">
						<label for="list-type" class="mb-1 block text-sm font-medium">List Type</label>
						<div class="grid grid-cols-2 gap-3">
							<button
								class="btn flex items-center justify-center gap-2 p-3"
								class:preset-filled-primary-500={listType === 'playlist'}
								class:preset-outlined-primary-500={listType !== 'playlist'}
								onclick={() => (listType = 'playlist')}
								disabled={isSubmitting}
								type="button"
							>
								<List size={18} />
								<span>Playlist</span>
							</button>
							<button
								class="btn flex items-center justify-center gap-2 p-3"
								class:preset-filled-primary-500={listType === 'collection'}
								class:preset-outlined-primary-500={listType !== 'collection'}
								onclick={() => (listType = 'collection')}
								disabled={isSubmitting}
								type="button"
							>
								<Film size={18} />
								<span>Collection</span>
							</button>
						</div>
					</div>

					<!-- Movies list with drag and drop for playlist -->
					{#if listType === 'playlist' && orderedMovies.length > 0}
						<div class="mb-4">
							<div class="mb-2 flex items-center gap-2">
								<label class="text-sm font-medium">Movie Order</label>
								<span class="text-xs opacity-60">(Drag to reorder)</span>
							</div>
							<div class="border-surface-200-800 overflow-y-auto rounded border">
								{#each orderedMovies as movie, index (movie.id)}
									<div
										class="hover:bg-surface-300-800 group flex cursor-move items-center gap-2 p-2 transition-colors"
										class:bg-surface-300-800={draggedIndex === index}
										animate:flip={{ duration: 300 }}
										draggable="true"
										ondragstart={() => startDrag(index)}
										ondragover={() => onDragOver(index)}
										ondragend={endDrag}
									>
										<div class="flex-shrink-0">
											<MoveVertical
												size={16}
												class="text-primary-400 opacity-50 group-hover:opacity-100"
											/>
										</div>
										<img
											src={movie.poster ||
												movie.details?.artwork?.poster ||
												`https://via.placeholder.com/45x68?text=${encodeURIComponent(movie.title || 'Movie')}`}
											alt={movie.title}
											class="h-12 w-8 rounded object-cover"
										/>
										<div class="min-w-0 flex-1">
											<div class="truncate text-sm font-medium">{movie.title}</div>
											<div class="text-xs opacity-70">{movie.year || 'N/A'}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else if orderedMovies.length > 0}
						<div class="mb-4">
							<div class="mb-2">
								<label class="text-sm font-medium">Selected Movies ({orderedMovies.length})</label>
							</div>
							<div
								class="border-surface-200-800 grid grid-cols-4 gap-2 overflow-y-auto rounded border p-2"
							>
								{#each orderedMovies as movie (movie.id)}
									<div class="relative aspect-[2/3] overflow-hidden rounded">
										<img
											src={movie.poster ||
												movie.details?.artwork?.poster ||
												`https://via.placeholder.com/90x135?text=${encodeURIComponent(movie.title || 'Movie')}`}
											alt={movie.title}
											class="h-full w-full object-cover"
										/>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Spacer to ensure content doesn't get hidden behind fixed footer -->
				</div>

				<!-- Fixed footer with save button -->
				<div class="border-surface-200-800 bg-surface-100-900 flex-shrink-0 border-t p-4 shadow-lg">
					<div class="flex justify-end">
						<button
							class="btn preset-filled-primary-500 flex items-center gap-2 px-4 py-2"
							onclick={saveList}
							disabled={isSubmitting}
							type="button"
						>
							{#if isSubmitting}
								<div class="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
								<span>Creating...</span>
							{:else}
								<Save size={18} />
								<span>Save {listType}</span>
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</Portal>
{/if}

<style>
	.modal-backdrop {
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
	}
</style>
