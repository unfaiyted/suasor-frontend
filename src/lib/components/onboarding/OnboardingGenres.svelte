<script lang="ts">
	import { Film, Tv, Music, Check } from '@lucide/svelte';
	import type { MediaTypes, Genres, OnboardingData } from './types';

	// Props for the component
	interface OnboardingGenresProps {
		mediaTypes: MediaTypes;
		genres: Genres;
		accountData: Record<string, any>;
		onComplete: (data: { stepData: OnboardingData }) => void;
	}

	let { mediaTypes, genres, accountData, onComplete }: OnboardingGenresProps = $props();

	// Local state with Svelte 5 syntax
	let selectedGenres = $state({
		movies: [...genres.movies],
		tvShows: [...genres.tvShows],
		music: [...genres.music]
	});

	let activeTab = $state(
		mediaTypes.movies
			? 'movies'
			: mediaTypes.tvShows
				? 'tvShows'
				: mediaTypes.music
					? 'music'
					: 'movies'
	);

	let loadingGenres = $state(false);

	// Mock genre data - in a real app, these would be fetched from an API based on accountData
	const availableGenres = {
		movies: [
			'Action',
			'Adventure',
			'Animation',
			'Comedy',
			'Crime',
			'Documentary',
			'Drama',
			'Family',
			'Fantasy',
			'History',
			'Horror',
			'Music',
			'Mystery',
			'Romance',
			'Science Fiction',
			'Thriller',
			'War',
			'Western'
		],
		tvShows: [
			'Action & Adventure',
			'Animation',
			'Comedy',
			'Crime',
			'Documentary',
			'Drama',
			'Family',
			'Kids',
			'Mystery',
			'News',
			'Reality',
			'Sci-Fi & Fantasy',
			'Soap',
			'Talk',
			'War & Politics',
			'Western'
		],
		music: [
			'Alternative',
			'Blues',
			'Classical',
			'Country',
			'Dance',
			'Electronic',
			'Folk',
			'Hip Hop',
			'Jazz',
			'Metal',
			'Pop',
			'R&B',
			'Reggae',
			'Rock',
			'Soul',
			'World'
		]
	};

	// Simulate loading genres from user's libraries
	async function loadGenresFromAccounts() {
		// In a real implementation, this would analyze the user's libraries
		// For now, just simulate a delay
		loadingGenres = true;

		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Simulate finding top genres from user's media
			// In reality, this would come from the API

			// Auto-select some genres based on "analysis" if no selections yet
			if (selectedGenres.movies.length === 0 && mediaTypes.movies) {
				selectedGenres.movies = ['Action', 'Drama', 'Thriller'].filter((g) =>
					availableGenres.movies.includes(g)
				);
			}

			if (selectedGenres.tvShows.length === 0 && mediaTypes.tvShows) {
				selectedGenres.tvShows = ['Drama', 'Comedy', 'Crime'].filter((g) =>
					availableGenres.tvShows.includes(g)
				);
			}

			if (selectedGenres.music.length === 0 && mediaTypes.music) {
				selectedGenres.music = ['Rock', 'Pop', 'Electronic'].filter((g) =>
					availableGenres.music.includes(g)
				);
			}
		} finally {
			loadingGenres = false;
		}
	}

	// Toggle genre selection
	function toggleGenre(mediaType: 'movies' | 'tvShows' | 'music', genre: string) {
		const index = selectedGenres[mediaType].indexOf(genre);
		if (index === -1) {
			selectedGenres[mediaType] = [...selectedGenres[mediaType], genre];
		} else {
			selectedGenres[mediaType] = selectedGenres[mediaType].filter((g) => g !== genre);
		}
	}

	// Activate a tab
	function setActiveTab(tab: 'movies' | 'tvShows' | 'music') {
		if (mediaTypes[tab]) {
			activeTab = tab;
		}
	}

	// Check if genres selection is valid
	function isSelectionValid() {
		// Check if at least one genre is selected for each active media type
		for (const [mediaType, isActive] of Object.entries(mediaTypes)) {
			if (isActive && selectedGenres[mediaType].length === 0) {
				return false;
			}
		}
		return true;
	}

	// Continue to next step
	function handleContinue() {
		if (isSelectionValid()) {
			onComplete({
				stepData: {
					genres: selectedGenres
				}
			});
		}
	}

	// Load genres when component mounts
	$effect(() => {
		loadGenresFromAccounts();
	});
</script>

