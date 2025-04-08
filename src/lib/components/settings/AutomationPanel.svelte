<script lang="ts">
	import IntegrationsPanel from './IntegrationsPanel.svelte';
	import { TypesClientType } from '$lib/api/suasor.v1.d';
	import type { ClientResponse } from '$lib/api/types';

	type AutomationPanelProps = {
		onSave?: (config: Record<string, ClientResponse[]>) => void;
		clientsByType?: Record<string, ClientResponse[]>;
		isLoading?: boolean;
	};

	const {
		onSave,
		isLoading = false,
		// clientsByType used in the template
		clientsByType = {}
	}: AutomationPanelProps = $props();

	// Define the automation integrations
	const automationIntegrations = [
		{
			title: 'Sonarr',
			clientType: TypesClientType.ClientTypeSonarr,
			urlPlaceholder: 'https://sonarr.example.com',
			keyType: 'apiKey' as const,
			keyLabel: 'API Key'
		},
		{
			title: 'Radarr',
			clientType: TypesClientType.ClientTypeRadarr,
			urlPlaceholder: 'https://radarr.example.com',
			keyType: 'apiKey' as const,
			keyLabel: 'API Key'
		},
		{
			title: 'Lidarr',
			clientType: TypesClientType.ClientTypeLidarr,
			urlPlaceholder: 'https://lidarr.example.com',
			keyType: 'apiKey' as const,
			keyLabel: 'API Key'
		}
	];

	// Handle settings changes
	function handleSettingsChange(updatedClientsByType: Record<string, ClientResponse[]>) {
		if (onSave) {
			onSave(updatedClientsByType);
		}
	}
</script>

<IntegrationsPanel
	title="Automation Tools"
	subtitle="Connect to your automation services"
	integrations={automationIntegrations}
	{isLoading}
	onSettingsChange={handleSettingsChange}
/>
