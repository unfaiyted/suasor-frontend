<script lang="ts">
	import IntegrationCard from './IntegrationCard.svelte';
	import { TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
	import type { ClientResponse } from '$lib/api/types';
	import IconPlus from '../icons/IconPlus.svelte';

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

	// Create a safe default integration to use if mainIntegration is undefined
	let defaultIntegration = $state<ClientResponse>({
		isEnabled: true,
		name: 'Default',
		clientType: clientType as TypesClientType,
		client: {
			baseURL: urlPlaceholder || ''
		}
	});

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

	// Remove an integration
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
		onSave?.(event);
	}

	function handleError(event: { message: string }) {
		onError?.(event);
	}
</script>

<div class="mb-6">
	<div class="mb-2 flex items-center justify-between">
		<h3 class="text-xl font-bold">{title}</h3>
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
		<!-- Main integration -->
		<IntegrationCard
			{title}
			integration={mainIntegration}
			{urlPlaceholder}
			{clientType}
			onSaved={(client) => handleSaved(client)}
			onError={(client) => handleError(client)}
		/>

		<!-- Additional integrations -->
		{#each additionalIntegrations as integration, i}
			<div class="relative">
				<IntegrationCard
					title={`${title} ${i + 2}`}
					{integration}
					{urlPlaceholder}
					{clientType}
					onSaved={(client) => handleSaved(client)}
					onError={(client) => handleError(client)}
				/>

				<!-- Remove button -->
				<button
					class="btn btn-sm btn-error btn-icon absolute top-2 right-2"
					title="Remove integration"
					aria-label="Remove integration"
					onclick={() => removeIntegration(i)}
				>
					×
				</button>
			</div>
		{/each}
	</div>
</div>
