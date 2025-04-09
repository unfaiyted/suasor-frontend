<script lang="ts">
  // This component displays the current Tailwind breakpoint
  // Only visible in development mode
  import { onMount } from 'svelte';
  
  // Tailwind default breakpoints
  const breakpoints = {
    sm: '640px',   // @media (min-width: 640px)
    md: '768px',   // @media (min-width: 768px)
    lg: '1024px',  // @media (min-width: 1024px)
    xl: '1280px',  // @media (min-width: 1280px)
    '2xl': '1536px' // @media (min-width: 1536px)
  };

  // State for current breakpoint and UI states
  let currentBreakpoint = $state<string>('');
  let isMinimized = $state<boolean>(false);
  let showDetails = $state<boolean>(true);
  let height = $state<number>(0);
  let scrollY = $state<number>(0);
  
  // Update the breakpoint on window resize
  function updateBreakpoint() {
    const width = window.innerWidth;
    height = window.innerHeight;
    
    if (width < parseInt(breakpoints.sm)) {
      currentBreakpoint = 'default';
    } else if (width < parseInt(breakpoints.md)) {
      currentBreakpoint = 'sm';
    } else if (width < parseInt(breakpoints.lg)) {
      currentBreakpoint = 'md';
    } else if (width < parseInt(breakpoints.xl)) {
      currentBreakpoint = 'lg';
    } else if (width < parseInt(breakpoints['2xl'])) {
      currentBreakpoint = 'xl';
    } else {
      currentBreakpoint = '2xl';
    }
  }

  // Toggle minimized state on double-click
  function toggleMinimized() {
    isMinimized = !isMinimized;
  }

  // Toggle details view
  function toggleDetails() {
    showDetails = !showDetails;
  }

  // Update scroll position
  function updateScroll() {
    scrollY = window.scrollY;
  }
  
  // Set up event listeners on mount
  onMount(() => {
    updateBreakpoint();
    updateScroll();
    window.addEventListener('resize', updateBreakpoint);
    window.addEventListener('scroll', updateScroll);
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint);
      window.removeEventListener('scroll', updateScroll);
    };
  });
</script>

<!-- Main container with conditional classes based on minimized state -->
<div 
  ondblclick={toggleMinimized}
  class={`fixed z-50 transition-all duration-300 flex ${isMinimized ? 'bottom-0 left-0 w-8 h-8 overflow-hidden hover:opacity-100 opacity-50' : 'bottom-0 left-0'}`}
>
  {#if isMinimized}
    <!-- Minimized view -->
    <div class="bg-black text-white text-xs font-mono p-1 cursor-pointer flex items-center justify-center w-full h-full">
      <div class={`w-3 h-3 rounded-full ${currentBreakpoint === 'default' ? 'bg-red-500' : 
                                          currentBreakpoint === 'sm' ? 'bg-orange-500' : 
                                          currentBreakpoint === 'md' ? 'bg-yellow-500' : 
                                          currentBreakpoint === 'lg' ? 'bg-green-500' : 
                                          currentBreakpoint === 'xl' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
    </div>
  {:else}
    <!-- Expanded view -->
    <div class="bg-black text-white text-xs font-mono p-2 flex flex-col">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <!-- Breakpoint indicator -->
          <div>Breakpoint:</div>
          <div class="flex space-x-1">
            <div class={`px-1.5 py-0.5 rounded ${currentBreakpoint === 'default' ? 'bg-red-500' : 'bg-gray-700'}`}>default</div>
            <div class={`px-1.5 py-0.5 rounded ${currentBreakpoint === 'sm' ? 'bg-orange-500' : 'bg-gray-700'}`}>sm</div>
            <div class={`px-1.5 py-0.5 rounded ${currentBreakpoint === 'md' ? 'bg-yellow-500' : 'bg-gray-700'}`}>md</div>
            <div class={`px-1.5 py-0.5 rounded ${currentBreakpoint === 'lg' ? 'bg-green-500' : 'bg-gray-700'}`}>lg</div>
            <div class={`px-1.5 py-0.5 rounded ${currentBreakpoint === 'xl' ? 'bg-blue-500' : 'bg-gray-700'}`}>xl</div>
            <div class={`px-1.5 py-0.5 rounded ${currentBreakpoint === '2xl' ? 'bg-purple-500' : 'bg-gray-700'}`}>2xl</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="ml-4 flex space-x-2">
          <button 
            onclick={toggleDetails}
            class="text-gray-400 hover:text-white focus:outline-none"
            title="Toggle details"
          >
            {showDetails ? '−' : '+'}
          </button>
        </div>
      </div>

      <!-- Width display always visible -->
      <div class="flex space-x-4 mt-1">
        <div>Width: {typeof window !== 'undefined' ? window.innerWidth : 0}px</div>
        <div>Height: {height}px</div>
      </div>

      <!-- Detailed information section, conditionally shown -->
      {#if showDetails}
        <div class="flex flex-col mt-1 pt-1 border-t border-gray-700">
          <div>Scroll Y: {scrollY}px</div>
          <div>Ratio: {(typeof window !== 'undefined' ? window.innerWidth : 0) / height}</div>
          <div class="text-gray-400 text-[10px] mt-1">Double-click to minimize, click +/- to toggle details</div>
        </div>
      {/if}
    </div>
  {/if}
</div>