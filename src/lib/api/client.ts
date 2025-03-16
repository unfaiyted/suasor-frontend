// src/lib/api/client.ts
import createClient from 'openapi-fetch';
import type { paths as portusPaths } from './portus.v1';

const isDev = import.meta.env.DEV;

export const PORTUS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8181';

export const { GET, POST, PUT, DELETE } = createClient<portusPaths>({
	baseUrl: isDev ? 'http://localhost:6663/api/v1' : PORTUS_API_BASE_URL
});
