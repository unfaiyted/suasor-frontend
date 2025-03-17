<!-- MovieFilters.svelte -->
<script lang="ts">
	export let filters = {
		source: 'all',
		genre: 'all',
		sort: 'recommended'
	};
	export let genres = [];
</script>

<div class="mt-6 mb-6 flex flex-wrap items-center justify-between gap-4">
	<div class="flex flex-wrap items-center gap-4">
		<h2 class="h2 text-primary-500 font-bold">Movie Recommendations</h2>

		<div class="flex gap-2">
			<select class="select !bg-surface-200-800" bind:value={filters.source}>
				<option value="all">All Sources</option>
				<option value="plex">Plex</option>
				<option value="emby">Emby</option>
				<option value="jellyfin">Jellyfin</option>
			</select>

			<select class="select !bg-surface-200-800" bind:value={filters.genre}>
				<option value="all">All Genres</option>
				{#each genres as genre}
					<option value={genre}>{genre}</option>
				{/each}
			</select>

			<select class="select !bg-surface-200-800" bind:value={filters.sort}>
				<option value="recommended">AI Recommended</option>
				<option value="rating">Highest Rated</option>
				<option value="release_date">Newest First</option>
			</select>
		</div>
	</div>
</div>
