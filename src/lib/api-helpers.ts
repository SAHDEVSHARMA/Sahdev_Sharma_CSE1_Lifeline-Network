/**
 * API Helper functions for standardized responses
 */

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {})
  };
}

export function errorResponse(message: string): ApiResponse {
  return {
    success: false,
    message
  };
}

export function handleApiError(error: any, operation: string): ApiResponse {
  console.error(`Error in ${operation}:`, error);
  return errorResponse(`Server error ${operation}`);
} 