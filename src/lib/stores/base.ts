import { writable, get } from 'svelte/store';
import { API_BASE_URL } from '$lib/api/client';
import type { ErrorResponse } from '$lib/api/types';
import { ErrorsErrorType } from '$lib/api/suasor.v1.d';

// Base state interface
export interface BaseApiState {
	loading: boolean;
	error: ErrorResponse | null;
}

// Helper for error handling
export function handleApiError(err: unknown): ErrorResponse {
	return {
		message: err instanceof Error ? err.message : 'Unknown error',
		type:
			err instanceof Error
				? ErrorsErrorType.ErrorTypeBadRequest
				: ErrorsErrorType.ErrorTypeInternal,
		details: err instanceof Error ? { stackInfo: err.stack } : undefined
	};
}

// Create a base store with common functionality
export function createBaseStore<T extends BaseApiState>(initialState: T) {
	const store = writable<T>(initialState);

	return {
		subscribe: store.subscribe,
		update: store.update,
		set: store.set,

		// Get current state (useful for operations that need current state)
		getState: (): T => {
			return get(store);
		},

		// Set loading state and clear error
		setLoading: (loading: boolean) => {
			store.update((state) => ({ ...state, loading, ...(loading ? { error: null } : {}) }));
		},

		// Set error state and reset loading
		setError: (err: unknown) => {
			const error = handleApiError(err);
			store.update((state) => ({ ...state, error, loading: false }));
		},

		// Clear error state
		clearError: () => {
			store.update((state) => ({ ...state, error: null }));
		},

		// Set a success message with auto-dismiss (if passed)
		setSuccess: (message: string, autoDismissMs?: number) => {
			store.update((state) => ({
				...state,
				loading: false,
				success: message
			}));

			if (autoDismissMs) {
				setTimeout(() => {
					store.update((state) => ({ ...state, success: null }));
				}, autoDismissMs);
			}
		},

		// Reset store to initial state
		reset: () => {
			store.set(initialState);
		}
	};
}

// Function to create pagination helpers
export function createPaginationHelpers<
	T extends BaseApiState & { page: number; totalPages: number }
>(store: any) {
	return {
		// Go to next page if available
		nextPage: () => {
			const state = get(store);
			if (state.page < state.totalPages) {
				store.update((state) => ({ ...state, page: state.page + 1 }));
				return true;
			}
			return false;
		},

		// Go to previous page if available
		prevPage: () => {
			const state = get(store);
			if (state.page > 1) {
				store.update((state) => ({ ...state, page: state.page - 1 }));
				return true;
			}
			return false;
		},

		// Go to specific page
		goToPage: (page: number) => {
			const state = get(store);
			if (page >= 1 && page <= state.totalPages) {
				store.update((state) => ({ ...state, page }));
				return true;
			}
			return false;
		}
	};
}

// Cache management helpers
export interface CacheOptions {
	enabled: boolean;
	ttl: number; // Time to live in milliseconds
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
	enabled: true,
	ttl: 5 * 60 * 1000 // 5 minutes
};

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

export function createCache<T>() {
	const cache = new Map<string, CacheEntry<T>>();

	return {
		// Get an item from cache
		get: (key: string, options: CacheOptions = DEFAULT_CACHE_OPTIONS): T | null => {
			if (!options.enabled) return null;

			const entry = cache.get(key);
			if (!entry) return null;

			const age = Date.now() - entry.timestamp;
			if (age > options.ttl) {
				cache.delete(key);
				return null;
			}

			return entry.data;
		},

		// Set an item in cache
		set: (key: string, data: T, options: CacheOptions = DEFAULT_CACHE_OPTIONS): void => {
			if (!options.enabled) return;

			cache.set(key, {
				data,
				timestamp: Date.now()
			});
		},

		// Clear a specific key
		invalidate: (key: string): void => {
			cache.delete(key);
		},

		// Clear all keys that match a pattern
		invalidatePattern: (pattern: RegExp): void => {
			for (const key of cache.keys()) {
				if (pattern.test(key)) {
					cache.delete(key);
				}
			}
		},

		// Clear entire cache
		clear: (): void => {
			cache.clear();
		}
	};
}
