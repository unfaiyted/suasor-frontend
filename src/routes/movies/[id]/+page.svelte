<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import {
		Clock,
		Calendar,
		Star,
		Heart,
		Bookmark,
		Download,
		Play,
		BarChart3,
		RefreshCw,
		Film,
		Clapperboard,
		ThumbsUp,
		ThumbsDown,
		Check,
		Users,
		ListChecks,
		Tv
	} from '@lucide/svelte';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/util/ErrorAlert.svelte';

	// Get the movie ID from the route parameter
	const movieId = $page.params.id;

	// UI state
	let isLoading = true;
	let error = '';
	let movie: any = null;
	let similarMovies: any[] = [];
	let inWatchlist = false;
	let activeTab = 'overview';

	// Mock data for watch providers
	const watchProviders = [
		{ id: 'plex', name: 'Plex', logo: '/plex-alt.svg', available: true },
		{ id: 'jellyfin', name: 'Jellyfin', logo: '/jellyfin.svg', available: true },
		{ id: 'emby', name: 'Emby', logo: '/emby.svg', available: false }
	];

	// Mock ratings from different sources
	const externalRatings = [
		{
			source: 'IMDb',
			score: 7.8,
			outOf: 10,
			logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg'
		},
		{
			source: 'Rotten Tomatoes',
			score: 91,
			outOf: 100,
			logo: 'https://www.rottentomatoes.com/assets/pizza-pie/images/rtlogo.9b892cff3fd.png'
		},
		{
			source: 'Metacritic',
			score: 78,
			outOf: 100,
			logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Metacritic.svg/1024px-Metacritic.svg.png'
		}
	];

	// Suasor recommendation score (mock data)
	const recommendationScore = 89;

	// Toggle watchlist status
	function toggleWatchlist() {
		inWatchlist = !inWatchlist;
		// In a real app, call API to update watchlist
	}

	// Handle play button click based on available providers
	function playMovie(providerId: string) {
		console.log(`Playing movie via ${providerId}`);
		// In a real app, redirect to the appropriate media server
	}

	// Handle download request
	function requestDownload() {
		console.log('Requesting download');
		// In a real app, send to Radarr
	}

	// Format runtime from minutes to hours and minutes
	function formatRuntime(minutes: number) {
		if (!minutes) return 'Unknown';
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	onMount(async () => {
		// Fetch movie details from the API
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock movie data - in a real app this would come from your API
			movie = {
				id: movieId,
				title: 'Everything Everywhere All at Once',
				tagline: 'The universe is so much bigger than you realize',
				year: 2022,
				type: 'movie',
				genres: ['Action', 'Adventure', 'Science Fiction'],
				runtime: 139,
				rating: 8.0,
				overview:
					"An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
				poster: 'https://image.tmdb.org/t/p/original/u68AjlvlutfEIcpmbYpKcdi09ut.jpg',
				backdrop:
					'https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg',
				source: 'jellyfin',
				directors: ['Daniel Kwan', 'Daniel Scheinert'],
				writers: ['Daniel Kwan', 'Daniel Scheinert'],
				cast: [
					{
						name: 'Michelle Yeoh',
						character: 'Evelyn Wang',
						photo:
							'https://media.themoviedb.org/t/p/w138_and_h175_face/wI2TrPKCYYrOhQXjDYFNvDKOQoS.jpg'
					},
					{
						name: 'Ke Huy Quan',
						character: 'Waymond Wang',
						photo:
							'https://media.themoviedb.org/t/p/w138_and_h175_face/nGXbdtYzlT2aG4tnQYnqthFpjsH.jpg'
					},
					{
						name: 'Stephanie Hsu',
						character: 'Joy Wang / Jobu Tupaki',
						photo:
							'https://media.themoviedb.org/t/p/w138_and_h175_face/vv5qGDLZwYgTcxGBRAf4qJkZ3qP.jpg'
					},
					{
						name: 'Jamie Lee Curtis',
						character: 'Deirdre Beaubeirdre',
						photo:
							'https://media.themoviedb.org/t/p/w138_and_h175_face/tZaAJbGg4d1AnjcWTvXaKzBP91G.jpg'
					}
				],
				reviews: [
					{
						author: 'MovieFan123',
						rating: 5,
						text: "Absolutely mind-blowing! This film takes you on a journey unlike anything I've ever seen. The concept of the multiverse is explored in such a creative and emotionally resonant way.",
						date: '2022-04-15'
					},
					{
						author: 'CinemaLover',
						rating: 4,
						text: 'Great performances, especially from Michelle Yeoh who delivers on every level. The film does get a bit too chaotic at times, but the emotional core keeps it grounded.',
						date: '2022-05-02'
					},
					{
						author: 'FilmCritic22',
						rating: 5,
						text: 'A perfect blend of action, comedy, and heart. The directing duo known as "Daniels" have created something truly special here.',
						date: '2022-04-20'
					}
				],
				awards:
					'Academy Award for Best Picture, Best Director, Best Actress, Best Supporting Actor, Best Supporting Actress, Best Original Screenplay',
				trailerUrl: 'https://www.youtube.com/watch?v=wxN1T1uxQ2g',
				availableOn: ['Plex', 'Jellyfin'],
				releaseDate: '2022-03-25',
				language: 'English, Mandarin, Cantonese',
				productionCompanies: ['A24', 'AGBO'],
				budget: '$25 million',
				boxOffice: '$141 million'
			};

			// Fetch similar movies
			similarMovies = [
				{
					id: 'sm1',
					title: 'The Matrix',
					year: 1999,
					poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
					rating: 8.7
				},
				{
					id: 'sm2',
					title: 'Inception',
					year: 2010,
					poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
					rating: 8.3
				},
				{
					id: 'sm3',
					title: 'Doctor Strange in the Multiverse of Madness',
					year: 2022,
					poster: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg',
					rating: 7.0
				},
				{
					id: 'sm4',
					title: 'Swiss Army Man',
					year: 2016,
					poster: 'https://image.tmdb.org/t/p/w500/oKDyFwbHOjCYyGddT3JPeZnY8oc.jpg',
					rating: 7.0
				}
			];

			isLoading = false;
		} catch (err) {
			console.error(err);
			error = 'Failed to load movie details. Please try again.';
			isLoading = false;
		}
	});
