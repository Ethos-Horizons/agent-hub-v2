import { NextRequest } from 'next/server';
import { ok } from '@/lib/api-response';

// Public health check (no auth required)
export async function GET(request: NextRequest) {
  return ok({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
}
