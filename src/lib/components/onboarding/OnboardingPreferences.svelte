<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Film, Tv, Music, UserCheck, UserX } from '@lucide/svelte';
	
	// Props for the component
	interface OnboardingPreferencesProps {
		preferences: {
			mediaTypes: {
				movies: boolean;
				tvShows: boolean;
				music: boolean;
			};
			aiPersonality: string;
		};
	}
	
	let { preferences } = $props<OnboardingPreferencesProps>();
	
	// Local state with Svelte 5 syntax
	let mediaTypes = $state({
		movies: preferences.mediaTypes.movies,
		tvShows: preferences.mediaTypes.tvShows,
		music: preferences.mediaTypes.music
	});
	
	let aiPersonality = $state(preferences.aiPersonality);
	
	// Personality options
	const personalityOptions = [
		{
			id: 'friendly',
			name: 'Friendly',
			description: 'Conversational and approachable, good for casual recommendations',
			icon: UserCheck
		},
		{
			id: 'serious',
			name: 'Serious',
			description: 'Direct and factual, focused on precision',
			icon: UserX
		},
		{
			id: 'enthusiastic',
			name: 'Enthusiastic',
			description: 'Excited and passionate about recommendations',
			icon: UserCheck
		},
		{
			id: 'analytical',
			name: 'Analytical',
			description: 'In-depth analysis and detailed explanations',
			icon: UserX
		}
	];
	
	// Event dispatcher to notify parent component when step is completed
	const dispatch = createEventDispatcher();
	
	// Check if form is valid
	function isFormValid() {
		// At least one media type must be selected
		const hasMediaType = Object.values(mediaTypes).some(Boolean);
		// Personality must be selected
		const hasPersonality = aiPersonality !== '';
		
		return hasMediaType && hasPersonality;
	}
	
	// Function to handle continuation to next step
	function handleContinue() {
		if (isFormValid()) {
			dispatch('complete', {
				stepData: {
					mediaTypes,
					aiPersonality
				}
			});
		}
	}
	
	// Toggle media type selection
	function toggleMediaType(type: 'movies' | 'tvShows' | 'music') {
		mediaTypes[type] = !mediaTypes[type];
	}
	
	// Set AI personality
	function selectPersonality(personalityId: string) {
		aiPersonality = personalityId;
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-2xl font-bold mb-2">Your Preferences</h2>
		<p class="text-surface-900-50">
			Tell us what kind of media you're interested in and how you'd like your AI assistant to interact with you.
		</p>
	</div>
	
	<!-- Media Types Selection -->
	<div class="space-y-4">
		<h3 class="text-lg font-medium">What types of media are you interested in?</h3>
		<p class="text-surface-900-50 text-sm">Select all that apply</p>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
			<!-- Movies -->
			<div 
				class={"bg-surface-200-800/20 rounded-xl p-5 cursor-pointer transition-all border-2 shadow-sm " + 
					(mediaTypes.movies ? "border-primary-500 shadow" : "border-transparent hover:bg-surface-200-800/30")}
				onclick={() => toggleMediaType('movies')}
			>
				<div class="flex items-center space-x-3">
					<div class={"p-2 rounded-full " + (mediaTypes.movies ? "bg-primary-500/20" : "bg-surface-300-600/50")}>
						<Film size={20} class={mediaTypes.movies ? "text-primary-500" : "text-surface-900-50"} />
					</div>
					<span class="font-medium">Movies</span>
				</div>
				<p class="text-surface-900-50 text-sm mt-2">
					Feature films and documentaries
				</p>
			</div>
			
			<!-- TV Shows -->
			<div 
				class={"bg-surface-200-800/20 rounded-xl p-5 cursor-pointer transition-all border-2 shadow-sm " + 
					(mediaTypes.tvShows ? "border-primary-500 shadow" : "border-transparent hover:bg-surface-200-800/30")}
				onclick={() => toggleMediaType('tvShows')}
			>
				<div class="flex items-center space-x-3">
					<div class={"p-2 rounded-full " + (mediaTypes.tvShows ? "bg-primary-500/20" : "bg-surface-300-600/50")}>
						<Tv size={20} class={mediaTypes.tvShows ? "text-primary-500" : "text-surface-900-50"} />
					</div>
					<span class="font-medium">TV Shows</span>
				</div>
				<p class="text-surface-900-50 text-sm mt-2">
					Series, shows, and episodic content
				</p>
			</div>
			
			<!-- Music -->
			<div 
				class={"bg-surface-200-800/20 rounded-xl p-5 cursor-pointer transition-all border-2 shadow-sm " + 
					(mediaTypes.music ? "border-primary-500 shadow" : "border-transparent hover:bg-surface-200-800/30")}
				onclick={() => toggleMediaType('music')}
			>
				<div class="flex items-center space-x-3">
					<div class={"p-2 rounded-full " + (mediaTypes.music ? "bg-primary-500/20" : "bg-surface-300-600/50")}>
						<Music size={20} class={mediaTypes.music ? "text-primary-500" : "text-surface-900-50"} />
					</div>
					<span class="font-medium">Music</span>
				</div>
				<p class="text-surface-900-50 text-sm mt-2">
					Albums, songs, and artists
				</p>
			</div>
		</div>
	</div>
	
	<!-- AI Personality Selection -->
	<div class="space-y-4 mt-8">
		<h3 class="text-lg font-medium">How would you like the AI to interact with you?</h3>
		<p class="text-surface-900-50 text-sm">Choose a personality style for your recommendations</p>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
			{#each personalityOptions as personality}
				<div 
					class={"bg-surface-200-800/20 rounded-xl p-5 cursor-pointer transition-all border-2 shadow-sm " + 
						(aiPersonality === personality.id ? "border-primary-500 shadow" : "border-transparent hover:bg-surface-200-800/30")}
					onclick={() => selectPersonality(personality.id)}
				>
					<div class="flex items-center space-x-3">
						<div class={"p-2 rounded-full " + (aiPersonality === personality.id ? "bg-primary-500/20" : "bg-surface-300-600/50")}>
							<svelte:component 
								this={personality.icon} 
								size={20} 
								class={aiPersonality === personality.id ? "text-primary-500" : "text-surface-900-50"} 
							/>
						</div>
						<span class="font-medium">{personality.name}</span>
					</div>
					<p class="text-surface-900-50 text-sm mt-2">
						{personality.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
	
	<!-- Continue Button -->
	<div class="text-center mt-10">
		<button 
			class="btn preset-filled-primary-500 px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
			onclick={handleContinue}
			disabled={!isFormValid()}
		>
			Continue
		</button>
	</div>
</div>