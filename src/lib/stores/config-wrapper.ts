// Helper functions to create reactive wrappers around config objects
import { derived, writable } from 'svelte/store';
import type { UserConfig } from '$lib/api/types';
import configApi from './config';

// Creates a reactive config wrapper that can be used with bind:
export function createReactiveUserConfig(initialConfig: Partial<UserConfig> = {}) {
  const store = writable(initialConfig);
  
  // Update the store whenever the config changes
  const unsubscribe = configApi.subscribe(({ userConfig }) => {
    if (userConfig) {
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
      store.update(config => ({ ...config, [key]: value }));
      
      // Save the change to the API
      configApi.saveUserConfig({ [key]: value });
      
      return value;
    },
    // Save all changes at once
    saveAll: (config: Partial<UserConfig>) => {
      store.update(current => ({ ...current, ...config }));
      
      // Save to the API
      configApi.saveUserConfig(config);
    },
    destroy
  };
}

// Create a store that can be used throughout the app
export const reactiveUserConfig = createReactiveUserConfig();

// Helper function to update a property and trigger a save
export function updateUserSetting(key: string, value: any) {
  return reactiveUserConfig.updateProperty(key, value);
}

// Helper function to save all settings at once
export function saveUserSettings(settings: Partial<UserConfig>) {
  return reactiveUserConfig.saveAll(settings);
}