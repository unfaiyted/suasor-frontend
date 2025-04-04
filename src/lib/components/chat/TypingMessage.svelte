<script lang="ts">
  import { fade } from 'svelte/transition';
  import TypingIndicator from './TypingIndicator.svelte';
</script>

<div class="grid grid-cols-[auto_1fr] gap-2" in:fade={{ duration: 200 }}>
  <div class="avatar w-16 h-16 rounded-full overflow-hidden bg-surface-300-600-token flex items-center justify-center">
    <img 
      src={`https://i.pravatar.cc/?img=14`} 
      alt="AI"
      class="w-full h-full object-cover"
    />
  </div>
  
  <div class="card space-y-2 p-4 preset-tonal rounded-tl-none">
    <header class="flex items-center justify-between">
      <p class="font-bold">MovieAI</p>
      <small class="opacity-50">{new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })}</small>
    </header>
    
    <div class="flex items-center min-h-8">
      <TypingIndicator showIndicator={true} />
    </div>
  </div>
</div>