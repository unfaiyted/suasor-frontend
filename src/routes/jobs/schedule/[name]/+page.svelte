<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { 
    jobSchedules, 
    loadJobSchedules, 
    updateJobSchedule 
  } from '$lib/stores/jobs';
  import { jobService, JobStatus, JobType } from '$lib/api/jobService';
  import type { JobSchedule } from '$lib/api/jobService';
  import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
  
  // Get the job name from the URL
  const jobName = $page.params.name;
  
  // Local state
  let schedule = $state<JobSchedule | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let saving = $state(false);
  let saveSuccess = $state(false);
  
  // Form values
  let frequency = $state('');
  let enabled = $state(false);
  let config = $state<any>(null);
  
  
  // Format date
  function formatJobDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Never';
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
  
  // Save schedule changes
  async function saveSchedule() {
    if (!schedule || saving) return;
    
    saving = true;
    saveSuccess = false;
    error = null;
    
    try {
      // Update local schedule object with form values
      schedule.frequency = frequency;
      schedule.enabled = enabled;
      
      // Send update to server
      await updateJobSchedule(schedule);
      saveSuccess = true;
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        saveSuccess = false;
      }, 3000);
    } catch (err) {
      console.error('Failed to update job schedule:', err);
      error = 'Failed to update job schedule';
    } finally {
      saving = false;
    }
  }
  
  // Run the job manually
  async function runJob() {
    if (!schedule || saving) return;
    
    saving = true;
    error = null;
    
    try {
      await jobService.runJobManually(jobName);
      // Redirect to jobs list to view the running job
      goto('/jobs');
    } catch (err) {
      console.error('Failed to run job:', err);
      error = 'Failed to run job';
      saving = false;
    }
  }
  
  // Back to jobs list
  function backToJobs() {
    goto('/jobs');
  }
  
  // Load the job schedules and set up subscription
  onMount(async () => {
    let directLoad = false;
    
    // Load schedules if needed
    let currentSchedules: JobSchedule[] = [];
    const tempUnsub = jobSchedules.subscribe(val => {
      currentSchedules = val;
    });
    tempUnsub();
    
    if (currentSchedules.length === 0) {
      await loadJobSchedules();
    }
    
    // Set up subscription to schedules
    const unsubSchedules = jobSchedules.subscribe((schedules) => {
      const foundSchedule = schedules.find(s => s.jobName === jobName);
      if (foundSchedule) {
        schedule = foundSchedule;
        frequency = foundSchedule.frequency || '';
        enabled = foundSchedule.enabled || false;
        
        // Try to parse config
        if (foundSchedule.config) {
          try {
            config = JSON.parse(foundSchedule.config);
          } catch (err) {
            console.error('Failed to parse job config:', err);
            config = {};
          }
        }
        
        loading = false;
      } else if (!directLoad) {
        // If not found in store and we haven't tried direct loading yet,
        // try to load it directly from the API
        directLoad = true;
        
        jobService.getJobScheduleByName(jobName)
          .then(jobSchedule => {
            if (jobSchedule) {
              schedule = jobSchedule;
              frequency = jobSchedule.frequency || '';
              enabled = jobSchedule.enabled || false;
              
              // Try to parse config
              if (jobSchedule.config) {
                try {
                  config = JSON.parse(jobSchedule.config);
                } catch (err) {
                  console.error('Failed to parse job config:', err);
                  config = {};
                }
              }
            } else {
              error = 'Job schedule not found';
            }
            loading = false;
          })
          .catch(err => {
            console.error('Failed to load job schedule:', err);
            error = 'Failed to load job schedule';
            loading = false;
          });
      }
    });
    
    // Clean up function
    return () => {
      unsubSchedules();
    };
  });
</script>

