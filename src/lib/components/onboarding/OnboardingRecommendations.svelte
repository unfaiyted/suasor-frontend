<script lang="ts">
	import { Clock, Calendar, ToggleRight, Check } from '@lucide/svelte';
	import {
		ModelsUserConfigRecommendationSyncFrequency,
		ModelsUserConfigRecommendationStrategy
	} from '$lib/api/suasor.v1.d';

	// Props for the component
	interface OnboardingRecommendationsProps {
		recommendationFrequency: string;
		automateRecommendations: boolean;
		mediaTypes: {
			movies: boolean;
			tvShows: boolean;
			music: boolean;
		};
		onComplete: (data: { stepData: {} }) => void;
	}

	let {
		recommendationFrequency,
		automateRecommendations,
		mediaTypes,
		onComplete
	}: OnboardingRecommendationsProps = $props();

	// Local state with Svelte 5 syntax
	let frequency = $state(recommendationFrequency);
	let automate = $state(automateRecommendations);
	let recommendationStrategy = $state<ModelsUserConfigRecommendationStrategy>(
		ModelsUserConfigRecommendationStrategy.similar
	);

	// Available frequency options
	const frequencyOptions = [
		{
			id: 'daily',
			name: 'Daily',
			description: 'Get fresh recommendations every day',
			apiValue: 'FREQUENCY_DAILY' as ModelsUserConfigRecommendationSyncFrequency
		},
		{
			id: 'weekly',
			name: 'Weekly',
			description: 'Get a weekly digest of recommendations',
			apiValue: 'FREQUENCY_WEEKLY' as ModelsUserConfigRecommendationSyncFrequency
		},
		{
			id: 'monthly',
			name: 'Monthly',
			description: 'Monthly curated recommendations',
			apiValue: 'FREQUENCY_MONTHLY' as ModelsUserConfigRecommendationSyncFrequency
		},
		{
			id: 'manual',
			name: 'Manual Only',
			description: 'Only get recommendations when you ask for them',
			apiValue: 'FREQUENCY_MANUAL' as ModelsUserConfigRecommendationSyncFrequency
		}
	];

	// Available strategy options (can be exposed in the UI later if needed)
	const strategyOptions = [
		{
			id: 'ai',
			name: 'AI-Powered',
			description: 'Personalized recommendations using AI',
			apiValue: 'STRATEGY_AI' as ModelsUserConfigRecommendationStrategy
		},
		{
			id: 'recent',
			name: 'Recent Content',
			description: 'Focus on newly released content',
			apiValue: 'STRATEGY_RECENT' as ModelsUserConfigRecommendationStrategy
		},
		{
			id: 'popular',
			name: 'Popular Content',
			description: 'Focus on trending and popular content',
			apiValue: 'STRATEGY_POPULAR' as ModelsUserConfigRecommendationStrategy
		},
		{
			id: 'mixed',
			name: 'Mixed Approach',
			description: 'Balanced mix of recent, popular and personalized',
			apiValue: 'STRATEGY_MIXED' as ModelsUserConfigRecommendationStrategy
		}
	];

	// Automation options
	const automationOptions = {
		movies: {
			enabled: mediaTypes.movies,
			title: 'Movies',
			description: 'Automatically download recommended movies and add them to your collection'
		},
		tvShows: {
			enabled: mediaTypes.tvShows,
			title: 'TV Shows',
			description: 'Automatically download recommended TV shows and add them to your collection'
		},
		music: {
			enabled: mediaTypes.music,
			title: 'Music',
			description: 'Automatically download recommended music and create playlists'
		}
	};

	// Set recommendation frequency
	function setFrequency(value: string) {
		frequency = value;
	}

	// Set recommendation strategy
	function setStrategy(value: ModelsUserConfigRecommendationStrategy) {
		recommendationStrategy = value;
	}

	// Toggle automation
	function toggleAutomation() {
		automate = !automate;
	}

	// Check if form is valid
	function isFormValid() {
		return frequency !== '';
	}

	// Get API value for the selected frequency
	function getApiFrequencyValue() {
		const option = frequencyOptions.find((opt) => opt.id === frequency);
		return option ? option.apiValue : 'FREQUENCY_WEEKLY';
	}

	// Continue to next step
	function handleContinue() {
		if (isFormValid()) {
			onComplete({
				stepData: {
					recommendationFrequency: frequency,
					automateRecommendations: automate,
					recommendationSyncFrequency: getApiFrequencyValue(),
					recommendationStrategy
				}
			});
		}
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="mb-2 text-2xl font-bold">Recommendation Preferences</h2>
		<p class="text-surface-900-50">
			Finally, let's set up how often you'd like to receive recommendations and if you want to
			automate actions.
		</p>
	</div>

	<!-- Recommendation Frequency -->
	<div class="space-y-4">
		<h3 class="text-lg font-medium">How often would you like to receive recommendations?</h3>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each frequencyOptions as option}
				<div
					class={'bg-surface-200-800/30 cursor-pointer rounded-lg border-2 p-5 transition-colors ' +
						(frequency === option.id ? 'border-primary-500' : 'border-transparent')}
					onclick={() => setFrequency(option.id)}
				>
					<div class="flex items-center space-x-3">
						<div
							class={'rounded-full p-2 ' +
								(frequency === option.id ? 'bg-primary-500/20' : 'bg-surface-300-600')}
						>
							{#if option.id === 'daily' || option.id === 'weekly' || option.id === 'monthly'}
								<Calendar
									size={20}
									class={frequency === option.id ? 'text-primary-500' : 'text-surface-900-50'}
								/>
							{:else}
								<Clock
									size={20}
									class={frequency === option.id ? 'text-primary-500' : 'text-surface-900-50'}
								/>
							{/if}
						</div>
						<div>
							<span class="font-medium">{option.name}</span>
							<p class="text-surface-900-50 mt-1 text-sm">
								{option.description}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Automation Options -->
	<div class="space-y-4">
		<h3 class="text-lg font-medium">Automation Options</h3>

		<div
			class={'bg-surface-200-800/30 cursor-pointer rounded-lg border-2 p-5 transition-colors ' +
				(automate ? 'border-primary-500' : 'border-transparent')}
			onclick={toggleAutomation}
		>
			<div class="flex items-center space-x-3">
				<div class={'rounded-full p-2 ' + (automate ? 'bg-primary-500/20' : 'bg-surface-300-600')}>
					<ToggleRight size={20} class={automate ? 'text-primary-500' : 'text-surface-900-50'} />
				</div>
				<div class="flex-1">
					<span class="font-medium">Enable Automation</span>
					<p class="text-surface-900-50 mt-1 text-sm">
						Automatically download and organize recommended media
					</p>
				</div>
				<div
					class={'flex h-5 w-5 items-center justify-center rounded-md border ' +
						(automate ? 'bg-primary-500 border-primary-500' : 'border-surface-900-50')}
				>
					{#if automate}
						<Check size={14} class="text-white" />
					{/if}
				</div>
			</div>
		</div>

		{#if automate}
			<div class="space-y-4 pt-2 pl-4">
				<p class="text-surface-900-50 text-sm">Automation will be enabled for:</p>

				<div class="space-y-3">
					{#each Object.entries(automationOptions) as [key, option]}
						{#if option.enabled}
							<div class="bg-surface-300-600/40 rounded-lg p-4">
								<div class="flex items-start space-x-3">
									<div>
										<Check size={16} class="text-primary-500 mt-0.5" />
									</div>
									<div>
										<span class="font-medium">{option.title}</span>
										<p class="text-surface-900-50 mt-1 text-sm">
											{option.description}
										</p>
									</div>
								</div>
							</div>
						{/if}
					{/each}

					{#if !Object.values(automationOptions).some((opt) => opt.enabled)}
						<p class="text-sm text-amber-500">
							No media types selected for automation. Please go back and select media types.
						</p>
					{/if}
				</div>

				<p class="text-surface-900-50 text-sm italic">
					You can configure more detailed automation settings in the application after setup.
				</p>
			</div>
		{/if}
	</div>

	<!-- Continue button -->
	<div class="text-center">
		<button
			class="btn preset-filled-primary-500 rounded-full px-8 py-3 shadow-md transition-shadow hover:shadow-lg"
			onclick={handleContinue}
			disabled={!isFormValid()}
		>
			Continue
		</button>
	</div>
</div>
