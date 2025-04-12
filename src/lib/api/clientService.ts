import { GET, POST, PUT, DELETE } from './client';
import type { components } from './suasor.v1.d';
import { TypesClientType, TypesMediaClientType } from './suasor.v1.d';

// Enums
export type ClientType = TypesClientType;
export type MediaClientType = TypesMediaClientType;
export { TypesClientType, TypesMediaClientType };

// Client types
export type Client = components['schemas']['models.Client-types_ClientConfig'];
export type ClientWithConfig = components['schemas']['models.Client-types_ClientConfig'];
export type ClientConfig = components['schemas']['types.ClientConfig'];
export type ClientRequest = components['schemas']['requests.ClientRequest-types_ClientConfig'];
export type TestClientRequest = components['schemas']['requests.TestClientRequest'];

// Specific client configs
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

// Response types
export type APIClientResponse = components['schemas']['responses.APIResponse-models_Client-types_ClientConfig'];
export type APIClientsResponse = components['schemas']['responses.APIResponse-array_models_Client-types_ClientConfig'];
export type TestClientResponse = components['schemas']['responses.TestClientResponse'];
export type APITestClientResponse = components['schemas']['responses.APIResponse-responses_TestClientResponse'];

// Additional types not in the schema
export interface GeminiConfig {
  apiKey?: string;
  baseURL?: string;
  category?: string; 
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

// Service Functions
export const clientService = {
  // Client management
  getAllClients: async (): Promise<Client[]> => {
    const response = await GET('/clients');
    return response.data?.data || [];
  },
  
  getClientById: async (id: number): Promise<Client | null> => {
    const response = await GET(`/clients/{id}`, {
      params: { path: { id } }
    });
    return response.data?.data || null;
  },
  
  getClientsByType: async (type: ClientType): Promise<Client[]> => {
    const response = await GET('/clients/type/{type}', {
      params: { path: { type } }
    });
    return response.data?.data || [];
  },
  
  createClient: async (request: ClientRequest): Promise<Client> => {
    const response = await POST('/clients', {
      body: request
    });
    return response.data?.data;
  },
  
  updateClient: async (id: number, request: ClientRequest): Promise<Client> => {
    const response = await PUT(`/clients/{id}`, {
      params: { path: { id } },
      body: request
    });
    return response.data?.data;
  },
  
  deleteClient: async (id: number): Promise<void> => {
    await DELETE(`/clients/{id}`, {
      params: { path: { id } }
    });
  },
  
  testClient: async (request: TestClientRequest): Promise<TestClientResponse> => {
    const response = await POST('/clients/test', {
      body: request
    });
    return response.data?.data;
  },
  
  // Media Clients
  getMediaClients: async (): Promise<Client[]> => {
    const response = await GET('/clients/media');
    return response.data?.data || [];
  },
  
  getMediaClientById: async (id: number): Promise<Client | null> => {
    const response = await GET(`/clients/media/{id}`, {
      params: { path: { id } }
    });
    return response.data?.data || null;
  },
  
  // AI Clients
  getAIClients: async (): Promise<Client[]> => {
    const response = await GET('/clients/ai');
    return response.data?.data || [];
  },
  
  getAIClientById: async (id: number): Promise<Client | null> => {
    const response = await GET(`/clients/ai/{id}`, {
      params: { path: { id } }
    });
    return response.data?.data || null;
  },
  
  // Automation Clients
  getAutomationClients: async (): Promise<Client[]> => {
    const response = await GET('/clients/automation');
    return response.data?.data || [];
  },
  
  getAutomationClientById: async (id: number): Promise<Client | null> => {
    const response = await GET(`/clients/automation/{id}`, {
      params: { path: { id } }
    });
    return response.data?.data || null;
  },
  
  // Execute Command (for automation clients)
  executeCommand: async (clientId: number, command: string, params?: any): Promise<any> => {
    const response = await POST(`/clients/automation/{id}/execute`, {
      params: { path: { id: clientId } },
      body: { command, params }
    });
    return response.data?.data;
  }
};

export default clientService;