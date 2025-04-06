<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Film, Tv, Music, Check } from '@lucide/svelte';
	
	// Props for the component
	interface OnboardingGenresProps {
		mediaTypes: {
			movies: boolean;
			tvShows: boolean;
			music: boolean;
		};
		genres: {
			movies: string[];
			tvShows: string[];
			music: string[];
		};
		accountData: Record<string, any>;
	}
	
	let { mediaTypes, genres, accountData } = $props<OnboardingGenresProps>();
	
	// Local state with Svelte 5 syntax
	let selectedGenres = $state({
		movies: [...genres.movies],
		tvShows: [...genres.tvShows],
		music: [...genres.music]
	});
	
	let activeTab = $state(
		mediaTypes.movies ? 'movies' : 
		mediaTypes.tvShows ? 'tvShows' : 
		mediaTypes.music ? 'music' : 'movies'
	);
	
	let loadingGenres = $state(false);
	
	// Mock genre data - in a real app, these would be fetched from an API based on accountData
	const availableGenres = {
		movies: [
			'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
			'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
			'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
		],
		tvShows: [
			'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
			'Drama', 'Family', 'Kids', 'Mystery', 'News', 'Reality', 'Sci-Fi & Fantasy',
			'Soap', 'Talk', 'War & Politics', 'Western'
		],
		music: [
			'Alternative', 'Blues', 'Classical', 'Country', 'Dance', 'Electronic',
			'Folk', 'Hip Hop', 'Jazz', 'Metal', 'Pop', 'R&B', 'Reggae', 'Rock',
			'Soul', 'World'
		]
	};
	
	// Event dispatcher to notify parent component when step is completed
	const dispatch = createEventDispatcher();
	
	// Simulate loading genres from user's libraries
	async function loadGenresFromAccounts() {
		// In a real implementation, this would analyze the user's libraries
		// For now, just simulate a delay
		loadingGenres = true;
		
		try {
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			// Simulate finding top genres from user's media
			// In reality, this would come from the API
			
			// Auto-select some genres based on "analysis" if no selections yet
			if (selectedGenres.movies.length === 0 && mediaTypes.movies) {
				selectedGenres.movies = ['Action', 'Drama', 'Thriller'].filter(
					g => availableGenres.movies.includes(g)
				);
			}
			
			if (selectedGenres.tvShows.length === 0 && mediaTypes.tvShows) {
				selectedGenres.tvShows = ['Drama', 'Comedy', 'Crime'].filter(
					g => availableGenres.tvShows.includes(g)
				);
			}
			
			if (selectedGenres.music.length === 0 && mediaTypes.music) {
				selectedGenres.music = ['Rock', 'Pop', 'Electronic'].filter(
					g => availableGenres.music.includes(g)
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
			selectedGenres[mediaType] = selectedGenres[mediaType].filter(g => g !== genre);
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
			dispatch('complete', {
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
		<h2 class="text-2xl font-bold mb-2">Your Genre Preferences</h2>
		<p class="text-surface-900-50">
			Select the genres you enjoy for each media type to help us provide better recommendations.
		</p>
	</div>
	
	<!-- Tabs for different media types -->
	<div class="border-b border-surface-200-800">
		<div class="flex space-x-4">
			{#if mediaTypes.movies}
				<button
					class={"pb-2 px-1 transition-colors " + (activeTab === 'movies' 
						? "border-b-2 border-primary-500 font-medium text-primary-500" 
						: "text-surface-900-50 hover:text-surface-900-50-hover")}
					onclick={() => setActiveTab('movies')}
				>
					<div class="flex items-center gap-2">
						<Film size={16} />
						<span>Movies</span>
						{#if selectedGenres.movies.length > 0}
							<span class="bg-primary-500/20 text-primary-500 text-xs px-2 py-0.5 rounded-full">
								{selectedGenres.movies.length}
							</span>
						{/if}
					</div>
				</button>
			{/if}
			
			{#if mediaTypes.tvShows}
				<button
					class={"pb-2 px-1 transition-colors " + (activeTab === 'tvShows' 
						? "border-b-2 border-primary-500 font-medium text-primary-500" 
						: "text-surface-900-50 hover:text-surface-900-50-hover")}
					onclick={() => setActiveTab('tvShows')}
				>
					<div class="flex items-center gap-2">
						<Tv size={16} />
						<span>TV Shows</span>
						{#if selectedGenres.tvShows.length > 0}
							<span class="bg-primary-500/20 text-primary-500 text-xs px-2 py-0.5 rounded-full">
								{selectedGenres.tvShows.length}
							</span>
						{/if}
					</div>
				</button>
			{/if}
			
			{#if mediaTypes.music}
				<button
					class={"pb-2 px-1 transition-colors " + (activeTab === 'music' 
						? "border-b-2 border-primary-500 font-medium text-primary-500" 
						: "text-surface-900-50 hover:text-surface-900-50-hover")}
					onclick={() => setActiveTab('music')}
				>
					<div class="flex items-center gap-2">
						<Music size={16} />
						<span>Music</span>
						{#if selectedGenres.music.length > 0}
							<span class="bg-primary-500/20 text-primary-500 text-xs px-2 py-0.5 rounded-full">
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
			<div class="flex flex-col items-center justify-center h-[300px]">
				<div class="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
				<p class="text-surface-900-50">Analyzing your library to find genres you might enjoy...</p>
			</div>
		{:else}
			{#if activeTab === 'movies' && mediaTypes.movies}
				<div>
					<div class="mb-2 flex items-center justify-between">
						<h3 class="font-medium">Movie Genres</h3>
						<span class="text-sm text-surface-900-50">
							Selected: {selectedGenres.movies.length}
						</span>
					</div>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{#each availableGenres.movies as genre}
							<div 
								class={"flex items-center p-3 rounded-lg cursor-pointer border " + 
									(selectedGenres.movies.includes(genre) 
										? "bg-primary-500/20 border-primary-500/50"
										: "bg-surface-200-800/30 border-transparent hover:bg-surface-200-800/60")}
								onclick={() => toggleGenre('movies', genre)}
							>
								<span class="flex-1">{genre}</span>
								{#if selectedGenres.movies.includes(genre)}
									<div class="bg-primary-500 text-white rounded-full p-0.5">
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
						<span class="text-sm text-surface-900-50">
							Selected: {selectedGenres.tvShows.length}
						</span>
					</div>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{#each availableGenres.tvShows as genre}
							<div 
								class={"flex items-center p-3 rounded-lg cursor-pointer border " + 
									(selectedGenres.tvShows.includes(genre) 
										? "bg-primary-500/20 border-primary-500/50"
										: "bg-surface-200-800/30 border-transparent hover:bg-surface-200-800/60")}
								onclick={() => toggleGenre('tvShows', genre)}
							>
								<span class="flex-1">{genre}</span>
								{#if selectedGenres.tvShows.includes(genre)}
									<div class="bg-primary-500 text-white rounded-full p-0.5">
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
						<span class="text-sm text-surface-900-50">
							Selected: {selectedGenres.music.length}
						</span>
					</div>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{#each availableGenres.music as genre}
							<div 
								class={"flex items-center p-3 rounded-lg cursor-pointer border " + 
									(selectedGenres.music.includes(genre) 
										? "bg-primary-500/20 border-primary-500/50"
										: "bg-surface-200-800/30 border-transparent hover:bg-surface-200-800/60")}
								onclick={() => toggleGenre('music', genre)}
							>
								<span class="flex-1">{genre}</span>
								{#if selectedGenres.music.includes(genre)}
									<div class="bg-primary-500 text-white rounded-full p-0.5">
										<Check size={14} />
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
	
	<!-- Continue button -->
	<div class="text-center">
		<button
			class="btn preset-filled-primary-500 px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
			onclick={handleContinue}
			disabled={!isSelectionValid() || loadingGenres}
		>
			Continue
		</button>
	</div>
</div>