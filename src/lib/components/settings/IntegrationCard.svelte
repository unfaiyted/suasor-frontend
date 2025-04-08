<script lang="ts">
	import { clientsApi } from '$lib/stores/api';
	import { configApi } from '$lib/stores/config';
	import { TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
	import type {
		ClientResponse,
		JellyfinConfig,
		ClientRequest,
		SubsonicConfig,
		UserConfig
	} from '$lib/api/types';
	import { fade } from 'svelte/transition';
	import { Star } from '@lucide/svelte';

	type IntegrationCardProps = {
		title: string;
		integration: ClientResponse;
		urlPlaceholder: string;
		clientType: TypesClientType | TypesMediaClientType;
		onSaved?: (event: { client: ClientResponse }) => void;
		onError?: (event: { message: string }) => void;
		isDefault?: boolean;
		onSetDefault?: (client: ClientResponse) => void;
	};

	const { 
		title, 
		integration: initialIntegration, 
		urlPlaceholder, 
		clientType, 
		onSaved, 
		onError,
		isDefault = false,
		onSetDefault
	}: IntegrationCardProps = $props();

	// Make a local version that we can update when saving
	let integration = $state(initialIntegration);

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
	let testingConnection = $state(false);
	let testConnectionSuccess = $state(false);
	let testConnectionError = $state('');

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
			id: 0,
			name: '',
			isEnabled: isEnabled || false,
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
			// const result = await clientsApi.toggleClientEnabled(integration, formIntegration.isEnabled);
			const clientRequest: ClientRequest = {
				clientID: integration.id,
				clientType: integration.clientType as TypesClientType,
				name: integration.name || '',
				client: {
					...(integration.client as any),
					isEnabled: formIntegration.isEnabled
				},
				isEnabled: formIntegration.isEnabled
			};
			const result = await clientsApi.updateClient(clientRequest);

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

	// Test connection with the client
	async function testConnection() {
		if (!formIntegration) return;

		// Reset status indicators
		testConnectionError = '';
		testConnectionSuccess = false;
		testingConnection = true;

		if (!validateIntegration()) {
			testConnectionError = 'Please fix validation errors before testing';
			onError?.({ message: testConnectionError });
			testingConnection = false;
			return;
		}

		try {
			// Build a client config for testing
			const clientConfig = {
				baseURL: formIntegration.baseUrl || '',
				apiKey: formIntegration.apiKey || undefined,
				username: formIntegration.username || undefined,
				password: formIntegration.password || undefined,
				token: formIntegration.token || undefined
			};

			let result;
			
			// If this is an existing integration, use the testClient method
			if (integration && integration.id) {
				const testClientRequest: ClientRequest = {
					clientID: integration.id,
					clientType: integration.clientType || TypesClientType.ClientTypeUnknown,
					name: integration.name || title,
					isEnabled: formIntegration.isEnabled,
					client: clientConfig
				};
				
				result = await clientsApi.testClient(testClientRequest);
			} else {
				// For new integrations, use the testNewClientConnection method
				result = await clientsApi.testNewClientConnection(
					clientType,
					clientConfig,
					title
				);
			}

			if (result) {
				testConnectionSuccess = true;
				// Auto-clear success status after 3 seconds
				setTimeout(() => {
					testConnectionSuccess = false;
				}, 3000);
			} else {
				testConnectionError = 'Connection test failed';
				onError?.({ message: testConnectionError });
			}
		} catch (err) {
			testConnectionError = (err as Error).message || 'An error occurred during test';
			onError?.({ message: testConnectionError });
		} finally {
			testingConnection = false;
		}
	}

	// Set this client as the default for its type
	async function setAsDefault() {
		if (!integration || !integration.id) return;
		
		// Reset status indicators
		saveError = '';
		saveSuccess = false;
		savingInProgress = true;
		
		try {
			// Get current user config
			const userConfig = await configApi.loadUserConfig();
			if (!userConfig) {
				throw new Error('Failed to load user configuration');
			}
			
			// Create updated config with this client set as default
			const updatedConfig: Partial<UserConfig> = {};
			
			// Different handling for media clients vs others
			const clientTypeStr = integration.clientType?.toString().toLowerCase();
			
			// Set as default based on client type
			if (clientTypeStr.includes('emby') || clientTypeStr.includes('jellyfin') || clientTypeStr.includes('plex')) {
				// Video media clients
				updatedConfig.defaultVideoClientID = integration.id;
			} else if (clientTypeStr.includes('subsonic')) {
				// Music media clients
				updatedConfig.defaultMusicClientID = integration.id;
			} else if (clientTypeStr.includes('sonarr')) {
				// TV show automation
				updatedConfig.defaultTVShowClientID = integration.id;
			} else if (clientTypeStr.includes('radarr')) {
				// Movie automation
				updatedConfig.defaultMovieClientID = integration.id;
			} else if (clientTypeStr.includes('lidarr')) {
				// Music automation
				updatedConfig.defaultMusicClientID = integration.id;
			} else if (clientTypeStr.includes('claude') || clientTypeStr.includes('openai') || clientTypeStr.includes('ollama')) {
				// AI clients
				updatedConfig.defaultAIClientID = integration.id;
			}
			
			// Set specific client type as default
			const clientTypeKey = `default${integration.clientType}ClientID`;
			updatedConfig[clientTypeKey] = integration.id;
			
			// Save the updated config
			const result = await configApi.saveUserConfig(updatedConfig);
			
			if (result) {
				saveSuccess = true;
				
				// Notify parent component
				if (onSetDefault) {
					onSetDefault(integration);
				}
				
				// Wait briefly before notifying of success
				setTimeout(() => {
					onSaved?.({ client: integration });
				}, 500);
			} else {
				saveError = 'Failed to set as default client';
				onError?.({ message: saveError });
			}
		} catch (err) {
			saveError = (err as Error).message || 'An error occurred while setting default';
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
					// Update our local integration object with the result
					integration = result;
					
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
					// Update our local integration object with the result
					integration = result;
					
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
	<!-- Header with default indicator -->
	<div class="mb-2 flex items-center">
		<!-- Default indicator star - fixed width container moved to left side -->
		<div class="w-7 h-7 flex items-center justify-center mr-2">
			{#if isDefault}
				<!-- Default client (filled star) -->
				<div title="Default client" class="text-amber-500">
					<Star size={18} fill="currentColor" />
				</div>
			{:else if integration && integration.id && onSetDefault}
				<!-- Existing integration that can be set as default -->
				<button
					title="Set as default client"
					class="text-amber-500/50 hover:text-amber-500 transition-colors"
					onclick={setAsDefault}
					disabled={savingInProgress}
				>
					<Star size={18} />
				</button>
			{:else}
				<!-- New integration (inactive star) -->
				<div title="Save integration to enable default setting" class="text-amber-500/20">
					<Star size={18} />
				</div>
			{/if}
		</div>
		
		<h4 class="flex items-center text-lg font-bold">
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
	</div>

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

	{#if testConnectionError}
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
			<span>{testConnectionError}</span>
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

			<!-- Test connection and connection success indicator -->
			{#if testConnectionSuccess}
				<div class="flex items-center gap-2 rounded bg-green-500/10 p-2 text-green-500 text-sm">
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
					<span>Connection successful!</span>
				</div>
			{/if}

			<div class="mt-2 flex flex-wrap items-center gap-2">
				<button
					class="rounded-md bg-primary-600 hover:bg-primary-700 px-3 py-1.5 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-primary-700 flex items-center gap-1.5 shadow-sm"
					onclick={saveClient}
					disabled={!formIntegration.isEnabled || savingInProgress}
				>
					{#if savingInProgress}
						<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>Saving...</span>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save">
							<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
							<polyline points="17 21 17 13 7 13 7 21"></polyline>
							<polyline points="7 3 7 8 15 8"></polyline>
						</svg>
						<span>Save</span>
					{/if}
				</button>

				<button
					class="rounded-md bg-surface-100-900 hover:bg-surface-200-800 border border-surface-300-700 px-3 py-1.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
					onclick={testConnection}
					disabled={!formIntegration.isEnabled || testingConnection}
				>
					{#if testingConnection}
						<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>Testing...</span>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plug-zap">
							<path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"></path>
							<path d="m2 22 3-3"></path>
							<path d="M7.5 13.5 10 11"></path>
							<path d="M10.5 16.5 13 14"></path>
							<path d="m18 3-4 4h-6"></path>
							<path d="m18 3 3 3"></path>
							<path d="M18 13v-2"></path>
							<path d="M16 15h-2"></path>
							<path d="M13 18v-2"></path>
							<path d="M11 20h-2"></path>
						</svg>
						<span>Test</span>
					{/if}
				</button>

				{#if saveSuccess}
					<span class="text-success-500 text-sm flex items-center gap-1" transition:fade>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 6L9 17l-5-5"></path>
						</svg>
						<span>Saved</span>
					</span>
				{/if}
			</div>
		{/if}
	</div>
</div>