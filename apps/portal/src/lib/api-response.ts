import { NextResponse } from 'next/server';

// Standard API response types - use shared package for consistency
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// Next.js-specific response helpers only
export function ok<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}

export function badRequest(error: string, details?: any): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  }, { status: 400 });
}

export function unauthorized(error: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  }, { status: 401 });
}

export function forbidden(error: string = 'Forbidden'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  }, { status: 403 });
}

export function notFound(error: string = 'Not found'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  }, { status: 404 });
}

export function tooManyRequests(error: string = 'Rate limit exceeded', retryAfter?: number): NextResponse<ApiResponse> {
  const response = NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  }, { status: 429 });
  
  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }
  
  return response;
}

export function serverError(error: string = 'Internal server error'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  }, { status: 500 });
}
