import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, broadcastRunUpdate } from '../lib/supabase.js';
import { callOpenAI } from '../lib/models.js';
import { logger } from '../lib/logger.js';
import { ConversationRequest, ConversationResponse, MemoryUpdate, ConversationResponseT } from '@agent-hub/shared';

const router = Router();

// POST /api/conversation - Main chatbot endpoint for website
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate request
    const parsed = ConversationRequest.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parsed.error.issues 
      });
    }

    const { message, session_id, user_id, context } = parsed.data;
    
    // Generate IDs
    const conversationId = uuidv4();
    const sessionId = session_id || uuidv4();
    
    // Get tenant ID from environment or request headers
    const tenantId = process.env.DEFAULT_TENANT_ID || req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    // Create or get conversation
    let conversation;
    if (session_id) {
      // Try to find existing conversation
      const { data: existingConv } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single();
      
      conversation = existingConv;
    }
    
    if (!conversation) {
      // Create new conversation
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          tenant_id: tenantId,
          session_id: sessionId,
          visitor_id: user_id,
          title: 'Chat Session',
          status: 'active',
          metadata: { context }
        })
        .select()
        .single();
      
      conversation = newConv;
    }
    
    if (!conversation) {
      return res.status(500).json({ error: 'Failed to create conversation' });
    }
    
    // Create message record
    const { data: messageRecord } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        tenant_id: tenantId,
        content: message,
        message_type: 'user',
        metadata: { context }
      })
      .select()
      .single();
    
    // Retrieve conversation memory for context
    const memoryContext = await getConversationMemory(sessionId, tenantId);

    // Run a local AI response for now
    const prompt = `You are a helpful assistant. Reply to the user.\nUser: ${message}`;
    const aiText = await callOpenAI(prompt, {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      maxTokens: 400,
      temperature: 0.7,
    });

    // Save assistant message
    await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        tenant_id: tenantId,
        content: aiText,
        message_type: 'bot',
        metadata: { model: process.env.OPENAI_MODEL || 'gpt-4o-mini' }
      });

    const response: ConversationResponseT = {
      id: conversation.id,
      message: aiText,
      session_id: sessionId,
      status: 'completed',
      metadata: { response_time_ms: Date.now() - startTime }
    };

    res.json(response);

  } catch (error) {
    logger.error({ error }, 'Conversation endpoint error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/conversation/:id - Get conversation status with latest message
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get the latest assistant message
    const { data: latestMessage } = await supabaseAdmin
      .from('messages')
      .select('content, message_type, timestamp, metadata, created_at')
      .eq('conversation_id', id)
      .eq('message_type', 'bot')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const response = {
      id: conversation.id,
      message: latestMessage?.content || "Still processing...",
      session_id: conversation.session_id,
      status: latestMessage ? 'completed' : 'processing',
      metadata: {
        tokens_used: latestMessage?.metadata?.tokens_used,
        cost_usd: latestMessage?.metadata?.cost_usd,
        last_updated: latestMessage?.created_at || conversation.updated_at
      }
    };

    res.json(response);

  } catch (error) {
    logger.error({ error }, 'Get conversation error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/conversation/memory - Store conversation memory (called by n8n)
router.post('/memory', async (req, res) => {
  try {
    const parsed = MemoryUpdate.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid memory update', 
        details: parsed.error.issues 
      });
    }

    const { session_id, content, metadata } = parsed.data;
    
    // TODO: Replace with your actual project ID
    const projectId = process.env.DEFAULT_PROJECT_ID || uuidv4();

    // Store in memory table with embeddings (you can add OpenAI embedding generation here)
    const { error } = await supabaseAdmin
      .from('memory')
      .insert({
        project_id: projectId,
        doc_id: session_id,
        content,
        metadata: {
          ...metadata,
          session_id,
          created_at: new Date().toISOString()
        }
      });

    if (error) {
      logger.error({ error }, 'Failed to store memory');
      return res.status(500).json({ error: 'Failed to store memory' });
    }

    res.json({ success: true });

  } catch (error) {
    logger.error({ error }, 'Memory storage error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to retrieve conversation memory
async function getConversationMemory(sessionId: string, tenantId: string, limit = 10) {
  try {
    // Get recent messages from this conversation session
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('content, role, created_at')
      .eq('conversation_id', sessionId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error({ error }, 'Failed to retrieve conversation memory');
      return [];
    }

    return messages || [];
  } catch (error) {
    logger.error({ error }, 'Memory retrieval error');
    return [];
  }
}

export { router as conversationRouter };
