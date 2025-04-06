<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import MovieSpotlightCarousel from '$lib/components/movie/MovieSpotlightCarousel.svelte';
	import MovieSection from '$lib/components/movie/MovieSection.svelte';
	import MovieFilters from '$lib/components/movie/MovieFilters.svelte';
	import MovieDetailModal from '$lib/components/movie/MovieDetailModal.svelte';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/util/ErrorAlert.svelte';
	import { Check, Plus } from '@lucide/svelte';

	// Mock data for recommendations - in a real app this would come from your backend
	let recommendations = {
		continuePlaying: [],
		aiRecommended: [],
		trending: [],
		newReleases: []
	};

	let spotlightMovies = [];

	// Mock user preferences
	let userPreferences = {
		favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
		savedToWatchlist: []
	};

	// UI state
	let isLoading = true;
	let selectedCategory = 'aiRecommended';
	let showDetail = false;
	let selectedMovie = null;
	let error = '';

	// Filter options
	let filters = {
		source: 'all', // all, plex, emby, jellyfin
		genre: 'all',
		sort: 'recommended' // recommended, rating, release_date
	};

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

	function showMovieDetail(movie) {
		selectedMovie = movie;
		showDetail = true;
	}

	function closeDetail() {
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
						source: 'netflix'
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
						source: 'plex'
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
						source: 'jellyfin'
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
						source: 'plex'
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
						source: 'emby'
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
						source: 'jellyfin'
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
						source: 'plex'
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
						source: 'emby'
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

	// Handle events from the carousel
	function handleShowDetails(event: MouseEvent) {
		showMovieDetail(event.detail);
	}

	function handleToggleWatchlist(event: MouseEvent) {
		toggleWatchlist(event.detail);
	}

	function handleRequestDownload(event: MouseEvent) {
		closeDetail();
	}

	function isInWatchlist(id) {
		return userPreferences.savedToWatchlist.includes(id);
	}
</script>

<div class="mx-auto">
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

	<MovieFilters {filters} {genres} />

	{#if isLoading}
		<LoadingSpinner />
	{:else if error}
		<ErrorAlert message={error} />
	{:else}
		<!-- Movie Sections -->
		{#if recommendations.continuePlaying.length > 0}
			<MovieSection
				title="Continue Watching"
				movies={recommendations.continuePlaying}
				{isInWatchlist}
				on:showDetails={handleShowDetails}
				on:toggleWatchlist={handleToggleWatchlist}
			/>
		{/if}

		<MovieSection
			title="AI Recommended For You"
			movies={recommendations.aiRecommended}
			{isInWatchlist}
			on:showDetails={handleShowDetails}
			on:toggleWatchlist={handleToggleWatchlist}
		/>

		<MovieSection
			title="Trending Now"
			movies={recommendations.trending}
			{isInWatchlist}
			on:showDetails={handleShowDetails}
			on:toggleWatchlist={handleToggleWatchlist}
		/>

		<MovieSection
			title="New Releases"
			movies={recommendations.newReleases}
			{isInWatchlist}
			on:showDetails={handleShowDetails}
			on:toggleWatchlist={handleToggleWatchlist}
		/>
	{/if}
</div>

<!-- Movie Detail Modal -->
<MovieDetailModal
	movie={selectedMovie}
	show={showDetail}
	{isInWatchlist}
	on:close={handleCloseModal}
	on:toggleWatchlist={handleToggleWatchlist}
	on:requestDownload={handleRequestDownload}
/>
