import { RunRequestT, ApiResponse } from '@agent-hub/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, errorData.error || 'Request failed')
  }
  
  return response.json()
}

// Run management
export async function startRun(runRequest: RunRequestT) {
  return request<ApiResponse<{ runId: string; plan?: any }>>('/runs', {
    method: 'POST',
    body: JSON.stringify(runRequest),
  })
}

export async function getRun(runId: string) {
  return request<ApiResponse<any>>(`/runs/${runId}`)
}

export async function getRuns(projectId: string, params?: {
  limit?: number
  offset?: number
  status?: string
}) {
  const searchParams = new URLSearchParams({
    projectId,
    ...params,
  })
  
  return request<ApiResponse<{
    items: any[]
    total: number
    limit: number
    offset: number
  }>>(`/runs?${searchParams}`)
}

// Agent management
export async function getAgents(params?: {
  limit?: number
  offset?: number
  status?: string
  type?: string
}) {
  const searchParams = new URLSearchParams(params as any)
  return request<ApiResponse<{
    items: any[]
    total: number
  }>>(`/agents?${searchParams}`)
}

export async function getAgent(agentId: string) {
  return request<ApiResponse<any>>(`/agents/${agentId}`)
}

export async function createAgent(agent: {
  name: string
  type: string
  description?: string
  config?: any
}) {
  return request<ApiResponse<any>>('/agents', {
    method: 'POST',
    body: JSON.stringify(agent),
  })
}

export async function updateAgent(agentId: string, updates: {
  name?: string
  type?: string
  description?: string
  status?: string
  config?: any
}) {
  return request<ApiResponse<any>>(`/agents/${agentId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function searchKnowledgeBase(agentId: string, query: string, embedding: number[]) {
  return request<ApiResponse<{
    query: string
    results: any[]
    total: number
  }>>(`/agents/${agentId}/search`, {
    method: 'POST',
    body: JSON.stringify({ query, embedding }),
  })
}

// Conversation management
export async function getConversations(params?: {
  limit?: number
  offset?: number
  status?: string
  visitor_id?: string
}) {
  const searchParams = new URLSearchParams(params as any)
  return request<ApiResponse<{
    items: any[]
    total: number
  }>>(`/conversations?${searchParams}`)
}

export async function createConversation(conversation: {
  visitor_id: string
  session_id: string
  intent?: string
}) {
  return request<ApiResponse<any>>('/conversations', {
    method: 'POST',
    body: JSON.stringify(conversation),
  })
}

export async function addMessage(conversationId: string, message: {
  message_type: 'user' | 'bot'
  content: string
  metadata?: any
}) {
  return request<ApiResponse<any>>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(message),
  })
}

export { ApiError }
