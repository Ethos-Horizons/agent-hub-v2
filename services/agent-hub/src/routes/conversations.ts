import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { logger } from "../lib/logger.js";
import { createApiResponse, createPaginatedResponse } from "@agent-hub/shared";

export const conversationsRouter = Router();

// Get conversations
conversationsRouter.get("/", async (req, res) => {
  const { limit = "20", offset = "0", status, visitor_id } = req.query;
  
  try {
    let query = supabaseAdmin
      .from("conversations")
      .select(`
        *,
        messages:messages(*)
      `, { count: "exact" })
      .order("start_time", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
      
    if (status) {
      query = query.eq("status", status);
    }
    
    if (visitor_id) {
      query = query.eq("visitor_id", visitor_id);
    }
    
    const { data: conversations, error, count } = await query;
    
    if (error) {
      logger.error({ error }, "Failed to fetch conversations");
      return res.status(500).json(createApiResponse(null, "Failed to fetch conversations"));
    }
    
    return res.json(createPaginatedResponse(
      conversations || [],
      count || 0,
      Math.floor(Number(offset) / Number(limit)),
      Number(limit)
    ));
    
  } catch (error) {
    logger.error({ error }, "Failed to fetch conversations");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Get conversation by ID
conversationsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data: conversation, error } = await supabaseAdmin
      .from("conversations")
      .select(`
        *,
        messages:messages(*),
        leads:leads(*)
      `)
      .eq("id", id)
      .single();
      
    if (error || !conversation) {
      return res.status(404).json(createApiResponse(null, "Conversation not found"));
    }
    
    return res.json(createApiResponse(conversation));
    
  } catch (error) {
    logger.error({ error, conversationId: id }, "Failed to fetch conversation");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Create new conversation
conversationsRouter.post("/", async (req, res) => {
  const { visitor_id, session_id, intent } = req.body;
  
  if (!visitor_id || !session_id) {
    return res.status(400).json(createApiResponse(null, "visitor_id and session_id are required"));
  }
  
  try {
    const { data: conversation, error } = await supabaseAdmin
      .from("conversations")
      .insert({
        visitor_id,
        session_id,
        intent,
        status: "active",
        lead_qualified: false,
      })
      .select()
      .single();
      
    if (error) {
      logger.error({ error }, "Failed to create conversation");
      return res.status(500).json(createApiResponse(null, "Failed to create conversation"));
    }
    
    return res.status(201).json(createApiResponse(conversation));
    
  } catch (error) {
    logger.error({ error }, "Failed to create conversation");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Add message to conversation
conversationsRouter.post("/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { message_type, content, metadata = {} } = req.body;
  
  if (!message_type || !content) {
    return res.status(400).json(createApiResponse(null, "message_type and content are required"));
  }
  
  if (!["user", "bot"].includes(message_type)) {
    return res.status(400).json(createApiResponse(null, "message_type must be 'user' or 'bot'"));
  }
  
  try {
    const { data: message, error } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: id,
        message_type,
        content,
        metadata,
      })
      .select()
      .single();
      
    if (error) {
      logger.error({ error }, "Failed to create message");
      return res.status(500).json(createApiResponse(null, "Failed to create message"));
    }
    
    return res.status(201).json(createApiResponse(message));
    
  } catch (error) {
    logger.error({ error, conversationId: id }, "Failed to create message");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Update conversation status
conversationsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, intent, lead_qualified, end_time } = req.body;
  
  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (intent !== undefined) updateData.intent = intent;
    if (lead_qualified !== undefined) updateData.lead_qualified = lead_qualified;
    if (end_time !== undefined) updateData.end_time = end_time;
    
    const { data: conversation, error } = await supabaseAdmin
      .from("conversations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      logger.error({ error }, "Failed to update conversation");
      return res.status(500).json(createApiResponse(null, "Failed to update conversation"));
    }
    
    if (!conversation) {
      return res.status(404).json(createApiResponse(null, "Conversation not found"));
    }
    
    return res.json(createApiResponse(conversation));
    
  } catch (error) {
    logger.error({ error, conversationId: id }, "Failed to update conversation");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});
