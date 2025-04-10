<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		jobStats,
		activeJobRuns,
		recentJobRuns,
		startJobPolling,
		stopJobPolling
	} from '$lib/stores/jobs';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import type { JobRun } from '$lib/api/jobService';
	import { jobService, JobStatus } from '$lib/api/jobService';

	// Local reactive state
	let localJobStats = $state({
		totalJobs: 0,
		completedJobs: 0,
		failedJobs: 0,
		pendingJobs: 0,
		runningJobs: 0,
		successRate: 0
	});
	let localActiveJobRuns = $state([]);
	let localRecentJobRuns = $state([]);
	let loading = $state(true);

	// Set up subscriptions with proper unsubscribe
	let unsubStats;
	let unsubActive;
	let unsubRecent;

	// Setup polling for active jobs and store subscriptions
	onMount(() => {
		// Set up subscriptions
		unsubStats = jobStats.subscribe((stats) => {
			localJobStats = stats;
		});

		unsubActive = activeJobRuns.subscribe((runs) => {
			localActiveJobRuns = runs;
		});

		unsubRecent = recentJobRuns.subscribe((runs) => {
			localRecentJobRuns = runs;
			// Always stop loading once we get a response, even if no jobs exist
			loading = false;
		});

		// Start polling
		const cleanupPolling = startJobPolling(5000);

		return () => {
			// Clean up subscriptions
			unsubStats();
			unsubActive();
			unsubRecent();
			// Stop polling
			cleanupPolling();
		};
	});

	// Format date
	function formatJobDate(dateStr: string | null | undefined): string {
		if (!dateStr) return 'N/A';

		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);

		if (diffDay > 0) {
			return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
		} else if (diffHour > 0) {
			return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
		} else if (diffMin > 0) {
			return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
		} else {
			return diffSec <= 5 ? 'just now' : `${diffSec} seconds ago`;
		}
	}

	// Job status badge
	function getStatusBadge(status: string | undefined): string {
		if (!status) return 'badge-secondary';

		switch (status) {
			case JobStatus.JobStatusCompleted:
				return 'badge-success';
			case JobStatus.JobStatusFailed:
				return 'badge-error';
			case JobStatus.JobStatusRunning:
				return 'badge-primary';
			case JobStatus.JobStatusPending:
				return 'badge-warning';
			default:
				return 'badge-secondary';
		}
	}

	// Navigate to jobs page
	function viewAllJobs() {
		goto('/jobs');
	}
</script>

<div class="overflow-hidden">
	<div class="flex items-center justify-end">
		<button class="btn btn-sm btn-primary" on:click={viewAllJobs}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
			View All
		</button>
	</div>

	<div class="p-0">
		{#if loading}
			<div class="flex h-60 items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		{:else}
			<!-- Stats summary -->
			<div class="grid grid-cols-2 gap-px bg-surface-300-700/10 sm:grid-cols-4">
				<div class="stat p-4">
					<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
						Total Jobs
					</div>
					<div class="stat-value mt-1 text-2xl font-bold">{localJobStats.totalJobs}</div>
				</div>
				<div class="stat p-4">
					<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
						Running
					</div>
					<div class="stat-value text-primary-500 mt-1 text-2xl font-bold flex items-center">
						{localJobStats.runningJobs}
						{#if localJobStats.runningJobs > 0}
							<span class="inline-block ml-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
						{/if}
					</div>
				</div>
				<div class="stat p-4">
					<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
						Completed
					</div>
					<div class="stat-value text-success-500 mt-1 text-2xl font-bold">
						{localJobStats.completedJobs}
					</div>
				</div>
				<div class="stat p-4">
					<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
						Failed
					</div>
					<div class="stat-value text-error-500 mt-1 text-2xl font-bold">
						{localJobStats.failedJobs}
					</div>
				</div>
			</div>

			<!-- Active jobs -->
			{#if localActiveJobRuns.length > 0}
				<div class="border-t border-surface-300-700/10 px-6 py-4">
					<h3 class="mb-3 flex items-center gap-2 font-semibold text-surface-100-900">
						<span class="bg-primary-500 h-2 w-2 animate-pulse rounded-full"></span>
						Active Jobs
					</h3>
					<div class="bg-surface-300-700/20 overflow-hidden rounded-lg border border-surface-300-700/10">
						<table class="w-full">
							<thead class="bg-surface-300-700/30">
								<tr>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Job</th>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Progress</th>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Started</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-surface-300-700/10">
								{#each localActiveJobRuns as job}
									<tr
										class="hover:bg-surface-300-700/10 cursor-pointer transition-colors"
										on:click={() => goto(`/jobs/run/${job.id}`)}
									>
										<td class="px-4 py-3">
											<div class="font-medium">{job.jobName}</div>
											<div class="mt-0.5 text-xs opacity-70">
												{job.statusMessage || 'Running...'}
											</div>
										</td>
										<td class="px-4 py-3">
											<div class="flex items-center">
												<div class="bg-surface-300-700/30 mr-2 h-2 w-32 rounded-full overflow-hidden">
													<div
														class="bg-primary-500 h-2 rounded-full transition-all duration-300"
														style="width: {job.progress}%"
													></div>
												</div>
												<span class="text-xs font-medium">{job.progress}%</span>
											</div>
											{#if job.totalItems > 0}
												<div class="mt-1 text-xs opacity-70">
													{job.processedItems} / {job.totalItems} items
												</div>
											{/if}
										</td>
										<td class="px-4 py-3 text-sm">
											<div class="flex items-center gap-1.5">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-3.5 w-3.5 opacity-70"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<circle cx="12" cy="12" r="10"></circle>
													<polyline points="12 6 12 12 16 14"></polyline>
												</svg>
												{formatJobDate(job.startTime)}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Recent jobs -->
			<div class="border-t border-surface-300-700/10 px-6 py-4">
				<h3 class="mb-3 flex items-center gap-2 text-base font-semibold">
					<div class="bg-surface-300-700/30 p-1 rounded">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
						</svg>
					</div>
					Recent Activity
				</h3>

				{#if localRecentJobRuns.length === 0}
					<div class="bg-surface-300-700/20 rounded-lg border border-surface-300-700/10 p-8 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto mb-3 h-10 w-10 opacity-30"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						<p class="font-medium">No job history available</p>
						<p class="mt-1 text-sm opacity-70">
							Jobs will appear here once they've been run
						</p>
					</div>
				{:else}
					<div class="bg-surface-300-700/20 overflow-hidden rounded-lg border border-surface-300-700/10">
						<table class="w-full">
							<thead class="bg-surface-300-700/30">
								<tr>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Job</th>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Status</th>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Completed</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-surface-300-700/10">
								{#each localRecentJobRuns.slice(0, 5) as job}
									<tr
										class="hover:bg-surface-300-700/10 cursor-pointer transition-colors"
										on:click={() => goto(`/jobs/run/${job.id}`)}
									>
										<td class="px-4 py-3 font-medium">{job.jobName}</td>
										<td class="px-4 py-3">
											<span
												class="bg-opacity-20 rounded-full px-2.5 py-1 text-xs font-medium {getStatusBadge(
													job.status
												)}"
											>
												{job.status}
											</span>
										</td>
										<td class="px-4 py-3 text-sm">
											<div class="flex items-center gap-1.5">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-3.5 w-3.5 opacity-70"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<circle cx="12" cy="12" r="10"></circle>
													<polyline points="12 6 12 12 16 14"></polyline>
												</svg>
												{formatJobDate(job.endTime || job.startTime)}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
