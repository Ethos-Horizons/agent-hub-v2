// Playground Types - Testing and transparency environment
// This implements the playground concept from all three responses for safe agent testing

export interface PlaygroundSession {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  description: string;
  status: 'creating' | 'ready' | 'running' | 'completed' | 'failed' | 'destroyed';
  createdAt: string;
  expiresAt: string;
  metadata: {
    agentId?: string;
    workflowId?: string;
    mode: 'development' | 'testing' | 'shadow';
    environment: 'isolated' | 'mock' | 'staging';
  };
}

export interface PlaygroundEnvironment {
  id: string;
  sessionId: string;
  status: 'creating' | 'ready' | 'running' | 'destroyed';
  containerId?: string;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
    network: 'isolated' | 'restricted' | 'full';
  };
  services: {
    database: 'mock' | 'isolated' | 'shared';
    redis: 'mock' | 'isolated' | 'shared';
    external: 'mock' | 'isolated' | 'shared';
  };
  mockApis: MockApi[];
  createdAt: string;
  accessUrl?: string;
  logs: string[];
}

export interface MockApi {
  name: string;
  baseUrl: string;
  endpoints: MockEndpoint[];
  authentication: 'none' | 'api_key' | 'oauth' | 'jwt';
  rateLimiting: boolean;
  responseDelay: number; // ms
}

export interface MockEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requestSchema: Record<string, any>;
  responseSchema: Record<string, any>;
  examples: Array<{
    request: any;
    response: any;
    description: string;
  }>;
  errorResponses: Array<{
    status: number;
    error: string;
    description: string;
  }>;
}

export interface PlaygroundExecution {
  id: string;
  sessionId: string;
  agentId?: string;
  workflowId?: string;
  input: any;
  output?: any;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  events: PlaygroundExecutionEvent[];
  state: Record<string, any>;
  metadata: {
    mode: 'development' | 'testing' | 'shadow';
    aiModel?: string;
    tokensUsed?: number;
    cost?: number;
  };
}

export interface PlaygroundExecutionEvent {
  id: string;
  executionId: string;
  timestamp: string;
  type: 'agent_started' | 'agent_completed' | 'tool_called' | 'decision_made' | 'error' | 'state_change';
  data: {
    agentId?: string;
    nodeId?: string;
    toolName?: string;
    toolInput?: any;
    toolOutput?: any;
    decision?: string;
    stateUpdate?: Record<string, any>;
    error?: string;
    metadata?: Record<string, any>;
  };
}

export interface PlaygroundTest {
  id: string;
  sessionId: string;
  name: string;
  description: string;
  input: any;
  expectedOutput?: any;
  assertions: PlaygroundAssertion[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  results: PlaygroundTestResult[];
}

export interface PlaygroundAssertion {
  id: string;
  name: string;
  description: string;
  type: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than' | 'custom';
  expression: string; // JavaScript expression or custom logic
  expectedValue?: any;
  tolerance?: number; // For numeric comparisons
}

export interface PlaygroundTestResult {
  assertionId: string;
  assertionName: string;
  status: 'passed' | 'failed' | 'skipped';
  actualValue: any;
  expectedValue?: any;
  error?: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface PlaygroundComparison {
  id: string;
  sessionId: string;
  name: string;
  description: string;
  baselineExecutionId: string;
  comparisonExecutionId: string;
  createdAt: string;
  differences: PlaygroundDifference[];
  summary: {
    totalDifferences: number;
    criticalDifferences: number;
    performanceDelta: number;
    behaviorChanged: boolean;
  };
}

export interface PlaygroundDifference {
  id: string;
  type: 'input' | 'output' | 'state' | 'performance' | 'behavior';
  path: string; // JSON path to the difference
  baseline: any;
  comparison: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation?: string;
}

export interface PlaygroundService {
  // Session management
  createSession(session: Omit<PlaygroundSession, 'id' | 'status' | 'createdAt'>): Promise<PlaygroundSession>;
  getSession(id: string): Promise<PlaygroundSession>;
  destroySession(id: string): Promise<void>;
  
