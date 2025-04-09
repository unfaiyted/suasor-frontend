import { writable } from 'svelte/store';

export interface MediaItem {
  id: number | string;
  title: string;
  poster_path: string;
  release_date: string;
  type?: 'movie' | 'tv' | 'music';
}

interface MediaCollectionStore {
  items: MediaItem[];
  addItem: (item: MediaItem) => void;
  removeItem: (id: number | string) => void;
  clearCollection: () => void;
  isInCollection: (id: number | string) => boolean;
}

function createMediaCollectionStore(): MediaCollectionStore {
  // Initialize from localStorage if available
  const storedCollection = typeof localStorage !== 'undefined' 
    ? JSON.parse(localStorage.getItem('mediaCollection') || '{"items":[]}') 
    : { items: [] };
  
  const { subscribe, set, update } = writable<{ items: MediaItem[] }>(storedCollection);

  return {
    subscribe,
    addItem: (item: MediaItem) => {
      update(store => {
        // Don't add if already in collection
        if (!store.items.some(m => m.id === item.id)) {
          const updated = { items: [...store.items, item] };
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mediaCollection', JSON.stringify(updated));
          }
          return updated;
        }
        return store;
      });
    },
    removeItem: (id: number | string) => {
      update(store => {
        const updated = { items: store.items.filter(m => m.id !== id) };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('mediaCollection', JSON.stringify(updated));
        }
        return updated;
      });
    },
    clearCollection: () => {
      set({ items: [] });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mediaCollection', JSON.stringify({ items: [] }));
      }
    },
    isInCollection: (id: number | string) => {
      let result = false;
      subscribe(store => {
        result = store.items.some(m => m.id === id);
      })();
      return result;
    }
  };
}

export const mediaCollection = createMediaCollectionStore();