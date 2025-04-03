<script lang="ts">
	import { clientsApi } from '$lib/stores/api';
	import { TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
	import type {
		ClientResponse,
		JellyfinConfig,
		ClientRequest,
		SubsonicConfig
	} from '$lib/api/types';
	import { fade } from 'svelte/transition';

	type IntegrationCardProps = {
		title: string;
		integration: ClientResponse;
		urlPlaceholder: string;
		clientType: TypesClientType | TypesMediaClientType;
		onSaved?: (event: { client: ClientResponse }) => void;
		onError?: (event: { message: string }) => void;
	};

	const { title, integration, urlPlaceholder, clientType, onSaved, onError }: IntegrationCardProps =
		$props();

	// Define field configuration type
	type ConfigField = {
		name: string;
		label: string;
		type: 'text' | 'password' | 'url';
		required: boolean;
		placeholder?: string;
	};

	// Configuration mapping by client type
	const clientConfigFields: Record<string, ConfigField[]> = {
		[TypesClientType.ClientTypeJellyfin]: [
			{
				name: 'baseUrl',
				label: 'Server URL',
				type: 'url',
				required: true,
				placeholder: urlPlaceholder
			},
			{ name: 'apiKey', label: 'API Key', type: 'password', required: true }
		],
		[TypesClientType.ClientTypeSonarr]: [
			{
				name: 'baseUrl',
				label: 'Server URL',
				type: 'url',
				required: true,
				placeholder: urlPlaceholder
			},
			{ name: 'apiKey', label: 'API Key', type: 'password', required: true }
		],
		[TypesClientType.ClientTypeLidarr]: [
			{
				name: 'baseUrl',
				label: 'Server URL',
				type: 'url',
				required: true,
				placeholder: urlPlaceholder
			},
			{ name: 'apiKey', label: 'API Key', type: 'password', required: true }
		],
		[TypesClientType.ClientTypeRadarr]: [
			{
				name: 'baseUrl',
				label: 'Server URL',
				type: 'url',
				required: true,
				placeholder: urlPlaceholder
			},
			{ name: 'apiKey', label: 'API Key', type: 'password', required: true }
		],
		[TypesClientType.ClientTypePlex]: [
			{
				name: 'baseUrl',
				label: 'Server URL',
				type: 'url',
				required: true,
				placeholder: urlPlaceholder
			},
			{ name: 'token', label: 'Auth Token', type: 'password', required: true }
		],
		[TypesClientType.ClientTypeEmby]: [
			{
				name: 'baseUrl',
				label: 'Server URL',
				type: 'url',
				required: true,
				placeholder: urlPlaceholder
			},
			{ name: 'apiKey', label: 'API Key', type: 'password', required: true }
		],
		[TypesClientType.ClientTypeSubsonic]: [
			{
				name: 'baseUrl',
				label: 'Server URL',
				type: 'url',
				required: true,
				placeholder: urlPlaceholder
			},
			{ name: 'username', label: 'Username', type: 'text', required: true },
			{ name: 'password', label: 'Password', type: 'password', required: true }
		]
	};

	// Default fields for fallback
	const defaultFields: ConfigField[] = [
		{
			name: 'baseUrl',
			label: 'Server URL',
			type: 'url',
			required: true,
			placeholder: urlPlaceholder
		},
		{ name: 'apiKey', label: 'API Key', type: 'password', required: false }
	];

	// Initialize form state with sensible defaults
	let formIntegration = $state({
		isEnabled: true,
		baseUrl: urlPlaceholder || '',
		apiKey: '',
		username: '',
		password: '',
		token: ''
	});

	let configFields = $state(clientConfigFields[clientType] || defaultFields);
	let errors = $state({});
	let saveError = $state('');
	let saveSuccess = $state(false);
	let savingInProgress = $state(false);

	// Initialize errors object
	errors = Object.fromEntries(configFields.map((field) => [field.name, '']));

	// Initialize the form with values from props (one-time operation)
	if (integration && typeof integration === 'object') {
		console.log('integration', integration);
		const client = integration.client as SubsonicConfig;
		// Handle the "enabled" property which can be either "enabled" or "isEnabled"
		const isEnabled = integration.isEnabled;

		// Handle baseUrl vs url mapping
		const baseUrl = client.baseURL || urlPlaceholder || '';

		// Start with a new object to avoid reactivity issues
		const newForm = {
			isEnabled: isEnabled,
			baseUrl: baseUrl,
			apiKey: client?.apiKey || '',
			username: client?.username || '',
			password: client?.password || '',
			token: client?.token || ''
		};

		// Copy specific properties we need instead of looping through keys
		// This avoids copying references to objects we shouldn't modify
		if (integration.id) newForm.id = integration.id;
		if (integration.name) newForm.name = integration.name;
		if (integration.clientType) newForm.clientType = integration.clientType;

		formIntegration = newForm;
	}

	function validateIntegration() {
		// Reset errors
		errors = Object.fromEntries(configFields.map((field) => [field.name, '']));

		if (!formIntegration) {
			errors.baseURL = 'Form data is missing';
			return false;
		}

		let isValid = true;

		// Validate each field based on its requirements
		configFields.forEach((field) => {
			if (field.required && !formIntegration[field.name]) {
				errors[field.name] = `${field.label} is required`;
				isValid = false;
			} else if (field.name === 'baseUrl' && formIntegration.baseUrl) {
				try {
					new URL(formIntegration.baseUrl);
				} catch (e) {
					errors.baseURL = 'Please enter a valid URL';
					isValid = false;
				}
			}
		});

		return isValid;
	}

	async function toggleEnabledStatus() {
		if (!integration || typeof integration !== 'object' || !integration.id) {
			// For new integrations, just update the local form state
			return;
		}

		// Reset status indicators
		saveError = '';
		saveSuccess = false;
		savingInProgress = true;

		try {
			// Update the enabled status in the database
			const result = await clientsApi.toggleClientEnabled(integration, formIntegration.isEnabled);

			if (result) {
				// Update was successful
				saveSuccess = true;
				// Wait briefly before notifying parent to allow animation to be seen
				setTimeout(() => {
					onSaved?.({ client: result });
				}, 500);
			} else {
				// Revert the checkbox if the update failed
				formIntegration.isEnabled = !formIntegration.isEnabled;
				saveError = 'Failed to update integration status';
				onError?.({ message: saveError });
			}
		} catch (err) {
			// Revert the checkbox if there was an error
			formIntegration.isEnabled = !formIntegration.isEnabled;
			saveError = (err as Error).message || 'An error occurred while updating status';
			onError?.({ message: saveError });
		} finally {
			savingInProgress = false;

			// Auto-clear success status after 3 seconds
			if (saveSuccess) {
				setTimeout(() => {
					saveSuccess = false;
				}, 3000);
			}
		}
	}

	async function saveClient() {
		if (!formIntegration) return;

		// Reset status indicators
		saveError = '';
		saveSuccess = false;
		savingInProgress = true;

		if (!validateIntegration()) {
			saveError = 'Please fix validation errors before saving';
			onError?.({ message: saveError });
			savingInProgress = false;
			return;
		}

		try {
			// Don't directly modify the integration object from the parent
			// Instead, we'll create a separate update object in the API calls below

			// If this is an existing integration being updated
			if (integration && integration.id) {
				// Update existing client - create a new object instead of modifying the original
				const updatedClient: ClientRequest = {
					// Only copy the properties we need from integration
					clientID: integration.id,
					clientType: integration.clientType || TypesClientType.ClientTypeUnknown,
					name: integration.name || title,
					isEnabled: formIntegration.isEnabled,
					// Create a new client object instead of spreading the original
					client: {
						baseURL: formIntegration.baseUrl || '',
						apiKey: formIntegration.apiKey || undefined,
						username: formIntegration.username || undefined,
						password: formIntegration.password || undefined,
						token: formIntegration.token || undefined
					}
				};

				const result = await clientsApi.updateClient(updatedClient);

				console.log('Updated client:', result);
				if (result) {
					saveSuccess = true;
					// Wait briefly before notifying parent to allow animation to be seen
					setTimeout(() => {
						onSaved?.({ client: result });
					}, 500);
				} else {
					saveError = 'Failed to update client configuration';
					onError?.({ message: saveError });
				}
			} else {
				// Create new client
				const result = await clientsApi.createClient(
					title,
					clientType,
					formIntegration.baseUrl || '',
					formIntegration.apiKey || undefined,
					formIntegration.username || undefined,
					formIntegration.password || undefined,
					formIntegration.token || undefined,
					formIntegration.isEnabled
				);

				if (result) {
					saveSuccess = true;
					// Wait briefly before notifying parent to allow animation to be seen
					setTimeout(() => {
						onSaved?.({ client: result });
					}, 500);
				} else {
					saveError = 'Failed to save client configuration';
					onError?.({ message: saveError });
				}
			}
		} catch (err) {
			saveError = (err as Error).message || 'An error occurred while saving';
			onError?.({ message: saveError });
		} finally {
			savingInProgress = false;

			// Auto-clear success status after 3 seconds
			if (saveSuccess) {
				setTimeout(() => {
					saveSuccess = false;
				}, 3000);
			}
		}
	}
</script>

<div class="card preset-outlined-surface-500 bg-surface-200-800 relative p-4">
	<h4 class="mb-2 flex items-center text-lg font-bold">
		{title}
		{#if saveSuccess}
			<span class="text-success-500 ml-2" transition:fade>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M20 6L9 17l-5-5"></path>
				</svg>
			</span>
		{/if}
	</h4>

	{#if saveError}
		<div class="text-error-500 mb-2 flex items-center gap-1 text-sm" transition:fade>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="15" y1="9" x2="9" y2="15"></line>
				<line x1="9" y1="9" x2="15" y2="15"></line>
			</svg>
			<span>{saveError}</span>
		</div>
	{/if}

	<div class="space-y-3">
		<label class="flex items-center gap-2">
			<input
				type="checkbox"
				bind:checked={formIntegration.isEnabled}
				onchange={toggleEnabledStatus}
				class="checkbox"
			/>
			<span>Enable {title} Integration</span>
		</label>

		{#if formIntegration.isEnabled}
			{#each configFields as field (field.name)}
				<label class="label">
					<span class="label-text">{field.label}</span>
					<input
						type={field.type}
						class="input !bg-surface-100-900"
						placeholder={field.placeholder || ''}
						bind:value={formIntegration[field.name as keyof typeof formIntegration]}
						onblur={() => validateIntegration()}
					/>
					{#if errors[field.name]}
						<span class="text-error-500 text-xs">{errors[field.name]}</span>
					{/if}
				</label>
			{/each}

			<div class="mt-2 flex items-center">
				<button
					class="btn btn-sm btn-primary {savingInProgress ? 'loading' : ''}"
					onclick={saveClient}
					disabled={!formIntegration.isEnabled || savingInProgress}
				>
					{#if savingInProgress}
						Saving...
					{:else}
						Save {title} Integration
					{/if}
				</button>

				{#if saveSuccess}
					<span class="text-success-500 ml-2 text-sm" transition:fade> Saved successfully! </span>
				{/if}
			</div>
		{/if}
	</div>
</div>
