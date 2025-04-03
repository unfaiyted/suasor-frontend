import { writable } from 'svelte/store';
import { GET, POST, DELETE } from '$lib/api/client';
import type { BaseApiState } from './base';
import type { ClientResponse, ClientRequest, ClientConfigTypes } from '$lib/api/types';
import { TypesClientCategory, TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
import { createBaseStore, handleApiError } from './base';

// Interface for clients state in store
export interface ClientsState extends BaseApiState {
	clients: ClientResponse[];
}

// Create clients store with initial state
const initialClientsState: ClientsState = {
	loading: false,
	error: null,
	clients: []
};

// Create the base store with common functionality
const clientsStore = createBaseStore<ClientsState>(initialClientsState);

// Enhanced store with client-specific operations
export const clientsApi = {
	...clientsStore,

	// Load all clients for the current user
	loadClients: async () => {
		clientsStore.setLoading(true);

		try {
			const response = await GET('/clients');

			if (response.data?.data) {
				clientsStore.update((state) => ({
					...state,
					clients: response.data?.data || [],
					loading: false
				}));
				return response.data.data;
			} else {
				throw new Error('Failed to load clients');
			}
		} catch (err) {
			clientsStore.setError(err);
			return [];
		}
	},

	// Create a new client
	createClient: async (
		name: string,
		clientType: TypesClientType | TypesMediaClientType,
		url: string,
		apiKey?: string,
		username?: string,
		password?: string,
		token?: string
	) => {
		clientsStore.setLoading(true);

		try {
			const clientTypeStr = clientType.toString().toLowerCase();

			// Build the client configuration with properties as expected by backend
			const clientConfig: ClientConfigTypes = {
				clientType: clientType as TypesMediaClientType,
				baseURL: url,
				type: clientType as TypesClientType,
				category:
					clientTypeStr.includes('emby') ||
					clientTypeStr.includes('jellyfin') ||
					clientTypeStr.includes('plex') ||
					clientTypeStr.includes('subsonic')
						? TypesClientCategory.ClientCategoryMedia
						: clientTypeStr.includes('sonarr') ||
							  clientTypeStr.includes('radarr') ||
							  clientTypeStr.includes('lidarr')
							? TypesClientCategory.ClientCategoryAutomation
							: TypesClientCategory.ClientCategoryAI
			};

			// Add appropriate authentication based on client type
			if (apiKey) clientConfig.apiKey = apiKey;
			if (username) clientConfig.username = username;
			if (password) clientConfig.password = password;
			if (token) clientConfig.token = token;

			// Build the complete request with proper structure matching backend expectations
			const clientRequest: ClientRequest = {
				name,
				isEnabled: true,
				clientType: clientType as TypesClientType,
				client: clientConfig
			};

			const response = await POST(`/admin/client/${clientTypeStr}`, {
				body: clientRequest
			});

			if (response.data?.data) {
				// Add the new client to the store
				clientsStore.update((state) => ({
					...state,
					clients: [...state.clients, response.data?.data],
					loading: false
				}));
				return response.data.data;
			} else {
				throw new Error(response.error?.message || 'Failed to create client');
			}
		} catch (err) {
			clientsStore.setError(err);
			return null;
		}
	},

	// Delete a client
	deleteClient: async (clientId: string, clientType: string) => {
		clientsStore.setLoading(true);

		try {
			await DELETE(`/admin/client/${clientType}/${clientId}`);

			// Remove the deleted client from the store
			clientsStore.update((state) => ({
				...state,
				clients: state.clients.filter((client) => client.id !== clientId),
				loading: false
			}));

			return true;
		} catch (err) {
			clientsStore.setError(err);
			return false;
		}
	},

	// Get a client by ID
	getClient: (clientId: string) => {
		let client = null;

		clientsStore.subscribe((state) => {
			client = state.clients.find((c) => c.id === parseInt(clientId));
		});

		return client;
	},

	// Get clients by type
	getClientsByType: (type: TypesClientType | TypesMediaClientType) => {
		let filteredClients: ClientResponse[] = [];

		clientsStore.subscribe((state) => {
			filteredClients = state.clients.filter((c) => c.type === type);
		});

		return filteredClients;
	}
};

