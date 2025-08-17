import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/config/env';

// Client-side Supabase client (browser only)
export function createClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Helper functions for authentication
export const auth = {
  async signUp(email: string, password: string, options?: { data?: any }) {
    const supabase = createClient();
    return await supabase.auth.signUp({ email, password, options })
  },

  async signIn(email: string, password: string) {
    const supabase = createClient();
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    const supabase = createClient();
    return await supabase.auth.signOut()
  },

  async getUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// Helper functions for organization management
export const org = {
  async getCurrentUserOrgs() {
    const user = await auth.getUser()
    if (!user) return []

    const supabase = createClient();
    const { data } = await supabase
      .from('org_members')
      .select(`
        role,
        orgs (
          id,
          name,
          slug,
          settings
        )
      `)
      .eq('user_id', user.id)

    return data || []
  },

  async createOrganization(name: string, slug: string) {
    const user = await auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const supabase = createClient();
    
    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('orgs')
      .insert({ name, slug })
      .select()
      .single()

    if (orgError) throw orgError

    // Add user as owner
    const { error: memberError } = await supabase
      .from('org_members')
      .insert({
        org_id: orgData.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) throw memberError

    return orgData
  }
}

// Legacy export for backward compatibility - but with warning
export const supabase = (() => {
  console.warn('Using legacy supabase export. Consider using createClient() instead.');
  return createClient();
})();
