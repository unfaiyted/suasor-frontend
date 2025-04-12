import { derived } from 'svelte/store';
import { GET, POST, PUT, DELETE } from '$lib/api/client';
import type { BaseApiState } from './base';
import { createBaseStore, createCache } from './base';
import type { MediaItemPlaylist, MediaItem } from './mediaItem';
import { mediaItemApi } from './mediaItem';
import { TypesMediaType } from '$lib/api/suasor.v1';

// Define playlist item with order information
export interface PlaylistItem {
  id: string;
  playlistId: string;
  mediaItemId: string;
  order: number;
  mediaItem?: MediaItem; // The actual media item details
  addedAt?: string;
}

// Define playlist store state
export interface PlaylistState extends BaseApiState {
  // Playlists by ID
  playlists: Record<string, MediaItemPlaylist>;
  
  // Playlist items by playlist ID (preserves order)
  playlistItems: Record<string, PlaylistItem[]>;
  
  // Selected playlist
  selectedPlaylistId: string | null;
  
  // Editing state for drag-and-drop reordering
  isReordering: boolean;
}

// Initial state
const initialPlaylistState: PlaylistState = {
  loading: false,
  error: null,
  playlists: {},
  playlistItems: {},
  selectedPlaylistId: null,
  isReordering: false
};

// Create the playlist store
const playlistStore = createBaseStore<PlaylistState>(initialPlaylistState);

// Create a cache for playlist data
const playlistCache = createCache<any>();

