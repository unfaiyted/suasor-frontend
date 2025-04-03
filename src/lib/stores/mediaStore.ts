import { derived } from 'svelte/store';
import { GET, POST, DELETE } from '$lib/api/client';
import type { BaseApiState } from './base';
import { createBaseStore, createCache, type CacheOptions } from './base';
import type { Movie } from '$lib/components/chat/types';
import type { MediaType } from '$lib/api/types';
import { clientsApi } from './api';

// Define media store state
export interface MediaState extends BaseApiState {
	// Movies
	movies: Record<string, Movie>; // Indexed by ID
	trendingMovies: string[]; // IDs of trending movies
	recentMovies: string[]; // IDs of recent movies
	recommendedMovies: string[]; // IDs of recommended movies
	watchlistIds: string[]; // IDs of watchlist items

	// Collections
	collections: Record<string, MediaCollection>;

	// Current client
	activeMediaClientId: number | null;

	// Pagination/filters
	page: number;
	totalPages: number;
	totalResults: number;
	filters: MediaFilters;

	// Selected media
	selectedMediaId: string | null;
}

// Define media collection interface
export interface MediaCollection {
	id: string;
	name: string;
	description?: string;
	mediaIds: string[];
	mediaType: MediaType;
	source: string;
	createdAt: string;
	updatedAt: string;
}

// Define media filters
export interface MediaFilters {
	genres: string[];
	year?: { min?: number; max?: number };
	rating?: { min?: number; max?: number };
	mediaType?: MediaType;
	source?: string;
	query?: string;
	sortBy?: 'title' | 'year' | 'rating' | 'added';
	sortDirection?: 'asc' | 'desc';
}

// Initial state
const initialMediaState: MediaState = {
	loading: false,
	error: null,
	movies: {},
	trendingMovies: [],
	recentMovies: [],
	recommendedMovies: [],
	watchlistIds: [],
	collections: {},
	activeMediaClientId: null,
	page: 1,
	totalPages: 1,
	totalResults: 0,
	filters: { genres: [] },
	selectedMediaId: null
};

// Create the media store
const mediaStore = createBaseStore<MediaState>(initialMediaState);

// Create a cache for media data
const mediaCache = createCache<any>();

