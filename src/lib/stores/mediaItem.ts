import { derived } from 'svelte/store';
import { GET, POST, PUT, DELETE } from '$lib/api/client';
import type { BaseApiState } from './base';
import { createBaseStore, createCache, type CacheOptions } from './base';
import type {
	MediaItemAlbum,
	MediaItemArtist,
	MediaItemPlaylist,
	MediaItemTrack,
	MediaItemMovie,
	MediaItemSeries,
	MediaType,
	APIMediaItemAlbumResponse,
	APIMediaItemArtistResponse,
	APIMediaItemPlaylistResponse,
	APIMediaItemTrackResponse,
	APIMediaItemAlbumsResponse,
	APIMediaItemArtistsResponse,
	APIMediaItemPlaylistsResponse,
	APIMediaItemTracksResponse,
	AddMediaRequest,
	UpdateMediaRequest
} from '$lib/api/types';
import { clientsApi } from './api';

// Generic MediaItem type that can represent any media format
export type MediaItem =
	| MediaItemAlbum
	| MediaItemArtist
	| MediaItemPlaylist
	| MediaItemTrack
	| MediaItemMovie
	| MediaItemSeries;

// Define media item store state
export interface MediaItemState extends BaseApiState {
	// Media items by type and ID
	mediaItems: {
		album: Record<string, MediaItemAlbum>;
		artist: Record<string, MediaItemArtist>;
		playlist: Record<string, MediaItemPlaylist>;
		track: Record<string, MediaItemTrack>;
		movie: Record<string, MediaItemMovie>;
		series: Record<string, MediaItemSeries>;
	};

	// Current client
	activeMediaClientId: number | null;

	// Recent items by type
	recentItems: {
		album: string[];
		artist: string[];
		playlist: string[];
		track: string[];
		movie: string[];
		series: string[];
	};

	// Pagination
	pagination: {
		page: number;
		totalPages: number;
		totalResults: number;
	};

	// Filters
	filters: MediaItemFilters;

	// Selected item
	selectedItemId: string | null;
	selectedItemType: MediaType | null;
}

// Define media item filters interface
export interface MediaItemFilters {
	genres?: string[];
	year?: { min?: number; max?: number };
	rating?: { min?: number; max?: number };
	mediaType?: MediaType;
	source?: string;
	query?: string;
	sortBy?: 'title' | 'year' | 'rating' | 'added';
	sortDirection?: 'asc' | 'desc';
	limit?: number;
}

// Initial state
const initialMediaItemState: MediaItemState = {
	loading: false,
	error: null,
	mediaItems: {
		album: {},
		artist: {},
		playlist: {},
		track: {},
		movie: {},
		series: {}
	},
	activeMediaClientId: null,
	recentItems: {
		album: [],
		artist: [],
		playlist: [],
		track: [],
		movie: [],
		series: []
	},
	pagination: {
		page: 1,
		totalPages: 1,
		totalResults: 0
	},
	filters: {},
	selectedItemId: null,
	selectedItemType: null
};

// Create the media item store
const mediaItemStore = createBaseStore<MediaItemState>(initialMediaItemState);

// Create a cache for media items data
const mediaItemCache = createCache<any>();

// Helper to map media type to appropriate state object key
const getMediaTypeKey = (mediaType: MediaType): keyof MediaItemState['mediaItems'] => {
	switch (mediaType) {
		case 'album':
			return 'album';
		case 'artist':
			return 'artist';
		case 'playlist':
			return 'playlist';
		case 'track':
			return 'track';
		case 'movie':
			return 'movie';
		case 'series':
			return 'series';
		default:
			return 'album';
	}
};

