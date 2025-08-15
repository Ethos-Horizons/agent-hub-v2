import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { logger } from "../lib/logger.js";
import { createApiResponse, createPaginatedResponse } from "@agent-hub/shared";

export const agentsRouter = Router();

// Get all agents
agentsRouter.get("/", async (req, res) => {
  const { limit = "20", offset = "0", status, type } = req.query;
  
  try {
    let query = supabaseAdmin
      .from("agents")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
      
    if (status) {
      query = query.eq("status", status);
    }
    
    if (type) {
      query = query.eq("type", type);
    }
    
    const { data: agents, error, count } = await query;
    
    if (error) {
      logger.error({ error }, "Failed to fetch agents");
      return res.status(500).json(createApiResponse(null, "Failed to fetch agents"));
    }
    
    return res.json(createPaginatedResponse(
      agents || [],
      count || 0,
      Math.floor(Number(offset) / Number(limit)),
      Number(limit)
    ));
    
  } catch (error) {
    logger.error({ error }, "Failed to fetch agents");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Get agent by ID with skills and memories
agentsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data: agent, error: agentError } = await supabaseAdmin
      .from("agents")
      .select(`
        *,
        skills:agent_skills(*),
        memories:agent_memories(*)
      `)
      .eq("id", id)
      .single();
      
    if (agentError || !agent) {
      return res.status(404).json(createApiResponse(null, "Agent not found"));
    }
    
    return res.json(createApiResponse(agent));
    
  } catch (error) {
    logger.error({ error, agentId: id }, "Failed to fetch agent");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Search agent knowledge base
agentsRouter.post("/:id/search", async (req, res) => {
  const { id } = req.params;
  const { query, embedding, limit = 5, threshold = 0.7 } = req.body;
  
  if (!embedding) {
    return res.status(400).json(createApiResponse(null, "Embedding vector required"));
  }
  
  try {
    // Use your existing search function
    const { data: results, error } = await supabaseAdmin
      .rpc("search_knowledge_base", {
        target_agent_id: id,
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit,
      });
      
    if (error) {
      logger.error({ error }, "Knowledge base search failed");
      return res.status(500).json(createApiResponse(null, "Search failed"));
    }
    
    return res.json(createApiResponse({
      query,
      results: results || [],
      total: results?.length || 0,
    }));
    
  } catch (error) {
    logger.error({ error, agentId: id }, "Failed to search knowledge base");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Search agent memories
agentsRouter.post("/:id/memories/search", async (req, res) => {
  const { id } = req.params;
  const { query, embedding, limit = 10, threshold = 0.7 } = req.body;
  
  if (!embedding) {
    return res.status(400).json(createApiResponse(null, "Embedding vector required"));
  }
  
  try {
    // Use your existing search function
    const { data: results, error } = await supabaseAdmin
      .rpc("search_agent_memories", {
        target_agent_id: id,
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit,
      });
      
    if (error) {
      logger.error({ error }, "Memory search failed");
      return res.status(500).json(createApiResponse(null, "Search failed"));
    }
    
    return res.json(createApiResponse({
      query,
      results: results || [],
      total: results?.length || 0,
    }));
    
  } catch (error) {
    logger.error({ error, agentId: id }, "Failed to search memories");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Create new agent
agentsRouter.post("/", async (req, res) => {
  const { name, type, description, config = {} } = req.body;
  
  if (!name || !type) {
    return res.status(400).json(createApiResponse(null, "Name and type are required"));
  }
  
  try {
    const { data: agent, error } = await supabaseAdmin
      .from("agents")
      .insert({
        name,
        type,
        description,
        config,
        status: "inactive",
        version: "1.0.0",
      })
      .select()
      .single();
      
    if (error) {
      logger.error({ error }, "Failed to create agent");
      return res.status(500).json(createApiResponse(null, "Failed to create agent"));
    }
    
    return res.status(201).json(createApiResponse(agent));
    
  } catch (error) {
    logger.error({ error }, "Failed to create agent");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Update agent
agentsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, description, status, config } = req.body;
  
  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (config) updateData.config = config;
    
    const { data: agent, error } = await supabaseAdmin
      .from("agents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      logger.error({ error }, "Failed to update agent");
      return res.status(500).json(createApiResponse(null, "Failed to update agent"));
    }
    
    if (!agent) {
      return res.status(404).json(createApiResponse(null, "Agent not found"));
    }
    
    return res.json(createApiResponse(agent));
    
  } catch (error) {
    logger.error({ error, agentId: id }, "Failed to update agent");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});
