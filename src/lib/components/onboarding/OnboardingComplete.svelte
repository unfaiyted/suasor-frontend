<script lang="ts">
	import {
		CheckCircle,
		Film,
		Tv,
		Music,
		Monitor,
		Bot,
		Activity,
		ToggleRight,
		ChevronDown,
		ChevronUp,
		Code
	} from '@lucide/svelte';
	import {
		ModelsUserConfigRecommendationSyncFrequency,
		ModelsUserConfigRecommendationStrategy
	} from '$lib/api/suasor.v1.d';

	// Props for the component
	interface OnboardingCompleteProps {
		onboardingData: any;
		onComplete: (data: { stepData: {} }) => void;
	}

	let { onboardingData, onComplete }: OnboardingCompleteProps = $props();

	// Local state
	let showAdvancedOptions = $state(false);

	// Function to handle completion
	function handleComplete() {
		onComplete({ stepData: {} });
	}

	// Count configured items
	function getConfiguredCount(category: string) {
		if (!onboardingData.accountsToLink[category]) return 0;
		return onboardingData.accountsToLink[category].length;
	}

	// Get total genres selected
	function getTotalGenresSelected() {
		let count = 0;
		if (onboardingData.mediaTypes.movies) count += onboardingData.genres.movies.length;
		if (onboardingData.mediaTypes.tvShows) count += onboardingData.genres.tvShows.length;
		if (onboardingData.mediaTypes.music) count += onboardingData.genres.music.length;
		return count;
	}

	// Get frequency text
	function getFrequencyText() {
		switch (onboardingData.recommendationFrequency) {
			case 'daily':
				return 'Daily';
			case 'weekly':
				return 'Weekly';
			case 'monthly':
				return 'Monthly';
			case 'manual':
				return 'Manual Only';
			default:
				return 'Unknown';
		}
	}

	// Get API frequency enum value
	function getApiFrequencyValue(): ModelsUserConfigRecommendationSyncFrequency {
		switch (onboardingData.recommendationFrequency) {
			case 'daily':
				return ModelsUserConfigRecommendationSyncFrequency.daily;
			case 'weekly':
				return ModelsUserConfigRecommendationSyncFrequency.weekly;
			case 'monthly':
				return ModelsUserConfigRecommendationSyncFrequency.monthly;
			case 'manual':
				return ModelsUserConfigRecommendationSyncFrequency.manual;
			default:
				return ModelsUserConfigRecommendationSyncFrequency.weekly;
		}
	}

	// Toggle advanced options
	function toggleAdvancedOptions() {
		showAdvancedOptions = !showAdvancedOptions;
	}

	// Convert onboarding data to user config format for display
	function getUserConfigPreview() {
		// Format preferred media types
		const preferredMediaTypes = Object.entries(onboardingData.mediaTypes)
			.filter(([_, enabled]) => enabled)
			.map(([type]) => type);

		return {
			// User preferences
			theme: 'system',
			language: 'en',

			// Media preferences
			preferredMediaTypes,
			includeUnratedContent: false,
			includeAdultContent: false,
			preferredGenres: {
				movies: onboardingData.mediaTypes.movies ? onboardingData.genres.movies : [],
				tvShows: onboardingData.mediaTypes.tvShows ? onboardingData.genres.tvShows : [],
				music: onboardingData.mediaTypes.music ? onboardingData.genres.music : []
			},

			// AI preferences
			aiPersonality: onboardingData.aiPersonality,

			// Recommendation settings
			recommendationSyncFrequency: getApiFrequencyValue(),
			recommendationStrategy: 'similar' as ModelsUserConfigRecommendationStrategy,
			automateRecommendations: onboardingData.automateRecommendations,

			// Notification settings
			notificationsEnabled: true
		};
	}

	const configPreview = getUserConfigPreview();
</script>

