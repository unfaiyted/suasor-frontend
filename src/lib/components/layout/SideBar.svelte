<script lang="ts">
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	// Icons
	import IconMenu from '@lucide/svelte/icons/menu';
	import IconHome from '@lucide/svelte/icons/home';
	import IconMessageSquare from '@lucide/svelte/icons/message-square';
	import IconFilm from '@lucide/svelte/icons/film';
	import IconTv from '@lucide/svelte/icons/tv';
	import IconMusic from '@lucide/svelte/icons/music';
	import IconGamepad from '@lucide/svelte/icons/gamepad';
	import IconUser from '@lucide/svelte/icons/user';
	import IconSettings from '@lucide/svelte/icons/settings';
	import IconSearch from '@lucide/svelte/icons/search';

	let isExpansed = $state(false);

	function toggleExpanded() {
		isExpansed = !isExpansed;
	}
</script>

<div class="card border-surface-100-900 sticky top-0 h-dvh w-full">
	<!-- Component -->
	<Navigation.Rail expanded={isExpansed} background="bg-surface-100-900/30">
		{#snippet header()}
			<Navigation.Tile labelExpanded="Menu" onclick={toggleExpanded} title="Toggle Menu Width">
				<IconMenu />
			</Navigation.Tile>
			<Navigation.Tile labelExpanded="Search" href="/search" title="Search Content">
				<IconSearch />
			</Navigation.Tile>
		{/snippet}

		{#snippet tiles()}
			<!-- Media Recommendations -->
			<Navigation.Tile labelExpanded="Movies" href="/movies" title="Movie Recommendations">
				<IconFilm />
			</Navigation.Tile>
			<Navigation.Tile labelExpanded="TV Shows" href="/tv" title="TV Show Recommendations">
				<IconTv />
			</Navigation.Tile>
			<Navigation.Tile labelExpanded="Music" href="/music" title="Music Recommendations">
				<IconMusic />
			</Navigation.Tile>
			<Navigation.Tile labelExpanded="AI Chat" href="/chat" title="Discuss Your Media">
				<IconMessageSquare />
			</Navigation.Tile>
		{/snippet}

		{#snippet footer()}
			<Navigation.Tile labelExpanded="Settings" href="/settings" title="Settings">
				<IconSettings />
			</Navigation.Tile>
		{/snippet}
	</Navigation.Rail>
</div>

<style lang="css">
	:global(.sidebar) {
		height: calc(100dvh);
	}
</style>
