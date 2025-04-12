import { GET, POST, PUT } from './client';
import type { components } from './suasor.v1.d';

// Import the enums from the generated API types
import { ModelsJobStatus as JobStatus, ModelsJobType as JobType } from './suasor.v1.d';

// Types
type JobRun = components['schemas']['models.JobRun'];
type JobSchedule = components['schemas']['models.JobSchedule'];
type MediaSyncJob = components['schemas']['models.MediaSyncJob'];

// Service Functions
export const jobService = {
	// Job Schedules
	getAllJobSchedules: async (): Promise<JobSchedule[]> => {
		const response = await GET('/jobs/schedules');
		return response.data?.data || [];
	},

	getJobScheduleByName: async (name: string): Promise<JobSchedule | null> => {
		const response = await GET(`/jobs/schedules/{name}`, {
			params: {
				path: { name }
			}
		});
		return response.data?.data || null;
	},

	updateJobSchedule: async (schedule: {
		jobName: string;
		frequency: string;
		enabled: boolean;
	}): Promise<void> => {
		await PUT('/jobs/schedules', {
			body: schedule
		});
	},

	createJobSchedule: async (schedule: JobSchedule): Promise<JobSchedule> => {
		const response = await POST('/jobs/schedules', {
			body: schedule
		});
		return response.data?.data;
	},

	// Job Runs
	getRecentJobRuns: async (limit: number = 50): Promise<JobRun[]> => {
		const response = await GET('/jobs/runs', {
			params: {
				query: { limit }
			}
		});
		return response.data?.data || [];
	},

	getJobRunProgress: async (id: number): Promise<JobRun | null> => {
		const response = await GET(`/jobs/runs/{id}/progress`, {
			params: {
				path: { id }
			}
		});
		return response.data?.data || null;
	},

	getActiveJobRuns: async (): Promise<JobRun[]> => {
		const response = await GET('/jobs/active');
		return response.data?.data || [];
	},

	runJobManually: async (name: string): Promise<void> => {
		await POST(`/jobs/{name}/run`, {
			params: {
				path: { name }
			}
		});
	},

	// Media Sync Jobs
	getMediaSyncJobs: async (): Promise<MediaSyncJob[]> => {
		const response = await GET('/jobs/media-sync');
		return response.data?.data || [];
	},

	setupMediaSyncJob: async (request: {
		clientId: number;
		clientType: string;
		mediaType: string;
		frequency: string;
	}): Promise<void> => {
		await POST('/jobs/media-sync', {
			body: request
		});
	},

	runMediaSyncJob: async (request: { clientId: number; mediaType: string }): Promise<void> => {
		await POST('/jobs/media-sync/run', {
			body: request
		});
	}
};

export { JobStatus, JobType };
export type { JobRun, JobSchedule, MediaSyncJob };
