<script lang="ts">
	import { onMount } from 'svelte';
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';
	import IntegrationCard from '../settings/IntegrationCard.svelte';
	import NotificationArea from '../util/NotificationArea.svelte';
	import { clientsApi } from '$lib/stores/api';
	import { TypesClientType } from '$lib/api/suasor.v1.d';

	export let aiIntegrations;
	export let saveSettings;
	export let isLoading;
	
	let localError = '';
	let success = '';
	
	// Load existing clients from store when component mounts
	onMount(async () => {
		try {
			// Load clients and update AI integrations with actual client data
			const clients = await clientsApi.loadClients();
			
			// Map clients to the appropriate integrations
			clients.forEach(client => {
				if (client.type === TypesClientType.CLAUDE && aiIntegrations.claude) {
					aiIntegrations.claude.enabled = true;
					aiIntegrations.claude.url = client.url;
					aiIntegrations.claude.apiKey = client.apiKey;
					aiIntegrations.claude.id = client.id;
				} else if (client.type === TypesClientType.OPENAI && aiIntegrations.openai) {
					aiIntegrations.openai.enabled = true;
					aiIntegrations.openai.url = client.url;
					aiIntegrations.openai.apiKey = client.apiKey;
					aiIntegrations.openai.id = client.id;
				} else if (client.type === TypesClientType.GEMINI && aiIntegrations.gemini) {
					aiIntegrations.gemini.enabled = true;
					aiIntegrations.gemini.url = client.url;
					aiIntegrations.gemini.apiKey = client.apiKey;
					aiIntegrations.gemini.id = client.id;
				} else if (client.type === TypesClientType.OLLAMA && aiIntegrations.ollama) {
					aiIntegrations.ollama.enabled = true;
					aiIntegrations.ollama.url = client.url;
					aiIntegrations.ollama.id = client.id;
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

<CardHeader title="AI Integrations" subtitle="Connect to AI models and services" />

<div class="card-body py-4">
	<NotificationArea error={localError} {success} />
	
	<div class="space-y-6">
		<!-- Claude -->
		<IntegrationCard
			title="Claude"
			integration={aiIntegrations.claude}
			urlPlaceholder="https://api.anthropic.com"
			keyType="apiKey"
			keyLabel="API Key"
			clientType={TypesClientType.CLAUDE}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- OpenAI -->
		<IntegrationCard
			title="OpenAI"
			integration={aiIntegrations.openai}
			urlPlaceholder="https://api.openai.com"
			keyType="apiKey"
			keyLabel="API Key"
			clientType={TypesClientType.OPENAI}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- Gemini -->
		<IntegrationCard
			title="Gemini"
			integration={aiIntegrations.gemini}
			urlPlaceholder="https://generativelanguage.googleapis.com"
			keyType="apiKey"
			keyLabel="API Key"
			clientType={TypesClientType.GEMINI}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>

		<!-- Ollama -->
		<IntegrationCard
			title="Ollama"
			integration={aiIntegrations.ollama}
			urlPlaceholder="http://localhost:11434"
			keyType="none"
			clientType={TypesClientType.OLLAMA}
			on:saved={handleClientSaved}
			on:error={handleClientError}
		/>
	</div>
</div>