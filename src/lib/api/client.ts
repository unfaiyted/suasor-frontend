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
			// console.log('setting tokens', accessToken, refreshToken);
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
	console.log('Client logout called - clearing tokens');

	// Browser check to prevent server-side errors
	if (typeof window === 'undefined') {
		console.log('Running on server - skipping localStorage operations');
		return;
	}

	let refreshToken = null;

	// Get refreshToken safely
	try {
		refreshToken = localStorage.getItem('suasor_refresh_token');
	} catch (err) {
		console.error('Error accessing localStorage for refresh token:', err);
	}

	// Clear localStorage first to prevent any race conditions
	try {
		console.log('Clearing localStorage items');
		localStorage.removeItem('suasor_access_token');
		localStorage.removeItem('suasor_refresh_token');
		localStorage.removeItem('suasor_expires_at');
		localStorage.removeItem('suasor_user');
	} catch (err) {
		console.error('Error clearing localStorage:', err);
	}

	// Now attempt the API call if we had a token
	if (refreshToken) {
		try {
			// console.log('Calling logout API endpoint');
			await createBasicClient().POST('/auth/logout', {
				body: { refreshToken }
			});
			console.log('Logout API call successful');
		} catch (e) {
			// Continue with logout even if API call fails
			console.error('Logout API call failed', e);
		}
	}

	// Double-check that localStorage is cleared
	try {
		// Try to clear again just to be sure
		localStorage.clear();
		console.log('Logout complete, localStorage cleared');
	} catch (err) {
		console.error('Error in final localStorage cleanup:', err);
	}
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
	// Check for browser environment first
	if (typeof window === 'undefined') {
		return false;
	}

	let token, expiresAt;

	try {
		token = localStorage.getItem('suasor_access_token');
		expiresAt = localStorage.getItem('suasor_expires_at');
	} catch (err) {
		console.error('Error accessing localStorage in isAuthenticated:', err);
		return false;
	}

	if (!token || !expiresAt) return false;

	const now = Math.floor(Date.now() / 1000);
	return parseInt(expiresAt, 10) > now;
};

export const getCurrentUser = () => {
	// Check for browser environment first
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const userStr = localStorage.getItem('suasor_user');
		return userStr ? JSON.parse(userStr) : null;
	} catch (err) {
		console.error('Error accessing localStorage in getCurrentUser:', err);
		return null;
	}
};

// Auth wrapper for API calls
export const withAuth = async <T>(apiCall: () => Promise<T>): Promise<T> => {
	// Check for browser environment
	if (typeof window === 'undefined') {
		console.log('Running on server - skipping token operations');
		return apiCall();
	}

	let refreshTokenValue = null;

	try {
		// Check for token expiration
		refreshTokenValue = localStorage.getItem('suasor_refresh_token');
		if (!isAuthenticated() && refreshTokenValue) {
			console.log('Token expired but refresh token available, attempting refresh');
			try {
				await refreshToken();
			} catch (e) {
				// If refresh fails, clear tokens safely
				try {
					localStorage.clear();
				} catch (clearErr) {
					console.error('Error clearing localStorage after failed refresh:', clearErr);
				}
				console.log('Removed invalid tokens after failed refresh');
				throw e;
			}
		}
	} catch (err) {
		console.error('Error checking authentication state:', err);
	}

	try {
		return await apiCall();
	} catch (error: any) {
		// Handle 401 errors by trying to refresh the token
		try {
			const hasRefreshToken = localStorage.getItem('suasor_refresh_token');
			if (error.status === 401 && hasRefreshToken) {
				try {
					await refreshToken();
					return await apiCall();
				} catch (refreshError) {
					// If refresh fails, clear tokens safely
					try {
						localStorage.clear();
					} catch (clearErr) {
						console.error('Error clearing localStorage after failed refresh retry:', clearErr);
					}
					throw refreshError;
				}
			}
		} catch (storageErr) {
			console.error('Error accessing localStorage in error handler:', storageErr);
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
	// Log FormData being sent
	if (params?.body instanceof FormData) {
		console.log('Sending FormData to:', path);
		// No need to manually set Content-Type for FormData - browser handles it
	}
	
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
