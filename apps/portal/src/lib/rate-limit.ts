import { NextRequest } from 'next/server';
import { getServerEnv } from '@/config/env';

// Simple in-memory rate limiter (fallback when Redis not available)
class MemoryRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  async isAllowed(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const existing = this.requests.get(key);

    // Clean up expired entries
    if (existing && now > existing.resetTime) {
      this.requests.delete(key);
    }

    const current = this.requests.get(key) || { count: 0, resetTime: now + windowMs };

    if (current.count >= limit) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    current.count++;
    this.requests.set(key, current);
    
    return { allowed: true };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

const memoryLimiter = new MemoryRateLimiter();

// Cleanup every 10 minutes
setInterval(() => memoryLimiter.cleanup(), 10 * 60 * 1000);

// Rate limit by IP address
export async function rateLimitByIp(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ip = getClientIp(request);
  const key = `ip:${ip}`;
  
  return memoryLimiter.isAllowed(key, limit, windowMs);
}

// Rate limit by user ID
export async function rateLimitByUser(
  userId: string,
  limit: number = 1000,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `user:${userId}`;
  
  return memoryLimiter.isAllowed(key, limit, windowMs);
}

// Rate limit for specific endpoints
export async function rateLimitEndpoint(
  request: NextRequest,
  endpoint: string,
  limit: number = 50,
  windowMs: number = 15 * 60 * 1000
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ip = getClientIp(request);
  const key = `endpoint:${endpoint}:${ip}`;
  
  return memoryLimiter.isAllowed(key, limit, windowMs);
}

// Get client IP from request
function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cloudflareIp = request.headers.get('cf-connecting-ip');
  
  if (cloudflareIp) return cloudflareIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// Rate limiting presets for common use cases
export const RateLimits = {
  // Authentication endpoints
  AUTH: { limit: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  
  // Chat/conversation endpoints  
  CHAT: { limit: 60, window: 60 * 1000 }, // 60 messages per minute
  
  // General API endpoints
  API: { limit: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  
  // Webhook endpoints
  WEBHOOK: { limit: 1000, window: 60 * 1000 }, // 1000 webhooks per minute
};
