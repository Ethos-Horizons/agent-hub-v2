import { z } from "zod";

// Request/Response schemas for API
export const RunRequest = z.object({
  projectId: z.string().uuid(),
  agent: z.string().min(2),
  input: z.any(),
  simulate: z.boolean().optional(),
});

export const RunStatus = z.object({
  id: z.string().uuid(),
  status: z.enum(["queued", "running", "success", "error"]),
  costUsd: z.number().optional(),
  latencyMs: z.number().optional(),
});

export type RunRequestT = z.infer<typeof RunRequest>;
export type RunStatusT = z.infer<typeof RunStatus>;

// n8n callback schema
export const N8nCallbackPayload = z.object({
  runId: z.string().uuid(),
  status: z.enum(["success", "error", "running", "queued"]).default("success"),
  output: z.any().optional(),
  artifacts: z
    .array(
      z.object({
        kind: z.string(),
        title: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
        content: z.string().nullable().optional(),
      })
    )
    .optional(),
  costUsd: z.number().optional(),
  latencyMs: z.number().optional(),
  error: z.string().optional(),
});

export type N8nCallbackPayloadT = z.infer<typeof N8nCallbackPayload>;

// Database entity types matching your existing Supabase schema
export type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export type Project = {
  id: string;
  org_id: string;
  name: string;
  plan: string;
  created_at: string;
};

export type Run = {
  id: string;
  project_id: string;
  agent: string;
  status: "queued" | "running" | "success" | "error";
  input: any;
  output?: any;
  cost_usd: number;
  latency_ms: number;
  n8n_execution_id?: string;
  error?: string;
  created_at: string;
  updated_at: string;
};

export type Artifact = {
  id: string;
  run_id: string;
  kind: string;
  title?: string;
  url?: string;
  content?: string;
  created_at: string;
};

// Agent types from your existing schema
export type Agent = {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: string;
  version: string;
  config: any;
  created_at: string;
  updated_at: string;
};

export type AgentSkill = {
  id: string;
  agent_id: string;
  skill_name: string;
  skill_description?: string;
  embedding?: any;
  examples: any[];
  usage_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
};

export type AgentMemory = {
  id: string;
  agent_id: string;
  content: string;
  embedding?: any;
  metadata: any;
  importance_score: number;
  memory_type: string;
  created_at: string;
  last_accessed: string;
  access_count: number;
};

// Conversation types
export type Conversation = {
  id: string;
  visitor_id: string;
  session_id: string;
  start_time: string;
  end_time?: string;
  status: string;
  intent?: string;
  lead_qualified: boolean;
};

export type Message = {
  id: string;
  conversation_id: string;
  message_type: "user" | "bot";
  content: string;
  timestamp: string;
  metadata: any;
};

export type Lead = {
  id: string;
  conversation_id: string;
  visitor_info: any;
  qualification_data: any;
  status: string;
  created_at: string;
};

// Knowledge base types
export type KnowledgeBase = {
  id: string;
  agent_id: string;
  title: string;
  content: string;
  embedding?: any;
  source_url?: string;
  parent_document_id?: string;
  source_type: string;
  metadata: any;
  chunk_index: number;
  created_at: string;
  updated_at: string;
};

// System types
export type ApiKey = {
  id: string;
  provider: string;
  key_name: string;
  encrypted_key: string;
  is_active: boolean;
  created_at: string;
};

export type SystemSetting = {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
};

// Agent catalog for frontend
export type AgentDefinition = {
  id: string;
  name: string;
  desc: string;
  category?: string;
  enabled?: boolean;
  type?: string;
};

// API response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
}>;

// Constants
export const AGENT_STATUSES = ["queued", "running", "success", "error"] as const;
export const PROJECT_PLANS = ["presence", "growth", "enterprise"] as const;
export const MESSAGE_TYPES = ["user", "bot"] as const;
export const CONVERSATION_STATUSES = ["active", "completed", "abandoned"] as const;
export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted"] as const;

// Utility functions
export const createApiResponse = <T>(
  data?: T,
  error?: string
): ApiResponse<T> => ({
  success: !error,
  data,
  error,
});

export const createPaginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  success: true,
  data: {
    items,
    total,
    page,
    limit,
  },
});

// Vector search function types (for your search functions)
export type VectorSearchResult<T> = T & {
  similarity: number;
};

export type AgentMemorySearchResult = VectorSearchResult<{
  id: string;
  content: string;
  metadata: any;
  importance_score: number;
  memory_type: string;
  created_at: string;
}>;

export type KnowledgeSearchResult = VectorSearchResult<{
  id: string;
  title: string;
  content: string;
  source_type: string;
  metadata: any;
}>;