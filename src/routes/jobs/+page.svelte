<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		jobStats,
		jobSchedules,
		recentJobRuns,
		activeJobRuns,
		loadJobSchedules,
		loadRecentJobRuns,
		startJobPolling,
		stopJobPolling,
		runJob
	} from '$lib/stores/jobs';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import { jobService, JobStatus, JobType } from '$lib/api/jobService';

	// Local reactive state
	let localJobStats = $state({
		totalJobs: 0,
		completedJobs: 0,
		failedJobs: 0,
		pendingJobs: 0,
		runningJobs: 0,
		successRate: 0
	});
	let localJobSchedules = $state([]);
	let localActiveJobRuns = $state([]);
	let localRecentJobRuns = $state([]);
	let loading = $state(true);
	let runningJob = $state('');

	// Tab state
	let activeTab = $state('schedules');

	// Format date
	function formatJobDate(dateStr: string | null | undefined, includeTime = false): string {
		if (!dateStr) return 'Never';

		const date = new Date(dateStr);

		if (includeTime) {
			return date.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
		}

		// Relative time formatting
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

	// Calculate duration between two dates
	function formatDuration(startStr: string, endStr: string): string {
		const start = new Date(startStr);
		const end = new Date(endStr);
		const durationMs = end.getTime() - start.getTime();

		const seconds = Math.floor(durationMs / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			const remainingMinutes = minutes % 60;
			return `${hours}h ${remainingMinutes}m`;
		} else if (minutes > 0) {
			const remainingSeconds = seconds % 60;
			return `${minutes}m ${remainingSeconds}s`;
		} else {
			return `${seconds}s`;
		}
	}

	// Job type badge
	function getJobTypeBadge(type: string | undefined): string {
		if (!type) return 'badge-secondary';

		switch (type) {
			case JobType.JobTypeRecommendation:
				return 'badge-accent';
			case JobType.JobTypeSync:
				return 'badge-info';
			case JobType.JobTypeSystem:
				return 'badge-secondary';
			case JobType.JobTypeNotification:
				return 'badge-warning';
			case JobType.JobTypeAnalysis:
				return 'badge-primary';
			default:
				return 'badge-secondary';
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

	// Start a job manually
	async function triggerJob(name: string) {
		if (runningJob) return; // Prevent multiple clicks

		runningJob = name;
		try {
			await runJob(name);
		} finally {
			runningJob = '';
		}
	}

	// View job run details
	function viewJobRun(id: number) {
		goto(`/jobs/run/${id}`);
	}

	// View job schedule details
	function viewJobSchedule(name: string) {
		goto(`/jobs/schedule/${name}`);
	}

	// Set up polling for active jobs and subscriptions
	onMount(() => {
		// Load initial data
		loadJobSchedules();
		loadRecentJobRuns(100);

		// Set up subscriptions
		const unsubStats = jobStats.subscribe((stats) => {
			localJobStats = stats;
		});

		const unsubSchedules = jobSchedules.subscribe((schedules) => {
			localJobSchedules = schedules;
			updateLoadingState();
		});

		const unsubActive = activeJobRuns.subscribe((runs) => {
			localActiveJobRuns = runs;
		});

		const unsubRecent = recentJobRuns.subscribe((runs) => {
			localRecentJobRuns = runs;
			updateLoadingState();
		});

		// Start polling
		const cleanupPolling = startJobPolling(5000);

		// Clean up function
		return () => {
			unsubStats();
			unsubSchedules();
			unsubActive();
			unsubRecent();
			cleanupPolling();
		};
	});

	// Helper to update loading state - always stop loading once we get responses
	function updateLoadingState() {
		loading = false;
	}
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="flex items-center gap-3 text-3xl font-bold">
				<div class="bg-primary-500/10 p-1.5 rounded-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						class="text-primary-500"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M10 2h4"></path>
						<path d="M12 14v-4"></path>
						<path d="M4 13a8 8 0 0 1 8-7 8 8 0 0 1 8 7 8 8 0 0 1-8 7 8 8 0 0 1-8-7z"></path>
						<path d="M5 13h2"></path>
						<path d="M17 13h2"></path>
						<path d="M12 20v2"></path>
					</svg>
				</div>
				Job Management
			</h1>
			<p class="text-surface-100-900/60 mt-1">
				Monitor, configure, and control system jobs and scheduled tasks
			</p>
		</div>

		<div class="mt-4 md:mt-0">
			<div class="tabs tabs-bordered bg-surface-200-800 rounded-lg border border-surface-300-700/10">
				<button
					class="tab tab-lg {activeTab === 'schedules' ? 'tab-active font-semibold text-primary-500' : ''}"
					on:click={() => (activeTab = 'schedules')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1.5 h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
					Job Schedules
				</button>
				<button
					class="tab tab-lg {activeTab === 'history' ? 'tab-active font-semibold text-primary-500' : ''}"
					on:click={() => (activeTab = 'history')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1.5 h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
					</svg>
					Job History
				</button>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex h-80 items-center justify-center">
			<LoadingSpinner size="xl" />
		</div>
	{:else}
		<!-- Stats cards -->
		<div
			class="mb-8 grid grid-cols-1 gap-px bg-surface-300-700/10 overflow-hidden rounded-xl border border-surface-300-700/10 sm:grid-cols-2 lg:grid-cols-4"
		>
			<div class="stat p-6">
				<div class="stat-figure">
					<div class="bg-primary-500/10 p-2 rounded-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							class="text-primary-500"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10"></circle>
						</svg>
					</div>
				</div>
				<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
					Total Jobs
				</div>
				<div class="stat-value mt-1 text-3xl font-bold">{localJobStats.totalJobs}</div>
				<div class="stat-desc mt-1 text-xs">Job runs processed by the system</div>
			</div>

			<div class="stat p-6">
				<div class="stat-figure">
					<div class="bg-primary-500/10 p-2 rounded-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							class="text-primary-500"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
						</svg>
					</div>
				</div>
				<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
					Active Jobs
				</div>
				<div class="stat-value mt-1 text-3xl font-bold text-primary-500 flex items-center">
					{localJobStats.runningJobs}
					{#if localJobStats.runningJobs > 0}
						<span class="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary-500"></span>
					{/if}
				</div>
				<div class="stat-desc mt-1 text-xs">Currently running jobs</div>
			</div>

			<div class="stat p-6">
				<div class="stat-figure">
					<div class="bg-success-500/10 p-2 rounded-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							class="text-success-500"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
					</div>
				</div>
				<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
					Success Rate
				</div>
				<div class="stat-value mt-1 text-3xl font-bold text-success-500">
					{localJobStats.successRate}%
				</div>
				<div class="stat-desc mt-1 text-xs">
					{localJobStats.completedJobs} completed / {localJobStats.totalJobs} total
				</div>
			</div>

			<div class="stat p-6">
				<div class="stat-figure">
					<div class="bg-secondary-500/10 p-2 rounded-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							class="text-secondary-500"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					</div>
				</div>
				<div class="stat-title text-xs font-medium tracking-wider uppercase opacity-70">
					Scheduled Jobs
				</div>
				<div class="stat-value mt-1 text-3xl font-bold">{localJobSchedules.length}</div>
				<div class="stat-desc mt-1 text-xs">Configured job schedules</div>
			</div>
		</div>

		<!-- Active jobs -->
		{#if localActiveJobRuns.length > 0}
			<div class="mb-8">
				<div class="bg-surface-300-700/20 rounded-xl border border-surface-300-700/10 overflow-hidden">
					<div class="bg-primary-500/5 border-b border-surface-300-700/20 px-6 py-4">
						<h2 class="flex items-center gap-2 text-xl font-bold">
							<span class="relative flex h-3 w-3">
								<span
									class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-75"
								></span>
								<span class="relative inline-flex h-3 w-3 rounded-full bg-primary-500"></span>
							</span>
							Active Jobs
						</h2>
					</div>

					<div class="overflow-x-auto">
						<table class="table w-full">
							<thead class="text-xs uppercase bg-surface-300-700/30">
								<tr>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Job Name</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Type</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Progress</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Started</th>
									<th class="px-6 py-3 text-right font-semibold tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-surface-300-700/10">
								{#each localActiveJobRuns as job}
									<tr class="hover:bg-surface-300-700/10 transition-colors">
										<td class="px-6 py-4">
											<div class="font-medium">{job.jobName}</div>
											<div class="mt-0.5 text-xs opacity-60">
												{job.statusMessage || 'Running...'}
											</div>
										</td>
										<td class="px-6 py-4">
											<span
												class="bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium {getJobTypeBadge(
													job.jobType
												)}"
											>
												{job.jobType}
											</span>
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center">
												<div class="bg-surface-300-700/30 h-2 w-48 overflow-hidden rounded-full">
													<div
														class="bg-primary-500 h-2 rounded-full transition-all duration-300"
														style="width: {job.progress}%"
													></div>
												</div>
												<span class="ml-3 text-sm font-medium">{job.progress}%</span>
											</div>
											{#if job.totalItems > 0}
												<div class="mt-1.5 text-xs opacity-60">
													<span class="font-medium">{job.processedItems}</span> of
													<span class="font-medium">{job.totalItems}</span> items processed
												</div>
											{/if}
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center gap-1.5 text-sm">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4 opacity-70"
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
										<td class="px-6 py-4 text-right">
											<button
												class="btn btn-sm btn-primary"
												on:click={() => viewJobRun(job.id || 0)}
											>
												View Details
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}

		<!-- Content based on active tab -->
		{#if activeTab === 'schedules'}
			<div class="bg-surface-300-700/20 rounded-xl border border-surface-300-700/10 overflow-hidden">
				<div class="px-6 py-4 bg-surface-300-700/30 border-b border-surface-300-700/20 flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-xl font-bold">
						<div class="bg-surface-300-700/50 p-1.5 rounded-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line>
								<line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							</svg>
						</div>
						Job Schedules
					</h2>
				</div>

				{#if localJobSchedules.length === 0}
					<div class="p-16 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto mb-4 h-16 w-16 opacity-20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
							<line x1="9" y1="16" x2="15" y2="16"></line>
						</svg>
						<h3 class="text-xl font-medium">No Job Schedules Found</h3>
						<p class="opacity-70 mx-auto mt-2 max-w-md">
							The system doesn't have any configured job schedules yet. Jobs are configured
							automatically as the system operates.
						</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table w-full">
							<thead class="text-xs uppercase bg-surface-300-700/30">
								<tr>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Job Name</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Type</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Frequency</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Status</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Last Run</th>
									<th class="px-6 py-3 text-right font-semibold tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-surface-300-700/10">
								{#each localJobSchedules as schedule}
									<tr class="hover:bg-surface-300-700/10 transition-colors">
										<td class="px-6 py-4 font-medium">{schedule.jobName}</td>
										<td class="px-6 py-4">
											<span
												class="bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium {getJobTypeBadge(
													schedule.jobType
												)}"
											>
												{schedule.jobType}
											</span>
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center gap-1.5">
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
														<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
													</svg>
												</div>
												<span class="font-medium">{schedule.frequency}</span>
											</div>
										</td>
										<td class="px-6 py-4">
											{#if schedule.enabled}
												<div class="badge bg-success-500/10 text-success-500 border-success-500/30 gap-1">
													<span class="bg-success-500 h-1.5 w-1.5 rounded-full"></span>
													Enabled
												</div>
											{:else}
												<div class="badge bg-error-500/10 text-error-500 border-error-500/30 gap-1">
													<span class="bg-error-500 h-1.5 w-1.5 rounded-full"></span>
													Disabled
												</div>
											{/if}
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center gap-1.5 text-sm">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4 opacity-70"
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
												{formatJobDate(schedule.lastRunTime)}
											</div>
										</td>
										<td class="space-x-2 px-6 py-4 text-right">
											<button
												class="btn btn-sm btn-primary {runningJob === schedule.jobName
													? 'loading'
													: ''}"
												disabled={runningJob === schedule.jobName}
												on:click={() => triggerJob(schedule.jobName || '')}
											>
												Run Now
											</button>
											<button
												class="btn btn-sm btn-outline"
												on:click={() => viewJobSchedule(schedule.jobName || '')}
											>
												Configure
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Job history table -->
		{#if activeTab === 'history'}
			<div class="bg-surface-300-700/20 rounded-xl border border-surface-300-700/10 overflow-hidden">
				<div class="px-6 py-4 bg-surface-300-700/30 border-b border-surface-300-700/20">
					<h2 class="flex items-center gap-2 text-xl font-bold">
						<div class="bg-surface-300-700/50 p-1.5 rounded-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
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
						Job Run History
					</h2>
				</div>

				{#if localRecentJobRuns.length === 0}
					<div class="p-16 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto mb-4 h-16 w-16 opacity-20"
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
						<h3 class="text-xl font-medium">No Job History Available</h3>
						<p class="opacity-70 mx-auto mt-2 max-w-md">
							Job history will appear here once jobs have been run. You can manually trigger jobs
							from the Job Schedules tab.
						</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table w-full">
							<thead class="text-xs uppercase bg-surface-300-700/30">
								<tr>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Job Name</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Type</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Status</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Started</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Completed</th>
									<th class="px-6 py-3 text-left font-semibold tracking-wider">Duration</th>
									<th class="px-6 py-3 text-right font-semibold tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-surface-300-700/10">
								{#each localRecentJobRuns as job}
									<tr class="hover:bg-surface-300-700/10 transition-colors">
										<td class="px-6 py-4 font-medium">{job.jobName}</td>
										<td class="px-6 py-4">
											<span
												class="bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium {getJobTypeBadge(
													job.jobType
												)}"
											>
												{job.jobType}
											</span>
										</td>
										<td class="px-6 py-4">
											<span
												class="bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium {getStatusBadge(
													job.status
												)}"
											>
												{job.status}
											</span>
										</td>
										<td class="px-6 py-4 text-sm">
											{formatJobDate(job.startTime, true)}
										</td>
										<td class="px-6 py-4 text-sm">
											{job.endTime ? formatJobDate(job.endTime, true) : 'N/A'}
										</td>
										<td class="px-6 py-4 text-sm font-medium">
											{#if job.startTime && job.endTime}
												{formatDuration(job.startTime, job.endTime)}
											{:else}
												<span class="opacity-60">N/A</span>
											{/if}
										</td>
										<td class="px-6 py-4 text-right">
											<button
												class="btn btn-sm btn-primary"
												on:click={() => viewJobRun(job.id || 0)}
											>
												View Details
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

