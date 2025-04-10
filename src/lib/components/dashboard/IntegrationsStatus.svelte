<script lang="ts">
	import { onMount } from 'svelte';
	import IntegrationCard from './IntegrationCard.svelte';
	import { RefreshCw } from '@lucide/svelte';

	interface MediaServer {
		name: string;
		status: string;
		lastSync: string | null;
	}

	interface AiModel {
		name: string;
		status: string;
		usageCount: number;
	}

	interface AutomationTool {
		name: string;
		status: string;
		pendingTasks: number;
	}

	interface IntegrationsStatusProps {
		integrationStatus: {
			mediaServers: MediaServer[];
			aiModels: AiModel[];
			automationTools: AutomationTool[];
		};
	}

	const { integrationStatus }: IntegrationsStatusProps = $props();

	// State for active/expanded sections
	let expandedSections = $state({
		mediaServers: true,
		aiModels: true,
		automationTools: true
	});

	// Toggle section expansion
	function toggleSection(section: 'mediaServers' | 'aiModels' | 'automationTools') {
		expandedSections[section] = !expandedSections[section];
	}

	// Test all connections in a category
	function testAllInCategory(category: 'mediaServers' | 'aiModels' | 'automationTools') {
		console.log(`Testing all in ${category}`);
		// In a real implementation, we would trigger individual tests for each integration
	}
</script>

<div class="h-full flex flex-col overflow-hidden">
	<div class="flex justify-end flex-shrink-0">
		<button
			class="bg-tertiary-500/20 hover:bg-tertiary-600 focus:ring-tertiary-300 flex items-center gap-1 rounded-full px-2 py-2 text-xs text-white focus:ring-2 focus:outline-none"
			onclick={() => {
				testAllInCategory('mediaServers');
				testAllInCategory('aiModels');
				testAllInCategory('automationTools');
			}}
			title="Test All Connections"
		>
			<RefreshCw size={14} />
		</button>
	</div>

	<div class="flex-grow overflow-y-auto custom-scrollbar pr-2">
	<!-- Media Servers Section -->
	<div class="mb-4">
		<div
			class="mb-2 flex cursor-pointer items-center justify-between"
			onclick={() => toggleSection('mediaServers')}
		>
			<h4 class="text-tertiary-500 font-medium">Media Servers</h4>
			<div class="flex items-center gap-2">
				<span class="text-surface-700-300 text-xs">
					{integrationStatus.mediaServers.filter((s) => s.status === 'connected').length} of {integrationStatus
						.mediaServers.length} connected
				</span>
				<span
					class="transform transition-transform {expandedSections.mediaServers ? 'rotate-180' : ''}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</span>
			</div>
		</div>

		{#if expandedSections.mediaServers}
			<div class="transition-all">
				{#each integrationStatus.mediaServers as server}
					<IntegrationCard
						name={server.name}
						status={server.status}
						type="mediaServer"
						extraInfo={server.lastSync}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<!-- AI Models Section -->
	<div class="mb-4">
		<div
			class="mb-2 flex cursor-pointer items-center justify-between"
			onclick={() => toggleSection('aiModels')}
		>
			<h4 class="text-tertiary-500 font-medium">AI Models</h4>
			<div class="flex items-center gap-2">
				<span class="text-surface-700-300 text-xs">
					{integrationStatus.aiModels.filter((s) => s.status === 'active').length} of {integrationStatus
						.aiModels.length} active
				</span>
				<span
					class="transform transition-transform {expandedSections.aiModels ? 'rotate-180' : ''}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</span>
			</div>
		</div>

		{#if expandedSections.aiModels}
			<div class="transition-all">
				{#each integrationStatus.aiModels as model}
					<IntegrationCard
						name={model.name}
						status={model.status}
						type="aiModel"
						extraInfo={model.usageCount}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Automation Tools Section -->
	<div>
		<div
			class="mb-2 flex cursor-pointer items-center justify-between"
			onclick={() => toggleSection('automationTools')}
		>
			<h4 class="text-tertiary-500 font-medium">Automation Tools</h4>
			<div class="flex items-center gap-2">
				<span class="text-surface-700-300 text-xs">
					{integrationStatus.automationTools.filter((s) => s.status === 'connected').length} of {integrationStatus
						.automationTools.length} connected
				</span>
				<span
					class="transform transition-transform {expandedSections.automationTools
						? 'rotate-180'
						: ''}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</span>
			</div>
		</div>

		{#if expandedSections.automationTools}
			<div class="transition-all">
				{#each integrationStatus.automationTools as tool}
					<IntegrationCard
						name={tool.name}
						status={tool.status}
						type="automationTool"
						extraInfo={tool.pendingTasks}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<div class="mt-4 text-center">
		<a href="/settings/integrations" class="text-tertiary-500 text-xs hover:underline">
			Manage all integrations
		</a>
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
