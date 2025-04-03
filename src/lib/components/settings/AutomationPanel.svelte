<script lang="ts">
	import { onMount } from 'svelte';
	import CardHeader from '../util/CardHeader.svelte';
	import IntegrationCard from './IntegrationCard.svelte';
	import NotificationArea from '../util/NotificationArea.svelte';
	import { clientsApi } from '$lib/stores/api';
	import { TypesClientType } from '$lib/api/suasor.v1.d';

	export let automationIntegrations;
	export let saveSettings;
	export let isLoading;
	
	let localError = '';
	let success = '';
	
	// Load existing clients from store when component mounts
	onMount(async () => {
		try {
			// Load clients and update automation integrations with actual client data
			const clients = await clientsApi.loadClients();
			
			// Map clients to the appropriate integrations
			clients.forEach(client => {
				if (client.type === TypesClientType.SONARR && automationIntegrations.sonarr) {
					automationIntegrations.sonarr.enabled = true;
					automationIntegrations.sonarr.url = client.url;
					automationIntegrations.sonarr.apiKey = client.apiKey;
					automationIntegrations.sonarr.id = client.id;
				} else if (client.type === TypesClientType.RADARR && automationIntegrations.radarr) {
					automationIntegrations.radarr.enabled = true;
					automationIntegrations.radarr.url = client.url;
					automationIntegrations.radarr.apiKey = client.apiKey;
					automationIntegrations.radarr.id = client.id;
				} else if (client.type === TypesClientType.LIADARR && automationIntegrations.liadrr) {
					automationIntegrations.liadrr.enabled = true;
					automationIntegrations.liadrr.url = client.url;
					automationIntegrations.liadrr.apiKey = client.apiKey;
					automationIntegrations.liadrr.id = client.id;
				}
			});
		} catch (err) {
			localError = err.message || 'Failed to load clients';
		}
	});
	
	// Handle events from integration card
	function handleClientSaved(event) {
		const { client } = event.detail;
		success = `${client.name} integration saved successfully`;
		setTimeout(() => success = '', 3000);
	}
	
	function handleClientError(event) {
		const { message } = event.detail;
		localError = message;
		setTimeout(() => localError = '', 5000);
	}
</script>

<CardHeader title="Automation Tools" subtitle="Connect to your automation services" />

<div class="card-body py-4">
	<NotificationArea error={localError} {success} />
	
	<div class="space-y-6">
		<!-- Sonarr -->
		<IntegrationCard
			title="Sonarr"
			integration={automationIntegrations.sonarr}
			urlPlaceholder="https://sonarr.example.com"
			keyType="apiKey"
			keyLabel="API Key"
			clientType={TypesClientType.SONARR}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- Radarr -->
		<IntegrationCard
			title="Radarr"
			integration={automationIntegrations.radarr}
			urlPlaceholder="https://radarr.example.com"
			keyType="apiKey"
			keyLabel="API Key"
			clientType={TypesClientType.RADARR}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- Liadrr -->
		<IntegrationCard
			title="Liadrr"
			integration={automationIntegrations.liadrr}
			urlPlaceholder="https://liadrr.example.com"
			keyType="apiKey"
			keyLabel="API Key"
			clientType={TypesClientType.LIADARR}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>
	</div>
</div>