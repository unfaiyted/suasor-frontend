// Re-export types from service-specific files for backward compatibility
// This allows existing code to continue importing from types.ts

// Base error types from API definition
import { ErrorsErrorType } from './suasor.v1.d';

// Auth types
export type {
  User,
  UserResponse,
  AuthData,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateUserRequest,
  UpdateUserProfileRequest,
  APIUserResponse,
  APIAuthDataResponse,
  APIUsersResponse
} from './authService';

// Media types
export type {
  MediaType,
  Artwork,
  MediaDetails,
  ExternalID,
  Rating,
  Album,
  Artist,
  Playlist,
  Track,
  Movie,
  Series,
  MediaItem,
  MediaItemAlbum,
  MediaItemArtist,
  MediaItemPlaylist,
  MediaItemTrack,
  MediaItemMovie,
  MediaItemSeries,
  AddMediaRequest,
  UpdateMediaRequest,
  ImportMediaRequest,
  APIMediaItemResponse,
  APIMediaItemsResponse,
  APIMediaItemAlbumResponse,
  APIMediaItemArtistResponse,
  APIMediaItemPlaylistResponse,
  APIMediaItemTrackResponse,
  APIMediaItemMovieResponse,
  APIMediaItemSeriesResponse,
  APIMediaItemAlbumsResponse,
  APIMediaItemArtistsResponse,
  APIMediaItemPlaylistsResponse,
  APIMediaItemTracksResponse,
  APIMediaItemMoviesResponse,
  APIMediaItemSeriesResponse
} from './mediaService';
export { TypesMediaType } from './mediaService';

// Person and credit types
export type {
  Person,
  Credit,
  CreatePersonRequest,
  UpdatePersonRequest,
  ImportPersonRequest,
  CreateCreditRequest,
  CreateCreditsRequest,
  APIPersonResponse,
  APIPersonsResponse,
  APICreditResponse,
  APICreditsResponse
} from './personService';

// Client types
export type {
  ClientType,
  MediaClientType,
  Client,
  ClientWithConfig,
  ClientConfig,
  ClientRequest,
  TestClientRequest,
  PlexConfig,
  EmbyConfig,
  JellyfinConfig,
  SubsonicConfig,
  LidarrConfig,
  RadarrConfig,
  SonarrConfig,
  ClaudeConfig,
  OpenAIConfig,
  OllamaConfig,
  GeminiConfig,
  ClientConfigTypes,
  APIClientResponse,
  APIClientsResponse,
  TestClientResponse,
  APITestClientResponse
} from './clientService';
export { TypesClientType, TypesMediaClientType } from './clientService';

// Configuration types
export type {
  RecommendationStrategy,
  RecommendationFrequency,
  SyncFrequency,
  UserConfig,
  Configuration,
  SystemConfig,
  UpdateUserConfigRequest,
  UpdateSystemConfigRequest,
  APIUserConfigResponse,
  APISystemConfigResponse,
  APIConfigurationResponse
} from './configService';
export { 
  ModelsUserConfigRecommendationStrategy, 
  ModelsUserConfigRecommendationSyncFrequency 
} from './configService';

// Search types
export type {
  SearchResult,
  SearchRequest,
  APISearchResponse,
  APISearchSuggestionsResponse
} from './searchService';

// Job types
export type {
  JobRun,
  JobSchedule,
  MediaSyncJob
} from './jobService';
export { JobStatus, JobType } from './jobService';

// Error handling types
export type ErrorType = ErrorsErrorType;
export type ErrorResponse = import('./suasor.v1.d').components['schemas']['responses.ErrorResponse-responses_ErrorDetails'];
export type ErrorDetailsResponse = import('./suasor.v1.d').components['schemas']['responses.ErrorResponse-responses_ErrorDetails'];

// Custom types for application use
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