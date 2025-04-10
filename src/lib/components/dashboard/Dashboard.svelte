<script lang="ts">
	import { onMount } from 'svelte';
	import type { UserResponse } from '$lib/api/types';
	import DashboardHeader from './DashboardHeader.svelte';
	import DraggableDashboard from './DraggableDashboard.svelte';

	interface DashboardProps {
		user: UserResponse | null;
	}

	const { user }: DashboardProps = $props();

	// Mock data stores - would be replaced with actual API calls
	let recommendations = $state({
		movies: { count: 127, watched: 48 },
		tvShows: { count: 89, watched: 32, episodes: 217 },
		music: { count: 156, listened: 93 }
	});

	let integrationStatus = $state({
		mediaServers: [
			{ name: 'Plex', status: 'connected', lastSync: '2023-10-15T14:30:00Z' },
			{ name: 'Emby', status: 'disconnected', lastSync: null },
			{ name: 'Jellyfin', status: 'connected', lastSync: '2023-10-14T09:15:00Z' }
		],
		aiModels: [
			{ name: 'Claude', status: 'active', usageCount: 37 },
			{ name: 'OpenAI', status: 'active', usageCount: 52 },
			{ name: 'Ollama', status: 'inactive', usageCount: 0 }
		],
		automationTools: [
			{ name: 'Sonarr', status: 'connected', pendingTasks: 3 },
			{ name: 'Radarr', status: 'connected', pendingTasks: 1 },
			{ name: 'Lidarr', status: 'connected', pendingTasks: 0 }
		]
	});

	let recentActivity = $state([
		{
			type: 'movie',
			title: 'Dune: Part Two',
			date: '2023-10-14',
			status: 'recommended',
			source: 'Claude'
		},
		{ type: 'tv', title: 'Severance', date: '2023-10-13', status: 'added', source: 'OpenAI' },
		{
			type: 'music',
			title: 'The Dark Side of the Moon',
			date: '2023-10-12',
			status: 'listened',
			source: 'User'
		},
		{
			type: 'movie',
			title: 'Everything Everywhere All at Once',
			date: '2023-10-10',
			status: 'watched',
			source: 'OpenAI'
		}
	]);

	let discoveryRate = $state([
		{ month: 'May', count: 23 },
		{ month: 'Jun', count: 31 },
		{ month: 'Jul', count: 28 },
		{ month: 'Aug', count: 42 },
		{ month: 'Sep', count: 38 },
		{ month: 'Oct', count: 45 }
	]);

	onMount(async () => {
		// In the future, we would fetch real data here:
		// const userData = await fetch('/api/user/dashboard');
		// const userDataJson = await userData.json();
		// recommendations = userDataJson.recommendations;
	});
</script>

<div>
	<DashboardHeader {user} />
	
	<DraggableDashboard 
		{user} 
		{recommendations} 
		{integrationStatus} 
		{recentActivity} 
		{discoveryRate} 
	/>
</div>

