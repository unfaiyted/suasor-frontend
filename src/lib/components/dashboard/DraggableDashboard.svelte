<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboardStore, type DashboardWidget, type WidgetSize } from '$lib/stores/dashboard';
  import DraggableCard from './DraggableCard.svelte';
  import RecentActivity from './RecentActivity.svelte';
  import IntegrationsStatus from './IntegrationsStatus.svelte';
  import MediaDiscoveryChart from './MediaDiscoveryChart.svelte';
  import JobsStatusCard from './JobsStatusCard.svelte';
  import StatCard from './StatCard.svelte';
  import { Edit2, Save, Plus, RotateCcw } from '@lucide/svelte';

  // Props for the dashboard widgets data
  interface DraggableDashboardProps {
    user: any; 
    recommendations: any;
    integrationStatus: any;
    recentActivity: any;
    discoveryRate: any;
  }

  // Destructure props
  const { 
    user, 
    recommendations, 
    integrationStatus, 
    recentActivity, 
    discoveryRate 
  }: DraggableDashboardProps = $props();

  // Local state
  let dashboardContainer: HTMLElement;
  let widgetBeingDragged: string | null = $state(null);
  let dropTarget: string | null = $state(null);
  let dashboard = $state({ widgets: [], editMode: false });

  // Subscribe to the dashboard store
  dashboardStore.subscribe(value => {
    dashboard = value;
  });

  // Handle drag start from the card component
  function handleDragStart(e: CustomEvent) {
    widgetBeingDragged = e.detail.id;
  }

  // Handle drag over
  function handleDragOver(e: DragEvent, id: string) {
    // preventDefault is handled via event modifier in template
    if (widgetBeingDragged === id) return;
    dropTarget = id;
  }

  // Handle drop
  function handleDrop(e: DragEvent, id: string) {
    // preventDefault is handled via event modifier in template
    if (!widgetBeingDragged || widgetBeingDragged === id) return;
    
    // Get the current order of widgets
    const currentOrder = dashboard.widgets
      .filter(w => w.visible)
      .sort((a, b) => a.order - b.order)
      .map(w => w.id);
    
    // Find the indices
    const draggedIndex = currentOrder.indexOf(widgetBeingDragged);
    const dropIndex = currentOrder.indexOf(id);
    
    if (draggedIndex !== -1 && dropIndex !== -1) {
      // Remove dragged item
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIndex, 1);
      
      // Insert at new position
      newOrder.splice(dropIndex, 0, widgetBeingDragged);
      
      // Update store
      dashboardStore.reorderWidgets(newOrder);
    }
    
    // Reset states
    widgetBeingDragged = null;
    dropTarget = null;
  }

  // Handle drag end
  function handleDragEnd() {
    widgetBeingDragged = null;
    dropTarget = null;
  }

  // Remove widget
  function removeWidget(id: string) {
    dashboardStore.toggleWidget(id);
  }

  // Toggle edit mode
  function toggleEditMode() {
    dashboardStore.toggleEditMode();
  }

  // Reset layout
  function resetLayout() {
    if (confirm('Are you sure you want to reset the dashboard to its default layout?')) {
      dashboardStore.resetLayout();
    }
  }

  // Generate grid placement styles for a widget based on its size
  function getGridStyles(size: { width: number, height: number }): string {
    return `
      grid-column: span ${size.width}; 
      grid-row: span ${size.height};
      width: 100%;
      height: 100%;
    `;
  }

  // We won't need a render function as we'll use Svelte's templating instead

  // Lifecycle
  onMount(() => {
    // Initialize dashboard from saved state if available
    // This happens automatically via the store subscription
  });
</script>

