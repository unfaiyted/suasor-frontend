<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import Portal from '../portal/Portal.svelte';

  let props = $props<{ 
    trailerUrl: string, 
    isOpen: boolean,
    onClose: () => void
  }>();

  let modalElement = $state<HTMLDivElement | null>(null);
  
  function handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && props.isOpen) {
      props.onClose();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (modalElement && !modalElement.contains(e.target as Node) && props.isOpen) {
      props.onClose();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  // Convert YouTube URL to embed URL
  $effect(() => {
    if (props.trailerUrl) {
      // Make sure to bind to embed URL for YouTube
      if (props.trailerUrl.includes('youtube.com/watch?v=')) {
        const url = props.trailerUrl.replace('watch?v=', 'embed/');
        if (!url.includes('autoplay=1')) {
          trailerEmbedUrl = url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
        } else {
          trailerEmbedUrl = url;
        }
      } else {
        trailerEmbedUrl = props.trailerUrl;
      }
    }
  });

  let trailerEmbedUrl = $state<string>('');
</script>

{#if props.isOpen}
  <Portal>
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      transition:fade={{ duration: 300 }}
    >
      <div 
        bind:this={modalElement}
        class="relative w-full max-w-6xl max-h-[90vh]"
        transition:scale={{ duration: 400, start: 0.8, opacity: 0 }}
      >
        <!-- Close button -->
        <button 
          onclick={props.onClose} 
          class="absolute -top-12 right-0 p-2 text-white hover:text-primary-400 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span class="sr-only">Close</span>
        </button>

        <!-- Trailer container -->
        <div
          class="relative aspect-video overflow-hidden rounded-lg shadow-2xl"
          in:fly={{ y: 50, duration: 600, delay: 200 }}
        >
          <iframe
            title="Movie Trailer"
            width="100%"
            height="100%"
            src={trailerEmbedUrl}
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </Portal>
{/if}