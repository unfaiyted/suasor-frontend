import { derived } from 'svelte/store';
import { browser } from '$app/environment';
import { GET, PUT } from '$lib/api/client';
import type { BaseApiState } from './base';
import { createBaseStore, createCache } from './base';
import type { Configuration, UserConfig } from '$lib/api/types';

// Define config store state
export interface ConfigState extends BaseApiState {
	// User-specific configuration
	userConfig: UserConfig | null;

	// System-wide configuration (admin-only)
	systemConfig: Configuration | null;

	// Local app preferences (stored in localStorage)
	appPreferences: AppPreferences;

	// Success message for feedback
	success: string | null;
}

// App preferences interface (localStorage)
export interface AppPreferences {
	theme: 'light' | 'dark' | 'system';
	sidebarCollapsed: boolean;
	activeTab: string;
	language: string;
	lastVisitedPage: string;
}

// Default app preferences
const defaultAppPreferences: AppPreferences = {
	theme: 'system',
	sidebarCollapsed: false,
	activeTab: 'user',
	language: 'en',
	lastVisitedPage: '/'
};

// Load preferences from localStorage
function loadAppPreferences(): AppPreferences {
	if (!browser) return defaultAppPreferences;

	try {
		const storedPreferences = localStorage.getItem('suasor_app_preferences');
		if (!storedPreferences) return defaultAppPreferences;

		return { ...defaultAppPreferences, ...JSON.parse(storedPreferences) };
	} catch (err) {
		console.error('Error loading app preferences:', err);
		return defaultAppPreferences;
	}
}

// Save preferences to localStorage
function saveAppPreferences(preferences: AppPreferences): void {
	if (!browser) return;

	try {
		localStorage.setItem('suasor_app_preferences', JSON.stringify(preferences));
	} catch (err) {
		console.error('Error saving app preferences:', err);
	}
}

// Initial state
const initialConfigState: ConfigState = {
	loading: false,
	error: null,
	userConfig: null,
	systemConfig: null,
	appPreferences: loadAppPreferences(),
	success: null
};

// Create the config store
const configStore = createBaseStore<ConfigState>(initialConfigState);

// Create a cache for config data
const configCache = createCache<any>();

