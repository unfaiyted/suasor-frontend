<script lang="ts">
  import { mediaCollection } from '../../stores/mediaCollection';
  
  let props = $props<{ movie: any, similarMovies: any[] }>();
  
  function startSimilarMoviesChat() {
    // Navigate to chat with context for similar movies
    window.location.href = `/chat?context=similar&id=${props.movie.id}`;
  }
  
  function addAllToSelection() {
    // Add all similar movies to selection
    if (props.similarMovies) {
      props.similarMovies.forEach(movie => {
        mediaCollection.addItem({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster?.replace('https://image.tmdb.org/t/p/w500', '') || '',
          release_date: movie.year?.toString() || '',
          type: 'movie'
        });
      });
    }
  }
  
  function addToSelection(movie: any) {
    mediaCollection.addItem({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster?.replace('https://image.tmdb.org/t/p/w500', '') || '',
      release_date: movie.year?.toString() || '',
      type: 'movie'
    });
  }
  
  function isInSelection(id: string | number) {
    return mediaCollection.isInCollection(id);
  }
</script>

<div class="bg-surface-200-800/50 rounded-xl p-6 mb-12 w-full">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-bold flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-400">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/>
        <line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="2" y1="7" x2="7" y2="7"/>
        <line x1="2" y1="17" x2="7" y2="17"/>
        <line x1="17" y1="17" x2="22" y2="17"/>
        <line x1="17" y1="7" x2="22" y2="7"/>
      </svg>
      Similar Movies
    </h2>
    <div class="flex gap-3">
      <button 
        onclick={startSimilarMoviesChat}
        class="btn variant-soft-secondary btn-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Ask AI About These
      </button>
      <button 
        onclick={addAllToSelection}
        class="btn variant-soft-surface btn-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
          <path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4z"/>
        </svg>
        Add All
      </button>
    </div>
  </div>
  
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {#each props.similarMovies as movie}
      <div class="relative group">
        <a href={`/movies/${movie.id}`} class="block">
          <img 
            src={movie.poster} 
            alt={movie.title} 
            class="w-full h-auto rounded-lg transition transform group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition flex items-end p-3">
            <div>
              <h3 class="text-white font-medium">{movie.title}</h3>
              <div class="flex items-center gap-1 text-xs">
                <span>{movie.year}</span>
                <span class="text-yellow-500">★ {movie.rating}</span>
              </div>
            </div>
          </div>
        </a>
        <button 
          class="absolute top-2 right-2 p-1.5 bg-surface-200-800/80 rounded-full opacity-0 group-hover:opacity-100 transition"
          onclick={() => addToSelection(movie)}
        >
          {#if isInSelection(movie.id)}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-400">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
              <path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4z"/>
            </svg>
          {/if}
        </button>
      </div>
    {/each}
  </div>
</div>