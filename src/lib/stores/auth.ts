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
				// console.error('Logout error:', e);
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
						isAuthenticated: true, // Ensure we set this to true on successful refresh
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

				console.log('Syncing with client, localStorage state:', {
					hasAccessToken: !!accessToken,
					hasRefreshToken: !!refreshToken,
					hasExpiresAt: !!expiresAtStr,
					hasUserData: !!userStr
				});

				if (accessToken && refreshToken && expiresAtStr && userStr) {
					const expiresAt = parseInt(expiresAtStr, 10);
					const now = Math.floor(Date.now() / 1000);

					// Check if token is expired
					const isExpired = expiresAt <= now;
					console.log('Token expiration check:', { expiresAt, now, isExpired });

					if (!isExpired) {
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

							// console.log('Updated auth state from localStorage: authenticated=true');
							return;
						} catch (e) {
							// console.error('Error parsing user data from localStorage', e);
						}
					} else {
						console.log('Token is expired, attempting refresh');
						// Try to refresh the token but don't wait for it
						this.refreshToken().catch((e) => {
							console.error('Auto token refresh failed:', e);
						});
					}
				}
			}

			// Fallback to client check
			if (clientIsAuthenticated()) {
				console.log('Client reports authenticated=true');
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
					console.log('Updated auth state from client check: authenticated=true');
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
				console.log('Updated auth state: authenticated=false');
			}
		},

		async validateSession(): Promise<boolean> {
			// console.log('Validating session');
			try {
				// Call a protected endpoint to validate the token
				const response = await GET('/auth/validate');

				if (response.error) {
					// console.log('Session validation failed due to API error');
					await this.logout();
					return false;
				}
				if (response.data?.data) {
					// console.log('Validation successful, user data received:', response.data?.data);

					// Ensure we update the isAuthenticated flag along with user data
					store.update((state) => ({
						...state,
						isAuthenticated: true,
						user: response.data.data
					}));

					// console.log('Session validated and isAuthenticated set to true');

					// Load client data after successful authentication
					try {
						// Use dynamic import to avoid circular dependencies
						const { clientsApi } = await import('./api');
						await clientsApi.loadClients();
						console.log('Successfully loaded client data');
					} catch (err) {
						console.error('Failed to load client data:', err);
						// Don't fail the session validation if client loading fails
					}

					return true;
				}

				console.log('Session validation failed: no user data');
				await this.logout();
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

	// Also check and automatically set auth state when the window loads
	// This ensures auth state is properly restored from localStorage even after a page refresh
	if (typeof window !== 'undefined') {
		window.addEventListener('load', () => {
			console.log('Window loaded, checking authentication state');
			authStore.syncWithClient();

			// If we have tokens but state isn't set, validate the session with the server
			const hasToken = localStorage.getItem('suasor_access_token') !== null;
			const hasRefreshToken = localStorage.getItem('suasor_refresh_token') !== null;

			if (hasToken && hasRefreshToken) {
				authStore.validateSession();
			}
		});
	}
}

// Derived stores (keep these as they are)
export const isAuthenticated = derived(authStore, ($store) => $store.isAuthenticated);
export const authUser = derived(authStore, ($store) => $store.user);
export const authLoading = derived(authStore, ($store) => $store.loading);
export const authError = derived(authStore, ($store) => $store.error);
