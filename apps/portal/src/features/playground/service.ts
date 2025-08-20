// Playground Service Implementation
// This implements the playground concept for safe agent testing and transparency

import { 
  PlaygroundService as IPlaygroundService,
  PlaygroundSession,
  PlaygroundEnvironment,
  PlaygroundExecution,
  PlaygroundTest,
  PlaygroundComparison
} from './types';
import { logger } from '@/lib/logger';

export class PlaygroundService implements IPlaygroundService {
  private sessions: Map<string, PlaygroundSession> = new Map();
  private environments: Map<string, PlaygroundEnvironment> = new Map();
  private executions: Map<string, PlaygroundExecution> = new Map();
  private tests: Map<string, PlaygroundTest> = new Map();

  constructor() {
    // Initialize with example session
    this.initializeExampleSession();
  }

  private initializeExampleSession() {
    const exampleSession: PlaygroundSession = {
      id: 'example-session',
      tenantId: 'system',
      userId: 'system',
      name: 'Example Lead Generation Session',
      description: 'Testing the lead generation workflow in isolation',
      status: 'ready',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      metadata: {
        agentId: 'conversational-agent',
        workflowId: 'lead-gen-workflow',
        mode: 'testing',
        environment: 'isolated'
      }
    };

    this.sessions.set(exampleSession.id, exampleSession);
  }

  public async createSession(session: Omit<PlaygroundSession, 'id' | 'status' | 'createdAt'>): Promise<PlaygroundSession> {
    const playgroundSession: PlaygroundSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'creating',
      createdAt: new Date().toISOString(),
      ...session
    };

    this.sessions.set(playgroundSession.id, playgroundSession);
    logger.info('Playground session created', { sessionId: playgroundSession.id, name: playgroundSession.name });

