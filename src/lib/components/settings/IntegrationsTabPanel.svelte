<script lang="ts">
	import { Brain, Film, Radio } from '@lucide/svelte';
	import CardHeader from '../util/CardHeader.svelte';
	import AIIntegrationsPanel from './AIIntegrationsPanel.svelte';
	import MediaServersPanel from './MediaServersPanel.svelte';
	import AutomationPanel from './AutomationPanel.svelte';
	import type { ClientRequest, ClientResponse } from '$lib/api/types';

	type IntegrationsTabPanelProps = {
		clientsByType?: Record<string, ClientRequest[]>;
		isLoading?: boolean;
		onSave?: (section: string, data: any) => void;
	};

	const { clientsByType = {}, isLoading = false, onSave }: IntegrationsTabPanelProps = $props();

	// Import URL and browser utilities
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	
	// Tab configuration
	const tabs = [
		{ id: 'media-servers', label: 'Media Servers', icon: Film, path: 'media' },
		{ id: 'automation', label: 'Automation', icon: Radio, path: 'automation' },
		{ id: 'ai', label: 'AI', icon: Brain, path: 'ai' }
	];
	
	// For UI organization - default to media-servers
	let activeTab = $state('media-servers');
	
	// Get subtab from URL if present (integrations/media, integrations/automation, integrations/ai)
	$effect(() => {
		const path = $page.url.pathname;
		const subtabParam = $page.url.searchParams.get('subtab');
		
		// Try to get subtab from search params first
		if (subtabParam) {
			const matchingTab = tabs.find(tab => tab.path === subtabParam);
			if (matchingTab) {
				activeTab = matchingTab.id;
				return;
			}
		}
		
		// Then try to get from URL path
		if (path.startsWith('/settings/integrations/')) {
			const pathParts = path.split('/');
			if (pathParts.length > 3) {
				const subtabPath = pathParts[3];
				const matchingTab = tabs.find(tab => tab.path === subtabPath);
				if (matchingTab) {
					activeTab = matchingTab.id;
					return;
				}
			}
		}
		
		// Finally, check session storage (set by the main settings page)
		if (browser) {
			const storedSubtab = sessionStorage.getItem('integrationsSubtab');
			if (storedSubtab) {
				const matchingTab = tabs.find(tab => tab.path === storedSubtab);
				if (matchingTab) {
					activeTab = matchingTab.id;
					// Clear it after using
					sessionStorage.removeItem('integrationsSubtab');
				}
			}
		}
	});

	// Set active tab and update URL
	function setActiveTab(tabId: string) {
		activeTab = tabId;
		
		// Update URL to include the subtab without page reload
		const selectedTab = tabs.find(tab => tab.id === tabId);
		if (selectedTab && browser) {
			// Update browser history to reflect the current subtab
			history.pushState({}, '', `/settings/integrations/${selectedTab.path}`);
		}
	}

	// Handle settings saves for each panel
	function handleSettingsSave(section: string, data: any) {
		if (onSave) {
			onSave(section, data);
		}
	}
</script>

<div class="w-full">
	<CardHeader 
		title="Integrations" 
		subtitle="Connect to various services and tools"
	/>

	<div class="mt-4">
		<!-- Integration Tabs -->
		<div class="bg-surface-200-800/50 mb-6 flex space-x-1 rounded-lg p-1">
			{#each tabs as tab}
				<button
					type="button"
					class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
					class:bg-surface-100-900={activeTab === tab.id}
					on:click={() => setActiveTab(tab.id)}
				>
					<svelte:component this={tab.icon} size={16} />
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Tab Content -->
		<div class="py-2">
			{#if activeTab === 'media-servers'}
				<div class="transition-all">
					<MediaServersPanel 
						{clientsByType} 
						{isLoading} 
						onSave={(data) => handleSettingsSave('media-servers', data)} 
					/>
				</div>
			{:else if activeTab === 'automation'}
				<div class="transition-all">
					<AutomationPanel 
						{clientsByType} 
						{isLoading} 
						onSave={(data) => handleSettingsSave('automation', data)} 
					/>
				</div>
			{:else if activeTab === 'ai'}
				<div class="transition-all">
					<AIIntegrationsPanel 
						{clientsByType} 
						{isLoading} 
						onSave={(data) => handleSettingsSave('ai-integrations', data)} 
					/>
				</div>
			{/if}
		</div>
	</div>
</div>