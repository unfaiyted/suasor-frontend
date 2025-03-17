<script lang="ts">
	import { User, Server, Database, Shield, Film, Radio, Settings } from '@lucide/svelte';

	export let tabs;
	export let activeTab;
	export let switchTab;
	export let user;
</script>

<div class="mb-6 overflow-x-auto">
	<div class="tabs tabs-bordered flex">
		{#each tabs as tab}
			{#if !tab.adminOnly || (tab.adminOnly && user.isAdmin)}
				<button
					class="tab {activeTab === tab.id
						? 'tab-active !text-primary-500'
						: ''} flex items-center gap-2"
					on:click={() => switchTab(tab.id)}
					aria-selected={activeTab === tab.id}
				>
					<svelte:component this={tab.icon} size={18} />
					<span>{tab.label}</span>
				</button>
			{/if}
		{/each}
	</div>
</div>
