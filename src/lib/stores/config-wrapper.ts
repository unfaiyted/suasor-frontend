// Helper functions to create reactive wrappers around config objects
import { derived, writable } from 'svelte/store';
import type { UserConfig } from '$lib/api/types';
import configApi from './config';

// Creates a reactive config wrapper that can be used with bind:
export function createReactiveUserConfig(initialConfig: Partial<UserConfig> = {}) {
  const store = writable(initialConfig);
  
  // Flag to prevent circular updates
  let isUpdatingFromApi = false;
  
  // Update the store whenever the config changes, preventing circular updates
  const unsubscribe = configApi.subscribe(({ userConfig }) => {
    if (userConfig && !isUpdatingFromApi) {
      store.set(userConfig as UserConfig);
    }
  });
  
  // Cleanup on destroy
  const destroy = () => unsubscribe();
  
  // Return the store
  return {
    subscribe: store.subscribe,
    // Safely update a single property
    updateProperty: (key: string, value: any) => {
      // Set flag to prevent circular updates
      isUpdatingFromApi = true;
      
      store.update(config => ({ ...config, [key]: value }));
      
      // Save the change to the API
      configApi.saveUserConfig({ [key]: value })
        .finally(() => {
          // Reset flag when API call completes
          isUpdatingFromApi = false;
        });
      
      return value;
    },
    // Save all changes at once
    saveAll: (config: Partial<UserConfig>) => {
      // Set flag to prevent circular updates
      isUpdatingFromApi = true;
      
      store.update(current => ({ ...current, ...config }));
      
      // Save to the API
      configApi.saveUserConfig(config)
        .finally(() => {
          // Reset flag when API call completes
          isUpdatingFromApi = false;
        });
    },
    destroy
  };
}

// Create a store that can be used throughout the app - with proper cleanup on navigation
// We need to use a writable store to track instances and avoid memory leaks
import { browser } from '$app/environment';
import { onDestroy } from 'svelte';

// Create a store that can be used throughout the app
export const reactiveUserConfig = createReactiveUserConfig();

// Add cleanup on page navigation
if (browser) {
  try {
    // This will execute in the browser context but not during SSR
    onDestroy(() => {
      reactiveUserConfig.destroy();
    });
  } catch (err) {
    // Ignore - might be called outside component initialization
  }
}

// Helper function to update a property and trigger a save
export function updateUserSetting(key: string, value: any) {
  return reactiveUserConfig.updateProperty(key, value);
}

// Helper function to save all settings at once
export function saveUserSettings(settings: Partial<UserConfig>) {
  return reactiveUserConfig.saveAll(settings);
}