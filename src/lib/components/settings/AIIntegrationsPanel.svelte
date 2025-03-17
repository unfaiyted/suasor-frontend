<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';
	import IntegrationCard from '../settings/IntegrationCard.svelte';

	export let aiIntegrations;
	export let saveSettings;
	export let isLoading;
</script>

<CardHeader title="AI Integrations" subtitle="Connect to AI models and services" />

<div class="card-body py-4">
	<form on:submit|preventDefault={() => saveSettings('ai-integrations')} class="space-y-6">
		<!-- Claude -->
		<IntegrationCard
			title="Claude"
			integration={aiIntegrations.claude}
			urlPlaceholder="https://api.anthropic.com"
			keyType="apiKey"
			keyLabel="API Key"
		/>

		<!-- OpenAI -->
		<IntegrationCard
			title="OpenAI"
			integration={aiIntegrations.openai}
			urlPlaceholder="https://api.openai.com"
			keyType="apiKey"
			keyLabel="API Key"
		/>

		<!-- Gemini -->
		<IntegrationCard
			title="Gemini"
			integration={aiIntegrations.gemini}
			urlPlaceholder="https://generativelanguage.googleapis.com"
			keyType="apiKey"
			keyLabel="API Key"
		/>

		<!-- Ollama -->
		<IntegrationCard
			title="Ollama"
			integration={aiIntegrations.ollama}
			urlPlaceholder="http://localhost:11434"
			keyType="none"
		/>

		<SaveButton {isLoading} />
	</form>
</div>
