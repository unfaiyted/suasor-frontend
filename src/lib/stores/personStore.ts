import { derived } from 'svelte/store';
import { GET, POST, PUT, DELETE } from '$lib/api/client';
import type { BaseApiState } from './base';
import { createBaseStore, createCache, type CacheOptions } from './base';

// Define Person type based on API schema
export interface Person {
  id: string;
  name?: string;
  photo?: string;
  role?: string;
  character?: string;
  isArtist?: boolean;
  isCast?: boolean;
  isCreator?: boolean;
  isCrew?: boolean;
  isGuest?: boolean;
}

// Define search/filter parameters
export interface PersonFilters {
  query?: string;
  role?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'popularity';
  sortDirection?: 'asc' | 'desc';
}

// Define credit-specific properties
export interface Credit extends Person {
  mediaItemId: string;
  department?: string;
  order?: number;
}

// Request types
export interface CreatePersonRequest {
  name: string;
  photo?: string;
  role?: string;
  externalIds?: Record<string, string>;
}

export interface ImportPersonRequest {
  sourceId: string;
  source: string;
}

export interface CreateCreditRequest {
  personId: string;
  mediaItemId: string;
  role?: string;
  character?: string;
  department?: string;
  order?: number;
  isArtist?: boolean;
  isCast?: boolean;
  isCreator?: boolean;
  isCrew?: boolean;
  isGuest?: boolean;
}

export interface CreateCreditsRequest {
  credits: CreateCreditRequest[];
}

// Person store state
export interface PersonState extends BaseApiState {
  // People by ID
  people: Record<string, Person>;
  
  // Credits by media item ID
  creditsByMediaItem: Record<string, Credit[]>;
  
  // Credits by person ID
  creditsByPerson: Record<string, Credit[]>;
  
  // Pagination
  pagination: {
    page: number;
    totalPages: number;
    totalResults: number;
  };
  
  // Filters for search
  filters: PersonFilters;
  
  // Selected person
  selectedPersonId: string | null;
}

// Initial state
const initialPersonState: PersonState = {
  loading: false,
  error: null,
  people: {},
  creditsByMediaItem: {},
  creditsByPerson: {},
  pagination: {
    page: 1,
    totalPages: 1,
    totalResults: 0
  },
  filters: {},
  selectedPersonId: null
};

// Create the person store
const personStore = createBaseStore<PersonState>(initialPersonState);

// Create a cache for person data
const personCache = createCache<any>();

