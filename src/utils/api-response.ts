import { NextResponse } from 'next/server';

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return NextResponse.json(body, { status });
}

export function errorResponse(error: string, status = 400, details?: unknown) {
  const body: ApiErrorResponse = { success: false, error };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

export function createdResponse<T>(data: T, message?: string) {
  return successResponse(data, message, 201);
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
