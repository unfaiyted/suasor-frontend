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

	let isExpansed = $state(true);

	function toggleExpanded() {
		isExpansed = !isExpansed;
	}
</script>

<div
	class="card border-surface-100-900 sticky top-0 ml-0 grid h-dvh w-full grid-cols-[auto_1fr] rounded-tl-none border-[1px] border-t-0 border-r-0 border-l-0"
>
	<!-- classes="sticky top-0  ml-0  h-dvh sidebar border-l-0" -->
	<!-- Component -->
	<Navigation.Rail expanded={isExpansed}>
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
			<!-- <Navigation.Tile labelExpanded="Games" href="/games" title="Game Recommendations"> -->
			<!-- 	<IconGamepad /> -->
			<!-- </Navigation.Tile> -->
			<!-- Conversational AI -->
			<Navigation.Tile labelExpanded="AI Chat" href="/conversation" title="Discuss Your Media">
				<IconMessageSquare />
			</Navigation.Tile>
		{/snippet}

		{#snippet footer()}
			<!-- <Navigation.Tile labelExpanded="Profile" href="/profile" title="Your Profile"> -->
			<!-- 	<IconUser /> -->
			<!-- </Navigation.Tile> -->
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
