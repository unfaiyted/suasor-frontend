<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import IconTriangle from '$lib/components/icons/IconTriangle.svelte';
	import { Settings, User, Server, Database, Shield, Film, Radio } from '@lucide/svelte';

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
		{ id: 'media-servers', label: 'Media Servers', icon: Film, adminOnly: false },
		{ id: 'automation', label: 'Automation Tools', icon: Radio, adminOnly: false },
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

	function switchTab(tabId) {
		if (tabs.find((tab) => tab.id === tabId && tab.adminOnly && !user.isAdmin)) {
			error = 'You do not have permission to access this section';
			return;
		}
		error = '';
		success = '';
		activeTab = tabId;
	}

	async function saveSettings(section) {
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
	<div class="mb-6 overflow-x-auto">
		<div class="tabs tabs-bordered flex">
			{#each tabs as tab}
				{#if !tab.adminOnly || (tab.adminOnly && user.isAdmin)}
					<button
						class="tab {activeTab === tab.id
							? 'tab-active !text-primary-500'
							: ''} flex items-center gap-2"
						on:click={() => switchTab(tab.id)}
						aria-selected={activeTab === tab.id}
					>
						<svelte:component this={tab.icon} size={18} />
						<span>{tab.label}</span>
					</button>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Notification Area -->
	{#if error}
		<div class="alert alert-error mb-4" transition:fade>
			<div
				class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
			>
				<IconTriangle />
				<div>
					<p class="font-bold">Error</p>
					<p class="text-xs opacity-60">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if success}
		<div class="alert alert-success mb-4" transition:fade>
			<div
				class="card preset-outlined-success-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
			>
				<div>
					<p class="font-bold">Success</p>
					<p class="text-xs opacity-60">{success}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Content Area -->
	<div
		class="card preset-filled-surface-100-900 relative min-h-[400px] p-6 shadow-xl backdrop-blur-sm"
	>
		{#if activeTab === 'user'}
			<div class="card-header">
				<h3 class="h3 mb-2 font-bold">User Settings</h3>
				<p class="preset-typo-cation">Manage your personal preferences</p>
			</div>

			<div class="card-body py-4">
				<form on:submit|preventDefault={() => saveSettings('user')} class="space-y-4">
					<!-- Theme Preference -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">Theme Preference</span>
							<select class="select !bg-surface-200-800" bind:value={userSettings.theme}>
								<option value="system">System Default</option>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
							</select>
						</label>
					</div>

					<!-- Language -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">Language</span>
							<select class="select !bg-surface-200-800" bind:value={userSettings.language}>
								<option value="en">English</option>
								<option value="es">Spanish</option>
								<option value="fr">French</option>
								<option value="de">German</option>
							</select>
						</label>
					</div>

					<!-- Notifications -->
					<div class="form-control">
						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={userSettings.notifications} class="checkbox" />
							<span>Enable Notifications</span>
						</label>
					</div>

					<!-- Content Filter -->
					<div class="form-control">
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={userSettings.showAdultContent}
								class="checkbox"
							/>
							<span>Show Adult Content</span>
						</label>
					</div>

					<!-- Save Button -->
					<div class="mt-6">
						<button
							type="submit"
							class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
							disabled={isLoading}
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		{:else if activeTab === 'media-servers'}
			<div class="card-header">
				<h3 class="h3 mb-2 font-bold">Media Server Integrations</h3>
				<p class="preset-typo-cation">Connect to your media servers</p>
			</div>

			<div class="card-body py-4">
				<form on:submit|preventDefault={() => saveSettings('media-servers')} class="space-y-6">
					<!-- Emby -->
					<div class="card preset-outlined-surface-500 p-4">
						<h4 class="mb-2 text-lg font-bold">Emby</h4>
						<div class="space-y-3">
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={mediaServerIntegrations.emby.enabled}
									class="checkbox"
								/>
								<span>Enable Emby Integration</span>
							</label>

							{#if mediaServerIntegrations.emby.enabled}
								<label class="label">
									<span class="label-text">Server URL</span>
									<input
										type="url"
										class="input !bg-surface-200-800"
										placeholder="https://emby.example.com"
										bind:value={mediaServerIntegrations.emby.url}
									/>
								</label>

								<label class="label">
									<span class="label-text">API Key</span>
									<input
										type="password"
										class="input !bg-surface-200-800"
										placeholder="••••••••"
										bind:value={mediaServerIntegrations.emby.apiKey}
									/>
								</label>
							{/if}
						</div>
					</div>

					<!-- Jellyfin -->
					<div class="card preset-outlined-surface-500 p-4">
						<h4 class="mb-2 text-lg font-bold">Jellyfin</h4>
						<div class="space-y-3">
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={mediaServerIntegrations.jellyfin.enabled}
									class="checkbox"
								/>
								<span>Enable Jellyfin Integration</span>
							</label>

							{#if mediaServerIntegrations.jellyfin.enabled}
								<label class="label">
									<span class="label-text">Server URL</span>
									<input
										type="url"
										class="input !bg-surface-200-800"
										placeholder="https://jellyfin.example.com"
										bind:value={mediaServerIntegrations.jellyfin.url}
									/>
								</label>

								<label class="label">
									<span class="label-text">API Key</span>
									<input
										type="password"
										class="input !bg-surface-200-800"
										placeholder="••••••••"
										bind:value={mediaServerIntegrations.jellyfin.apiKey}
									/>
								</label>
							{/if}
						</div>
					</div>

					<!-- Navidrome and Plex sections -->
					<!-- Similar structure as Emby and Jellyfin sections -->

					<!-- Save Button -->
					<div class="mt-6">
						<button
							type="submit"
							class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
							disabled={isLoading}
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		{:else if activeTab === 'automation'}
			<div class="card-header">
				<h3 class="h3 mb-2 font-bold">Automation Tools</h3>
				<p class="preset-typo-cation">Connect to your automation services</p>
			</div>

			<div class="card-body py-4">
				<form on:submit|preventDefault={() => saveSettings('automation')} class="space-y-6">
					<!-- Sonarr, Radarr, and Liadrr sections -->
					<!-- Similar structure to the media server integrations -->

					<!-- Save Button -->
					<div class="mt-6">
						<button
							type="submit"
							class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
							disabled={isLoading}
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		{:else if activeTab === 'site' && user.isAdmin}
			<div class="card-header">
				<h3 class="h3 mb-2 font-bold">Site Configuration</h3>
				<p class="preset-typo-cation">Manage global site settings (admin only)</p>
			</div>

			<div class="card-body py-4">
				<form on:submit|preventDefault={() => saveSettings('site')} class="space-y-4">
					<!-- Site settings forms -->
					<!-- Various site configuration options -->

					<!-- Save Button -->
					<div class="mt-6">
						<button
							type="submit"
							class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
							disabled={isLoading}
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		{:else if activeTab === 'server' && user.isAdmin}
			<!-- Server settings (admin only) -->
			<div class="card-header">
				<h3 class="h3 mb-2 font-bold">Server Settings</h3>
				<p class="preset-typo-cation">Configure server behavior (admin only)</p>
			</div>

			<!-- Server settings form -->
		{:else if activeTab === 'database' && user.isAdmin}
			<!-- Database management (admin only) -->
			<div class="card-header">
				<h3 class="h3 mb-2 font-bold">Database Management</h3>
				<p class="preset-typo-cation">Manage database operations (admin only)</p>
			</div>

			<!-- Database management options -->
		{:else if activeTab === 'security' && user.isAdmin}
			<!-- Security settings (admin only) -->
			<div class="card-header">
				<h3 class="h3 mb-2 font-bold">Security Settings</h3>
				<p class="preset-typo-cation">Configure security options (admin only)</p>
			</div>

			<!-- Security settings form -->
		{:else}
			<div class="flex h-64 items-center justify-center">
				<p class="text-lg">Please select a settings category from the tabs above.</p>
			</div>
		{/if}
	</div>
</div>
