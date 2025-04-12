import { writable, derived, get } from 'svelte/store';
import { GET } from '$lib/api/client';
import type { BaseApiState } from './base';
import { createBaseStore, createCache, type CacheOptions } from './base';
import type { MediaType } from '$lib/api/types';

// Define search result item type
export interface SearchResultItem {
  id: string;
  title: string;
  type: MediaType | 'recent';
  source: SearchSource;
  year?: number;
  poster?: string;
  subtitle?: string;
  inLibrary?: boolean;
  rating?: number;
  genre?: string[];
  details?: any; // Additional details that vary by media type
}

// Define search sources
export type SearchSource = 
  | 'local'      // Local database/items
  | 'client'     // Media client integrations (Plex, Emby, etc.)
  | 'metadata'   // Metadata providers (TMDB, IMDB, etc.)
  | 'recent'     // Recent searches
  | 'suggested'; // Suggested searches

// Define search filters
export interface SearchFilters {
  mediaType?: MediaType | 'all';
  year?: { min?: number; max?: number };
  genres?: string[];
  rating?: { min?: number; max?: number };
  inLibrary?: boolean;
  sources?: SearchSource[];
  limit?: number;
}

// Define search store state
export interface SearchState extends BaseApiState {
  // Query and filters
  query: string;
  filters: SearchFilters;
  
  // Results grouped by source and status
  results: {
    local: {
      items: SearchResultItem[];
      loading: boolean;
      error: string | null;
      done: boolean;
    };
    client: {
      items: SearchResultItem[];
      loading: boolean;
      error: string | null;
      done: boolean;
    };
    metadata: {
      items: SearchResultItem[];
      loading: boolean;
      error: string | null;
      done: boolean;
    };
  };
  
  // Recent searches
  recentSearches: string[];
  
  // Suggested searches based on current query
  suggestedSearches: string[];
  
  // Selected result
  selectedResultIndex: number;
}

// Initial state
const initialSearchState: SearchState = {
  loading: false,
  error: null,
  query: '',
  filters: {
    mediaType: 'all',
    sources: ['local', 'client', 'metadata']
  },
  results: {
    local: {
      items: [],
      loading: false,
      error: null,
      done: false
    },
    client: {
      items: [],
      loading: false,
      error: null,
      done: false
    },
    metadata: {
      items: [],
      loading: false,
      error: null,
      done: false
    }
  },
  recentSearches: [],
  suggestedSearches: [],
  selectedResultIndex: -1
};

// Create the search store
const searchStore = createBaseStore<SearchState>(initialSearchState);

// Create a cache for search results
const searchCache = createCache<any>();

// Helper to format cache key based on query and filters
const getCacheKey = (source: SearchSource, query: string, filters: SearchFilters) => {
  return `search:${source}:${query}:${JSON.stringify(filters)}`;
};

// Load recent searches from localStorage
const loadRecentSearches = (): string[] => {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('suasor_recent_searches');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading recent searches:', error);
  }
  
  return [];
};