<div class="container mx-auto max-w-3xl px-4 py-8">
  <div class="mb-8 flex items-center gap-3">
    <button class="btn btn-ghost rounded-full hover:bg-surface-300-700/20 transition-colors duration-200" on:click={backToJobs}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      <span class="ml-1">Back</span>
    </button>
    <div>
      <h1 class="text-2xl font-bold text-primary-500">Job Schedule Configuration</h1>
      <p class="text-sm text-surface-600-400 mt-1">Configure how this job runs and its scheduled frequency</p>
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
  {:else if schedule}
    <div class="card bg-surface-200-900 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
      <header class="bg-surface-300-700/50 px-6 py-4 border-b border-surface-300-700/20">
        <div class="flex items-center gap-3">
          <div class="bg-primary-500/15 p-2.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold">{schedule.jobName}</h2>
            <p class="text-sm text-surface-600-400 mt-0.5">
              Configure how this job runs and its schedule.
            </p>
          </div>
        </div>
      </header>
      
      <section class="p-6">
        <!-- Job Information -->
        <div class="bg-surface-300-700/20 mb-8 rounded-xl border border-surface-300-700/10 overflow-hidden">
          <header class="bg-surface-300-700/30 px-5 py-3 border-b border-surface-300-700/20">
            <h3 class="flex items-center gap-2 text-lg font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Job Information</span>
            </h3>
          </header>
          
          <section class="p-5">
            <div class="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-3">
              <div class="rounded-lg bg-surface-300-700/30 p-4">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">Job Type</h4>
                <p class="font-medium text-lg mt-2">
                  <span class="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-primary-500/20 text-primary-500">{schedule.jobType}</span>
                </p>
              </div>
              
              <div class="rounded-lg bg-surface-300-700/30 p-4">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">Last Run</h4>
                <p class="font-medium text-lg mt-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-surface-600-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {formatJobDate(schedule.lastRunTime)}
                </p>
              </div>
              
              {#if schedule.userId}
                <div class="rounded-lg bg-surface-300-700/30 p-4">
                  <h4 class="text-xs font-semibold uppercase tracking-wider text-surface-600-400">User ID</h4>
                  <p class="font-medium text-lg mt-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-surface-600-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {schedule.userId}
                  </p>
                </div>
              {/if}
            </div>
          </section>
        </div>
        
        <!-- Config Form -->
        <form on:submit|preventDefault={saveSchedule} class="space-y-8">
          <div class="bg-surface-300-700/20 rounded-xl border border-surface-300-700/10 overflow-hidden">
            <header class="bg-surface-300-700/30 px-5 py-3 border-b border-surface-300-700/20">
              <h3 class="flex items-center gap-2 text-lg font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>Schedule Configuration</span>
              </h3>
            </header>
            
            <section class="p-5 grid gap-8 md:grid-cols-2">
              <!-- Frequency -->
              <div class="space-y-2">
                <label class="flex flex-col space-y-2">
                  <span class="text-sm font-medium">Frequency</span>
                  <div class="relative">
                    <select 
                      class="w-full px-4 py-3 bg-surface-200-800 rounded-lg border border-surface-300-700/30 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" 
                      bind:value={frequency}
                    >
                      <option value="manual">Manual Only</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-600-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                  <span class="text-xs text-surface-600-400">How often this job should run automatically</span>
                </label>
              </div>
              
              <!-- Enabled -->
              <div class="bg-surface-300-700/10 p-4 rounded-lg border border-surface-300-700/5 flex flex-col justify-center">
                <label class="flex items-center">
                  <div class="relative inline-block w-10 mr-3 align-middle select-none">
                    <input 
                      type="checkbox" 
                      bind:checked={enabled}
                      class="absolute block w-6 h-6 transition-all duration-200 ease-in rounded-full appearance-none cursor-pointer checked:bg-primary-500 checked:right-0 top-0 checked:border-primary-500 bg-surface-400-600 border-surface-400-600 border-2"
                    >
                    <label 
                      class="block h-6 overflow-hidden bg-surface-800-200/50 border border-surface-700-300/10 rounded-full cursor-pointer"
                    ></label>
                  </div>
                  <div>
                    <span class="font-medium">{enabled ? 'Job Enabled' : 'Job Disabled'}</span>
                    <p class="text-xs text-surface-600-400 mt-0.5">
                      {#if enabled}
                        This job will run on schedule based on the frequency
                      {:else}
                        Job won't run automatically and requires manual triggering
                      {/if}
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>
          
          <!-- Custom config for specific job types -->
          {#if config && Object.keys(config).length > 0}
            <div class="bg-surface-300-700/20 rounded-xl border border-surface-300-700/10 overflow-hidden">
              <header class="bg-surface-300-700/30 px-5 py-3 border-b border-surface-300-700/20">
                <h3 class="flex items-center gap-2 text-lg font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <span>Advanced Configuration</span>
                </h3>
              </header>
              
              <section class="p-5">
                <div class="bg-surface-200-800 rounded-lg border border-surface-300-700/20 p-5 overflow-auto">
                  <pre class="whitespace-pre-wrap font-mono text-sm text-surface-50-950">{JSON.stringify(config, null, 2)}</pre>
                </div>
                <div class="mt-4 flex items-center justify-start gap-2 text-surface-500-500 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p>Advanced configuration can only be edited via API</p>
                </div>
              </section>
            </div>
          {/if}
          
          <!-- Form Actions -->
          <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-6">
            <button 
              type="button" 
              class="btn btn-primary rounded-lg text-white px-6 py-3 h-auto {saving ? 'opacity-70' : 'hover:bg-primary-600'} flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-primary-500/20" 
              disabled={saving}
              on:click={runJob}
            >
              {#if saving}
                <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Run Job Now</span>
              {/if}
            </button>
            
            <div class="flex items-center gap-4">
              {#if saveSuccess}
                <div class="bg-success-500/20 border border-success-500/30 text-success-500 py-2 px-4 rounded-lg flex items-center gap-2 animate-fadeIn">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-medium">Changes saved successfully!</span>
                </div>
              {/if}
              
              <button 
                type="submit" 
                class="btn bg-surface-700-300 hover:bg-surface-800-200 text-white rounded-lg px-6 py-3 h-auto flex items-center justify-center gap-2 transition-all duration-200 shadow-lg" 
                disabled={saving}
              >
                {#if saving}
                  <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>Save Configuration</span>
                {/if}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  {:else}
    <div class="alert bg-warning-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-surface-50" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Job schedule not found</span>
    </div>
  {/if}
</div>