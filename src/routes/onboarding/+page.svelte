<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ChevronRight, ChevronLeft, Train } from '@lucide/svelte';
	import OnboardingWelcome from '$lib/components/onboarding/OnboardingWelcome.svelte';
	import OnboardingPreferences from '$lib/components/onboarding/OnboardingPreferences.svelte';
	import OnboardingAccountLinks from '$lib/components/onboarding/OnboardingAccountLinks.svelte';
	import OnboardingAccountSetup from '$lib/components/onboarding/OnboardingAccountSetup.svelte';
	import OnboardingGenres from '$lib/components/onboarding/OnboardingGenres.svelte';
	import OnboardingRecommendations from '$lib/components/onboarding/OnboardingRecommendations.svelte';
	import OnboardingComplete from '$lib/components/onboarding/OnboardingComplete.svelte';

	// Define the onboarding steps
	const steps = [
		'welcome', // Welcome screen
		'preferences', // Media types and AI personality preferences
		'accountLinks', // Select which accounts to link
		'accountSetup', // Setup each selected account
		'genres', // Select genres
		'recommendations', // Configure recommendation frequency and automation
		'complete' // Onboarding complete
	];

	// State management with Svelte 5
	let currentStep = $state(0);
	let totalSteps = $state(steps.length);
	let onboardingData = $state({
		// Media type preferences
		mediaTypes: {
			movies: false,
			tvShows: false,
			music: false
		},
		// AI personality preference
		aiPersonality: 'friendly', // Default: friendly, options: serious, friendly, playful, etc.
		// Account linking selections
		accountsToLink: {
			mediaApplications: [], // Plex, Emby, Jellyfin, Subsonic
			mediaTrackers: [], // Trakt, Last.FM, Spotify
			automationTools: [], // Sonarr, Radarr, Lidarr
			aiEngines: [] // Claude, OpenAI, Ollama
		},
		// Flag to track if user skipped account linking
		skipAccountLinking: false,
		// Account data with API keys, credentials, etc.
		accountData: {},
		// Selected genres
		genres: {
			movies: [],
			tvShows: [],
			music: []
		},
		// Recommendation preferences
		recommendationFrequency: 'weekly',
		automateRecommendations: false
	});

	// Check if a step is accessible
	function isStepAccessible(stepIndex: number) {
		// Always allow going backward or to the current step
		if (stepIndex <= currentStep) return true;

		// For forward progression, make sure the previous step is completed
		if (stepIndex === currentStep + 1) {
			// Check if current step is complete
			const currentStepName = steps[currentStep];
			return isStepComplete(currentStepName);
		}

		// Don't allow skipping steps
		return false;
	}

	// Check if a specific step is complete
	function isStepComplete(stepName: string) {
		switch (stepName) {
			case 'welcome':
				// Welcome screen is always complete once viewed
				return true;

			case 'preferences':
				// At least one media type should be selected and an AI personality chosen
				return (
					Object.values(onboardingData.mediaTypes).some((val) => val) &&
					onboardingData.aiPersonality !== ''
				);

			case 'accountLinks':
				// At least one account should be selected in any category, or user has clicked "skip"
				const hasAnyAccountSelected = Object.values(onboardingData.accountsToLink).some(
					(category) => category.length > 0
				);
				return hasAnyAccountSelected || onboardingData.skipAccountLinking === true;

			case 'accountSetup':
				// All selected accounts should be set up
				// This is handled in the component with skipSetup option
				return true;

			case 'genres':
				// At least one genre should be selected for each selected media type
				for (const [mediaType, isSelected] of Object.entries(onboardingData.mediaTypes)) {
					if (
						isSelected &&
						(!onboardingData.genres[mediaType] || onboardingData.genres[mediaType].length === 0)
					) {
						return false;
					}
				}
				return true;

			case 'recommendations':
				// Recommendation frequency should be selected
				return onboardingData.recommendationFrequency !== '';

			default:
				return true;
		}
	}

	// Navigate to a specific step if accessible
	function goToStep(stepIndex: number) {
		if (isStepAccessible(stepIndex)) {
			currentStep = stepIndex;
		}
	}

	// Navigate to next step
	function goToNextStep() {
		if (currentStep < totalSteps - 1 && isStepAccessible(currentStep + 1)) {
			currentStep += 1;
		} else if (currentStep === totalSteps - 1) {
			completeOnboarding();
		}
	}

	// Navigate to previous step
	function goToPreviousStep() {
		if (currentStep > 0) {
			currentStep -= 1;
		}
	}

	// Save onboarding data and redirect to the main app
	async function completeOnboarding() {
		try {
			// Here you would save the onboarding data to your API
			// await saveOnboardingData(onboardingData);

			// Redirect to the main app
			goto('/');
		} catch (error) {
			console.error('Error saving onboarding data:', error);
		}
	}

	// Skip the onboarding process
	function skipOnboarding() {
		if (
			confirm(
				'Are you sure you want to skip the onboarding process? You can configure these settings later.'
			)
		) {
			goto('/');
		}
	}

	// Handle current step completed event
	function handleStepCompleted(event) {
		const { stepData } = event.detail;

		// Update onboarding data based on the completed step
		const currentStepName = steps[currentStep];
		switch (currentStepName) {
			case 'preferences':
				onboardingData.mediaTypes = stepData.mediaTypes;
				onboardingData.aiPersonality = stepData.aiPersonality;
				break;
			case 'accountLinks':
				onboardingData.accountsToLink = stepData.accountsToLink;
				onboardingData.skipAccountLinking = stepData.skipAccountLinking;
				break;
			case 'accountSetup':
				onboardingData.accountData = stepData.accountData;
				break;
			case 'genres':
				onboardingData.genres = stepData.genres;
				break;
			case 'recommendations':
				onboardingData.recommendationFrequency = stepData.recommendationFrequency;
				onboardingData.automateRecommendations = stepData.automateRecommendations;
				break;
		}

		// Go to next step and scroll to position below header
		goToNextStep();
		window.scrollTo(0, 60);
	}