// Enhanced store with media item-specific operations
export const mediaItemApi = {
	...mediaItemStore,

	// Initialize the media item store
	async initialize() {
		// If we already have an active client, return early
		const currentState = mediaItemStore.getState();
		if (currentState.activeMediaClientId) {
			return;
		}

		mediaItemStore.setLoading(true);

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
				mediaItemStore.update((state) => ({
					...state,
					activeMediaClientId: mediaClients[0].id,
					loading: false
				}));

				// Load initial data for each media type
				await this.loadRecentItems('album');
				await this.loadRecentItems('artist');
				await this.loadRecentItems('track');
				await this.loadRecentItems('movie');
				await this.loadRecentItems('series');
			} else {
				// No media clients available
				mediaItemStore.update((state) => ({
					...state,
					loading: false
				}));
			}
		} catch (err) {
			mediaItemStore.setError(err);
		}
	},

	// Set the active media client
	setActiveMediaClient(clientId: number) {
		mediaItemStore.update((state) => ({
			...state,
			activeMediaClientId: clientId
		}));

		// Clear cache when changing client
		mediaItemCache.invalidatePattern(/^mediaItem:/);

		// Reload data with new client
		this.loadRecentItems('album');
		this.loadRecentItems('artist');
		this.loadRecentItems('track');
		this.loadRecentItems('movie');
		this.loadRecentItems('series');
	},

	// Load recent items by media type
	async loadRecentItems(mediaType: MediaType, limit: number = 20) {
		const state = mediaItemStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const mediaTypeKey = getMediaTypeKey(mediaType);
		const cacheKey = `mediaItem:recent:${state.activeMediaClientId}:${mediaType}:${limit}`;

		// Check cache first
		const cachedData = mediaItemCache.get(cacheKey);
		if (cachedData) {
			mediaItemStore.update((state) => ({
				...state,
				recentItems: {
					...state.recentItems,
					[mediaTypeKey]: cachedData.ids
				},
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...cachedData.itemsById }
				}
			}));
			return cachedData.ids.map((id) => cachedData.itemsById[id]);
		}

		mediaItemStore.setLoading(true);

		try {
			// Determine the correct endpoint based on media type
			let endpoint = '';
			if (mediaType === 'album' || mediaType === 'artist' || mediaType === 'track') {
				endpoint = `/clients/media/${state.activeMediaClientId}/music/${mediaType}s/recent/${limit}`;
			} else if (mediaType === 'movie') {
				endpoint = `/clients/media/${state.activeMediaClientId}/movies/recent/${limit}`;
			} else if (mediaType === 'series') {
				endpoint = `/clients/media/${state.activeMediaClientId}/series/recent/${limit}`;
			}

			const response = await GET(endpoint as any);

			if (!response.data?.data) {
				throw new Error(`Failed to load recent ${mediaType} items`);
			}

			// Process and store the results
			const itemsById: Record<string, MediaItem> = {};
			const ids: string[] = [];

			response.data.data.forEach((item: MediaItem) => {
				itemsById[item.id] = item;
				ids.push(item.id);
			});

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				recentItems: {
					...state.recentItems,
					[mediaTypeKey]: ids
				},
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...itemsById }
				},
				loading: false
			}));

			// Cache the results
			mediaItemCache.set(cacheKey, { ids, itemsById });

			return response.data.data;
		} catch (err) {
			mediaItemStore.setError(err);
			return [];
		}
	},

	// Get items by genre
	async getItemsByGenre(mediaType: MediaType, genre: string, limit: number = 20) {
		const state = mediaItemStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const mediaTypeKey = getMediaTypeKey(mediaType);
		const cacheKey = `mediaItem:genre:${state.activeMediaClientId}:${mediaType}:${genre}:${limit}`;

		// Check cache first
		const cachedData = mediaItemCache.get(cacheKey);
		if (cachedData) {
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...cachedData.itemsById }
				}
			}));
			return cachedData.items;
		}

		mediaItemStore.setLoading(true);

		try {
			// Determine the correct endpoint based on media type
			let endpoint = '';
			if (mediaType === 'album') {
				endpoint = `/music/albums/genre/${genre}`;
			} else if (mediaType === 'artist') {
				endpoint = `/music/artists/genre/${genre}`;
			} else if (mediaType === 'movie') {
				endpoint = `/movies/genre/${genre}`;
			} else if (mediaType === 'series') {
				endpoint = `/series/genre/${genre}`;
			}

			const response = await GET(endpoint as any, {
				params: { limit }
			});

			if (!response.data?.data) {
				throw new Error(`Failed to load ${mediaType} items for genre ${genre}`);
			}

			// Process and store the results
			const itemsById: Record<string, MediaItem> = {};
			const items = response.data.data;

			items.forEach((item: MediaItem) => {
				itemsById[item.id] = item;
			});

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...itemsById }
				},
				loading: false
			}));

			// Cache the results
			mediaItemCache.set(cacheKey, { items, itemsById });

			return items;
		} catch (err) {
			mediaItemStore.setError(err);
			return [];
		}
	},

	// Get items by year
	async getItemsByYear(mediaType: MediaType, year: number, limit: number = 20) {
		const state = mediaItemStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const mediaTypeKey = getMediaTypeKey(mediaType);
		const cacheKey = `mediaItem:year:${state.activeMediaClientId}:${mediaType}:${year}:${limit}`;

		// Check cache first
		const cachedData = mediaItemCache.get(cacheKey);
		if (cachedData) {
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...cachedData.itemsById }
				}
			}));
			return cachedData.items;
		}

		mediaItemStore.setLoading(true);

		try {
			// Determine the correct endpoint based on media type
			let endpoint = '';
			if (mediaType === 'album') {
				endpoint = `/music/albums/year/${year}`;
			} else if (mediaType === 'movie') {
				endpoint = `/movies/year/${year}`;
			} else {
				endpoint = `/media/items`;
			}

			const response = await GET(endpoint as any, {
				params: {
					mediaType,
					year,
					limit
				}
			});

			if (!response.data?.data) {
				throw new Error(`Failed to load ${mediaType} items for year ${year}`);
			}

			// Process and store the results
			const itemsById: Record<string, MediaItem> = {};
			const items = response.data.data;

			items.forEach((item: MediaItem) => {
				itemsById[item.id] = item;
			});

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...itemsById }
				},
				loading: false
			}));

			// Cache the results
			mediaItemCache.set(cacheKey, { items, itemsById });

			return items;
		} catch (err) {
			mediaItemStore.setError(err);
			return [];
		}
	},

	// Get popular items
	async getPopularItems(mediaType: MediaType, limit: number = 20) {
		const state = mediaItemStore.getState();
		if (!state.activeMediaClientId) {
			return [];
		}

		const mediaTypeKey = getMediaTypeKey(mediaType);
		const cacheKey = `mediaItem:popular:${state.activeMediaClientId}:${mediaType}:${limit}`;

		// Check cache first
		const cachedData = mediaItemCache.get(cacheKey);
		if (cachedData) {
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...cachedData.itemsById }
				}
			}));
			return cachedData.items;
		}

		mediaItemStore.setLoading(true);

		try {
			// Determine the correct endpoint based on media type
			let endpoint = '';
			if (mediaType === 'album') {
				endpoint = `/music/albums/popular/${limit}`;
			} else if (mediaType === 'artist') {
				endpoint = `/music/artists/popular/${limit}`;
			} else if (mediaType === 'movie') {
				endpoint = `/movies/popular/${limit}`;
			} else if (mediaType === 'series') {
				endpoint = `/series/popular/${limit}`;
			}

			const response = await GET(endpoint as any);

			if (!response.data?.data) {
				throw new Error(`Failed to load popular ${mediaType} items`);
			}

			// Process and store the results
			const itemsById: Record<string, MediaItem> = {};
			const items = response.data.data;

			items.forEach((item: MediaItem) => {
				itemsById[item.id] = item;
			});

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: { ...state.mediaItems[mediaTypeKey], ...itemsById }
				},
				loading: false
			}));

			// Cache the results
			mediaItemCache.set(cacheKey, { items, itemsById });

			return items;
		} catch (err) {
			mediaItemStore.setError(err);
			return [];
		}
	},

	// Search media items
	async searchMediaItems(query: string, filters?: Partial<MediaItemFilters>) {
		const state = mediaItemStore.getState();
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
		const cacheKey = `mediaItem:search:${state.activeMediaClientId}:${JSON.stringify(combinedFilters)}`;
		const cachedData = mediaItemCache.get(cacheKey, { enabled: true, ttl: 10 * 60 * 1000 });

		if (cachedData) {
			// Update store with cached data
			mediaItemStore.update((state) => ({
				...state,
				filters: combinedFilters,
				pagination: cachedData.pagination,
				mediaItems: {
					...state.mediaItems,
					...(combinedFilters.mediaType
						? {
								[getMediaTypeKey(combinedFilters.mediaType)]: {
									...state.mediaItems[getMediaTypeKey(combinedFilters.mediaType)],
									...cachedData.itemsById
								}
							}
						: Object.entries(cachedData.itemsByType).reduce(
								(acc, [type, items]) => ({
									...acc,
									[type]: {
										...state.mediaItems[type as keyof MediaItemState['mediaItems']],
										...items
									}
								}),
								{}
							))
				}
			}));

			return {
				results: cachedData.results,
				totalResults: cachedData.pagination.totalResults,
				totalPages: cachedData.pagination.totalPages
			};
		}

		mediaItemStore.setLoading(true);

		try {
			// Determine the endpoint based on the media type
			let endpoint;
			if (
				combinedFilters.mediaType === 'album' ||
				combinedFilters.mediaType === 'artist' ||
				combinedFilters.mediaType === 'track'
			) {
				endpoint = `/music/search`;
			} else if (combinedFilters.mediaType === 'movie') {
				endpoint = `/movies/search`;
			} else if (combinedFilters.mediaType === 'series') {
				endpoint = `/series/search`;
			} else {
				endpoint = `/media/search`;
			}

			const response = await GET(endpoint as any, {
				params: {
					...combinedFilters,
					page: state.pagination.page
				}
			});

			if (!response.data?.data) {
				throw new Error('Search failed');
			}

			// Process and store the results
			const results = response.data.data;
			const pagination = {
				page: response.data.page || 1,
				totalPages: response.data.totalPages || 1,
				totalResults: response.data.totalResults || results.length
			};

			// Group items by type
			const itemsByType: Record<string, Record<string, MediaItem>> = {};
			const itemsById: Record<string, MediaItem> = {};

			results.forEach((item: MediaItem) => {
				const typeKey = getMediaTypeKey(item.mediaType as MediaType);
				if (!itemsByType[typeKey]) {
					itemsByType[typeKey] = {};
				}
				itemsByType[typeKey][item.id] = item;
				itemsById[item.id] = item;
			});

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				filters: combinedFilters,
				pagination,
				mediaItems: {
					...state.mediaItems,
					...(combinedFilters.mediaType
						? {
								[getMediaTypeKey(combinedFilters.mediaType)]: {
									...state.mediaItems[getMediaTypeKey(combinedFilters.mediaType)],
									...(itemsByType[getMediaTypeKey(combinedFilters.mediaType)] || {})
								}
							}
						: Object.entries(itemsByType).reduce(
								(acc, [type, items]) => ({
									...acc,
									[type]: {
										...state.mediaItems[type as keyof MediaItemState['mediaItems']],
										...items
									}
								}),
								{}
							))
				},
				loading: false
			}));

			// Cache the results
			mediaItemCache.set(cacheKey, {
				results,
				itemsByType,
				itemsById,
				pagination
			});

			return {
				results,
				totalResults: pagination.totalResults,
				totalPages: pagination.totalPages
			};
		} catch (err) {
			mediaItemStore.setError(err);
			return { results: [], totalResults: 0, totalPages: 0 };
		}
	},

	// Get item details
	async getItemDetails(id: string, mediaType: MediaType) {
		const state = mediaItemStore.getState();
		const mediaTypeKey = getMediaTypeKey(mediaType);

		// If we already have this item in the store with full details, return it
		const existingItem = state.mediaItems[mediaTypeKey][id];
		if (existingItem && existingItem.details) {
			return existingItem;
		}

		if (!state.activeMediaClientId) {
			return null;
		}

		const cacheKey = `mediaItem:details:${state.activeMediaClientId}:${mediaType}:${id}`;
		const cachedData = mediaItemCache.get(cacheKey);
		if (cachedData) {
			// Update the store with the cached item
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: {
						...state.mediaItems[mediaTypeKey],
						[id]: cachedData
					}
				}
			}));
			return cachedData;
		}

		mediaItemStore.setLoading(true);

		try {
			// Determine the correct endpoint based on media type
			let endpoint = '';
			if (mediaType === 'album') {
				endpoint = `/music/albums/${id}`;
			} else if (mediaType === 'artist') {
				endpoint = `/music/artists/${id}`;
			} else if (mediaType === 'track') {
				endpoint = `/music/tracks/${id}`;
			} else if (mediaType === 'movie') {
				endpoint = `/movies/${id}`;
			} else if (mediaType === 'series') {
				endpoint = `/series/${id}`;
			}

			const response = await GET(endpoint as any);

			if (!response.data?.data) {
				throw new Error(`Failed to load details for ${mediaType} item ${id}`);
			}

			const itemDetails = response.data.data;

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: {
						...state.mediaItems[mediaTypeKey],
						[id]: itemDetails
					}
				},
				loading: false
			}));

			// Cache the results
			mediaItemCache.set(cacheKey, itemDetails);

			return itemDetails;
		} catch (err) {
			mediaItemStore.setError(err);
			return null;
		}
	},

	// Add a new media item
	async addMediaItem(mediaItem: AddMediaRequest) {
		const state = mediaItemStore.getState();
		if (!state.activeMediaClientId) {
			return null;
		}

		mediaItemStore.setLoading(true);

		try {
			const response = await POST('/media/items' as any, {
				body: mediaItem
			});

			if (!response.data?.data) {
				throw new Error('Failed to add media item');
			}

			const newItem = response.data.data;
			const mediaTypeKey = getMediaTypeKey(newItem.mediaType as MediaType);

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: {
						...state.mediaItems[mediaTypeKey],
						[newItem.id]: newItem
					}
				},
				loading: false
			}));

			// Invalidate relevant caches
			mediaItemCache.invalidatePattern(
				new RegExp(`^mediaItem:.*:${state.activeMediaClientId}:${newItem.mediaType}`)
			);

			return newItem;
		} catch (err) {
			mediaItemStore.setError(err);
			return null;
		}
	},

	// Update a media item
	async updateMediaItem(id: string, mediaType: MediaType, updates: UpdateMediaRequest) {
		const state = mediaItemStore.getState();
		if (!state.activeMediaClientId) {
			return null;
		}

		const mediaTypeKey = getMediaTypeKey(mediaType);
		mediaItemStore.setLoading(true);

		try {
			const response = await PUT(`/media/items/${id}` as any, {
				body: updates
			});

			if (!response.data?.data) {
				throw new Error(`Failed to update ${mediaType} item ${id}`);
			}

			const updatedItem = response.data.data;

			// Update the store
			mediaItemStore.update((state) => ({
				...state,
				mediaItems: {
					...state.mediaItems,
					[mediaTypeKey]: {
						...state.mediaItems[mediaTypeKey],
						[id]: updatedItem
					}
				},
				loading: false
			}));

			// Invalidate relevant caches
			mediaItemCache.invalidate(
				`mediaItem:details:${state.activeMediaClientId}:${mediaType}:${id}`
			);
			mediaItemCache.invalidatePattern(
				new RegExp(`^mediaItem:.*:${state.activeMediaClientId}:${mediaType}`)
			);

			return updatedItem;
		} catch (err) {
			mediaItemStore.setError(err);
			return null;
		}
	},

	// Delete a media item
	async deleteMediaItem(id: string, mediaType: MediaType) {
		const state = mediaItemStore.getState();
		if (!state.activeMediaClientId) {
			return false;
		}

		const mediaTypeKey = getMediaTypeKey(mediaType);
		mediaItemStore.setLoading(true);

		try {
			await DELETE(`/media/items/${id}` as any);

			// Update the store by removing the item
			mediaItemStore.update((state) => {
				const updatedItems = { ...state.mediaItems[mediaTypeKey] };
				delete updatedItems[id];

				// Remove from recent items if present
				const updatedRecentItems = {
					...state.recentItems,
					[mediaTypeKey]: state.recentItems[mediaTypeKey].filter((itemId) => itemId !== id)
				};

				return {
					...state,
					mediaItems: {
						...state.mediaItems,
						[mediaTypeKey]: updatedItems
					},
					recentItems: updatedRecentItems,
					loading: false
				};
			});

			// Invalidate relevant caches
			mediaItemCache.invalidate(
				`mediaItem:details:${state.activeMediaClientId}:${mediaType}:${id}`
			);
			mediaItemCache.invalidatePattern(
				new RegExp(`^mediaItem:.*:${state.activeMediaClientId}:${mediaType}`)
			);

			return true;
		} catch (err) {
			mediaItemStore.setError(err);
			return false;
		}
	},

	// Set selected media item
	setSelectedMediaItem(id: string | null, mediaType: MediaType | null) {
		mediaItemStore.update((state) => ({
			...state,
			selectedItemId: id,
			selectedItemType: mediaType
		}));

		// If an ID and type are provided, load details
		if (id && mediaType) {
			this.getItemDetails(id, mediaType);
		}
	},

	// Set current page
	setPage(page: number) {
		mediaItemStore.update((state) => ({
			...state,
			pagination: {
				...state.pagination,
				page
			}
		}));
	},

	// Set filters
	setFilters(filters: Partial<MediaItemFilters>) {
		mediaItemStore.update((state) => ({
			...state,
			filters: {
				...state.filters,
				...filters
			},
			// Reset pagination when filters change
			pagination: {
				...state.pagination,
				page: 1
			}
		}));
	},

	// Clear filters
	clearFilters() {
		mediaItemStore.update((state) => ({
			...state,
			filters: {},
			pagination: {
				...state.pagination,
				page: 1
			}
		}));
	}
};

