// Tool SDK Types - Safe function-calling architecture
// This implements GPT-5's tool-first approach for security and observability

export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: Record<string, any>; // JSON Schema
  outputSchema: Record<string, any>; // JSON Schema
  examples?: Array<{
    input: any;
    output: any;
    description: string;
  }>;
}

export interface ToolContext {
  tenantId: string;
  userId: string;
  logger: any;
  fetch: (url: string, options?: RequestInit) => Promise<Response>;
  secretsResolver: (key: string) => Promise<string | null>;
  cache: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any, ttl?: number) => Promise<void>;
  };
}

export interface Tool {
  schema: ToolSchema;
  handler: (ctx: ToolContext, input: any) => Promise<any>;
  policy?: {
    allowedDomains?: string[];
    allowedTenants?: string[];
    rateLimit?: {
      requests: number;
      window: number; // seconds
    };
  };
}

export interface ToolExecution {
  id: string;
  toolName: string;
  input: any;
  output?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  context: {
    tenantId: string;
    userId: string;
    workflowId?: string;
    executionId?: string;
  };
}

export interface ToolRegistry {
  tools: Map<string, Tool>;
  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(): Tool[];
  validateInput(toolName: string, input: any): boolean;
  execute(toolName: string, ctx: ToolContext, input: any): Promise<any>;
}

// Built-in tool schemas for common operations
export const BUILT_IN_TOOLS = {
  CALENDAR_CREATE_EVENT: {
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

  FORMS_SUBMIT_RESPONSE: {
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

  WEB_FETCH_JSON: {
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

  LEAD_CAPTURE: {
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

  EMAIL_SEND: {
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
  }
} as const;

export type BuiltInToolName = keyof typeof BUILT_IN_TOOLS;
