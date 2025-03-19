// src/lib/stores/auth.ts
import { derived } from 'svelte/store';
import { browser } from '$app/environment';
import { createBaseStore, type BaseApiState } from './base';
import { ApiError } from '$lib/api/errors';
import { GET } from '$lib/api/client';
import type { UserResponse } from '$lib/api/types';

// Import the updated client methods
import {
	isAuthenticated as clientIsAuthenticated,
	getCurrentUser as clientGetCurrentUser
} from '$lib/api/client';

interface AuthState extends BaseApiState {
	isAuthenticated: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	user: UserResponse | null;
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
				// Use the client's login function which handles localStorage
				const authData = await import('$lib/api/client').then((m) => m.login(email, password));

				if (authData && authData.accessToken && authData.refreshToken) {
					const newState: AuthState = {
						isAuthenticated: true,
						accessToken: authData.accessToken,
						refreshToken: authData.refreshToken,
						user: authData.user as UserResponse,
						expiresAt: authData.expiresAt || null,
						loading: false,
						error: null
					};

					store.update(() => newState);
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
			store.setLoading(true);

			try {
				// Use the client's logout function
				await import('$lib/api/client').then((m) => m.logout());

				// Reset the store state
				store.update(() => ({
					isAuthenticated: false,
					accessToken: null,
					refreshToken: null,
					user: null,
					expiresAt: null,
					loading: false,
					error: null
				}));
			} catch (e) {
				// Handle errors
				console.error('Logout error:', e);
			} finally {
				store.setLoading(false);
			}
		},

		async refreshToken(): Promise<boolean> {
			store.setLoading(true);
			try {
				// Use the client's refreshToken function
				const authData = await import('$lib/api/client').then((m) => m.refreshToken());

				if (authData && authData.accessToken && authData.refreshToken) {
					store.update((state) => ({
						...state,
						accessToken: authData.accessToken || null,
						refreshToken: authData.refreshToken || null,
						expiresAt: authData.expiresAt || null
					}));
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
			// First check localStorage directly
			if (browser) {
				const accessToken = localStorage.getItem('suasor_access_token');
				const refreshToken = localStorage.getItem('suasor_refresh_token');
				const expiresAtStr = localStorage.getItem('suasor_expires_at');
				const userStr = localStorage.getItem('suasor_user');

				if (accessToken && refreshToken && expiresAtStr && userStr) {
					const expiresAt = parseInt(expiresAtStr, 10);
					try {
						const user = JSON.parse(userStr);

						// Update store state with localStorage values
						store.update((state) => ({
							...state,
							isAuthenticated: true,
							accessToken,
							refreshToken,
							user,
							expiresAt
						}));

						// Validate token is still valid with the server
						this.validateSession();
						return;
					} catch (e) {
						console.error('Error parsing user data from localStorage', e);
					}
				}
			}

			// Fallback to client check
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
				// Reset state if not authenticated
				store.update((state) => ({
					...state,
					isAuthenticated: false,
					accessToken: null,
					refreshToken: null,
					user: null,
					expiresAt: null
				}));
			}
		},

		async validateSession(): Promise<boolean> {
			console.log('Validating session');
			try {
				// Call a protected endpoint to validate the token
				const response = await GET('/auth/validate');

				if (response.error) {
					await this.logout();
					return false;
				}
				if (response.data?.data) {
					console.log('user', response.data?.data);
					store.update((state) => ({
						...state,
						user: response.data.data
					}));
					console.log('Session validated');
					return true;
				}

				return false;
			} catch (err) {
				console.error('Session validation error:', err);
				await this.logout();
				return false;
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
