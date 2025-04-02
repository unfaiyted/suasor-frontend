import { writable } from 'svelte/store';
import { API_BASE_URL } from '$lib/api/client';
import type { ErrorResponse } from '$lib/api/types';

// Base state interface
export interface BaseApiState {
	loading: boolean;
	error: ErrorResponse | null;
}

// Helper for error handling
export function handleApiError(err: unknown): ErrorResponse {
	return {
		message: err instanceof Error ? err.message : 'Unknown error',
		type: err instanceof Error ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
		details: err instanceof Error ? err.stack : undefined
	};
}

// Create a base store with common functionality
export function createBaseStore<T extends BaseApiState>(initialState: T) {
	const store = writable<T>(initialState);

	return {
		subscribe: store.subscribe,
		update: store.update,
		set: store.set,
		setLoading: (loading: boolean) => {
			store.update((state) => ({ ...state, loading, ...(loading ? { error: null } : {}) }));
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