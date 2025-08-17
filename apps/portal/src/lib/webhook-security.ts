import { createHmac, timingSafeEqual } from 'crypto';
import { getServerEnv } from '@/config/env';

// HMAC verification utility for webhook security
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret?: string
): boolean {
  try {
    const serverEnv = getServerEnv();
    const webhookSecret = secret || serverEnv.HMAC_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('HMAC_WEBHOOK_SECRET not configured');
    }
    
    // Create HMAC with SHA-256
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex');
    
    // Expected format: "sha256=<hash>"
    const expectedHeader = `sha256=${expectedSignature}`;
    
    // Constant-time comparison to prevent timing attacks
    const actualBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedHeader, 'utf8');
    
    if (actualBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(actualBuffer, expectedBuffer);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

// Helper to extract raw body from Next.js request
export async function getRawBody(request: Request): Promise<string> {
  const arrayBuffer = await request.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('utf8');
}

// Helper to get signature from common header formats
export function extractSignature(request: Request): string | null {
  // Common webhook signature headers
  const signatures = [
    request.headers.get('x-signature'),
    request.headers.get('x-hub-signature-256'),
    request.headers.get('x-signature-sha256'),
  ];
  
  return signatures.find(sig => sig !== null) || null;
}