<div class="space-y-8">
	<div>
		<h2 class="mb-2 text-2xl font-bold">Your Genre Preferences</h2>
		<p class="text-surface-900-50">
			Select the genres you enjoy for each media type to help us provide better recommendations.
		</p>
	</div>

	<!-- Tabs for different media types -->
	<div class="border-surface-200-800 border-b">
		<div class="flex space-x-4">
			{#if mediaTypes.movies}
				<button
					class={'px-1 pb-2 transition-colors ' +
						(activeTab === 'movies'
							? 'border-primary-500 text-primary-500 border-b-2 font-medium'
							: 'text-surface-900-50 hover:text-surface-900-50-hover')}
					onclick={() => setActiveTab('movies')}
				>
					<div class="flex items-center gap-2">
						<Film size={16} />
						<span>Movies</span>
						{#if selectedGenres.movies.length > 0}
							<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-0.5 text-xs">
								{selectedGenres.movies.length}
							</span>
						{/if}
					</div>
				</button>
			{/if}

			{#if mediaTypes.tvShows}
				<button
					class={'px-1 pb-2 transition-colors ' +
						(activeTab === 'tvShows'
							? 'border-primary-500 text-primary-500 border-b-2 font-medium'
							: 'text-surface-900-50 hover:text-surface-900-50-hover')}
					onclick={() => setActiveTab('tvShows')}
				>
					<div class="flex items-center gap-2">
						<Tv size={16} />
						<span>TV Shows</span>
						{#if selectedGenres.tvShows.length > 0}
							<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-0.5 text-xs">
								{selectedGenres.tvShows.length}
							</span>
						{/if}
					</div>
				</button>
			{/if}

			{#if mediaTypes.music}
				<button
					class={'px-1 pb-2 transition-colors ' +
						(activeTab === 'music'
							? 'border-primary-500 text-primary-500 border-b-2 font-medium'
							: 'text-surface-900-50 hover:text-surface-900-50-hover')}
					onclick={() => setActiveTab('music')}
				>
					<div class="flex items-center gap-2">
						<Music size={16} />
						<span>Music</span>
						{#if selectedGenres.music.length > 0}
							<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-0.5 text-xs">
								{selectedGenres.music.length}
							</span>
						{/if}
					</div>
				</button>
			{/if}
		</div>
	</div>

	<!-- Genre selection for active tab -->
	<div class="min-h-[300px]">
		{#if loadingGenres}
			<div class="flex h-[300px] flex-col items-center justify-center">
				<div
					class="border-primary-500 mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
				></div>
				<p class="text-surface-900-50">Analyzing your library to find genres you might enjoy...</p>
			</div>
		{:else if activeTab === 'movies' && mediaTypes.movies}
			<div>
				<div class="mb-2 flex items-center justify-between">
					<h3 class="font-medium">Movie Genres</h3>
					<span class="text-surface-900-50 text-sm">
						Selected: {selectedGenres.movies.length}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each availableGenres.movies as genre}
						<div
							class={'flex cursor-pointer items-center rounded-lg border p-3 ' +
								(selectedGenres.movies.includes(genre)
									? 'bg-primary-500/20 border-primary-500/50'
									: 'bg-surface-200-800/30 hover:bg-surface-200-800/60 border-transparent')}
							onclick={() => toggleGenre('movies', genre)}
						>
							<span class="flex-1">{genre}</span>
							{#if selectedGenres.movies.includes(genre)}
								<div class="bg-primary-500 rounded-full p-0.5 text-white">
									<Check size={14} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if activeTab === 'tvShows' && mediaTypes.tvShows}
			<div>
				<div class="mb-2 flex items-center justify-between">
					<h3 class="font-medium">TV Show Genres</h3>
					<span class="text-surface-900-50 text-sm">
						Selected: {selectedGenres.tvShows.length}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each availableGenres.tvShows as genre}
						<div
							class={'flex cursor-pointer items-center rounded-lg border p-3 ' +
								(selectedGenres.tvShows.includes(genre)
									? 'bg-primary-500/20 border-primary-500/50'
									: 'bg-surface-200-800/30 hover:bg-surface-200-800/60 border-transparent')}
							onclick={() => toggleGenre('tvShows', genre)}
						>
							<span class="flex-1">{genre}</span>
							{#if selectedGenres.tvShows.includes(genre)}
								<div class="bg-primary-500 rounded-full p-0.5 text-white">
									<Check size={14} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if activeTab === 'music' && mediaTypes.music}
			<div>
				<div class="mb-2 flex items-center justify-between">
					<h3 class="font-medium">Music Genres</h3>
					<span class="text-surface-900-50 text-sm">
						Selected: {selectedGenres.music.length}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each availableGenres.music as genre}
						<div
							class={'flex cursor-pointer items-center rounded-lg border p-3 ' +
								(selectedGenres.music.includes(genre)
									? 'bg-primary-500/20 border-primary-500/50'
									: 'bg-surface-200-800/30 hover:bg-surface-200-800/60 border-transparent')}
							onclick={() => toggleGenre('music', genre)}
						>
							<span class="flex-1">{genre}</span>
							{#if selectedGenres.music.includes(genre)}
								<div class="bg-primary-500 rounded-full p-0.5 text-white">
									<Check size={14} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Continue button -->
	<div class="text-center">
		<button
			class="btn preset-filled-primary-500 rounded-full px-8 py-3 shadow-md transition-shadow hover:shadow-lg"
			onclick={handleContinue}
			disabled={!isSelectionValid() || loadingGenres}
		>
			Continue
		</button>
	</div>
</div>
