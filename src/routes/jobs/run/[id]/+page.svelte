<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { selectedJobRun, startJobPolling, stopJobPolling } from '$lib/stores/jobs';
  import { jobService, JobStatus, JobType } from '$lib/api/jobService';
  import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
  
  // Get the job run ID from the URL
  const jobRunId = parseInt($page.params.id, 10);
  
  // Local state
  let job = $state(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  // Metadata display
  let metadata = $state<any>(null);
  
  // Format date
  function formatJobDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  // Duration between two dates
  function getDuration(startStr: string | null | undefined, endStr: string | null | undefined): string {
    if (!startStr) return 'N/A';
    
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date();
    
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes} min ${remainingSeconds} sec`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours} hr ${remainingMinutes} min ${remainingSeconds} sec`;
  }
  
  // Job status badge
  function getStatusBadge(status: string | undefined): string {
    if (!status) return 'badge-secondary';
    
    switch(status) {
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
  
  // Load job data
  async function loadJobRun() {
    try {
      loading = true;
      error = null;
      
      const jobRun = await jobService.getJobRunProgress(jobRunId);
      if (jobRun) {
        selectedJobRun.set(jobRun);
      } else {
        error = 'Job run not found';
      }
    } catch (err) {
      console.error('Failed to load job run:', err);
      error = 'Failed to load job run';
    } finally {
      loading = false;
    }
  }
  
  // Back to jobs list
  function backToJobs() {
    goto('/jobs');
  }
  
  // Initialize with job data and set up polling if the job is still running
  onMount(async () => {
    await loadJobRun();
    
    // Set up subscription to selected job
    const unsubJob = selectedJobRun.subscribe((selectedJob) => {
      job = selectedJob;
      
      // Parse metadata if available
      if (job?.metadata) {
        try {
          metadata = JSON.parse(job.metadata);
        } catch (err) {
          metadata = null;
          console.error('Failed to parse job metadata:', err);
        }
      }
      
      if (job) {
        loading = false;
      }
    });
    
    // If job is running, start polling for updates
    let cleanupPolling = null;
    if (job?.status === JobStatus.JobStatusRunning) {
      cleanupPolling = startJobPolling(3000);
    }
    
    // Clean up function
    return () => {
      unsubJob();
      if (cleanupPolling) {
        cleanupPolling();
      }
      selectedJobRun.set(null); // Clear selected job on navigate away
    };
  });
</script>

<div class="container mx-auto max-w-5xl px-4 py-8">
  <div class="mb-8 flex items-center gap-3">
    <button class="btn btn-ghost rounded-full hover:bg-surface-300-700/20 transition-colors duration-200" on:click={backToJobs}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      <span class="ml-1">Back</span>
    </button>
    <div>
      <h1 class="text-2xl font-bold text-primary-500">Job Run Details</h1>
      <p class="text-sm text-surface-600-400 mt-1">Viewing execution details and progress information</p>
    </div>
  </div>
  
  {#if loading}
    <div class="flex h-40 items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  {:else if error}
    <div class="alert bg-error-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-surface-50" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  {:else if job}
    <div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Basic info card -->
      <div class="card bg-surface-200-900 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
        <header class="bg-surface-300-700/50 px-6 py-4 border-b border-surface-300-700/20">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="bg-primary-500/15 p-2.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6.01" y2="6"></line>
                  <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold">{job.jobName}</h2>
                <p class="text-sm text-surface-600-400 mt-0.5">Job execution details</p>
              </div>
            </div>
            <div class="px-3 py-1 rounded-full text-sm font-medium bg-opacity-20 {getStatusBadge(job.status)}">
              {job.status}
            </div>
          </div>
        </header>
        
        <section class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-lg bg-surface-300-700/20 p-4 border border-surface-300-700/10">
              <p class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">Job Type</p>
              <p class="font-medium text-lg mt-2">
                <span class="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-primary-500/20 text-primary-500">{job.jobType}</span>
              </p>
            </div>
            
            <div class="rounded-lg bg-surface-300-700/20 p-4 border border-surface-300-700/10">
              <p class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">Job ID</p>
              <p class="font-medium text-lg mt-2">{job.id}</p>
            </div>
            
            <div class="rounded-lg bg-surface-300-700/20 p-4 border border-surface-300-700/10">
              <p class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">User</p>
              <p class="font-medium text-lg mt-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-surface-600-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {job.userId || 'System'}
              </p>
            </div>
            
            <div class="rounded-lg bg-surface-300-700/20 p-4 border border-surface-300-700/10">
              <p class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">Started</p>
              <p class="font-medium text-lg mt-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-surface-600-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {formatJobDate(job.startTime)}
              </p>
            </div>
            
            <div class="rounded-lg bg-surface-300-700/20 p-4 border border-surface-300-700/10">
              <p class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">Completed</p>
              {#if job.endTime}
                <p class="font-medium text-lg mt-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-surface-600-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {formatJobDate(job.endTime)}
                </p>
              {:else}
                <p class="font-medium text-lg mt-2 flex items-center gap-2 text-primary-500">
                  <span class="animate-pulse w-3 h-3 rounded-full bg-primary-500"></span>
                  Running...
                </p>
              {/if}
            </div>
            
            <div class="rounded-lg bg-surface-300-700/20 p-4 border border-surface-300-700/10">
              <p class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">Duration</p>
              <p class="font-medium text-lg mt-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-surface-600-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {getDuration(job.startTime, job.endTime)}
              </p>
            </div>
          </div>
          
          {#if job.status === JobStatus.JobStatusFailed && job.errorMessage}
            <div class="mt-8 bg-error-100-900/40 border border-error-200-800/20 p-5 rounded-xl">
              <div class="flex items-center gap-2 mb-3">
                <div class="bg-error-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-error-700-300">
                  Error Occurred
                </h3>
              </div>
              <div class="bg-error-900/10 border border-error-800/10 p-4 rounded-lg font-mono text-sm text-error-700-300 overflow-auto">
                {job.errorMessage}
              </div>
            </div>
          {/if}
        </section>
      </div>
      
      <!-- Progress card -->
      <div class="card bg-surface-200-900 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
        <header class="bg-surface-300-700/50 px-6 py-4 border-b border-surface-300-700/20">
          <div class="flex items-center gap-3">
            <div class="bg-primary-500/15 p-2.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold">Job Progress</h2>
              <p class="text-sm text-surface-600-400 mt-0.5">Execution progress and status</p>
            </div>
          </div>
        </header>
        
        <section class="p-6">
          {#if job.status === JobStatus.JobStatusRunning}
            <div class="bg-primary-100-900/20 border border-primary-300-700/20 rounded-xl p-5 mb-6">
              <div class="flex items-center justify-center gap-3">
                <div class="relative">
                  <div class="w-4 h-4 bg-primary-500 rounded-full opacity-75 animate-ping absolute"></div>
                  <div class="w-4 h-4 bg-primary-500 rounded-full relative"></div>
                </div>
                <div>
                  <p class="text-center text-lg font-bold text-primary-700-300">
                    Job is currently active and running
                  </p>
                  <p class="text-center text-sm text-primary-600-400">Status and progress updates will appear automatically</p>
                </div>
              </div>
            </div>
          {/if}
          
          <div class="bg-surface-300-700/20 p-5 rounded-xl border border-surface-300-700/10">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <p class="text-sm font-semibold uppercase tracking-wider text-surface-600-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
                Completion Progress
              </p>
              <p class="font-bold text-xl text-primary-500">{job.progress}%</p>
            </div>
            <div class="progress-container relative h-6 bg-surface-300-700/50 rounded-lg overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-6 bg-primary-500/30 rounded-lg transition-all duration-500 ease-out flex items-center justify-end px-2" 
                style="width: {job.progress}%"
              >
                <div 
                  class="absolute top-0 left-0 h-6 bg-primary-500 opacity-25 w-full rounded-lg {job.status === JobStatus.JobStatusRunning ? 'animate-pulse' : ''}"
                ></div>
              </div>
              <div class="absolute inset-0 grid place-items-center">
                <span class="text-xs font-semibold text-surface-50-950 drop-shadow-sm mix-blend-difference">
                  {job.progress}% Complete
                </span>
              </div>
            </div>
          </div>
          
          {#if job.totalItems > 0}
            <div class="mt-6 bg-surface-300-700/20 p-5 rounded-xl border border-surface-300-700/10">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-tertiary-500/15 p-1.5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-tertiary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                </div>
                <p class="text-sm font-semibold uppercase tracking-wider text-surface-600-400">Items Processing</p>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="bg-surface-200-800 p-5 text-center rounded-xl border border-surface-300-700/10 flex flex-col items-center justify-center">
                  <div class="text-sm font-medium text-surface-600-400 mb-2">Total Items</div>
                  <div class="text-3xl font-bold text-surface-50-950 mb-1">{job.totalItems}</div>
                  <div class="text-xs text-surface-600-400">Needs processing</div>
                </div>
                
                <div class="bg-surface-200-800 p-5 text-center rounded-xl border border-surface-300-700/10 flex flex-col items-center justify-center">
                  <div class="text-sm font-medium text-surface-600-400 mb-2">Processed Items</div>
                  <div class="text-3xl font-bold text-surface-50-950 mb-1">{job.processedItems}</div>
                  <div class="text-xs text-surface-600-400">{Math.round((job.processedItems / job.totalItems) * 100)}% of total completed</div>
                </div>
              </div>
            </div>
          {/if}
          
          {#if job.statusMessage}
            <div class="mt-6 bg-surface-300-700/20 p-5 rounded-xl border border-surface-300-700/10">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-surface-500/15 p-1.5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-surface-400-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <p class="text-sm font-semibold uppercase tracking-wider text-surface-600-400">Status Information</p>
              </div>
              
              <div class="bg-surface-200-800 p-4 font-medium rounded-xl border border-surface-300-700/10">
                {job.statusMessage}
              </div>
            </div>
          {/if}
        </section>
      </div>
    </div>
    
    <!-- Metadata card -->
    {#if metadata}
      <div class="card preset-filled-surface-200-900 shadow-xl backdrop-blur-sm">
        <header class="card-header bg-surface-300-700 border-b border-surface-300-700/20">
          <h2 class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span class="font-semibold">Job Metadata</span>
          </h2>
        </header>
        
        <section class="p-4">
          <div class="table-container">
            <table class="table table-hover">
              <thead class="bg-surface-300-700/50">
                <tr>
                  <th class="font-medium">Key</th>
                  <th class="font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {#each Object.entries(metadata) as [key, value]}
                  <tr class="hover:bg-surface-300-700/20 border-b border-surface-300-700/10">
                    <td class="font-medium">{key}</td>
                    <td>
                      {#if typeof value === 'object'}
                        <pre class="overflow-x-auto whitespace-pre-wrap font-mono text-xs p-2 bg-surface-300-700/30 rounded-lg">{JSON.stringify(value, null, 2)}</pre>
                      {:else}
                        {value}
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    {/if}
  {/if}
</div>