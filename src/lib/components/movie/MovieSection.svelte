<!-- MovieSection.svelte -->
<script lang="ts">
	import MovieGrid from './MovieGrid.svelte';

	export let title;
	export let movies = [];
	export let isInWatchlist;
</script>

<div class="mb-8">
	<h3 class="mb-4 text-xl font-bold">{title}</h3>
	<MovieGrid {movies} {isInWatchlist} on:showDetails on:toggleWatchlist />
</div>
