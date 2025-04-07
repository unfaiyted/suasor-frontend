import { writable, derived } from 'svelte/store';
import { GET, POST, DELETE, PUT } from '$lib/api/client';
import type { BaseApiState } from './base';
import type { ClientResponse, ClientRequest, ClientConfigTypes } from '$lib/api/types';
import { TypesClientCategory, TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
import { createBaseStore, handleApiError, createCache } from './base';

// Interface for clients state in store
export interface ClientsState extends BaseApiState {
	clients: ClientResponse[];
	clientsByType: Record<string, ClientResponse[]>;
	clientsById: Record<string, ClientResponse>;
	success: string | null;
}

// Create clients store with initial state
const initialClientsState: ClientsState = {
	loading: false,
	error: null,
	clients: [],
	clientsByType: {},
	clientsById: {},
	success: null
};

// Create the base store with common functionality
const clientsStore = createBaseStore<ClientsState>(initialClientsState);

// Create cache for clients data
const clientsCache = createCache<any>();

// Helper function to organize clients by type
function organizeClientsByType(
	clients: ClientResponse[]
): Record<TypesClientType, ClientResponse[]> {
	const result: Record<TypesClientType, ClientResponse[]> = {};

	// Initialize with all possible client types to ensure they exist in the result
	Object.values(TypesClientType).forEach((type: TypesClientType) => {
		result[type] = [];
	});

	Object.values(TypesMediaClientType).forEach((type) => {
		result[type] = [];
	});

	// Group clients by type
	clients.forEach((client) => {
		if (client.clientType) {
			const type = client.clientType;
			if (!result[type]) {
				result[type] = [];
			}
			result[type].push(client);
		} else {
			console.warn('Client type is undefined:', client.clientType);
		}
	});

	return result;
}

// Helper function to create a map of clients by ID
function organizeClientsById(clients: ClientResponse[]): Record<string, ClientResponse> {
	const result: Record<string, ClientResponse> = {};

	clients.forEach((client) => {
		if (client.id) {
			result[client.id.toString()] = client;
		} else {
			console.warn('Client ID is undefined:', client);
		}
	});

	return result;
}

// Enhanced store with client-specific operations
export const clientsApi = {
	...clientsStore,

	// Load all clients for the current user
	loadClients: async () => {
		// First check cache
		const cachedClients = clientsCache.get('clients:all');
		if (cachedClients) {
			clientsStore.update((state) => ({
				...state,
				clients: cachedClients,
				clientsByType: organizeClientsByType(cachedClients),
				clientsById: organizeClientsById(cachedClients)
			}));
			return cachedClients;
		}

		clientsStore.setLoading(true);

		try {
			const response = await GET('/clients');

			if (response.data?.data) {
				const clients = response.data.data;

				// Organize clients by type and ID
				const clientsByType = organizeClientsByType(clients);
				const clientsById = organizeClientsById(clients);

				clientsStore.update((state) => ({
					...state,
					clients,
					clientsByType,
					clientsById,
					loading: false
				}));

				// Cache the results
				clientsCache.set('clients:all', clients);

				return clients;
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
		token?: string,
		isEnabled: boolean = true
	) => {
		clientsStore.setLoading(true);

		try {
			const clientTypeStr = clientType.toString().toLowerCase();

			// Determine client category based on client type
			const category =
				clientTypeStr.includes('emby') ||
				clientTypeStr.includes('jellyfin') ||
				clientTypeStr.includes('plex') ||
				clientTypeStr.includes('subsonic')
					? TypesClientCategory.ClientCategoryMedia
					: clientTypeStr.includes('sonarr') ||
						  clientTypeStr.includes('radarr') ||
						  clientTypeStr.includes('lidarr')
						? TypesClientCategory.ClientCategoryAutomation
						: TypesClientCategory.ClientCategoryAI;

			// Build the client configuration with properties as expected by backend
			const clientConfig: Partial<ClientConfigTypes> = {
				baseURL: url,
				category
			};

			// Add appropriate authentication based on client type
			if (apiKey) (clientConfig as any).apiKey = apiKey;
			if (username) (clientConfig as any).username = username;
			if (password) (clientConfig as any).password = password;
			if (token) (clientConfig as any).token = token;

			// Build the complete request with proper structure matching backend expectations
			const clientRequest: ClientRequest = {
				name,
				isEnabled,
				clientType: clientType as TypesClientType,
				client: clientConfig
			};

			// Cast the path to avoid TypeScript route checking issues
			const response = await POST(`/admin/client/${clientTypeStr}` as any, {
				body: clientRequest
			});

			if (response.data?.data) {
				const newClient = response.data.data;

				// Update the store
				clientsStore.update((state) => {
					const updatedClients = [...state.clients, newClient];
					return {
						...state,
						clients: updatedClients,
						clientsByType: organizeClientsByType(updatedClients),
						clientsById: { ...state.clientsById, [newClient.id]: newClient },
						loading: false,
						success: `${name} integration created successfully`
					};
				});

				// Invalidate cache
				clientsCache.invalidate('clients:all');

				return newClient;
			} else {
				throw new Error(response.error?.message || 'Failed to create client');
			}
		} catch (err) {
			clientsStore.setError(err);
			return null;
		}
	},

	// Update a client (including enabled status)
	updateClient: async (client: ClientRequest) => {
		clientsStore.setLoading(true);

		try {
			const clientTypeStr = client.clientType.toString().toLowerCase();
			const clientId = client?.clientID?.toString();

			// Cast the path to avoid TypeScript route checking issues
			const response = await PUT(`/admin/client/${clientTypeStr}/${clientId}` as any, {
				body: client
			});

			if (response.data?.data) {
				const updatedClient = response.data.data;

				// Update the store
				clientsStore.update((state) => {
					const updatedClients = state.clients.map((c) =>
						c.id === client.clientID ? updatedClient : c
					);
					return {
						...state,
						clients: updatedClients,
						clientsByType: organizeClientsByType(updatedClients),
						clientsById: { ...state.clientsById, [updatedClient.id]: updatedClient },
						loading: false,
						success: `${client.name} integration updated successfully`
					};
				});

				// Invalidate cache
				clientsCache.invalidate('clients:all');

				return updatedClient;
			} else {
				throw new Error(response.error?.message || 'Failed to update client');
			}
		} catch (err) {
			clientsStore.setError(err);
			return null;
		}
	},

	// Toggle client enabled status
	toggleClientEnabled: async (client: ClientResponse, isEnabled: boolean) => {
		clientsStore.setLoading(true);

		try {
			const clientTypeStr = client.clientType.toString().toLowerCase();
			const clientId = client?.id?.toString();

			console.log('client:', client);
			// Create updated client with new isEnabled status
			const updatedClient: ClientRequest = {
				// ...client,
				clientType: client.clientType as TypesClientType,
				clientID: client.id,
				name: client.name || '',
				isEnabled: !client.isEnabled
			};

			console.log('updatedClient:', updatedClient);
			// Cast the path to avoid TypeScript route checking issues
			const response = await PUT(`/admin/client/${clientTypeStr}/${clientId}` as any, {
				body: updatedClient
			});

			if (response.data?.data) {
				const resultClient = response.data.data;
				const statusText = isEnabled ? 'enabled' : 'disabled';

				// Update the store
				clientsStore.update((state) => {
					const updatedClients = state.clients.map((c) =>
						c.id === client.clientID ? resultClient : c
					);
					return {
						...state,
						clients: updatedClients,
						clientsByType: organizeClientsByType(updatedClients),
						clientsById: { ...state.clientsById, [resultClient.id]: resultClient },
						loading: false,
						success: `${client.name} integration ${statusText} successfully`
					};
				});

				// Invalidate cache
				clientsCache.invalidate('clients:all');

				return resultClient;
			} else {
				throw new Error(response.error?.message || 'Failed to update client status');
			}
		} catch (err) {
			clientsStore.setError(err);
			return null;
		}
	},

	// Delete a client
	deleteClient: async (clientId: string, clientType: string) => {
		clientsStore.setLoading(true);

		// Get client name before deletion for success message
		const state = clientsStore.getState();
		const client = state.clientsById[clientId];
		const clientName = client ? client.name : 'Integration';

		try {
			// Cast the path to avoid TypeScript route checking issues
			await DELETE(`/admin/client/${clientType}/${clientId}` as any);

			// Update the store
			clientsStore.update((state) => {
				const updatedClients = state.clients.filter((client) => client.id !== Number(clientId));
				return {
					...state,
					clients: updatedClients,
					clientsByType: organizeClientsByType(updatedClients),
					clientsById: organizeClientsById(updatedClients),
					loading: false,
					success: `${clientName} deleted successfully`
				};
			});

			// Invalidate cache
			clientsCache.invalidate('clients:all');

			return true;
		} catch (err) {
			clientsStore.setError(err);
			return false;
		}
	},

	// Test client connection (with existing client ID)
	testClient: async (client: ClientRequest) => {
		clientsStore.setLoading(true);

		try {
			const clientTypeStr = client.clientType;
			const clientId = client.clientID?.toString();

			// Cast the path to avoid TypeScript route checking issues
			const response = await GET(`/admin/client/${clientTypeStr}/${clientId}/test` as any);

			if (response.data?.data) {
				// Update store with success message
				clientsStore.update((state) => ({
					...state,
					loading: false,
					success: `Connection to ${client.name} successful`
				}));
				return response.data.data;
			} else {
				throw new Error(response.error?.message || 'Connection test failed');
			}
		} catch (err) {
			clientsStore.setError(err);
			return null;
		}
	},

	// Test a new client connection (without requiring a client ID)
	testNewClientConnection: async (
		clientType: TypesClientType | TypesMediaClientType,
		clientConfig: Partial<ClientConfigTypes>,
		name: string = 'Client'
	) => {
		clientsStore.setLoading(true);

		try {
			const clientTypeStr = clientType.toString().toLowerCase();

			// Construct client test request
			const testRequest = {
				clientType: clientType,
				name: name,
				client: clientConfig
			};

			// Cast the path to avoid TypeScript route checking issues
			const response = await POST(`/admin/client/${clientTypeStr}/test` as any, {
				body: testRequest
			});

			if (response.data?.data) {
				// Update store with success message
				clientsStore.update((state) => ({
					...state,
					loading: false,
					success: `Connection to ${name} successful`
				}));
				return response.data.data;
			} else {
				throw new Error(response.error?.message || 'Connection test failed');
			}
		} catch (err) {
			clientsStore.setError(err);
			return null;
		}
	},

	// Get a client by ID
	getClient: (clientId: string) => {
		const state = clientsStore.getState();
		return state.clientsById[clientId] || null;
	},

	// Get clients by type
	getClientsByType: (type: TypesClientType | TypesMediaClientType) => {
		const state = clientsStore.getState();
		return state.clientsByType[type.toString()] || [];
	},

	// Get enabled clients by type
	getEnabledClientsByType: (type: TypesClientType | TypesMediaClientType) => {
		const state = clientsStore.getState();
		const clients = state.clientsByType[type.toString()] || [];
		return clients.filter((client) => client.isEnabled);
	},

	// Clear success message
	clearSuccess: () => {
		clientsStore.update((state) => ({
			...state,
			success: null
		}));
	}
};

// Create derived stores for easier component access
export const allClients = derived(clientsStore, ($state) => $state.clients);
export const clientsLoading = derived(clientsStore, ($state) => $state.loading);
export const clientsError = derived(clientsStore, ($state) => $state.error);
export const clientsSuccess = derived(clientsStore, ($state) => $state.success);

// Create derived stores for each client type
export const mediaClients = derived(clientsStore, ($state) => {
	const mediaClientTypes = [
		TypesMediaClientType.MediaClientTypeEmby,
		TypesMediaClientType.MediaClientTypeJellyfin,
		TypesMediaClientType.MediaClientTypePlex,
		TypesMediaClientType.MediaClientTypeSubsonic
	];

	return mediaClientTypes.flatMap((type) => $state.clientsByType[type] || []);
});

export const automationClients = derived(clientsStore, ($state) => {
	const automationClientTypes = [
		TypesClientType.ClientTypeSonarr,
		TypesClientType.ClientTypeLidarr,
		TypesClientType.ClientTypeRadarr
	];

	return automationClientTypes.flatMap((type) => $state.clientsByType[type] || []);
});

export const aiClients = derived(clientsStore, ($state) => {
	const aiClientTypes = [
		TypesClientType.ClientTypeClaude,
		TypesClientType.ClientTypeOpenAI,
		TypesClientType.ClientTypeOllama
	];

	return aiClientTypes.flatMap((type) => $state.clientsByType[type] || []);
});

// Export clientsByType directly for easy access
export const clientsByTypeMap = derived(clientsStore, ($state) => $state.clientsByType);