    return playgroundSession;
  }

  public async getSession(id: string): Promise<PlaygroundSession> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Playground session ${id} not found`);
    }
    return session;
  }

  public async destroySession(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.status = 'destroyed';
      
      // Clean up related resources
      for (const [envId, env] of this.environments.entries()) {
        if (env.sessionId === id) {
          env.status = 'destroyed';
        }
      }
      
      for (const [execId, exec] of this.executions.entries()) {
        if (exec.sessionId === id) {
          exec.status = 'failed';
        }
      }
      
      logger.info('Playground session destroyed', { sessionId: id });
    }
  }

  public async createEnvironment(sessionId: string): Promise<PlaygroundEnvironment> {
    const session = await this.getSession(sessionId);
    
    const environment: PlaygroundEnvironment = {
      id: `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      status: 'creating',
      resources: {
        cpu: '0.5',
        memory: '512Mi',
        storage: '1Gi',
        network: 'isolated'
      },
      services: {
        database: 'mock',
        redis: 'mock',
        external: 'mock'
      },
      mockApis: this.createMockApis(),
      createdAt: new Date().toISOString(),
      logs: []
    };

    // Simulate environment creation
    setTimeout(() => {
      environment.status = 'ready';
      environment.accessUrl = `http://localhost:8080/playground/${environment.id}`;
      this.environments.set(environment.id, environment);
      logger.info('Playground environment ready', { environmentId: environment.id, sessionId });
    }, 3000);

    this.environments.set(environment.id, environment);
    logger.info('Playground environment created', { environmentId: environment.id, sessionId });

    return environment;
  }

  private createMockApis() {
    return [
      {
        name: 'Google Calendar API',
        baseUrl: 'https://mock-calendar-api.example.com',
        endpoints: [
          {
            path: '/events',
            method: 'POST',
            description: 'Create calendar event',
            requestSchema: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                startTime: { type: 'string' },
                endTime: { type: 'string' }
              }
            },
            responseSchema: {
              type: 'object',
              properties: {
                eventId: { type: 'string' },
                status: { type: 'string' }
              }
            },
            examples: [
              {
                request: { summary: 'Test Event', startTime: '2024-01-01T10:00:00Z' },
                response: { eventId: 'mock_event_123', status: 'confirmed' },
                description: 'Successful event creation'
              }
            ],
            errorResponses: [
              { status: 400, error: 'Invalid input', description: 'Missing required fields' }
            ]
          }
        ],
        authentication: 'api_key',
        rateLimiting: true,
        responseDelay: 100
      },
      {
        name: 'Google Forms API',
        baseUrl: 'https://mock-forms-api.example.com',
        endpoints: [
          {
            path: '/forms/{formId}/responses',
            method: 'POST',
            description: 'Submit form response',
            requestSchema: {
              type: 'object',
              properties: {
                responses: { type: 'object' }
              }
            },
            responseSchema: {
              type: 'object',
              properties: {
                submissionId: { type: 'string' },
                status: { type: 'string' }
              }
            },
            examples: [
              {
                request: { responses: { name: 'John Doe', email: 'john@example.com' } },
                response: { submissionId: 'mock_sub_456', status: 'submitted' },
                description: 'Successful form submission'
              }
            ],
            errorResponses: [
              { status: 404, error: 'Form not found', description: 'Invalid form ID' }
            ]
          }
        ],
        authentication: 'oauth',
        rateLimiting: true,
        responseDelay: 200
      }
    ];
  }

  public async getEnvironment(id: string): Promise<PlaygroundEnvironment> {
    const environment = this.environments.get(id);
    if (!environment) {
      throw new Error(`Playground environment ${id} not found`);
    }
    return environment;
  }

  public async getEnvironmentLogs(environmentId: string): Promise<string[]> {
    const environment = await this.getEnvironment(environmentId);
    return environment.logs;
  }

  public async addEnvironmentLog(environmentId: string, message: string): Promise<void> {
    const environment = await this.getEnvironment(environmentId);
    environment.logs.push(`${new Date().toISOString()}: ${message}`);
    
    // Keep only last 1000 logs
    if (environment.logs.length > 1000) {
      environment.logs = environment.logs.slice(-1000);
    }
  }

  public async createExecution(sessionId: string, agentId?: string, workflowId?: string, input?: any): Promise<PlaygroundExecution> {
    const session = await this.getSession(sessionId);
    
    const execution: PlaygroundExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      agentId,
      workflowId,
      input: input || {},
      status: 'queued',
      startedAt: new Date().toISOString(),
      events: [],
      state: {}
    };

    this.executions.set(execution.id, execution);
    logger.info('Playground execution created', { executionId: execution.id, sessionId });

    return execution;
  }

  public async getExecution(id: string): Promise<PlaygroundExecution> {
    const execution = this.executions.get(id);
    if (!execution) {
      throw new Error(`Playground execution ${id} not found`);
    }
    return execution;
  }

  public async addExecutionEvent(executionId: string, eventData: any): Promise<void> {
    const execution = await this.getExecution(executionId);
    
    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executionId,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    execution.events.push(event);
    logger.info('Execution event added', { executionId, eventType: event.type });
  }

  public async createTest(sessionId: string, testData: Omit<PlaygroundTest, 'id' | 'sessionId' | 'status' | 'startedAt' | 'results'>): Promise<PlaygroundTest> {
    const test: PlaygroundTest = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      results: [],
      ...testData
    };

    this.tests.set(test.id, test);
    logger.info('Playground test created', { testId: test.id, name: test.name });

    return test;
  }

  public async runTest(testId: string): Promise<PlaygroundTest> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Playground test ${testId} not found`);
    }

    test.status = 'running';
    test.startedAt = new Date().toISOString();

    try {
      // Run assertions
      for (const assertion of test.assertions) {
        const result = await this.evaluateAssertion(assertion, test.input);
        test.results.push(result);
      }

      // Determine overall test status
      const failedResults = test.results.filter(r => r.status === 'failed');
      test.status = failedResults.length > 0 ? 'failed' : 'passed';
      test.completedAt = new Date().toISOString();
      test.duration = test.completedAt ? new Date(test.completedAt).getTime() - new Date(test.startedAt).getTime() : 0;

      logger.info('Playground test completed', { testId, status: test.status, duration: test.duration });

    } catch (error) {
      test.status = 'failed';
      test.completedAt = new Date().toISOString();
      test.duration = test.completedAt ? new Date(test.completedAt).getTime() - new Date(test.startedAt).getTime() : 0;
      
      logger.error('Playground test failed', { testId, error: error instanceof Error ? error.message : String(error) });
    }

    return test;
  }

  private async evaluateAssertion(assertion: any, input: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      let actualValue: any;
      let passed = false;

      switch (assertion.type) {
        case 'equals':
          actualValue = this.extractValue(input, assertion.expression);
          passed = actualValue === assertion.expectedValue;
          break;
        case 'contains':
          actualValue = this.extractValue(input, assertion.expression);
          passed = String(actualValue).includes(assertion.expectedValue);
          break;
        case 'matches':
          actualValue = this.extractValue(input, assertion.expression);
          const regex = new RegExp(assertion.expectedValue);
          passed = regex.test(String(actualValue));
          break;
        case 'greater_than':
          actualValue = this.extractValue(input, assertion.expression);
          passed = Number(actualValue) > assertion.expectedValue;
          break;
        case 'less_than':
          actualValue = this.extractValue(input, assertion.expression);
          passed = Number(actualValue) < assertion.expectedValue;
          break;
        case 'custom':
          // TODO: Implement safe custom assertion evaluation
          actualValue = 'Custom assertion not implemented';
          passed = false;
          break;
        default:
          actualValue = 'Unknown assertion type';
          passed = false;
      }

      const duration = Date.now() - startTime;

      return {
        assertionId: assertion.id,
        assertionName: assertion.name,
        status: passed ? 'passed' : 'failed',
        actualValue,
        expectedValue: assertion.expectedValue,
        duration,
        metadata: {}
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        assertionId: assertion.id,
        assertionName: assertion.name,
        status: 'failed',
        actualValue: null,
        error: error instanceof Error ? error.message : String(error),
        duration,
        metadata: {}
      };
    }
  }

  private extractValue(input: any, path: string): any {
    // Simple path extraction (e.g., "user.name" -> input.user.name)
    const keys = path.split('.');
    let value = input;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  public async getTest(id: string): Promise<PlaygroundTest> {
    const test = this.tests.get(id);
    if (!test) {
      throw new Error(`Playground test ${id} not found`);
    }
    return test;
  }

  public async createComparison(sessionId: string, baselineExecutionId: string, comparisonExecutionId: string, name: string, description: string): Promise<PlaygroundComparison> {
    const baseline = await this.getExecution(baselineExecutionId);
    const comparison = await this.getExecution(comparisonExecutionId);

    const differences = this.findDifferences(baseline, comparison);
    
    const playgroundComparison: PlaygroundComparison = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      name,
      description,
      baselineExecutionId,
      comparisonExecutionId,
      createdAt: new Date().toISOString(),
      differences,
      summary: {
        totalDifferences: differences.length,
        criticalDifferences: differences.filter(d => d.severity === 'critical').length,
        performanceDelta: this.calculatePerformanceDelta(baseline, comparison),
        behaviorChanged: differences.some(d => d.type === 'behavior')
      }
    };

    logger.info('Playground comparison created', { 
      comparisonId: playgroundComparison.id, 
      differences: playgroundComparison.summary.totalDifferences 
    });

    return playgroundComparison;
  }

  private findDifferences(baseline: PlaygroundExecution, comparison: PlaygroundExecution): any[] {
    const differences: any[] = [];

    // Compare inputs
    if (JSON.stringify(baseline.input) !== JSON.stringify(comparison.input)) {
      differences.push({
        id: `diff_${Date.now()}_1`,
        type: 'input',
        path: 'root',
        baseline: baseline.input,
        comparison: comparison.input,
        severity: 'medium',
        description: 'Input data differs between executions',
        impact: 'May affect execution behavior'
      });
    }

    // Compare outputs
    if (JSON.stringify(baseline.output) !== JSON.stringify(comparison.output)) {
      differences.push({
        id: `diff_${Date.now()}_2`,
        type: 'output',
        path: 'root',
        baseline: baseline.output,
        comparison: comparison.output,
        severity: 'high',
        description: 'Output data differs between executions',
        impact: 'Behavior has changed'
      });
    }

    // Compare execution times
    const baselineDuration = baseline.events.length > 0 ? 
      new Date(baseline.events[baseline.events.length - 1].timestamp).getTime() - new Date(baseline.startedAt).getTime() : 0;
    const comparisonDuration = comparison.events.length > 0 ? 
      new Date(comparison.events[comparison.events.length - 1].timestamp).getTime() - new Date(comparison.startedAt).getTime() : 0;
    
    if (Math.abs(baselineDuration - comparisonDuration) > 1000) { // 1 second threshold
      differences.push({
        id: `diff_${Date.now()}_3`,
        type: 'performance',
        path: 'execution_time',
        baseline: baselineDuration,
        comparison: comparisonDuration,
        severity: 'low',
        description: 'Execution time differs significantly',
        impact: 'Performance characteristics have changed'
      });
    }

    return differences;
  }

  private calculatePerformanceDelta(baseline: PlaygroundExecution, comparison: PlaygroundExecution): number {
    // Simple performance comparison based on event count and timing
    const baselineEventCount = baseline.events.length;
    const comparisonEventCount = comparison.events.length;
    
    if (baselineEventCount === 0) return 0;
    
    return ((comparisonEventCount - baselineEventCount) / baselineEventCount) * 100;
  }

  // Helper methods for session management
  public async listSessions(tenantId?: string): Promise<PlaygroundSession[]> {
    let sessions = Array.from(this.sessions.values());
    
    if (tenantId) {
      sessions = sessions.filter(s => s.tenantId === tenantId);
    }
    
    return sessions;
  }

  public async getActiveSessions(tenantId?: string): Promise<PlaygroundSession[]> {
    const sessions = await this.listSessions(tenantId);
    return sessions.filter(s => s.status === 'ready' || s.status === 'running');
  }

  public async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions: string[] = [];
    
    for (const [id, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        expiredSessions.push(id);
      }
    }
    
    for (const sessionId of expiredSessions) {
      await this.destroySession(sessionId);
      this.sessions.delete(sessionId);
    }
    
    if (expiredSessions.length > 0) {
      logger.info('Cleaned up expired playground sessions', { count: expiredSessions.length });
    }
  }
}

// Export singleton instance
export const playgroundService = new PlaygroundService();
