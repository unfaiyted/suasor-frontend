import { writable } from 'svelte/store';
import createClient from 'openapi-fetch';
import type { paths } from '$lib/api/portus.v1';
import type { ShortenErrorResponse as ErrorResponse } from '$lib/api/types';

// Base API configuration
export const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080') + '/api/v1';
export const client = createClient<paths>({ baseUrl });

// Helper for error handling
export function handleApiError(err: unknown): ErrorResponse {
	return {
		message: err instanceof Error ? err.message : 'Unknown error',
		type: err instanceof Error ? 'INTERNAL_ERROR' : 'INTERNAL_ERROR'
	};
}

// Base state interface
export interface BaseApiState {
	loading: boolean;
	error: ErrorResponse | null;
}

// Create a base store with common functionality
export function createBaseStore<T extends BaseApiState>(initialState: T) {
	const store = writable<T>(initialState);

	return {
		subscribe: store.subscribe,
		update: store.update,
		setLoading: (loading: boolean) => {
			store.update((state) => ({ ...state, loading, error: null }));
		},
		setError: (err: unknown) => {
			const error = handleApiError(err);
			store.update((state) => ({ ...state, error, loading: false }));
		},
		clearError: () => {
			store.update((state) => ({ ...state, error: null }));
		}
	};
}
