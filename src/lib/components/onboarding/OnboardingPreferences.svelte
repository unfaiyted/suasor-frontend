<script lang="ts">
	import { Film, Tv, Music, UserCheck, UserX } from '@lucide/svelte';
	import type { OnboardingData } from './types';

	// Props for the component
	interface OnboardingPreferencesProps {
		preferences: OnboardingData;
		onComplete: (data: { stepData: OnboardingData }) => void;
	}

	let { preferences, onComplete }: OnboardingPreferencesProps = $props();

	// Local state with Svelte 5 syntax
	let mediaTypes = $state({
		movies: preferences.mediaTypes?.movies,
		tvShows: preferences.mediaTypes?.tvShows,
		music: preferences.mediaTypes?.music
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
			onComplete({
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
		<h2 class="mb-2 text-2xl font-bold">Your Preferences</h2>
		<p class="text-surface-900-50">
			Tell us what kind of media you're interested in and how you'd like your AI assistant to
			interact with you.
		</p>
	</div>

	<!-- Media Types Selection -->
	<div class="space-y-4">
		<h3 class="text-lg font-medium">What types of media are you interested in?</h3>
		<p class="text-surface-900-50 text-sm">Select all that apply</p>

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
			<!-- Movies -->
			<div
				class={'bg-surface-200-800/20 cursor-pointer rounded-xl border-2 p-5 shadow-sm transition-all ' +
					(mediaTypes.movies
						? 'border-primary-500 shadow'
						: 'hover:bg-surface-200-800/30 border-transparent')}
				onclick={() => toggleMediaType('movies')}
			>
				<div class="flex items-center space-x-3">
					<div
						class={'rounded-full p-2 ' +
							(mediaTypes.movies ? 'bg-primary-500/20' : 'bg-surface-300-600/50')}
					>
						<Film
							size={20}
							class={mediaTypes.movies ? 'text-primary-500' : 'text-surface-900-50'}
						/>
					</div>
					<span class="font-medium">Movies</span>
				</div>
				<p class="text-surface-900-50 mt-2 text-sm">Feature films and documentaries</p>
			</div>

			<!-- TV Shows -->
			<div
				class={'bg-surface-200-800/20 cursor-pointer rounded-xl border-2 p-5 shadow-sm transition-all ' +
					(mediaTypes.tvShows
						? 'border-primary-500 shadow'
						: 'hover:bg-surface-200-800/30 border-transparent')}
				onclick={() => toggleMediaType('tvShows')}
			>
				<div class="flex items-center space-x-3">
					<div
						class={'rounded-full p-2 ' +
							(mediaTypes.tvShows ? 'bg-primary-500/20' : 'bg-surface-300-600/50')}
					>
						<Tv size={20} class={mediaTypes.tvShows ? 'text-primary-500' : 'text-surface-900-50'} />
					</div>
					<span class="font-medium">TV Shows</span>
				</div>
				<p class="text-surface-900-50 mt-2 text-sm">Series, shows, and episodic content</p>
			</div>

			<!-- Music -->
			<div
				class={'bg-surface-200-800/20 cursor-pointer rounded-xl border-2 p-5 shadow-sm transition-all ' +
					(mediaTypes.music
						? 'border-primary-500 shadow'
						: 'hover:bg-surface-200-800/30 border-transparent')}
				onclick={() => toggleMediaType('music')}
			>
				<div class="flex items-center space-x-3">
					<div
						class={'rounded-full p-2 ' +
							(mediaTypes.music ? 'bg-primary-500/20' : 'bg-surface-300-600/50')}
					>
						<Music
							size={20}
							class={mediaTypes.music ? 'text-primary-500' : 'text-surface-900-50'}
						/>
					</div>
					<span class="font-medium">Music</span>
				</div>
				<p class="text-surface-900-50 mt-2 text-sm">Albums, songs, and artists</p>
			</div>
		</div>
	</div>

	<!-- AI Personality Selection -->
	<div class="mt-8 space-y-4">
		<h3 class="text-lg font-medium">How would you like the AI to interact with you?</h3>
		<p class="text-surface-900-50 text-sm">Choose a personality style for your recommendations</p>

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each personalityOptions as personality}
				<div
					class={'bg-surface-200-800/20 cursor-pointer rounded-xl border-2 p-5 shadow-sm transition-all ' +
						(aiPersonality === personality.id
							? 'border-primary-500 shadow'
							: 'hover:bg-surface-200-800/30 border-transparent')}
					onclick={() => selectPersonality(personality.id)}
				>
					<div class="flex items-center space-x-3">
						<div
							class={'rounded-full p-2 ' +
								(aiPersonality === personality.id ? 'bg-primary-500/20' : 'bg-surface-300-600/50')}
						>
							<svelte:component
								this={personality.icon}
								size={20}
								class={aiPersonality === personality.id
									? 'text-primary-500'
									: 'text-surface-900-50'}
							/>
						</div>
						<span class="font-medium">{personality.name}</span>
					</div>
					<p class="text-surface-900-50 mt-2 text-sm">
						{personality.description}
					</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Continue Button -->
	<div class="mt-10 text-center">
		<button
			class="btn preset-filled-primary-500 rounded-full px-8 py-3 shadow-md transition-shadow hover:shadow-lg"
			onclick={handleContinue}
			disabled={!isFormValid()}
		>
			Continue
		</button>
	</div>
</div>
