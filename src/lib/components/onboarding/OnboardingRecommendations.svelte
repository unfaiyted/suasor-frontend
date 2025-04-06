<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Clock, Calendar, ToggleRight, Check } from '@lucide/svelte';
	
	// Props for the component
	interface OnboardingRecommendationsProps {
		recommendationFrequency: string;
		automateRecommendations: boolean;
		mediaTypes: {
			movies: boolean;
			tvShows: boolean;
			music: boolean;
		};
	}
	
	let { recommendationFrequency, automateRecommendations, mediaTypes } = $props<OnboardingRecommendationsProps>();
	
	// Local state with Svelte 5 syntax
	let frequency = $state(recommendationFrequency);
	let automate = $state(automateRecommendations);
	
	// Available frequency options
	const frequencyOptions = [
		{ id: 'daily', name: 'Daily', description: 'Get fresh recommendations every day' },
		{ id: 'weekly', name: 'Weekly', description: 'Get a weekly digest of recommendations' },
		{ id: 'monthly', name: 'Monthly', description: 'Monthly curated recommendations' },
		{ id: 'manual', name: 'Manual Only', description: 'Only get recommendations when you ask for them' }
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
	
	// Event dispatcher to notify parent component when step is completed
	const dispatch = createEventDispatcher();
	
	// Set recommendation frequency
	function setFrequency(value: string) {
		frequency = value;
	}
	
	// Toggle automation
	function toggleAutomation() {
		automate = !automate;
	}
	
	// Check if form is valid
	function isFormValid() {
		return frequency !== '';
	}
	
	// Continue to next step
	function handleContinue() {
		if (isFormValid()) {
			dispatch('complete', {
				stepData: {
					recommendationFrequency: frequency,
					automateRecommendations: automate
				}
			});
		}
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-2xl font-bold mb-2">Recommendation Preferences</h2>
		<p class="text-surface-900-50">
			Finally, let's set up how often you'd like to receive recommendations and if you want to automate actions.
		</p>
	</div>
	
	<!-- Recommendation Frequency -->
	<div class="space-y-4">
		<h3 class="text-lg font-medium">How often would you like to receive recommendations?</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each frequencyOptions as option}
				<div 
					class={"bg-surface-200-800/30 rounded-lg p-5 cursor-pointer transition-colors border-2 " + 
						(frequency === option.id ? "border-primary-500" : "border-transparent")}
					onclick={() => setFrequency(option.id)}
				>
					<div class="flex items-center space-x-3">
						<div class={"p-2 rounded-full " + (frequency === option.id ? "bg-primary-500/20" : "bg-surface-300-600")}>
							{#if option.id === 'daily' || option.id === 'weekly' || option.id === 'monthly'}
								<Calendar size={20} class={frequency === option.id ? "text-primary-500" : "text-surface-900-50"} />
							{:else}
								<Clock size={20} class={frequency === option.id ? "text-primary-500" : "text-surface-900-50"} />
							{/if}
						</div>
						<div>
							<span class="font-medium">{option.name}</span>
							<p class="text-surface-900-50 text-sm mt-1">
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
			class={"bg-surface-200-800/30 rounded-lg p-5 cursor-pointer transition-colors border-2 " + 
				(automate ? "border-primary-500" : "border-transparent")}
			onclick={toggleAutomation}
		>
			<div class="flex items-center space-x-3">
				<div class={"p-2 rounded-full " + (automate ? "bg-primary-500/20" : "bg-surface-300-600")}>
					<ToggleRight size={20} class={automate ? "text-primary-500" : "text-surface-900-50"} />
				</div>
				<div class="flex-1">
					<span class="font-medium">Enable Automation</span>
					<p class="text-surface-900-50 text-sm mt-1">
						Automatically download and organize recommended media
					</p>
				</div>
				<div class={"w-5 h-5 rounded-md border flex items-center justify-center " + 
					(automate 
						? "bg-primary-500 border-primary-500" 
						: "border-surface-900-50")}>
					{#if automate}
						<Check size={14} class="text-white" />
					{/if}
				</div>
			</div>
		</div>
		
		{#if automate}
			<div class="pl-4 pt-2 space-y-4">
				<p class="text-sm text-surface-900-50">
					Automation will be enabled for:
				</p>
				
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
										<p class="text-surface-900-50 text-sm mt-1">
											{option.description}
										</p>
									</div>
								</div>
							</div>
						{/if}
					{/each}
					
					{#if !Object.values(automationOptions).some(opt => opt.enabled)}
						<p class="text-amber-500 text-sm">
							No media types selected for automation. Please go back and select media types.
						</p>
					{/if}
				</div>
				
				<p class="text-sm text-surface-900-50 italic">
					You can configure more detailed automation settings in the application after setup.
				</p>
			</div>
		{/if}
	</div>
	
	<!-- Continue button -->
	<div class="text-center">
		<button
			class="btn preset-filled-primary-500 px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
			onclick={handleContinue}
			disabled={!isFormValid()}
		>
			Continue
		</button>
	</div>
</div>