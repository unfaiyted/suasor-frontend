// Export all API services for easier imports

// Export original API definition for backward compatibility
export * as suasorApi from './suasor.v1';

// Base client
export { 
  API_BASE_URL,
  GET, POST, PUT, DELETE,
  login, logout, refreshToken, isAuthenticated, getCurrentUser
} from './client';

// Service exports
export { default as authService } from './authService';
export { default as mediaService } from './mediaService';
export { default as personService } from './personService';
export { default as clientService } from './clientService';
export { default as configService } from './configService';
export { default as searchService } from './searchService';
export { default as jobService, JobStatus, JobType } from './jobService';

// Re-export all types from types.ts for backward compatibility
export * from './types';