// Enhanced store with playlist-specific operations
export const playlistApi = {
  ...playlistStore,
  
  // Get all playlists for the current user
  async getUserPlaylists() {
    const cacheKey = 'playlists:user';
    const cachedData = playlistCache.get(cacheKey);
    
    if (cachedData) {
      playlistStore.update((state) => ({
        ...state,
        playlists: {
          ...state.playlists,
          ...cachedData.playlistsById
        }
      }));
      return cachedData.playlists;
    }
    
    playlistStore.setLoading(true);
    
    try {
      const response = await GET('/playlists' as any);
      
      if (!response.data?.data) {
        throw new Error('Failed to load playlists');
      }
      
      const playlists = response.data.data;
      const playlistsById: Record<string, MediaItemPlaylist> = {};
      
      playlists.forEach((playlist: MediaItemPlaylist) => {
        playlistsById[playlist.id] = playlist;
      });
      
      // Update the store
      playlistStore.update((state) => ({
        ...state,
        playlists: {
          ...state.playlists,
          ...playlistsById
        },
        loading: false
      }));
      
      // Cache the results
      playlistCache.set(cacheKey, { playlists, playlistsById });
      
      return playlists;
    } catch (err) {
      playlistStore.setError(err);
      return [];
    }
  },
  
  // Get a single playlist
  async getPlaylist(id: string) {
    const state = playlistStore.getState();
    
    // If we already have this playlist in the store with full details, return it
    const existingPlaylist = state.playlists[id];
    if (existingPlaylist) {
      return existingPlaylist;
    }
    
    const cacheKey = `playlist:${id}`;
    const cachedData = playlistCache.get(cacheKey);
    if (cachedData) {
      // Update the store with the cached playlist
      playlistStore.update((state) => ({
        ...state,
        playlists: {
          ...state.playlists,
          [id]: cachedData
        }
      }));
      return cachedData;
    }
    
    playlistStore.setLoading(true);
    
    try {
      // We can use the mediaItemApi to get the playlist details
      // since playlists are media items
      const playlist = await mediaItemApi.getItemDetails(id, TypesMediaType.MediaTypePlaylist);
      
      if (!playlist) {
        throw new Error(`Failed to load playlist ${id}`);
      }
      
      // Update the store
      playlistStore.update((state) => ({
        ...state,
        playlists: {
          ...state.playlists,
          [id]: playlist
        },
        loading: false
      }));
      
      // Cache the results
      playlistCache.set(cacheKey, playlist);
      
      return playlist;
    } catch (err) {
      playlistStore.setError(err);
      return null;
    }
  },
  
  // Create a new playlist
  async createPlaylist(name: string, description?: string) {
    playlistStore.setLoading(true);
    
    try {
      const response = await POST('/playlists' as any, {
        body: {
          name,
          description
        }
      });
      
      if (!response.data?.data) {
        throw new Error('Failed to create playlist');
      }
      
      const newPlaylist = response.data.data;
      
      // Update the store
      playlistStore.update((state) => ({
        ...state,
        playlists: {
          ...state.playlists,
          [newPlaylist.id]: newPlaylist
        },
        loading: false
      }));
      
      // Invalidate the user playlists cache
      playlistCache.invalidate('playlists:user');
      
      return newPlaylist;
    } catch (err) {
      playlistStore.setError(err);
      return null;
    }
  },
  
  // Update playlist details
  async updatePlaylist(id: string, updates: { name?: string; description?: string }) {
    playlistStore.setLoading(true);
    
    try {
      const response = await PUT(`/playlists/${id}` as any, {
        body: updates
      });
      
      if (!response.data?.data) {
        throw new Error(`Failed to update playlist ${id}`);
      }
      
      const updatedPlaylist = response.data.data;
      
      // Update the store
      playlistStore.update((state) => ({
        ...state,
        playlists: {
          ...state.playlists,
          [id]: updatedPlaylist
        },
        loading: false
      }));
      
      // Invalidate the caches
      playlistCache.invalidate(`playlist:${id}`);
      playlistCache.invalidate('playlists:user');
      
      return updatedPlaylist;
    } catch (err) {
      playlistStore.setError(err);
      return null;
    }
  },
  
  // Delete a playlist
  async deletePlaylist(id: string) {
    playlistStore.setLoading(true);
    
    try {
      await DELETE(`/playlists/${id}` as any);
      
      // Update the store by removing the playlist
      playlistStore.update((state) => {
        const updatedPlaylists = { ...state.playlists };
        delete updatedPlaylists[id];
        
        const updatedPlaylistItems = { ...state.playlistItems };
        delete updatedPlaylistItems[id];
        
        return {
          ...state,
          playlists: updatedPlaylists,
          playlistItems: updatedPlaylistItems,
          // If the deleted playlist was the selected one, clear the selection
          selectedPlaylistId: state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
          loading: false
        };
      });
      
      // Invalidate the caches
      playlistCache.invalidate(`playlist:${id}`);
      playlistCache.invalidate('playlists:user');
      playlistCache.invalidate(`playlistItems:${id}`);
      
      return true;
    } catch (err) {
      playlistStore.setError(err);
      return false;
    }
  },
  
  // Get all items in a playlist with order preserved
  async getPlaylistItems(playlistId: string) {
    const state = playlistStore.getState();
    
    // If we already have items for this playlist, return them
    if (state.playlistItems[playlistId]?.length > 0) {
      return state.playlistItems[playlistId];
    }
    
    const cacheKey = `playlistItems:${playlistId}`;
    const cachedData = playlistCache.get(cacheKey);
    if (cachedData) {
      // Update the store with the cached items
      playlistStore.update((state) => ({
        ...state,
        playlistItems: {
          ...state.playlistItems,
          [playlistId]: cachedData.items
        }
      }));
      return cachedData.items;
    }
    
    playlistStore.setLoading(true);
    
    try {
      const response = await GET(`/playlists/${playlistId}/items` as any);
      
      if (!response.data?.data) {
        throw new Error(`Failed to load items for playlist ${playlistId}`);
      }
      
      const items = response.data.data;
      
      // Sort items by order
      const sortedItems = [...items].sort((a, b) => a.order - b.order);
      
      // Update the store
      playlistStore.update((state) => ({
        ...state,
        playlistItems: {
          ...state.playlistItems,
          [playlistId]: sortedItems
        },
        loading: false
      }));
      
      // Cache the results
      playlistCache.set(cacheKey, { items: sortedItems });
      
      return sortedItems;
    } catch (err) {
      playlistStore.setError(err);
      return [];
    }
  },
  
  // Add an item to a playlist
  async addItemToPlaylist(playlistId: string, mediaItemId: string, order?: number) {
    playlistStore.setLoading(true);
    
    try {
      // If order is not specified, add to the end of the playlist
      let actualOrder = order;
      
      if (actualOrder === undefined) {
        const currentItems = await this.getPlaylistItems(playlistId);
        actualOrder = currentItems.length > 0 
          ? Math.max(...currentItems.map(item => item.order)) + 1 
          : 0;
      }
      
      const response = await POST(`/playlists/${playlistId}/items` as any, {
        body: {
          mediaItemId,
          order: actualOrder
        }
      });
      
      if (!response.data?.data) {
        throw new Error(`Failed to add item to playlist ${playlistId}`);
      }
      
      const newItem = response.data.data;
      
      // Update the store
      playlistStore.update((state) => {
        const currentItems = state.playlistItems[playlistId] || [];
        
        return {
          ...state,
          playlistItems: {
            ...state.playlistItems,
            [playlistId]: [...currentItems, newItem].sort((a, b) => a.order - b.order)
          },
          loading: false
        };
      });
      
      // Invalidate the cache
      playlistCache.invalidate(`playlistItems:${playlistId}`);
      
      return newItem;
    } catch (err) {
      playlistStore.setError(err);
      return null;
    }
  },
  
  // Add multiple items to a playlist
  async addItemsToPlaylist(playlistId: string, mediaItemIds: string[]) {
    playlistStore.setLoading(true);
    
    try {
      // Get current items to determine starting order
      const currentItems = await this.getPlaylistItems(playlistId);
      const startOrder = currentItems.length > 0 
        ? Math.max(...currentItems.map(item => item.order)) + 1 
        : 0;
      
      const items = mediaItemIds.map((id, index) => ({
        mediaItemId: id,
        order: startOrder + index
      }));
      
      const response = await POST(`/playlists/${playlistId}/items/batch` as any, {
        body: {
          items
        }
      });
      
      if (!response.data?.data) {
        throw new Error(`Failed to add items to playlist ${playlistId}`);
      }
      
      const newItems = response.data.data;
      
      // Update the store
      playlistStore.update((state) => {
        const currentItems = state.playlistItems[playlistId] || [];
        
        return {
          ...state,
          playlistItems: {
            ...state.playlistItems,
            [playlistId]: [...currentItems, ...newItems].sort((a, b) => a.order - b.order)
          },
          loading: false
        };
      });
      
      // Invalidate the cache
      playlistCache.invalidate(`playlistItems:${playlistId}`);
      
      return newItems;
    } catch (err) {
      playlistStore.setError(err);
      return [];
    }
  },
  
  // Remove an item from a playlist
  async removeItemFromPlaylist(playlistId: string, playlistItemId: string) {
    playlistStore.setLoading(true);
    
    try {
      await DELETE(`/playlists/${playlistId}/items/${playlistItemId}` as any);
      
      // Update the store by removing the item
      playlistStore.update((state) => {
        const currentItems = state.playlistItems[playlistId] || [];
        
        return {
          ...state,
          playlistItems: {
            ...state.playlistItems,
            [playlistId]: currentItems.filter(item => item.id !== playlistItemId)
          },
          loading: false
        };
      });
      
      // Invalidate the cache
      playlistCache.invalidate(`playlistItems:${playlistId}`);
      
      return true;
    } catch (err) {
      playlistStore.setError(err);
      return false;
    }
  },
  
  // Reorder playlist items
  async reorderPlaylistItems(playlistId: string, itemOrders: { id: string; order: number }[]) {
    playlistStore.setLoading(true);
    
    try {
      const response = await PUT(`/playlists/${playlistId}/items/reorder` as any, {
        body: {
          items: itemOrders
        }
      });
      
      if (!response.data?.data) {
        throw new Error(`Failed to reorder items in playlist ${playlistId}`);
      }
      
      const updatedItems = response.data.data;
      
      // Sort items by order
      const sortedItems = [...updatedItems].sort((a, b) => a.order - b.order);
      
      // Update the store
      playlistStore.update((state) => ({
        ...state,
        playlistItems: {
          ...state.playlistItems,
          [playlistId]: sortedItems
        },
        loading: false,
        isReordering: false
      }));
      
      // Invalidate the cache
      playlistCache.invalidate(`playlistItems:${playlistId}`);
      
      return sortedItems;
    } catch (err) {
      playlistStore.setError(err);
      return [];
    }
  },
  
  // Reorder a single item (move to specific position)
  async movePlaylistItem(playlistId: string, itemId: string, newOrder: number) {
    const state = playlistStore.getState();
    const currentItems = state.playlistItems[playlistId] || [];
    
    if (currentItems.length === 0) {
      return false;
    }
    
    // Find the item to move
    const itemToMove = currentItems.find(item => item.id === itemId);
    if (!itemToMove) {
      return false;
    }
    
    // Calculate new orders for all affected items
    const itemOrders = currentItems.map(item => {
      if (item.id === itemId) {
        return { id: item.id, order: newOrder };
      }
      
      // If the item is between the old and new positions, adjust its order
      if (itemToMove.order < newOrder) {
        // Moving down
        if (item.order > itemToMove.order && item.order <= newOrder) {
          return { id: item.id, order: item.order - 1 };
        }
      } else if (itemToMove.order > newOrder) {
        // Moving up
        if (item.order >= newOrder && item.order < itemToMove.order) {
          return { id: item.id, order: item.order + 1 };
        }
      }
      
      return { id: item.id, order: item.order };
    });
    
    return this.reorderPlaylistItems(playlistId, itemOrders);
  },
  
  // Begin reordering (for UI state)
  startReordering() {
    playlistStore.update(state => ({
      ...state,
      isReordering: true
    }));
  },
  
  // End reordering without saving (for UI state)
  cancelReordering() {
    playlistStore.update(state => ({
      ...state,
      isReordering: false
    }));
    
    // Reload the current playlist items to reset any local changes
    const currentState = playlistStore.getState();
    if (currentState.selectedPlaylistId) {
      // Force reload by invalidating the cache
      playlistCache.invalidate(`playlistItems:${currentState.selectedPlaylistId}`);
      this.getPlaylistItems(currentState.selectedPlaylistId);
    }
  },
  
  // Set selected playlist
  setSelectedPlaylist(playlistId: string | null) {
    playlistStore.update((state) => ({
      ...state,
      selectedPlaylistId: playlistId
    }));
    
    // If an ID is provided, load details and items
    if (playlistId) {
      this.getPlaylist(playlistId);
      this.getPlaylistItems(playlistId);
    }
  }
};

// Create derived stores for easy access
export const playlists = derived(playlistStore, ($state) => 
  Object.values($state.playlists)
);

export const selectedPlaylist = derived(playlistStore, ($state) => 
  $state.selectedPlaylistId ? $state.playlists[$state.selectedPlaylistId] || null : null
);

export const selectedPlaylistItems = derived(playlistStore, ($state) => 
  $state.selectedPlaylistId ? $state.playlistItems[$state.selectedPlaylistId] || [] : []
);

export const isReorderingPlaylist = derived(playlistStore, ($state) => $state.isReordering);

export const playlistLoading = derived(playlistStore, ($state) => $state.loading);
export const playlistError = derived(playlistStore, ($state) => $state.error);

// Helper to get items for a specific playlist
export function getPlaylistItems(playlistId: string) {
  return derived(playlistStore, ($state) => 
    $state.playlistItems[playlistId] || []
  );
}

export default playlistApi;