// Enhanced store with person-specific operations
export const personApi = {
  ...personStore,
  
  // Search for people
  async searchPeople(query: string, filters?: Partial<PersonFilters>) {
    const state = personStore.getState();
    
    // Combine current filters with new filters
    const combinedFilters = {
      ...state.filters,
      ...filters,
      query
    };
    
    // Create a cache key based on the query and filters
    const cacheKey = `person:search:${JSON.stringify(combinedFilters)}`;
    const cachedData = personCache.get(cacheKey, { enabled: true, ttl: 10 * 60 * 1000 });
    
    if (cachedData) {
      // Update store with cached data
      personStore.update((state) => ({
        ...state,
        filters: combinedFilters,
        pagination: cachedData.pagination,
        people: {
          ...state.people,
          ...cachedData.peopleById
        }
      }));
      
      return {
        results: cachedData.results,
        totalResults: cachedData.pagination.totalResults,
        totalPages: cachedData.pagination.totalPages
      };
    }
    
    personStore.setLoading(true);
    
    try {
      const response = await GET('/people' as any, {
        params: { 
          ...combinedFilters, 
          page: state.pagination.page 
        }
      });
      
      if (!response.data?.data) {
        throw new Error('Person search failed');
      }
      
      // Process and store the results
      const results = response.data.data;
      const pagination = {
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalResults: response.data.totalResults || results.length
      };
      
      const peopleById: Record<string, Person> = {};
      
      results.forEach((person: Person) => {
        peopleById[person.id] = person;
      });
      
      // Update the store
      personStore.update((state) => ({
        ...state,
        filters: combinedFilters,
        pagination,
        people: {
          ...state.people,
          ...peopleById
        },
        loading: false
      }));
      
      // Cache the results
      personCache.set(cacheKey, {
        results,
        peopleById,
        pagination
      });
      
      return {
        results,
        totalResults: pagination.totalResults,
        totalPages: pagination.totalPages
      };
    } catch (err) {
      personStore.setError(err);
      return { results: [], totalResults: 0, totalPages: 0 };
    }
  },
  
  // Get person details
  async getPersonDetails(id: string) {
    const state = personStore.getState();
    
    // If we already have this person in the store with full details, return it
    const existingPerson = state.people[id];
    if (existingPerson && existingPerson.name) {
      return existingPerson;
    }
    
    const cacheKey = `person:details:${id}`;
    const cachedData = personCache.get(cacheKey);
    if (cachedData) {
      // Update the store with the cached person
      personStore.update((state) => ({
        ...state,
        people: {
          ...state.people,
          [id]: cachedData
        }
      }));
      return cachedData;
    }
    
    personStore.setLoading(true);
    
    try {
      const response = await GET(`/people/${id}` as any);
      
      if (!response.data?.data) {
        throw new Error(`Failed to load details for person ${id}`);
      }
      
      const personDetails = response.data.data;
      
      // Update the store
      personStore.update((state) => ({
        ...state,
        people: {
          ...state.people,
          [id]: personDetails
        },
        loading: false
      }));
      
      // Cache the results
      personCache.set(cacheKey, personDetails);
      
      return personDetails;
    } catch (err) {
      personStore.setError(err);
      return null;
    }
  },
  
  // Create a new person
  async createPerson(personData: CreatePersonRequest) {
    personStore.setLoading(true);
    
    try {
      const response = await POST('/people' as any, {
        body: personData
      });
      
      if (!response.data?.data) {
        throw new Error('Failed to create person');
      }
      
      const newPerson = response.data.data;
      
      // Update the store
      personStore.update((state) => ({
        ...state,
        people: {
          ...state.people,
          [newPerson.id]: newPerson
        },
        loading: false
      }));
      
      // Invalidate relevant caches
      personCache.invalidatePattern(/^person:search:/);
      
      return newPerson;
    } catch (err) {
      personStore.setError(err);
      return null;
    }
  },
  
  // Import a person from external source
  async importPerson(importRequest: ImportPersonRequest) {
    personStore.setLoading(true);
    
    try {
      const response = await POST('/people/import' as any, {
        body: importRequest
      });
      
      if (!response.data?.data) {
        throw new Error('Failed to import person');
      }
      
      const importedPerson = response.data.data;
      
      // Update the store
      personStore.update((state) => ({
        ...state,
        people: {
          ...state.people,
          [importedPerson.id]: importedPerson
        },
        loading: false
      }));
      
      // Invalidate relevant caches
      personCache.invalidatePattern(/^person:search:/);
      
      return importedPerson;
    } catch (err) {
      personStore.setError(err);
      return null;
    }
  },
  
  // Update a person
  async updatePerson(id: string, updates: Partial<CreatePersonRequest>) {
    personStore.setLoading(true);
    
    try {
      const response = await PUT(`/people/${id}` as any, {
        body: updates
      });
      
      if (!response.data?.data) {
        throw new Error(`Failed to update person ${id}`);
      }
      
      const updatedPerson = response.data.data;
      
      // Update the store
      personStore.update((state) => ({
        ...state,
        people: {
          ...state.people,
          [id]: updatedPerson
        },
        loading: false
      }));
      
      // Invalidate relevant caches
      personCache.invalidate(`person:details:${id}`);
      personCache.invalidatePattern(/^person:search:/);
      
      return updatedPerson;
    } catch (err) {
      personStore.setError(err);
      return null;
    }
  },
  
  // Delete a person
  async deletePerson(id: string) {
    personStore.setLoading(true);
    
    try {
      await DELETE(`/people/${id}` as any);
      
      // Update the store by removing the person
      personStore.update((state) => {
        const updatedPeople = { ...state.people };
        delete updatedPeople[id];
        
        // Also remove from credits
        const updatedCreditsByPerson = { ...state.creditsByPerson };
        delete updatedCreditsByPerson[id];
        
        // Update credits by media item to remove this person
        const updatedCreditsByMediaItem = { ...state.creditsByMediaItem };
        Object.keys(updatedCreditsByMediaItem).forEach(mediaItemId => {
          updatedCreditsByMediaItem[mediaItemId] = updatedCreditsByMediaItem[mediaItemId].filter(
            credit => credit.id !== id
          );
        });
        
        return {
          ...state,
          people: updatedPeople,
          creditsByPerson: updatedCreditsByPerson,
          creditsByMediaItem: updatedCreditsByMediaItem,
          loading: false
        };
      });
      
      // Invalidate relevant caches
      personCache.invalidate(`person:details:${id}`);
      personCache.invalidatePattern(/^person:search:/);
      personCache.invalidatePattern(new RegExp(`^credits:person:${id}`));
      personCache.invalidatePattern(/^credits:mediaItem:/);
      
      return true;
    } catch (err) {
      personStore.setError(err);
      return false;
    }
  },
  
  // Get credits for a media item
  async getMediaItemCredits(mediaItemId: string) {
    const state = personStore.getState();
    
    // If we already have credits for this media item, return them
    if (state.creditsByMediaItem[mediaItemId]?.length > 0) {
      return state.creditsByMediaItem[mediaItemId];
    }
    
    const cacheKey = `credits:mediaItem:${mediaItemId}`;
    const cachedData = personCache.get(cacheKey);
    if (cachedData) {
      // Update the store with the cached credits
      personStore.update((state) => ({
        ...state,
        creditsByMediaItem: {
          ...state.creditsByMediaItem,
          [mediaItemId]: cachedData.credits
        },
        people: {
          ...state.people,
          ...cachedData.peopleById
        }
      }));
      return cachedData.credits;
    }
    
    personStore.setLoading(true);
    
    try {
      const response = await GET(`/media/items/${mediaItemId}/credits` as any);
      
      if (!response.data?.data) {
        throw new Error(`Failed to load credits for media item ${mediaItemId}`);
      }
      
      const credits = response.data.data;
      const peopleById: Record<string, Person> = {};
      
      credits.forEach((credit: Credit) => {
        if (credit.id) {
          peopleById[credit.id] = credit;
        }
      });
      
      // Update the store
      personStore.update((state) => ({
        ...state,
        creditsByMediaItem: {
          ...state.creditsByMediaItem,
          [mediaItemId]: credits
        },
        people: {
          ...state.people,
          ...peopleById
        },
        loading: false
      }));
      
      // Cache the results
      personCache.set(cacheKey, { credits, peopleById });
      
      return credits;
    } catch (err) {
      personStore.setError(err);
      return [];
    }
  },
  
  // Get credits for a person
  async getPersonCredits(personId: string) {
    const state = personStore.getState();
    
    // If we already have credits for this person, return them
    if (state.creditsByPerson[personId]?.length > 0) {
      return state.creditsByPerson[personId];
    }
    
    const cacheKey = `credits:person:${personId}`;
    const cachedData = personCache.get(cacheKey);
    if (cachedData) {
      // Update the store with the cached credits
      personStore.update((state) => ({
        ...state,
        creditsByPerson: {
          ...state.creditsByPerson,
          [personId]: cachedData.credits
        }
      }));
      return cachedData.credits;
    }
    
    personStore.setLoading(true);
    
    try {
      const response = await GET(`/people/${personId}/credits` as any);
      
      if (!response.data?.data) {
        throw new Error(`Failed to load credits for person ${personId}`);
      }
      
      const credits = response.data.data;
      
      // Update the store
      personStore.update((state) => ({
        ...state,
        creditsByPerson: {
          ...state.creditsByPerson,
          [personId]: credits
        },
        loading: false
      }));
      
      // Cache the results
      personCache.set(cacheKey, { credits });
      
      return credits;
    } catch (err) {
      personStore.setError(err);
      return [];
    }
  },
  
  // Add a credit
  async addCredit(creditData: CreateCreditRequest) {
    personStore.setLoading(true);
    
    try {
      const response = await POST('/credits' as any, {
        body: creditData
      });
      
      if (!response.data?.data) {
        throw new Error('Failed to add credit');
      }
      
      const newCredit = response.data.data;
      
      // Update the store
      personStore.update((state) => {
        // Update credits by media item
        const mediaItemCredits = [...(state.creditsByMediaItem[creditData.mediaItemId] || [])];
        mediaItemCredits.push(newCredit);
        
        // Update credits by person
        const personCredits = [...(state.creditsByPerson[creditData.personId] || [])];
        personCredits.push(newCredit);
        
        return {
          ...state,
          creditsByMediaItem: {
            ...state.creditsByMediaItem,
            [creditData.mediaItemId]: mediaItemCredits
          },
          creditsByPerson: {
            ...state.creditsByPerson,
            [creditData.personId]: personCredits
          },
          loading: false
        };
      });
      
      // Invalidate relevant caches
      personCache.invalidate(`credits:mediaItem:${creditData.mediaItemId}`);
      personCache.invalidate(`credits:person:${creditData.personId}`);
      
      return newCredit;
    } catch (err) {
      personStore.setError(err);
      return null;
    }
  },
  
  // Add multiple credits
  async addCredits(mediaItemId: string, creditsData: CreateCreditsRequest) {
    personStore.setLoading(true);
    
    try {
      const response = await POST(`/media/items/${mediaItemId}/credits` as any, {
        body: creditsData
      });
      
      if (!response.data?.data) {
        throw new Error('Failed to add credits');
      }
      
      const newCredits = response.data.data;
      
      // Update the store
      personStore.update((state) => {
        // Update credits by media item
        const mediaItemCredits = [...(state.creditsByMediaItem[mediaItemId] || []), ...newCredits];
        
        // Update credits by person
        const updatedCreditsByPerson = { ...state.creditsByPerson };
        newCredits.forEach((credit: Credit) => {
          if (credit.id) {
            const personId = credit.id;
            updatedCreditsByPerson[personId] = [
              ...(updatedCreditsByPerson[personId] || []),
              credit
            ];
          }
        });
        
        return {
          ...state,
          creditsByMediaItem: {
            ...state.creditsByMediaItem,
            [mediaItemId]: mediaItemCredits
          },
          creditsByPerson: updatedCreditsByPerson,
          loading: false
        };
      });
      
      // Invalidate relevant caches
      personCache.invalidate(`credits:mediaItem:${mediaItemId}`);
      creditsData.credits.forEach(credit => {
        personCache.invalidate(`credits:person:${credit.personId}`);
      });
      
      return newCredits;
    } catch (err) {
      personStore.setError(err);
      return null;
    }
  },
  
  // Delete a credit
  async deleteCredit(creditId: string, mediaItemId: string, personId: string) {
    personStore.setLoading(true);
    
    try {
      await DELETE(`/credits/${creditId}` as any);
      
      // Update the store
      personStore.update((state) => {
        // Remove from credits by media item
        const updatedMediaItemCredits = (state.creditsByMediaItem[mediaItemId] || [])
          .filter(credit => credit.id !== creditId);
        
        // Remove from credits by person
        const updatedPersonCredits = (state.creditsByPerson[personId] || [])
          .filter(credit => credit.id !== creditId);
        
        return {
          ...state,
          creditsByMediaItem: {
            ...state.creditsByMediaItem,
            [mediaItemId]: updatedMediaItemCredits
          },
          creditsByPerson: {
            ...state.creditsByPerson,
            [personId]: updatedPersonCredits
          },
          loading: false
        };
      });
      
      // Invalidate relevant caches
      personCache.invalidate(`credits:mediaItem:${mediaItemId}`);
      personCache.invalidate(`credits:person:${personId}`);
      
      return true;
    } catch (err) {
      personStore.setError(err);
      return false;
    }
  },
  
  // Set selected person
  setSelectedPerson(personId: string | null) {
    personStore.update((state) => ({
      ...state,
      selectedPersonId: personId
    }));
    
    // If an ID is provided, load details and credits
    if (personId) {
      this.getPersonDetails(personId);
      this.getPersonCredits(personId);
    }
  },
  
  // Set current page
  setPage(page: number) {
    personStore.update((state) => ({
      ...state,
      pagination: {
        ...state.pagination,
        page
      }
    }));
  },
  
  // Set filters
  setFilters(filters: Partial<PersonFilters>) {
    personStore.update((state) => ({
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
    personStore.update((state) => ({
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
export const people = derived(personStore, ($state) => 
  Object.values($state.people)
);

export const selectedPerson = derived(personStore, ($state) => 
  $state.selectedPersonId ? $state.people[$state.selectedPersonId] || null : null
);

export const selectedPersonCredits = derived(personStore, ($state) => 
  $state.selectedPersonId ? $state.creditsByPerson[$state.selectedPersonId] || [] : []
);

export const personLoading = derived(personStore, ($state) => $state.loading);
export const personError = derived(personStore, ($state) => $state.error);

// Helper function to get credits for a media item
export function getMediaItemCredits(mediaItemId: string) {
  return derived(personStore, ($state) => 
    $state.creditsByMediaItem[mediaItemId] || []
  );
}

// Helper function to get credits by role for a media item
export function getMediaItemCreditsByRole(mediaItemId: string, role: string) {
  return derived(personStore, ($state) => 
    ($state.creditsByMediaItem[mediaItemId] || [])
      .filter(credit => credit.role?.toLowerCase() === role.toLowerCase())
  );
}

// Helper function to get cast members for a media item
export function getMediaItemCast(mediaItemId: string) {
  return derived(personStore, ($state) => 
    ($state.creditsByMediaItem[mediaItemId] || [])
      .filter(credit => credit.isCast)
      .sort((a, b) => (a.order || 999) - (b.order || 999))
  );
}

// Helper function to get crew members for a media item
export function getMediaItemCrew(mediaItemId: string) {
  return derived(personStore, ($state) => 
    ($state.creditsByMediaItem[mediaItemId] || [])
      .filter(credit => credit.isCrew)
  );
}

// Helper to get a specific department's crew members
export function getMediaItemCrewByDepartment(mediaItemId: string, department: string) {
  return derived(personStore, ($state) => 
    ($state.creditsByMediaItem[mediaItemId] || [])
      .filter(credit => 
        credit.isCrew && 
        credit.department?.toLowerCase() === department.toLowerCase()
      )
  );
}

// Helper to get directors for a media item
export function getMediaItemDirectors(mediaItemId: string) {
  return derived(personStore, ($state) => 
    ($state.creditsByMediaItem[mediaItemId] || [])
      .filter(credit => 
        (credit.role?.toLowerCase() === "director") || 
        (credit.department?.toLowerCase() === "directing" && 
         credit.role?.toLowerCase() === "director")
      )
  );
}

export default personApi;