// Enhanced store with media-specific operations
export const mediaApi = {
	...mediaStore,

	// Initialize the media store with the first available media client
	async initialize() {
		// If we already have an active client, return early
		const currentState = mediaStore.getState();
		if (currentState.activeMediaClientId) {
			return;
		}

		mediaStore.setLoading(true);

		try {
			// Load a list of media clients
			const clients = await clientsApi.loadClients();

			// Filter for media clients only, and get enabled ones only
			const mediaClients = clients.filter((client) => {
				const type = client.clientType.toLowerCase();
				return (
					(type.includes('plex') ||
						type.includes('emby') ||
						type.includes('jellyfin') ||
						type.includes('subsonic')) &&
					client.isEnabled
				);
			});

			// If we have any media clients, set the first one as active
			if (mediaClients.length > 0) {
				mediaStore.update((state) => ({
					...state,
					activeMediaClientId: mediaClients[0].id,
					loading: false
				}));

				// Once the client is set, load the initial data
				await this.loadTrendingMovies();
				await this.loadRecentMovies();
				await this.loadRecommendedMovies();
				await this.loadCollections();
				await this.loadWatchlist();
			} else {
				// No media clients available
				mediaStore.update((state) => ({
					...state,
					loading: false
				}));
			}
		} catch (err) {
			mediaStore.setError(err);
		}
	},

	// Set the active media client
	setActiveMediaClient(clientId: number) {
		mediaStore.update((state) => ({
			...state,
			activeMediaClientId: clientId
		}));

		// Clear cache when changing client
		mediaCache.invalidatePattern(/^media:/);

		// Reload data with new client
		this.loadTrendingMovies();
		this.loadRecentMovies();
		this.loadRecommendedMovies();
		this.loadCollections();
		this.loadWatchlist();
	},

	// Load trending movies
	async loadTrendingMovies() {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const cacheKey = `media:trending:${state.activeMediaClientId}`;
		const cachedData = mediaCache.get(cacheKey);
		if (cachedData) {
			mediaStore.update((state) => ({
				...state,
				trendingMovies: cachedData.ids,
				movies: { ...state.movies, ...cachedData.moviesById }
			}));
			return cachedData.ids.map((id) => cachedData.moviesById[id]);
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// const response = await GET(`/clients/media/${state.activeMediaClientId}/trending`);

			// For now, use mock data
			await new Promise((resolve) => setTimeout(resolve, 500));

			const mockTrendingMovies = [
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
			];

			// Process and store the results
			const moviesById: Record<string, Movie> = {};
			const ids: string[] = [];

			mockTrendingMovies.forEach((movie) => {
				moviesById[movie.id] = movie;
				ids.push(movie.id);
			});

			// Update the store
			mediaStore.update((state) => ({
				...state,
				trendingMovies: ids,
				movies: { ...state.movies, ...moviesById },
				loading: false
			}));

			// Cache the results
			mediaCache.set(cacheKey, { ids, moviesById });

			return mockTrendingMovies;
		} catch (err) {
			mediaStore.setError(err);
			return [];
		}
	},

	// Load recent movies
	async loadRecentMovies() {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const cacheKey = `media:recent:${state.activeMediaClientId}`;
		const cachedData = mediaCache.get(cacheKey);
		if (cachedData) {
			mediaStore.update((state) => ({
				...state,
				recentMovies: cachedData.ids,
				movies: { ...state.movies, ...cachedData.moviesById }
			}));
			return cachedData.ids.map((id) => cachedData.moviesById[id]);
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// const response = await GET(`/clients/media/${state.activeMediaClientId}/recent`);

			// For now, use mock data
			await new Promise((resolve) => setTimeout(resolve, 500));

			const mockRecentMovies = [
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
			];

			// Process and store the results
			const moviesById: Record<string, Movie> = {};
			const ids: string[] = [];

			mockRecentMovies.forEach((movie) => {
				moviesById[movie.id] = movie;
				ids.push(movie.id);
			});

			// Update the store
			mediaStore.update((state) => ({
				...state,
				recentMovies: ids,
				movies: { ...state.movies, ...moviesById },
				loading: false
			}));

			// Cache the results
			mediaCache.set(cacheKey, { ids, moviesById });

			return mockRecentMovies;
		} catch (err) {
			mediaStore.setError(err);
			return [];
		}
	},

	// Load AI recommended movies
	async loadRecommendedMovies() {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const cacheKey = `media:recommended:${state.activeMediaClientId}`;
		const cachedData = mediaCache.get(cacheKey);
		if (cachedData) {
			mediaStore.update((state) => ({
				...state,
				recommendedMovies: cachedData.ids,
				movies: { ...state.movies, ...cachedData.moviesById }
			}));
			return cachedData.ids.map((id) => cachedData.moviesById[id]);
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// const response = await GET(`/ai/recommendations?clientId=${state.activeMediaClientId}`);

			// For now, use mock data
			await new Promise((resolve) => setTimeout(resolve, 700));

			const mockRecommendedMovies = [
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
			];

			// Process and store the results
			const moviesById: Record<string, Movie> = {};
			const ids: string[] = [];

			mockRecommendedMovies.forEach((movie) => {
				moviesById[movie.id] = movie;
				ids.push(movie.id);
			});

			// Update the store
			mediaStore.update((state) => ({
				...state,
				recommendedMovies: ids,
				movies: { ...state.movies, ...moviesById },
				loading: false
			}));

			// Cache the results
			mediaCache.set(cacheKey, { ids, moviesById });

			return mockRecommendedMovies;
		} catch (err) {
			mediaStore.setError(err);
			return [];
		}
	},

	// Load user's media collections
	async loadCollections() {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId) {
			return {};
		}

		const cacheKey = `media:collections:${state.activeMediaClientId}`;
		const cachedData = mediaCache.get(cacheKey);
		if (cachedData) {
			mediaStore.update((state) => ({
				...state,
				collections: cachedData
			}));
			return cachedData;
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// const response = await GET(`/clients/media/${state.activeMediaClientId}/collections`);

			// For now, use mock data
			await new Promise((resolve) => setTimeout(resolve, 600));

			const mockCollections = {
				'action-favorites': {
					id: 'action-favorites',
					name: 'Action Favorites',
					description: 'My favorite action movies',
					mediaIds: ['air1', 't1'],
					mediaType: 'movie',
					source: 'user',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				},
				'sci-fi-shows': {
					id: 'sci-fi-shows',
					name: 'Sci-Fi Shows',
					description: 'Great science fiction series',
					mediaIds: ['air2', 'nr2'],
					mediaType: 'series',
					source: 'user',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			};

			// Update the store
			mediaStore.update((state) => ({
				...state,
				collections: mockCollections,
				loading: false
			}));

			// Cache the results
			mediaCache.set(cacheKey, mockCollections);

			return mockCollections;
		} catch (err) {
			mediaStore.setError(err);
			return {};
		}
	},

	// Load user's watchlist
	async loadWatchlist() {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const cacheKey = `media:watchlist:${state.activeMediaClientId}`;
		const cachedData = mediaCache.get(cacheKey);
		if (cachedData) {
			mediaStore.update((state) => ({
				...state,
				watchlistIds: cachedData.ids,
				movies: { ...state.movies, ...cachedData.moviesById }
			}));
			return cachedData.ids.map((id) => cachedData.moviesById[id]);
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// const response = await GET(`/clients/media/${state.activeMediaClientId}/watchlist`);

			// For now, use mock data
			await new Promise((resolve) => setTimeout(resolve, 400));

			// Use some of our existing mock movies for the watchlist
			const mockWatchlistIds = ['air1', 't1'];

			// Get the movies from our store to create the response
			const moviesById: Record<string, Movie> = {};
			const state = mediaStore.getState();

			mockWatchlistIds.forEach((id) => {
				if (state.movies[id]) {
					moviesById[id] = state.movies[id];
				}
			});

			// Update the store
			mediaStore.update((state) => ({
				...state,
				watchlistIds: mockWatchlistIds,
				loading: false
			}));

			// Cache the results
			mediaCache.set(cacheKey, { ids: mockWatchlistIds, moviesById });

			return mockWatchlistIds.map((id) => state.movies[id]);
		} catch (err) {
			mediaStore.setError(err);
			return [];
		}
	},

	// Add a movie to the user's watchlist
	async addToWatchlist(movieId: string) {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId || !state.movies[movieId]) {
			return false;
		}

		// If it's already in the watchlist, do nothing
		if (state.watchlistIds.includes(movieId)) {
			return true;
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// await POST(`/clients/media/${state.activeMediaClientId}/watchlist`, { body: { mediaId: movieId }});

			// For now, simulate API call
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Update the store
			mediaStore.update((state) => ({
				...state,
				watchlistIds: [...state.watchlistIds, movieId],
				loading: false
			}));

			// Invalidate watchlist cache
			mediaCache.invalidate(`media:watchlist:${state.activeMediaClientId}`);

			return true;
		} catch (err) {
			mediaStore.setError(err);
			return false;
		}
	},

	// Remove a movie from the user's watchlist
	async removeFromWatchlist(movieId: string) {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId) {
			return false;
		}

		// If it's not in the watchlist, do nothing
		if (!state.watchlistIds.includes(movieId)) {
			return true;
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// await DELETE(`/clients/media/${state.activeMediaClientId}/watchlist/${movieId}`);

			// For now, simulate API call
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Update the store
			mediaStore.update((state) => ({
				...state,
				watchlistIds: state.watchlistIds.filter((id) => id !== movieId),
				loading: false
			}));

			// Invalidate watchlist cache
			mediaCache.invalidate(`media:watchlist:${state.activeMediaClientId}`);

			return true;
		} catch (err) {
			mediaStore.setError(err);
			return false;
		}
	},

	// Toggle a movie in the watchlist
	async toggleWatchlist(movieId: string) {
		const state = mediaStore.getState();
		if (state.watchlistIds.includes(movieId)) {
			return this.removeFromWatchlist(movieId);
		} else {
			return this.addToWatchlist(movieId);
		}
	},

	// Search for media with the given query and filters
	async searchMedia(query: string, filters?: Partial<MediaFilters>) {
		const state = mediaStore.getState();
		if (!state.activeMediaClientId) {
			return { results: [], totalResults: 0, totalPages: 0 };
		}

		// Combine current filters with new filters
		const combinedFilters = {
			...state.filters,
			...filters,
			query
		};

		// Create a cache key based on the query and filters
		const cacheKey = `media:search:${state.activeMediaClientId}:${JSON.stringify(combinedFilters)}`;
		const cachedData = mediaCache.get(cacheKey, { enabled: true, ttl: 10 * 60 * 1000 });
		if (cachedData) {
			mediaStore.update((state) => ({
				...state,
				filters: combinedFilters,
				movies: { ...state.movies, ...cachedData.moviesById },
				page: cachedData.page,
				totalPages: cachedData.totalPages,
				totalResults: cachedData.totalResults
			}));
			return {
				results: cachedData.ids.map((id) => cachedData.moviesById[id]),
				totalResults: cachedData.totalResults,
				totalPages: cachedData.totalPages
			};
		}

		mediaStore.setLoading(true);

		try {
			// In a real app, we'd call something like:
			// const response = await GET(`/clients/media/${state.activeMediaClientId}/search`, {
			//   params: { query, ...combinedFilters, page: state.page }
			// });

			// For now, use mock data
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Filter existing movies based on query (just for the mock)
			const allMovies = Object.values(state.movies);
			const filteredMovies = allMovies.filter(
				(movie) =>
					movie.title.toLowerCase().includes(query.toLowerCase()) ||
					movie.overview.toLowerCase().includes(query.toLowerCase()) ||
					movie.genres.some((genre) => genre.toLowerCase().includes(query.toLowerCase()))
			);

			// Process and store the results
			const moviesById: Record<string, Movie> = {};
			const ids: string[] = [];

			filteredMovies.forEach((movie) => {
				moviesById[movie.id] = movie;
				ids.push(movie.id);
			});

			const totalResults = filteredMovies.length;
			const resultsPerPage = 10;
			const totalPages = Math.ceil(totalResults / resultsPerPage);

			// Update the store
			mediaStore.update((state) => ({
				...state,
				movies: { ...state.movies, ...moviesById },
				filters: combinedFilters,
				totalResults,
				totalPages,
				loading: false
			}));

			// Cache the results
			mediaCache.set(cacheKey, {
				ids,
				moviesById,
				page: state.page,
				totalPages,
				totalResults
			});

			return {
				results: filteredMovies,
				totalResults,
				totalPages
			};
		} catch (err) {
			mediaStore.setError(err);
			return { results: [], totalResults: 0, totalPages: 0 };
		}
	},

	// Get movie details by ID
	async getMovieDetails(movieId: string) {
		const state = mediaStore.getState();

		// If we already have this movie in the store, return it
		if (state.movies[movieId]) {
			return state.movies[movieId];
		}

		if (!state.activeMediaClientId) {
			return null;
		}

		const cacheKey = `media:movie:${state.activeMediaClientId}:${movieId}`;
		const cachedData = mediaCache.get(cacheKey);
		if (cachedData) {
			// Update the store with the cached movie
			mediaStore.update((state) => ({
				...state,
				movies: { ...state.movies, [movieId]: cachedData }
			}));
			return cachedData;
		}

		mediaStore.setLoading(true);

		try {
			// const response = await GET(`/clients/media/${state.activeMediaClientId}/movie/${movieId}`);

			// For now, use existing movie data if available, or a generic movie
			await new Promise((resolve) => setTimeout(resolve, 300));

			let movieDetails = state.movies[movieId];

			if (!movieDetails) {
				// Use a mock movie
				movieDetails = {
					id: movieId,
					title: `Movie ${movieId}`,
					year: 2023,
					type: 'movie',
					poster: `https://via.placeholder.com/300x450.png?text=Movie+${movieId}`,
					backdrop: `https://via.placeholder.com/1920x1080.png?text=Movie+${movieId}`,
					genres: ['Drama'],
					rating: 7.5,
					overview: 'A movie with no details available yet.'
				};
			}

			// Add extras for "detailed" view
			movieDetails = {
				...movieDetails,
				director: 'Director Name',
				cast: ['Actor 1', 'Actor 2', 'Actor 3'],
				runtime: 120,
				language: 'English'
			};

			// Update the store
			mediaStore.update((state) => ({
				...state,
				movies: { ...state.movies, [movieId]: movieDetails },
				loading: false
			}));

			// Cache the results
			mediaCache.set(cacheKey, movieDetails);

			return movieDetails;
		} catch (err) {
			mediaStore.setError(err);
			return null;
		}
	},

	// Set selected media ID
	setSelectedMediaId(id: string | null) {
		mediaStore.update((state) => ({
			...state,
			selectedMediaId: id
		}));

		// If an ID is provided, load details
		if (id) {
			this.getMovieDetails(id);
		}
	}
};

// Create derived stores for easy access to specific parts of the state
export const trendingMovies = derived(mediaStore, ($state) =>
	$state.trendingMovies.map((id) => $state.movies[id])
);

export const recentMovies = derived(mediaStore, ($state) =>
	$state.recentMovies.map((id) => $state.movies[id])
);

export const recommendedMovies = derived(mediaStore, ($state) =>
	$state.recommendedMovies.map((id) => $state.movies[id])
);

export const watchlistMovies = derived(mediaStore, ($state) =>
	$state.watchlistIds.map((id) => $state.movies[id]).filter(Boolean)
);

export const selectedMedia = derived(mediaStore, ($state) =>
	$state.selectedMediaId ? $state.movies[$state.selectedMediaId] : null
);

export const isInWatchlist = derived(
	mediaStore,
	($state) => (mediaId: string) => $state.watchlistIds.includes(mediaId)
);

export const mediaCollections = derived(mediaStore, ($state) => $state.collections);

export const mediaLoading = derived(mediaStore, ($state) => $state.loading);
export const mediaError = derived(mediaStore, ($state) => $state.error);

export default mediaApi;
