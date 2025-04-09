<script lang="ts">
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
	// Icons
	import IconHome from '@lucide/svelte/icons/home';
	import IconMenu from '@lucide/svelte/icons/menu';
	import IconMessageSquare from '@lucide/svelte/icons/message-square';
	import IconFilm from '@lucide/svelte/icons/film';
	import IconTv from '@lucide/svelte/icons/tv';
	import IconAnime from '@lucide/svelte/icons/venetian-mask';
	import IconMusic from '@lucide/svelte/icons/music';
	import IconSettings from '@lucide/svelte/icons/settings';
	// Import config store
	import configApi, { userConfig } from '$lib/stores/config';

	let isExpansed = $state(false);
	// Track which media types the user has enabled
	let enabledMediaTypes = $state<string[]>([]);

	// Watch for changes in user config
	$effect(() => {
		if ($userConfig && $userConfig.contentTypes) {
			enabledMediaTypes = $userConfig.contentTypes.split(',');
		}
	});

	function toggleExpanded() {
		isExpansed = !isExpansed;
	}

	// Load user configuration on mount
	onMount(async () => {
		await configApi.loadUserConfig();
	});

	// Check if a specific media type is enabled
	function isMediaTypeEnabled(type: string): boolean {
		// If no specific types are configured, show all by default
		if (!enabledMediaTypes || enabledMediaTypes.length === 0) return true;
		return enabledMediaTypes.includes(type);
	}
</script>

<div class="card border-surface-100-900 sticky top-0 h-dvh w-full">
	<!-- Component -->
	<Navigation.Rail expanded={isExpansed} background="bg-surface-100-900/30">
		{#snippet header()}
			<Navigation.Tile labelExpanded="Menu" onclick={toggleExpanded} title="Toggle Menu Width">
				<IconMenu />
			</Navigation.Tile>
			<Navigation.Tile labelExpanded="Dashboard" href="/" title="Dashboard">
				<IconHome />
			</Navigation.Tile>
		{/snippet}

		{#snippet tiles()}
			<!-- Media Recommendations based on user preferences -->
			{#if isMediaTypeEnabled('movies')}
				<Navigation.Tile labelExpanded="Movies" href="/movies" title="Movie Recommendations">
					<IconFilm />
				</Navigation.Tile>
			{/if}

			{#if isMediaTypeEnabled('series') || isMediaTypeEnabled('tvShows')}
				<Navigation.Tile labelExpanded="TV Shows" href="/tv" title="TV Show Recommendations">
					<IconTv />
				</Navigation.Tile>
			{/if}

			{#if isMediaTypeEnabled('music')}
				<Navigation.Tile labelExpanded="Music" href="/music" title="Music Recommendations">
					<IconMusic />
				</Navigation.Tile>
			{/if}

			{#if isMediaTypeEnabled('anime')}
				<Navigation.Tile labelExpanded="Anime" href="/anime" title="Anime Recommendations">
					<IconAnime />
				</Navigation.Tile>
			{/if}
		{/snippet}

		{#snippet footer()}
			<Navigation.Tile labelExpanded="AI Chat" href="/chat" title="Discuss Your Media">
				<IconMessageSquare />
			</Navigation.Tile>
		{/snippet}
	</Navigation.Rail>
</div>

<style lang="css">
	:global(.sidebar) {
		height: calc(100dvh);
	}
</style>
