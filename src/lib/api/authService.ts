import { GET, POST, PUT } from './client';
import type { components } from './suasor.v1.d';

// Since the API definition doesn't explicitly have these types, we'll define them here
// based on their expected shapes

export type AuthData = components['schemas']['responses.AuthDataResponse'];

export type UserResponse = components['schemas']['responses.UserResponse'];

export type LoginRequest = components['schemas']['requests.LoginRequest'];
export type LogoutRequest = components['schemas']['requests.LogoutRequest'];
export type RefreshTokenRequest = components['schemas']['requests.RefreshTokenRequest'];
export type RegisterRequest = components['schemas']['requests.RegisterRequest'];
export type ChangePasswordRequest = components['schemas']['requests.ChangePasswordRequest'];
export type ForgotPasswordRequest = components['schemas']['requests.ForgotPasswordRequest'];
export type ResetPasswordRequest = components['schemas']['requests.ResetPasswordRequest'];
export type UpdateUserRequest = components['schemas']['requests.UpdateUserRequest'];
export type UpdateUserProfileRequest = components['schemas']['requests.UpdateUserRequest'];

export type APIUserResponse = components['schemas']['responses.APIResponse-responses_UserResponse'];
export type APIAuthDataResponse =
	components['schemas']['responses.APIResponse-responses_AuthDataResponse'];

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
		console.warn(
			'updateUserProfile: This is a mock implementation. Update with actual API endpoint'
		);
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

