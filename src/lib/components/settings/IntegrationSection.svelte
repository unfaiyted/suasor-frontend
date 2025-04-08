<script lang="ts">
	import IntegrationCard from './IntegrationCard.svelte';
	import { TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
	import type { ClientResponse, UserConfig } from '$lib/api/types';
	import IconPlus from '../icons/IconPlus.svelte';
	import { configApi } from '$lib/stores/config';
	import { onMount } from 'svelte';

	type IntegrationSectionProps = {
		title: string;
		urlPlaceholder: string;
		clientType: TypesClientType | TypesMediaClientType;
		integrations: ClientResponse[];
		onSave?: (event: { client: Record<string, any> }) => void;
		onError?: (event: { message: string }) => void;
	};

	const {
		title,
		urlPlaceholder,
		clientType = TypesClientType.ClientTypeUnknown,
		integrations,
		onSave,
		onError
	}: IntegrationSectionProps = $props();

	// Array to hold additional integrations of the same type
	let additionalIntegrations = $state<ClientResponse[]>(integrations.slice(1));
	let mainIntegration = $state<ClientResponse>(integrations[0]);
	
	// Track default clients
	let userConfig = $state<UserConfig | null>(null);
	let defaultClientIds = $state<Record<string, number>>({});

	// Map client types to icon paths
	const clientTypeIcons: Record<string, string> = {
		[TypesClientType.ClientTypeJellyfin]: '/jellyfin.svg',
		[TypesClientType.ClientTypeSonarr]: '/sonarr.svg',
		[TypesClientType.ClientTypeLidarr]: '/lidarr.svg',
		[TypesClientType.ClientTypeRadarr]: '/radarr.svg',
		[TypesClientType.ClientTypePlex]: '/plex-alt.svg',
		[TypesClientType.ClientTypeEmby]: '/emby.svg',
		[TypesClientType.ClientTypeSubsonic]: '/navidrome.svg',
		[TypesClientType.ClientTypeClaude]: '/claude-ai.svg',
		[TypesClientType.ClientTypeOpenAI]: '/openai.svg',
		[TypesClientType.ClientTypeOllama]: '/ollama.svg',
		[TypesClientType.ClientTypeSpotify]: '/spotify.svg',
		[TypesClientType.ClientTypeTrakt]: '/trakt.svg'
	};

	// Create a safe default integration to use if mainIntegration is undefined
	let defaultIntegration = $state<ClientResponse>({
		isEnabled: true,
		name: 'Default',
		clientType: clientType as TypesClientType,
		client: {
			baseURL: urlPlaceholder || ''
		}
	});

	// Check if a client is the default
	function isDefaultClient(client: ClientResponse): boolean {
		if (!client?.id || !userConfig) return false;

		// Check various default client ID fields in the user config
		const clientTypeStr = client.clientType?.toString().toLowerCase();

		// Check by media type
		if (clientTypeStr.includes('emby') || clientTypeStr.includes('jellyfin') || clientTypeStr.includes('plex')) {
			if (userConfig.defaultVideoClientID === client.id) return true;
		} else if (clientTypeStr.includes('subsonic')) {
			if (userConfig.defaultMusicClientID === client.id) return true;
		} else if (clientTypeStr.includes('sonarr')) {
			if (userConfig.defaultTVShowClientID === client.id) return true; 
		} else if (clientTypeStr.includes('radarr')) {
			if (userConfig.defaultMovieClientID === client.id) return true;
		} else if (clientTypeStr.includes('lidarr')) {
			if (userConfig.defaultMusicClientID === client.id) return true;
		} else if (clientTypeStr.includes('claude') || clientTypeStr.includes('openai') || clientTypeStr.includes('ollama')) {
			if (userConfig.defaultAIClientID === client.id) return true;
		}

		// Check by specific client type
		const clientTypeKey = `default${client.clientType}ClientID` as keyof UserConfig;
		return userConfig[clientTypeKey] === client.id;
	}

	// Handle when a client is set as default
	async function handleSetDefault(client: ClientResponse) {
		// Immediately update local state to show change
		if (client.id && userConfig) {
			// Create a temporary updated config to reflect the change in UI
			const tempConfig = { ...userConfig };
			
			// Different handling for media clients vs others
			const clientTypeStr = client.clientType?.toString().toLowerCase();
			
			// Update tempConfig based on client type
			if (clientTypeStr?.includes('emby') || clientTypeStr?.includes('jellyfin') || clientTypeStr?.includes('plex')) {
				tempConfig.defaultVideoClientID = client.id;
			} else if (clientTypeStr?.includes('subsonic')) {
				tempConfig.defaultMusicClientID = client.id;
			} else if (clientTypeStr?.includes('sonarr')) {
				tempConfig.defaultTVShowClientID = client.id;
			} else if (clientTypeStr?.includes('radarr')) {
				tempConfig.defaultMovieClientID = client.id;
			} else if (clientTypeStr?.includes('lidarr')) {
				tempConfig.defaultMusicClientID = client.id;
			} else if (clientTypeStr?.includes('claude') || clientTypeStr?.includes('openai') || clientTypeStr?.includes('ollama')) {
				tempConfig.defaultAIClientID = client.id;
			}
			
			// Set specific client type as default
			const clientTypeKey = `default${client.clientType}ClientID` as keyof UserConfig;
			tempConfig[clientTypeKey] = client.id;
			
			// Update the state immediately
			userConfig = tempConfig;
		}
		
		// Notify the parent component
		onSave?.({ client: { ...client, isDefault: true } });
		
		// Wait a bit then refresh from server to ensure we have the correct state
		setTimeout(() => {
			loadUserConfig();
		}, 500);
	}

	// Load user configuration to check default clients
	async function loadUserConfig() {
		try {
			const config = await configApi.loadUserConfig();
			if (config) {
				userConfig = config;
			}
		} catch (err) {
			onError?.({ message: `Failed to load user config: ${(err as Error).message}` });
		}
	}

	// Add a new integration with the same type
	function addNewIntegration() {
		// Create a new empty integration
		const newIntegration: ClientResponse = {
			id: 0, // Will be assigned by the server when saved
			isEnabled: true,
			name: `${title} ${additionalIntegrations.length + 2}`,
			clientType: clientType as TypesClientType,
			client: {
				baseURL: urlPlaceholder || ''
			}
		};

		// Add to the list
		additionalIntegrations = [...additionalIntegrations, newIntegration];
	}

	// Remove the main integration
	async function removeMainIntegration() {
		if (!mainIntegration) return;

		if (mainIntegration.id) {
			// Import the clients API
			const { clientsApi } = await import('$lib/stores/api');

			const removeClientType =
				mainIntegration?.clientType?.toString().toLowerCase() ||
				TypesClientType.ClientTypeUnknown;

			try {
				// Call the API to delete the integration
				const success = await clientsApi.deleteClient(
					mainIntegration.id.toString(),
					removeClientType
				);

				if (success) {
					// If we have additional integrations, promote the first one to main
					if (additionalIntegrations.length > 0) {
						mainIntegration = additionalIntegrations[0];
						additionalIntegrations.splice(0, 1);
						additionalIntegrations = [...additionalIntegrations]; // Trigger reactivity
					} else {
						// No more integrations of this type
						mainIntegration = null;
					}
					onSave?.({ client: { name: mainIntegration?.name || title, message: 'deleted' } });
				} else {
					onError?.({ message: `Failed to delete ${mainIntegration.name || title} integration` });
				}
			} catch (err) {
				onError?.({ message: `Error deleting integration: ${(err as Error).message}` });
			}
		} else {
			// Just remove from local state if it doesn't have an ID (not saved to database yet)
			if (additionalIntegrations.length > 0) {
				mainIntegration = additionalIntegrations[0];
				additionalIntegrations.splice(0, 1);
				additionalIntegrations = [...additionalIntegrations]; // Trigger reactivity
			} else {
				// No more integrations of this type
				mainIntegration = null;
			}
		}
	}

	// Remove an additional integration
	async function removeIntegration(index: number) {
		const integrationToRemove = additionalIntegrations[index];

		if (integrationToRemove && integrationToRemove.id) {
			// Import the clients API
			const { clientsApi } = await import('$lib/stores/api');

			const removeClientType =
				integrationToRemove?.clientType?.toString().toLowerCase() ||
				TypesClientType.ClientTypeUnknown;

			try {
				// Call the API to delete the integration
				const success = await clientsApi.deleteClient(
					integrationToRemove.id.toString(),
					removeClientType
				);

				if (success) {
					// Remove from local state if deletion was successful
					additionalIntegrations.splice(index, 1);
					additionalIntegrations = [...additionalIntegrations]; // Trigger reactivity
					onSave?.({ client: { name: integrationToRemove.name, message: 'deleted' } });
				} else {
					onError?.({ message: `Failed to delete ${integrationToRemove.name} integration` });
				}
			} catch (err) {
				onError?.({ message: `Error deleting integration: ${(err as Error).message}` });
			}
		} else {
			// Just remove from local state if it doesn't have an ID (not saved to database yet)
			additionalIntegrations.splice(index, 1);
			additionalIntegrations = [...additionalIntegrations]; // Trigger reactivity
		}
	}

	// Forward events from child components
	function handleSaved(event: { client: Record<string, any> }) {
		// If this client was set as default, update our state
		if (event.client.isDefault) {
			loadUserConfig();
		}
		
		onSave?.(event);
	}

	function handleError(event: { message: string }) {
		onError?.(event);
	}

	// Load user config on component mount
	onMount(() => {
		loadUserConfig();
	});
</script>

<div class="mb-6">
	<div class="mb-2 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<!-- Display integration icon if available -->
			{#if clientTypeIcons[clientType]}
				<img src={clientTypeIcons[clientType]} alt="{title} icon" class="h-6 w-6" />
			{/if}
			<h3 class="text-xl font-bold">{title}</h3>
		</div>
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
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- All integrations (combine main and additional) -->
		{#each [mainIntegration, ...additionalIntegrations].filter(Boolean) as integration, i}
			<div class="relative">
				<IntegrationCard
					title={i === 0 ? title : `${title} ${i + 1}`}
					integration={integration}
					{urlPlaceholder}
					{clientType}
					isDefault={isDefaultClient(integration)}
					onSetDefault={(client) => handleSetDefault(client)}
					onSaved={(client) => handleSaved(client)}
					onError={(client) => handleError(client)}
						onDeleted={(event) => {
							if (i === 0) {
								removeMainIntegration();
							} else {
								removeIntegration(i - 1);
							}
						}}
				/>

				<!-- Remove button (for all integrations) -->
				<button
					class="btn btn-sm btn-error btn-icon absolute top-2 right-2 hidden"
					title="Remove integration"
					aria-label="Remove integration"
					onclick={() => i === 0 ? removeMainIntegration() : removeIntegration(i - 1)}
				>
					×
				</button>
			</div>
		{/each}
	</div>
</div>