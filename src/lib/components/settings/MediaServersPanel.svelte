<script lang="ts">
	import IntegrationsPanel from './IntegrationsPanel.svelte';
	import { TypesMediaClientType } from '$lib/api/suasor.v1.d';
	import type { ClientResponse } from '$lib/api/types';

	type MediaServersPanelProps = {
		saveSettings?: (config: Record<string, ClientResponse[]>) => void;
		clientsByType?: Record<string, ClientResponse[]>;
		isLoading?: boolean;
	};

	const { saveSettings, isLoading = false, clientsByType = {} }: MediaServersPanelProps = $props();

	// Define the media server integrations
	const mediaIntegrations = [
		{
			title: 'Emby',
			clientType: TypesMediaClientType.MediaClientTypeEmby,
			urlPlaceholder: 'https://emby.example.com',
			keyType: 'apiKey' as const,
			keyLabel: 'API Key'
		},
		{
			title: 'Jellyfin',
			clientType: TypesMediaClientType.MediaClientTypeJellyfin,
			urlPlaceholder: 'https://jellyfin.example.com',
			keyType: 'apiKey' as const,
			keyLabel: 'API Key'
		},
		{
			title: 'Subsonic',
			clientType: TypesMediaClientType.MediaClientTypeSubsonic,
			urlPlaceholder: 'https://subsonic.example.com',
			keyType: 'password' as const,
			keyLabel: 'Password'
		},
		{
			title: 'Plex',
			clientType: TypesMediaClientType.MediaClientTypePlex,
			urlPlaceholder: 'https://plex.example.com',
			keyType: 'token' as const,
			keyLabel: 'Auth Token'
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
	title="Media Server Integrations"
	subtitle="Connect to your media servers"
	integrations={mediaIntegrations}
	{isLoading}
	onSettingsChange={handleSettingsChange}
/>
