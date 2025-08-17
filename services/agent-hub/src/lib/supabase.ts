import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
}

// Supabase admin client (for server-side operations with full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Supabase client for authenticated user operations
export const supabaseAuth = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to get user's tenant ID from JWT claims
export async function getUserTenantId(userId: string): Promise<string | null> {
  try {
    // First try to get from user's primary organization (owner role)
    const { data: orgMember } = await supabaseAdmin
      .from('org_members')
      .select('org_id')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .single();
    
    if (orgMember) return orgMember.org_id;
    
    // Fallback to any organization the user belongs to
    const { data: anyMember } = await supabaseAdmin
      .from('org_members')
      .select('org_id')
      .eq('user_id', userId)
      .limit(1)
      .single();
      
    return anyMember?.org_id || null;
  } catch (error) {
    logger.error({ error, userId }, "Failed to get user tenant ID");
    return null;
  }
}

// Helper function to validate user access to tenant
export async function validateUserTenantAccess(userId: string, tenantId: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('org_members')
      .select('id')
      .eq('user_id', userId)
      .eq('org_id', tenantId)
      .single();
    
    return !!data;
  } catch (error) {
    logger.error({ error, userId, tenantId }, "Failed to validate tenant access");
    return false;
  }
}

// Helper function to get organization by slug (for public widget)
export async function getOrgBySlug(slug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orgs')
      .select('id, name, slug, settings')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error({ error, slug }, "Failed to get organization by slug");
    return null;
  }
}

export async function broadcastRunUpdate(
  runId: string,
  message: { type: string; payload?: unknown }
) {
  try {
    await supabaseAdmin.channel(`run:${runId}`).send({
      type: "broadcast",
      event: message.type,
      payload: message,
    });
  } catch (error) {
    logger.warn({ error, runId }, "Failed to broadcast run update");
  }
}
