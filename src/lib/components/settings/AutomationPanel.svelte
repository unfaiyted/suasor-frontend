<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';
	import IntegrationCard from './IntegrationCard.svelte';

	export let automationIntegrations;
	export let saveSettings;
	export let isLoading;
</script>

<CardHeader title="Automation Tools" subtitle="Connect to your automation services" />

<div class="card-body py-4">
	<form on:submit|preventDefault={() => saveSettings('automation')} class="space-y-6">
		<!-- Sonarr -->
		<IntegrationCard
			title="Sonarr"
			integration={automationIntegrations.sonarr}
			urlPlaceholder="https://sonarr.example.com"
		/>

		<!-- Radarr -->
		<IntegrationCard
			title="Radarr"
			integration={automationIntegrations.radarr}
			urlPlaceholder="https://radarr.example.com"
		/>

		<!-- Liadrr -->
		<IntegrationCard
			title="Liadrr"
			integration={automationIntegrations.liadrr}
			urlPlaceholder="https://liadrr.example.com"
		/>

		<SaveButton {isLoading} />
	</form>
</div>
