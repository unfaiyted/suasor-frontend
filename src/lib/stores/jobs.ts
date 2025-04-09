import { writable, derived } from 'svelte/store';
import { jobService, type JobRun, type JobSchedule, JobStatus } from '$lib/api/jobService';

// Create stores
export const jobSchedules = writable<JobSchedule[]>([]);
export const recentJobRuns = writable<JobRun[]>([]);
export const activeJobRuns = writable<JobRun[]>([]);
export const isJobsLoading = writable<boolean>(false);
export const jobsError = writable<string | null>(null);
export const selectedJobRun = writable<JobRun | null>(null);

// Derived store for job stats
export const jobStats = derived(recentJobRuns, ($recentJobRuns) => {
  const totalJobs = $recentJobRuns.length;
  const completedJobs = $recentJobRuns.filter(job => job.status === JobStatus.JobStatusCompleted).length;
  const failedJobs = $recentJobRuns.filter(job => job.status === JobStatus.JobStatusFailed).length;
  const pendingJobs = $recentJobRuns.filter(job => job.status === JobStatus.JobStatusPending).length;
  const runningJobs = $recentJobRuns.filter(job => job.status === JobStatus.JobStatusRunning).length;
  
  return {
    totalJobs,
    completedJobs,
    failedJobs,
    pendingJobs,
    runningJobs,
    successRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
  };
});

// Load data functions
export const loadJobSchedules = async () => {
  isJobsLoading.set(true);
  jobsError.set(null);
  
  try {
    const schedules = await jobService.getAllJobSchedules();
    jobSchedules.set(schedules);
  } catch (error) {
    console.error('Failed to load job schedules:', error);
    jobsError.set('Failed to load job schedules');
  } finally {
    isJobsLoading.set(false);
  }
};

export const loadRecentJobRuns = async (limit = 50) => {
  isJobsLoading.set(true);
  jobsError.set(null);
  
  try {
    const runs = await jobService.getRecentJobRuns(limit);
    recentJobRuns.set(runs);
  } catch (error) {
    console.error('Failed to load recent job runs:', error);
    jobsError.set('Failed to load recent job runs');
  } finally {
    isJobsLoading.set(false);
  }
};

export const loadActiveJobRuns = async () => {
  isJobsLoading.set(true);
  jobsError.set(null);
  
  try {
    const runs = await jobService.getActiveJobRuns();
    activeJobRuns.set(runs);
  } catch (error) {
    console.error('Failed to load active job runs:', error);
    jobsError.set('Failed to load active job runs');
  } finally {
    isJobsLoading.set(false);
  }
};

export const runJob = async (name: string) => {
  isJobsLoading.set(true);
  jobsError.set(null);
  
  try {
    await jobService.runJobManually(name);
    // Refresh both active jobs and recent jobs
    await Promise.all([loadActiveJobRuns(), loadRecentJobRuns()]);
  } catch (error) {
    console.error(`Failed to run job '${name}':`, error);
    jobsError.set(`Failed to run job '${name}'`);
  } finally {
    isJobsLoading.set(false);
  }
};

export const updateJobSchedule = async (schedule: JobSchedule) => {
  isJobsLoading.set(true);
  jobsError.set(null);
  
  try {
    await jobService.updateJobSchedule({
      jobName: schedule.jobName || '',
      frequency: schedule.frequency || '',
      enabled: schedule.enabled || false
    });
    await loadJobSchedules();
  } catch (error) {
    console.error('Failed to update job schedule:', error);
    jobsError.set('Failed to update job schedule');
  } finally {
    isJobsLoading.set(false);
  }
};

// Polling for active jobs
let pollingInterval: number | null = null;

export const startJobPolling = (interval = 5000) => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  // Load immediately
  loadActiveJobRuns();
  
  // Set up polling
  pollingInterval = window.setInterval(async () => {
    await loadActiveJobRuns();
    
    // Also update the selected job if one is selected
    let selected: JobRun | null = null;
    // Get current value of selectedJobRun using subscribe
    const unsubscribe = selectedJobRun.subscribe(value => {
      selected = value;
    });
    unsubscribe(); // Immediately unsubscribe
    
    if (selected) {
      try {
        const updated = await jobService.getJobRunProgress(selected.id || 0);
        if (updated) {
          selectedJobRun.set(updated);
        }
      } catch (error) {
        console.error('Failed to update selected job:', error);
      }
    }
  }, interval);
  
  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
};

export const stopJobPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Helper to get job info by name
export const getJobScheduleByName = (name: string): JobSchedule | undefined => {
  let schedules: JobSchedule[] = [];
  const unsubscribe = jobSchedules.subscribe(value => {
    schedules = value;
  });
  
  // Unsubscribe immediately after getting the value
  unsubscribe();
  
  return schedules.find(schedule => schedule.jobName === name);
};

// Don't load immediately - let components handle this when they mount
// This prevents potential duplicate loads and race conditions