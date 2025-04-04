<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  // Get a reference to the DOM node
  let ref: HTMLElement;
  
  // Create a portal container if it doesn't exist
  let target: HTMLElement;
  
  onMount(() => {
    // Find or create the portal container
    target = document.getElementById('portal') as HTMLElement;
    if (!target) {
      target = document.createElement('div');
      target.id = 'portal';
      document.body.appendChild(target);
    }
    
    // Move the content to the portal container
    if (ref && target) {
      target.appendChild(ref);
    }
    
    return () => {
      // Clean up on component destroy
      if (ref && ref.parentNode) {
        ref.parentNode.removeChild(ref);
      }
    };
  });
</script>

<div bind:this={ref}>
  <slot></slot>
</div>
