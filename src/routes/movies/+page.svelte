<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Plus, Play, Info, Calendar, Star, Clock, Heart, Bookmark, Check } from '@lucide/svelte';
	import MovieSpotlightCarousel from '$lib/components/MovieSpotlightCarousel.svelte';

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

			MovieSpotlightCarousel;
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
	function handleShowDetails(event) {
		showMovieDetail(event.detail);
	}

	function handleToggleWatchlist(event) {
		toggleWatchlist(event.detail);
	}
	function isInWatchlist(id) {
		return userPreferences.savedToWatchlist.includes(id);
	}
</script>

<div class="container mx-auto">
	{#if !isLoading && spotlightMovies.length > 0}
		<div class="-mx-4">
			<MovieSpotlightCarousel
				movies={spotlightMovies}
				on:showDetails={handleShowDetails}
				on:toggleWatchlist={handleToggleWatchlist}
			>
				<!-- Optional: Custom watchlist button slot -->
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

	<!-- Hero Section with Featured Recommendation -->
	<!-- {#if !isLoading && recommendations.aiRecommended.length > 0} -->
	<!-- <div -->
	<!-- 	class="relative mb-8 h-[400px] w-full overflow-hidden rounded-xl bg-cover bg-center" -->
	<!-- 	style="background-image: url('{recommendations.aiRecommended[0].backdrop}');" -->
	<!-- > -->
	<!-- 	<div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div> -->
	<!-- 	<div class="absolute bottom-0 left-0 p-6 text-white"> -->
	<!-- 		<span class="bg-primary-500 mb-2 inline-block rounded px-2 py-1 text-sm font-bold"> -->
	<!-- 			AI Recommended For You -->
	<!-- 		</span> -->
	<!-- 		<h1 class="h1 mb-2 text-4xl font-bold">{recommendations.aiRecommended[0].title}</h1> -->
	<!-- 		<p class="mb-4 max-w-2xl"> -->
	<!-- 			{recommendations.aiRecommended[0].overview.substring(0, 150)}... -->
	<!-- 		</p> -->
	<!-- 		<div class="flex gap-3"> -->
	<!-- 			<button class="btn preset-filled-primary-500 flex items-center gap-2"> -->
	<!-- 				<Play size={16} /> -->
	<!-- 				<span>Watch Trailer</span> -->
	<!-- 			</button> -->
	<!-- 			<button -->
	<!-- 				class="btn preset-outlined-surface-500 flex items-center gap-2" -->
	<!-- 				on:click={() => showMovieDetail(recommendations.aiRecommended[0])} -->
	<!-- 			> -->
	<!-- 				<Info size={16} /> -->
	<!-- 				<span>More Info</span> -->
	<!-- 			</button> -->
	<!-- 		</div> -->
	<!-- 	</div> -->
	<!-- </div> -->
	<!-- {/if} -->

	<!-- Controls & Filters -->
	<div class="mt-6 mb-6 flex flex-wrap items-center justify-between gap-4">
		<div class="flex flex-wrap items-center gap-4">
			<h2 class="h2 text-primary-500 font-bold">Movie Recommendations</h2>

			<div class="flex gap-2">
				<select class="select !bg-surface-200-800" bind:value={filters.source}>
					<option value="all">All Sources</option>
					<option value="plex">Plex</option>
					<option value="emby">Emby</option>
					<option value="jellyfin">Jellyfin</option>
				</select>

				<select class="select !bg-surface-200-800" bind:value={filters.genre}>
					<option value="all">All Genres</option>
					{#each genres as genre}
						<option value={genre}>{genre}</option>
					{/each}
				</select>

				<select class="select !bg-surface-200-800" bind:value={filters.sort}>
					<option value="recommended">AI Recommended</option>
					<option value="rating">Highest Rated</option>
					<option value="release_date">Newest First</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Loading State -->
	{#if isLoading}
		<div class="flex h-64 items-center justify-center">
			<div class="loader"></div>
		</div>
	{:else if error}
		<div class="alert alert-error mb-4" transition:fade>
			<div class="card preset-outlined-error-500 p-4">
				<p class="font-bold">Error</p>
				<p class="text-xs opacity-60">{error}</p>
			</div>
		</div>
	{:else}
		<!-- Continue Watching -->
		{#if recommendations.continuePlaying.length > 0}
			<div class="mb-8">
				<h3 class="mb-4 text-xl font-bold">Continue Watching</h3>
				<div
					class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
				>
					{#each recommendations.continuePlaying as item}
						<div
							class="group relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
							on:click={() => showMovieDetail(item)}
						>
							<img src={item.poster} alt={item.title} class="h-[300px] w-full object-cover" />
							<div
								class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4"
							>
								<h4 class="font-bold text-white">{item.title}</h4>
								<div class="mt-1 flex items-center gap-2 text-sm text-gray-300">
									<span>{item.year}</span>
									<span>•</span>
									<span>{item.type === 'movie' ? 'Movie' : 'Series'}</span>
								</div>
								<div class="mt-2 h-1 w-full rounded bg-gray-700">
									<div class="bg-primary-500 h-full rounded" style="width: {item.progress}%"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- AI Recommended -->
		<div class="mb-8">
			<h3 class="mb-4 text-xl font-bold">AI Recommended For You</h3>
			<div
				class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each recommendations.aiRecommended as item}
					<div
						class="group relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
						on:click={() => showMovieDetail(item)}
					>
						<img src={item.poster} alt={item.title} class="h-[300px] w-full object-cover" />
						<div class="absolute top-2 right-2 flex flex-col gap-2">
							<button
								class="hover:bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors"
								on:click|stopPropagation={() => toggleWatchlist(item)}
							>
								{#if isInWatchlist(item.id)}
									<Check size={16} />
								{:else}
									<Plus size={16} />
								{/if}
							</button>
						</div>
						<div
							class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4"
						>
							<h4 class="font-bold text-white">{item.title}</h4>
							<div class="mt-1 flex items-center gap-2 text-sm text-gray-300">
								<span>{item.year}</span>
								<span>•</span>
								<span>{item.type === 'movie' ? 'Movie' : 'Series'}</span>
							</div>
							<div class="mt-1 flex items-center gap-1 text-sm text-yellow-400">
								<Star size={14} />
								<span>{item.rating}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Trending Now -->
		<div class="mb-8">
			<h3 class="mb-4 text-xl font-bold">Trending Now</h3>
			<div
				class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each recommendations.trending as item}
					<div
						class="group relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
						on:click={() => showMovieDetail(item)}
					>
						<img src={item.poster} alt={item.title} class="h-[300px] w-full object-cover" />
						<div class="absolute top-2 right-2 flex flex-col gap-2">
							<button
								class="hover:bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors"
								on:click|stopPropagation={() => toggleWatchlist(item)}
							>
								{#if isInWatchlist(item.id)}
									<Check size={16} />
								{:else}
									<Plus size={16} />
								{/if}
							</button>
						</div>
						<div
							class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4"
						>
							<h4 class="font-bold text-white">{item.title}</h4>
							<div class="mt-1 flex items-center gap-2 text-sm text-gray-300">
								<span>{item.year}</span>
								<span>•</span>
								<span>{item.type === 'movie' ? 'Movie' : 'Series'}</span>
							</div>
							<div class="mt-1 flex items-center gap-1 text-sm text-yellow-400">
								<Star size={14} />
								<span>{item.rating}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- New Releases -->
		<div class="mb-8">
			<h3 class="mb-4 text-xl font-bold">New Releases</h3>
			<div
				class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each recommendations.newReleases as item}
					<div
						class="group relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
						on:click={() => showMovieDetail(item)}
					>
						<img src={item.poster} alt={item.title} class="h-[300px] w-full object-cover" />
						<div class="absolute top-2 right-2 flex flex-col gap-2">
							<button
								class="hover:bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors"
								on:click|stopPropagation={() => toggleWatchlist(item)}
							>
								{#if isInWatchlist(item.id)}
									<Check size={16} />
								{:else}
									<Plus size={16} />
								{/if}
							</button>
						</div>
						<div
							class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4"
						>
							<h4 class="font-bold text-white">{item.title}</h4>
							<div class="mt-1 flex items-center gap-2 text-sm text-gray-300">
								<span>{item.year}</span>
								<span>•</span>
								<span>{item.type === 'movie' ? 'Movie' : 'Series'}</span>
							</div>
							<div class="mt-1 flex items-center gap-1 text-sm text-yellow-400">
								<Star size={14} />
								<span>{item.rating}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Movie Detail Modal -->
{#if showDetail && selectedMovie}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
		transition:fade={{ duration: 200 }}
		on:click={closeDetail}
	>
		<div
			class="bg-surface-100-900 relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl"
			transition:fly={{ y: 20, duration: 300 }}
			on:click|stopPropagation={() => {}}
		>
			<button
				class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white"
				on:click={closeDetail}
			>
				×
			</button>

			<div
				class="relative h-[300px] w-full bg-cover bg-center sm:h-[400px]"
				style="background-image: url('{selectedMovie.backdrop}');"
			>
				<div class="from-surface-100-900 absolute inset-0 bg-gradient-to-t to-transparent"></div>
				<div class="absolute bottom-0 left-0 p-6 text-white">
					<h2 class="text-3xl font-bold">{selectedMovie.title}</h2>
					<div class="mt-2 flex flex-wrap items-center gap-3 text-sm">
						<span class="flex items-center gap-1">
							<Calendar size={14} />
							{selectedMovie.year}
						</span>
						<span class="flex items-center gap-1">
							<Star size={14} class="text-yellow-400" />
							{selectedMovie.rating}
						</span>
						<span class="bg-surface-200-800 rounded-full px-2 py-0.5">
							{selectedMovie.type === 'movie' ? 'Movie' : 'Series'}
						</span>
						{#each selectedMovie.genres as genre}
							<span class="bg-surface-200-800 rounded-full px-2 py-0.5">{genre}</span>
						{/each}
					</div>
				</div>
			</div>

			<div class="p-6">
				<p class="mb-6">{selectedMovie.overview}</p>

				<div class="mb-6 flex flex-wrap gap-2">
					<button class="btn preset-filled-primary-500 flex items-center gap-2">
						<Play size={16} />
						<span>Watch Now</span>
					</button>

					<button
						class="btn preset-outlined-surface-500 flex items-center gap-2"
						on:click={() => toggleWatchlist(selectedMovie)}
					>
						{#if isInWatchlist(selectedMovie.id)}
							<Check size={16} />
							<span>In Watchlist</span>
						{:else}
							<Bookmark size={16} />
							<span>Add to Watchlist</span>
						{/if}
					</button>

					<button
						class="btn preset-outlined-surface-500 flex items-center gap-2"
						on:click={() => requestDownload(selectedMovie)}
					>
						<Calendar size={16} />
						<span>Request Download</span>
					</button>
				</div>

				<div class="border-surface-200-800 border-t pt-4">
					<h3 class="mb-2 text-lg font-bold">Why we recommend this</h3>
					<p class="text-sm opacity-80">
						Based on your watching preferences and history, our AI found similarities with other
						content you've enjoyed. You tend to watch {selectedMovie.genres.join(', ')} content frequently
						and rate them highly.
					</p>
				</div>

				<div class="mt-4 text-sm">
					<p class="opacity-60">
						Available on: <span class="text-primary-500 font-medium">{selectedMovie.source}</span>
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.loader {
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-left-color: #646cff;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
