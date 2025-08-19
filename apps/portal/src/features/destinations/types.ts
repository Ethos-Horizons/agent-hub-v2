export interface Destination {
  id: string;
  tenant_id: string;
  name: string;
  kind: 'webhook' | 'supabase-func' | 'custom';
  endpoint_url: string;
  headers: Record<string, string>;
  created_at: string;
  updated_at: string;
  shared_secret?: string; // For HMAC verification
  rate_limit?: {
    requests_per_minute: number;
    burst_size: number;
  };
}

export interface CreateDestinationRequest {
  name: string;
  kind: 'webhook' | 'supabase-func' | 'custom';
  endpoint_url: string;
  headers?: Record<string, string>;
  shared_secret?: string;
  rate_limit?: {
    requests_per_minute: number;
    burst_size: number;
  };
}

export interface UpdateDestinationRequest {
  name?: string;
  endpoint_url?: string;
  headers?: Record<string, string>;
  shared_secret?: string;
  rate_limit?: {
    requests_per_minute: number;
    burst_size: number;
  };
}

export interface TaskEnvelope {
  agentId: string;
  agentVersion: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  metadata: {
    tenant_id: string;
    execution_id: string;
    timestamp: string;
    overrides?: {
      system_prompt?: string;
      params?: Record<string, any>;
    };
  };
}

export interface SendTaskRequest {
  destination_id: string;
  agent_id: string;
  input: Record<string, any>;
  system_prompt_override?: string;
  params_override?: Record<string, any>;
}

export interface SendTaskResponse {
  success: boolean;
  destination_response?: any;
  error?: string;
  execution_id: string;
}