</script>

<div class="flex min-h-screen flex-col">
	<!-- Header -->
	<header class="flex items-center justify-between bg-transparent p-4">
		<div class="flex items-center">
			<div class="bg-primary-500 mr-2 flex h-8 w-8 items-center justify-center rounded-full">
				<Train size={20} class="text-white" />
			</div>
			<h1 class="text-xl font-semibold">All Aboard!</h1>
		</div>
		<button
			class="text-surface-900-50 hover:text-surface-900-50-hover text-sm"
			on:click={skipOnboarding}
		>
			Skip Setup
		</button>
	</header>

	<!-- New simpler progress indicator with better spacing -->
	{#if currentStep > 0}
		<div class="bg-transparent">
			<div class="mx-auto w-full max-w-3xl px-4 py-2">
				<!-- Current step name -->
				<div class="mb-4 text-center">
					<span class="font-medium">
						{steps[currentStep] === 'welcome'
							? 'Getting Started'
							: steps[currentStep] === 'preferences'
								? 'Preferences'
								: steps[currentStep] === 'accountLinks'
									? 'Connect Accounts'
									: steps[currentStep] === 'accountSetup'
										? 'Account Setup'
										: steps[currentStep] === 'genres'
											? 'Genre Selection'
											: steps[currentStep] === 'recommendations'
												? 'Recommendations'
												: 'Complete'}
					</span>
				</div>

				<!-- Simplified step dots (center-aligned, fixed width) -->
				<div class="mx-auto flex max-w-sm items-center justify-center gap-8 py-4">
					{#each steps.slice(1, -1) as step, idx}
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all"
							class:text-white={currentStep > idx + 1}
							class:text-primary-500={currentStep === idx + 1}
							class:text-surface-900-50={currentStep < idx + 1}
							style={currentStep > idx + 1
								? 'background-color: var(--color-primary-500); border: 2px solid var(--color-primary-500);'
								: currentStep === idx + 1
									? 'background-color: rgba(var(--color-primary-500-rgb), 0.2); border: 2px solid var(--color-primary-500);'
									: 'background-color: var(--color-surface-100-900); border: 2px solid rgba(var(--color-surface-300-600-rgb), 0.5);'}
						>
							{idx + 1}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Main content -->
	<main class="flex flex-grow items-center justify-center p-4">
		<div class="w-full max-w-3xl">
			{#if steps[currentStep] === 'welcome'}
				<OnboardingWelcome on:complete={handleStepCompleted} />
			{:else if steps[currentStep] === 'preferences'}
				<OnboardingPreferences preferences={onboardingData} on:complete={handleStepCompleted} />
			{:else if steps[currentStep] === 'accountLinks'}
				<OnboardingAccountLinks
					accountsToLink={onboardingData.accountsToLink}
					on:complete={handleStepCompleted}
				/>
			{:else if steps[currentStep] === 'accountSetup'}
				<OnboardingAccountSetup
					accountsToLink={onboardingData.accountsToLink}
					accountData={onboardingData.accountData}
					on:complete={handleStepCompleted}
				/>
			{:else if steps[currentStep] === 'genres'}
				<OnboardingGenres
					mediaTypes={onboardingData.mediaTypes}
					genres={onboardingData.genres}
					accountData={onboardingData.accountData}
					on:complete={handleStepCompleted}
				/>
			{:else if steps[currentStep] === 'recommendations'}
				<OnboardingRecommendations
					recommendationFrequency={onboardingData.recommendationFrequency}
					automateRecommendations={onboardingData.automateRecommendations}
					mediaTypes={onboardingData.mediaTypes}
					on:complete={handleStepCompleted}
				/>
			{:else if steps[currentStep] === 'complete'}
				<OnboardingComplete {onboardingData} on:complete={completeOnboarding} />
			{/if}
		</div>
	</main>

	<!-- Navigation buttons - Only showing Back button -->
	{#if currentStep > 0 || steps[currentStep] !== 'welcome'}
		<footer class="bg-transparent p-4">
			<div class="mx-auto w-full max-w-3xl">
				<button
					class="btn preset-outlined rounded-full"
					on:click={goToPreviousStep}
					disabled={currentStep === 0}
				>
					<ChevronLeft size={16} />
					<span>Back</span>
				</button>
			</div>
		</footer>
	{/if}
</div>

