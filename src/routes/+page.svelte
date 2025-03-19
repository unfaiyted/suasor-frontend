<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { isAuthenticated, user } from '$lib/stores/auth';

	// Mock data stores - would be replaced with actual API calls
	let recommendations = {
		movies: { count: 127, watched: 48 },
		tvShows: { count: 89, watched: 32, episodes: 217 },
		music: { count: 156, listened: 93 }
	};

	let integrationStatus = {
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
	};

	let recentActivity = [
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
	];

	let discoveryRate = [
		{ month: 'May', count: 23 },
		{ month: 'Jun', count: 31 },
		{ month: 'Jul', count: 28 },
		{ month: 'Aug', count: 42 },
		{ month: 'Sep', count: 38 },
		{ month: 'Oct', count: 45 }
	];

	let selectedTab = 'overview';

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString();
	}

	function getStatusColor(status) {
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
		return statusMap[status] || 'text-gray-500';
	}

	onMount(async () => {
		// Here you would fetch real data from your API
		// For example:
		// const userData = await fetch('/api/user/dashboard');
		// const userDataJson = await userData.json();
		// recommendations = userDataJson.recommendations;
	});
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	{#if $isAuthenticated}
		<!-- Header Section -->
		<header class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-primary-600 text-3xl font-bold">Media Compass</h1>
					<p class="">Your personalized entertainment dashboard</p>
				</div>
				{#if $isAuthenticated}
					<div class="flex items-center">
						<div class="mr-3 text-right">
							<p class="font-medium">Welcome, {$user.username}</p>
							<p class="text-sm text-gray-500">Premium Member</p>
						</div>
						<div class="bg-primary-100 h-12 w-12 overflow-hidden rounded-full">
							<!-- User avatar could go here -->
						</div>
					</div>
				{/if}
			</div>
		</header>

		<!-- Stats Overview -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="bg-surface-100-900 rounded-lg p-6 shadow-md">
				<h3 class="mb-2 text-lg font-semibold">Movies</h3>
				<div class="flex items-end justify-between">
					<div>
						<p class="text-primary-600 text-3xl font-bold">{recommendations.movies.count}</p>
						<p class="text-sm">Recommendations</p>
					</div>
					<div class="text-right">
						<p class="text-xl font-medium text-green-500">{recommendations.movies.watched}</p>
						<p class="text-sm">Watched</p>
					</div>
				</div>
				<div class="mt-4 h-2 w-full rounded-full bg-gray-200">
					<div
						class="bg-primary-500 h-2 rounded-full"
						style="width: {(recommendations.movies.watched / recommendations.movies.count) * 100}%"
					></div>
				</div>
			</div>

			<div class="bg-surface-100-900 rounded-lg p-6 shadow-md">
				<h3 class="mb-2 text-lg font-semibold">TV Shows</h3>
				<div class="flex items-end justify-between">
					<div>
						<p class="text-primary-600 text-3xl font-bold">{recommendations.tvShows.count}</p>
						<p class="text-sm">Recommendations</p>
					</div>
					<div class="text-right">
						<p class="text-xl font-medium text-green-500">{recommendations.tvShows.watched}</p>
						<p class="text-sm">Watched</p>
					</div>
				</div>

				<div class="mt-4 h-2 w-full rounded-full bg-gray-200">
					<div
						class="bg-primary-500 h-2 rounded-full"
						style="width: {(recommendations.tvShows.watched / recommendations.tvShows.count) *
							100}%"
					></div>
				</div>
				<div class="mt-2 text-sm">
					<span class="font-medium">{recommendations.tvShows.episodes}</span> episodes tracked
				</div>
			</div>

			<div class="bg-surface-100-900 rounded-lg p-6 shadow-md">
				<h3 class="mb-2 text-lg font-semibold">Music</h3>
				<div class="flex items-end justify-between">
					<div>
						<p class="text-primary-600 text-3xl font-bold">{recommendations.music.count}</p>
						<p class="text-sm">Recommendations</p>
					</div>
					<div class="text-right">
						<p class="text-xl font-medium text-green-500">{recommendations.music.listened}</p>
						<p class="text-sm">Listened</p>
					</div>
				</div>
				<div class="mt-4 h-2 w-full rounded-full bg-gray-200">
					<div
						class="bg-primary-500 h-2 rounded-full"
						style="width: {(recommendations.music.listened / recommendations.music.count) * 100}%"
					></div>
				</div>
			</div>
		</div>

		<!-- Main Dashboard Grid -->
		<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Recent Activity -->
			<div class="bg-surface-100-900 rounded-lg p-6 shadow-md lg:col-span-2">
				<h3 class="mb-4 text-lg font-semibold">Recent Activity</h3>
				<div class="divide-y divide-gray-200">
					{#each recentActivity as activity}
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
				<button class="text-primary-600 mt-4 hover:underline">View all activity</button>
			</div>

			<!-- Integrations Status -->
			<div class="bg-surface-100-900 rounded-lg p-6 shadow-md">
				<h3 class="mb-4 text-lg font-semibold">Integrations</h3>

				<div class="mb-4">
					<h4 class="text-tertiary-500 mb-2 font-medium">Media Servers</h4>
					<ul class="space-y-2">
						{#each integrationStatus.mediaServers as server}
							<li class="flex items-center justify-between">
								<span>{server.name}</span>
								<span class={getStatusColor(server.status)}>
									{server.status}
								</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="mb-4">
					<h4 class="text-tertiary-500 mb-2 font-medium">AI Models</h4>
					<ul class="space-y-2">
						{#each integrationStatus.aiModels as model}
							<li class="flex items-center justify-between">
								<span>{model.name}</span>
								<span class={getStatusColor(model.status)}>
									{model.status}
								</span>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<h4 class="text-tertiary-500 mb-2 font-medium">Automation Tools</h4>
					<ul class="space-y-2">
						{#each integrationStatus.automationTools as tool}
							<li class="flex items-center justify-between">
								<span>{tool.name}</span>
								<div>
									<span class={getStatusColor(tool.status)}>
										{tool.status}
									</span>
									{#if tool.pendingTasks > 0}
										<span
											class="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"
										>
											{tool.pendingTasks} pending
										</span>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>

		<!-- Discovery Rate Chart -->
		<div class="bg-surface-100-900 rounded-lg p-6 shadow-md">
			<h3 class="mb-4 text-lg font-semibold">Media Discovery Rate</h3>
			<div class="h-64">
				<div class="flex h-full items-end">
					{#each discoveryRate as month}
						<div class="flex flex-1 flex-col items-center">
							<div
								class="bg-primary-500 w-full transition-all duration-500 ease-in-out"
								style="height: {(month.count / 50) * 100}%"
							></div>
							<p class="mt-2 text-xs">{month.month}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div class="py-12 text-center">
			<h2 class="mb-4 text-2xl font-bold">Please log in to access your dashboard</h2>
			<a href="/login" class="btn btn-primary">Log In</a>
		</div>
	{/if}
</div>

<style lang="postcss">
	/* Add any custom styles you need here */
</style>
