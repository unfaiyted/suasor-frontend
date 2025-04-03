<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import CardHeader from '../util/CardHeader.svelte';
	import NotificationArea from '../util/NotificationArea.svelte';
	import IntegrationSection from './IntegrationSection.svelte';
	import { clientsApi, clientsByTypeMap } from '$lib/stores/api';
	import type { ClientResponse } from '$lib/api/types';
	import type { TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';

	// Integration definition for the panel
	export interface Integration {
		title: string;
		clientType: string;
		urlPlaceholder: string;
		keyType?: 'apiKey' | 'token' | 'password' | 'none';
		keyLabel?: string;
		configProps?: string[];
	}

	type IntegrationsPanelProps = {
		title: string;
		subtitle: string;
		integrations: Integration[];
		// Optional loading state from parent
		isLoading?: boolean;
		// Optional function to call when settings change
		onSettingsChange?: (clientsByType: Record<string, ClientResponse[]>) => void;
	};

	const {
		title,
		subtitle,
		integrations,
		isLoading = false,
		onSettingsChange
	}: IntegrationsPanelProps = $props();

	// State variables
	let localError = $state('');
	let success = $state('');
	let clientsByType = $state<Record<string, ClientResponse[]>>({});
	let loading = $state(isLoading);
	let unsubscribeFromStore: (() => void) | null = null;

	// Subscribe to the clientsByType store
	function subscribeToClientStore() {
		// Subscribe to the clientsByType store to get organized data
		unsubscribeFromStore = clientsByTypeMap.subscribe((organizedClients) => {
			// Copy the organized clients data
			clientsByType = { ...organizedClients };

			// Notify parent component if needed
			if (onSettingsChange) {
				onSettingsChange(clientsByType);
			}
		});
	}

	// Load clients data when component mounts
	onMount(async () => {
		loading = true;
		localError = '';

		try {
			// Load clients from API
			await clientsApi.loadClients();

			// Subscribe to store updates
			subscribeToClientStore();

			loading = false;
		} catch (err) {
			localError = (err as Error).message || 'Failed to load integrations';
			loading = false;
		}
	});

	// Clean up subscription when component is destroyed
	onDestroy(() => {
		if (unsubscribeFromStore) {
			unsubscribeFromStore();
		}
	});

	// Event handlers for integration cards
	function handleClientSaved(
		event: CustomEvent<{ client: Record<string, any> }> | { client: Record<string, any> }
	) {
		const { client } = 'detail' in event ? event.detail : event;
		// We don't need to set global success message anymore as each card has its own status

		// Refresh the data in case other components don't update
		clientsApi.loadClients().catch((err) => {
			console.error('Failed to refresh clients after save:', err);
		});
	}

	function handleClientError(event: CustomEvent<{ message: string }> | { message: string }) {
		const { message } = 'detail' in event ? event.detail : event;
		// Only set global error for system-level errors
		if (message.includes('network') || message.includes('server') || message.includes('load')) {
			localError = message;
			setTimeout(() => (localError = ''), 5000);
		}
	}

	// Retry loading if there was an error
	function retryLoading() {
		loading = true;
		localError = '';

		clientsApi
			.loadClients()
			.then(() => {
				// Re-subscribe to store updates
				if (unsubscribeFromStore) {
					unsubscribeFromStore();
				}
				subscribeToClientStore();
				loading = false;
			})
			.catch((err) => {
				localError = (err as Error).message || 'Failed to load integrations';
				loading = false;
			});
	}
</script>

<CardHeader {title} {subtitle} />

<div class="card-body py-4">
	{#if !loading}
		<NotificationArea
			error={localError}
			{success}
			onErrorDismiss={() => (localError = '')}
			onSuccessDismiss={() => (success = '')}
		/>

		{#if localError && localError.includes('Failed to load')}
			<div class="my-4 flex justify-center">
				<button class="btn btn-primary" on:click={retryLoading}>Retry Loading</button>
			</div>
		{:else}
			<div>
				{#each integrations as integration}
					<IntegrationSection
						title={integration.title}
						integrations={clientsByType[integration.clientType] || []}
						urlPlaceholder={integration.urlPlaceholder}
						clientType={integration.clientType}
						keyType={integration.keyType || 'apiKey'}
						keyLabel={integration.keyLabel || 'API Key'}
						onSave={handleClientSaved}
						onError={handleClientError}
					/>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="flex h-64 items-center justify-center">
			<p class="text-lg">Loading integrations...</p>
		</div>
	{/if}
</div>
