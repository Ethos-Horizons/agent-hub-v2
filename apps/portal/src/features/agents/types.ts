export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  kind: 'local' | 'n8n';
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version: string;
  system_prompt: string;
  default_params: Record<string, any>;
  status: 'draft' | 'active' | 'deprecated';
  created_at: string;
}

export interface AgentBinding {
  id: string;
  agent_id: string;
  n8n_base_url: string;
  workflow_id: string;
  auth_kind: 'apiKey' | 'basic' | 'oauth';
  credentials_ref: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentExecution {
  id: string;
  tenant_id: string;
  agent_id: string;
  agent_version_id: string;
  destination_id?: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  started_at: string;
  finished_at?: string;
  error_text?: string;
}

export interface CreateAgentRequest {
  name: string;
  kind: 'local' | 'n8n';
  description: string;
  system_prompt: string;
  default_params?: Record<string, any>;
}

export interface CreateVersionRequest {
  version: string;
  system_prompt: string;
  default_params?: Record<string, any>;
  commit_message?: string;
}

export interface InvokeAgentRequest {
  input: Record<string, any>;
  system_prompt_override?: string;
  params_override?: Record<string, any>;
  destination_id?: string;
}

export interface InvokeAgentResponse {
  execution_id: string;
  output: Record<string, any>;
  status: 'succeeded' | 'failed';
  error?: string;
}
