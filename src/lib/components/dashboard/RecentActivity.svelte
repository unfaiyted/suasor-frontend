<script lang="ts">
  interface ActivityItem {
    type: string;
    title: string;
    date: string;
    status: string;
    source: string;
  }
  
  interface RecentActivityProps {
    activities: ActivityItem[];
  }
  
  const { activities } = $props<RecentActivityProps>();
  
  // Helper function to format dates
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }
  
  // Helper function to determine status color
  function getStatusColor(status: string) {
    const statusMap = {
      connected: 'text-green-500',
      disconnected: 'text-red-500',
      active: 'text-green-500',
      inactive: 'text-gray-500',
      recommended: 'text-blue-500',
      watched: 'text-green-500',
      added: 'text-purple-500',
      listened: 'text-teal-500'
    };
    return statusMap[status as keyof typeof statusMap] || 'text-gray-500';
  }
  
  function viewAllActivity() {
    console.log("View all activities clicked");
    // Handle view all navigation
  }
</script>

<div>
  <!-- Title is now in the parent card header -->
  <div class="divide-y divide-gray-200">
    {#each activities as activity}
      <div class="flex items-center py-3">
        <div class="mr-4 rounded-full p-2">
          <!-- Icon based on media type -->
          {#if activity.type === 'movie'}
            <svg class="text-primary-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 0h2v4h-2V5zM7 13h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
              />
            </svg>
          {:else if activity.type === 'tv'}
            <svg class="text-primary-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M2 4.5A2.5 2.5 0 014.5 2h11A2.5 2.5 0 0118 4.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 012 15.5v-11z"
              />
            </svg>
          {:else}
            <svg class="text-primary-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
              />
            </svg>
          {/if}
        </div>
        <div class="flex-grow">
          <p class="font-medium">{activity.title}</p>
          <p class="text-surface-700-300 text-sm">
            <span class={getStatusColor(activity.status)}>{activity.status}</span> • {formatDate(
              activity.date
            )}
          </p>
        </div>
        <div class="text-tertiary-500 text-sm">
          {activity.source}
        </div>
      </div>
    {/each}
  </div>
  <button class="text-primary-600 mt-4 hover:underline" onclick={viewAllActivity}>
    View all activity
  </button>
</div>