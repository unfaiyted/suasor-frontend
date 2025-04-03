<script lang="ts">
	import { onMount } from 'svelte';
	import CardHeader from '../util/CardHeader.svelte';
	import IntegrationCard from '../settings/IntegrationCard.svelte';
	import NotificationArea from '../util/NotificationArea.svelte';
	import type { ClientRequest } from '$lib/api/types';
	import { clientsApi } from '$lib/stores/api';
	import { TypesMediaClientType } from '$lib/api/suasor.v1.d';

	export let mediaServerIntegrations;
	export let saveSettings;
	export let isLoading;

	let localError = '';
	let success = '';

	// Load existing clients from store when component mounts
	onMount(async () => {
		try {
			// Load clients and update media server integrations with actual client data
			const clients = await clientsApi.loadClients();

			// Map clients to the appropriate integrations
			clients.forEach((client: ClientRequest) => {
				if (
					client.type === TypesMediaClientType.MediaClientTypeEmby &&
					mediaServerIntegrations.emby
				) {
					mediaServerIntegrations.emby.enabled = true;
					mediaServerIntegrations.emby.url = client.url;
					mediaServerIntegrations.emby.apiKey = client.apiKey;
					mediaServerIntegrations.emby.id = client.id;
				} else if (
					client.type === TypesMediaClientType.MediaClientTypeJellyfin &&
					mediaServerIntegrations.jellyfin
				) {
					mediaServerIntegrations.jellyfin.enabled = true;
					mediaServerIntegrations.jellyfin.url = client.url;
					mediaServerIntegrations.jellyfin.apiKey = client.apiKey;
					mediaServerIntegrations.jellyfin.id = client.id;
				} else if (
					client.type === TypesMediaClientType.MediaClientTypeSubsonic &&
					mediaServerIntegrations.subsonic
				) {
					mediaServerIntegrations.subsonic.enabled = true;
					mediaServerIntegrations.subsonic.url = client.url;
					mediaServerIntegrations.subsonic.username = client.username;
					mediaServerIntegrations.subsonic.id = client.id;
				} else if (
					client.type === TypesMediaClientType.MediaClientTypePlex &&
					mediaServerIntegrations.plex
				) {
					mediaServerIntegrations.plex.enabled = true;
					mediaServerIntegrations.plex.url = client.url;
					mediaServerIntegrations.plex.token = client.token;
					mediaServerIntegrations.plex.id = client.id;
				}
			});
		} catch (err) {
			localError = (err as Error).message || 'Failed to load clients';
		}
	});

	// Handle events from integration card
	function handleClientSaved(event: any) {
		const { client } = event.detail;
		success = `${client.name} integration saved successfully`;
		setTimeout(() => (success = ''), 3000);
	}

	function handleClientError(event: any) {
		const { message } = event.detail;
		localError = message;
		setTimeout(() => (localError = ''), 5000);
	}
</script>

<CardHeader title="Media Server Integrations" subtitle="Connect to your media servers" />

<div class="card-body py-4">
	<NotificationArea error={localError} {success} />

	<div class="space-y-6">
		<!-- Emby -->
		<IntegrationCard
			title="Emby"
			integration={mediaServerIntegrations.emby}
			urlPlaceholder="https://emby.example.com"
			clientType={TypesMediaClientType.MediaClientTypeEmby}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- Jellyfin -->
		<IntegrationCard
			title="Jellyfin"
			integration={mediaServerIntegrations.jellyfin}
			urlPlaceholder="https://jellyfin.example.com"
			clientType={TypesMediaClientType.MediaClientTypeJellyfin}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- subsonic -->
		<IntegrationCard
			title="subsonic"
			integration={mediaServerIntegrations.subsonic}
			urlPlaceholder="https://subsonic.example.com"
			keyType="username"
			keyLabel="Username"
			clientType={TypesMediaClientType.MediaClientTypeSubsonic}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- Plex -->
		<IntegrationCard
			title="Plex"
			integration={mediaServerIntegrations.plex}
			urlPlaceholder="https://plex.example.com"
			keyType="token"
			keyLabel="Token"
			clientType={TypesMediaClientType.MediaClientTypePlex}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>
	</div>
</div>
