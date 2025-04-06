<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Monitor, Activity, ToggleRight, Bot, Check, RefreshCw } from '@lucide/svelte';

	// Props for the component
	interface OnboardingAccountSetupProps {
		accountsToLink: {
			mediaApplications: string[];
			mediaTrackers: string[];
			automationTools: string[];
			aiEngines: string[];
		};
		accountData: Record<string, any>;
	}

	let { accountsToLink, accountData } = $props<OnboardingAccountSetupProps>();

	// Local state with Svelte 5 syntax
	let currentStep = $state(0);
	let allAccounts = $state<{ id: string; category: string; name: string }[]>([]);
	let accountConfigs = $state<Record<string, any>>({ ...accountData });
	let isConfiguring = $state(false);
	let configError = $state('');
	let testingConnection = $state(false);
	let connectionStatus = $state<Record<string, 'success' | 'failure' | 'pending' | 'untested'>>({});

	// Category icons
	const categoryIcons = {
		mediaApplications: Monitor,
		mediaTrackers: Activity,
		automationTools: ToggleRight,
		aiEngines: Bot
	};

	// Account metadata
	const accountInfo = {
		plex: { name: 'Plex', category: 'mediaApplications', fields: ['url', 'token'] },
		emby: { name: 'Emby', category: 'mediaApplications', fields: ['url', 'apiKey'] },
		jellyfin: { name: 'Jellyfin', category: 'mediaApplications', fields: ['url', 'apiKey'] },
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

	// Event dispatcher to notify parent component when step is completed
	const dispatch = createEventDispatcher();

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
						name: accountInfo[accountId].name
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

	// Go to the next account setup
	function goToNext() {
		if (currentStep < allAccounts.length - 1) {
			currentStep++;
			initializeAccountConfig(allAccounts[currentStep].id);
			// Scroll to top when moving to next account
			window.scrollTo(0, 70);
		} else {
			dispatch('complete', {
				stepData: {
					accountData: accountConfigs
				}
			});
			// Scroll to top when completing
			window.scrollTo(0, 70);
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
		goToNext();
	}

	// Skip all remaining setups
	function skipAll() {
		dispatch('complete', {
			stepData: {
				accountData: accountConfigs
			}
		});
		// Scroll to top
		window.scrollTo(0, 70);
	}

	// Test the connection for the current account
	async function testConnection() {
		const account = allAccounts[currentStep];
		if (!account) return;

		testingConnection = true;
		connectionStatus[account.id] = 'pending';
		configError = '';

		try {
			// In a real implementation, make an API call to test the connection
			// Simulate API call for now
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Check if configuration has all required fields
			const requiredFields = accountInfo[account.id]?.fields || [];
			const config = accountConfigs[account.id];

			const missingFields = requiredFields.filter((field) => !config[field]);
			if (missingFields.length > 0) {
				throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
			}

			// Simulate a successful connection
			connectionStatus[account.id] = 'success';
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

	// Initialize when component mounts (only once)
	onMount(() => {
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
			{#if allAccounts.length > 0}
				Configuring {currentStep + 1} of {allAccounts.length}:
				<span class="font-medium">{allAccounts[currentStep]?.name}</span>
			{/if}
		</p>
	</div>

	{#if allAccounts.length === 0}
		<div class="py-8 text-center">
			<p class="text-surface-900-50">No accounts selected for configuration.</p>
			<button
				class="btn preset-filled-primary-500 mt-4"
				on:click={() => dispatch('complete', { stepData: { accountData: {} } })}
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
				<div class="mb-6 flex items-center space-x-3">
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

					<!-- Test connection button -->
					<div class="mt-4">
						<button
							class="btn preset-outlined-primary-500 rounded-full"
							on:click={testConnection}
							disabled={!isCurrentConfigComplete() || testingConnection}
						>
							{#if testingConnection}
								<RefreshCw size={16} class="animate-spin" />
								<span>Testing...</span>
							{:else}
								<span>Test Connection</span>
							{/if}
						</button>
					</div>
				</div>
			</div>

			<!-- Navigation buttons -->
			<div class="flex justify-between pt-4">
				<div>
					<button class="btn preset-outlined rounded-full" on:click={skipCurrent}>
						Skip This Account
					</button>
				</div>

				<div class="flex space-x-3">
					{#if currentStep > 0}
						<button class="btn preset-outlined rounded-full" on:click={goToPrevious}>
							Previous
						</button>
					{/if}

					<button
						class="btn preset-filled-primary-500 rounded-full shadow-md transition-shadow hover:shadow-lg"
						on:click={goToNext}
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
			<button
				class="text-surface-900-50 hover:text-surface-900-50-hover text-sm"
				on:click={skipAll}
			>
				Skip All Remaining Accounts
			</button>
		</div>
	{/if}
</div>

