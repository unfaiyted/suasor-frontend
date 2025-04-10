// src/lib/stores/user.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { userApi, currentUser } from './user';
import * as apiClient from '$lib/api/client';

// Mock the API client
vi.mock('$lib/api/client', () => {
  return {
    GET: vi.fn(),
    PUT: vi.fn(),
    POST: vi.fn(),
    DELETE: vi.fn()
  };
});

describe('User Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    userApi.resetState();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  it('should have the correct initial state', () => {
    const state = userApi.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.users).toEqual([]);
  });

  it('should load the current user', async () => {
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      username: 'testuser',
      role: 'user',
      avatar: '/path/to/avatar.jpg'
    };

    // Mock the API response
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: {
        data: mockUser
      }
    });

    // Call the method
    const result = await userApi.loadCurrentUser();

    // Check the API was called
    expect(apiClient.GET).toHaveBeenCalledWith('/users/profile');

    // Check the result
    expect(result).toEqual(mockUser);

    // Check the store state
    const state = userApi.getState();
    expect(state.currentUser).toEqual(mockUser);
    expect(state.loading).toBe(false);
    
    // Check the derived store
    expect(get(currentUser)).toEqual(mockUser);
  });

  it('should handle errors when loading the current user', async () => {
    const mockError = new Error('API error');
    
    // Mock the API response
    vi.mocked(apiClient.GET).mockRejectedValueOnce(mockError);

    // Call the method
    const result = await userApi.loadCurrentUser();

    // Check the API was called
    expect(apiClient.GET).toHaveBeenCalledWith('/users/profile');

    // Check the result
    expect(result).toBeNull();

    // Check the store state
    const state = userApi.getState();
    expect(state.currentUser).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeDefined();
    expect(state.error?.message).toContain('API error');
  });

  it('should update the user profile', async () => {
    const mockUser = {
      id: 1,
      email: 'updated@example.com',
      username: 'updateduser',
      role: 'user',
      avatar: '/path/to/new-avatar.jpg'
    };

    // Mock the API response
    vi.mocked(apiClient.PUT).mockResolvedValueOnce({
      data: {
        data: mockUser
      }
    });

    // Call the method
    const userData = {
      email: 'updated@example.com',
      username: 'updateduser'
    };
    
    const result = await userApi.updateProfile(userData);

    // Check the API was called
    expect(apiClient.PUT).toHaveBeenCalledWith('/users/profile', {
      body: userData
    });

    // Check the result
    expect(result).toEqual(mockUser);

    // Check the store state
    const state = userApi.getState();
    expect(state.currentUser).toEqual(mockUser);
    expect(state.loading).toBe(false);
    expect(state.success).toBe('Profile updated successfully');
  });

  // Add more tests for other methods as needed
});