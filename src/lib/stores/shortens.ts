import { derived } from 'svelte/store';
import { createBaseStore, type BaseApiState } from './base';
import { POST } from '$lib/api/client'; // Removed unused GET_PORTIS
import { ApiError } from '$lib/api/errors';

import type {
	Shorten,
	ShortenData,
	ShortenResponse,
	CreateShortenRequest,
	ShortenErrorResponse
} from '$lib/api/types';

// Define types from API schema
interface ShortensState extends BaseApiState {
	shortens: Shorten[];
	currentShorten: Shorten | null | undefined;
}

// Helper function to safely merge shortens into state
function mergeShortenToState(
	state: ShortensState,
	shorten: Shorten | null | undefined,
	addToArray = false
): ShortensState {
	if (!shorten) {
		return {
			...state,
			currentShorten: shorten
		};
	}

	return {
		...state,
		shortens: addToArray ? [...state.shortens, shorten] : state.shortens,
		currentShorten: shorten
	};
}

// Create the shortens store
function createShortensStore() {
	const store = createBaseStore<ShortensState>({
		shortens: [],
		currentShorten: null,
		loading: false,
		error: null
	});

	return {
		...store,

		async fetchShorten(url: string): Promise<Shorten | null> {
			store.setLoading(true);
			try {
				const response = await POST('/shorten/lookup', {
					body: {
						originalUrl: url,
						createIfNotExists: false // Just look it up, don't create
					}
				});

				if (response.error) {
					const errorData = response.error as ShortenErrorResponse;
					const status = response.response?.status || 500;
					throw new ApiError(errorData, status);
				}

				const data = response.data as ShortenResponse;
				if (data?.data?.shorten) {
					store.update((state) => mergeShortenToState(state, data?.data?.shorten, false));
					return data.data.shorten;
				}
				return null;
			} catch (err) {
				store.setError(err);
				throw err;
			} finally {
				store.setLoading(false);
			}
		},

		async createShorten(shortenData: CreateShortenRequest): Promise<Shorten | null> {
			store.setLoading(true);
			try {
				const response = await POST('/shorten', {
					body: shortenData
				});

				if (response.error) {
					const errorData = response.error as ShortenErrorResponse;
					const status = response.response?.status || 500;
					throw new ApiError(errorData, status);
				}

				const data = response.data as ShortenResponse;
				if (data?.data?.shorten) {
					store.update((state) => mergeShortenToState(state, data?.data?.shorten, true));
					return data.data.shorten;
				}
				return null;
			} catch (err) {
				store.setError(err);
				throw err;
			} finally {
				store.setLoading(false);
			}
		},

		async fetchOrCreate(
			url: string,
			customCode?: string,
			expiresAfter?: number
		): Promise<ShortenData | null> {
			store.setLoading(true);
			try {
				const response = await POST('/shorten/lookup', {
					body: {
						originalUrl: url,
						createIfNotExists: true,
						customCode,
						expiresAfter
					}
				});

				if (response.error) {
					const errorData = response.error as ShortenErrorResponse;
					const status = response.response?.status || 500;
					throw new ApiError(errorData, status);
				}

				const data = response.data as ShortenResponse;
				if (data?.data?.shorten) {
					// If it's a new entry, add to the shortens array
					const isNewEntry = response.response?.status === 201;
					store.update((state) => mergeShortenToState(state, data?.data?.shorten, isNewEntry));
					return data.data;
				}
				return null;
			} catch (err) {
				store.setError(err);
				throw err;
			} finally {
				store.setLoading(false);
			}
		}
	};
}

// Create store instance
export const shortensStore = createShortensStore();

// Derived stores
export const shortens = derived(shortensStore, ($store) => $store.shortens);
export const currentShorten = derived(shortensStore, ($store) => $store.currentShorten);
export const shortensLoading = derived(shortensStore, ($store) => $store.loading);
export const shortensError = derived(shortensStore, ($store) => $store.error);
