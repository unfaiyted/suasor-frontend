// src/lib/api/client.ts
import createClient from 'openapi-fetch';
import type { paths as suasorPaths } from './suasor.v1';

// Define custom type helpers for path constraints
type PathWithGet = {
	[P in keyof suasorPaths]: suasorPaths[P] extends { get: any } ? P : never;
}[keyof suasorPaths];

type PathWithPost = {
	[P in keyof suasorPaths]: suasorPaths[P] extends { post: any } ? P : never;
}[keyof suasorPaths];

type PathWithPut = {
	[P in keyof suasorPaths]: suasorPaths[P] extends { put: any } ? P : never;
}[keyof suasorPaths];

type PathWithDelete = {
	[P in keyof suasorPaths]: suasorPaths[P] extends { delete: any } ? P : never;
}[keyof suasorPaths];

const isDev = import.meta.env.DEV;

const SUASOR_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8181';
export const API_BASE_URL = isDev ? 'http://localhost:8080/api/v1' : SUASOR_API_BASE_URL;

// Create a basic client without auth
const createBasicClient = () => {
	return createClient<suasorPaths>({
		baseUrl: API_BASE_URL
	});
};

// Create a client that dynamically adds auth headers
export const createAuthenticatedClient = () => {
	const token = localStorage.getItem('suasor_access_token');

	console.log('created auth client with ', token);

	return createClient<suasorPaths>({
		baseUrl: API_BASE_URL,
		headers: token
			? {
					Authorization: `Bearer ${token}`
				}
			: undefined
	});
};

// Auth functions
export const login = async (email: string, password: string) => {
	const client = createBasicClient();
	const response = await client.POST('/auth/login', {
		body: { email, password }
	});

	if (response.data?.data) {
		const { accessToken, refreshToken, expiresAt, user } = response.data.data;
		if (accessToken && refreshToken) {
			console.log('setting tokens', accessToken, refreshToken);
			localStorage.setItem('suasor_access_token', accessToken);
			localStorage.setItem('suasor_refresh_token', refreshToken);
			localStorage.setItem('suasor_expires_at', expiresAt?.toString() || '0');
			localStorage.setItem('suasor_user', JSON.stringify(user));
			return response.data.data;
		}
	}

	throw new Error(response.error?.message || 'Login failed');
};

export const logout = async () => {
	const refreshToken = localStorage.getItem('suasor_refresh_token');
	if (refreshToken) {
		try {
			await createAuthenticatedClient().POST('/auth/logout', {
				body: { refreshToken }
			});
		} catch (e) {
			// Continue with logout even if API call fails
			console.error('Logout API call failed', e);
		}
	}

	localStorage.removeItem('suasor_access_token');
	localStorage.removeItem('suasor_refresh_token');
	localStorage.removeItem('suasor_expires_at');
	localStorage.removeItem('suasor_user');
};

export const refreshToken = async () => {
	const refresh = localStorage.getItem('suasor_refresh_token');
	if (!refresh) {
		throw new Error('No refresh token available');
	}

	const client = createBasicClient();
	const response = await client.POST('/auth/refresh', {
		body: { refreshToken: refresh }
	});

	if (response.data?.data) {
		const { accessToken, refreshToken, expiresAt, user } = response.data.data;
		if (accessToken && refreshToken) {
			localStorage.setItem('suasor_access_token', accessToken);
			localStorage.setItem('suasor_refresh_token', refreshToken);
			localStorage.setItem('suasor_expires_at', expiresAt?.toString() || '0');
			localStorage.setItem('suasor_user', JSON.stringify(user));
			return response.data.data;
		}
	}

	throw new Error(response.error?.message || 'Token refresh failed');
};

export const isAuthenticated = () => {
	const token = localStorage.getItem('suasor_access_token');
	const expiresAt = localStorage.getItem('suasor_expires_at');

	if (!token || !expiresAt) return false;

	const now = Math.floor(Date.now() / 1000);
	return parseInt(expiresAt, 10) > now;
};

export const getCurrentUser = () => {
	const userStr = localStorage.getItem('suasor_user');
	return userStr ? JSON.parse(userStr) : null;
};

// Auth wrapper for API calls
export const withAuth = async <T>(apiCall: () => Promise<T>): Promise<T> => {
	// Check for token expiration
	if (!isAuthenticated() && localStorage.getItem('suasor_refresh_token')) {
		console.log('not-authenticationed', localStorage.getItem('suasor_refresh_token'));
		try {
			await refreshToken();
		} catch (e) {
			// If refresh fails, clear tokens
			localStorage.removeItem('suasor_access_token');
			localStorage.removeItem('suasor_refresh_token');
			localStorage.removeItem('suasor_expires_at');
			localStorage.removeItem('suasor_user');
			console.log('removing invalid item');
			throw e;
		}
	}

	try {
		return await apiCall();
	} catch (error: any) {
		// Handle 401 errors by trying to refresh the token
		if (error.status === 401 && localStorage.getItem('suasor_refresh_token')) {
			try {
				await refreshToken();
				return await apiCall();
			} catch (refreshError) {
				// If refresh fails, clear tokens
				localStorage.removeItem('suasor_access_token');
				localStorage.removeItem('suasor_refresh_token');
				localStorage.removeItem('suasor_expires_at');
				localStorage.removeItem('suasor_user');
				throw refreshError;
			}
		}
		throw error;
	}
};

// Export authenticated API methods with proper path constraints
export const GET = async <P extends PathWithGet>(path: P, params?: any, skipAuth = false) => {
	console.log('GET', path, 'skipAuth', skipAuth);
	if (skipAuth) {
		return createBasicClient().GET(path, params);
	}
	return withAuth(() => createAuthenticatedClient().GET(path, params));
};

export const POST = async <P extends PathWithPost>(path: P, params?: any, skipAuth = false) => {
	if (skipAuth) {
		return createBasicClient().POST(path, params);
	}
	return withAuth(() => createAuthenticatedClient().POST(path, params));
};

export const PUT = async <P extends PathWithPut>(path: P, params?: any, skipAuth = false) => {
	if (skipAuth) {
		return createBasicClient().PUT(path, params);
	}
	return withAuth(() => createAuthenticatedClient().PUT(path, params));
};

export const DELETE = async <P extends PathWithDelete>(path: P, params?: any, skipAuth = false) => {
	if (skipAuth) {
		return createBasicClient().DELETE(path, params);
	}
	return withAuth(() => createAuthenticatedClient().DELETE(path, params));
};