// Enhanced store with config-specific operations
export const configApi = {
	...configStore,

	// Load user configuration
	async loadUserConfig() {
		// First check cache
		const cachedConfig = configCache.get('config:user');
		if (cachedConfig) {
			configStore.update((state) => ({
				...state,
				userConfig: cachedConfig
			}));
			return cachedConfig;
		}

		configStore.setLoading(true);

		try {
			const response = await GET('/config/user');

			if (response.data?.data) {
				const userConfig = response.data.data;

				configStore.update((state) => ({
					...state,
					userConfig,
					loading: false
				}));

				// Cache the results
				configCache.set('config:user', userConfig);

				return userConfig;
			} else {
				throw new Error('Failed to load user configuration');
			}
		} catch (err) {
			configStore.setError(err);
			return null;
		}
	},

	// Save user configuration
	async saveUserConfig(config: Partial<UserConfig>) {
		configStore.setLoading(true);

		try {
			// Merge with existing config to ensure we send a complete object
			const state = configStore.getState();
			const currentConfig = state.userConfig || {};
			const updatedConfig = { ...currentConfig, ...config };

			const response = await PUT('/config/user', {
				body: updatedConfig
			});

			if (response.data?.data) {
				configStore.update((state) => ({
					...state,
					userConfig: response.data?.data,
					loading: false,
					success: 'User settings saved successfully'
				}));

				// Invalidate cache
				configCache.invalidate('config:user');

				// Auto-clear success message after 3 seconds
				setTimeout(() => {
					configStore.update((state) => ({
						...state,
						success: null
					}));
				}, 3000);

				return response.data.data;
			} else {
				throw new Error(response.error?.message || 'Failed to save user configuration');
			}
		} catch (err) {
			configStore.setError(err);
			return null;
		}
	},

	// Load system configuration (admin only)
	async loadSystemConfig() {
		// First check cache
		const cachedConfig = configCache.get('config:system');
		if (cachedConfig) {
			configStore.update((state) => ({
				...state,
				systemConfig: cachedConfig
			}));
			return cachedConfig;
		}

		configStore.setLoading(true);

		try {
			const response = await GET('/admin/config');

			if (response.data?.data) {
				const systemConfig = response.data.data;

				configStore.update((state) => ({
					...state,
					systemConfig,
					loading: false
				}));

				// Cache the results
				configCache.set('config:system', systemConfig);

				return systemConfig;
			} else {
				throw new Error('Failed to load system configuration');
			}
		} catch (err) {
			configStore.setError(err);
			return null;
		}
	},

	// Save system configuration (admin only)
	async saveSystemConfig(config: Partial<Configuration>) {
		configStore.setLoading(true);

		try {
			// Merge with existing config to ensure we send a complete object
			const state = configStore.getState();
			const currentConfig = state.systemConfig || {};
			const updatedConfig = { ...currentConfig, ...config };

			const response = await PUT('/admin/config', {
				body: updatedConfig
			});

			if (response.data?.data) {
				configStore.update((state) => ({
					...state,
					systemConfig: response.data?.data,
					loading: false,
					success: 'System settings saved successfully'
				}));

				// Invalidate cache
				configCache.invalidate('config:system');

				// Auto-clear success message after 3 seconds
				setTimeout(() => {
					configStore.update((state) => ({
						...state,
						success: null
					}));
				}, 3000);

				return response.data.data;
			} else {
				throw new Error(response.error?.message || 'Failed to save system configuration');
			}
		} catch (err) {
			configStore.setError(err);
			return null;
		}
	},

	// Update app preferences (localStorage)
	updateAppPreferences(preferences: Partial<AppPreferences>) {
		configStore.update((state) => {
			const updatedPreferences = { ...state.appPreferences, ...preferences };

			// Save to localStorage
			saveAppPreferences(updatedPreferences);

			return {
				...state,
				appPreferences: updatedPreferences
			};
		});
	},

	// Set active tab (for settings pages)
	setActiveTab(tab: string) {
		this.updateAppPreferences({ activeTab: tab });
	},

	// Toggle sidebar collapsed state
	toggleSidebar() {
		configStore.update((state) => {
			const updatedPreferences = {
				...state.appPreferences,
				sidebarCollapsed: !state.appPreferences.sidebarCollapsed
			};

			// Save to localStorage
			saveAppPreferences(updatedPreferences);

			return {
				...state,
				appPreferences: updatedPreferences
			};
		});
	},

	// Set theme preference
	setTheme(theme: 'light' | 'dark' | 'system') {
		this.updateAppPreferences({ theme });

		// Apply theme to document
		if (
			theme === 'dark' ||
			(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	},

	// Track last visited page
	setLastVisitedPage(path: string) {
		this.updateAppPreferences({ lastVisitedPage: path });
	}
};

// Create derived stores for easier component access
export const userConfig = derived(configStore, ($state) => $state.userConfig);
export const systemConfig = derived(configStore, ($state) => $state.systemConfig);
export const appPreferences = derived(configStore, ($state) => $state.appPreferences);
export const activeTab = derived(configStore, ($state) => $state.appPreferences.activeTab);
export const theme = derived(configStore, ($state) => $state.appPreferences.theme);
export const sidebarCollapsed = derived(
	configStore,
	($state) => $state.appPreferences.sidebarCollapsed
);
export const configLoading = derived(configStore, ($state) => $state.loading);
export const configError = derived(configStore, ($state) => $state.error);
export const configSuccess = derived(configStore, ($state) => $state.success);

// Initialize theme based on preference
if (browser) {
	const currentState = configStore.getState();
	configApi.setTheme(currentState.appPreferences.theme);

	// Listen for system theme changes if set to 'system'
	if (currentState.appPreferences.theme === 'system') {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
			if (event.matches) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		});
	}
}

export default configApi;