// Save recent searches to localStorage
const saveRecentSearch = (query: string, recentSearches: string[]) => {
  if (!query.trim() || typeof localStorage === 'undefined') return recentSearches;
  
  // Add to start of array, remove duplicates, limit to 10
  const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
  
  try {
    localStorage.setItem('suasor_recent_searches', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent searches:', error);
  }
  
  return updated;
};

// Enhanced store with search-specific operations
export const searchApi = {
  ...searchStore,
  
  // Initialize store, load recent searches
  initialize() {
    const recentSearches = loadRecentSearches();
    searchStore.update(state => ({
      ...state,
      recentSearches
    }));
  },
  
  // Set search query
  setQuery(query: string) {
    searchStore.update(state => ({
      ...state,
      query,
      // Reset selected index when query changes
      selectedResultIndex: -1
    }));
  },
  
  // Set search filters
  setFilters(filters: Partial<SearchFilters>) {
    searchStore.update(state => ({
      ...state,
      filters: {
        ...state.filters,
        ...filters
      }
    }));
  },
  
  // Clear search filters
  clearFilters() {
    searchStore.update(state => ({
      ...state,
      filters: {
        mediaType: 'all',
        sources: ['local', 'client', 'metadata']
      }
    }));
  },
  
  // Set selected result by index
  setSelectedResult(index: number) {
    const state = searchStore.getState();
    const allResults = this.getAllResults();
    
    if (index >= -1 && index < allResults.length) {
      searchStore.update(state => ({
        ...state,
        selectedResultIndex: index
      }));
    }
  },
  
  // Move selection up/down
  moveSelection(direction: 'up' | 'down') {
    const state = searchStore.getState();
    const allResults = this.getAllResults();
    
    if (allResults.length === 0) {
      searchStore.update(state => ({
        ...state,
        selectedResultIndex: -1
      }));
      return;
    }
    
    let newIndex = state.selectedResultIndex;
    
    if (direction === 'down') {
      newIndex = newIndex === -1 || newIndex >= allResults.length - 1 ? 0 : newIndex + 1;
    } else {
      newIndex = newIndex <= 0 ? allResults.length - 1 : newIndex - 1;
    }
    
    searchStore.update(state => ({
      ...state,
      selectedResultIndex: newIndex
    }));
  },
  
  // Get all results combined from all sources
  getAllResults(): SearchResultItem[] {
    const state = searchStore.getState();
    const { local, client, metadata } = state.results;
    
    // Combine and filter results
    let allResults: SearchResultItem[] = [
      ...local.items,
      ...client.items,
      ...metadata.items
    ];
    
    // Apply current filters
    const { filters } = state;
    
    if (filters.mediaType && filters.mediaType !== 'all') {
      allResults = allResults.filter(item => item.type === filters.mediaType);
    }
    
    if (filters.year) {
      if (filters.year.min) {
        allResults = allResults.filter(item => item.year && item.year >= filters.year.min!);
      }
      if (filters.year.max) {
        allResults = allResults.filter(item => item.year && item.year <= filters.year.max!);
      }
    }
    
    if (filters.genres && filters.genres.length > 0) {
      allResults = allResults.filter(item => 
        item.genre && 
        filters.genres!.some(g => item.genre!.includes(g))
      );
    }
    
    if (filters.rating) {
      if (filters.rating.min) {
        allResults = allResults.filter(item => item.rating && item.rating >= filters.rating.min!);
      }
      if (filters.rating.max) {
        allResults = allResults.filter(item => item.rating && item.rating <= filters.rating.max!);
      }
    }
    
    if (filters.inLibrary !== undefined) {
      allResults = allResults.filter(item => item.inLibrary === filters.inLibrary);
    }
    
    return allResults;
  },
  
  // Get recent searches as search results
  getRecentSearchesAsResults(): SearchResultItem[] {
    const state = searchStore.getState();
    
    return state.recentSearches.map(query => ({
      id: `recent-${query}`,
      title: query,
      type: 'recent',
      source: 'recent',
      subtitle: 'Recent search'
    }));
  },
  
  // Save a search query to recent searches
  saveRecentSearch(query: string) {
    if (!query.trim()) return;
    
    searchStore.update(state => ({
      ...state,
      recentSearches: saveRecentSearch(query, state.recentSearches)
    }));
  },
  
  // Clear recent searches
  clearRecentSearches() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('suasor_recent_searches');
    }
    
    searchStore.update(state => ({
      ...state,
      recentSearches: []
    }));
  },
  
  // Reset search results but keep query and filters
  resetResults() {
    searchStore.update(state => ({
      ...state,
      results: {
        local: {
          items: [],
          loading: false,
          error: null,
          done: false
        },
        client: {
          items: [],
          loading: false,
          error: null,
          done: false
        },
        metadata: {
          items: [],
          loading: false,
          error: null,
          done: false
        }
      },
      selectedResultIndex: -1
    }));
  },
  
  // Clear entire search (query, filters, and results)
  clearSearch() {
    searchStore.update(state => ({
      ...state,
      query: '',
      filters: {
        mediaType: 'all',
        sources: ['local', 'client', 'metadata']
      },
      results: {
        local: {
          items: [],
          loading: false,
          error: null,
          done: false
        },
        client: {
          items: [],
          loading: false,
          error: null,
          done: false
        },
        metadata: {
          items: [],
          loading: false,
          error: null,
          done: false
        }
      },
      suggestedSearches: [],
      selectedResultIndex: -1
    }));
  },
  
  // Perform search
  async search() {
    const state = searchStore.getState();
    const { query, filters } = state;
    
    if (!query.trim()) {
      this.resetResults();
      return;
    }
    
    // Set overall loading state
    searchStore.setLoading(true);
    
    // Reset results
    this.resetResults();
    
    // Determine which sources to search
    const sources = filters.sources || ['local', 'client', 'metadata'];
    
    // Start searches in parallel
    const promises: Promise<any>[] = [];
    
    if (sources.includes('local')) {
      promises.push(this.searchLocal());
    }
    
    if (sources.includes('client')) {
      promises.push(this.searchClients());
    }
    
    if (sources.includes('metadata')) {
      promises.push(this.searchMetadata());
    }
    
    // Wait for all searches to complete
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      // Individual errors are handled by each search method
      console.error('Search error:', error);
    } finally {
      // Clear overall loading state
      searchStore.setLoading(false);
    }
  },
  
  // Search local database
  async searchLocal() {
    const state = searchStore.getState();
    const { query, filters } = state;
    
    // Update source loading state
    searchStore.update(state => ({
      ...state,
      results: {
        ...state.results,
        local: {
          ...state.results.local,
          loading: true,
          error: null,
          done: false
        }
      }
    }));
    
    // Check cache first
    const cacheKey = getCacheKey('local', query, filters);
    const cachedResults = searchCache.get(cacheKey);
    
    if (cachedResults) {
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          local: {
            items: cachedResults,
            loading: false,
            error: null,
            done: true
          }
        }
      }));
      return cachedResults;
    }
    
    try {
      // Construct API parameters
      const params: Record<string, any> = {
        query,
        source: 'local'
      };
      
      // Add media type filter if not 'all'
      if (filters.mediaType && filters.mediaType !== 'all') {
        params.mediaType = filters.mediaType;
      }
      
      // Add other filters
      if (filters.year?.min) params.yearMin = filters.year.min;
      if (filters.year?.max) params.yearMax = filters.year.max;
      if (filters.genres?.length) params.genres = filters.genres.join(',');
      if (filters.rating?.min) params.ratingMin = filters.rating.min;
      if (filters.rating?.max) params.ratingMax = filters.rating.max;
      if (filters.limit) params.limit = filters.limit;
      
      // Call search API
      const response = await GET('/search' as any, { params });
      
      if (!response.data?.data) {
        throw new Error('Local search failed to return data');
      }
      
      // Process results
      const items: SearchResultItem[] = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.mediaType,
        source: 'local',
        year: item.year,
        poster: item.poster,
        subtitle: item.subtitle || item.overview?.substring(0, 50),
        inLibrary: true, // Local items are always in library
        rating: item.rating,
        genre: item.genres,
        details: item
      }));
      
      // Update store with results
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          local: {
            items,
            loading: false,
            error: null,
            done: true
          }
        }
      }));
      
      // Cache results
      searchCache.set(cacheKey, items);
      
      return items;
    } catch (error) {
      console.error('Local search error:', error);
      
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          local: {
            ...state.results.local,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            done: true
          }
        }
      }));
      
      return [];
    }
  },
  
  // Search media clients (Plex, Emby, etc.)
  async searchClients() {
    const state = searchStore.getState();
    const { query, filters } = state;
    
    // Update source loading state
    searchStore.update(state => ({
      ...state,
      results: {
        ...state.results,
        client: {
          ...state.results.client,
          loading: true,
          error: null,
          done: false
        }
      }
    }));
    
    // Check cache first
    const cacheKey = getCacheKey('client', query, filters);
    const cachedResults = searchCache.get(cacheKey);
    
    if (cachedResults) {
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          client: {
            items: cachedResults,
            loading: false,
            error: null,
            done: true
          }
        }
      }));
      return cachedResults;
    }
    
    try {
      // Construct API parameters
      const params: Record<string, any> = {
        query,
        source: 'client'
      };
      
      // Add media type filter if not 'all'
      if (filters.mediaType && filters.mediaType !== 'all') {
        params.mediaType = filters.mediaType;
      }
      
      // Add other filters
      if (filters.year?.min) params.yearMin = filters.year.min;
      if (filters.year?.max) params.yearMax = filters.year.max;
      if (filters.genres?.length) params.genres = filters.genres.join(',');
      if (filters.rating?.min) params.ratingMin = filters.rating.min;
      if (filters.rating?.max) params.ratingMax = filters.rating.max;
      if (filters.limit) params.limit = filters.limit;
      
      // Call search API
      const response = await GET('/search/clients' as any, { params });
      
      if (!response.data?.data) {
        throw new Error('Client search failed to return data');
      }
      
      // Process results
      const items: SearchResultItem[] = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.mediaType,
        source: 'client',
        year: item.year,
        poster: item.poster,
        subtitle: item.subtitle || `${item.sourceName}: ${item.overview?.substring(0, 40)}`,
        inLibrary: true, // Client items are always in library
        rating: item.rating,
        genre: item.genres,
        details: item
      }));
      
      // Update store with results
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          client: {
            items,
            loading: false,
            error: null,
            done: true
          }
        }
      }));
      
      // Cache results
      searchCache.set(cacheKey, items);
      
      return items;
    } catch (error) {
      console.error('Client search error:', error);
      
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          client: {
            ...state.results.client,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            done: true
          }
        }
      }));
      
      return [];
    }
  },
  
  // Search metadata providers (TMDB, IMDB, etc.)
  async searchMetadata() {
    const state = searchStore.getState();
    const { query, filters } = state;
    
    // Update source loading state
    searchStore.update(state => ({
      ...state,
      results: {
        ...state.results,
        metadata: {
          ...state.results.metadata,
          loading: true,
          error: null,
          done: false
        }
      }
    }));
    
    // Check cache first
    const cacheKey = getCacheKey('metadata', query, filters);
    const cachedResults = searchCache.get(cacheKey);
    
    if (cachedResults) {
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          metadata: {
            items: cachedResults,
            loading: false,
            error: null,
            done: true
          }
        }
      }));
      return cachedResults;
    }
    
    try {
      // Construct API parameters
      const params: Record<string, any> = {
        query,
        source: 'metadata'
      };
      
      // Add media type filter if not 'all'
      if (filters.mediaType && filters.mediaType !== 'all') {
        params.mediaType = filters.mediaType;
      }
      
      // Add other filters
      if (filters.year?.min) params.yearMin = filters.year.min;
      if (filters.year?.max) params.yearMax = filters.year.max;
      if (filters.genres?.length) params.genres = filters.genres.join(',');
      if (filters.rating?.min) params.ratingMin = filters.rating.min;
      if (filters.rating?.max) params.ratingMax = filters.rating.max;
      if (filters.limit) params.limit = filters.limit;
      
      // Call search API
      const response = await GET('/search/metadata' as any, { params });
      
      if (!response.data?.data) {
        throw new Error('Metadata search failed to return data');
      }
      
      // Process results
      const items: SearchResultItem[] = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.mediaType,
        source: 'metadata',
        year: item.year,
        poster: item.poster,
        subtitle: item.subtitle || `${item.provider}: ${item.overview?.substring(0, 40)}`,
        inLibrary: false, // Metadata items typically aren't in library
        rating: item.rating,
        genre: item.genres,
        details: item
      }));
      
      // Find items that are already in the local or client results
      // and mark them as in library
      const state = searchStore.getState();
      const localIds = state.results.local.items.map(item => item.id);
      const clientIds = state.results.client.items.map(item => item.id);
      
      // If the metadata item has the same ID as a local or client item, mark it as in library
      const itemsWithLibraryStatus = items.map(item => ({
        ...item,
        inLibrary: localIds.includes(item.id) || clientIds.includes(item.id)
      }));
      
      // Update store with results
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          metadata: {
            items: itemsWithLibraryStatus,
            loading: false,
            error: null,
            done: true
          }
        }
      }));
      
      // Cache results
      searchCache.set(cacheKey, itemsWithLibraryStatus);
      
      return itemsWithLibraryStatus;
    } catch (error) {
      console.error('Metadata search error:', error);
      
      searchStore.update(state => ({
        ...state,
        results: {
          ...state.results,
          metadata: {
            ...state.results.metadata,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            done: true
          }
        }
      }));
      
      return [];
    }
  },
  
  // Get suggestions based on current query
  async getSuggestions() {
    const state = searchStore.getState();
    const { query } = state;
    
    if (!query.trim() || query.length < 2) {
      searchStore.update(state => ({
        ...state,
        suggestedSearches: []
      }));
      return [];
    }
    
    try {
      const response = await GET('/search/suggestions' as any, { 
        params: { query }
      });
      
      if (!response.data?.data) {
        return [];
      }
      
      const suggestions = response.data.data;
      
      searchStore.update(state => ({
        ...state,
        suggestedSearches: suggestions
      }));
      
      return suggestions;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }
};

