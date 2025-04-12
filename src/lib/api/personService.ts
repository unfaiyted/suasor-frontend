import { GET, POST, PUT, DELETE } from './client';
import type { components } from './suasor.v1.d';

// Types
export type Person = components['schemas']['suasor_client_media_types.Person'];
export type Credit = components['schemas']['models.Credit'];

// Request types
export type CreatePersonRequest = components['schemas']['requests.CreatePersonRequest'];
export type UpdatePersonRequest = components['schemas']['requests.UpdatePersonRequest'];
export type ImportPersonRequest = components['schemas']['requests.ImportPersonRequest'];
export type CreateCreditRequest = components['schemas']['requests.CreateCreditRequest'];
export type CreateCreditsRequest = components['schemas']['requests.CreateCreditsRequest'];

// Response types
export type APIPersonResponse = components['schemas']['responses.APIResponse-models_Person'];
export type APIPersonsResponse = components['schemas']['responses.APIResponse-array_models_Person'];
export type APICreditResponse = components['schemas']['responses.APIResponse-models_Credit'];
export type APICreditsResponse = components['schemas']['responses.APIResponse-array_models_Credit'];

// Service Functions
export const personService = {
  // Person operations
  getAllPeople: async (params?: { limit?: number; query?: string }): Promise<Person[]> => {
    const response = await GET('/people', {
      params: { query: params }
    });
    return response.data?.data || [];
  },
  
  getPersonById: async (id: string): Promise<Person | null> => {
    const response = await GET(`/people/{id}`, {
      params: { path: { id } }
    });
    return response.data?.data || null;
  },
  
  createPerson: async (request: CreatePersonRequest): Promise<Person> => {
    const response = await POST('/people', {
      body: request
    });
    return response.data?.data;
  },
  
  updatePerson: async (id: string, request: UpdatePersonRequest): Promise<Person> => {
    const response = await PUT(`/people/{id}`, {
      params: { path: { id } },
      body: request
    });
    return response.data?.data;
  },
  
  deletePerson: async (id: string): Promise<void> => {
    await DELETE(`/people/{id}`, {
      params: { path: { id } }
    });
  },
  
  importPerson: async (request: ImportPersonRequest): Promise<Person> => {
    const response = await POST('/people/import', {
      body: request
    });
    return response.data?.data;
  },
  
  searchPeople: async (query: string, limit: number = 20): Promise<Person[]> => {
    const response = await GET('/people/search', {
      params: { query: { q: query, limit } }
    });
    return response.data?.data || [];
  },
  
  // Credit operations
  getPersonCredits: async (personId: string): Promise<Credit[]> => {
    const response = await GET(`/people/{id}/credits`, {
      params: { path: { id: personId } }
    });
    return response.data?.data || [];
  },
  
  getMediaItemCredits: async (mediaItemId: string): Promise<Credit[]> => {
    const response = await GET(`/media/items/{id}/credits`, {
      params: { path: { id: mediaItemId } }
    });
    return response.data?.data || [];
  },
  
  createCredit: async (request: CreateCreditRequest): Promise<Credit> => {
    const response = await POST('/credits', {
      body: request
    });
    return response.data?.data;
  },
  
  createMultipleCredits: async (mediaItemId: string, request: CreateCreditsRequest): Promise<Credit[]> => {
    const response = await POST(`/media/items/{id}/credits`, {
      params: { path: { id: mediaItemId } },
      body: request
    });
    return response.data?.data || [];
  },
  
  deleteCredit: async (id: string): Promise<void> => {
    await DELETE(`/credits/{id}`, {
      params: { path: { id } }
    });
  },
  
  updateCredit: async (id: string, request: Partial<CreateCreditRequest>): Promise<Credit> => {
    const response = await PUT(`/credits/{id}`, {
      params: { path: { id } },
      body: request
    });
    return response.data?.data;
  }
};

export default personService;