<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Brain, Settings, User, Server, Database, Shield, Film, Radio } from '@lucide/svelte';
	import { GET, PUT } from '$lib/api/client';
	import { authStore, authUser, isAuthenticated } from '$lib/stores/auth';

	import type { UserResponse } from '$lib/api/types';
	// Import components
	import SettingsTabs from '$lib/components/settings/SettingsTabs.svelte';
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
	let user = {
		isLoggedIn: false,
		isAdmin: false,
		name: '',
		email: ''
	};

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
	let activeTab = 'user';

	// Media server integrations
	let mediaServerIntegrations = {
		emby: { enabled: false, url: '', apiKey: '' },
		jellyfin: { enabled: false, url: '', apiKey: '' },
		subsonic: { enabled: false, url: '', username: '', password: '' },
		plex: { enabled: false, url: '', token: '' }
	};

	// Automation tool integrations
	let automationIntegrations = {
		sonarr: { enabled: false, url: '', apiKey: '' },
		radarr: { enabled: false, url: '', apiKey: '' },
		liadrr: { enabled: false, url: '', apiKey: '' }
	};

	// AI integrations
	let aiIntegrations = {
		claude: { enabled: false, url: 'https://api.anthropic.com', apiKey: '' },
		openai: { enabled: false, url: 'https://api.openai.com', apiKey: '' },
		gemini: { enabled: false, url: 'https://generativelanguage.googleapis.com', apiKey: '' },
		ollama: { enabled: false, url: 'http://localhost:11434' }
	};

	// User settings
	let userSettings = {
		theme: 'system',
		language: 'en',
		notifications: true,
		showAdultContent: false
	};

	// Site settings
	let siteSettings = {
		siteName: 'Suasor',
		description: 'Media Management Platform',
		allowRegistration: true,
		requireEmailVerification: true,
		maintenanceMode: false
	};

	// Server settings
	let serverSettings = {
		maxConcurrentJobs: 5,
		backupEnabled: true,
		backupFrequency: 'daily',
		logLevel: 'info'
	};

	// Form submission handling
	let isLoading = false;
	let error = '';
	let success = '';

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
			const response = await GET('/config');
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

				// Update media server integrations
				if (config.integrations) {
					mediaServerIntegrations = {
						emby: {
							enabled: config.integrations.emby?.enabled || false,
							url: `${config.integrations.emby?.ssl ? 'https' : 'http'}://${config.integrations.emby?.host || ''}:${config.integrations.emby?.port || ''}`,
							apiKey: config.integrations.emby?.apiKey || ''
						},
						jellyfin: {
							enabled: config.integrations.jellyfin?.enabled || false,
							url: `${config.integrations.jellyfin?.ssl ? 'https' : 'http'}://${config.integrations.jellyfin?.host || ''}:${config.integrations.jellyfin?.port || ''}`,
							apiKey: config.integrations.jellyfin?.apiKey || ''
						},
						subsonic: {
							enabled: config.integrations.subsonic?.enabled || false,
							url: `${config.integrations.subsonic?.ssl ? 'https' : 'http'}://${config.integrations.subsonic?.host || ''}:${config.integrations.subsonic?.port || ''}`,
							username: config.integrations.subsonic?.username || '',
							password: config.integrations.subsonic?.password || ''
						},
						plex: {
							enabled: config.integrations.plex?.enabled || false,
							url: `${config.integrations.plex?.ssl ? 'https' : 'http'}://${config.integrations.plex?.host || ''}:${config.integrations.plex?.port || ''}`,
							token: config.integrations.plex?.token || ''
						}
					};
				}
			}
		} catch (err) {
			error = 'Failed to load system settings';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	async function saveSettings(section: string) {
		isLoading = true;
		error = '';
		success = '';

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

				// Update Emby config
				config.integrations.emby = {
					enabled: mediaServerIntegrations.emby.enabled,
					host: new URL(mediaServerIntegrations.emby.url || 'http://localhost').hostname,
					port:
						parseInt(new URL(mediaServerIntegrations.emby.url || 'http://localhost:8096').port) ||
						8096,
					ssl: mediaServerIntegrations.emby.url?.startsWith('https') || false,
					apiKey: mediaServerIntegrations.emby.apiKey
				};

				// Update Jellyfin config
				// Similar updates for other media servers

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
			error = err.message || 'Failed to save settings. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Load client data
	async function loadClientData() {
		if (!isAuthenticated) return;

		// Import the clients API here to avoid circular dependencies
		const { clientsApi } = await import('$lib/stores/api');

		try {
			// Load all clients - will be available in the store for child components
			await clientsApi.loadClients();
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
	<NotificationArea {error} {success} />

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
		{:else if activeTab === 'media-servers' && user.isAdmin}
			<MediaServersPanel {mediaServerIntegrations} {saveSettings} {isLoading} />
		{:else if activeTab === 'automation' && user.isAdmin}
			<AutomationPanel {automationIntegrations} {saveSettings} {isLoading} />
		{:else if activeTab === 'site' && user.isAdmin}
			<SiteConfigPanel {siteSettings} {saveSettings} {isLoading} />
		{:else if activeTab === 'server' && user.isAdmin}
			<ServerSettingsPanel {serverSettings} {saveSettings} {isLoading} />
		{:else if activeTab === 'database' && user.isAdmin}
			<DatabasePanel {saveSettings} {isLoading} />
		{:else if activeTab === 'security' && user.isAdmin}
			<SecurityPanel {saveSettings} {isLoading} />
		{:else if activeTab === 'ai-integrations' && user.isAdmin}
			<AIIntegrationsPanel {aiIntegrations} {saveSettings} {isLoading} />
		{:else}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Please select a settings category from the tabs above.</p>
			</div>
		{/if}
	</div>
</div>
