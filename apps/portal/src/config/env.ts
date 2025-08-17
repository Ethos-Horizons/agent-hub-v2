import { z } from 'zod';

// Client-side environment variables (safe to expose to browser)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

// Server-side environment variables (never exposed to client)
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  HMAC_WEBHOOK_SECRET: z.string().min(32, 'HMAC_WEBHOOK_SECRET must be at least 32 characters'),
  
  // Optional observability
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(), 
  LANGFUSE_HOST: z.string().url().optional(),
  
  // Optional rate limiting
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  
  // Optional for specific deployments
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

// Validate and export client environment
export const clientEnv = (() => {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  } catch (error) {
    console.error('❌ Invalid client environment variables:', error);
    throw new Error('Client environment validation failed');
  }
})();

// Server-only environment validation (only call on server)
export const getServerEnv = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server');
  }
  
  try {
    return serverEnvSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      HMAC_WEBHOOK_SECRET: process.env.HMAC_WEBHOOK_SECRET,
      LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY,
      LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY,
      LANGFUSE_HOST: process.env.LANGFUSE_HOST,
      RATE_LIMIT_REDIS_URL: process.env.RATE_LIMIT_REDIS_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('❌ Invalid server environment variables:', error);
    throw new Error('Server environment validation failed');
  }
};

// Type exports for TypeScript
export type ClientEnv = typeof clientEnv;
export type ServerEnv = ReturnType<typeof getServerEnv>;
