<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Monitor, Activity, ToggleRight, Bot, Plus, Check } from '@lucide/svelte';

	// Props for the component
	interface OnboardingAccountLinksProps {
		accountsToLink: {
			mediaApplications: string[];
			mediaTrackers: string[];
			automationTools: string[];
			aiEngines: string[];
		};
	}

	let { accountsToLink } = $props<OnboardingAccountLinksProps>();

	// Local state with Svelte 5 syntax
	let selectedAccounts = $state({
		mediaApplications: [...accountsToLink.mediaApplications],
		mediaTrackers: [...accountsToLink.mediaTrackers],
		automationTools: [...accountsToLink.automationTools],
		aiEngines: [...accountsToLink.aiEngines]
	});

	let expandedCategory = $state('');
	let skipAccountLinking = $state(false);

	// Available account options by category
	const accountOptions = {
		mediaApplications: [
			{ id: 'plex', name: 'Plex', description: 'Media server for movies, TV, music, and photos' },
			{ id: 'emby', name: 'Emby', description: 'Media server that organizes video and music' },
			{ id: 'jellyfin', name: 'Jellyfin', description: 'Free Software Media System' },
			{ id: 'subsonic', name: 'Subsonic', description: 'Media streaming server for music' }
		],
		mediaTrackers: [
			{ id: 'trakt', name: 'Trakt', description: 'Automatically track TV & movies you watch' },
			{ id: 'lastfm', name: 'Last.FM', description: 'Music tracking and recommendations' },
			{ id: 'spotify', name: 'Spotify', description: 'Digital music streaming service' }
		],
		automationTools: [
			{ id: 'sonarr', name: 'Sonarr', description: 'Smart PVR for TV shows' },
			{ id: 'radarr', name: 'Radarr', description: 'Movie collection manager' },
			{ id: 'lidarr', name: 'Lidarr', description: 'Music collection manager' }
		],
		aiEngines: [
			{ id: 'claude', name: 'Claude', description: "Anthropic's AI assistant" },
			{ id: 'openai', name: 'OpenAI', description: 'GPT models for content generation' },
			{ id: 'ollama', name: 'Ollama', description: 'Local large language models' }
		]
	};

	// Icons for each category
	const categoryIcons = {
		mediaApplications: Monitor,
		mediaTrackers: Activity,
		automationTools: ToggleRight,
		aiEngines: Bot
	};

	// Event dispatcher to notify parent component when step is completed
	const dispatch = createEventDispatcher();

	// Toggle account selection
	function toggleAccount(category: string, accountId: string) {
		const index = selectedAccounts[category].indexOf(accountId);
		if (index === -1) {
			selectedAccounts[category] = [...selectedAccounts[category], accountId];
		} else {
			selectedAccounts[category] = selectedAccounts[category].filter((id) => id !== accountId);
		}
	}

	// Toggle category expansion
	function toggleCategory(category: string) {
		expandedCategory = expandedCategory === category ? '' : category;
	}

	// Handle skip account linking
	function handleSkipLinking() {
		skipAccountLinking = true;
		dispatch('complete', {
			stepData: {
				accountsToLink: selectedAccounts,
				skipAccountLinking: true
			}
		});
		// Scroll to position below header
		window.scrollTo(0, 70);
	}

	// Check if any accounts are selected
	function hasSelectedAccounts() {
		return Object.values(selectedAccounts).some((category) => category.length > 0);
	}

	// Continue to next step
	function handleContinue() {
		dispatch('complete', {
			stepData: {
				accountsToLink: selectedAccounts,
				skipAccountLinking: false
			}
		});
		// Scroll to position below header
		window.scrollTo(0, 70);
	}

	// Get total selected accounts count
	function getTotalSelectedAccounts() {
		return Object.values(selectedAccounts).reduce((total, accounts) => total + accounts.length, 0);
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="mb-2 text-2xl font-bold">Connect Your Accounts</h2>
		<p class="text-surface-900-50">
			Link your media and automation accounts to get personalized recommendations and enable
			automation features.
		</p>
	</div>

	<!-- Account Categories -->
	<div class="space-y-4">
		<!-- Media Applications -->
		<div class="bg-surface-200-800/30 border-surface-300-600 overflow-hidden rounded-lg border">
			<div
				class="flex cursor-pointer items-center justify-between p-4"
				onclick={() => toggleCategory('mediaApplications')}
			>
				<div class="flex items-center space-x-3">
					<div class="bg-primary-500/20 rounded-full p-2">
						<Monitor size={20} class="text-primary-500" />
					</div>
					<div>
						<h3 class="font-medium">Media Servers</h3>
						<p class="text-surface-900-50 text-sm">Plex, Emby, Jellyfin, Subsonic</p>
					</div>
				</div>
				<div class="flex items-center space-x-2">
					{#if selectedAccounts.mediaApplications.length > 0}
						<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-1 text-xs">
							{selectedAccounts.mediaApplications.length} selected
						</span>
					{/if}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class={'transition-transform ' +
							(expandedCategory === 'mediaApplications' ? 'rotate-180' : '')}
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</div>
			</div>

			{#if expandedCategory === 'mediaApplications'}
				<div class="border-surface-300-600 border-t p-4">
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each accountOptions.mediaApplications as account}
							<div
								class={'flex cursor-pointer items-center rounded-lg p-3 transition-colors ' +
									(selectedAccounts.mediaApplications.includes(account.id)
										? 'bg-primary-500/20 border-primary-500/50 border'
										: 'bg-surface-300-600/50 border border-transparent')}
								onclick={() => toggleAccount('mediaApplications', account.id)}
							>
								<div class="min-w-0 flex-1">
									<h4 class="truncate font-medium">{account.name}</h4>
									<p class="text-surface-900-50 truncate text-sm">{account.description}</p>
								</div>
								<div
									class={'flex-shrink-0 rounded-full p-1 ' +
										(selectedAccounts.mediaApplications.includes(account.id)
											? 'bg-primary-500 text-white'
											: 'bg-surface-300-600')}
								>
									{#if selectedAccounts.mediaApplications.includes(account.id)}
										<Check size={16} />
									{:else}
										<Plus size={16} />
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Media Trackers -->
		<div class="bg-surface-200-800/30 border-surface-300-600 overflow-hidden rounded-lg border">
			<div
				class="flex cursor-pointer items-center justify-between p-4"
				onclick={() => toggleCategory('mediaTrackers')}
			>
				<div class="flex items-center space-x-3">
					<div class="bg-primary-500/20 rounded-full p-2">
						<Activity size={20} class="text-primary-500" />
					</div>
					<div>
						<h3 class="font-medium">Media Trackers</h3>
						<p class="text-surface-900-50 text-sm">Trakt, Last.FM, Spotify</p>
					</div>
				</div>
				<div class="flex items-center space-x-2">
					{#if selectedAccounts.mediaTrackers.length > 0}
						<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-1 text-xs">
							{selectedAccounts.mediaTrackers.length} selected
						</span>
					{/if}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class={'transition-transform ' +
							(expandedCategory === 'mediaTrackers' ? 'rotate-180' : '')}
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</div>
			</div>

			{#if expandedCategory === 'mediaTrackers'}
				<div class="border-surface-300-600 border-t p-4">
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each accountOptions.mediaTrackers as account}
							<div
								class={'flex cursor-pointer items-center rounded-lg p-3 transition-colors ' +
									(selectedAccounts.mediaTrackers.includes(account.id)
										? 'bg-primary-500/20 border-primary-500/50 border'
										: 'bg-surface-300-600/50 border border-transparent')}
								onclick={() => toggleAccount('mediaTrackers', account.id)}
							>
								<div class="min-w-0 flex-1">
									<h4 class="truncate font-medium">{account.name}</h4>
									<p class="text-surface-900-50 truncate text-sm">{account.description}</p>
								</div>
								<div
									class={'flex-shrink-0 rounded-full p-1 ' +
										(selectedAccounts.mediaTrackers.includes(account.id)
											? 'bg-primary-500 text-white'
											: 'bg-surface-300-600')}
								>
									{#if selectedAccounts.mediaTrackers.includes(account.id)}
										<Check size={16} />
									{:else}
										<Plus size={16} />
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Automation Tools -->
		<div class="bg-surface-200-800/30 border-surface-300-600 overflow-hidden rounded-lg border">
			<div
				class="flex cursor-pointer items-center justify-between p-4"
				onclick={() => toggleCategory('automationTools')}
			>
				<div class="flex items-center space-x-3">
					<div class="bg-primary-500/20 rounded-full p-2">
						<ToggleRight size={20} class="text-primary-500" />
					</div>
					<div>
						<h3 class="font-medium">Automation Tools</h3>
						<p class="text-surface-900-50 text-sm">Sonarr, Radarr, Lidarr</p>
					</div>
				</div>
				<div class="flex items-center space-x-2">
					{#if selectedAccounts.automationTools.length > 0}
						<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-1 text-xs">
							{selectedAccounts.automationTools.length} selected
						</span>
					{/if}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class={'transition-transform ' +
							(expandedCategory === 'automationTools' ? 'rotate-180' : '')}
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</div>
			</div>

			{#if expandedCategory === 'automationTools'}
				<div class="border-surface-300-600 border-t p-4">
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each accountOptions.automationTools as account}
							<div
								class={'flex cursor-pointer items-center rounded-lg p-3 transition-colors ' +
									(selectedAccounts.automationTools.includes(account.id)
										? 'bg-primary-500/20 border-primary-500/50 border'
										: 'bg-surface-300-600/50 border border-transparent')}
								onclick={() => toggleAccount('automationTools', account.id)}
							>
								<div class="min-w-0 flex-1">
									<h4 class="truncate font-medium">{account.name}</h4>
									<p class="text-surface-900-50 truncate text-sm">{account.description}</p>
								</div>
								<div
									class={'flex-shrink-0 rounded-full p-1 ' +
										(selectedAccounts.automationTools.includes(account.id)
											? 'bg-primary-500 text-white'
											: 'bg-surface-300-600')}
								>
									{#if selectedAccounts.automationTools.includes(account.id)}
										<Check size={16} />
									{:else}
										<Plus size={16} />
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- AI Engines -->
		<div class="bg-surface-200-800/30 border-surface-300-600 overflow-hidden rounded-lg border">
			<div
				class="flex cursor-pointer items-center justify-between p-4"
				onclick={() => toggleCategory('aiEngines')}
			>
				<div class="flex items-center space-x-3">
					<div class="bg-primary-500/20 rounded-full p-2">
						<Bot size={20} class="text-primary-500" />
					</div>
					<div>
						<h3 class="font-medium">AI Engines</h3>
						<p class="text-surface-900-50 text-sm">Claude, OpenAI, Ollama</p>
					</div>
				</div>
				<div class="flex items-center space-x-2">
					{#if selectedAccounts.aiEngines.length > 0}
						<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-1 text-xs">
							{selectedAccounts.aiEngines.length} selected
						</span>
					{/if}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class={'transition-transform ' + (expandedCategory === 'aiEngines' ? 'rotate-180' : '')}
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</div>
			</div>

			{#if expandedCategory === 'aiEngines'}
				<div class="border-surface-300-600 border-t p-4">
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each accountOptions.aiEngines as account}
							<div
								class={'flex cursor-pointer items-center rounded-lg p-3 transition-colors ' +
									(selectedAccounts.aiEngines.includes(account.id)
										? 'bg-primary-500/20 border-primary-500/50 border'
										: 'bg-surface-300-600/50 border border-transparent')}
								onclick={() => toggleAccount('aiEngines', account.id)}
							>
								<div class="min-w-0 flex-1">
									<h4 class="truncate font-medium">{account.name}</h4>
									<p class="text-surface-900-50 truncate text-sm">{account.description}</p>
								</div>
								<div
									class={'flex-shrink-0 rounded-full p-1 ' +
										(selectedAccounts.aiEngines.includes(account.id)
											? 'bg-primary-500 text-white'
											: 'bg-surface-300-600')}
								>
									{#if selectedAccounts.aiEngines.includes(account.id)}
										<Check size={16} />
									{:else}
										<Plus size={16} />
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Summary and Continue buttons -->
	<div class="flex flex-col items-center justify-between gap-4 pt-4 md:flex-row">
		<div class="text-center md:text-left">
			{#if hasSelectedAccounts()}
				<p class="text-surface-900-50">
					You've selected {getTotalSelectedAccounts()} account{getTotalSelectedAccounts() !== 1
						? 's'
						: ''} to connect
				</p>
			{:else}
				<p class="text-surface-900-50">You haven't selected any accounts yet</p>
			{/if}
		</div>

		<div class="flex flex-col gap-3 md:flex-row">
			<button class="btn preset-outlined-primary-500 rounded-full" onclick={handleSkipLinking}>
				Skip for Now
			</button>
			<button
				class="btn preset-filled-primary-500 rounded-full shadow-md transition-shadow hover:shadow-lg"
				onclick={handleContinue}
				disabled={!hasSelectedAccounts()}
			>
				Continue
			</button>
		</div>
	</div>
</div>

