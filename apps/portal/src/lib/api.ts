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

// Portal-specific API functions only
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

// Re-export shared utilities
export { createApiResponse, createPaginatedResponse, ApiError }
