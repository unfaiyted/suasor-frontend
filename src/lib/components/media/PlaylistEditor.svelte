<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { X, Save, MoveVertical, Film, List, Sparkles } from '@lucide/svelte';
  import Portal from '../portal/Portal.svelte';
  import { mediaClients } from '$lib/stores/api';
  
  // Props interface
  interface PlaylistEditorProps {
    show: boolean;
    selectedItems?: any[];
    playlist?: any; // If editing existing playlist
    mode?: 'create' | 'edit';
    type?: 'playlist' | 'collection';
  }
  
  // Set props with Svelte 5 syntax
  let { 
    show = false, 
    selectedItems = [], 
    playlist = null,
    mode = 'create',
    type = 'playlist'
  }: PlaylistEditorProps = $props();
  
  // State management with Svelte 5 syntax
  let name = $state('');
  let description = $state('');
  let isPublic = $state(false);
  let selectedClientId = $state<number | null>(null);
  let errorMessage = $state('');
  let successMessage = $state('');
  let draggedIndex = $state<number | null>(null);
  let isSubmitting = $state(false);
  let orderedItems = $state<any[]>([]);
  let askAi = $state(false);
  let aiPrompt = $state('');
  
  // Create event dispatcher
  const dispatch = createEventDispatcher();
  
  // Reset form fields
  function resetForm() {
    if (mode === 'edit' && playlist) {
      name = playlist.name || '';
      description = playlist.description || '';
      isPublic = playlist.isPublic || false;
      selectedClientId = playlist.clientId || null;
    } else {
      name = '';
      description = '';
      isPublic = false;
      selectedClientId = null;
    }
    
    type = playlist?.type || type;
    errorMessage = '';
    successMessage = '';
    isSubmitting = false;
    askAi = false;
    aiPrompt = '';
  }
  
  // Initialize orderedItems when selectedItems change
  $effect(() => {
    if (mode === 'edit' && playlist?.items) {
      orderedItems = [...playlist.items];
    } else {
      orderedItems = [...selectedItems];
    }
  });
  
  // Close the modal
  function closeModal() {
    resetForm();
    dispatch('close');
  }
  
  // Handle click outside modal to close
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  }
  
  // Client selection logic
  let availableClients = $derived([...$mediaClients].filter((client) => client.isEnabled));
  
  function handleClientChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    selectedClientId = parseInt(select.value);
  }
  
  // Drag and drop functionality
  function startDrag(index: number) {
    draggedIndex = index;
  }
  
  function onDragOver(index: number) {
    if (draggedIndex === null || draggedIndex === index) return;
  
    // Reorder the items
    const itemsToReorder = [...orderedItems];
    const [draggedItem] = itemsToReorder.splice(draggedIndex, 1);
    itemsToReorder.splice(index, 0, draggedItem);
  
    // Update the state
    orderedItems = itemsToReorder;
    draggedIndex = index;
  }
  
  function endDrag() {
    draggedIndex = null;
  }
  
  // Toggle AI assistance
  function toggleAiAssistance() {
    askAi = !askAi;
    
    if (askAi && !aiPrompt) {
      // Suggest a default prompt based on the type
      if (type === 'playlist') {
        aiPrompt = `Create a ${name || 'new'} playlist with these items`;
      } else {
        aiPrompt = `Organize these items into a coherent ${name || 'new'} collection`;
      }
    }
  }
  
  // Save the list
  async function saveList() {
    // Validate form
    if (!name.trim()) {
      errorMessage = 'Please enter a name';
      return;
    }
  
    if (!selectedClientId && mode === 'create') {
      errorMessage = 'Please select a media client';
      return;
    }
  
    isSubmitting = true;
    errorMessage = '';
  
    try {
      // In a real implementation, make API call to create/edit list
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 800));
  
      // Create list payload
      const listPayload = {
        id: playlist?.id,
        name,
        description,
        isPublic,
        clientId: selectedClientId,
        type,
        items: orderedItems.map((item) => item.id),
        aiPrompt: askAi ? aiPrompt : null
      };
  
      // Show success message
      successMessage = mode === 'create'
        ? `Successfully created ${type} "${name}" with ${orderedItems.length} items`
        : `Successfully updated ${type} "${name}"`;
  
      // Emit event with the created/updated list data
      dispatch(mode === 'create' ? 'create' : 'update', listPayload);
  
      // Close modal after delay
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      errorMessage = `Error ${mode === 'create' ? 'creating' : 'updating'} ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      isSubmitting = false;
    }
  }
  
  // Remove item from list
  function removeItem(index: number) {
    orderedItems = orderedItems.filter((_, i) => i !== index);
  }
  
  // Keyboard handling
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
  
  // Setup and cleanup event listeners
  onMount(() => {
    resetForm();
    
    // Only add event listeners in the browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }
  });
  
  onDestroy(() => {
    // Only remove event listeners in the browser environment
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

{#if show}
  <Portal>
    <div
      class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      transition:fade={{ duration: 200 }}
      onclick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="playlist-editor-title"
    >
      <div
        class="bg-surface-100-900 relative flex h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl shadow-xl"
        transition:fly={{ y: 20, duration: 300 }}
        onclick={() => {}}
      >
        <!-- Header -->
        <div class="border-surface-200-800 flex items-center justify-between border-b p-4">
          <h2 id="playlist-editor-title" class="text-lg font-semibold">
            {mode === 'create' ? 'Create' : 'Edit'} {type === 'playlist' ? 'Playlist' : 'Collection'}
          </h2>
          <button
            class="hover:bg-surface-200-800 rounded-full p-1.5 transition-colors"
            onclick={closeModal}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <!-- Form - scrollable content area -->
        <div class="flex-1 overflow-y-auto p-5">
          {#if errorMessage}
            <div class="mb-4 rounded bg-red-500/10 p-3 text-red-500">
              {errorMessage}
            </div>
          {/if}

          {#if successMessage}
            <div class="mb-4 rounded bg-green-500/10 p-3 text-green-500">
              {successMessage}
            </div>
          {/if}

          <!-- List name -->
          <div class="mb-4">
            <label for="list-name" class="mb-1 block text-sm font-medium">Name</label>
            <input
              id="list-name"
              type="text"
              bind:value={name}
              class="input w-full"
              placeholder={type === 'playlist' ? 'My Playlist' : 'My Collection'}
              required
              disabled={isSubmitting}
            />
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label for="list-description" class="mb-1 block text-sm font-medium">Description</label>
            <textarea
              id="list-description"
              bind:value={description}
              class="input w-full"
              placeholder="Enter a description..."
              rows="3"
              disabled={isSubmitting}
            ></textarea>
          </div>

          <!-- Media client selection -->
          <div class="mb-4">
            <label for="media-client" class="mb-1 block text-sm font-medium">Media Client</label>
            <select
              id="media-client"
              class="select w-full"
              onchange={handleClientChange}
              disabled={isSubmitting || mode === 'edit'}
              required={mode === 'create'}
            >
              <option value="">Select a media client</option>
              {#each availableClients as client (client.id)}
                <option value={client.id} selected={selectedClientId === client.id}>{client.name}</option>
              {/each}
            </select>
          </div>

          <!-- Public/Private toggle -->
          <div class="mb-4">
            <label class="flex items-center gap-2">
              <input 
                type="checkbox" 
                bind:checked={isPublic} 
                disabled={isSubmitting}
                class="checkbox"
              />
              <span class="text-sm">Make this {type} public</span>
            </label>
          </div>

          <!-- List type selection -->
          <div class="mb-4">
            <label for="list-type" class="mb-1 block text-sm font-medium">List Type</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                class="btn flex items-center justify-center gap-2 p-3"
                class:preset-filled-primary-500={type === 'playlist'}
                class:preset-outlined-primary-500={type !== 'playlist'}
                onclick={() => (type = 'playlist')}
                disabled={isSubmitting || mode === 'edit'}
                type="button"
              >
                <List size={18} />
                <span>Playlist</span>
              </button>
              <button
                class="btn flex items-center justify-center gap-2 p-3"
                class:preset-filled-primary-500={type === 'collection'}
                class:preset-outlined-primary-500={type !== 'collection'}
                onclick={() => (type = 'collection')}
                disabled={isSubmitting || mode === 'edit'}
                type="button"
              >
                <Film size={18} />
                <span>Collection</span>
              </button>
            </div>
          </div>

          <!-- AI assistance toggle -->
          <div class="mb-4">
            <button 
              class="w-full p-3 rounded-lg border border-secondary-500/30 bg-surface-200-800 hover:bg-surface-300-700 flex justify-between items-center"
              onclick={toggleAiAssistance}
              type="button"
            >
              <div class="flex items-center gap-2">
                <Sparkles size={18} class="text-secondary-500" />
                <span>AI Assistance</span>
              </div>
              <div class="w-10 h-5 rounded-full relative bg-surface-300-700 transition-colors"
                   class:bg-secondary-700={askAi}
              >
                <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform"
                     class:translate-x-5={askAi}
                ></div>
              </div>
            </button>
            
            {#if askAi}
              <div class="mt-2 p-3 bg-secondary-900/20 border border-secondary-500/20 rounded-lg">
                <label for="ai-prompt" class="mb-1 block text-sm font-medium text-secondary-400">
                  What would you like the AI to do with this {type}?
                </label>
                <textarea
                  id="ai-prompt"
                  bind:value={aiPrompt}
                  class="input w-full border-secondary-500/30 bg-surface-200-800 mt-1 text-sm"
                  placeholder="e.g. Order these movies for a movie night..."
                  rows="2"
                  disabled={isSubmitting}
                ></textarea>
                <p class="text-xs text-secondary-400/70 mt-1">
                  The AI can suggest an order, provide insights, or recommend additional items.
                </p>
              </div>
            {/if}
          </div>

          <!-- Items list with drag and drop for playlist -->
          {#if orderedItems.length > 0}
            <div class="mb-4">
              <div class="mb-2 flex items-center gap-2">
                <label class="text-sm font-medium">Items</label>
                <span class="text-xs opacity-60">{type === 'playlist' ? '(Drag to reorder)' : ''}</span>
              </div>
              <div class="border-surface-200-800 overflow-y-auto rounded border max-h-64">
                {#each orderedItems as item, index (item.id)}
                  <div
                    class="hover:bg-surface-300-800 group flex cursor-pointer items-center gap-2 p-2 transition-colors border-b border-surface-200-800/50 last:border-b-0"
                    class:bg-surface-300-800={draggedIndex === index}
                    class:cursor-move={type === 'playlist'}
                    animate:flip={{ duration: 300 }}
                    draggable={type === 'playlist'}
                    ondragstart={() => type === 'playlist' && startDrag(index)}
                    ondragover={() => type === 'playlist' && onDragOver(index)}
                    ondragend={endDrag}
                  >
                    {#if type === 'playlist'}
                      <div class="flex-shrink-0">
                        <MoveVertical
                          size={16}
                          class="text-primary-400 opacity-50 group-hover:opacity-100"
                        />
                      </div>
                    {:else}
                      <div class="w-6 flex justify-center text-xs text-surface-500-400">
                        {index + 1}
                      </div>
                    {/if}
                    
                    <img
                      src={item.poster || 
                        item.poster_path || 
                        item.details?.artwork?.poster ||
                        `https://via.placeholder.com/45x68?text=${encodeURIComponent(item.title || 'Media')}`}
                      alt={item.title}
                      class="h-12 w-8 rounded object-cover"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium">{item.title}</div>
                      <div class="text-xs opacity-70">
                        {item.year || 
                          (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A')}
                      </div>
                    </div>
                    
                    <button 
                      class="text-surface-500-400 hover:text-red-500 p-1"
                      onclick={() => removeItem(index)}
                      title="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <div class="mb-4 text-center py-8 text-surface-500-400 border-surface-200-800 border rounded-lg">
              <p>No items selected</p>
              <p class="text-xs mt-1">Add items to your {type} first</p>
            </div>
          {/if}
        </div>

        <!-- Fixed footer with save button -->
        <div class="border-surface-200-800 bg-surface-100-900 flex-shrink-0 border-t p-4 shadow-lg">
          <div class="flex justify-end">
            <button
              class="btn preset-filled-primary-500 flex items-center gap-2 px-4 py-2"
              onclick={saveList}
              disabled={isSubmitting}
              type="button"
            >
              {#if isSubmitting}
                <div class="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                <span>{mode === 'create' ? 'Creating' : 'Updating'}...</span>
              {:else}
                <Save size={18} />
                <span>{mode === 'create' ? 'Create' : 'Update'} {type}</span>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Portal>
{/if}

<style>
  .modal-backdrop {
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
</style>