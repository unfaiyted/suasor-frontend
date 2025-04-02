import {
	type components,
	ErrorsErrorType,
	TypesMediaType,
	TypesClientType,
	TypesMediaClientType,
	ModelsUserConfigRecommendationFrequency,
	ModelsUserConfigRecommendationStrategy,
	ModelsUserConfigSyncFrequency
} from './suasor.v1.d';

// Auth related types
export type UserResponse = components['schemas']['responses.UserResponse'];
export type AuthData = components['schemas']['responses.AuthDataResponse'];
export type LoginRequest = components['schemas']['requests.LoginRequest'];
export type LogoutRequest = components['schemas']['requests.LogoutRequest'];
export type RefreshTokenRequest = components['schemas']['requests.RefreshTokenRequest'];
export type RegisterRequest = components['schemas']['requests.RegisterRequest'];
export type ChangePasswordRequest = components['schemas']['requests.ChangePasswordRequest'];

// Response wrapper types
export type APIUserConfigResponse =
	components['schemas']['responses.APIResponse-models_UserConfig'];
export type APIAuthDataResponse =
	components['schemas']['responses.APIResponse-responses_AuthDataResponse'];
export type APIUserResponse = components['schemas']['responses.APIResponse-responses_UserResponse'];
export type APIConfigurationResponse =
	components['schemas']['responses.APIResponse-types_Configuration'];
export type EmptyAPIResponse = components['schemas']['responses.EmptyAPIResponse'];

// Configuration types
export type UserConfig = components['schemas']['models.UserConfig'];
export type Configuration = components['schemas']['types.Configuration'];

// Client types
export type ClientType = TypesClientType;
export type MediaClientType = TypesMediaClientType;
export type ClientResponse = components['schemas']['responses.ClientResponse'];
export type APIClientResponse =
	components['schemas']['responses.APIResponse-responses_ClientResponse'];
export type APIClientsResponse =
	components['schemas']['responses.APIResponse-array_responses_ClientResponse'];

// AI interaction types
export type GenerateTextRequest = components['schemas']['requests.GenerateTextRequest'];
export type GenerateStructuredRequest = components['schemas']['requests.GenerateStructuredRequest'];
export type GenerateTextResponse = components['schemas']['responses.GenerateTextResponse'];
export type GenerateStructuredResponse =
	components['schemas']['responses.GenerateStructuredResponse'];
export type APIGenerateTextResponse =
	components['schemas']['responses.APIResponse-responses_GenerateTextResponse'];
export type APIGenerateStructuredResponse =
	components['schemas']['responses.APIResponse-responses_GenerateStructuredResponse'];

// Automation client types
export type ExecuteCommandRequest = components['schemas']['requests.ExecuteCommandRequest'];

// Media types - basic enums
export type MediaType = TypesMediaType;

// Media types - structural components
export type Artwork = components['schemas']['types.Artwork'];
export type MediaDetails = components['schemas']['types.MediaDetails'];
export type ExternalID = components['schemas']['suasor_client_media_types.ExternalID'];
export type Rating = components['schemas']['suasor_client_media_types.Rating'];

// Media types - specific media formats
export type Album = components['schemas']['types.Album'];
export type Artist = components['schemas']['types.Artist'];
export type Playlist = components['schemas']['types.Playlist'];
export type Track = components['schemas']['types.Track'];

// MediaItem types
export type MediaItemAlbum = components['schemas']['models.MediaItem-types_Album'];
export type MediaItemArtist = components['schemas']['models.MediaItem-types_Artist'];
export type MediaItemPlaylist = components['schemas']['models.MediaItem-types_Playlist'];
export type MediaItemTrack = components['schemas']['models.MediaItem-types_Track'];

// API Response types for media items
export type APIMediaItemAlbumResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Album'];
export type APIMediaItemArtistResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Artist'];
export type APIMediaItemPlaylistResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Playlist'];
export type APIMediaItemTrackResponse =
	components['schemas']['responses.APIResponse-models_MediaItem-types_Track'];

// API Response array types for media items
export type APIMediaItemAlbumsResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Album'];
export type APIMediaItemArtistsResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Artist'];
export type APIMediaItemPlaylistsResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Playlist'];
export type APIMediaItemTracksResponse =
	components['schemas']['responses.APIResponse-array_models_MediaItem-types_Track'];

// Media request types
export type AddMediaRequest = components['schemas']['requests.AddMediaRequest'];
export type UpdateMediaRequest = components['schemas']['requests.UpdateMediaRequest'];

// Recommendation types
export type RecommendationFrequency = ModelsUserConfigRecommendationFrequency;
export type RecommendationStrategy = ModelsUserConfigRecommendationStrategy;
export type SyncFrequency = ModelsUserConfigSyncFrequency;

// Error handling types
export type ErrorType = components['schemas']['errors.ErrorType'];
export type ErrorResponse = components['schemas']['responses.ErrorResponse-responses_ErrorDetails'];
export type ErrorDetailsResponse =
	components['schemas']['responses.ErrorResponse-responses_ErrorDetails'];

// Chat/Movie interface types (from components/chat/types.ts)
export interface Movie {
	id: string;
	title: string;
	year: number;
	type: 'movie' | 'series';
	poster: string;
	genres: string[];
	rating: number;
	overview: string;
	reason?: string;
}

export interface MessageContent {
	type: 'text' | 'movieList';
	text?: string;
	movies?: Movie[];
}

export interface Message {
	id: number;
	sender: 'user' | 'ai';
	avatar: number;
	name: string;
	timestamp: string;
	content: MessageContent;
}

export interface Chat {
	id: string;
	title: string;
	timestamp: string;
	messages: Message[];
	recommendations: Movie[];
}

// Legacy type alias for backward compatibility
export { ErrorsErrorType as ModelsErrorType };

