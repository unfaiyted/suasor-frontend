<script lang="ts">
	import {
		User,
		Server,
		Database,
		Shield,
		Film,
		Radio,
		Settings,
		ChevronDown
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import IntegrationsTabPanel from './IntegrationsTabPanel.svelte';
	import type { UserResponse } from '$lib/api/types';

	interface SettingsTabProps {
		tabs: [];
		activeTab: string;
		switchTab: (tabId: string) => void;
		user: UserResponse;
	}
	let { tabs, activeTab, switchTab, user }: SettingsTabProps = $props();

	// State for dropdown
	let isDropdownOpen = $state(false);
	let isMobileView = $state(false);

	// Active tab object for mobile dropdown display
	let activeTabObject = $state(tabs[0]);

	// Toggle dropdown menu
	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	// Close dropdown when clicking outside
	function closeDropdown() {
		isDropdownOpen = false;
	}

	import { goto } from '$app/navigation';
	
	// Handle tab selection
	function handleTabSelect(tab) {
		switchTab(tab.id);
		activeTabObject = tab;
		isDropdownOpen = false;
		
		// Update URL to match the selected tab without causing a page reload
		if (tab.id === 'user') {
			history.pushState({}, '', '/settings');
		} else {
			history.pushState({}, '', `/settings/${tab.id}`);
		}
	}

	// Update active tab object when activeTab changes
	$effect(() => {
		activeTabObject = tabs.find((tab) => tab.id === activeTab) || tabs[0];
	});

	// Check viewport size on mount and window resize
	onMount(() => {
		const checkViewportSize = () => {
			isMobileView = window.innerWidth < 768; // 768px is standard md breakpoint
		};

		// Handle clicks outside the dropdown
		const handleClickOutside = (event) => {
			const dropdown = document.querySelector('.settings-dropdown');
			if (isDropdownOpen && dropdown && !dropdown.contains(event.target)) {
				isDropdownOpen = false;
			}
		};

		// Initial check
		checkViewportSize();

		// Add event listeners
		window.addEventListener('resize', checkViewportSize);
		document.addEventListener('click', handleClickOutside);

		// Cleanup
		return () => {
			window.removeEventListener('resize', checkViewportSize);
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<!-- Mobile dropdown view -->
<div class="settings-dropdown relative mb-6 md:hidden">
	<button
		class="bg-surface-200-800 flex w-full items-center justify-between rounded-md border border-slate-500 px-4 py-3 text-left shadow-sm"
		on:click={toggleDropdown}
		aria-haspopup="true"
		aria-expanded={isDropdownOpen}
	>
		<div class="flex items-center gap-2">
			{#if activeTabObject?.icon}
				<svelte:component this={activeTabObject.icon} size={18} class="text-primary-500" />
			{/if}
			<span class="font-medium">{activeTabObject?.label || 'Select Setting'}</span>
		</div>
		<ChevronDown
			size={18}
			class="transition-transform duration-200"
			style={isDropdownOpen ? 'transform: rotate(180deg)' : ''}
		/>
	</button>

	<!-- Dropdown menu -->
	{#if isDropdownOpen}
		<div
			class="bg-surface-200-800 absolute right-0 left-0 z-10 mt-1 overflow-hidden rounded-md border border-slate-600 shadow-lg"
			on:click={closeDropdown}
		>
			{#each tabs as tab}
				{#if !tab.adminOnly || (tab.adminOnly && user.isAdmin)}
					<button
						class="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors {activeTab ===
						tab.id
							? 'bg-primary-500 bg-opacity-10 text-primary-500'
							: 'hover:bg-surface-300-700'}"
						on:click={() => handleTabSelect(tab)}
						aria-selected={activeTab === tab.id}
					>
						<svelte:component this={tab.icon} size={18} />
						<span>{tab.label}</span>
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<!-- Desktop horizontal tabs view -->
<div class="scrollbar-hide mb-6 hidden scroll-m-0 overflow-x-auto md:block">
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
					on:click={() => handleTabSelect(tab)}
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
