import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper functions for authentication
export const auth = {
  async signUp(email: string, password: string, options?: { data?: any }) {
    return await supabase.auth.signUp({ email, password, options })
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    return await supabase.auth.signOut()
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// Helper functions for organization management
export const org = {
  async getCurrentUserOrgs() {
    const user = await auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('org_members')
      .select(`
        role,
        organizations (
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

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single()

    if (orgError) throw orgError

    // Add user as owner
    const { error: memberError } = await supabase
      .from('org_members')
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) throw memberError

    return org
  }
}

// Helper functions for common operations
export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getAgent(id: string) {
  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      skills:agent_skills(*),
      memories:agent_memories(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getRuns(projectId: string) {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getRun(id: string) {
  const { data, error } = await supabase
    .from('runs')
    .select(`
      *,
      artifacts:artifacts(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages:messages(*)
    `)
    .order('start_time', { ascending: false })
    .limit(50)
  
  if (error) throw error
  return data
}

// Real-time subscriptions
export function subscribeToRunUpdates(runId: string, callback: (payload: any) => void) {
  return supabase.channel(`run:${runId}`)
    .on('broadcast', { event: 'status' }, callback)
    .subscribe()
}

export function subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
  return supabase.channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, callback)
    .subscribe()
}
