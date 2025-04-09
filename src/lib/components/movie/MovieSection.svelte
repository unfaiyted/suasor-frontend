<!-- MovieSection.svelte -->
<script lang="ts">
	import MovieGrid from './MovieGrid.svelte';

	export let title = '';
	export let movies = [];
	export let isInWatchlist;
	export let isInCart = id => false; // Default function to check if movie is in cart
</script>

<div class="mb-8">
	{#if title}
		<h3 class="mb-4 text-xl font-bold">{title}</h3>
	{/if}
	<MovieGrid {movies} {isInWatchlist} {isInCart} on:showDetails on:toggleWatchlist on:toggleCart />
</div>
