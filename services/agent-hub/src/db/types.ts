// Database types for Agent Hub
// These types match the existing database structure and new migration

export interface Database {
  public: {
    Tables: {
      // Existing tables (unchanged)
      agents: { Row: AgentRow; Insert: AgentInsert; Update: AgentUpdate; };
      conversations: { Row: ConversationRow; Insert: ConversationInsert; Update: ConversationUpdate; };
      messages: { Row: MessageRow; Insert: MessageInsert; Update: MessageUpdate; };
      runs: { Row: RunRow; Insert: RunInsert; Update: RunUpdate; };
      projects: { Row: ProjectRow; Insert: ProjectInsert; Update: ProjectUpdate; };
      orgs: { Row: OrgRow; Insert: OrgInsert; Update: OrgUpdate; };
      user_agents: { Row: UserAgentRow; Insert: UserAgentInsert; Update: UserAgentUpdate; };
      
      // New tables from migration
      agent_versions: { Row: AgentVersionRow; Insert: AgentVersionInsert; Update: AgentVersionUpdate; };
      agent_bindings: { Row: AgentBindingRow; Insert: AgentBindingInsert; Update: AgentBindingUpdate; };
      destinations: { Row: DestinationRow; Insert: DestinationInsert; Update: DestinationUpdate; };
      agent_executions: { Row: AgentExecutionRow; Insert: AgentExecutionInsert; Update: AgentExecutionUpdate; };
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

// Existing table types (unchanged)
export interface AgentRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
  status: string;
  version: string;
  config: any;
  created_at: string;
  updated_at: string;
  tenant_id: string | null;
}

export interface AgentInsert {
  id?: string;
  name: string;
  type: string;
  description?: string | null;
  status?: string;
  version?: string;
  config?: any;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string | null;
}

export interface AgentUpdate {
  id?: string;
  name?: string;
  type?: string;
  description?: string | null;
  status?: string;
  version?: string;
  config?: any;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string | null;
}

// New table types from migration
export interface AgentVersionRow {
  id: string;
  agent_id: string;
  version: string;
  system_prompt: string | null;
  default_params: any;
  status: 'draft' | 'active' | 'deprecated';
  created_at: string;
  updated_at: string;
}

export interface AgentVersionInsert {
  id?: string;
  agent_id: string;
  version: string;
  system_prompt?: string | null;
  default_params?: any;
  status?: 'draft' | 'active' | 'deprecated';
  created_at?: string;
  updated_at?: string;
}

export interface AgentVersionUpdate {
  id?: string;
  agent_id?: string;
  version?: string;
  system_prompt?: string | null;
  default_params?: any;
  status?: 'draft' | 'active' | 'deprecated';
  created_at?: string;
  updated_at?: string;
}

export interface AgentBindingRow {
  id: string;
  agent_id: string;
  n8n_base_url: string;
  workflow_id: string;
  auth_kind: 'apiKey' | 'basic' | 'oauth';
  credentials_ref: string | null;
  input_schema: any;
  output_schema: any;
  created_at: string;
  updated_at: string;
}

export interface AgentBindingInsert {
  id?: string;
  agent_id: string;
  n8n_base_url: string;
  workflow_id: string;
  auth_kind: 'apiKey' | 'basic' | 'oauth';
  credentials_ref?: string | null;
  input_schema?: any;
  output_schema?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AgentBindingUpdate {
  id?: string;
  agent_id?: string;
  n8n_base_url?: string;
  workflow_id?: string;
  auth_kind?: 'apiKey' | 'basic' | 'oauth';
  credentials_ref?: string | null;
  input_schema?: any;
  output_schema?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationRow {
  id: string;
  tenant_id: string;
  name: string;
  kind: 'webhook' | 'supabase-func' | 'custom';
  endpoint_url: string;
  headers: any;
  auth_config: any;
  created_at: string;
  updated_at: string;
}

export interface DestinationInsert {
  id?: string;
  tenant_id?: string;
  name: string;
  kind: 'webhook' | 'supabase-func' | 'custom';
  endpoint_url: string;
  headers?: any;
  auth_config?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationUpdate {
  id?: string;
  tenant_id?: string;
  name?: string;
  kind?: 'webhook' | 'supabase-func' | 'custom';
  endpoint_url?: string;
  headers?: any;
  auth_config?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AgentExecutionRow {
  id: string;
  tenant_id: string;
  agent_id: string;
  agent_version_id: string | null;
  destination_id: string | null;
  input: any;
  output: any;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  started_at: string | null;
  finished_at: string | null;
  error_text: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface AgentExecutionInsert {
  id?: string;
  tenant_id?: string;
  agent_id: string;
  agent_version_id?: string | null;
  destination_id?: string | null;
  input?: any;
  output?: any;
  status?: 'queued' | 'running' | 'succeeded' | 'failed';
  started_at?: string | null;
  finished_at?: string | null;
  error_text?: string | null;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AgentExecutionUpdate {
  id?: string;
  tenant_id?: string;
  agent_id?: string;
  agent_version_id?: string | null;
  destination_id?: string | null;
  input?: any;
  output?: any;
  status?: 'queued' | 'running' | 'succeeded' | 'failed';
  started_at?: string | null;
  finished_at?: string | null;
  error_text?: string | null;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// Helper types for common operations
export type AgentWithVersions = AgentRow & {
  versions: AgentVersionRow[];
  bindings: AgentBindingRow[];
};

export type AgentWithExecutions = AgentRow & {
  executions: AgentExecutionRow[];
};

// Existing table types (placeholder - add as needed)
export interface ConversationRow {
  id: string;
  visitor_id: string;
  session_id: string;
  end_time: string | null;
  intent: string | null;
  start_time: string;
  status: string;
  lead_qualified: boolean;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationInsert {
  id?: string;
  visitor_id: string;
  session_id: string;
  end_time?: string | null;
  intent?: string | null;
  start_time?: string;
  status?: string;
  lead_qualified?: boolean;
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ConversationUpdate {
  id?: string;
  visitor_id?: string;
  session_id?: string;
  end_time?: string | null;
  intent?: string | null;
  start_time?: string;
  status?: string;
  lead_qualified?: boolean;
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  message_type: string;
  content: string;
  timestamp: string;
  metadata: any;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageInsert {
  id?: string;
  conversation_id: string;
  message_type: string;
  content: string;
  timestamp?: string;
  metadata?: any;
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MessageUpdate {
  id?: string;
  conversation_id?: string;
  message_type?: string;
  content?: string;
  timestamp?: string;
  metadata?: any;
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RunRow {
  id: string;
  project_id: string | null;
  agent: string;
  input: any;
  output: any | null;
  n8n_execution_id: string | null;
  error: string | null;
  status: string;
  cost_usd: number | null;
  latency_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface RunInsert {
  id?: string;
  project_id?: string | null;
  agent: string;
  input: any;
  output?: any | null;
  n8n_execution_id?: string | null;
  error?: string | null;
  status?: string;
  cost_usd?: number | null;
  latency_ms?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface RunUpdate {
  id?: string;
  project_id?: string | null;
  agent?: string;
  input?: any;
  output?: any | null;
  n8n_execution_id?: string | null;
  error?: string | null;
  status?: string;
  cost_usd?: number | null;
  latency_ms?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectRow {
  id: string;
  org_id: string | null;
  name: string;
  plan: string;
  created_at: string;
}

export interface ProjectInsert {
  id?: string;
  org_id?: string | null;
  name: string;
  plan?: string;
  created_at?: string;
}

export interface ProjectUpdate {
  id?: string;
  org_id?: string | null;
  name?: string;
  plan?: string;
  created_at?: string;
}

export interface OrgRow {
  id: string;
  slug: string | null;
  settings: any;
  name: string;
  created_at: string;
}

export interface OrgInsert {
  id?: string;
  slug?: string | null;
  settings?: any;
  name: string;
  created_at?: string;
}

export interface OrgUpdate {
  id?: string;
  slug?: string | null;
  settings?: any;
  name?: string;
  created_at?: string;
}

export interface UserAgentRow {
  user_id: string;
  agent_id: string;
  created_at: string;
}

export interface UserAgentInsert {
  user_id: string;
  agent_id: string;
  created_at?: string;
}

export interface UserAgentUpdate {
  user_id?: string;
  agent_id?: string;
  created_at?: string;
}
