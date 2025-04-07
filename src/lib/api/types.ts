import {
	type components,
	ErrorsErrorType,
	TypesMediaType,
	TypesClientType,
	TypesMediaClientType,
	ModelsUserConfigRecommendationStrategy,
	ModelsUserConfigRecommendationSyncFrequency
} from './suasor.v1.d';

// Auth related types
export type UserResponse = components['schemas']['responses.UserResponse'];
export type AuthData = components['schemas']['responses.AuthDataResponse'];
export type LoginRequest = components['schemas']['requests.LoginRequest'];
export type LogoutRequest = components['schemas']['requests.LogoutRequest'];
export type RefreshTokenRequest = components['schemas']['requests.RefreshTokenRequest'];
export type RegisterRequest = components['schemas']['requests.RegisterRequest'];
export type ChangePasswordRequest = components['schemas']['requests.ChangePasswordRequest'];
// export type ClientType = components['schemas']['types.ClientType'];

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
export type ClientRequest = components['schemas']['requests.ClientRequest-types_ClientConfig'];
export type ClientConfig = components['schemas']['models.Client-types_ClientConfig'];
export type ClientWithConfig = components['schemas']['models.Client-types_ClientConfig'];
export type APIClientResponse =
	components['schemas']['responses.APIResponse-models_Client-types_ClientConfig'];
export type APIClientsResponse =
	components['schemas']['responses.APIResponse-array_models_Client-types_ClientConfig'];

// AI interaction types
export type AiRecommendationResponse = components['schemas']['responses.AiRecommendationResponse'];
export type AiContentAnalysisResponse =
	components['schemas']['responses.AiContentAnalysisResponse'];

// export type GenerateTextRequest = components['schemas']['requests.GenerateTextRequest'];
// export type GenerateStructuredRequest = components['schemas']['requests.GenerateStructuredRequest'];
// export type GenerateTextResponse = components['schemas']['responses.GenerateTextResponse'];
// export type GenerateStructuredResponse =
// components['schemas']['responses.GenerateStructuredResponse'];
// export type APIGenerateTextResponse =
// components['schemas']['responses.APIResponse-responses_GenerateTextResponse'];
// export type APIGenerateStructuredResponse =
// components['schemas']['responses.APIResponse-responses_GenerateStructuredResponse'];

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
export type Movie = components['schemas']['suasor_client_media_types.Movie'];
export type Series = components['schemas']['types.Series'];
export type Person = components['schemas']['suasor_client_media_types.Person'];

// MediaItem types
export type MediaItemAlbum = components['schemas']['models.MediaItem-types_Album'];
export type MediaItemArtist = components['schemas']['models.MediaItem-types_Artist'];
export type MediaItemPlaylist = components['schemas']['models.MediaItem-types_Playlist'];
export type MediaItemTrack = components['schemas']['models.MediaItem-types_Track'];
export type MediaItemMovie =
	components['schemas']['models.MediaItem-suasor_client_media_types_Movie'];
export type MediaItemSeries = components['schemas']['models.MediaItem-types_Series'];
export type MediaClient = components['schemas']['models.Client-types_ClientConfig'];

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
export type RecommendationFrequency = ModelsUserConfigRecommendationSyncFrequency;
export type RecommendationStrategy = ModelsUserConfigRecommendationStrategy;
export type SyncFrequency = ModelsUserConfigRecommendationSyncFrequency;

// Error handling types
export type ErrorType = components['schemas']['errors.ErrorType'];
export type ErrorResponse = components['schemas']['responses.ErrorResponse-responses_ErrorDetails'];
export type ErrorDetailsResponse =
	components['schemas']['responses.ErrorResponse-responses_ErrorDetails'];

export type PlexConfig = components['schemas']['types.PlexConfig'];
export type EmbyConfig = components['schemas']['types.EmbyConfig'];
export type JellyfinConfig = components['schemas']['types.JellyfinConfig'];
export type SubsonicConfig = components['schemas']['types.SubsonicConfig'];

export type LidarrConfig = components['schemas']['types.LidarrConfig'];
export type RadarrConfig = components['schemas']['types.RadarrConfig'];
export type SonarrConfig = components['schemas']['types.SonarrConfig'];

export type ClaudeConfig = components['schemas']['types.ClaudeConfig'];
export type OpenAIConfig = components['schemas']['types.OpenAIConfig'];
export type OllamaConfig = components['schemas']['types.OllamaConfig'];
// Gemini config defined manually since it's not in the schema yet
export interface GeminiConfig {
	apiKey?: string;
	baseURL?: string;
	category?: string; // Should match ClientCategoryAI
	clientType?: TypesClientType;
	maxContextTokens?: number;
	maxTokens?: number;
}

export type ClientConfigTypes =
	| PlexConfig
	| EmbyConfig
	| JellyfinConfig
	| SubsonicConfig
	| LidarrConfig
	| RadarrConfig
	| SonarrConfig
	| ClaudeConfig
	| OpenAIConfig
	| OllamaConfig
	| GeminiConfig;

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
