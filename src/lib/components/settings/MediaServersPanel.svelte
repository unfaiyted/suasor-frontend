<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';
	import IntegrationCard from '../settings/IntegrationCard.svelte';

	export let mediaServerIntegrations;
	export let saveSettings;
	export let isLoading;
</script>

<CardHeader title="Media Server Integrations" subtitle="Connect to your media servers" />

<div class="card-body py-4">
	<form on:submit|preventDefault={() => saveSettings('media-servers')} class="space-y-6">
		<!-- Emby -->
		<IntegrationCard
			title="Emby"
			integration={mediaServerIntegrations.emby}
			urlPlaceholder="https://emby.example.com"
		/>

		<!-- Jellyfin -->
		<IntegrationCard
			title="Jellyfin"
			integration={mediaServerIntegrations.jellyfin}
			urlPlaceholder="https://jellyfin.example.com"
		/>

		<!-- Navidrome -->
		<IntegrationCard
			title="Navidrome"
			integration={mediaServerIntegrations.navidrome}
			urlPlaceholder="https://navidrome.example.com"
			keyType="username"
			keyLabel="Username"
		/>

		<!-- Plex -->
		<IntegrationCard
			title="Plex"
			integration={mediaServerIntegrations.plex}
			urlPlaceholder="https://plex.example.com"
			keyType="token"
			keyLabel="Token"
		/>

		<SaveButton {isLoading} />
	</form>
</div>
