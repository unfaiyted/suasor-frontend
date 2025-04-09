<!-- MovieGrid.svelte -->
<script lang="ts">
	import MovieCard from './MovieCard.svelte';

	export let movies = [];
	export let isInWatchlist;
	export let isInCart = id => false; // Default function to check if movie is in cart
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
	{#each movies as movie}
		<MovieCard 
			{movie} 
			isInWatchlist={isInWatchlist(movie.id)} 
			isInCart={isInCart(movie.id)} 
			on:showDetails 
			on:toggleWatchlist
			on:toggleCart
		/>
	{/each}
</div>
