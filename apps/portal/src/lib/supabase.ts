import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