  // Environment management
  createEnvironment(sessionId: string): Promise<PlaygroundEnvironment>;
  destroyEnvironment(environmentId: string): Promise<void>;
  getEnvironmentLogs(environmentId: string): Promise<string[]>;
  
  // Execution
  startExecution(sessionId: string, input: any, options?: {
    agentId?: string;
    workflowId?: string;
    mode?: 'development' | 'testing' | 'shadow';
  }): Promise<PlaygroundExecution>;
  
  getExecution(executionId: string): Promise<PlaygroundExecution>;
  getExecutionEvents(executionId: string): Promise<PlaygroundExecutionEvent[]>;
  
  // Testing
  createTest(sessionId: string, test: Omit<PlaygroundTest, 'id' | 'status' | 'startedAt' | 'completedAt' | 'duration' | 'results'>): Promise<PlaygroundTest>;
  runTest(testId: string): Promise<PlaygroundTest>;
  getTestResults(testId: string): Promise<PlaygroundTestResult[]>;
  
  // Comparison
  compareExecutions(baselineId: string, comparisonId: string): Promise<PlaygroundComparison>;
  getComparison(id: string): Promise<PlaygroundComparison>;
  
  // Mock API management
  createMockApi(sessionId: string, mockApi: Omit<MockApi, 'name'>): Promise<MockApi>;
  updateMockApi(apiId: string, updates: Partial<MockApi>): Promise<MockApi>;
  deleteMockApi(apiId: string): Promise<void>;
}

// Built-in mock APIs for common services
export const BUILT_IN_MOCK_APIS: Omit<MockApi, 'name'>[] = [
  {
    baseUrl: 'https://mock-api.google.com/calendar',
    endpoints: [
      {
        path: '/v3/calendars/{calendarId}/events',
        method: 'POST',
        description: 'Create a calendar event',
        requestSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            description: { type: 'string' },
            start: { type: 'object' },
            end: { type: 'object' },
            attendees: { type: 'array' }
          }
        },
        responseSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            htmlLink: { type: 'string' },
            status: { type: 'string' }
          }
        },
        examples: [
          {
            request: {
              summary: 'Test Meeting',
              description: 'A test meeting',
              start: { dateTime: '2024-01-15T10:00:00Z' },
              end: { dateTime: '2024-01-15T11:00:00Z' },
              attendees: [{ email: 'test@example.com' }]
            },
            response: {
              id: 'mock_event_id_123',
              htmlLink: 'https://calendar.google.com/event/123',
              status: 'confirmed'
            },
            description: 'Basic meeting creation'
          }
        ],
        errorResponses: [
          {
            status: 400,
            error: 'Invalid request',
            description: 'Missing required fields'
          },
          {
            status: 401,
            error: 'Unauthorized',
            description: 'Invalid or expired token'
          }
        ]
      }
    ],
    authentication: 'oauth',
    rateLimiting: true,
    responseDelay: 100
  },
  {
    baseUrl: 'https://mock-api.google.com/forms',
    endpoints: [
      {
        path: '/v1/forms/{formId}/responses',
        method: 'POST',
        description: 'Submit a form response',
        requestSchema: {
          type: 'object',
          properties: {
            responses: { type: 'object' }
          }
        },
        responseSchema: {
          type: 'object',
          properties: {
            responseId: { type: 'string' },
            status: { type: 'string' }
          }
        },
        examples: [
          {
            request: {
              responses: {
                'question1': 'John Doe',
                'question2': 'johndoe@example.com'
              }
            },
            response: {
              responseId: 'mock_response_456',
              status: 'submitted'
            },
            description: 'Basic form submission'
          }
        ],
        errorResponses: [
          {
            status: 400,
            error: 'Invalid form data',
            description: 'Form validation failed'
          }
        ]
      }
    ],
    authentication: 'api_key',
    rateLimiting: false,
    responseDelay: 50
  }
];

// Example playground session
export const EXAMPLE_PLAYGROUND_SESSION: Partial<PlaygroundSession> = {
  name: 'Lead Generation Testing',
  description: 'Testing the lead generation workflow with mock APIs',
  metadata: {
    mode: 'testing',
    environment: 'mock'
  }
};
