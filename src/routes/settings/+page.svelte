<script lang="ts">
	import { onMount } from 'svelte';
	import { Brain, Settings, User, Server, Database, Shield, Film, Radio } from '@lucide/svelte';
	import { GET, PUT } from '$lib/api/client';
	import { authStore, authUser, isAuthenticated } from '$lib/stores/auth';

	import { TypesMediaClientType, TypesClientType } from '$lib/api/suasor.v1.d';
	import type { UserResponse } from '$lib/api/types';
	// Import components
	import SettingsTabs from '$lib/components/settings/SettingsTabs.svelte';
	import type { ClientRequest } from '$lib/api/types';
	import AIIntegrationsPanel from '$lib/components/settings/AIIntegrationsPanel.svelte';
	import NotificationArea from '$lib/components/util/NotificationArea.svelte';
	import UserSettingsPanel from '$lib/components/settings/UserSettingsPanel.svelte';
	import MediaServersPanel from '$lib/components/settings/MediaServersPanel.svelte';
	import AutomationPanel from '$lib/components/settings/AutomationPanel.svelte';
	import SiteConfigPanel from '$lib/components/settings/SiteConfigPanel.svelte';
	import ServerSettingsPanel from '$lib/components/settings/ServerSettingsPanel.svelte';
	import DatabasePanel from '$lib/components/settings/DatabasePanel.svelte';
	import SecurityPanel from '$lib/components/settings/SecurityPanel.svelte';

	// User state from auth store
	let user = $state({
		isLoggedIn: false,
		isAdmin: false,
		name: '',
		email: ''
	});

	// Subscribe to auth store
	authUser.subscribe((change: UserResponse | null) => {
		if (change) {
			user = {
				isLoggedIn: true,
				isAdmin: change.role === 'admin',
				name: change.username || '',
				email: change.email || ''
			};
		}
	});

	// Define tabs
	const tabs = [
		{ id: 'user', label: 'User Settings', icon: User, adminOnly: false },
		{ id: 'media-servers', label: 'Media Servers', icon: Film, adminOnly: true },
		{ id: 'automation', label: 'Automation Tools', icon: Radio, adminOnly: true },
		{ id: 'ai-integrations', label: 'AI', icon: Brain, adminOnly: true },
		{ id: 'site', label: 'Site Configuration', icon: Settings, adminOnly: true },
		{ id: 'server', label: 'Server Settings', icon: Server, adminOnly: true },
		{ id: 'database', label: 'Database', icon: Database, adminOnly: true },
		{ id: 'security', label: 'Security', icon: Shield, adminOnly: true }
	];

	// Current active tab
	let activeTab = $state('user');

	// User settings
	let userSettings = $state({
		theme: 'system',
		language: 'en',
		notifications: true,
		showAdultContent: false
	});

	// Site settings
	let siteSettings = $state({
		siteName: 'Suasor',
		description: 'Media Management Platform',
		allowRegistration: true,
		requireEmailVerification: true,
		maintenanceMode: false
	});

	// Server settings
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

	let clientsByType = $state<Record<string, ClientRequest[]>>();

	function switchTab(tabId: string) {
		if (tabs.find((tab) => tab.id === tabId && tab.adminOnly && !user.isAdmin)) {
			error = 'You do not have permission to access this section';
			return;
		}
		error = '';
		success = '';
		activeTab = tabId;
	}

	// Fetch user configuration
	async function fetchUserConfig() {
		isLoading = true;
		error = '';

		try {
			const response = await GET('/config/user');
			if (response.data?.data) {
				const config = response.data.data;
				userSettings = {
					theme: config.theme || 'system',
					language: config.language || 'en',
					notifications: config.notificationsEnabled || false,
					showAdultContent: config.includeUnratedContent || false
				};
			}
		} catch (err) {
			error = 'Failed to load user settings';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Fetch system configuration (admin only)
	async function fetchSystemConfig() {
		if (!user.isAdmin) return;

		isLoading = true;
		error = '';

		try {
			const response = await GET('/admin/config');
			if (response.data?.data) {
				const config = response.data.data;

				// Update server settings
				serverSettings = {
					maxConcurrentJobs: config.app?.maxPageSize || 5,
					backupEnabled: true,
					backupFrequency: 'daily',
					logLevel: config.app?.logLevel || 'info'
				};

				// Update site settings
				siteSettings = {
					siteName: config.app?.name || 'Suasor',
					description: 'Media Management Platform',
					allowRegistration: true,
					requireEmailVerification: true,
					maintenanceMode: false
				};
			}
		} catch (err) {
			error = 'Failed to load system settings';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	async function saveSettings(section: string | Record<string, any>) {
		isLoading = true;
		error = '';
		success = '';

		// Handle when section is a configuration object from integration panels
		if (typeof section !== 'string') {
			// The integration panels are handling their own saving logic
			success = 'Settings saved successfully';
			isLoading = false;
			return;
		}

		try {
			if (section === 'user') {
				// Map UI settings to API model
				const userConfig = {
					theme: userSettings.theme,
					language: userSettings.language,
					notificationsEnabled: userSettings.notifications,
					includeUnratedContent: userSettings.showAdultContent
				};

				const response = await PUT('/config/user', {
					body: userConfig
				});

				if (response.error) {
					throw new Error(response.error.message || 'Failed to save user settings');
				}
			} else if (section === 'media-servers' && user.isAdmin) {
				// Prepare system config update with media server settings
				let currentConfig = await GET('/config');
				if (currentConfig.error) throw new Error('Failed to fetch current configuration');

				const config = currentConfig.data?.data || {};
				if (!config.integrations) config.integrations = {};

				// Save the updated config
				const response = await PUT('/config', {
					body: config
				});

				if (response.error) {
					throw new Error(response.error.message || 'Failed to save media server settings');
				}
			}
			// Implement other sections as needed

			success = 'Settings saved successfully';
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to save settings. Please try again.';
			error = errorMessage;
			console.error(err);
		} finally {
			isLoading = false;
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
					if (type in clientsByType) {
						clientsByType[type] = [...clients];
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

	// Initialize component
	onMount(async () => {
		// Check if user is authenticated
		if (isAuthenticated) {
			await Promise.all([fetchUserConfig(), fetchSystemConfig(), loadClientData()]);
		} else {
			error = 'You must be logged in to view settings';
		}
	});
</script>

<div class="container mx-auto px-4 py-10">
	<!-- Header Section -->
	<header class="mb-8">
		<h1 class="h1 text-primary-500 mb-2 font-bold">Settings</h1>
		<p class="preset-typo-subtitle text-lg">Manage your preferences and configurations</p>
	</header>

	<!-- Tab Navigation -->
	<SettingsTabs {tabs} {activeTab} {switchTab} {user} />

	<!-- Notification Area -->
	<!-- <NotificationArea {error} {success} /> -->

	<!-- Content Area -->
	<div
		class="card preset-filled-surface-100-900 relative min-h-[400px] p-6 shadow-xl backdrop-blur-sm"
	>
		{#if isLoading}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Loading settings...</p>
			</div>
		{:else if !isAuthenticated}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Please log in to view settings.</p>
			</div>
		{:else if activeTab === 'user'}
			<UserSettingsPanel {userSettings} {saveSettings} {isLoading} />
		{:else if activeTab === 'media-servers' && user.isAdmin && clientsByType}
			<MediaServersPanel {clientsByType} {saveSettings} {isLoading} />
		{:else if activeTab === 'automation' && user.isAdmin && clientsByType}
			<AutomationPanel {clientsByType} {saveSettings} {isLoading} />
		{:else if activeTab === 'site' && user.isAdmin}
			<SiteConfigPanel {siteSettings} {saveSettings} {isLoading} />
		{:else if activeTab === 'server' && user.isAdmin}
			<ServerSettingsPanel {serverSettings} {saveSettings} {isLoading} />
		{:else if activeTab === 'database' && user.isAdmin}
			<DatabasePanel {saveSettings} {isLoading} />
		{:else if activeTab === 'security' && user.isAdmin}
			<SecurityPanel {saveSettings} {isLoading} />
		{:else if activeTab === 'ai-integrations' && user.isAdmin && clientsByType}
			<AIIntegrationsPanel {clientsByType} {saveSettings} {isLoading} />
		{:else}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Please select a settings category from the tabs above.</p>
			</div>
		{/if}
	</div>
</div>
