// Database types for Agent Hub
// These types correspond to the tables created in the migration

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: AgentRow;
        Insert: AgentInsert;
        Update: AgentUpdate;
      };
      agent_versions: {
        Row: AgentVersionRow;
        Insert: AgentVersionInsert;
        Update: AgentVersionUpdate;
      };
      agent_bindings: {
        Row: AgentBindingRow;
        Insert: AgentBindingInsert;
        Update: AgentBindingUpdate;
      };
      destinations: {
        Row: DestinationRow;
        Insert: DestinationInsert;
        Update: DestinationUpdate;
      };
      agent_executions: {
        Row: AgentExecutionRow;
        Insert: AgentExecutionInsert;
        Update: AgentExecutionUpdate;
      };
    };
    Enums: {
      agent_kind: 'local' | 'n8n';
      agent_version_status: 'draft' | 'active' | 'deprecated';
      auth_kind: 'apiKey' | 'basic' | 'oauth';
      destination_kind: 'webhook' | 'supabase-func' | 'custom';
      execution_status: 'queued' | 'running' | 'succeeded' | 'failed';
    };
  };
}

// Base types
export interface AgentRow {
  id: string;
  tenant_id: string;
  name: string;
  kind: Database['public']['Enums']['agent_kind'];
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentInsert {
  id?: string;
  tenant_id: string;
  name: string;
  kind: Database['public']['Enums']['agent_kind'];
  slug: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AgentUpdate {
  id?: string;
  tenant_id?: string;
  name?: string;
  kind?: Database['public']['Enums']['agent_kind'];
  slug?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AgentVersionRow {
  id: string;
  agent_id: string;
  version: string;
  system_prompt: string;
  default_params: Record<string, any>;
  status: Database['public']['Enums']['agent_version_status'];
  created_at: string;
}

export interface AgentVersionInsert {
  id?: string;
  agent_id: string;
  version: string;
  system_prompt: string;
  default_params?: Record<string, any>;
  status?: Database['public']['Enums']['agent_version_status'];
  created_at?: string;
}

export interface AgentVersionUpdate {
  id?: string;
  agent_id?: string;
  version?: string;
  system_prompt?: string;
  default_params?: Record<string, any>;
  status?: Database['public']['Enums']['agent_version_status'];
  created_at?: string;
}

export interface AgentBindingRow {
  id: string;
  agent_id: string;
  n8n_base_url: string;
  workflow_id: string;
  auth_kind: Database['public']['Enums']['auth_kind'];
  credentials_ref: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentBindingInsert {
  id?: string;
  agent_id: string;
  n8n_base_url: string;
  workflow_id: string;
  auth_kind: Database['public']['Enums']['auth_kind'];
  credentials_ref: string;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AgentBindingUpdate {
  id?: string;
  agent_id?: string;
  n8n_base_url?: string;
  workflow_id?: string;
  auth_kind?: Database['public']['Enums']['auth_kind'];
  credentials_ref?: string;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationRow {
  id: string;
  tenant_id: string;
  name: string;
  kind: Database['public']['Enums']['destination_kind'];
  endpoint_url: string;
  headers: Record<string, string>;
  shared_secret: string | null;
  rate_limit: {
    requests_per_minute: number;
    burst_size: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface DestinationInsert {
  id?: string;
  tenant_id: string;
  name: string;
  kind: Database['public']['Enums']['destination_kind'];
  endpoint_url: string;
  headers?: Record<string, string>;
  shared_secret?: string | null;
  rate_limit?: {
    requests_per_minute: number;
    burst_size: number;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationUpdate {
  id?: string;
  tenant_id?: string;
  name?: string;
  kind?: Database['public']['Enums']['destination_kind'];
  endpoint_url?: string;
  headers?: Record<string, string>;
  shared_secret?: string | null;
  rate_limit?: {
    requests_per_minute: number;
    burst_size: number;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AgentExecutionRow {
  id: string;
  tenant_id: string;
  agent_id: string;
  agent_version_id: string;
  destination_id: string | null;
  input: Record<string, any>;
  output: Record<string, any> | null;
  status: Database['public']['Enums']['execution_status'];
  started_at: string;
  finished_at: string | null;
  error_text: string | null;
  execution_time_ms: number | null;
}

export interface AgentExecutionInsert {
  id?: string;
  tenant_id: string;
  agent_id: string;
  agent_version_id: string;
  destination_id?: string | null;
  input: Record<string, any>;
  output?: Record<string, any> | null;
  status?: Database['public']['Enums']['execution_status'];
  started_at?: string;
  finished_at?: string | null;
  error_text?: string | null;
  execution_time_ms?: number | null;
}

export interface AgentExecutionUpdate {
  id?: string;
  tenant_id?: string;
  agent_id?: string;
  agent_version_id?: string;
  destination_id?: string | null;
  input?: Record<string, any>;
  output?: Record<string, any> | null;
  status?: Database['public']['Enums']['execution_status'];
  started_at?: string;
  finished_at?: string | null;
  error_text?: string | null;
  execution_time_ms?: number | null;
}

// Helper types for common operations
export type AgentWithVersions = AgentRow & {
  versions: AgentVersionRow[];
  active_version?: AgentVersionRow;
};

export type AgentWithBindings = AgentRow & {
  versions: AgentVersionRow[];
  bindings: AgentBindingRow[];
  active_version?: AgentVersionRow;
};

export type ExecutionWithDetails = AgentExecutionRow & {
  agent: Pick<AgentRow, 'name' | 'slug'>;
  agent_version: Pick<AgentVersionRow, 'version' | 'system_prompt'>;
  destination?: Pick<DestinationRow, 'name' | 'endpoint_url'>;
};
