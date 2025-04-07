<script lang="ts">
	import { onMount } from 'svelte';
	import { Monitor, Activity, ToggleRight, Bot, Check, RefreshCw, Star } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';
	import { TypesClientType, TypesMediaClientType, TypesClientCategory } from '$lib/api/suasor.v1.d';
	import type { ClientResponse, ClientRequest } from '$lib/api/types';

	// Props for the component
	interface OnboardingAccountSetupProps {
		accountsToLink:
			| {
					mediaApplications: string[];
					mediaTrackers: string[];
					automationTools: string[];
					aiEngines: string[];
			  }
			| undefined;
		accountData: Record<string, any> | undefined;
		onComplete: (data: { stepData: any }) => void;
	}

	let { accountsToLink, accountData, onComplete }: OnboardingAccountSetupProps = $props();
	const dispatch = createEventDispatcher();

	// Local state with Svelte 5 syntax
	let currentStep = $state(0);
	let allAccounts = $state<{ id: string; category: string; name: string; clientType: string }[]>(
		[]
	);
	let accountConfigs = $state<Record<string, any>>({ ...accountData });
	let isConfiguring = $state(false);
	let configError = $state('');
	let testingConnection = $state(false);
	let connectionStatus = $state<Record<string, 'success' | 'failure' | 'pending' | 'untested'>>({});
	let createdClientIds = $state<Record<string, number>>({});
	let defaultClients = $state<Record<string, number>>({});
	let clientsLoading = $state<boolean>(false);
	let clientsApi: any;

	// Category icons
	const categoryIcons = {
		mediaApplications: Monitor,
		mediaTrackers: Activity,
		automationTools: ToggleRight,
		aiEngines: Bot
	};

	// Map for client types
	const clientTypeMap = {
		plex: TypesMediaClientType.MediaClientTypePlex,
		emby: TypesMediaClientType.MediaClientTypeEmby,
		jellyfin: TypesMediaClientType.MediaClientTypeJellyfin,
		subsonic: TypesMediaClientType.MediaClientTypeSubsonic,
		sonarr: TypesClientType.ClientTypeSonarr,
		radarr: TypesClientType.ClientTypeRadarr,
		lidarr: TypesClientType.ClientTypeLidarr,
		trakt: TypesClientType.ClientTypeTrakt,
		lastfm: TypesClientType.ClientTypeLastFM,
		spotify: TypesClientType.ClientTypeSpotify,
		claude: TypesClientType.ClientTypeClaude,
		openai: TypesClientType.ClientTypeOpenAI,
		ollama: TypesClientType.ClientTypeOllama
	};

	// Media client category map
	const clientCategoryMap = {
		plex: 'video',
		emby: 'video',
		jellyfin: 'video',
		subsonic: 'music',
		sonarr: 'tvshows',
		radarr: 'movies',
		lidarr: 'music'
	};

	// Account metadata
	const accountInfo = {
		plex: { name: 'Plex', category: 'mediaApplications', fields: ['url', 'token'] },
		emby: { name: 'Emby', category: 'mediaApplications', fields: ['url', 'apiKey', 'username'] },
		jellyfin: {
			name: 'Jellyfin',
			category: 'mediaApplications',
			fields: ['url', 'apiKey', 'username']
		},
		subsonic: {
			name: 'Subsonic',
			category: 'mediaApplications',
			fields: ['url', 'username', 'password']
		},
		trakt: { name: 'Trakt', category: 'mediaTrackers', fields: ['clientId', 'clientSecret'] },
		lastfm: { name: 'Last.FM', category: 'mediaTrackers', fields: ['apiKey'] },
		spotify: { name: 'Spotify', category: 'mediaTrackers', fields: ['clientId', 'clientSecret'] },
		sonarr: { name: 'Sonarr', category: 'automationTools', fields: ['url', 'apiKey'] },
		radarr: { name: 'Radarr', category: 'automationTools', fields: ['url', 'apiKey'] },
		lidarr: { name: 'Lidarr', category: 'automationTools', fields: ['url', 'apiKey'] },
		claude: { name: 'Claude', category: 'aiEngines', fields: ['apiKey'] },
		openai: { name: 'OpenAI', category: 'aiEngines', fields: ['apiKey'] },
		ollama: { name: 'Ollama', category: 'aiEngines', fields: ['url'] }
	};

	// Label map for fields
	const fieldLabels = {
		url: 'Server URL',
		apiKey: 'API Key',
		token: 'Token',
		username: 'Username',
		password: 'Password',
		clientId: 'Client ID',
		clientSecret: 'Client Secret'
	};

	// Helper functions for field placeholders
	function getFieldPlaceholder(accountId: string, field: string) {
		const baseMap = {
			url: 'https://your-server-address:port',
			apiKey: 'Your API key',
			token: 'Your authentication token',
			username: 'Your username',
			password: 'Your password',
			clientId: 'Your client ID',
			clientSecret: 'Your client secret'
		};

		// Custom placeholders by account
		const customPlaceholders = {
			plex: {
				url: 'https://plex.example.com:32400'
			},
			emby: {
				url: 'https://emby.example.com:8096'
			},
			jellyfin: {
				url: 'https://jellyfin.example.com:8096'
			},
			sonarr: {
				url: 'https://sonarr.example.com:8989'
			},
			radarr: {
				url: 'https://radarr.example.com:7878'
			},
			lidarr: {
				url: 'https://lidarr.example.com:8686'
			},
			ollama: {
				url: 'http://localhost:11434'
			}
		};

		return customPlaceholders[accountId]?.[field] || baseMap[field];
	}

	// Check if client is already default
	function isDefaultClient(accountId: string) {
		const clientType = clientTypeMap[accountId];
		// For media clients, check if it's the default for its media type (video/music)
		if (accountId in clientCategoryMap) {
			const category = clientCategoryMap[accountId];
			const defaultKey = `default${category.charAt(0).toUpperCase() + category.slice(1)}ClientID`;
			return defaultClients[defaultKey] === createdClientIds[accountId];
		}

		// For other clients, check if it's the default for its client type
		const defaultKey = `default${clientType}ClientID`;
		return defaultClients[defaultKey] === createdClientIds[accountId];
	}

	// Set as default client
	function setAsDefault(accountId: string) {
		const clientType = clientTypeMap[accountId];

		// For media clients, set as default for its media type
		if (accountId in clientCategoryMap) {
			const category = clientCategoryMap[accountId];
			const defaultKey = `default${category.charAt(0).toUpperCase() + category.slice(1)}ClientID`;
			defaultClients[defaultKey] = createdClientIds[accountId];
		}

		// Also set as default for its specific client type
		const defaultKey = `default${clientType}ClientID`;
		defaultClients[defaultKey] = createdClientIds[accountId];

		// Auto-set Subsonic as default music client if none is set yet
		if (accountId === 'subsonic' && !defaultClients['defaultMusicClientID']) {
			defaultClients['defaultMusicClientID'] = createdClientIds[accountId];
		}
	}

	// Get the count of clients by category
	function getClientCountByCategory(category: string) {
		return allAccounts.filter((account) => account.category === category).length;
	}

	// Get all account IDs for a specific category
	function getAccountsByCategory(category: string) {
		return allAccounts
			.filter((account) => account.category === category)
			.map((account) => account.id);
	}

	// Initialize the setup steps
	function initializeSetup() {
		allAccounts = [];

		// Build the list of accounts to configure
		for (const [category, accounts] of Object.entries(accountsToLink)) {
			for (const accountId of accounts) {
				if (accountInfo[accountId]) {
					allAccounts.push({
						id: accountId,
						category,
						name: accountInfo[accountId].name,
						clientType: clientTypeMap[accountId]
					});
				}
			}
		}

		// Initialize connection status
		for (const account of allAccounts) {
			connectionStatus[account.id] = 'untested';
		}

		currentStep = 0;
	}

	// Initialize each account's configuration if not already set
	function initializeAccountConfig(accountId: string) {
		if (!accountConfigs[accountId]) {
			accountConfigs[accountId] = {};

			// Initialize with empty fields
			const fields = accountInfo[accountId]?.fields || [];
			for (const field of fields) {
				accountConfigs[accountId][field] = '';
			}
		}
	}

	// Create a client using the clientsApi
	async function createClient(accountId: string) {
		if (!clientsApi) return null;

		const config = accountConfigs[accountId];
		if (!config) return null;

		const fields = accountInfo[accountId]?.fields || [];
		const missingFields = fields.filter((field) => !config[field]);
		if (missingFields.length > 0) {
			configError = `Missing required fields: ${missingFields.join(', ')}`;
			return null;
		}

		try {
			clientsLoading = true;
			const clientType = clientTypeMap[accountId];

			// Use the helper function to build the client config
			const clientConfig = buildClientConfig(accountId, config);

			// Extract the necessary fields from the config
			const url = config.url;
			const apiKey = config.apiKey;
			const token = config.token;
			const username = config.username;
			const password = config.password;

			// Create the client
			const newClient = await clientsApi.createClient(
				accountInfo[accountId].name,
				clientType,
				url,
				apiKey,
				username,
				password,
				token,
				true // enabled by default
			);

			if (newClient && newClient.id) {
				// Store the created client ID
				createdClientIds[accountId] = newClient.id;

				// If this is the first client of its type, set it as default
				const category = clientCategoryMap[accountId];
				if (category) {
					const categoryClients = getAccountsByCategory(accountInfo[accountId].category).filter(
						(id) => clientCategoryMap[id] === category
					);

					if (categoryClients.length === 1) {
						setAsDefault(accountId);
					}

					// Special case: Subsonic is always default music client unless specified otherwise
					if (accountId === 'subsonic') {
						setAsDefault(accountId);
					}
				}

				return newClient;
			}
			return null;
		} catch (error) {
			console.error('Error creating client:', error);
			configError = error instanceof Error ? error.message : 'Unknown error creating client';
			return null;
		} finally {
			clientsLoading = false;
		}
	}

	// Test the connection for the current account using new endpoint
	async function testConnection() {
		const account = allAccounts[currentStep];
		if (!account) return;

		testingConnection = true;
		connectionStatus[account.id] = 'pending';
		configError = '';

		try {
			// Check if configuration has all required fields
			const requiredFields = accountInfo[account.id]?.fields || [];
			const config = accountConfigs[account.id];

			const missingFields = requiredFields.filter((field) => !config[field]);
			if (missingFields.length > 0) {
				throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
			}

			if (!clientsApi) {
				throw new Error('API client not initialized');
			}

			// Test the new client configuration without creating it first
			const clientType = clientTypeMap[account.id];

			// Create the client config based on the account type and form data
			const clientConfig = buildClientConfig(account.id, config);

			// Test the connection with the new endpoint
			const testResult = await clientsApi.testNewClientConnection(
				clientType,
				clientConfig,
				accountInfo[account.id].name
			);

			if (!testResult) {
				throw new Error('Connection test failed');
			}

			// If test was successful and client wasn't already created, create it now
			if (!createdClientIds[account.id]) {
				const newClient = await createClient(account.id);
				if (!newClient) {
					throw new Error('Connection tested successfully but failed to create client');
				}
			}

			// Connection successful
			connectionStatus[account.id] = 'success';
			
			// If this is the last account, automatically proceed when connection test is successful
			if (currentStep === allAccounts.length - 1) {
				// Brief delay to allow the user to see successful connection message
				setTimeout(() => {
					completeSetup();
				}, 1000);
			}
		} catch (error) {
			connectionStatus[account.id] = 'failure';
			configError = error instanceof Error ? error.message : 'Unknown error';
		} finally {
			testingConnection = false;
		}
	}

	// Validate if current account config is complete
	function isCurrentConfigComplete() {
		const account = allAccounts[currentStep];
		if (!account) return false;

		const requiredFields = accountInfo[account.id]?.fields || [];
		const config = accountConfigs[account.id];

		return requiredFields.every((field) => config[field]?.trim());
	}

	// Go to the next account setup, but only if current connection was tested successfully
	async function goToNext() {
		const account = allAccounts[currentStep];
		if (!account) return;

		// If the client has not been tested yet, test it first
		if (connectionStatus[account.id] !== 'success') {
			// First try to test the connection
			await testConnection();

			// Only proceed if the connection test was successful
			if (connectionStatus[account.id] === 'success') {
				proceedToNext();
			} else {
				// If test failed, show an error message but don't proceed
				configError = 'Please fix connection issues before continuing.';
			}
		} else {
			// Client already tested successfully, proceed to next step
			proceedToNext();
		}
	}

	// Actually proceed to the next step
	function proceedToNext() {
		if (currentStep < allAccounts.length - 1) {
			currentStep++;
			initializeAccountConfig(allAccounts[currentStep].id);
			// Scroll to top when moving to next account
			window.scrollTo(0, 70);
		} else {
			// We're at the last step, complete onboarding
			completeSetup();
		}
	}

	// Go to the previous account setup
	function goToPrevious() {
		if (currentStep > 0) {
			currentStep--;
			// Scroll to top when moving to previous account
			window.scrollTo(0, 70);
		}
	}

	// Skip the current account setup
	function skipCurrent() {
		if (currentStep < allAccounts.length - 1) {
			currentStep++;
			initializeAccountConfig(allAccounts[currentStep].id);
			// Scroll to top when moving to next account
			window.scrollTo(0, 70);
		} else {
			// We're at the last step, complete onboarding
			completeSetup();
		}
	}

	// Skip all remaining setups
	function skipAll() {
		completeSetup();
	}

	// Complete the setup and return all the data
	function completeSetup() {
		// Prepare the step data with account configurations and client IDs
		const stepData = {
			accountData: accountConfigs,
			clientIds: createdClientIds,
			defaultClients: defaultClients
		};

		// Call the onComplete callback with step data
		onComplete({ stepData });

		// Scroll to top when completing
		window.scrollTo(0, 70);
	}

	// Helper function to build the appropriate client config based on account type
	function buildClientConfig(
		accountId: string,
		config: Record<string, string>
	): Partial<ClientConfigTypes> {
		// Base client config
		const clientConfig: any = {
			baseURL: config.url,
			category: getCategoryForClientType(clientTypeMap[accountId])
		};

		// Add specific fields based on account type
		switch (accountId) {
			case 'plex':
				clientConfig.token = config.token;
				break;
			case 'emby':
			case 'jellyfin':
				clientConfig.username = config.username;
				clientConfig.apiKey = config.apiKey;
				break;
			case 'sonarr':
			case 'radarr':
			case 'lidarr':
				clientConfig.apiKey = config.apiKey;
				break;
			case 'subsonic':
				clientConfig.username = config.username;
				clientConfig.password = config.password;
				break;
			case 'trakt':
			case 'spotify':
				clientConfig.clientId = config.clientId;
				clientConfig.clientSecret = config.clientSecret;
				break;
			case 'lastfm':
				clientConfig.apiKey = config.apiKey;
				break;
			case 'claude':
			case 'openai':
				clientConfig.apiKey = config.apiKey;
				break;
			case 'ollama':
				// Ollama just needs the baseURL
				break;
		}

		return clientConfig;
	}

	// Helper function to determine the client category
	function getCategoryForClientType(clientType: string): string {
		const clientTypeStr = clientType.toString().toLowerCase();

		// Determine client category based on client type
		if (
			clientTypeStr.includes('emby') ||
			clientTypeStr.includes('jellyfin') ||
			clientTypeStr.includes('plex') ||
			clientTypeStr.includes('subsonic')
		) {
			return TypesClientCategory.ClientCategoryMedia;
		} else if (
			clientTypeStr.includes('sonarr') ||
			clientTypeStr.includes('radarr') ||
			clientTypeStr.includes('lidarr')
		) {
			return TypesClientCategory.ClientCategoryAutomation;
		} else {
			return TypesClientCategory.ClientCategoryAI;
		}
	}

	// Initialize when component mounts (only once)
	onMount(async () => {
		// Import the clientsApi dynamically to avoid circular dependencies
		const apiModule = await import('$lib/stores/api');
		clientsApi = apiModule.clientsApi;

		// Initialize the setup
		initializeSetup();
		if (allAccounts.length > 0) {
			initializeAccountConfig(allAccounts[0].id);
		}
	});
