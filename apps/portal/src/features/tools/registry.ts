// Tool Registry Implementation
// This implements GPT-5's tool-first approach for security and observability

import { 
  ToolRegistry as IToolRegistry,
  Tool,
  ToolContext,
  ToolExecution,
  ToolSchema
} from './types';
import { logger } from '@/lib/logger';

export class ToolRegistry implements IToolRegistry {
  public tools: Map<string, Tool> = new Map();
  private executions: Map<string, ToolExecution> = new Map();

  constructor() {
    // Initialize with built-in tools
    this.initializeBuiltInTools();
  }

  private initializeBuiltInTools() {
    // Calendar tool
    this.register({
      schema: {
        name: 'calendar.createEvent',
        description: 'Create a calendar event in Google Calendar',
        inputSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Event title' },
            description: { type: 'string', description: 'Event description' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            attendees: { 
              type: 'array', 
              items: { type: 'string', format: 'email' }
            },
            location: { type: 'string' }
          },
          required: ['summary', 'startTime', 'endTime']
        },
        outputSchema: {
          type: 'object',
          properties: {
            eventId: { type: 'string' },
            htmlLink: { type: 'string' },
            status: { type: 'string' }
          }
        }
      },
      handler: async (ctx: ToolContext, input: any) => {
        logger.info('Creating calendar event', { input, tenantId: ctx.tenantId });
        
        // TODO: Replace with actual Google Calendar API integration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          eventId: `event_${Date.now()}`,
          htmlLink: `https://calendar.google.com/event/${Date.now()}`,
          status: 'confirmed'
        };
      },
      policy: {
        allowedDomains: ['googleapis.com'],
        rateLimit: { requests: 100, window: 3600 }
      }
    });

    // Forms tool
    this.register({
      schema: {
        name: 'forms.submitResponse',
        description: 'Submit a response to a Google Form',
        inputSchema: {
          type: 'object',
          properties: {
            formId: { type: 'string' },
            responses: {
              type: 'object',
              additionalProperties: true
            }
          },
          required: ['formId', 'responses']
        },
        outputSchema: {
          type: 'object',
          properties: {
            submissionId: { type: 'string' },
            status: { type: 'string' }
          }
        }
      },
      handler: async (ctx: ToolContext, input: any) => {
        logger.info('Submitting form response', { formId: input.formId, tenantId: ctx.tenantId });
        
        // TODO: Replace with actual Google Forms API integration
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          submissionId: `sub_${Date.now()}`,
          status: 'submitted'
        };
      },
      policy: {
        allowedDomains: ['googleapis.com'],
        rateLimit: { requests: 50, window: 3600 }
      }
    });

    // Web fetch tool
    this.register({
      schema: {
        name: 'web.fetchJSON',
        description: 'Fetch JSON data from a web API with domain allowlist',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
            headers: { type: 'object' },
            body: { type: 'object' }
          },
          required: ['url']
        },
        outputSchema: {
          type: 'object',
          properties: {
            status: { type: 'number' },
            data: { type: 'object' },
            headers: { type: 'object' }
          }
        }
      },
      handler: async (ctx: ToolContext, input: any) => {
        logger.info('Fetching JSON from web', { url: input.url, tenantId: ctx.tenantId });
        
        // Validate domain
        const url = new URL(input.url);
        if (!this.isDomainAllowed(url.hostname, ctx.tenantId)) {
          throw new Error(`Domain ${url.hostname} is not allowed for tenant ${ctx.tenantId}`);
        }
        
        // TODO: Replace with actual fetch implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          status: 200,
          data: { message: 'Mock response from web API' },
          headers: { 'content-type': 'application/json' }
        };
      },
      policy: {
        allowedDomains: ['api.example.com', 'data.example.com'],
        rateLimit: { requests: 1000, window: 3600 }
      }
    });

    // Lead capture tool
    this.register({
      schema: {
        name: 'lead.capture',
        description: 'Capture lead information and store in database',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            company: { type: 'string' },
            phone: { type: 'string' },
            source: { type: 'string' },
            notes: { type: 'string' }
          },
          required: ['name', 'email']
        },
        outputSchema: {
          type: 'object',
          properties: {
            leadId: { type: 'string' },
            status: { type: 'string' },
            score: { type: 'number' }
          }
        }
      },
      handler: async (ctx: ToolContext, input: any) => {
        logger.info('Capturing lead', { email: input.email, tenantId: ctx.tenantId });
        
        // TODO: Replace with actual database storage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Calculate lead score
        const score = this.calculateLeadScore(input);
        
        return {
          leadId: `lead_${Date.now()}`,
          status: 'captured',
          score
        };
      },
      policy: {
        rateLimit: { requests: 100, window: 3600 }
      }
    });

    // Email tool
    this.register({
      schema: {
        name: 'email.send',
        description: 'Send an email via configured email service',
        inputSchema: {
          type: 'object',
          properties: {
            to: { type: 'string', format: 'email' },
            subject: { type: 'string' },
            body: { type: 'string' },
            template: { type: 'string' },
            variables: { type: 'object' }
          },
          required: ['to', 'subject', 'body']
        },
        outputSchema: {
          type: 'object',
          properties: {
            messageId: { type: 'string' },
            status: { type: 'string' }
          }
        }
      },
      handler: async (ctx: ToolContext, input: any) => {
        logger.info('Sending email', { to: input.to, tenantId: ctx.tenantId });
        
        // TODO: Replace with actual email service integration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          messageId: `msg_${Date.now()}`,
          status: 'sent'
        };
      },
      policy: {
        rateLimit: { requests: 50, window: 3600 }
      }
    });

    logger.info('Built-in tools initialized', { count: this.tools.size });
  }

  public register(tool: Tool): void {
    if (this.tools.has(tool.schema.name)) {
      logger.warn('Tool already registered, overwriting', { name: tool.schema.name });
    }
    
    this.tools.set(tool.schema.name, tool);
    logger.info('Tool registered', { name: tool.schema.name });
  }

  public get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  public list(): Tool[] {
    return Array.from(this.tools.values());
  }

  public validateInput(toolName: string, input: any): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return false;
    }

    // TODO: Implement proper JSON Schema validation
    // For now, just check if required fields are present
    const required = tool.schema.inputSchema.required || [];
    return required.every((field: string) => input && input[field] !== undefined);
  }

  public async execute(toolName: string, ctx: ToolContext, input: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    // Validate input
    if (!this.validateInput(toolName, input)) {
      throw new Error(`Invalid input for tool ${toolName}`);
    }

    // Check rate limits
    if (!this.checkRateLimit(toolName, ctx.tenantId)) {
      throw new Error(`Rate limit exceeded for tool ${toolName}`);
    }

    // Create execution record
    const execution: ToolExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      toolName,
      input,
      startTime: new Date(),
              context: {
          tenantId: ctx.tenantId,
          userId: ctx.userId
        }
    };

    this.executions.set(execution.id, execution);

    try {
      // Execute tool
      const output = await tool.handler(ctx, input);
      
      // Update execution record
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.output = output;
      
      logger.info('Tool executed successfully', { 
        toolName, 
        executionId: execution.id, 
        duration: execution.duration 
      });

      return output;

    } catch (error) {
      // Update execution record with error
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.error = error instanceof Error ? error.message : String(error);
      
      logger.error('Tool execution failed', { 
        toolName, 
        executionId: execution.id, 
        error: execution.error 
      });

      throw error;
    }
  }

  private isDomainAllowed(domain: string, tenantId: string): boolean {
    // TODO: Implement proper domain allowlist per tenant
    const allowedDomains = ['googleapis.com', 'api.example.com', 'data.example.com'];
    return allowedDomains.includes(domain);
  }

  private calculateLeadScore(lead: any): number {
    let score = 0;
    
    // Basic scoring logic
    if (lead.name) score += 10;
    if (lead.email) score += 15;
    if (lead.company) score += 20;
    if (lead.phone) score += 15;
    if (lead.source) score += 5;
    if (lead.notes) score += 10;
    
    // Bonus for complete information
    if (score >= 50) score += 20;
    
    return Math.min(score, 100);
  }

  private checkRateLimit(toolName: string, tenantId: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool || !tool.policy?.rateLimit) {
      return true; // No rate limit
    }

    const { requests, window } = tool.policy.rateLimit;
    const now = Date.now();
    const windowStart = now - (window * 1000);

    // Count executions in the current window
    let count = 0;
    for (const execution of this.executions.values()) {
      if (execution.toolName === toolName && 
          execution.context.tenantId === tenantId &&
          execution.startTime.getTime() >= windowStart) {
        count++;
      }
    }

    return count < requests;
  }

  // Helper methods for monitoring and debugging
  public getExecutions(toolName?: string, tenantId?: string): ToolExecution[] {
    let executions = Array.from(this.executions.values());
    
    if (toolName) {
      executions = executions.filter(e => e.toolName === toolName);
    }
    
    if (tenantId) {
      executions = executions.filter(e => e.context.tenantId === tenantId);
    }
    
    return executions;
  }

  public getExecution(id: string): ToolExecution | undefined {
    return this.executions.get(id);
  }

  public clearExecutions(): void {
    this.executions.clear();
    logger.info('Tool executions cleared');
  }

  public getToolStats(): Record<string, { totalExecutions: number; successRate: number; avgDuration: number }> {
    const stats: Record<string, { totalExecutions: number; successRate: number; avgDuration: number }> = {};
    
    for (const tool of this.tools.values()) {
      const executions = this.getExecutions(tool.schema.name);
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(e => !e.error).length;
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
      const avgDuration = executions.length > 0 
        ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length 
        : 0;
      
      stats[tool.schema.name] = {
        totalExecutions,
        successRate,
        avgDuration
      };
    }
    
    return stats;
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();
