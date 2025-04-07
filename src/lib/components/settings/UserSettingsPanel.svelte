<script lang="ts">
	import { Home, Film, Sparkles } from '@lucide/svelte';
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';
	import {
		ModelsUserConfigRecommendationSyncFrequency,
		ModelsUserConfigRecommendationStrategy,
		ModelsUserConfigTheme,
		ModelsUserConfigAiChatPersonality,
		ModelsUserConfigRecommendationSyncListType,
		ModelsUserConfigPreferredContentLength
	} from '$lib/api/suasor.v1.d';
	import type { UserConfig } from '$lib/api/types';

	// Import the tab components
	import InterfaceSettingsTab from './InterfaceSettingsTab.svelte';
	import ContentSettingsTab from './ContentSettingsTab.svelte';
	import RecommendationsTab from './RecommendationsTab.svelte';

	interface UserSettingsPanelProps {
		config: UserConfig;
		onSave: (config: UserConfig) => Promise<void>;
		onUpdateSetting: () => Promise<void>;
		isLoading: boolean;
	}

	// Props - receive the config object and callbacks instead of individual values
	const { config, onSave, onUpdateSetting, isLoading = false }: UserSettingsPanelProps = $props();

	// Create a local form state
	let formState = $state<UserConfig>({
		// Interface settings
		theme: ModelsUserConfigTheme.system,
		language: 'en',
		contentTypes: 'movies,series,music',
		itemsPerPage: 20,

		// Notifications settings
		notificationsEnabled: false,
		notifyOnNewRecommendations: false,
		emailNotifications: false,
		notifyOnSync: false,

		aiChatPersonality: ModelsUserConfigAiChatPersonality.friendly,

		// Content settings
		showAdultContent: false,
		includeUnratedContent: false,
		minContentRating: 'G',
		maxContentRating: 'R',
		preferredAudioLanguages: 'en',
		preferredGenres: { movies: [], series: [], music: [] },
		excludedGenres: { movies: [], series: [], music: [] },
		preferredContentLength: ModelsUserConfigPreferredContentLength.medium,

		// Recommendation settings
		recommendationSyncFrequency: ModelsUserConfigRecommendationSyncFrequency.weekly,
		recommendationStrategy: ModelsUserConfigRecommendationStrategy.balanced,
		recommendationListPrefix: 'AI:',
		recommendationContentTypes: 'movies,series,music',
		recommendationSyncListType: ModelsUserConfigRecommendationSyncListType.collection,
		recommendationSyncEnabled: false,
		recommendationMinRating: 5,
		recommendationMaxAge: 40,

		// Max recommendations to make at the specified List Creation Frequency
		// so 20 recommendations per week
		maxRecommendations: {
			movies: 20,
			series: 20,
			music: 20
		},

		discoveryModeEnabled: true,
		discoveryModeRatio: 0.5
	});

	// Helper function to update form state from config
	// function updateFormStateFromConfig() {
	// 	// Skip update if no config
	// 	if (!config) return;
	//
	// 	// Create new form state object
	// 	const newFormState = {
	// 		// Interface settings
	// 		theme: config.theme || 'system',
	// 		language: config.language || 'en',
	// 		notifications: config.notificationsEnabled !== undefined ? config.notificationsEnabled : true,
	// 		aiPersonality: config.aiChatPersonality || 'friendly',
	//
	// 		// Content settings
	// 		includeAdultContent: config.includeAdultContent || false,
	// 		includeUnratedContent: config.includeUnratedContent || false,
	// 		preferredMediaTypes: config.preferredMediaTypes || [],
	// 		preferredGenres: config.preferredGenres || { movies: [], tvShows: [], music: [] },
	// 		excludedGenres: config.excludedGenres || { movies: [], tvShows: [], music: [] },
	// 		maxRecommendations: config.maxRecommendations || {
	// 			movieRecommendations: 20,
	// 			seriesRecommendations: 20,
	// 			musicRecommendations: 20
	// 		},
	//
	// 		// Recommendation settings
	// 		recommendationSyncFrequency:
	// 			config.recommendationSyncFrequency || ModelsUserConfigRecommendationSyncFrequency.weekly,
	// 		recommendationStrategy:
	// 			config.recommendationStrategy || ModelsUserConfigRecommendationStrategy.balanced,
	// 		automateRecommendations: config.automateRecommendations || false,
	// 		automationMinimumRating: config.automationMinimumRating || 7,
	// 		automationWeeklyLimit: config.automationWeeklyLimit || 10,
	// 		enableDiscovery: config.enableDiscovery !== undefined ? config.enableDiscovery : true,
	// 		discoveryRatio: config.discoveryRatio || 30
	// 	};
	// }

	// For UI organization
	let activeTab = $state('interface');
	let isSaving = $state(false);

	// Handle updating a single setting
	// async function handleUpdateSetting(key: string, value) {
	// 	// Skip if value hasn't changed
	// 	if (isSaving) {
	// 		console.log('Skipping update while previous update is in progress');
	// 		return;
	// 	}
	//
	// 	// Set saving state to prevent multiple concurrent saves
	// 	isSaving = true;
	//
	// 	try {
	// 		// Update local form state immediately for responsive UI
	// 		// First create a copy to avoid mutating directly
	// 		const newFormState = { ...formState };
	//
	// 		// Apply the update to form state
	// 		formState = newFormState;
	//
	// 		// Send update to parent component
	// 		await onUpdateSetting(key, value);
	//
	// 		// After successful save, reset saving state
	// 		setTimeout(() => {
	// 			isSaving = false;
	// 		}, 300);
	// 	} catch (error) {
	// 		console.error('Error updating setting:', error);
	// 		isSaving = false;
	// 	}
	// }

	// Handle form submission
	async function handleSubmit(e: Event) {
		e.preventDefault();

		// Set saving state to prevent concurrent saves
		isSaving = true;

		try {
			// Prepare complete user config for saving
			const completeConfig: UserConfig = {
				...formState
				// 	// Interface preferences
				// 	theme: formState.theme,
				// 	notificationsEnabled: formState.notificationsEnabled || false,
				// 	// Content preferences
				// 	includeUnratedContent: formState.includeUnratedContent,
				// 	showAdultContent: formState.showAdultContent,
				// 	contentTypes: formState.contentTypes,
				// 	preferredGenres: formState.preferredGenres,
				//
				// 	// Recommendation settings
				// 	aiChatPersonality: formState.aiChatPersonality,
				// 	recommendationSyncFrequency: formState.recommendationSyncFrequency,
				// 	recommendationStrategy: formState.recommendationStrategy,
				// 	recommendationListPrefix: formState.recommendationListPrefix,
				// 	recommendationContentTypes: formState.recommendationContentTypes,
				// 	recommendationSyncListType: formState.recommendationSyncListType,
				// 	recommendationSyncEnabled: formState.recommendationSyncEnabled,
				// 	recommendationMinRating: formState.recommendationMinRating,
				// 	recommendationMaxAge: formState.recommendationMaxAge,
				// 	// recommendationMinimumRating: formState.recommendationMinRating,
				// 	discoveryModeEnabled: formState.discoveryModeEnabled,
				// 	maxRecommendations: formState.maxRecommendations
			};

			if (completeConfig.discoveryModeRatio && completeConfig.discoveryModeRatio > 1) {
				completeConfig.discoveryModeEnabled = true;
				completeConfig.discoveryModeRatio = completeConfig.discoveryModeRatio / 100;
				console.log('Discovery mode ratio:', completeConfig.discoveryModeRatio);
			}

			console.log('Submitting complete form data:', completeConfig);

			// Save to backend
			await onSave(completeConfig);

			// After successful save, update form state from the latest config
			// with a slight delay to allow the backend update to complete
			setTimeout(() => {
				isSaving = false;
			}, 300);
		} catch (error) {
			console.error('Error submitting form:', error);
			isSaving = false;
		}
	}

	// Set active tab
	function setActiveTab(tabId: string) {
		activeTab = tabId;
	}

	// Tab configuration
	const tabs = [
		{ id: 'interface', label: 'Interface', icon: Home },
		{ id: 'content', label: 'Content', icon: Film },
		{ id: 'recommendations', label: 'Recommendations', icon: Sparkles }
	];

	function setTheme(theme: ModelsUserConfigTheme) {
		formState.theme = theme;
	}

	function setLanguage(language: string) {
		formState.language = language;
	}

	function setNotifications(notifications: boolean) {
		formState.notificationsEnabled = notifications;
	}

	function setAiPersonality(aiPersonality: ModelsUserConfigAiChatPersonality) {
		formState.aiChatPersonality = aiPersonality;
	}

	// Helper to check if a media type is preferred
	function isMediaTypePreferred(type: string) {
		if (!formState.contentTypes) return false;
		return formState.contentTypes.includes(type) || false;
	}

	// Handle media type selection
	function toggleMediaType(type: string) {
		if (!formState.contentTypes) return;

		const newMediaTypes = isMediaTypePreferred(type)
			? formState.contentTypes.split(',').filter((t: string) => t !== type)
			: [...formState.contentTypes.split(','), type];

		formState.contentTypes = newMediaTypes.join(',');
	}

	// Handle genre change from the GenreSelector component
	function handleGenreChange(mediaType: string, genresList: string[]) {
		// Use dot notation for nested genre updates
		if (!formState.preferredGenres) return;
		formState.preferredGenres[mediaType as keyof typeof formState.preferredGenres] = genresList;
	}

	// Handler functions
	function setRecommendationStrategy(strategy: ModelsUserConfigRecommendationStrategy) {
		formState.recommendationStrategy = strategy;
	}

	function setRecommendationFrequency(frequency: ModelsUserConfigRecommendationSyncFrequency) {
		formState.recommendationSyncFrequency = frequency;
	}

	function updateFormState(newState: Partial<UserConfig>) {
		console.log('Updating form state:', newState);
		formState = { ...formState, ...newState };
		console.log('Updated form state:', formState);
	}
