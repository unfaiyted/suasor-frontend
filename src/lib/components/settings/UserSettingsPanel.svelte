<script lang="ts">
	import { Home, Film, Sparkles, User } from '@lucide/svelte';
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
	import type { UserConfig, UserResponse } from '$lib/api/types';
	import userApi from '$lib/stores/user';

	// Import the tab components
	import InterfaceSettingsTab from './InterfaceSettingsTab.svelte';
	import ContentSettingsTab from './ContentSettingsTab.svelte';
	import RecommendationsTab from './RecommendationsTab.svelte';
	import ProfileSettingsTab from './ProfileSettingsTab.svelte';

	interface UserSettingsPanelProps {
		user: UserResponse;
		config: UserConfig;
		onUpdateUser: (user: UserResponse) => void;
		onUpdateConfig: (config: UserConfig) => Promise<void>;
		isLoading: boolean;
	}

	// Props - receive the config object and callbacks instead of individual values
	const {
		config,
		// onUpdateConfig,
		onUpdateUser,
		isLoading = false,
		user
	}: UserSettingsPanelProps = $props();

	// Create a local form state
	let formState = $state<UserConfig>({
		// Interface settings
		theme: config.theme || ModelsUserConfigTheme.system,
		language: config.language || 'en',
		contentTypes: config.contentTypes || 'movies,series,music',
		itemsPerPage: config.itemsPerPage || 20,

		// Notifications settings
		notificationsEnabled: config.notificationsEnabled || false,
		notifyOnNewRecommendations: config.notifyOnNewRecommendations || false,
		emailNotifications: config.emailNotifications || false,
		notifyOnSync: config.notifyOnSync || false,

		aiChatPersonality: config.aiChatPersonality || ModelsUserConfigAiChatPersonality.friendly,

		// Profile settings
		// bio: config.bio || '',
		// avatar: config.avatarUrl || null,
		// socialLinks: config.socialLinks || {
		// 	twitter: '',
		// 	letterboxd: '',
		// 	lastfm: '',
		// 	trakt: ''
		// },
		// privacySettings: config.privacySettings || {
		// 	showWatchHistory: true,
		// 	shareRecommendations: true,
		// 	publicProfile: true
		// },

		// Content settings
		showAdultContent: config.showAdultContent || false,
		includeUnratedContent: config.includeUnratedContent || false,
		minContentRating: config.minContentRating || 'G',
		maxContentRating: config.maxContentRating || 'R',
		preferredAudioLanguages: config.preferredAudioLanguages || 'en',
		preferredGenres: config.preferredGenres || { movies: [], series: [], music: [] },
		excludedGenres: config.excludedGenres || { movies: [], series: [], music: [] },
		preferredContentLength:
			config.preferredContentLength || ModelsUserConfigPreferredContentLength.medium,

		// Recommendation settings
		recommendationSyncFrequency:
			config.recommendationSyncFrequency || ModelsUserConfigRecommendationSyncFrequency.weekly,
		recommendationStrategy:
			config.recommendationStrategy || ModelsUserConfigRecommendationStrategy.balanced,
		recommendationListPrefix: config.recommendationListPrefix || 'AI:',
		recommendationContentTypes: config.recommendationContentTypes || 'movies,series,music',
		recommendationSyncListType:
			config.recommendationSyncListType || ModelsUserConfigRecommendationSyncListType.collection,
		recommendationSyncEnabled: config.recommendationSyncEnabled || false,
		recommendationMinRating: config.recommendationMinRating || 5,
		recommendationMaxAge: config.recommendationMaxAge || 40,

		// Max recommendations to make at the specified List Creation Frequency
		// so 20 recommendations per week
		maxRecommendations: config.maxRecommendations || {
			movies: 20,
			series: 20,
			music: 20
		},

		discoveryModeEnabled: config.discoveryModeEnabled || true,
		discoveryModeRatio: config.discoveryModeRatio || 0.3
	});

	// For UI organization
	let activeTab = $state('profile');
	let isSaving = $state(false);

	// Handle form submission
	async function handleSubmit(e: Event) {
		e.preventDefault();

		// Set saving state to prevent concurrent saves
		isSaving = true;

		try {
			// Prepare complete user config for saving
			const completeConfig: UserConfig = {
				...formState
			};

			if (completeConfig.discoveryModeRatio && completeConfig.discoveryModeRatio > 1) {
				completeConfig.discoveryModeEnabled = true;
				completeConfig.discoveryModeRatio = completeConfig.discoveryModeRatio / 100;
				console.log('Discovery mode ratio:', completeConfig.discoveryModeRatio);
			}

			console.log('Submitting complete form data:', completeConfig);

			// Save to backend - only call onSave, not both functions
			// Removing the call to onUpdateSetting() which creates a circular update
			// await onSave(completeConfig);

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
		{ id: 'profile', label: 'Profile', icon: User },
		{ id: 'interface', label: 'Interface', icon: Home },
		{ id: 'content', label: 'Content', icon: Film },
		{ id: 'recommendations', label: 'Recommendations', icon: Sparkles }
	];

	function updateFormState(newState: Partial<UserConfig>) {
		formState = { ...formState, ...newState };
		console.log('Updated form state:', formState);
	}

	// Function to handle user updates, which will update both local and global state
	async function updateUserAndStore(userData: Partial<UserResponse>) {
		// Update local user state
		if (onUpdateUser) {
			onUpdateUser({ ...user, ...userData });
		}

		// Update global user state in the store
		if (userData && Object.keys(userData).length > 0) {
			await userApi.updateProfile(userData);
		}
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
		<!-- Profile Settings Tab -->
		{#if activeTab === 'profile'}
			<ProfileSettingsTab {formState} {updateFormState} updateUser={updateUserAndStore} {user} />
			<!-- Interface Settings Tab -->
		{:else if activeTab === 'interface'}
			<InterfaceSettingsTab {formState} {updateFormState} />
			<!-- Content Settings Tab -->
		{:else if activeTab === 'content'}
			<ContentSettingsTab {formState} {updateFormState} />
			<!-- Recommendations Settings Tab -->
		{:else if activeTab === 'recommendations'}
			<RecommendationsTab {formState} {updateFormState} />
		{/if}

		<div class="pt-4">
			<SaveButton {isLoading} />
		</div>
	</form>
</div>