// Create derived stores for easy access to specific parts of the state
export const albums = derived(mediaItemStore, ($state) => Object.values($state.mediaItems.album));

export const artists = derived(mediaItemStore, ($state) => Object.values($state.mediaItems.artist));

export const tracks = derived(mediaItemStore, ($state) => Object.values($state.mediaItems.track));

export const movies = derived(mediaItemStore, ($state) => Object.values($state.mediaItems.movie));

export const series = derived(mediaItemStore, ($state) => Object.values($state.mediaItems.series));

export const recentAlbums = derived(mediaItemStore, ($state) =>
	$state.recentItems.album.map((id) => $state.mediaItems.album[id]).filter(Boolean)
);

export const recentArtists = derived(mediaItemStore, ($state) =>
	$state.recentItems.artist.map((id) => $state.mediaItems.artist[id]).filter(Boolean)
);

export const recentTracks = derived(mediaItemStore, ($state) =>
	$state.recentItems.track.map((id) => $state.mediaItems.track[id]).filter(Boolean)
);

export const recentMovies = derived(mediaItemStore, ($state) =>
	$state.recentItems.movie.map((id) => $state.mediaItems.movie[id]).filter(Boolean)
);

export const recentSeries = derived(mediaItemStore, ($state) =>
	$state.recentItems.series.map((id) => $state.mediaItems.series[id]).filter(Boolean)
);

export const selectedMediaItem = derived(mediaItemStore, ($state) => {
	if (!$state.selectedItemId || !$state.selectedItemType) {
		return null;
	}

	const mediaTypeKey = getMediaTypeKey($state.selectedItemType);
	return $state.mediaItems[mediaTypeKey][$state.selectedItemId] || null;
});

export const mediaItemLoading = derived(mediaItemStore, ($state) => $state.loading);
export const mediaItemError = derived(mediaItemStore, ($state) => $state.error);

export default mediaItemApi;

