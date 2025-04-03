// src/lib/api/errors.ts
import type { ErrorResponse } from './types';
import { ModelsErrorType } from './types';

export class ApiError extends Error {
	type: ModelsErrorType;
	details: unknown;
	statusCode: number | undefined;
	requestId?: string;
	timestamp?: string;
	status: number;

	constructor(errorResponse: ErrorResponse, status: number = 500) {
		super(errorResponse?.message || 'Unknown API error');
		this.name = 'ApiError';
		this.type = errorResponse?.type || ModelsErrorType.ErrorTypeInternalError;
		this.details = errorResponse?.details || {};
		this.statusCode = errorResponse?.statusCode;
		this.requestId = errorResponse?.request_id;
		this.timestamp = errorResponse?.timestamp;
		this.status = status;

		// Ensure proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, ApiError.prototype);
	}
}
