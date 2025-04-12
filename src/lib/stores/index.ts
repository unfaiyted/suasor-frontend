// src/lib/stores/index.ts
// Export all stores for easier imports

// Auth store
export { default as authStore, isAuthenticated, authUser, authLoading, authError } from './auth';

// Config store
export {
  default as configApi,
  userConfig,
  systemConfig,
  appPreferences,
  activeTab,
  theme,
  sidebarCollapsed,
  configLoading,
  configError,
  configSuccess
} from './config';

// User store
export {
  default as userApi,
  currentUser,
  users,
  userLoading,
  userError,
  userSuccess,
  userPage,
  userTotalPages,
  userTotalCount
} from './user';

// Media store
export { default as mediaStore } from './mediaStore';

// Media Item store
export { 
  default as mediaItemApi,
  albums,
  artists,
  tracks,
  movies,
  series,
  recentAlbums,
  recentArtists,
  recentTracks,
  recentMovies,
  recentSeries,
  selectedMediaItem,
  mediaItemLoading,
  mediaItemError
} from './mediaItem';

// Person and Credits store
export {
  default as personApi,
  people,
  selectedPerson,
  selectedPersonCredits,
  personLoading,
  personError,
  getMediaItemCredits,
  getMediaItemCreditsByRole,
  getMediaItemCast,
  getMediaItemCrew,
  getMediaItemCrewByDepartment,
  getMediaItemDirectors
} from './personStore';

// Playlist store
export {
  default as playlistApi,
  playlists,
  selectedPlaylist,
  selectedPlaylistItems,
  isReorderingPlaylist,
  playlistLoading,
  playlistError,
  getPlaylistItems
} from './playlistStore';

// Search store
export {
  default as searchApi,
  searchResults,
  allSearchResults,
  searchState,
  searchQuery,
  searchFilters,
  recentSearches,
  suggestedSearches,
  selectedResult
} from './search';

// Other stores
export { default as chatStore } from './chat';
export { default as conversationStore } from './conversation';
export { default as jobsStore } from './jobs';
export { default as dashboardStore } from './dashboard';
export { default as mediaCollectionStore } from './mediaCollection';
export { default as movieCartStore } from './movieCart';

// Base store utilities
export { createBaseStore, createCache, createPaginationHelpers, handleApiError } from './base';
export type { BaseApiState, CacheOptions, CacheEntry } from './base';