<div class="mb-6">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold">Dashboard</h2>
    <div class="flex gap-2">
      <button 
        class="btn btn-sm {dashboard.editMode ? 'btn-primary' : 'bg-surface-100-800 hover:bg-surface-200-700'}"
        on:click={toggleEditMode}
      >
        {#if dashboard.editMode}
          <Save size={16} />
          <span class="ml-1">Save Layout</span>
        {:else}
          <Edit2 size={16} />
          <span class="ml-1">Customize</span>
        {/if}
      </button>
    </div>
  </div>

  {#if dashboard.editMode}
    <div class="bg-surface-100-800 rounded-lg p-4 mb-4">
      <h3 class="font-medium mb-2">Dashboard Customization</h3>
      <p class="text-sm mb-4">Drag and drop widgets to rearrange them. Click the resize button to change a widget's size.</p>
      
      <div class="flex justify-between items-center">
        <div>
          <h4 class="text-sm font-medium mb-2">Grid Size Legend</h4>
          <div class="flex flex-wrap items-center gap-2 text-xs text-surface-400-500">
            <div class="w-8 h-8 border border-surface-400-500 flex items-center justify-center">1×1</div>
            <div class="w-16 h-8 border border-surface-400-500 flex items-center justify-center">2×1</div>
            <div class="w-24 h-8 border border-surface-400-500 flex items-center justify-center">3×1</div>
            <div class="mt-2 w-8 h-16 border border-surface-400-500 flex items-center justify-center">1×2</div>
            <div class="mt-2 w-16 h-16 border border-surface-400-500 flex items-center justify-center">2×2</div>
            <div class="mt-2 w-8 h-24 border border-surface-400-500 flex items-center justify-center">1×3</div>
            <div class="mt-2 w-16 h-24 border border-surface-400-500 flex items-center justify-center">2×3</div>
            <div class="mt-2 w-8 h-32 border border-surface-400-500 flex items-center justify-center">1×4</div>
            <div class="mt-2 w-16 h-32 border border-surface-400-500 flex items-center justify-center">2×4</div>
          </div>
        </div>
        
        <button 
          class="btn btn-sm btn-primary-outline"
          on:click={resetLayout}
          title="Reset to default layout"
        >
          <RotateCcw size={14} />
          <span class="ml-1">Reset Layout</span>
        </button>
      </div>
      
      {#if dashboard.widgets.some(w => !w.visible)}
        <div class="mt-4">
          <h4 class="text-sm font-medium mb-2">Hidden Widgets</h4>
          <div class="flex flex-wrap gap-2">
            {#each dashboard.widgets.filter(w => !w.visible) as widget}
              <button 
                class="btn btn-sm btn-outline"
                on:click={() => dashboardStore.toggleWidget(widget.id)}
              >
                <Plus size={14} />
                <span class="ml-1">{widget.title}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div 
    bind:this={dashboardContainer} 
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300"
    style="
      grid-auto-rows: 200px;
      grid-auto-flow: dense;
    "
  >
    {#each dashboard.widgets.filter(w => w.visible).sort((a, b) => a.order - b.order) as widget (widget.id)}
      <div
        style={getGridStyles(widget.size)}
        class="transition-all duration-300 aspect-ratio-container"
        on:dragover|preventDefault={(e) => handleDragOver(e, widget.id)}
        on:drop|preventDefault={(e) => handleDrop(e, widget.id)}
        class:border-2={dropTarget === widget.id}
        class:border-primary-500={dropTarget === widget.id}
        class:border-dashed={dropTarget === widget.id}
      >
        <DraggableCard 
          id={widget.id} 
          title={widget.title} 
          editable={dashboard.editMode} 
          size={widget.size} 
          on:dragstart={handleDragStart}
          on:dragend={handleDragEnd}
          on:remove={() => removeWidget(widget.id)}
          on:resize={(e) => dashboardStore.updateWidgetSize(widget.id, e.detail.size)}
        >
          {#if widget.type === 'movies-stats'}
            <StatCard 
              title={widget.title}
              count={recommendations.movies.count}
              completed={recommendations.movies.watched}
            />
          {:else if widget.type === 'tv-stats'}
            <StatCard 
              title={widget.title}
              count={recommendations.tvShows.count}
              completed={recommendations.tvShows.watched}
              extraInfo={`${recommendations.tvShows.episodes} episodes tracked`}
            />
          {:else if widget.type === 'music-stats'}
            <StatCard 
              title={widget.title}
              count={recommendations.music.count}
              completed={recommendations.music.listened}
            />
          {:else if widget.type === 'activity'}
            <RecentActivity activities={recentActivity} />
          {:else if widget.type === 'jobs'}
            <JobsStatusCard />
          {:else if widget.type === 'discovery'}
            <MediaDiscoveryChart data={discoveryRate} />
          {:else if widget.type === 'integrations'}
            <IntegrationsStatus integrationStatus={integrationStatus} />
          {/if}
        </DraggableCard>
      </div>
    {/each}
  </div>
</div>
<style>
  /* Aspect ratio container to maintain widget proportions */
  .aspect-ratio-container {
    display: flex;
    flex-direction: column;
  }
</style>
