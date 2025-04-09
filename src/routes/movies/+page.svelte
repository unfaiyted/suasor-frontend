<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import MovieSpotlightCarousel from '$lib/components/movie/MovieSpotlightCarousel.svelte';
	import MovieSection from '$lib/components/movie/MovieSection.svelte';
	import MovieFilters from '$lib/components/movie/MovieFilters.svelte';
	import MovieDetailModal from '$lib/components/movie/MovieDetailModal.svelte';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/util/ErrorAlert.svelte';
	import MediaCollectionManager from '$lib/components/movie/MediaCollectionManager.svelte';
	import { Check, Plus, Stars, Sparkles, Film, TrendingUp, Clock } from '@lucide/svelte';
	import { mediaCollection, type MediaItem } from '$lib/stores/mediaCollection';

	// Mock data for recommendations - in a real app this would come from your backend
	let recommendations = $state({
		continuePlaying: [],
		aiRecommended: [],
		trending: [],
		newReleases: []
	});

	let spotlightMovies = $state([]);

	// Mock user preferences
	let userPreferences = $state({
		favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
		savedToWatchlist: []
	});

	// UI state
	let isLoading = $state(true);
	let selectedCategory = $state('aiRecommended');
	let showDetail = $state(false);
	let selectedMovie = $state(null);
	let error = $state('');

	// Media collection state
	let collectionItems = $state<MediaItem[]>([]);

	// Subscribe to media collection store
	$effect(() => {
		const unsubscribe = mediaCollection.subscribe(store => {
			collectionItems = store.items;
		});
		
		return unsubscribe;
	});

	// Filter options
	let filters = $state({
		source: 'all', // all, plex, emby, jellyfin
		genre: 'all',
		sort: 'recommended' // recommended, rating, release_date
	});

	// Available genres for filter
	const genres = [
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
	];

	function toggleWatchlist(movie) {
		const index = userPreferences.savedToWatchlist.findIndex((id) => id === movie.id);
		if (index === -1) {
			userPreferences.savedToWatchlist = [...userPreferences.savedToWatchlist, movie.id];
		} else {
			userPreferences.savedToWatchlist = userPreferences.savedToWatchlist.filter(
				(id) => id !== movie.id
			);
		}
	}

	function toggleMovieInCollection(movie) {
		// Format movie data for collection if needed
		const mediaItem: MediaItem = {
			id: movie.id,
			title: movie.title,
			poster_path: movie.poster,
			release_date: movie.year.toString(),
			type: movie.type === 'series' ? 'tv' : 'movie'
		};

		if (isInCollection(movie.id)) {
			mediaCollection.removeItem(movie.id);
		} else {
			mediaCollection.addItem(mediaItem);
		}
	}

	function isInCollection(id) {
		return collectionItems.some(item => item.id === id);
	}

	function showMovieDetail(movie) {
		selectedMovie = movie;
		showDetail = true;
	}

	function handleCloseModal() {
		showDetail = false;
		setTimeout(() => {
			selectedMovie = null;
		}, 300); // Wait for animation to complete
	}

	function requestDownload(movie) {
		// In a real app, this would call the API to add to Radarr/Sonarr queue
		console.log('Requesting download for:', movie.title);
		// Show success message
	}

	onMount(async () => {
		// Fetch recommendations from the backend
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Mock data
			recommendations = {
				continuePlaying: [
					{
						id: 'cp1',
						title: 'Stranger Things',
						year: 2016,
						type: 'series',
						poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
						backdrop: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
						progress: 67,
						genres: ['Drama', 'Fantasy', 'Mystery'],
						rating: 8.6,
						overview:
							'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
						source: 'netflix',
						aiScore: 89,
						aiReason: 'Based on your history with supernatural dramas and 80s nostalgia content'
					},
					{
						id: 'cp2',
						title: 'Dune',
						year: 2021,
						type: 'movie',
						poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
						backdrop: 'https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
						progress: 45,
						genres: ['Science Fiction', 'Adventure'],
						rating: 7.9,
						overview:
							'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
						source: 'plex',
						aiScore: 94,
						aiReason: 'Matches your preference for epic sci-fi with complex world-building'
					}
				],
				aiRecommended: [
					{
						id: 'air1',
						title: 'Everything Everywhere All at Once',
						year: 2022,
						type: 'movie',
						poster: 'https://image.tmdb.org/t/p/original/u68AjlvlutfEIcpmbYpKcdi09ut.jpg',
						backdrop:
							'https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg',
						genres: ['Action', 'Adventure', 'Science Fiction'],
						rating: 8.0,
						overview:
							"An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
						source: 'jellyfin',
						aiScore: 98,
						aiReason: 'Highly matches your preference for mind-bending sci-fi with emotional depth'
					},
					{
						id: 'air2',
						title: 'The Expanse',
						year: 2015,
						type: 'series',
						poster: 'https://image.tmdb.org/t/p/w500/parVGWXg44ax9GXEPfqJU7z31nc.jpg',
						backdrop: 'https://image.tmdb.org/t/p/original/9hKsS4eH2kZEw6vdyGsQii8z2sc.jpg',
						genres: ['Drama', 'Mystery', 'Sci-Fi & Fantasy'],
						rating: 8.4,
						overview:
							"A thriller set two hundred years in the future following the case of a missing young woman who brings a hardened detective and a rogue ship's captain together in a race across the solar system to expose the greatest conspiracy in human history.",
						source: 'plex',
						aiScore: 92,
						aiReason: 'Aligns with your interest in political sci-fi with realistic space physics'
					}
				],
				trending: [
					{
						id: 't1',
						title: 'Oppenheimer',
						year: 2023,
						type: 'movie',
						poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
						backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
						genres: ['Drama', 'History'],
						rating: 8.2,
						overview:
							'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
						source: 'emby',
						aiScore: 85,
						aiReason: 'Recommended based on your interest in historical dramas and biopics'
					},
					{
						id: 't2',
						title: 'Poor Things',
						year: 2023,
						type: 'movie',
						poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
						backdrop: 'https://image.tmdb.org/t/p/original/nTPFkLUARmo1bYHfkfdNpRKgEOs.jpg',
						genres: ['Science Fiction', 'Comedy', 'Romance'],
						rating: 8.0,
						overview:
							'Brought back to life by an unorthodox scientist, a young woman runs off with a debauched lawyer on a whirlwind adventure across the continents.',
						source: 'jellyfin',
						aiScore: 90,
						aiReason: 'Matches your taste for visually striking films with dark humor'
					}
				],
				newReleases: [
					{
						id: 'nr1',
						title: 'Killers of the Flower Moon',
						year: 2023,
						type: 'movie',
						poster: 'https://image.tmdb.org/t/p/w500/dB6wJulBQaMRvJwvLpuLOZHICb.jpg',
						backdrop: 'https://image.tmdb.org/t/p/original/1X7vow16X7CnCoexXh4H4F2yDJv.jpg',
						genres: ['Crime', 'Drama', 'History'],
						rating: 7.5,
						overview:
							'When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one - until the FBI steps in to unravel the mystery.',
						source: 'plex',
						aiScore: 88,
						aiReason: 'Recommended based on your interest in crime dramas and historical narratives'
					},
					{
						id: 'nr2',
						title: 'Squid Game',
						year: 2021,
						type: 'series',
						poster: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
						backdrop: 'https://image.tmdb.org/t/p/original/qw3J9cNeLioOLoR68WX7z79aCdK.jpg',
						genres: ['Action', 'Mystery', 'Drama'],
						rating: 7.8,
						overview:
							"Hundreds of cash-strapped players accept a strange invitation to compete in children's games—with high stakes. But, a tempting prize awaits the victor.",
						source: 'emby',
						aiScore: 93,
						aiReason: 'Highly matches your pattern of viewing intense survival thrillers'
					}
				]
			};

			spotlightMovies = [
				recommendations.aiRecommended[0],
				recommendations.trending[0],
				recommendations.newReleases[0],
				recommendations.aiRecommended[1]
			];

			isLoading = false;
		} catch (err) {
			console.error(err);
			error = 'Failed to load recommendations. Please try again.';
			isLoading = false;
		}
	});

	// Event handlers
	function handleShowDetails(event) {
		showMovieDetail(event.detail);
	}

	function handleToggleWatchlist(event) {
		toggleWatchlist(event.detail);
	}

	function handleToggleCollection(event) {
		toggleMovieInCollection(event.detail);
	}

	function handleRequestDownload(event) {
		requestDownload(event.detail);
		handleCloseModal();
	}

	function isInWatchlist(id) {
		return userPreferences.savedToWatchlist.includes(id);
	}
