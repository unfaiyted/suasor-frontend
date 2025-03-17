<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Brain, Settings, User, Server, Database, Shield, Film, Radio } from '@lucide/svelte';

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

	// Mock user state - in a real app, you would fetch this from your auth store
	let user = {
		isLoggedIn: true,
		isAdmin: true, // Toggle this to test admin-only sections
		name: 'John Doe',
		email: 'john@example.com'
	};

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
		navidrome: { enabled: false, url: '', username: '', password: '' },
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
		theme: 'system', // 'light', 'dark', 'system'
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

	async function saveSettings(section: string) {
		isLoading = true;
		error = '';
		success = '';

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// In a real app, you would send the appropriate settings to your backend
			console.log(`Saving ${section} settings`);

			success = 'Settings saved successfully';
		} catch (err) {
			error = 'Failed to save settings. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Initialize component
	onMount(() => {
		// Here you would typically fetch the user's current settings
		console.log('Settings component mounted');
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
		{#if activeTab === 'user'}
			<UserSettingsPanel {userSettings} {saveSettings} {isLoading} />
		{:else if activeTab === 'media-servers'}
			<MediaServersPanel {mediaServerIntegrations} {saveSettings} {isLoading} />
		{:else if activeTab === 'automation'}
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
