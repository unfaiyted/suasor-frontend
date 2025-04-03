<script lang="ts">
	import IntegrationsPanel from './IntegrationsPanel.svelte';
	import { TypesClientType } from '$lib/api/suasor.v1.d';
	import type { ClientResponse } from '$lib/api/types';

	type AIIntegrationsPanelProps = {
		saveSettings?: (config: Record<string, ClientResponse[]>) => void;
		clientsByType?: Record<string, ClientResponse[]>;
		isLoading?: boolean;
	};

	const {
		saveSettings,
		isLoading = false,
		// clientsByType used in the template
		clientsByType = {}
	}: AIIntegrationsPanelProps = $props();

	// Define the AI integrations
	const aiIntegrationsList = [
		{
			title: 'Claude',
			clientType: TypesClientType.ClientTypeClaude,
			urlPlaceholder: 'https://api.anthropic.com',
			keyType: 'apiKey' as const,
			keyLabel: 'API Key'
		},
		{
			title: 'OpenAI',
			clientType: TypesClientType.ClientTypeOpenAI,
			urlPlaceholder: 'https://api.openai.com',
			keyType: 'apiKey' as const,
			keyLabel: 'API Key'
		},
		{
			title: 'Ollama',
			clientType: TypesClientType.ClientTypeOllama,
			urlPlaceholder: 'http://localhost:11434',
			keyType: 'none' as const
		}
	];

	// Handle settings changes
	function handleSettingsChange(updatedClientsByType: Record<string, ClientResponse[]>) {
		if (saveSettings) {
			saveSettings(updatedClientsByType);
		}
	}
</script>

<IntegrationsPanel
	title="AI Integrations"
	subtitle="Connect to AI models and services"
	integrations={aiIntegrationsList}
	{isLoading}
	onSettingsChange={handleSettingsChange}
/>
