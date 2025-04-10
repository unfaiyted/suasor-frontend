<script lang="ts">
  import StatCard from './StatCard.svelte';
  
  interface StatsOverviewProps {
    recommendations: {
      movies: { count: number, watched: number },
      tvShows: { count: number, watched: number, episodes: number },
      music: { count: number, listened: number }
    };
  }
  
  const { recommendations } = $props<StatsOverviewProps>();
</script>

<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
  <StatCard 
    title="Movies"
    count={recommendations.movies.count}
    completed={recommendations.movies.watched}
  />
  
  <StatCard 
    title="TV Shows"
    count={recommendations.tvShows.count}
    completed={recommendations.tvShows.watched}
    extraInfo={`${recommendations.tvShows.episodes} episodes tracked`}
  />
  
  <StatCard 
    title="Music"
    count={recommendations.music.count}
    completed={recommendations.music.listened}
  />
</div>