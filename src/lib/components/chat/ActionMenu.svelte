<!-- components/ActionMenu.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	export let show = false;

	// Define action items with icons if needed
	export let actions = [
		{ id: 'watchlist', label: 'Add to Watchlist' },
		{ id: 'download', label: 'Request Downloads' },
		{ id: 'share', label: 'Share Selection' }
	];

	const dispatch = createEventDispatcher();

	function handleAction(actionId: string) {
		dispatch('select', actionId);
	}

	function handleClickOutside(event: MouseEvent) {
		if (show && !event.target.closest('.action-menu-container')) {
			dispatch('close');
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="action-menu-container relative">
	<slot name="trigger"></slot>

	{#if show}
		<div
			class="bg-surface-100-800 absolute right-0 bottom-full z-20 mb-1 w-48 rounded shadow-lg"
			transition:fade={{ duration: 150 }}
		>
			<ul class="py-1">
				{#each actions as action}
					<li>
						<button
							class="hover:bg-primary-500/20 flex w-full items-center gap-2 px-4 py-2 text-left"
							on:click={() => handleAction(action.id)}
						>
							{#if action.icon}
								<svelte:component this={action.icon} size={16} />
							{/if}
							{action.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
