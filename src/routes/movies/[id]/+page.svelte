<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/util/ErrorAlert.svelte';
	import MovieHeader from '$lib/components/movie/MovieHeader.svelte';
	import MovieActions from '$lib/components/movie/MovieActions.svelte';
	import MovieDetailTabs from '$lib/components/movie/MovieDetailTabs.svelte';
	import MovieRecommendationReason from '$lib/components/movie/MovieRecommendationReason.svelte';
	import MovieSimilar from '$lib/components/movie/MovieSimilar.svelte';
	import MediaCollectionManager from '$lib/components/movie/MediaCollectionManager.svelte';

	// Get the movie ID from the route parameter
	const movieId = $page.params.id;

	// UI state
	let isLoading = $state<boolean>(true);
	let error = $state<string>('');
	let movie: any = $state<any>(null);
	let similarMovies: any[] = $state<any[]>([]);
	let isInCollection = $state<boolean>(false);

	// Mock client options for media servers
	const clientOptions = ['Plex', 'Jellyfin', 'Emby', 'Radarr'];

	// Mock recommendation score
	const recommendationScore = 89;

	// Mock external ratings
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
				boxOffice: '$141 million',
				recommendationScore: recommendationScore,
				externalRatings: externalRatings,
				similarMovies: []
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
				},
				{
					id: 'sm5',
					title: 'The Butterfly Effect',
					year: 2004,
					poster: 'https://image.tmdb.org/t/p/w500/8mA9v9BFKsmqKNKdPNcVlgXqF1Z.jpg',
					rating: 7.6
				}
			];

			// Check if movie is in user's collection
			isInCollection = Math.random() > 0.5; // Mock check - would be an API call in real app

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
	<!-- Movie Header with Backdrop, Poster, and Title -->
	<MovieHeader {movie} />

	<div class="mx-auto px-4 pt-0">
		<div class="flex flex-col gap-4 md:flex-row">
			<!-- Left Column: Actions & Recommendation -->
			<div class="flex flex-col items-center pr-4 pl-2 md:flex-shrink-0 md:items-start">
				<!-- Action Buttons (Watch, Request, Chat) -->
				<MovieActions {movie} {isInCollection} {clientOptions} />

				<!-- Why We Recommend This (directly below MovieActions) -->
				<MovieRecommendationReason {movie} />
			</div>

			<!-- Right Column: Detail Tabs -->
			<div class="z-20 -mt-4 flex-grow">
				<MovieDetailTabs {movie} />
			</div>
		</div>

		<!-- Similar Movies Section (full width) -->
		<MovieSimilar {movie} {similarMovies} />
	</div>

	<!-- Floating Media Collection Manager -->
	<MediaCollectionManager />
{/if}

