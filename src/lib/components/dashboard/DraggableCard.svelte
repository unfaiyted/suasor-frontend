<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Grip, X, Cog, Maximize2 } from '@lucide/svelte';

	interface DraggableCardProps {
		id: string;
		title: string;
		editable: boolean;
		size: { width: number; height: number };
		removable?: boolean;
	}

	const { id, title, editable, size, removable = true }: DraggableCardProps = $props();
	const dispatch = createEventDispatcher();

	let isDragging = $state(false);
	let isEditing = $state(false);

	function handleDragStart(e: DragEvent) {
		if (!editable) return;
		isDragging = true;
		// Set data for drag operation
		e.dataTransfer?.setData('application/json', JSON.stringify({ id, title, size }));
		// For visual feedback during drag
		if (e.target instanceof HTMLElement) {
			setTimeout(() => {
				if (e.target instanceof HTMLElement) {
					e.target.style.opacity = '0.4';
				}
			}, 0);
		}
		// Dispatch a custom event for parent to handle
		dispatch('dragstart', { originalEvent: e, id });
	}

	function handleDragEnd(e: DragEvent) {
		isDragging = false;
		if (e.target instanceof HTMLElement) {
			e.target.style.opacity = '1';
		}
		// Dispatch a custom event for parent to handle
		dispatch('dragend', { originalEvent: e, id });
	}

	function toggleEditing() {
		isEditing = !isEditing;
		dispatch('toggleedit', { id, isEditing });
	}

	function removeCard() {
		dispatch('remove', { id });
	}

	// Cycle through available sizes when resize button is clicked
	function resizeWidget() {
		// Define possible sizes based on widget type/id
		let possibleSizes: Array<{ width: number; height: number }>;

		switch (id) {
			case 'movies-stats':
			case 'tv-stats':
			case 'music-stats':
				// Stat cards only support 1x1
				possibleSizes = [{ width: 1, height: 1 }];
				break;

			case 'activity':
				// Activity supports 1x2, 2x2, and 3x2
				possibleSizes = [
					{ width: 1, height: 2 },
					{ width: 1, height: 3 },
					{ width: 2, height: 2 },
					{ width: 3, height: 2 }
				];
				break;

			case 'jobs':
				// Jobs supports 2x1, 2x2, and 3x2
				possibleSizes = [
					{ width: 2, height: 1 },
					{ width: 2, height: 2 },
					{ width: 3, height: 2 }
				];
				break;

			case 'discovery':
				// Discovery supports 2x1, 2x2, 3x1
				possibleSizes = [
					{ width: 2, height: 1 },
					{ width: 2, height: 2 },
					{ width: 3, height: 1 }
				];
				break;

			case 'integrations':
				// Integrations supports 1x4 and 2x4
				possibleSizes = [
					{ width: 1, height: 4 },
					{ width: 1, height: 3 },
					{ width: 1, height: 2 },
					{ width: 2, height: 4 },
					{ width: 2, height: 3 }
				];
				break;

			default:
				// Default option for any other widget types
				possibleSizes = [
					{ width: 1, height: 1 },
					{ width: 2, height: 1 },
					{ width: 1, height: 2 },
					{ width: 2, height: 2 }
				];
		}

		// Find current size in the possible sizes
		const currentSizeString = `${size.width}x${size.height}`;
		let currentIndex = possibleSizes.findIndex(
			(s) => `${s.width}x${s.height}` === currentSizeString
		);

		// If current size not found, default to first size
		if (currentIndex === -1) {
			currentIndex = 0;
		}

		// Get next size (loop back to beginning if at end)
		const nextIndex = (currentIndex + 1) % possibleSizes.length;
		const newSize = possibleSizes[nextIndex];

		// Notify parent about the size change
		dispatch('resize', { id, size: newSize });
	}

	// Size classes are determined in the parent component
</script>

<div
	class="h-auto transition-all"
	class:bg-surface-100-900={editable}
	class:rounded-lg={editable}
	class:shadow-md={editable}
	class:border-2={editable}
	class:border-dashed={editable && isDragging}
	class:border-surface-300-600={editable && !isDragging}
	class:border-primary-500={editable && isDragging}
	class:opacity-60={isDragging}
	draggable={editable}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	data-id={id}
>
	<!-- Edit controls only appear in edit mode -->
	{#if editable}
		<div class="bg-surface-200-700 flex items-center justify-between rounded-t-lg px-3 py-2">
			<div class="flex items-center gap-2">
				<div class="text-surface-500-400 cursor-move">
					<Grip size={16} />
				</div>
				<h3 class="text-surface-500-400 text-sm font-medium">
					{title} <span class="text-xs opacity-60">({size.width}×{size.height})</span>
				</h3>
			</div>
			<div class="flex gap-2">
				<button
					class="text-surface-500-400 hover:text-primary-500 transition-colors"
					on:click={resizeWidget}
					title="Resize widget (cycles through available sizes)"
				>
					<Maximize2 size={16} />
				</button>
				<button
					class="text-surface-500-400 hover:text-primary-500 transition-colors"
					on:click={toggleEditing}
					title="Edit widget"
				>
					<Cog size={16} />
				</button>
				{#if removable}
					<button
						class="text-surface-500-400 transition-colors hover:text-red-500"
						on:click={removeCard}
						title="Remove widget"
					>
						<X size={16} />
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Content area - the actual card content -->
	<div class={editable ? '' : ''} style="height: {size.height * 200 + (size.height - 1) * 15}px  ;">
		<div class="bg-surface-100-900 flex h-full flex-col rounded-lg shadow-md">
			<!-- Fixed header -->
			<div class="flex-shrink-0 p-3">
				<h3 class="text-lg font-semibold">{title}</h3>
			</div>
			<!-- Scrollable content -->
			<div class=" overflow-y-auto px-4 pb-4">
				<slot />
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar styles for webkit browsers */
	.custom-scrollbar::-webkit-scrollbar {
		width: 8px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 4px;
		border: 2px solid transparent;
		background-clip: padding-box;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: rgba(156, 163, 175, 0.8);
	}

	/* Only show scrollbar when hovering over the content */
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
		transition: scrollbar-color 0.3s ease;
	}

	.custom-scrollbar:hover {
		scrollbar-color: rgba(156, 163, 175, 0.5) rgba(0, 0, 0, 0.05);
	}
</style>

