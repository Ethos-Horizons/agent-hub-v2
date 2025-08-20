// AI Agent Creation Types - Microservices and sandboxed development
// This implements Gemini's approach for safe AI-generated agent creation

export interface AICreationRequest {
  id: string;
  tenantId: string;
  userId: string;
  description: string; // Natural language description
  status: 'pending' | 'researching' | 'planning' | 'coding' | 'testing' | 'completed' | 'failed';
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  metadata: {
    estimatedComplexity: 'simple' | 'medium' | 'complex';
    estimatedDuration: number; // minutes
    requiredTools: string[];
    externalIntegrations: string[];
    aiModels: {
      research: string;
      planning: string;
      coding: string;
      testing: string;
    };
  };
}

export interface AICreationPhase {
  id: string;
  creationId: string;
  phase: 'research' | 'planning' | 'coding' | 'testing';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number; // seconds
  output: any;
  error?: string;
  metadata: {
    aiModel: string;
    tokensUsed: number;
    cost: number;
    retryCount: number;
  };
}

export interface AIResearchOutput {
  requirements: string[];
  apis: Array<{
    name: string;
    description: string;
    documentation: string;
    authentication: string;
    rateLimits: string;
    pricing: string;
  }>;
  bestPractices: string[];
  securityConsiderations: string[];
  estimatedDevelopmentTime: number; // hours
  complexityFactors: string[];
  alternatives: Array<{
    approach: string;
    pros: string[];
    cons: string[];
  }>;
}

export interface AIPlanningOutput {
  architecture: {
    type: 'microservice' | 'monolithic' | 'serverless';
    components: Array<{
      name: string;
      type: 'agent' | 'tool' | 'database' | 'api';
      description: string;
      dependencies: string[];
    }>;
    dataFlow: Array<{
      from: string;
      to: string;
      data: string;
      trigger: string;
    }>;
  };
  implementation: {
    phases: Array<{
      name: string;
      description: string;
      duration: number; // hours
      dependencies: string[];
      deliverables: string[];
    }>;
    tools: string[];
    frameworks: string[];
    testingStrategy: string;
  };
  deployment: {
    environment: 'development' | 'staging' | 'production';
    infrastructure: string[];
    monitoring: string[];
    scaling: string[];
  };
}

export interface AICodingOutput {
  files: Array<{
    path: string;
    content: string;
    type: 'typescript' | 'javascript' | 'python' | 'yaml' | 'json';
    purpose: string;
  }>;
  dependencies: Array<{
    name: string;
    version: string;
    purpose: string;
  }>;
  configuration: {
    environment: Record<string, string>;
    secrets: string[];
    permissions: string[];
  };
  tests: Array<{
    name: string;
    type: 'unit' | 'integration' | 'e2e';
    description: string;
    testFile: string;
  }>;
  documentation: {
    setup: string;
    usage: string;
    api: string;
    troubleshooting: string;
  };
}

export interface AITestingOutput {
  testResults: Array<{
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    output: string;
    error?: string;
  }>;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  security: {
    vulnerabilities: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
    compliance: string[];
  };
  recommendations: string[];
}

export interface AICreationSandbox {
  id: string;
  creationId: string;
  status: 'creating' | 'ready' | 'running' | 'destroyed';
  containerId?: string;
  gitBranch: string;
  gitCommit: string;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
    network: 'isolated' | 'restricted' | 'full';
  };
  createdAt: string;
  expiresAt: string;
  accessUrl?: string;
  logs: string[];
}

export interface AICreationService {
  // Creation management
  createRequest(request: Omit<AICreationRequest, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<AICreationRequest>;
  getRequest(id: string): Promise<AICreationRequest>;
  updateRequest(id: string, updates: Partial<AICreationRequest>): Promise<AICreationRequest>;
  
  // Phase execution
  startPhase(creationId: string, phase: AICreationPhase['phase']): Promise<AICreationPhase>;
  completePhase(phaseId: string, output: any): Promise<AICreationPhase>;
  failPhase(phaseId: string, error: string): Promise<AICreationPhase>;
  
  // Sandbox management
  createSandbox(creationId: string): Promise<AICreationSandbox>;
  destroySandbox(sandboxId: string): Promise<void>;
  getSandboxLogs(sandboxId: string): Promise<string[]>;
  
  // AI orchestration
  orchestrateCreation(creationId: string): Promise<void>;
  generateWorkflow(description: string): Promise<any>;
  validateGeneratedCode(code: AICodingOutput): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>;
}

// AI Agent Creation Workflow
export interface AICreationWorkflow {
  // Phase 1: Research & Analysis
  researchPhase: {
    input: string; // Natural language description
    output: AIResearchOutput;
    aiModel: string;
    maxTokens: number;
    temperature: number;
  };
  
  // Phase 2: Planning & Architecture
  planningPhase: {
    input: AIResearchOutput;
    output: AIPlanningOutput;
    aiModel: string;
    maxTokens: number;
    temperature: number;
  };
  
  // Phase 3: Code Generation
  codingPhase: {
    input: AIPlanningOutput;
    output: AICodingOutput;
    aiModel: string;
    maxTokens: number;
    temperature: number;
    sandbox: AICreationSandbox;
  };
  
  // Phase 4: Testing & Validation
  testingPhase: {
    input: AICodingOutput;
    output: AITestingOutput;
    aiModel: string;
    maxTokens: number;
    temperature: number;
    sandbox: AICreationSandbox;
  };
  
  // Phase 5: Deployment & Integration
  deploymentPhase: {
    input: AITestingOutput;
    output: {
      agentId: string;
      workflowId: string;
      status: 'deployed' | 'failed';
      url?: string;
      documentation?: string;
    };
    requiresApproval: boolean;
    approvalWorkflow: string[];
  };
}

// Example AI Creation Request
export const EXAMPLE_AI_CREATION_REQUEST: Partial<AICreationRequest> = {
  description: 'I need an agent that can schedule appointments and integrate with Google Calendar',
  metadata: {
    estimatedComplexity: 'medium',
    estimatedDuration: 120, // 2 hours
    requiredTools: ['calendar.createEvent', 'email.send', 'lead.capture'],
    externalIntegrations: ['Google Calendar API', 'Google OAuth'],
    aiModels: {
      research: 'gpt-4-turbo',
      planning: 'gpt-4-turbo',
      coding: 'claude-3.5-sonnet',
      testing: 'gpt-4-turbo'
    }
  }
};
