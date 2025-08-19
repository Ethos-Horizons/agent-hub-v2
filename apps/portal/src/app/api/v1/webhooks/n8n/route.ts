import { NextRequest, NextResponse } from 'next/server';
import { ok, unauthorized, badRequest, serverError } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-n8n-signature');
    if (!signature) {
      logger.warn('N8N webhook received without signature');
      return unauthorized('Missing webhook signature');
    }

    // Parse webhook payload
    const payload = await request.json();
    logger.info('N8N webhook received', { 
      workflowId: payload.workflowId,
      executionId: payload.executionId,
      status: payload.status 
    });

    // Process webhook based on type
    switch (payload.type) {
      case 'workflow.completed':
        // Handle workflow completion
        logger.info('Workflow completed', { 
          workflowId: payload.workflowId,
          executionId: payload.executionId 
        });
        break;
        
      case 'workflow.failed':
        // Handle workflow failure
        logger.warn('Workflow failed', { 
          workflowId: payload.workflowId,
          executionId: payload.executionId,
          error: payload.error 
        });
        break;
        
      default:
        logger.info('Unknown webhook type', { type: payload.type });
    }

    return ok({ success: true, message: 'Webhook processed' });
    
  } catch (error) {
    logger.error('N8N webhook processing failed', { error });
    return serverError('Failed to process webhook');
  }
}
