// src/lib/stores/user.ts
import { derived } from 'svelte/store';
import { browser } from '$app/environment';
import { createBaseStore, createCache, type BaseApiState } from './base';
import { GET, PUT, POST, DELETE, API_BASE_URL } from '$lib/api/client';
import type { UserResponse, ErrorResponse } from '$lib/api/types';

// Define user store state
export interface UserState extends BaseApiState {
  // Current user (also available in auth store)
  currentUser: UserResponse | null;
  
  // User list (admin only)
  users: UserResponse[];
  
  // Success message for feedback
  success: string | null;

  // Pagination
  page: number;
  totalPages: number;
  totalUsers: number;
}

// Initial state
const initialUserState: UserState = {
  loading: false,
  error: null,
  currentUser: null,
  users: [],
  success: null,
  page: 1,
  totalPages: 1,
  totalUsers: 0
};

// Create the user store
const userStore = createBaseStore<UserState>(initialUserState);

// Create a cache for user data
const userCache = createCache<any>();

// Enhanced store with user-specific operations
export const userApi = {
  ...userStore,

  // Load current user profile
  async loadCurrentUser() {
    // First check cache
    const cachedUser = userCache.get('user:current');
    if (cachedUser) {
      userStore.update((state) => ({
        ...state,
        currentUser: cachedUser
      }));
      return cachedUser;
    }

    userStore.setLoading(true);

    try {
      const response = await GET('/users/profile');

      if (response.data?.data) {
        const userData = response.data.data;
        
        // Normalize the avatar URL if present
        if (userData.avatar) {
          userData.avatar = normalizeAvatarUrl(userData.avatar);
        }
        
        // Log the user data with normalized avatar path
        console.log('Loaded user profile, normalized avatar path:', userData.avatar);

        userStore.update((state) => ({
          ...state,
          currentUser: userData,
          loading: false
        }));

        // Cache the results
        userCache.set('user:current', userData);

        return userData;
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (err) {
      userStore.setError(err);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<UserResponse>) {
    userStore.setLoading(true);

    try {
      const response = await PUT('/users/profile', {
        body: userData
      });

      if (response.data?.data) {
        const userData = response.data.data;
        
        // Normalize avatar URL if present
        if (userData.avatar) {
          userData.avatar = normalizeAvatarUrl(userData.avatar);
        }
        
        userStore.update((state) => ({
          ...state,
          currentUser: userData,
          loading: false,
          success: 'Profile updated successfully'
        }));

        // Invalidate cache
        userCache.invalidate('user:current');

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          userStore.update((state) => ({
            ...state,
            success: null
          }));
        }, 3000);

        return response.data.data;
      } else {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      userStore.setError(err);
      return null;
    }
  },

  // Upload user avatar
  async uploadAvatar(file: File) {
    userStore.setLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await POST('/users/avatar', {
        body: formData
      });

      if (response.data?.data) {
        const avatarPath = response.data.data.filePath;
        
        // Normalize the avatar URL
        const normalizedAvatarPath = normalizeAvatarUrl(avatarPath);
        console.log('Avatar uploaded successfully, path:', avatarPath);
        console.log('Normalized avatar path:', normalizedAvatarPath);
        
        // Update the current user with the new avatar path
        if (userStore.getState().currentUser) {
          const updatedUser = {
            ...userStore.getState().currentUser!,
            avatar: normalizedAvatarPath
          };
          
          userStore.update((state) => ({
            ...state,
            currentUser: updatedUser,
            loading: false,
            success: 'Avatar uploaded successfully'
          }));

          // Invalidate cache
          userCache.invalidate('user:current');
          
          // Log the new state to verify correct update
          console.log('User state updated with new avatar:', userStore.getState().currentUser);
        }

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          userStore.update((state) => ({
            ...state,
            success: null
          }));
        }, 3000);

        return avatarPath;
      } else {
        throw new Error(response.error?.message || 'Failed to upload avatar');
      }
    } catch (err) {
      userStore.setError(err);
      return null;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    userStore.setLoading(true);

    try {
      const response = await PUT('/users/password', {
        body: { currentPassword, newPassword }
      });

      if (response.data) {
        userStore.update((state) => ({
          ...state,
          loading: false,
          success: 'Password changed successfully'
        }));

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          userStore.update((state) => ({
            ...state,
            success: null
          }));
        }, 3000);

        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to change password');
      }
    } catch (err) {
      userStore.setError(err);
      return false;
    }
  },

  // Admin functions

  // Get all users (admin only)
  async getUsers(page = 1, limit = 10) {
    // Check cache first
    const cacheKey = `users:list:${page}:${limit}`;
    const cachedUsers = userCache.get(cacheKey);
    if (cachedUsers) {
      userStore.update((state) => ({
        ...state,
        users: cachedUsers.users,
        totalPages: cachedUsers.totalPages,
        totalUsers: cachedUsers.totalUsers,
        page
      }));
      return cachedUsers.users;
    }

    userStore.setLoading(true);

    try {
      const response = await GET('/admin/users', {
        params: { query: { page, limit } }
      });

      if (response.data?.data) {
        const { users, totalPages, totalUsers } = response.data.data;

        userStore.update((state) => ({
          ...state,
          users,
          totalPages,
          totalUsers,
          page,
          loading: false
        }));

        // Cache the results
        userCache.set(cacheKey, { users, totalPages, totalUsers });

        return users;
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err) {
      userStore.setError(err);
      return [];
    }
  },

  // Get user by ID (admin only)
  async getUserById(id: number) {
    // Check cache first
    const cacheKey = `user:${id}`;
    const cachedUser = userCache.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    userStore.setLoading(true);

    try {
      const response = await GET(`/admin/users/${id}`);

      if (response.data?.data) {
        const userData = response.data.data;
        
        // Cache the results
        userCache.set(cacheKey, userData);
        
        userStore.setLoading(false);
        return userData;
      } else {
        throw new Error(`Failed to load user with ID ${id}`);
      }
    } catch (err) {
      userStore.setError(err);
      return null;
    }
  },

  // Change user role (admin only)
  async changeUserRole(userId: number, role: 'user' | 'admin') {
    userStore.setLoading(true);

    try {
      const response = await PUT(`/admin/users/${userId}/role`, {
        body: { role }
      });

      if (response.data?.data) {
        // Update the user in the list if it exists
        userStore.update((state) => {
          const updatedUsers = state.users.map((user) => 
            user.id === userId ? { ...user, role } : user
          );
          
          return {
            ...state,
            users: updatedUsers,
            loading: false,
            success: `User role changed to ${role}`
          };
        });

        // Invalidate caches
        userCache.invalidate(`user:${userId}`);
        userCache.invalidatePattern(/^users:list:/);

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          userStore.update((state) => ({
            ...state,
            success: null
          }));
        }, 3000);

        return response.data.data;
      } else {
        throw new Error(response.error?.message || 'Failed to change user role');
      }
    } catch (err) {
      userStore.setError(err);
      return null;
    }
  },

  // Activate user (admin only)
  async activateUser(userId: number) {
    userStore.setLoading(true);

    try {
      const response = await POST(`/admin/users/${userId}/activate`);

      if (response.data?.data) {
        // Update the user in the list if it exists
        userStore.update((state) => {
          const updatedUsers = state.users.map((user) => 
            user.id === userId ? { ...user, active: true } : user
          );
          
          return {
            ...state,
            users: updatedUsers,
            loading: false,
            success: 'User activated successfully'
          };
        });

        // Invalidate caches
        userCache.invalidate(`user:${userId}`);
        userCache.invalidatePattern(/^users:list:/);

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          userStore.update((state) => ({
            ...state,
            success: null
          }));
        }, 3000);

        return response.data.data;
      } else {
        throw new Error(response.error?.message || 'Failed to activate user');
      }
    } catch (err) {
      userStore.setError(err);
      return null;
    }
  },

  // Deactivate user (admin only)
  async deactivateUser(userId: number) {
    userStore.setLoading(true);

    try {
      const response = await POST(`/admin/users/${userId}/deactivate`);

      if (response.data?.data) {
        // Update the user in the list if it exists
        userStore.update((state) => {
          const updatedUsers = state.users.map((user) => 
            user.id === userId ? { ...user, active: false } : user
          );
          
          return {
            ...state,
            users: updatedUsers,
            loading: false,
            success: 'User deactivated successfully'
          };
        });

        // Invalidate caches
        userCache.invalidate(`user:${userId}`);
        userCache.invalidatePattern(/^users:list:/);

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          userStore.update((state) => ({
            ...state,
            success: null
          }));
        }, 3000);

        return response.data.data;
      } else {
        throw new Error(response.error?.message || 'Failed to deactivate user');
      }
    } catch (err) {
      userStore.setError(err);
      return null;
    }
  },

  // Delete user (admin only)
  async deleteUser(userId: number) {
    userStore.setLoading(true);

    try {
      const response = await DELETE(`/admin/users/${userId}`);

      if (response.status === 204 || response.data) {
        // Remove user from the list if it exists
        userStore.update((state) => {
          const updatedUsers = state.users.filter((user) => user.id !== userId);
          
          return {
            ...state,
            users: updatedUsers,
            loading: false,
            success: 'User deleted successfully'
          };
        });

        // Invalidate caches
        userCache.invalidate(`user:${userId}`);
        userCache.invalidatePattern(/^users:list:/);

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          userStore.update((state) => ({
            ...state,
            success: null
          }));
        }, 3000);

        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to delete user');
      }
    } catch (err) {
      userStore.setError(err);
      return false;
    }
  },

  // Search users (admin only)
  async searchUsers(query: string, page = 1, limit = 10) {
    userStore.setLoading(true);

    try {
      const response = await GET('/admin/users/search', {
        params: { query: { q: query, page, limit } }
      });

      if (response.data?.data) {
        const { users, totalPages, totalUsers } = response.data.data;

        userStore.update((state) => ({
          ...state,
          users,
          totalPages,
          totalUsers,
          page,
          loading: false
        }));

        return users;
      } else {
        throw new Error('Failed to search users');
      }
    } catch (err) {
      userStore.setError(err);
      return [];
    }
  },

  // Reset state
  resetState() {
    userStore.reset();
  }
};

