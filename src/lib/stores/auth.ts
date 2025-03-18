// src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { createBaseStore, type BaseApiState } from './base';
import { ApiError } from '$lib/api/errors';
import type { paths } from '$lib/api/suasor.v1';
import type { AuthData } from '$lib/api/types';

// Import the updated client methods
import {
	POST,
	createAuthenticatedClient,
	isAuthenticated as clientIsAuthenticated,
	getCurrentUser as clientGetCurrentUser
} from '$lib/api/client';

interface AuthState extends BaseApiState {
	isAuthenticated: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	user: any | null;
	expiresAt: number | null;
}

function createAuthStore() {
	// Initialize from localStorage
	const initialState: AuthState = {
		isAuthenticated: false,
		accessToken: null,
		refreshToken: null,
		user: null,
		expiresAt: null,
		loading: false,
		error: null
	};

	if (browser) {
		// Use existing localStorage values if available
		const accessToken = localStorage.getItem('suasor_access_token');
		const refreshToken = localStorage.getItem('suasor_refresh_token');
		const expiresAtStr = localStorage.getItem('suasor_expires_at');
		const userStr = localStorage.getItem('suasor_user');

		if (accessToken && refreshToken && expiresAtStr && userStr) {
			const expiresAt = parseInt(expiresAtStr, 10);
			if (expiresAt > Math.floor(Date.now() / 1000)) {
				try {
					const user = JSON.parse(userStr);
					Object.assign(initialState, {
						isAuthenticated: true,
						accessToken,
						refreshToken,
						expiresAt,
						user
					});
				} catch (e) {
					// Clear invalid data
					localStorage.removeItem('suasor_access_token');
					localStorage.removeItem('suasor_refresh_token');
					localStorage.removeItem('suasor_expires_at');
					localStorage.removeItem('suasor_user');
				}
			}
		}
	}

	const store = createBaseStore<AuthState>(initialState);

	return {
		...store,

		async login(email: string, password: string): Promise<boolean> {
			store.setLoading(true);
			try {
				// Using our updated client with skipAuth=true
				const response = await POST(
					'/auth/login',
					{
						body: { email, password }
					},
					true
				);

				if (response.error) {
					throw new ApiError(response.error, response.response?.status || 500);
				}

				const authData = response.data?.data as AuthData;
				if (authData && authData.accessToken && authData.refreshToken) {
					const newState: AuthState = {
						isAuthenticated: true,
						accessToken: authData.accessToken,
						refreshToken: authData.refreshToken,
						user: authData.user,
						expiresAt: authData.expiresAt || null,
						loading: false,
						error: null
					};

					store.update(() => newState);

					// Token storage is already handled by the client
					return true;
				}
				return false;
			} catch (err) {
				store.setError(err);
				return false;
			} finally {
				store.setLoading(false);
			}
		},

		async logout(): Promise<void> {
			const currentState = getCurrentState();
			store.setLoading(true);

			try {
				if (currentState.refreshToken) {
					// Using updated client to logout
					await POST('/auth/logout', {
						body: { refreshToken: currentState.refreshToken }
					});
				}
			} catch (e) {
				// Continue with local logout even if API fails
			} finally {
				// Reset state
				store.update(() => ({
					isAuthenticated: false,
					accessToken: null,
					refreshToken: null,
					user: null,
					expiresAt: null,
					loading: false,
					error: null
				}));

				// Remove tokens (already handled by client logout, but let's be thorough)
				if (browser) {
					localStorage.removeItem('suasor_access_token');
					localStorage.removeItem('suasor_refresh_token');
					localStorage.removeItem('suasor_expires_at');
					localStorage.removeItem('suasor_user');
				}

				store.setLoading(false);
			}
		},

		async refreshToken(): Promise<boolean> {
			const currentState = getCurrentState();
			if (!currentState.refreshToken) return false;

			store.setLoading(true);
			try {
				// Using updated client with skipAuth=true
				const response = await POST(
					'/auth/refresh',
					{
						body: { refreshToken: currentState.refreshToken }
					},
					true
				);

				if (response.error) {
					throw new ApiError(response.error, response.response?.status || 500);
				}

				const authData = response.data?.data as AuthData;
				if (authData && authData.accessToken && authData.refreshToken) {
					store.update((state) => ({
						...state,
						accessToken: authData.accessToken,
						refreshToken: authData.refreshToken,
						expiresAt: authData.expiresAt || null
					}));

					// Updated tokens are already stored by the client
					return true;
				}
				return false;
			} catch (err) {
				if (err instanceof ApiError && err.status === 401) {
					// Force logout on invalid refresh token
					this.logout();
				}
				store.setError(err);
				return false;
			} finally {
				store.setLoading(false);
			}
		},

		// Method to sync store state with client state (useful after page refresh)
		syncWithClient(): void {
			if (clientIsAuthenticated()) {
				const user = clientGetCurrentUser();
				const accessToken = localStorage.getItem('suasor_access_token');
				const refreshToken = localStorage.getItem('suasor_refresh_token');
				const expiresAtStr = localStorage.getItem('suasor_expires_at');

				if (user && accessToken && refreshToken && expiresAtStr) {
					store.update((state) => ({
						...state,
						isAuthenticated: true,
						accessToken,
						refreshToken,
						user,
						expiresAt: parseInt(expiresAtStr, 10)
					}));
				}
			} else {
				store.update((state) => ({
					...state,
					isAuthenticated: false,
					accessToken: null,
					refreshToken: null,
					user: null,
					expiresAt: null
				}));
			}
		}
	};

	// Helper to get current state
	function getCurrentState(): AuthState {
		let state: AuthState = initialState;
		const unsubscribe = store.subscribe((s) => {
			state = s;
		});
		unsubscribe();
		return state;
	}
}

// Create and initialize store
export const authStore = createAuthStore();

// Sync with client on initialization
if (browser) {
	authStore.syncWithClient();
}

// Derived stores (keep these as they are)
export const isAuthenticated = derived(authStore, ($store) => $store.isAuthenticated);
export const user = derived(authStore, ($store) => $store.user);
export const authLoading = derived(authStore, ($store) => $store.loading);
export const authError = derived(authStore, ($store) => $store.error);
