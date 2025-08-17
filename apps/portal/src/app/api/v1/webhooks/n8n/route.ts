import { NextRequest } from 'next/server';
import { ok, unauthorized, badRequest, serverError } from '@/lib/api-response';
import { verifyWebhookSignature, getRawBody, extractSignature } from '@/lib/webhook-security';

export async function POST(request: NextRequest) {
  try {
    // Extract signature from headers
    const signature = extractSignature(request);
    
    if (!signature) {
      return unauthorized('Missing webhook signature');
    }
    
    // Get raw body for signature verification
    const rawBody = await getRawBody(request);
    
    // Verify HMAC signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      return unauthorized('Invalid webhook signature');
    }
    
    // Parse the verified payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      return badRequest('Invalid JSON payload');
    }
    
    // Process the webhook event
    await processN8nWebhook(payload);
    
    return ok({ received: true });
    
  } catch (error) {
    console.error('N8N webhook processing failed:', error);
    return serverError('Webhook processing failed');
  }
}

// Safe webhook event processor
async function processN8nWebhook(payload: any) {
  // TODO: Implement actual webhook processing
  // This is a safe stub that logs the event
  console.log('N8N webhook received:', {
    type: payload.type,
    timestamp: new Date().toISOString(),
    // Don't log full payload to avoid sensitive data exposure
  });
  
  // Future implementation could:
  // - Queue the event for background processing
  // - Update run status
  // - Trigger real-time updates
  // - Store results in database
}
