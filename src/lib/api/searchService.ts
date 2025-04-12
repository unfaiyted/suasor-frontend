import { GET } from './client';
import type { components } from './suasor.v1.d';
import type { MediaType } from './mediaService';

// Types
export type SearchResult = components['schemas']['responses.SearchResult'];
export type SearchRequest = components['schemas']['requests.SearchRequest'];

// Response types
export type APISearchResponse = components['schemas']['responses.APIResponse-array_responses_SearchResult'];
export type APISearchSuggestionsResponse = components['schemas']['responses.APIResponse-array_string'];

// Service Functions
export const searchService = {
  // General search
  search: async (query: string, params?: {
    mediaType?: MediaType;
    limit?: number;
    yearMin?: number;
    yearMax?: number;
    genres?: string[];
    source?: 'local' | 'client' | 'metadata';
  }): Promise<SearchResult[]> => {
    const searchParams: Record<string, any> = { query };
    
    if (params) {
      Object.assign(searchParams, params);
      
      // Convert genres array to string if present
      if (params.genres && Array.isArray(params.genres)) {
        searchParams.genres = params.genres.join(',');
      }
    }
    
    const response = await GET('/search', {
      params: { query: searchParams }
    });
    return response.data?.data || [];
  },
  
  // Search in clients
  searchClients: async (query: string, params?: {
    mediaType?: MediaType;
    limit?: number;
    clientId?: number;
  }): Promise<SearchResult[]> => {
    const response = await GET('/search/clients', {
      params: { 
        query: { 
          query, 
          ...params 
        } 
      }
    });
    return response.data?.data || [];
  },
  
  // Search metadata providers
  searchMetadata: async (query: string, params?: {
    mediaType?: MediaType;
    limit?: number;
    provider?: string;
  }): Promise<SearchResult[]> => {
    const response = await GET('/search/metadata', {
      params: { 
        query: { 
          query, 
          ...params 
        } 
      }
    });
    return response.data?.data || [];
  },
  
  // Get search suggestions
  getSuggestions: async (query: string, limit: number = 10): Promise<string[]> => {
    const response = await GET('/search/suggestions', {
      params: { query: { query, limit } }
    });
    return response.data?.data || [];
  }
};

export default searchService;