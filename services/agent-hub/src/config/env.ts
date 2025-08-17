import { z } from 'zod';

// Server-side environment validation for backend service
const serverEnvSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  
  // Security
  HMAC_WEBHOOK_SECRET: z.string().min(32, 'HMAC_WEBHOOK_SECRET must be at least 32 characters'),
  
  // n8n integration
  N8N_BASE_URL: z.string().url().optional(),
  
  // Optional features
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_HOST: z.string().url().optional(),
  
  // Rate limiting
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  
  // System
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Optional tenant config
  DEFAULT_TENANT_ID: z.string().uuid().optional(),
  API_BASE_URL: z.string().url().optional(),
});

// Validate environment on module load
export const env = (() => {
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
})();

export type Env = typeof env;
