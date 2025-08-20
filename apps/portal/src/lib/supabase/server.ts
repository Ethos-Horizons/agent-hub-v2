import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { clientEnv, getServerEnv } from '@/config/env';
import { logger } from '@/lib/logger';

// Session-aware Supabase client for server components and API routes
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting can fail during SSR
            logger.warn('Failed to set cookie during SSR', { name, error });
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal can fail during SSR
            logger.warn('Failed to remove cookie during SSR', { name, error });
          }
        },
      },
    }
  );
}

// Admin client with service role (server-only, use sparingly)
export function createAdminClient() {
  const serverEnv = getServerEnv();
  
  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}

// Helper to get current user's tenant ID safely
export async function getCurrentUserTenantId() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single();
    
  return orgMember?.org_id || null;
}

// Helper to validate user has access to a tenant
export async function validateUserTenantAccess(tenantId: string): Promise<boolean> {
  const userTenantId = await getCurrentUserTenantId();
  return userTenantId === tenantId;
}
