<script lang="ts">
	import { Film, Tv, Music, Check } from '@lucide/svelte';

	// Props for the component
	interface GenreSelectorProps {
		preferredMediaTypes: string[];
		genres: Record<string, string[]>;
		onChange: (mediaType: string, genresList: string[]) => void;
	}

	let { preferredMediaTypes = $bindable([]), genres, onChange }: GenreSelectorProps = $props();

	// Local state with Svelte 5 syntax
	let selectedGenres = $state({
		movies: genres.movies || [],
		series: genres.series || [],
		music: genres.music || []
	});

	// Initialize active tab based on preferred media types
	let activeTab = $state(
		preferredMediaTypes.includes('movies')
			? 'movies'
			: preferredMediaTypes.includes('series')
				? 'series'
				: preferredMediaTypes.includes('music')
					? 'music'
					: 'movies'
	);

	$effect(() => {
		console.log('preferredMediaTypes:', preferredMediaTypes);
	});

	// Available genres for each media type
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
		series: [
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

	// Toggle genre selection
	function toggleGenre(mediaType: 'movies' | 'series' | 'music', genre: string) {
		const index = selectedGenres[mediaType].indexOf(genre);
		if (index === -1) {
			selectedGenres[mediaType] = [...selectedGenres[mediaType], genre];
		} else {
			selectedGenres[mediaType] = selectedGenres[mediaType].filter((g) => g !== genre);
		}

		// Notify parent of the change with just the specific media type that changed
		onChange(mediaType, [...selectedGenres[mediaType]]);
	}

	// Activate a tab
	function setActiveTab(tab: 'movies' | 'series' | 'music') {
		if (preferredMediaTypes.includes(tab)) {
			activeTab = tab;
		}
	}

	// Effect to update selected genres when props change
	$effect(() => {
		selectedGenres = {
			movies: genres.movies || [],
			series: genres.series || [],
			music: genres.music || []
		};
	});
</script>

<div class="space-y-6">
	<!-- Tabs for different media types -->
	<div class="border-surface-200-800 border-b">
		<div class="flex space-x-4">
			{#if preferredMediaTypes.includes('movies')}
				<button
					class={'px-1 pb-2 transition-colors ' +
						(activeTab === 'movies'
							? 'border-primary-500 text-primary-500 border-b-2 font-medium'
							: 'text-surface-900-50 hover:text-surface-900-50-hover')}
					onclick={(e) => {
						e.preventDefault();
						setActiveTab('movies');
					}}
				>
					<div class="flex items-center gap-2">
						<Film size={16} />
						<span>Movies</span>
						{#if selectedGenres.movies?.length > 0}
							<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-0.5 text-xs">
								{selectedGenres.movies.length}
							</span>
						{/if}
					</div>
				</button>
			{/if}

			{#if preferredMediaTypes.includes('series')}
				<button
					class={'px-1 pb-2 transition-colors ' +
						(activeTab === 'series'
							? 'border-primary-500 text-primary-500 border-b-2 font-medium'
							: 'text-surface-900-50 hover:text-surface-900-50-hover')}
					onclick={(e) => {
						e.preventDefault();
						setActiveTab('series');
					}}
				>
					<div class="flex items-center gap-2">
						<Tv size={16} />
						<span>TV Shows</span>
						{#if selectedGenres.series?.length > 0}
							<span class="bg-primary-500/20 text-primary-500 rounded-full px-2 py-0.5 text-xs">
								{selectedGenres.series.length}
							</span>
						{/if}
					</div>
				</button>
			{/if}

			{#if preferredMediaTypes.includes('music')}
				<button
					class={'px-1 pb-2 transition-colors ' +
						(activeTab === 'music'
							? 'border-primary-500 text-primary-500 border-b-2 font-medium'
							: 'text-surface-900-50 hover:text-surface-900-50-hover')}
					onclick={(e) => {
						e.preventDefault();
						setActiveTab('music');
					}}
				>
					<div class="flex items-center gap-2">
						<Music size={16} />
						<span>Music</span>
						{#if selectedGenres.music?.length > 0}
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
	<div class="min-h-[200px]">
		{#if activeTab === 'movies' && preferredMediaTypes.includes('movies')}
			<div>
				<div class="mb-2 flex items-center justify-between">
					<h3 class="font-medium">Movie Genres</h3>
					<span class="text-surface-900-50 text-sm">
						Selected: {selectedGenres.movies?.length || 0}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each availableGenres.movies as genre}
						<div
							class={'flex cursor-pointer items-center rounded-lg border p-3 ' +
								(selectedGenres.movies?.includes(genre)
									? 'bg-primary-500/20 border-primary-500/50'
									: 'bg-surface-200-800/30 hover:bg-surface-200-800/60 border-transparent')}
							onclick={(e) => {
								e.preventDefault();
								toggleGenre('movies', genre);
							}}
						>
							<span class="flex-1">{genre}</span>
							{#if selectedGenres.movies?.includes(genre)}
								<div class="bg-primary-500 rounded-full p-0.5 text-white">
									<Check size={14} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if activeTab === 'series' && preferredMediaTypes.includes('series')}
			<div>
				<div class="mb-2 flex items-center justify-between">
					<h3 class="font-medium">TV Show Genres</h3>
					<span class="text-surface-900-50 text-sm">
						Selected: {selectedGenres.series?.length || 0}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each availableGenres.series as genre}
						<div
							class={'flex cursor-pointer items-center rounded-lg border p-3 ' +
								(selectedGenres.series?.includes(genre)
									? 'bg-primary-500/20 border-primary-500/50'
									: 'bg-surface-200-800/30 hover:bg-surface-200-800/60 border-transparent')}
							onclick={(e) => {
								e.preventDefault();
								toggleGenre('series', genre);
							}}
						>
							<span class="flex-1">{genre}</span>
							{#if selectedGenres.series?.includes(genre)}
								<div class="bg-primary-500 rounded-full p-0.5 text-white">
									<Check size={14} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if activeTab === 'music' && preferredMediaTypes.includes('music')}
			<div>
				<div class="mb-2 flex items-center justify-between">
					<h3 class="font-medium">Music Genres</h3>
					<span class="text-surface-900-50 text-sm">
						Selected: {selectedGenres.music?.length || 0}
					</span>
				</div>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each availableGenres.music as genre}
						<div
							class={'flex cursor-pointer items-center rounded-lg border p-3 ' +
								(selectedGenres.music?.includes(genre)
									? 'bg-primary-500/20 border-primary-500/50'
									: 'bg-surface-200-800/30 hover:bg-surface-200-800/60 border-transparent')}
							onclick={(e) => {
								e.preventDefault();
								toggleGenre('music', genre);
							}}
						>
							<span class="flex-1">{genre}</span>
							{#if selectedGenres.music?.includes(genre)}
								<div class="bg-primary-500 rounded-full p-0.5 text-white">
									<Check size={14} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-surface-900-50 p-4 text-center">
				<p>Please select at least one media type to see genre options.</p>
			</div>
		{/if}
	</div>
</div>
