// Workflow Engine Types - Graph-based execution system
// This implements Grok4's workflow definitions approach for AI-generated agent workflows

export interface WorkflowNode {
  id: string;
  agentId: string;
  type: 'agent' | 'condition' | 'delay' | 'webhook';
  config: {
    // Agent-specific configuration
    systemPrompt?: string;
    tools?: string[]; // Tool allowlist
    params?: Record<string, any>;
    // Condition-specific configuration
    condition?: string; // JavaScript expression or rule
    // Delay-specific configuration
    delayMs?: number;
    // Webhook-specific configuration
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  condition?: string; // Optional condition for routing
  label?: string; // Human-readable description
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  startNodeId: string;
  metadata: {
    createdBy: string;
    createdAt: string;
    aiGenerated: boolean;
    prompt?: string; // Original natural language request
    tags: string[];
  };
  status: 'draft' | 'active' | 'deprecated';
}

export interface WorkflowExecution {
  id: string;
  workflowVersionId: string;
  tenantId: string;
  userId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentNodeId?: string;
  input: any;
  output?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  events: WorkflowExecutionEvent[];
  state: Record<string, any>; // Workflow state storage
}

export interface WorkflowExecutionEvent {
  id: string;
  executionId: string;
  nodeId: string;
  type: 'node_started' | 'node_completed' | 'node_failed' | 'tool_called' | 'decision_made' | 'error';
  timestamp: string;
  data: {
    input?: any;
    output?: any;
    error?: string;
    toolName?: string;
    toolInput?: any;
    toolOutput?: any;
    decision?: string;
    nextNodeId?: string;
  };
  metadata: {
    duration?: number;
    retryCount?: number;
    agentModel?: string;
    tokensUsed?: number;
  };
}

export interface WorkflowEngine {
  // Workflow management
  createWorkflow(definition: Partial<WorkflowVersion>): Promise<WorkflowVersion>;
  updateWorkflow(id: string, updates: Partial<WorkflowVersion>): Promise<WorkflowVersion>;
  activateVersion(workflowId: string, versionId: string): Promise<void>;
  
  // Execution
  startExecution(workflowVersionId: string, input: any, context: {
    tenantId: string;
    userId: string;
  }): Promise<WorkflowExecution>;
  
  getExecution(executionId: string): Promise<WorkflowExecution>;
  cancelExecution(executionId: string): Promise<void>;
  
  // Monitoring
  getExecutionEvents(executionId: string): Promise<WorkflowExecutionEvent[]>;
  getActiveExecutions(workflowId: string): Promise<WorkflowExecution[]>;
}

// Lead Generation Workflow Definition
export const LEAD_GEN_WORKFLOW: Partial<WorkflowVersion> = {
  name: 'Lead Generation Workflow',
  description: 'Automated lead qualification and scheduling workflow',
  startNodeId: 'conversational_agent',
  nodes: [
    {
      id: 'conversational_agent',
      agentId: 'conversational_lead',
      type: 'agent',
      config: {
        systemPrompt: 'You are a friendly business consultant. Engage visitors naturally, collect business information subtly, and determine if they need consultation services.',
        tools: ['lead.capture', 'web.fetchJSON'],
        params: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000
        }
      },
      position: { x: 100, y: 100 }
    },
    {
      id: 'research_agent',
      agentId: 'business_researcher',
      type: 'agent',
      config: {
        systemPrompt: 'Research businesses to gather market intelligence, company size, industry trends, and competitive landscape.',
        tools: ['web.fetchJSON'],
        params: {
          model: 'gpt-4',
          temperature: 0.3,
          maxTokens: 1500
        }
      },
      position: { x: 300, y: 100 }
    },
    {
      id: 'scheduler_agent',
      agentId: 'appointment_scheduler',
      type: 'agent',
      config: {
        systemPrompt: 'Schedule consultation appointments based on lead qualification and research findings.',
        tools: ['calendar.createEvent', 'email.send'],
        params: {
          model: 'gpt-4',
          temperature: 0.5,
          maxTokens: 800
        }
      },
      position: { x: 500, y: 100 }
    },
    {
      id: 'form_filler_agent',
      agentId: 'form_filler',
      type: 'agent',
      config: {
        systemPrompt: 'Complete lead qualification forms with collected information.',
        tools: ['forms.submitResponse'],
        params: {
          model: 'gpt-4',
          temperature: 0.2,
          maxTokens: 600
        }
      },
      position: { x: 500, y: 300 }
    },
    {
      id: 'lead_qualified_condition',
      type: 'condition',
      config: {
        condition: 'lead.score >= 7 && lead.appointmentRequested === true'
      },
      position: { x: 400, y: 200 }
    }
  ],
  edges: [
    {
      id: 'conv_to_research',
      source: 'conversational_agent',
      target: 'research_agent',
      label: 'Lead captured, research business'
    },
    {
      id: 'conv_to_condition',
      source: 'conversational_agent',
      target: 'lead_qualified_condition',
      label: 'Check if lead is qualified'
    },
    {
      id: 'condition_to_scheduler',
      source: 'lead_qualified_condition',
      target: 'scheduler_agent',
      condition: 'true',
      label: 'Lead qualified, schedule appointment'
    },
    {
      id: 'condition_to_form',
      source: 'lead_qualified_condition',
      target: 'form_filler_agent',
      condition: 'true',
      label: 'Lead qualified, fill form'
    },
    {
      id: 'research_to_scheduler',
      source: 'research_agent',
      target: 'scheduler_agent',
      label: 'Research complete, schedule appointment'
    }
  ],
  metadata: {
    aiGenerated: true,
    prompt: 'Create a lead generation workflow that engages website visitors, researches their business, qualifies leads, schedules appointments, and fills out forms automatically.',
    tags: ['lead-generation', 'automation', 'appointments', 'research']
  }
};

// Workflow execution context for agents
export interface WorkflowContext {
  executionId: string;
  workflowId: string;
  currentNodeId: string;
  state: Record<string, any>;
  tools: string[]; // Available tools for this node
  logger: any;
  secretsResolver: (key: string) => Promise<string | null>;
  cache: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any, ttl?: number) => Promise<void>;
  };
}

// Agent interface for workflow nodes
export interface WorkflowAgent {
  id: string;
  name: string;
  description: string;
  execute(ctx: WorkflowContext, input: any): Promise<{
    output: any;
    nextNodeId?: string;
    stateUpdates?: Record<string, any>;
  }>;
}