</script>

<svelte:head>
	{#if movie}
		<title>{movie.title} ({movie.year}) | Suasor</title>
		<meta name="description" content={movie.overview} />
	{:else}
		<title>Movie Details | Suasor</title>
	{/if}
</svelte:head>

{#if isLoading}
	<div class="flex h-96 items-center justify-center">
		<LoadingSpinner />
	</div>
{:else if error}
	<div class="p-6">
		<ErrorAlert message={error} />
	</div>
{:else if movie}
	<!-- Hero Section with Backdrop -->
	<div class="relative z-10 -mx-4 -mt-16">
		<!-- Backdrop Image -->
		<div class="absolute inset-0 h-[70vh] w-full">
			<img src={movie.backdrop} alt={movie.title} class="h-full w-full object-cover" />
			<!-- Gradient Overlay -->
			<div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
			<div
				class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"
			></div>
		</div>

		<!-- Hero Content -->
		<div class="relative z-10 mx-auto max-w-7xl px-4 pt-40 pb-16">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<!-- Poster Column -->
				<div class="flex flex-col items-center md:items-start">
					<div class="w-64 overflow-hidden rounded-lg shadow-2xl">
						<img src={movie.poster} alt={movie.title} class="w-full" />
					</div>

					<!-- Watch Providers -->
					<div class="bg-surface-200-800/60 mt-6 w-64 rounded-lg p-4 backdrop-blur-sm">
						<h3 class="mb-3 text-center text-sm font-semibold tracking-wider uppercase">
							Watch Now
						</h3>
						<div class="flex flex-col gap-2">
							{#each watchProviders.filter((p) => p.available) as provider}
								<button
									class="bg-surface-100-900/80 hover:bg-surface-300-700 flex items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors"
									on:click={() => playMovie(provider.id)}
								>
									<div class="flex items-center gap-2">
										<img src={provider.logo} alt={provider.name} class="h-5 w-5" />
										<span>{provider.name}</span>
									</div>
									<Play size={16} />
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Movie Info Column -->
				<div class="md:col-span-2">
					<div class="text-primary-500 mb-3 flex items-center gap-2 text-sm font-medium">
						<span>{movie.year}</span>
						<span>•</span>
						<span class="flex items-center gap-1">
							<Clock size={14} />
							{formatRuntime(movie.runtime)}
						</span>
					</div>

					<h1 class="mb-2 text-4xl font-bold text-white">{movie.title}</h1>
					{#if movie.tagline}
						<p class="mb-4 text-lg text-gray-400 italic">{movie.tagline}</p>
					{/if}

					<div class="mb-6 flex flex-wrap gap-2">
						{#each movie.genres as genre}
							<span class="bg-surface-200-800/80 rounded-full px-3 py-1 text-xs font-medium">
								{genre}
							</span>
						{/each}
					</div>

					<!-- Recommendation Score -->
					<div class="mb-6 flex items-center gap-6">
						<div class="flex flex-col items-center">
							<div class="relative h-16 w-16">
								<svg viewBox="0 0 36 36" class="h-16 w-16 rotate-[-90deg]">
									<circle cx="18" cy="18" r="16" fill="none" stroke="#333" stroke-width="2"
									></circle>
									<circle
										cx="18"
										cy="18"
										r="16"
										fill="none"
										stroke="#BB86FC"
										stroke-width="2"
										stroke-dasharray={`${(2 * Math.PI * 16 * recommendationScore) / 100} ${2 * Math.PI * 16 * (1 - recommendationScore / 100)}`}
									></circle>
								</svg>
								<div class="absolute inset-0 flex items-center justify-center text-lg font-bold">
									{recommendationScore}%
								</div>
							</div>
							<span class="mt-1 text-xs font-medium">Match Score</span>
						</div>

						{#each externalRatings as rating}
							<div class="flex flex-col items-center">
								<div class="flex items-center gap-1">
									<img src={rating.logo} alt={rating.source} class="h-5 w-5 object-contain" />
									<span class="text-lg font-medium"
										>{rating.score}<span class="text-xs opacity-70">/{rating.outOf}</span></span
									>
								</div>
								<span class="mt-1 text-xs font-medium">{rating.source}</span>
							</div>
						{/each}
					</div>

					<!-- Action Buttons -->
					<div class="mb-6 flex flex-wrap gap-3">
						<button class="btn variant-filled-primary">
							<Play size={16} class="mr-2" />
							<span>Watch Now</span>
						</button>
						<button class="btn variant-soft-surface" on:click={toggleWatchlist}>
							{#if inWatchlist}
								<Check size={16} class="mr-2" />
								<span>In Watchlist</span>
							{:else}
								<Bookmark size={16} class="mr-2" />
								<span>Add to Watchlist</span>
							{/if}
						</button>
						<button class="btn variant-soft-surface" on:click={requestDownload}>
							<Download size={16} class="mr-2" />
							<span>Request Download</span>
						</button>
					</div>

					<!-- Overview -->
					<p class="mb-6 max-w-4xl text-lg leading-relaxed text-gray-200">
						{movie.overview}
					</p>

					<!-- Director, Writer, etc -->
					<div class="mb-6 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
						{#if movie.directors?.length}
							<div>
								<span class="font-medium text-gray-400">Director:</span>
								<span class="ml-2">{movie.directors.join(', ')}</span>
							</div>
						{/if}
						{#if movie.writers?.length}
							<div>
								<span class="font-medium text-gray-400">Writer:</span>
								<span class="ml-2">{movie.writers.join(', ')}</span>
							</div>
						{/if}
						{#if movie.releaseDate}
							<div>
								<span class="font-medium text-gray-400">Release Date:</span>
								<span class="ml-2">{movie.releaseDate}</span>
							</div>
						{/if}
						{#if movie.language}
							<div>
								<span class="font-medium text-gray-400">Language:</span>
								<span class="ml-2">{movie.language}</span>
							</div>
						{/if}
						{#if movie.productionCompanies}
							<div>
								<span class="font-medium text-gray-400">Production:</span>
								<span class="ml-2">{movie.productionCompanies.join(', ')}</span>
							</div>
						{/if}
						{#if movie.budget}
							<div>
								<span class="font-medium text-gray-400">Budget:</span>
								<span class="ml-2">{movie.budget}</span>
							</div>
						{/if}
						{#if movie.boxOffice}
							<div>
								<span class="font-medium text-gray-400">Box Office:</span>
								<span class="ml-2">{movie.boxOffice}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Tabs for additional content -->
	<div class="mx-auto mb-8 max-w-7xl px-4 pt-6">
		<div class="mb-6 flex space-x-1 overflow-x-auto border-b border-gray-700 pb-2">
			<button
				class="flex items-center px-4 py-2 text-sm font-medium transition-colors {activeTab ===
				'overview'
					? 'border-primary-500 text-primary-500 border-b-2'
					: 'text-gray-400 hover:text-white'}"
				on:click={() => (activeTab = 'overview')}
			>
				<Film size={16} class="mr-2" />
				Overview
			</button>
			<button
				class="flex items-center px-4 py-2 text-sm font-medium transition-colors {activeTab ===
				'cast'
					? 'border-primary-500 text-primary-500 border-b-2'
					: 'text-gray-400 hover:text-white'}"
				on:click={() => (activeTab = 'cast')}
			>
				<Users size={16} class="mr-2" />
				Cast & Crew
			</button>
			<button
				class="flex items-center px-4 py-2 text-sm font-medium transition-colors {activeTab ===
				'reviews'
					? 'border-primary-500 text-primary-500 border-b-2'
					: 'text-gray-400 hover:text-white'}"
				on:click={() => (activeTab = 'reviews')}
			>
				<ThumbsUp size={16} class="mr-2" />
				Reviews
			</button>
			<button
				class="flex items-center px-4 py-2 text-sm font-medium transition-colors {activeTab ===
				'similar'
					? 'border-primary-500 text-primary-500 border-b-2'
					: 'text-gray-400 hover:text-white'}"
				on:click={() => (activeTab = 'similar')}
			>
				<ListChecks size={16} class="mr-2" />
				Similar
			</button>
		</div>

		<!-- Tab Content -->
		<div class="min-h-[400px]">
			{#if activeTab === 'overview'}
				<!-- Awards -->
				{#if movie.awards}
					<div class="mb-6">
						<h3 class="mb-3 text-xl font-semibold">Awards</h3>
						<p class="text-gray-300">{movie.awards}</p>
					</div>
				{/if}

				<!-- Trailer -->
				{#if movie.trailerUrl}
					<div class="mb-6">
						<h3 class="mb-3 text-xl font-semibold">Trailer</h3>
						<div class="aspect-video overflow-hidden rounded-lg">
							<iframe
								title="Movie Trailer"
								width="100%"
								height="100%"
								src={movie.trailerUrl.replace('watch?v=', 'embed/')}
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					</div>
				{/if}

				<!-- Recommendation Reason -->
				<div class="bg-surface-200-800/60 mb-6 rounded-lg p-6">
					<h3 class="mb-3 text-xl font-semibold">Why We Recommend This</h3>
					<p class="text-gray-300">
						Based on your viewing history and preferences, our AI thinks you'll enjoy this title.
						You've previously watched similar titles in the {movie.genres.join(', ')} genres, and this
						movie has been highly rated by users with similar taste profiles.
					</p>
					<div class="mt-4 flex items-center gap-4">
						<span class="text-sm">Was this recommendation useful?</span>
						<button
							class="bg-surface-100-900 rounded-full p-2 text-green-500 hover:bg-green-900/30"
						>
							<ThumbsUp size={16} />
						</button>
						<button class="bg-surface-100-900 rounded-full p-2 text-red-500 hover:bg-red-900/30">
							<ThumbsDown size={16} />
						</button>
					</div>
				</div>

				<!-- Media Server Integration Status -->
				<div class="mb-6">
					<h3 class="mb-3 text-xl font-semibold">Media Servers</h3>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{#each watchProviders as provider}
							<div class="bg-surface-200-800/60 flex items-center justify-between rounded-lg p-4">
								<div class="flex items-center gap-3">
									<img src={provider.logo} alt={provider.name} class="h-8 w-8" />
									<span>{provider.name}</span>
								</div>
								{#if provider.available}
									<span
										class="rounded-full bg-green-900/30 px-2 py-1 text-xs font-medium text-green-500"
										>Available</span
									>
								{:else}
									<span
										class="rounded-full bg-red-900/30 px-2 py-1 text-xs font-medium text-red-500"
										>Not Available</span
									>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'cast'}
				<!-- Cast & Crew Tab -->
				<div class="mb-6">
					<h3 class="mb-4 text-xl font-semibold">Cast</h3>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{#each movie.cast as person}
							<div
								class="group bg-surface-200-800/60 flex flex-col overflow-hidden rounded-lg transition-transform hover:scale-105"
							>
								<img
									src={person.photo}
									alt={person.name}
									class="aspect-[2/3] w-full object-cover"
								/>
								<div class="p-3">
									<h4 class="font-medium text-white">{person.name}</h4>
									<p class="text-sm text-gray-400">{person.character}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Crew Information -->
				<div class="mb-6">
					<h3 class="mb-4 text-xl font-semibold">Crew</h3>
					<div class="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
						{#if movie.directors?.length}
							<div>
								<h4 class="font-medium">Directors</h4>
								<ul class="mt-1 space-y-1 text-gray-300">
									{#each movie.directors as director}
										<li>{director}</li>
									{/each}
								</ul>
							</div>
						{/if}

						{#if movie.writers?.length}
							<div>
								<h4 class="font-medium">Writers</h4>
								<ul class="mt-1 space-y-1 text-gray-300">
									{#each movie.writers as writer}
										<li>{writer}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>
			{:else if activeTab === 'reviews'}
				<!-- Reviews Tab -->
				<div class="mb-6">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-xl font-semibold">User Reviews</h3>
						<button class="btn variant-soft-surface btn-sm">Write a Review</button>
					</div>

					<div class="space-y-4">
						{#each movie.reviews as review}
							<div class="bg-surface-200-800/60 rounded-lg p-4">
								<div class="mb-2 flex items-center justify-between">
									<span class="font-medium">{review.author}</span>
									<div class="flex items-center">
										{#each Array(5) as _, i}
											<Star
												size={16}
												class={i < review.rating ? 'text-yellow-500' : 'text-gray-600'}
											/>
										{/each}
										<span class="ml-2 text-sm text-gray-400">{review.date}</span>
									</div>
								</div>
								<p class="text-gray-300">{review.text}</p>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'similar'}
				<!-- Similar Movies Tab -->
				<div class="mb-6">
					<h3 class="mb-4 text-xl font-semibold">Similar Movies</h3>
					<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{#each similarMovies as movie}
							<a
								href={`/movies/${movie.id}`}
								class="group flex flex-col overflow-hidden rounded-lg transition-transform hover:scale-105"
							>
								<div class="relative aspect-[2/3] overflow-hidden">
									<img src={movie.poster} alt={movie.title} class="h-full w-full object-cover" />
									<div
										class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<span class="text-sm font-medium">{movie.title}</span>
										<div class="flex items-center gap-1 text-xs">
											<span>{movie.year}</span>
											<span class="text-yellow-500">★ {movie.rating}</span>
										</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