// Create derived stores for easier component access
export const currentUser = derived(userStore, ($state) => $state.currentUser);
export const users = derived(userStore, ($state) => $state.users);
export const userLoading = derived(userStore, ($state) => $state.loading);
export const userError = derived(userStore, ($state) => $state.error);
export const userSuccess = derived(userStore, ($state) => $state.success);
export const userPage = derived(userStore, ($state) => $state.page);
export const userTotalPages = derived(userStore, ($state) => $state.totalPages);
export const userTotalCount = derived(userStore, ($state) => $state.totalUsers);

/**
 * Helper function to ensure avatar URLs are correctly formatted with the API base URL
 * @param avatarUrl The avatar URL from the API
 * @returns Properly formatted avatar URL
 */
export function normalizeAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null;
  
  // If it's already a full URL with http/https, return it as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // If it's just a path starting with /, prefix it with API base URL
  if (avatarUrl.startsWith('/')) {
    // Extract base domain from API URL (remove /api/v1 or other path components)
    const baseUrlParts = API_BASE_URL.split('/');
    const baseUrl = baseUrlParts.slice(0, 3).join('/'); // Get http(s)://domain.com part
    return `${baseUrl}${avatarUrl}`;
  }
  
  // Otherwise, it might be a relative path - prefix with full API path
  return `${API_BASE_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
}

// Initialize the user store if we're in browser environment
if (browser) {
  // Check if there's user data in the auth store, if so, initialize our store
  const userStr = localStorage.getItem('suasor_user');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      console.log('Initializing user store from localStorage:', userData);
      
      // Ensure avatar URL is normalized
      if (userData.avatar) {
        userData.avatar = normalizeAvatarUrl(userData.avatar);
      }
      
      userStore.update(state => ({
        ...state,
        currentUser: userData
      }));
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
}

// Export the API and store
export default userApi;