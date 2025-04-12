import { GET, POST, PUT } from './client';
import type { components } from './suasor.v1.d';

// Since the API definition doesn't explicitly have these types, we'll define them here
// based on their expected shapes

// Types
export interface User {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  user: User;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: string;
  password?: string;
}

export interface UpdateUserProfileRequest {
  username?: string;
  email?: string;
  avatar?: string;
}

// API Response types
export interface APIUserResponse {
  data: UserResponse;
  message?: string;
}

export interface APIAuthDataResponse {
  data: AuthData;
  message?: string;
}

export interface APIUsersResponse {
  data: User[];
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
}

// Service Functions
export const authService = {
  // Auth
  login: async (request: LoginRequest): Promise<AuthData> => {
    const response = await POST('/auth/login', {
      body: request
    });
    return response.data?.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await POST('/auth/logout', {
      body: { refreshToken }
    });
  },

  refreshToken: async (refreshToken: string): Promise<AuthData> => {
    const response = await POST('/auth/refresh', {
      body: { refreshToken }
    });
    return response.data?.data;
  },

  register: async (request: RegisterRequest): Promise<UserResponse> => {
    const response = await POST('/auth/register', {
      body: request
    });
    return response.data?.data;
  },

  // Users - Since we're not sure which endpoints are actually defined in the API,
  // we'll provide these as placeholders. You should modify the actual paths
  // based on what's available in your API.
  
  // This is a mock endpoint and should be updated to match your API
  getCurrentUser: async (): Promise<User> => {
    // Temporary implementation using whatever is in localStorage
    const userStr = localStorage.getItem('suasor_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw new Error('User not found in localStorage');
  },

  // Mock implementation - update with actual endpoint
  getAllUsers: async (): Promise<User[]> => {
    console.warn('getAllUsers: This is a mock implementation. Update with actual API endpoint');
    return [];
  },

  // Mock implementation - update with actual endpoint
  getUserById: async (id: number): Promise<User | null> => {
    console.warn('getUserById: This is a mock implementation. Update with actual API endpoint');
    return null;
  },

  // Mock implementation - update with actual endpoint
  updateUser: async (id: number, request: UpdateUserRequest): Promise<User> => {
    console.warn('updateUser: This is a mock implementation. Update with actual API endpoint');
    throw new Error('Not implemented');
  },

  // Mock implementation - update with actual endpoint
  updateUserProfile: async (request: UpdateUserProfileRequest): Promise<User> => {
    console.warn('updateUserProfile: This is a mock implementation. Update with actual API endpoint');
    throw new Error('Not implemented');
  },

  // Mock implementation - update with actual endpoint
  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    console.warn('changePassword: This is a mock implementation. Update with actual API endpoint');
    throw new Error('Not implemented');
  },

  // Mock implementation - update with actual endpoint
  forgotPassword: async (email: string): Promise<void> => {
    console.warn('forgotPassword: This is a mock implementation. Update with actual API endpoint');
    throw new Error('Not implemented');
  },

  // Mock implementation - update with actual endpoint
  resetPassword: async (request: ResetPasswordRequest): Promise<void> => {
    console.warn('resetPassword: This is a mock implementation. Update with actual API endpoint');
    throw new Error('Not implemented');
  }
};

export default authService;