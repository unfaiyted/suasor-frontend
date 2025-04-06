<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckCircle, Film, Tv, Music, Monitor, Bot, Activity, ToggleRight } from '@lucide/svelte';
	
	// Props for the component
	interface OnboardingCompleteProps {
		onboardingData: any;
	}
	
	let { onboardingData } = $props<OnboardingCompleteProps>();
	
	// Event dispatcher to notify parent component when done
	const dispatch = createEventDispatcher();
	
	// Function to handle completion
	function handleComplete() {
		dispatch('complete');
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
			case 'daily': return 'Daily';
			case 'weekly': return 'Weekly';
			case 'monthly': return 'Monthly';
			case 'manual': return 'Manual Only';
			default: return 'Unknown';
		}
	}
</script>

<div class="space-y-8">
	<div class="text-center">
		<div class="flex justify-center mb-4">
			<div class="text-green-500 bg-green-500/10 rounded-full p-3">
				<CheckCircle size={48} />
			</div>
		</div>
		<h2 class="text-2xl font-bold mb-2">Setup Complete!</h2>
		<p class="text-surface-900-50 max-w-md mx-auto">
			Your Suasor account is now set up and ready to go. Here's a summary of your preferences:
		</p>
	</div>
	
	<!-- Summary -->
	<div class="bg-surface-200-800/30 rounded-lg p-6 max-w-xl mx-auto">
		<h3 class="font-medium text-lg mb-4">Your Setup Summary</h3>
		
		<!-- Media Types -->
		<div class="mb-6">
			<h4 class="text-sm text-surface-900-50 uppercase tracking-wide mb-2">Media Types</h4>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				{#if onboardingData.mediaTypes.movies}
					<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
						<Film size={16} class="text-primary-500" />
						<span>Movies</span>
					</div>
				{/if}
				
				{#if onboardingData.mediaTypes.tvShows}
					<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
						<Tv size={16} class="text-primary-500" />
						<span>TV Shows</span>
					</div>
				{/if}
				
				{#if onboardingData.mediaTypes.music}
					<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
						<Music size={16} class="text-primary-500" />
						<span>Music</span>
					</div>
				{/if}
			</div>
		</div>
		
		<!-- AI Personality -->
		<div class="mb-6">
			<h4 class="text-sm text-surface-900-50 uppercase tracking-wide mb-2">AI Personality</h4>
			<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
				<Bot size={16} class="text-primary-500" />
				<span class="capitalize">{onboardingData.aiPersonality || 'Friendly'}</span>
			</div>
		</div>
		
		<!-- Connected Accounts -->
		<div class="mb-6">
			<h4 class="text-sm text-surface-900-50 uppercase tracking-wide mb-2">Connected Accounts</h4>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
					<Monitor size={16} class="text-primary-500" />
					<div>
						<span>Media Servers</span>
						<p class="text-xs text-surface-900-50">
							{getConfiguredCount('mediaApplications')} connected
						</p>
					</div>
				</div>
				
				<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
					<Activity size={16} class="text-primary-500" />
					<div>
						<span>Media Trackers</span>
						<p class="text-xs text-surface-900-50">
							{getConfiguredCount('mediaTrackers')} connected
						</p>
					</div>
				</div>
				
				<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
					<ToggleRight size={16} class="text-primary-500" />
					<div>
						<span>Automation Tools</span>
						<p class="text-xs text-surface-900-50">
							{getConfiguredCount('automationTools')} connected
						</p>
					</div>
				</div>
				
				<div class="bg-surface-300-600/40 rounded p-3 flex items-center space-x-3">
					<Bot size={16} class="text-primary-500" />
					<div>
						<span>AI Engines</span>
						<p class="text-xs text-surface-900-50">
							{getConfiguredCount('aiEngines')} connected
						</p>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Genres and Preferences -->
		<div class="mb-6">
			<h4 class="text-sm text-surface-900-50 uppercase tracking-wide mb-2">Preferences</h4>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div class="bg-surface-300-600/40 rounded p-3">
					<div class="font-medium mb-1">Genres</div>
					<p class="text-sm text-surface-900-50">
						{getTotalGenresSelected()} genres selected across all media types
					</p>
				</div>
				
				<div class="bg-surface-300-600/40 rounded p-3">
					<div class="font-medium mb-1">Recommendation Frequency</div>
					<p class="text-sm text-surface-900-50">
						{getFrequencyText()}
					</p>
				</div>
				
				<div class="bg-surface-300-600/40 rounded p-3 md:col-span-2">
					<div class="font-medium mb-1">Automation</div>
					<p class="text-sm text-surface-900-50">
						{onboardingData.automateRecommendations 
							? 'Enabled - Suasor will automatically process your recommendations'
							: 'Disabled - You\'ll need to manually process recommendations'}
					</p>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Get Started Button -->
	<div class="text-center pt-4">
		<p class="text-surface-900-50 mb-4">
			You're all set! Click below to start using Suasor.
		</p>
		<button 
			class="btn preset-filled-primary-500 px-10 py-3 text-lg rounded-full shadow-md hover:shadow-lg transition-shadow"
			onclick={handleComplete}
		>
			Get Started
		</button>
	</div>
</div>