import { RunRequestT, ApiResponse, createApiResponse, createPaginatedResponse } from '@agent-hub/shared'

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

// Agent Management API
export async function getAgents() {
  return request<ApiResponse<any[]>>('/agents')
}

export async function getAgent(id: string) {
  return request<ApiResponse<any>>(`/agents/${id}`)
}

export async function createAgent(agentData: any) {
  return request<ApiResponse<any>>('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData),
  })
}

export async function updateAgent(id: string, agentData: any) {
  return request<ApiResponse<any>>(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agentData),
  })
}

export async function deleteAgent(id: string) {
  return request<ApiResponse<void>>(`/agents/${id}`, {
    method: 'DELETE',
  })
}

// Agent Execution API
export async function invokeAgent(id: string, input: any) {
  return request<ApiResponse<any>>(`/agents/${id}/invoke`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function testAgent(id: string, input: any) {
  return request<ApiResponse<any>>(`/agents/${id}/test`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// Run Management API
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
  const searchParams = new URLSearchParams({ projectId })

  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())
  if (params?.status) searchParams.set('status', params.status)

  return request<ApiResponse<{
    items: any[]
    total: number
    limit: number
    offset: number
  }>>(`/runs?${searchParams}`)
}

// AI Agent Creation API
export async function createAgentWithAI(description: string) {
  return request<ApiResponse<{ agentId: string; status: 'creating' | 'ready' | 'failed' }>>('/agents/create-with-ai', {
    method: 'POST',
    body: JSON.stringify({ description }),
  })
}

export async function getAgentCreationStatus(agentId: string) {
  return request<ApiResponse<{ status: 'creating' | 'ready' | 'failed'; progress?: number; error?: string }>>(`/agents/${agentId}/creation-status`)
}

// Re-export shared utilities
export { createApiResponse, createPaginatedResponse, ApiError }
