<!-- components/ActionMenu.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Snippet, SvelteComponent } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import { Heart, Film, Download, Share2, X } from '@lucide/svelte';

	interface ActionMenuItem {
		id: string;
		label: string;
		icon?: typeof SvelteComponent;
	}

	interface ActionMenuProps {
		show?: boolean;
		// trigger: Snippet;
		actions?: ActionMenuItem[];
		onSelect?: (actionId: string) => void;
		onClose?: () => void;
	}

	let {
		show = $bindable(false),
		onSelect,
		onClose,
		actions = []
		// trigger
	}: ActionMenuProps = $props();

	// Default actions if none provided
	actions = [
		{ id: 'watchlist', label: 'Add to Watchlist', icon: Heart },
		{ id: 'recommend', label: 'Recommend similar', icon: Film },
		{ id: 'download', label: 'Request Downloads', icon: Download },
		// { id: 'share', label: 'Share Selection', icon: Share2 },
		{ id: 'clear', label: 'Clear Selection', icon: X }
	];

	function handleAction(actionId: string) {
		onSelect?.(actionId);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const isClickInside = target.closest('.lucide-icon') || target.closest('.action-menu-btn');
		if (show && target && !isClickInside) {
			console.log('Click outside action menu-ActionMenu');
			onClose?.();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});

	$effect(() => {
		console.log('Effect triggered for action menu');
		console.log(show);
	});
</script>

<div class="action-menu-container bg-surface-200-800 relative">
	<!-- <slot name="trigger"></slot> -->

	<!-- {@render trigger()} -->

	{#if show}
		<div
			class="bg-surface-200-800 absolute top-[-90px] right-[55px] z-20 mt-1 w-48 rounded shadow-lg"
			transition:fade={{ duration: 150 }}
		>
			<ul class="py-1">
				{#each actions as action (action.id)}
					<li>
						<button
							class="hover:bg-primary-500/20 flex w-full items-center gap-2 px-4 py-2 text-left"
							onclick={() => handleAction(action.id)}
						>
							{#if action.icon}
								<action.icon size={16} />
							{/if}
							{action.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