<div class="space-y-8">
	<div class="text-center">
		<div class="mb-4 flex justify-center">
			<div class="rounded-full bg-green-500/10 p-3 text-green-500">
				<CheckCircle size={48} />
			</div>
		</div>
		<h2 class="mb-2 text-2xl font-bold">Setup Complete!</h2>
		<p class="text-surface-900-50 mx-auto max-w-md">
			Your Suasor account is now set up and ready to go. Here's a summary of your preferences:
		</p>
	</div>

	<!-- Summary -->
	<div class="bg-surface-200-800/30 mx-auto max-w-xl rounded-lg p-6">
		<h3 class="mb-4 text-lg font-medium">Your Setup Summary</h3>

		<!-- Media Types -->
		<div class="mb-6">
			<h4 class="text-surface-900-50 mb-2 text-sm tracking-wide uppercase">Media Types</h4>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				{#if onboardingData.mediaTypes.movies}
					<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
						<Film size={16} class="text-primary-500" />
						<span>Movies</span>
					</div>
				{/if}

				{#if onboardingData.mediaTypes.tvShows}
					<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
						<Tv size={16} class="text-primary-500" />
						<span>TV Shows</span>
					</div>
				{/if}

				{#if onboardingData.mediaTypes.music}
					<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
						<Music size={16} class="text-primary-500" />
						<span>Music</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- AI Personality -->
		<div class="mb-6">
			<h4 class="text-surface-900-50 mb-2 text-sm tracking-wide uppercase">AI Personality</h4>
			<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
				<Bot size={16} class="text-primary-500" />
				<span class="capitalize">{onboardingData.aiPersonality || 'Friendly'}</span>
			</div>
		</div>

		<!-- Connected Accounts -->
		<div class="mb-6">
			<h4 class="text-surface-900-50 mb-2 text-sm tracking-wide uppercase">Connected Accounts</h4>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
					<Monitor size={16} class="text-primary-500" />
					<div>
						<span>Media Servers</span>
						<p class="text-surface-900-50 text-xs">
							{getConfiguredCount('mediaApplications')} connected
						</p>
					</div>
				</div>

				<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
					<Activity size={16} class="text-primary-500" />
					<div>
						<span>Media Trackers</span>
						<p class="text-surface-900-50 text-xs">
							{getConfiguredCount('mediaTrackers')} connected
						</p>
					</div>
				</div>

				<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
					<ToggleRight size={16} class="text-primary-500" />
					<div>
						<span>Automation Tools</span>
						<p class="text-surface-900-50 text-xs">
							{getConfiguredCount('automationTools')} connected
						</p>
					</div>
				</div>

				<div class="bg-surface-300-600/40 flex items-center space-x-3 rounded p-3">
					<Bot size={16} class="text-primary-500" />
					<div>
						<span>AI Engines</span>
						<p class="text-surface-900-50 text-xs">
							{getConfiguredCount('aiEngines')} connected
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Genres and Preferences -->
		<div class="mb-6">
			<h4 class="text-surface-900-50 mb-2 text-sm tracking-wide uppercase">Preferences</h4>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div class="bg-surface-300-600/40 rounded p-3">
					<div class="mb-1 font-medium">Genres</div>
					<p class="text-surface-900-50 text-sm">
						{getTotalGenresSelected()} genres selected across all media types
					</p>
				</div>

				<div class="bg-surface-300-600/40 rounded p-3">
					<div class="mb-1 font-medium">Recommendation Frequency</div>
					<p class="text-surface-900-50 text-sm">
						{getFrequencyText()}
					</p>
				</div>

				<div class="bg-surface-300-600/40 rounded p-3 md:col-span-2">
					<div class="mb-1 font-medium">Automation</div>
					<p class="text-surface-900-50 text-sm">
						{onboardingData.automateRecommendations
							? 'Enabled - Suasor will automatically process your recommendations'
							: "Disabled - You'll need to manually process recommendations"}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Advanced Options - Configuration Preview -->
	<div class="mx-auto max-w-xl">
		<button
			onclick={toggleAdvancedOptions}
			class="bg-surface-300-600/30 hover:bg-surface-300-600/40 flex w-full items-center justify-between rounded-lg p-4 transition-colors"
		>
			<div class="flex items-center space-x-2">
				<Code size={18} class="text-primary-500" />
				<span class="font-medium">View Configuration Details</span>
			</div>
			{#if showAdvancedOptions}
				<ChevronUp size={18} />
			{:else}
				<ChevronDown size={18} />
			{/if}
		</button>

		{#if showAdvancedOptions}
			<div class="bg-surface-200-800/30 mt-4 overflow-auto rounded-lg p-6">
				<h4 class="text-surface-900-50 mb-4 text-sm font-medium">User Configuration</h4>
				<pre class="bg-surface-300-600/40 overflow-auto rounded p-4 text-xs">{JSON.stringify(
						configPreview,
						null,
						2
					)}</pre>
				<p class="text-surface-900-50 mt-2 text-xs">
					This is the configuration that will be saved to your account. You can adjust these
					settings later in your user preferences.
				</p>
			</div>
		{/if}
	</div>

	<!-- Get Started Button -->
	<div class="pt-4 text-center">
		<p class="text-surface-900-50 mb-4">You're all set! Click below to start using Suasor.</p>
		<button
			class="btn preset-filled-primary-500 rounded-full px-10 py-3 text-lg shadow-md transition-shadow hover:shadow-lg"
			onclick={handleComplete}
		>
			Get Started
		</button>
	</div>
</div>
