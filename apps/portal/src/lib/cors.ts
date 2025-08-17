import { NextRequest, NextResponse } from 'next/server';

// CORS configuration based on environment
const getAllowedOrigins = (): string[] => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'development') {
    return [
      'http://localhost:3000',  // Your main website
      'http://localhost:3001',  // AgentHub frontend
      'http://localhost:3002',  // CMS or other services
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
  }
  
  if (env === 'production') {
    return [
      'https://agenthub.com', // Replace with your production domain
      'https://app.yourdomain.com'
    ];
  }
  
  // Handle staging and other custom environments
  if (env.includes('staging')) {
    return [
      'https://staging.agenthub.com', // Replace with your staging domain
      'https://staging-app.yourdomain.com'
    ];
  }
  
  // Default fallback
  return ['http://localhost:3001'];
};

// CORS middleware for API routes
export function corsMiddleware(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  // Check if origin is allowed
  const isAllowed = !origin || allowedOrigins.includes(origin);
  
  if (!isAllowed) {
    return new NextResponse('CORS policy violation', { status: 403 });
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  return null; // Continue processing
}

// Apply CORS headers to response
export function applyCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  return response;
}
