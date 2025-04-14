<script lang="ts">
  import { movieCart, type CartMovie } from '../../stores/movieCart';
  
  let showCart = $state<boolean>(false);
  let movies: CartMovie[] = $state<CartMovie[]>([]);
  
  // Subscribe to store
  $effect(() => {
    const unsubscribe = movieCart.subscribe(store => {
      movies = store.movies;
    });
    
    return unsubscribe;
  });
  
  function toggleCart() {
    showCart = !showCart;
  }
  
  function removeFromCart(id: number | string) {
    movieCart.removeMovie(id);
  }
  
  function clearCart() {
    movieCart.clearCart();
  }
  
  function createChatWithMovies() {
    if (movies.length > 0) {
      const movieIds = movies.map(m => m.id).join(',');
      window.location.href = `/chat?context=collection&ids=${movieIds}`;
    }
  }
  
  function createListWithMovies() {
    if (movies.length > 0) {
      // Redirect to playlists page with cart items as query parameter
      window.location.href = `/playlists?action=create&ids=${movies.map(m => m.id).join(',')}`;
    }
  }
  
  function createCollectionWithMovies() {
    if (movies.length > 0) {
      // Redirect to collections page with cart items as query parameter
      window.location.href = `/collections?action=create&ids=${movies.map(m => m.id).join(',')}`;
    }
  }
</script>

<div class="fixed bottom-4 right-4 z-30">
  <button 
    onclick={toggleCart}
    class="relative bg-surface-200-800 hover:bg-surface-300-700 text-white p-3 rounded-full shadow-lg transition flex items-center justify-center"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    
    {#if movies.length > 0}
      <span class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
        {movies.length}
      </span>
    {/if}
  </button>
  
  {#if showCart}
    <div class="absolute bottom-16 right-0 w-80 bg-surface-200-800 rounded-lg shadow-xl p-4 border border-surface-300-700">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-white">Movie Cart ({movies.length})</h3>
        <button 
          onclick={() => showCart = false}
          class="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      {#if movies.length === 0}
        <div class="text-center py-6 text-gray-400">
          <p>Your cart is empty</p>
        </div>
      {:else}
        <div class="max-h-64 overflow-y-auto mb-4">
          {#each movies as movie}
            <div class="flex items-center gap-3 py-2 border-b border-surface-300-700">
              <img 
                src={movie.poster_path.startsWith('/') 
                  ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                  : movie.poster_path} 
                alt={movie.title} 
                class="w-10 h-15 object-cover rounded"
              />
              <div class="flex-1 overflow-hidden">
                <h4 class="text-sm font-medium text-white truncate">{movie.title}</h4>
                <p class="text-xs text-gray-400">{new Date(movie.release_date).getFullYear()}</p>
              </div>
              <button 
                onclick={() => removeFromCart(movie.id)}
                class="text-gray-400 hover:text-primary-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>
        
        <div class="flex flex-col gap-2">
          <button 
            onclick={createChatWithMovies}
            class="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chat About These Movies
          </button>
          
          <div class="grid grid-cols-2 gap-2">
            <button 
              onclick={createListWithMovies}
              class="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded flex items-center justify-center gap-1 text-xs font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Create Playlist
            </button>
            
            <button 
              onclick={createCollectionWithMovies}
              class="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-2 rounded flex items-center justify-center gap-1 text-xs font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Create Collection
            </button>
          </div>
          
          <button 
            onclick={clearCart}
            class="w-full bg-surface-300-700 hover:bg-surface-400-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            Clear Cart
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>