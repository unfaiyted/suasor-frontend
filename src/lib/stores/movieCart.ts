import { writable } from 'svelte/store';

export interface CartMovie {
  id: number | string;
  title: string;
  poster_path: string;
  release_date: string;
}

interface MovieCartStore {
  movies: CartMovie[];
  addMovie: (movie: CartMovie) => void;
  removeMovie: (id: number | string) => void;
  clearCart: () => void;
  isInCart: (id: number | string) => boolean;
}

function createMovieCartStore(): MovieCartStore {
  // Initialize from localStorage if available
  const storedCart = typeof localStorage !== 'undefined' 
    ? JSON.parse(localStorage.getItem('movieCart') || '{"movies":[]}') 
    : { movies: [] };
  
  const { subscribe, set, update } = writable<{ movies: CartMovie[] }>(storedCart);

  return {
    subscribe,
    addMovie: (movie: CartMovie) => {
      update(store => {
        // Don't add if already in cart
        if (!store.movies.some(m => m.id === movie.id)) {
          const updated = { movies: [...store.movies, movie] };
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('movieCart', JSON.stringify(updated));
          }
          return updated;
        }
        return store;
      });
    },
    removeMovie: (id: number | string) => {
      update(store => {
        const updated = { movies: store.movies.filter(m => m.id !== id) };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('movieCart', JSON.stringify(updated));
        }
        return updated;
      });
    },
    clearCart: () => {
      set({ movies: [] });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('movieCart', JSON.stringify({ movies: [] }));
      }
    },
    isInCart: (id: number | string) => {
      let result = false;
      subscribe(store => {
        result = store.movies.some(m => m.id === id);
      })();
      return result;
    }
  };
}

export const movieCart = createMovieCartStore();