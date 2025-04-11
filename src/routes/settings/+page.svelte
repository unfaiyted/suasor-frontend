<script lang="ts">
	import { onMount } from 'svelte';
	import { Brain, Settings, User, Server, Database, Shield, Film, Radio } from '@lucide/svelte';
	import { authUser, isAuthenticated } from '$lib/stores/auth';
	import configApi, {
		userConfig as userConfigStore,
		systemConfig as systemConfigStore
	} from '$lib/stores/config';

	import { TypesClientType } from '$lib/api/suasor.v1.d';
	import type { UserResponse, UserConfig, Configuration as SystemConfig } from '$lib/api/types';

	// Import components
	import SettingsTabs from '$lib/components/settings/SettingsTabs.svelte';
	import type { ClientRequest } from '$lib/api/types';
	import NotificationArea from '$lib/components/util/NotificationArea.svelte';
	import UserSettingsPanel from '$lib/components/settings/UserSettingsPanel.svelte';
	import IntegrationsTabPanel from '$lib/components/settings/IntegrationsTabPanel.svelte';
	import SiteConfigPanel from '$lib/components/settings/SiteConfigPanel.svelte';
	import ServerSettingsPanel from '$lib/components/settings/ServerSettingsPanel.svelte';
	import DatabasePanel from '$lib/components/settings/DatabasePanel.svelte';
	import SecurityPanel from '$lib/components/settings/SecurityPanel.svelte';

	// User state from auth store
	let user = $state({
		isLoggedIn: false,
		isAdmin: false,
		name: '',
		email: '',
		username: '',
		avatar: ''
	});

	// Current active tab
	let activeTab = $state('user');

	let siteSettings = $state({
		siteName: 'Suasor',
		description: 'Media Management Platform',
		allowRegistration: true,
		requireEmailVerification: true,
		maintenanceMode: false
	});

	let serverSettings = $state({
		maxConcurrentJobs: 5,
		backupEnabled: true,
		backupFrequency: 'daily',
		logLevel: 'info'
	});

	// Form submission handling
	let isLoading = $state(false);
	let error = $state('');
	let success = $state('');

	let userConfig = $state<UserConfig>();
	let systemConfig = $state<SystemConfig>();

	let clientsByType = $state<Record<string, ClientRequest[]>>();

	// Subscribe to auth store
	authUser.subscribe((change: UserResponse | null) => {
		if (change) {
			user = {
				isLoggedIn: true,
				isAdmin: change.role === 'admin',
				name: change.username || '',
				email: change.email || '',
				avatar: change.avatar || '',
				username: change.username || ''
			};
		}
	});

	// Track if we already processed initial configs to prevent loops
	// let userConfigProcessed = false;

	userConfigStore.subscribe((config) => {
		if (config) {
			// userConfigProcessed = true;
			userConfig = config;
		}
	});

	// systemConfigProcessed flag is already declared above
	systemConfigStore.subscribe((config) => {
		if (config) {
			systemConfig = config;
			// Don't set systemConfigProcessed here - that's handled by the effect
		}
	});

	// Define tabs
	const tabs = [
		{ id: 'user', label: 'User Settings', icon: User, adminOnly: false },
		{ id: 'integrations', label: 'Integrations', icon: Film, adminOnly: true },
		{ id: 'site', label: 'Site Configuration', icon: Settings, adminOnly: true },
		{ id: 'server', label: 'Server Settings', icon: Server, adminOnly: true },
		{ id: 'database', label: 'Database', icon: Database, adminOnly: true },
		{ id: 'security', label: 'Security', icon: Shield, adminOnly: true }
	];

	// Subscribe to system config from the store
	// Track if we already processed initial config to prevent loops
	let systemConfigProcessed = false;

	$effect(() => {
		if (systemConfig && !systemConfigProcessed) {
			systemConfigProcessed = true;

			// Update server settings
			serverSettings = {
				maxConcurrentJobs: systemConfig.app?.maxPageSize || 5,
				backupEnabled: true,
				backupFrequency: 'daily',
				logLevel: systemConfig.app?.logLevel || 'info'
			};

			// Update site settings
			siteSettings = {
				siteName: systemConfig.app?.name || 'Suasor',
				description: 'Media Management Platform',
				allowRegistration: true,
				requireEmailVerification: true,
				maintenanceMode: false
			};
		}
	});

	function switchTab(tabId: string) {
		if (tabs.find((tab) => tab.id === tabId && tab.adminOnly && !user.isAdmin)) {
			error = 'You do not have permission to access this section';
			return;
		}
		error = '';
		success = '';
		activeTab = tabId;
	}

	// Fetch user configuration using the config store
	async function fetchUserConfig() {
		try {
			await configApi.loadUserConfig();
		} catch (err) {
			error = 'Failed to load user settings';
			console.error(err);
		}
	}

	// Fetch system configuration (admin only) using the config store
	async function fetchSystemConfig() {
		if (!user.isAdmin) return;

		try {
			await configApi.loadSystemConfig();
		} catch (err) {
			error = 'Failed to load system settings';
			console.error(err);
		}
	}
	// Handler for updating a single user setting
	async function updateUserSetting(key: string, value: any) {
		console.log('Updating user setting:', key, value);
	}

	// Save user settings (used by the UserSettingsPanel)
	async function saveUserConfig(userConfig: UserConfig) {
		error = '';

		try {
			console.log('New config settings to apply:', userConfig);

			// Save the complete merged config to the backend
			await configApi.saveUserConfig(userConfig);

			success = 'Settings saved successfully';

			// Clear success message after a delay
			setTimeout(() => {
				success = '';
			}, 3000);
		} catch (err) {
			error = `Failed to save settings: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error('Error saving settings:', err);

			// Clear error after a delay
			setTimeout(() => {
				error = '';
			}, 5000);
		}
	}

	async function saveUser(user: UserResponse) {
		console.log('Saving user settings:', user);
		authUser.update(() => user);
	}

	// Save system settings
	async function saveSystemSettings(section: string, data: SystemConfig) {
		error = '';

		try {
			if (section === 'site' && user.isAdmin) {
				if (systemConfig) {
					const updatedConfig: SystemConfig = {
						...systemConfig,
						app: {
							...systemConfig.app,
							name: data?.app?.name || 'Suasor'
							// Add other site settings here as needed
						}
					};
					await configApi.saveSystemConfig(updatedConfig);
					success = 'Site settings saved successfully';
				}
			} else if (section === 'server' && user.isAdmin) {
				if (systemConfig) {
					const updatedConfig = {
						...systemConfig,
						app: {
							...systemConfig.app,
							logLevel: data.app.logLevel,
							maxPageSize: data.maxConcurrentJobs
							// Add other server settings here as needed
						}
					};
					await configApi.saveSystemConfig(updatedConfig);
					success = 'Server settings saved successfully';
				}
			} else if (
				!section.includes('media-servers') &&
				!section.includes('automation') &&
				!section.includes('ai-integrations')
			) {
				// Don't show global success messages for integration panels
				// since they have their own success indicators
				success = `${section} settings saved successfully`;
			}
		} catch (err) {
			error = `Failed to save ${section} settings: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error(`Error saving ${section} settings:`, err);
		}
	}

	// Load client data
	async function loadClientData() {
		if (!isAuthenticated) return;

		// Import the clients API here to avoid circular dependencies
		const { clientsApi, clientsByTypeMap } = await import('$lib/stores/api');

		try {
			// Load all clients
			await clientsApi.loadClients();

			// Subscribe to the clientsByType store to get organized data
			const unsubscribe = clientsByTypeMap.subscribe((organizedClients) => {
				// Initialize with all possible client types
				clientsByType = {
					[TypesClientType.ClientTypeEmby]: [],
					[TypesClientType.ClientTypeJellyfin]: [],
					[TypesClientType.ClientTypeSubsonic]: [],
					[TypesClientType.ClientTypePlex]: [],
					[TypesClientType.ClientTypeSonarr]: [],
					[TypesClientType.ClientTypeLidarr]: [],
					[TypesClientType.ClientTypeRadarr]: [],
					[TypesClientType.ClientTypeClaude]: [],
					[TypesClientType.ClientTypeOpenAI]: [],
					[TypesClientType.ClientTypeOllama]: [],
					[TypesClientType.ClientTypeUnknown]: []
				};

				// Copy over any clients from organized data
				Object.entries(organizedClients).forEach(([type, clients]) => {
					if (clientsByType && clients.length > 0) {
						if (type in clientsByType) {
							clientsByType[type] = [...clients];
						}
					}
				});
			});

			// Clean up subscription
			unsubscribe();
		} catch (err) {
			error = 'Failed to load client integrations';
			console.error(err);
		}
	}

	// Get the URL parameters to determine which tab to show
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	onMount(async () => {
		// Check if user is authenticated
		if (isAuthenticated) {
			await Promise.all([fetchUserConfig(), fetchSystemConfig(), loadClientData()]);

			// Check for tab in URL query parameters first
			const tabParam = page.url.searchParams.get('tab');
			let targetTab: string | null = tabParam;

			// Check for subtab parameter (for integration subtabs)
			const subtabParam = page.url.searchParams.get('subtab');
			// We'll store this in sessionStorage for the integrations component to use
			if (subtabParam && browser && targetTab === 'integrations') {
				sessionStorage.setItem('integrationsSubtab', subtabParam);
			}

			// If not in query params, try to get tab from URL path
			if (!targetTab) {
				const path = page.url.pathname;
				if (path !== '/settings') {
					const pathParts = path.split('/');
					if (pathParts.length > 2) {
						targetTab = pathParts[2];
					}
				}
			}

			// Set the active tab if we found one and the user has permission
			if (targetTab) {
				const tab = tabs.find((t) => t.id === targetTab);
				if (tab && (!tab.adminOnly || user.isAdmin)) {
					activeTab = targetTab;
				}
			}
		} else {
			error = 'You must be logged in to view settings';
		}
	});
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header Section -->
	<header class="mb-8">
		<h1 class="h1 text-primary-500 mb-2 font-bold">Settings</h1>
		<p class="preset-typo-subtitle text-lg">Manage your preferences and configurations</p>
	</header>

	<!-- Tab Navigation -->
	<SettingsTabs {tabs} {activeTab} {switchTab} {user} />

	<!-- Notification Area -->
	<NotificationArea {error} success={activeTab === 'integrations' ? '' : success} />

	<!-- Content Area -->
	<div
		class="card preset-filled-surface-100-900 relative min-h-[400px] p-6 shadow-xl backdrop-blur-sm"
	>
		{#if isLoading && !userConfig}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Loading settings...</p>
			</div>
		{:else if !isAuthenticated}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Please log in to view settings.</p>
			</div>
		{:else if activeTab === 'user' && userConfig}
			<UserSettingsPanel
				config={userConfig}
				{user}
				onUpdateUser={saveUser}
				onUpdateConfig={saveUserConfig}
				{isLoading}
			/>
		{:else if activeTab === 'integrations' && user.isAdmin && clientsByType}
			<IntegrationsTabPanel
				{clientsByType}
				onSave={(section, data) => {
					success = ''; // Clear any success message when saving integration settings
					saveSystemSettings(section, data);
				}}
				{isLoading}
			/>
		{:else if activeTab === 'site' && user.isAdmin}
			<SiteConfigPanel
				{siteSettings}
				onSave={(data: SystemConfig) => saveSystemSettings('site', data)}
				{isLoading}
			/>
		{:else if activeTab === 'server' && user.isAdmin}
			<ServerSettingsPanel
				{serverSettings}
				onSave={(data: SystemConfig) => saveSystemSettings('server', data)}
				{isLoading}
			/>
		{:else if activeTab === 'database' && user.isAdmin}
			<DatabasePanel
				onSave={(data: SystemConfig) => saveSystemSettings('database', data)}
				{isLoading}
			/>
		{:else if activeTab === 'security' && user.isAdmin}
			<SecurityPanel
				onSave={(data: SystemConfig) => saveSystemSettings('security', data)}
				{isLoading}
			/>
		{:else}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Please select a settings category from the tabs above.</p>
			</div>
		{/if}
	</div>
</div>