</script>

<!-- SEO metadata -->
<svelte:head>
	<title>Movie Recommendations | Suasor</title>
	<meta name="description" content="Discover movies and TV shows tailored to your taste with AI-powered recommendations." />
</svelte:head>

<div class="mx-auto">
	<!-- Spotlight Carousel Section -->
	{#if !isLoading && spotlightMovies.length > 0}
		<div class="z-10 -mx-4 -mt-16">
			<MovieSpotlightCarousel
				movies={spotlightMovies}
				on:showDetails={handleShowDetails}
				on:toggleWatchlist={handleToggleWatchlist}
			>
				<svelte:fragment slot="watchlist-button" let:movie>
					{#if isInWatchlist(movie.id)}
						<Check size={18} />
						<span>In Watchlist</span>
					{:else}
						<Plus size={18} />
						<span>Add to Watchlist</span>
					{/if}
				</svelte:fragment>
			</MovieSpotlightCarousel>
		</div>
	{/if}

	<!-- Filters and Header Section -->
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h2 class="text-2xl font-bold flex items-center gap-2">
				<Film size={24} />
				Movie Recommendations
			</h2>
			<p class="text-sm text-surface-700-300 mt-1">
				Personalized recommendations powered by our AI to match your viewing preferences
			</p>
		</div>
		<MovieFilters {filters} {genres} />
	</div>

	<!-- AI Recommendation Banner -->
	<div class="bg-gradient-to-r from-secondary-800/30 to-secondary-500/10 mb-8 p-6 rounded-xl border border-secondary-700/20">
		<div class="flex flex-col md:flex-row items-center gap-4">
			<div class="bg-secondary-500/20 p-3 rounded-full">
				<Sparkles size={24} class="text-secondary-500" />
			</div>
			<div class="flex-1">
				<h3 class="text-lg font-semibold flex items-center gap-2">
					AI-Powered Recommendations
					<span class="text-xs bg-secondary-600/20 text-secondary-400 px-2 py-0.5 rounded">New</span>
				</h3>
				<p class="text-sm opacity-80">
					Our AI analyzes your watching patterns to recommend new content that matches your taste. 
					Select multiple movies to get even more personalized suggestions.
				</p>
			</div>
			<button class="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap">
				<Stars size={18} />
				<span>Tune Recommendations</span>
			</button>
		</div>
	</div>

	{#if isLoading}
		<div class="my-12 flex justify-center">
			<LoadingSpinner />
		</div>
	{:else if error}
		<ErrorAlert message={error} />
	{:else}
		<!-- Movie Sections -->
		{#if recommendations.continuePlaying.length > 0}
			<div class="mb-12">
				<div class="flex items-center gap-2 mb-4">
					<Clock size={20} class="text-yellow-500" />
					<h3 class="text-xl font-bold">Continue Watching</h3>
				</div>
				<MovieSection
					title=""
					movies={recommendations.continuePlaying}
					{isInWatchlist}
					isInCart={isInCollection}
					on:showDetails={handleShowDetails}
					on:toggleWatchlist={handleToggleWatchlist}
					on:toggleCart={handleToggleCollection}
				/>
			</div>
		{/if}

		<div class="mb-12">
			<div class="flex items-center gap-2 mb-4">
				<Sparkles size={20} class="text-secondary-500" />
				<h3 class="text-xl font-bold">AI Recommended For You</h3>
			</div>
			<MovieSection
				title=""
				movies={recommendations.aiRecommended}
				{isInWatchlist}
				isInCart={isInCollection}
				on:showDetails={handleShowDetails}
				on:toggleWatchlist={handleToggleWatchlist}
				on:toggleCart={handleToggleCollection}
			/>
		</div>

		<div class="mb-12">
			<div class="flex items-center gap-2 mb-4">
				<TrendingUp size={20} class="text-primary-500" />
				<h3 class="text-xl font-bold">Trending Now</h3>
			</div>
			<MovieSection
				title=""
				movies={recommendations.trending}
				{isInWatchlist}
				isInCart={isInCollection}
				on:showDetails={handleShowDetails}
				on:toggleWatchlist={handleToggleWatchlist}
				on:toggleCart={handleToggleCollection}
			/>
		</div>

		<div class="mb-12">
			<div class="flex items-center gap-2 mb-4">
				<Clock size={20} class="text-emerald-500" />
				<h3 class="text-xl font-bold">New Releases</h3>
			</div>
			<MovieSection
				title=""
				movies={recommendations.newReleases}
				{isInWatchlist}
				isInCart={isInCollection}
				on:showDetails={handleShowDetails}
				on:toggleWatchlist={handleToggleWatchlist}
				on:toggleCart={handleToggleCollection}
			/>
		</div>
	{/if}
</div>

<!-- Movie Detail Modal -->
<MovieDetailModal
	movie={selectedMovie}
	show={showDetail}
	isInWatchlist={isInWatchlist}
	isInCart={isInCollection}
	on:close={handleCloseModal}
	on:toggleWatchlist={handleToggleWatchlist}
	on:toggleCart={handleToggleCollection}
	on:requestDownload={handleRequestDownload}
/>

<!-- Floating Media Collection Manager -->
<MediaCollectionManager />