</script>

<CardHeader title="User Settings" subtitle="Manage your personal preferences" />

<div class="card-body py-4">
	<!-- Settings Tabs -->
	<div class="bg-surface-200-800/50 mb-6 flex space-x-1 rounded-lg p-1">
		{#each tabs as tab}
			<button
				type="button"
				class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
				class:bg-surface-100-900={activeTab === tab.id}
				onclick={() => setActiveTab(tab.id)}
			>
				<tab.icon size={16} />
				{tab.label}
			</button>
		{/each}
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<!-- Interface Settings Tab -->
		{#if activeTab === 'interface'}
			<InterfaceSettingsTab {formState} {updateFormState} />
			<!-- Content Settings Tab -->
		{:else if activeTab === 'content'}
			<ContentSettingsTab
				showAdultContent={formState.showAdultContent || false}
				includeUnratedContent={formState.includeUnratedContent || false}
				contentTypes={formState?.contentTypes?.split(',') || []}
				preferredGenres={formState.preferredGenres as Record<string, string[]>}
				maxRecommendations={formState.maxRecommendations as Record<string, number>}
				{toggleMediaType}
				{handleGenreChange}
				{isMediaTypePreferred}
			/>
			<!-- Recommendations Settings Tab -->
		{:else if activeTab === 'recommendations'}
			<RecommendationsTab
				recommendationSyncFrequency={formState.recommendationSyncFrequency as ModelsUserConfigRecommendationSyncFrequency}
				recommendationStrategy={formState.recommendationStrategy as ModelsUserConfigRecommendationStrategy}
				automateRecommendations={formState.recommendationSyncEnabled as boolean}
				automationMinimumRating={formState.recommendationMinRating as number}
				discoveryModeEnabled={formState.discoveryModeEnabled as boolean}
				discoveryModeRatio={formState.discoveryModeRatio as number}
				{setRecommendationStrategy}
				{setRecommendationFrequency}
			/>
		{/if}

		<div class="pt-4">
			<SaveButton {isLoading} />
		</div>
	</form>
</div>
