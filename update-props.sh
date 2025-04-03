#!/bin/bash

# Update IntegrationSection.svelte
cat << 'EOF' > src/lib/components/settings/IntegrationSection.svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import IntegrationCard from './IntegrationCard.svelte';
	import { TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
	import IconPlus from '../icons/IconPlus.svelte';

	type IntegrationSectionProps = {
		title: string;
		urlPlaceholder: string;
		keyType?: 'apiKey' | 'username' | 'password' | 'token' | 'none';
		keyLabel?: string;
		clientType: TypesClientType | TypesMediaClientType;
		mainIntegration: any;
	};

	const { 
		title,
		urlPlaceholder,
		keyType = 'apiKey',
		keyLabel = 'API Key',
		clientType,
		mainIntegration
	} = $props<IntegrationSectionProps>();
	
	// Array to hold additional integrations of the same type
	let additionalIntegrations = $state<any[]>([]);
	
	const dispatch = createEventDispatcher();
	
	// Add a new integration with the same type
	function addNewIntegration() {
		additionalIntegrations = [
			...additionalIntegrations,
			{
				enabled: true,
				url: '',
				[keyType]: '',
				id: null,
				name: `${title} ${additionalIntegrations.length + 2}` // Name with a number suffix
			}
		];
	}
	
	// Remove an integration
	function removeIntegration(index: number) {
		additionalIntegrations.splice(index, 1);
		additionalIntegrations = [...additionalIntegrations]; // Trigger reactivity
	}
	
	// Forward events from child components
	function handleSaved(event: any) {
		dispatch('saved', event.detail);
	}
	
	function handleError(event: any) {
		dispatch('error', event.detail);
	}
</script>

<div class="mb-6">
	<div class="flex justify-between items-center mb-2">
		<h3 class="text-xl font-bold">{title}</h3>
		<button
			class="btn btn-sm btn-ghost-surface"
			title="Add another {title} integration"
			aria-label="Add another {title} integration"
			onclick={addNewIntegration}
		>
			<IconPlus class="h-5 w-5" />
		</button>
	</div>
	
	<!-- Grid layout for integrations - responsive -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Main integration -->
		<IntegrationCard
			title={title}
			integration={mainIntegration}
			{urlPlaceholder}
			{keyType}
			{keyLabel}
			{clientType}
			onSaved={handleSaved}
			onError={handleError}
		/>
		
		<!-- Additional integrations -->
		{#each additionalIntegrations as integration, i}
			<div class="relative">
				<IntegrationCard
					title={`${title} ${i + 2}`}
					integration={integration}
					{urlPlaceholder}
					{keyType}
					{keyLabel}
					{clientType}
					onSaved={handleSaved}
					onError={handleError}
				/>
				
				<!-- Remove button -->
				<button
					class="absolute top-2 right-2 btn btn-sm btn-error btn-icon"
					title="Remove integration"
					aria-label="Remove integration"
					onclick={() => removeIntegration(i)}
				>
					×
				</button>
			</div>
		{/each}
	</div>
</div>
EOF

# Update AIIntegrationsPanel.svelte props
sed -i '10,13s/export let.*\;//' src/lib/components/settings/AIIntegrationsPanel.svelte
sed -i '10i\type AIIntegrationsPanelProps = {\n\taiIntegrations: any;\n\tsaveSettings?: any;\n\tisLoading?: boolean;\n};\n\nconst { aiIntegrations, saveSettings, isLoading } = $props<AIIntegrationsPanelProps>();' src/lib/components/settings/AIIntegrationsPanel.svelte

# Update AutomationPanel.svelte props
sed -i '10,13s/export let.*\;//' src/lib/components/settings/AutomationPanel.svelte
sed -i '10i\type AutomationPanelProps = {\n\tautomationIntegrations: any;\n\tsaveSettings?: any;\n\tisLoading?: boolean;\n};\n\nconst { automationIntegrations, saveSettings, isLoading } = $props<AutomationPanelProps>();' src/lib/components/settings/AutomationPanel.svelte

# Update MediaServersPanel.svelte props
sed -i '10,13s/export let.*\;//' src/lib/components/settings/MediaServersPanel.svelte
sed -i '10i\type MediaServersPanelProps = {\n\tmediaServerIntegrations: any;\n\tsaveSettings?: any;\n\tisLoading?: boolean;\n};\n\nconst { mediaServerIntegrations, saveSettings, isLoading } = $props<MediaServersPanelProps>();' src/lib/components/settings/MediaServersPanel.svelte

# Show the changes
echo "Updated IntegrationSection.svelte:"
head -20 src/lib/components/settings/IntegrationSection.svelte

echo "Updated AIIntegrationsPanel.svelte:"
head -20 src/lib/components/settings/AIIntegrationsPanel.svelte

echo "Updated AutomationPanel.svelte:"
head -20 src/lib/components/settings/AutomationPanel.svelte

echo "Updated MediaServersPanel.svelte:"
head -20 src/lib/components/settings/MediaServersPanel.svelte