<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { MoveVertical, Plus, Check, Star, Trash, Edit } from '@lucide/svelte';
	import { mediaCollection } from '$lib/stores/mediaCollection';

	// Props interface
	interface MediaListProps {
		items: any[];
		isReordering?: boolean;
		listType?: 'playlist' | 'collection';
		layout?: 'grid' | 'list';
		allowRemoveItems?: boolean;
		showNumbers?: boolean;
	}

	// Set props with Svelte 5 syntax
	let {
		items = [],
		isReordering = false,
		listType = 'playlist',
		layout = 'list',
		allowRemoveItems = true,
		showNumbers = true
	}: MediaListProps = $props();

	// Reactive state
	let draggedIndex = $state<number | null>(null);

	// Event dispatcher for component events
	const dispatch = createEventDispatcher();

	// Handle item selection
	function handleItemClick(item: any) {
		dispatch('select', item);
	}

	// Handle item removal
	function handleRemoveItem(event: Event, index: number) {
		event.stopPropagation();
		dispatch('remove', { item: items[index], index });
	}

	// Handle item reordering
	function startDrag(index: number) {
		if (!isReordering) return;
		draggedIndex = index;
	}

	function onDragOver(index: number) {
		if (!isReordering || draggedIndex === null || draggedIndex === index) return;

		dispatch('reorder', { fromIndex: draggedIndex, toIndex: index });
		draggedIndex = index;
	}

	function endDrag() {
		if (!isReordering) return;
		draggedIndex = null;
	}

	// Add item to collection
	function addToCollection(event: Event, item: any) {
		event.stopPropagation();
		mediaCollection.addItem(item);
	}

	// Check if item is in collection
	function isInCollection(id: string | number) {
		const currentCollection = $mediaCollection?.items || [];
		return currentCollection.some((item) => item.id === id);
	}
</script>

{#if layout === 'list'}
	<!-- List Layout -->
	<div class="bg-surface-200-800 border-surface-300-700 overflow-hidden rounded-lg border">
		{#if items.length === 0}
			<div class="text-surface-500-400 py-8 text-center">
				<p>No items in this {listType}</p>
			</div>
		{:else}
			{#each items as item, index (item.id)}
				<div
					class={`group border-surface-300-700 bg-surface-200-800 hover:bg-surface-300-700 flex cursor-pointer items-center border-b p-3 transition-colors last:border-b-0
          ${draggedIndex === index && isReordering ? 'bg-surface-300-700' : ''}`}
					draggable={isReordering}
					ondragstart={() => startDrag(index)}
					ondragover={() => onDragOver(index)}
					ondragend={endDrag}
					onclick={() => handleItemClick(item)}
				>
					<!-- Item number or reorder handle -->
					<div class="flex w-8 flex-shrink-0 items-center justify-center">
						{#if isReordering}
							<button class="text-surface-500-400 cursor-move hover:text-white">
								<MoveVertical size={16} />
							</button>
						{:else if showNumbers}
							<span class="text-surface-500-400 text-sm">{index + 1}</span>
						{/if}
					</div>

					<!-- Thumbnail -->
					<div class="mr-3 h-16 w-12 flex-shrink-0">
						<img
							src={item.poster ||
								item.poster_path ||
								item.artwork?.poster ||
								`https://via.placeholder.com/48x72?text=${encodeURIComponent(item.title || 'Media')}`}
							alt={item.title}
							class="h-full w-full rounded object-cover"
						/>
					</div>

					<!-- Media info -->
					<div class="min-w-0 flex-grow">
						<div class="truncate font-medium">{item.title}</div>
						<div class="text-surface-500-400 flex items-center gap-2 text-xs">
							<span
								>{item.year ||
									(item.release_date ? new Date(item.release_date).getFullYear() : 'Unknown')}</span
							>
							{#if item.rating}
								<span class="flex items-center gap-1">
									<Star size={10} class="text-yellow-500" />
									{item.rating}
								</span>
							{/if}
							{#if item.genres && item.genres.length > 0}
								<span>•</span>
								<span class="truncate">{item.genres.slice(0, 2).join(', ')}</span>
							{/if}
						</div>
					</div>

					<!-- Actions -->
					<div
						class="ml-2 flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100"
					>
						<!-- Collection button -->
						<button
							class="hover:bg-primary-700 flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors {isInCollection(
								item.id
							)
								? 'bg-primary-700'
								: 'bg-surface-300-700'}"
							onclick={(e) => addToCollection(e, item)}
							title={isInCollection(item.id) ? 'Remove from Collection' : 'Add to Collection'}
						>
							{#if isInCollection(item.id)}
								<Check size={16} />
							{:else}
								<Plus size={16} />
							{/if}
						</button>

						{#if allowRemoveItems}
							<button
								class="bg-surface-300-700 flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-red-700"
								onclick={(e) => handleRemoveItem(e, index)}
								title="Remove from List"
							>
								<Trash size={16} />
							</button>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
{:else}
	<!-- Grid Layout (similar to MovieGrid) -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each items as item, index (item.id)}
			<div
				class="group relative cursor-pointer overflow-hidden rounded-lg bg-surface-200-800 border border-surface-300-700 transition-all hover:scale-105 hover:shadow-lg hover:shadow-black/20"
				onclick={() => handleItemClick(item)}
			>
				{#if showNumbers}
					<div
						class="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded bg-black/60 text-xs font-medium text-white"
					>
						{index + 1}
					</div>
				{/if}

				<!-- Poster Image -->
				<img
					src={item.poster ||
						item.poster_path ||
						item.artwork?.poster ||
						`https://via.placeholder.com/300x450?text=${encodeURIComponent(item.title || 'Media')}`}
					alt={item.title}
					class="h-[300px] w-full object-cover"
				/>

				<!-- Action Buttons -->
				<div class="absolute top-2 right-2 flex flex-col gap-2">
					<!-- Collection button -->
					<button
						class="hover:bg-primary-700 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors"
						class:bg-primary-700={isInCollection(item.id)}
						onclick={(e) => addToCollection(e, item)}
						title={isInCollection(item.id) ? 'Remove from Collection' : 'Add to Collection'}
					>
						{#if isInCollection(item.id)}
							<Check size={16} />
						{:else}
							<Plus size={16} />
						{/if}
					</button>

					{#if allowRemoveItems}
						<button
							class="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-red-700"
							onclick={(e) => handleRemoveItem(e, index)}
							title="Remove from List"
						>
							<Trash size={16} />
						</button>
					{/if}
				</div>

				<div
					class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4"
				>
					<h4 class="font-bold text-white">{item.title}</h4>
					<div class="mt-1 flex items-center gap-2 text-sm text-gray-300">
						<span
							>{item.year ||
								(item.release_date ? new Date(item.release_date).getFullYear() : '')}</span
						>
						{#if item.rating}
							<span class="flex items-center gap-1 text-yellow-400">
								<Star size={14} />
								<span>{item.rating}</span>
							</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

