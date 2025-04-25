import { GET, POST, PUT, DELETE } from './client';
import type { components } from './suasor.v1.d';
import { TypesMediaType } from './suasor.v1.d';

// Export media type enum
export type MediaType = TypesMediaType;
export { TypesMediaType };

// Media structural components
export type Artwork = components['schemas']['types.Artwork'];
export type MediaDetails = components['schemas']['types.MediaDetails'];
export type ExternalID = components['schemas']['suasor_clients_media_types.ExternalID'];
export type Rating = components['schemas']['suasor_clients_media_types.Rating'];

// Media types - specific media formats
export type Album = components['schemas']['types.Album'];
export type Artist = components['schemas']['types.Artist'];
export type Playlist = components['schemas']['types.Playlist'];
export type Track = components['schemas']['types.Track'];
export type Movie = components['schemas']['suasor_clients_media_types.Movie'];
export type Series = components['schemas']['types.Series'];

// Media item types
export type MediaItemAlbum = components['schemas']['models.MediaItem-types_Album'];
export type MediaItemArtist = components['schemas']['models.MediaItem-types_Artist'];
export type MediaItemPlaylist = components['schemas']['models.MediaItem-types_Playlist'];
export type MediaItemTrack = components['schemas']['models.MediaItem-types_Track'];
export type MediaItemMovie =
	components['schemas']['models.MediaItem-suasor_clients_media_types_Movie'];
export type MediaItemSeries = components['schemas']['models.MediaItem-types_Series'];

export type MediaItem =
	| MediaItemMovie
	| MediaItemSeries
	| MediaItemAlbum
	| MediaItemArtist
	| MediaItemPlaylist
	| MediaItemTrack;

// Request types
export type AddMediaRequest = components['schemas']['requests.AddMediaRequest'];
export type UpdateMediaRequest = components['schemas']['requests.UpdateMediaRequest'];
// export type ImportMediaRequest = components['schemas']['requests.ImportMediaRequest'];

// Response types
export type APIMediaItemAlbumResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Album'];
export type APIMediaItemArtistResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Artist'];
export type APIMediaItemPlaylistResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Playlist'];
export type APIMediaItemTrackResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Track'];
export type APIMediaItemMovieResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-suasor_clients_media_types_Movie'];
export type APIMediaItemSingleSeriesResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Series'];

export type APIMediaItemResponse =
	| APIMediaItemAlbumResponse
	| APIMediaItemArtistResponse
	| APIMediaItemPlaylistResponse
	| APIMediaItemTrackResponse
	| APIMediaItemMovieResponse
	| APIMediaItemSingleSeriesResponse;

// Array response types
export type APIMediaItemAlbumsResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Album'];
export type APIMediaItemArtistsResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Artist'];
export type APIMediaItemPlaylistsResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_ListData'];
export type APIMediaItemTracksResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Track'];
export type APIMediaItemMoviesResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-suasor_clients_media_types_Movie'];
export type APIMediaItemSeriesResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Series'];