</script>

<div class="space-y-8">
	<div>
		<h2 class="mb-2 text-2xl font-bold">Configure Your Accounts</h2>
		<p class="text-surface-900-50">
			Let's set up your selected accounts to connect them with Suasor.
		</p>
		{#if allAccounts.length > 0}
			<div class="mt-3 mb-2 text-center bg-primary-500/10 py-2 px-4 rounded-md">
				<p class="text-primary-700 font-medium">
					Configuring account {currentStep + 1} of {allAccounts.length}:
					<span class="font-bold">{allAccounts[currentStep]?.name}</span>
				</p>
			</div>
		{/if}
	</div>

	{#if allAccounts.length === 0}
		<div class="py-8 text-center">
			<p class="text-surface-900-50">No accounts selected for configuration.</p>
			<button
				class="btn preset-filled-primary-500 mt-4"
				onclick={() => onComplete({ stepData: { accountData: {}, clientIds: {}, defaultClients: {} } })}
			>
				Continue
			</button>
		</div>
	{:else if currentStep < allAccounts.length}
		<!-- Current Account Configuration -->
		{#if allAccounts[currentStep]}
			{@const account = allAccounts[currentStep]}
			{@const accountConfig = accountConfigs[account.id] || {}}
			{@const accountFields = accountInfo[account.id]?.fields || []}

			<div class="bg-surface-200-800/30 border-surface-300-600 rounded-lg border p-6">
				<div class="mb-6 flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div class="bg-primary-500/20 rounded-full p-2">
							{#if account.category === 'mediaApplications'}
								<Monitor size={20} class="text-primary-500" />
							{:else if account.category === 'mediaTrackers'}
								<Activity size={20} class="text-primary-500" />
							{:else if account.category === 'automationTools'}
								<ToggleRight size={20} class="text-primary-500" />
							{:else if account.category === 'aiEngines'}
								<Bot size={20} class="text-primary-500" />
							{/if}
						</div>
						<h3 class="text-lg font-medium">{account.name} Configuration</h3>
					</div>

					<!-- Default indicator - shows when this client is a default -->
					{#if createdClientIds[account.id] && isDefaultClient(account.id)}
						<div
							class="flex items-center space-x-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-500"
						>
							<Star size={14} />
							<span>Default</span>
						</div>
					{/if}
				</div>

				<!-- Configuration form -->
				<div class="space-y-4">
					{#each accountFields as field}
						<div>
							<label for={`${account.id}-${field}`} class="mb-1 block text-sm font-medium">
								{fieldLabels[field]}
							</label>
							{#if field === 'password'}
								<input
									type="password"
									id={`${account.id}-${field}`}
									class="input w-full"
									bind:value={accountConfig[field]}
									placeholder={getFieldPlaceholder(account.id, field)}
								/>
							{:else}
								<input
									type="text"
									id={`${account.id}-${field}`}
									class="input w-full"
									bind:value={accountConfig[field]}
									placeholder={getFieldPlaceholder(account.id, field)}
								/>
							{/if}
						</div>
					{/each}

					{#if configError}
						<div class="mt-2 text-sm text-red-500">
							{configError}
						</div>
					{/if}

					<!-- Connection test result -->
					{#if connectionStatus[account.id] === 'success'}
						<div class="flex items-center gap-2 rounded bg-green-500/10 p-3 text-green-500">
							<Check size={18} />
							<span>Connection successful!</span>
						</div>
					{:else if connectionStatus[account.id] === 'failure'}
						<div class="rounded bg-red-500/10 p-3 text-red-500">
							Connection failed. Please check your settings and try again.
						</div>
					{/if}

					<!-- Test connection and Make Default buttons -->
					<div class="mt-4 flex flex-wrap gap-3">
						<button
							class="btn preset-outlined-primary-500 rounded-full"
							onclick={testConnection}
							disabled={!isCurrentConfigComplete() || testingConnection}
						>
							{#if testingConnection}
								<RefreshCw size={16} class="animate-spin" />
								<span>Testing...</span>
							{:else}
								<span>Test Connection</span>
							{/if}
						</button>

						<!-- Make Default button - only shown for supported clients with successful connections -->
						{#if connectionStatus[account.id] === 'success' && createdClientIds[account.id] && account.id in clientCategoryMap && !isDefaultClient(account.id) && getClientCountByCategory(account.category) > 1}
							<button
								class="btn preset-outlined rounded-full border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
								onclick={() => setAsDefault(account.id)}
							>
								<Star size={16} />
								<span>Make Default</span>
							</button>
						{/if}
					</div>
				</div>
			</div>

			<!-- Navigation buttons -->
			<div class="flex justify-between pt-4">
				<div>
					<button class="btn preset-outlined rounded-full" onclick={skipCurrent}>
						Skip This Account
					</button>
				</div>

				<div class="flex space-x-3">
					{#if currentStep > 0}
						<button class="btn preset-outlined rounded-full" onclick={goToPrevious}>
							Previous
						</button>
					{/if}

					<button
						class="btn preset-filled-primary-500 rounded-full shadow-md transition-shadow hover:shadow-lg"
						onclick={goToNext}
					>
						{currentStep < allAccounts.length - 1 ? 'Next' : 'Finish'}
					</button>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Skip all button -->
	{#if allAccounts.length > 1 && currentStep < allAccounts.length - 1}
		<div class="mt-6 text-center">
			<button class="text-surface-900-50 hover:text-surface-900-50-hover text-sm" onclick={skipAll}>
				Skip All Remaining Accounts
			</button>
		</div>
	{/if}
</div>
