<script lang="ts">
  import { mediaCollection, type MediaItem } from '../../stores/mediaCollection';
  
  let showPanel = $state<boolean>(false);
  let items: MediaItem[] = $state<MediaItem[]>([]);
  
  // Subscribe to store
  $effect(() => {
    const unsubscribe = mediaCollection.subscribe(store => {
      items = store.items;
    });
    
    return unsubscribe;
  });
  
  function togglePanel() {
    showPanel = !showPanel;
  }
  
  function removeFromCollection(id: number | string) {
    mediaCollection.removeItem(id);
  }
  
  function clearCollection() {
    mediaCollection.clearCollection();
  }
  
  function createChatWithItems() {
    if (items.length > 0 && typeof window !== 'undefined') {
      const itemIds = items.map(m => m.id).join(',');
      window.location.href = `/chat?context=collection&ids=${itemIds}`;
    }
  }
  
  function createListWithItems() {
    if (items.length > 0 && typeof window !== 'undefined') {
      console.log('Creating a list with selected items');
      // Open list creation modal or redirect to list creation page
      window.location.href = `/chat?context=create-list&ids=${items.map(m => m.id).join(',')}`;
    }
  }
</script>

<div class="fixed bottom-4 right-4 z-30">
  <button 
    onclick={togglePanel}
    class="relative bg-primary-700/80 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition flex items-center justify-center backdrop-blur-sm"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
      <path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4z"/>
    </svg>
    
    {#if items.length > 0}
      <span class="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
        {items.length}
      </span>
    {/if}
  </button>
  
  {#if showPanel}
    <div class="absolute bottom-16 right-0 w-80 bg-surface-200-800/95 rounded-lg shadow-xl p-4 border border-primary-800/30 backdrop-blur-sm">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-white text-lg">My Selections ({items.length})</h3>
        <button 
          onclick={() => showPanel = false}
          class="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      {#if items.length === 0}
        <div class="text-center py-8 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-gray-500">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
            <path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4z"/>
          </svg>
          <p>Your selection is empty</p>
          <p class="text-xs mt-1 text-gray-500 max-w-56 mx-auto">Add items to create AI-powered lists or discuss media with our assistant</p>
        </div>
      {:else}
        <div class="max-h-64 overflow-y-auto mb-4 pr-1">
          {#each items as item}
            <div class="flex items-center gap-3 py-2 border-b border-surface-300-700/30">
              <img 
                src={item.poster_path.startsWith('/') 
                  ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                  : item.poster_path} 
                alt={item.title} 
                class="w-12 h-18 object-cover rounded-md"
              />
              <div class="flex-1 overflow-hidden">
                <h4 class="text-sm font-medium text-white truncate">{item.title}</h4>
                <p class="text-xs text-gray-400">{new Date(item.release_date).getFullYear()}</p>
              </div>
              <button 
                onclick={() => removeFromCollection(item.id)}
                class="text-gray-400 hover:text-primary-500 p-1 rounded-full hover:bg-surface-300-700/30"
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
            onclick={createChatWithItems}
            class="w-full bg-secondary-700 hover:bg-secondary-600 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chat About This Collection
          </button>
          
          <button 
            onclick={createListWithItems}
            class="w-full bg-primary-700 hover:bg-primary-600 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Create AI-Powered Playlist
          </button>
          
          <button 
            onclick={clearCollection}
            class="mt-2 text-xs text-gray-400 hover:text-white flex items-center gap-1 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear All Items
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>