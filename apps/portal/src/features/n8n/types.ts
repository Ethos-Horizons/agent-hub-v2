export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, any>;
  settings: Record<string, any>;
  tags: string[];
  versionId: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface N8nImportRequest {
  n8n_base_url: string;
  auth: {
    kind: 'apiKey' | 'basic' | 'oauth';
    api_key?: string;
    username?: string;
    password?: string;
    oauth_token?: string;
  };
  workflow_id: string;
  label?: string;
}

export interface N8nWorkflowSummary {
  id: string;
  name: string;
  active: boolean;
  node_count: number;
  webhook_nodes: N8nNode[];
  rest_nodes: N8nNode[];
  estimated_input_schema: Record<string, any>;
  estimated_output_schema: Record<string, any>;
}

export interface N8nBinding {
  workflow_id: string;
  base_url: string;
  auth_credentials: Record<string, any>;
  input_mapping: Record<string, string>;
  output_mapping: Record<string, string>;
}

export interface N8nTestRequest {
  binding: N8nBinding;
  test_input: Record<string, any>;
}

export interface N8nTestResponse {
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  execution_time_ms: number;
}