// Create derived stores for easy access
export const searchResults = derived(searchStore, ($state) => {
  return {
    local: $state.results.local.items,
    client: $state.results.client.items,
    metadata: $state.results.metadata.items
  };
});

export const allSearchResults = derived(searchStore, ($state) => {
  if (!$state.query.trim()) {
    // Return recent searches when query is empty
    return searchApi.getRecentSearchesAsResults();
  }
  
  // Return combined results
  return searchApi.getAllResults();
});

export const searchState = derived(searchStore, ($state) => {
  return {
    isLoading: $state.loading || 
      $state.results.local.loading || 
      $state.results.client.loading || 
      $state.results.metadata.loading,
    isDone: $state.results.local.done && 
      $state.results.client.done && 
      $state.results.metadata.done,
    hasError: $state.error !== null || 
      $state.results.local.error !== null || 
      $state.results.client.error !== null || 
      $state.results.metadata.error !== null
  };
});

export const searchQuery = derived(searchStore, ($state) => $state.query);
export const searchFilters = derived(searchStore, ($state) => $state.filters);
export const recentSearches = derived(searchStore, ($state) => $state.recentSearches);
export const suggestedSearches = derived(searchStore, ($state) => $state.suggestedSearches);

export const selectedResult = derived(searchStore, ($state) => {
  const index = $state.selectedResultIndex;
  if (index === -1) return null;
  
  const allResults = searchApi.getAllResults();
  if (index < allResults.length) {
    return allResults[index];
  }
  
  return null;
});

export default searchApi;