// Service Functions
export const mediaService = {
	// Generic media item operations
	getAllMediaItems: async (params?: {
		mediaType?: MediaType;
		limit?: number;
	}): Promise<MediaItem[]> => {
		const response = await GET('/media/items', {
			params: { query: params }
		});
		return response.data?.data || [];
	},

	getMediaItemById: async (id: string): Promise<MediaItem | null> => {
		const response = await GET(`/media/items/{id}`, {
			params: { path: { id } }
		});
		return response.data?.data || null;
	},

	addMediaItem: async (request: AddMediaRequest): Promise<MediaItem> => {
		const response = await POST('/media/items', {
			body: request
		});
		return response.data?.data;
	},

	updateMediaItem: async (id: string, request: UpdateMediaRequest): Promise<MediaItem> => {
		const response = await PUT(`/media/items/{id}`, {
			params: { path: { id } },
			body: request
		});
		return response.data?.data;
	},

	deleteMediaItem: async (id: string): Promise<void> => {
		await DELETE(`/media/items/{id}`, {
			params: { path: { id } }
		});
	},

	importMediaItem: async (request: ImportMediaRequest): Promise<MediaItem> => {
		const response = await POST('/media/items/import', {
			body: request
		});
		return response.data?.data;
	},

	// Media type specific operations
	// Movies
	getAllMovies: async (limit: number = 50): Promise<MediaItemMovie[]> => {
		const response = await GET('/movies', {
			params: { query: { limit } }
		});
		return response.data?.data || [];
	},

	getMovieById: async (id: string): Promise<MediaItemMovie | null> => {
		const response = await GET(`/movies/{id}`, {
			params: { path: { id } }
		});
		return response.data?.data || null;
	},

	getPopularMovies: async (limit: number = 20): Promise<MediaItemMovie[]> => {
		const response = await GET('/movies/popular/{count}', {
			params: { path: { limit } }
		});
		return response.data?.data || [];
	},

	getRecentMovies: async (limit: number = 20): Promise<MediaItemMovie[]> => {
		const response = await GET('/movies/latest/{count}', {
			params: { path: { limit } }
		});
		return response.data?.data || [];
	},

	getMoviesByGenre: async (genre: string, limit: number = 20): Promise<MediaItemMovie[]> => {
		const response = await GET('/movies/genre/{genre}', {
			params: {
				path: { genre },
				query: { limit }
			}
		});
		return response.data?.data || [];
	},

	getMoviesByYear: async (year: number, limit: number = 20): Promise<MediaItemMovie[]> => {
		const response = await GET('/movies/year/{year}', {
			params: {
				path: { year },
				query: { limit }
			}
		});
		return response.data?.data || [];
	},

	// TV Series
	getAllSeries: async (limit: number = 50): Promise<MediaItemSeries[]> => {
		const response = await GET('/series', {
			params: { query: { limit } }
		});
		return response.data?.data || [];
	},

	getSeriesById: async (id: string): Promise<MediaItemSeries | null> => {
		const response = await GET(`/series/{id}`, {
			params: { path: { id } }
		});
		return response.data?.data || null;
	},

	getPopularSeries: async (limit: number = 20): Promise<MediaItemSeries[]> => {
		const response = await GET('/series/popular/{count}', {
			params: { path: { limit } }
		});
		return response.data?.data || [];
	},

	getRecentSeries: async (limit: number = 20): Promise<MediaItemSeries[]> => {
		const response = await GET('/series/latest/{count}', {
			params: { path: { limit } }
		});
		return response.data?.data || [];
	},

	getSeriesByGenre: async (genre: string, limit: number = 20): Promise<MediaItemSeries[]> => {
		const response = await GET('/series/genre/{genre}', {
			params: {
				path: { genre },
				query: { limit }
			}
		});
		return response.data?.data || [];
	},

	// Music - Albums
	getAllAlbums: async (limit: number = 50): Promise<MediaItemAlbum[]> => {
		const response = await GET('/music/albums', {
			params: { query: { limit } }
		});
		return response.data?.data || [];
	},

	getAlbumById: async (id: string): Promise<MediaItemAlbum | null> => {
		const response = await GET(`/music/albums/{id}`, {
			params: { path: { id } }
		});
		return response.data?.data || null;
	},

	// Music - Artists
	getAllArtists: async (limit: number = 50): Promise<MediaItemArtist[]> => {
		const response = await GET('/music/artists', {
			params: { query: { limit } }
		});
		return response.data?.data || [];
	},

	getArtistById: async (id: string): Promise<MediaItemArtist | null> => {
		const response = await GET(`/music/artists/{id}`, {
			params: { path: { id } }
		});
		return response.data?.data || null;
	},

	// Music - Tracks
	getAllTracks: async (limit: number = 50): Promise<MediaItemTrack[]> => {
		const response = await GET('/music/tracks', {
			params: { query: { limit } }
		});
		return response.data?.data || [];
	},

	getTrackById: async (id: string): Promise<MediaItemTrack | null> => {
		const response = await GET(`/music/tracks/{id}`, {
			params: { path: { id } }
		});
		return response.data?.data || null;
	},

	// Playlists
	getAllPlaylists: async (limit: number = 50): Promise<MediaItemPlaylist[]> => {
		const response = await GET('/playlists', {
			params: { query: { limit } }
		});
		return response.data?.data || [];
	},

	getPlaylistById: async (id: string): Promise<MediaItemPlaylist | null> => {
		const response = await GET(`/playlists/{id}`, {
			params: { path: { id } }
		});
		return response.data?.data || null;
	}
};

export default mediaService;
