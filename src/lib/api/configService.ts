import { GET, PUT } from './client';
import type { components } from './suasor.v1.d';
import { 
  ModelsUserConfigRecommendationStrategy, 
  ModelsUserConfigRecommendationSyncFrequency 
} from './suasor.v1.d';

// Enums
export type RecommendationStrategy = ModelsUserConfigRecommendationStrategy;
export type RecommendationFrequency = ModelsUserConfigRecommendationSyncFrequency;
export type SyncFrequency = ModelsUserConfigRecommendationSyncFrequency;
export { 
  ModelsUserConfigRecommendationStrategy, 
  ModelsUserConfigRecommendationSyncFrequency 
};

// Types
export type UserConfig = components['schemas']['models.UserConfig'];
export type Configuration = components['schemas']['types.Configuration'];
export type SystemConfig = components['schemas']['models.SystemConfig'];
export type UpdateUserConfigRequest = components['schemas']['requests.UpdateUserConfigRequest'];
export type UpdateSystemConfigRequest = components['schemas']['requests.UpdateSystemConfigRequest'];

// Response types
export type APIUserConfigResponse = components['schemas']['responses.APIResponse-models_UserConfig'];
export type APISystemConfigResponse = components['schemas']['responses.APIResponse-models_SystemConfig'];
export type APIConfigurationResponse = components['schemas']['responses.APIResponse-types_Configuration'];

// Service Functions
export const configService = {
  // User Configuration
  getUserConfig: async (): Promise<UserConfig> => {
    const response = await GET('/config/user');
    return response.data?.data;
  },
  
  updateUserConfig: async (config: UpdateUserConfigRequest): Promise<UserConfig> => {
    const response = await PUT('/config/user', {
      body: config
    });
    return response.data?.data;
  },
  
  // System Configuration
  getSystemConfig: async (): Promise<SystemConfig> => {
    const response = await GET('/config/system');
    return response.data?.data;
  },
  
  updateSystemConfig: async (config: UpdateSystemConfigRequest): Promise<SystemConfig> => {
    const response = await PUT('/config/system', {
      body: config
    });
    return response.data?.data;
  },
  
  // General Configuration
  getConfiguration: async (): Promise<Configuration> => {
    const response = await GET('/config');
    return response.data?.data;
  }
};

export default configService;