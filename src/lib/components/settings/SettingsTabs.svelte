<script lang="ts">
	import { User, Server, Database, Shield, Film, Radio, Settings } from '@lucide/svelte';

	export let tabs;
	export let activeTab;
	export let switchTab;
	export let user;
</script>

<div class="mb-6 scroll-m-0 overflow-x-auto">
	<div class="flex border-b border-slate-500">
		{#each tabs as tab}
			{#if !tab.adminOnly || (tab.adminOnly && user.isAdmin)}
				<button
					class="
						mx-2 mb-2 flex items-center gap-2 rounded-md border-b-2 border-transparent px-4 py-2 transition-all duration-200 first:ml-0
						{activeTab === tab.id
						? 'text-primary-500 !border-primary-500 -mb-px border-b-2  font-medium'
						: ' text-gray-400 hover:bg-slate-800 hover:text-gray-200'}
					"
					on:click={() => switchTab(tab.id)}
					aria-selected={activeTab === tab.id}
				>
					<svelte:component this={tab.icon} size={18} />
					<span class="whitespace-nowrap">{tab.label}</span>
				</button>
			{/if}
		{/each}
	</div>
</div>

<style>
	/* Hide scrollbar but keep functionality */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
