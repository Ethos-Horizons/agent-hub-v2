import { Router } from "express";
import { supabaseAdmin, broadcastRunUpdate } from "../lib/supabase.js";
import { callN8n } from "../lib/n8n.js";
import { startRunTrace, endRunTrace } from "../lib/langfuse.js";
import { draftPlan } from "../lib/models.js";
import { logger } from "../lib/logger.js";
import { RunRequest, createApiResponse } from "@agent-hub/shared";
import { v4 as uuidv4 } from "uuid";

export const runsRouter = Router();

// Create new run
runsRouter.post("/", async (req, res) => {
  const parse = RunRequest.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json(createApiResponse(null, "Invalid request data"));
  }
  
  const { projectId, agent, input, simulate } = parse.data;
  const runId = uuidv4();

  try {
    // Insert run as queued
    const { error: insertError } = await supabaseAdmin
      .from("runs")
      .insert({
        id: runId,
        project_id: projectId,
        agent,
        status: simulate ? "queued" : "running",
        input,
      });
      
    if (insertError) {
      logger.error({ insertError }, "Failed to insert run");
      return res.status(500).json(createApiResponse(null, "Failed to create run"));
    }

    // If simulation, return plan without executing
    if (simulate) {
      const plan = await draftPlan(agent, input);
      return res.json(createApiResponse({ runId, simulate: true, plan }));
    }

    // Start trace for observability
    await startRunTrace(runId, projectId, agent, input).catch((e) =>
      logger.warn({ e }, "Langfuse start failed")
    );

    // Execute n8n workflow
    try {
      const n8nResp = await callN8n(agent, { runId, projectId, input });
      
      if (n8nResp?.executionId) {
        await supabaseAdmin
          .from("runs")
          .update({ n8n_execution_id: n8nResp.executionId })
          .eq("id", runId);
      }
      
      // Broadcast start status
      await broadcastRunUpdate(runId, {
        type: "status",
        payload: { runId, status: "running" },
      });
      
      return res.status(202).json(createApiResponse({ runId }));
      
    } catch (error) {
      logger.error({ err: error }, "n8n call failed");
      
      // Update run as failed
      await supabaseAdmin
        .from("runs")
        .update({ status: "error", error: String(error) })
        .eq("id", runId);
        
      await broadcastRunUpdate(runId, {
        type: "status",
        payload: { runId, status: "error", error: String(error) },
      });
      
      return res.status(500).json(createApiResponse({ runId }, "Workflow execution failed"));
    }
    
  } catch (error) {
    logger.error({ error }, "Run creation failed");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// Get run by ID
runsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data: run, error } = await supabaseAdmin
      .from("runs")
      .select(`
        *,
        artifacts:run_artifacts(*)
      `)
      .eq("id", id)
      .single();
      
    if (error || !run) {
      return res.status(404).json(createApiResponse(null, "Run not found"));
    }
    
    return res.json(createApiResponse(run));
    
  } catch (error) {
    logger.error({ error, runId: id }, "Failed to fetch run");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});

// List runs for a project
runsRouter.get("/", async (req, res) => {
  const { projectId, limit = "20", offset = "0", status } = req.query;
  
  if (!projectId) {
    return res.status(400).json(createApiResponse(null, "projectId is required"));
  }
  
  try {
    let query = supabaseAdmin
      .from("runs")
      .select("*", { count: "exact" })
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
      
    if (status) {
      query = query.eq("status", status);
    }
    
    const { data: runs, error, count } = await query;
    
    if (error) {
      logger.error({ error }, "Failed to fetch runs");
      return res.status(500).json(createApiResponse(null, "Failed to fetch runs"));
    }
    
    return res.json(createApiResponse({
      items: runs || [],
      total: count || 0,
      limit: Number(limit),
      offset: Number(offset),
    }));
    
  } catch (error) {
    logger.error({ error }, "Failed to fetch runs");
    return res.status(500).json(createApiResponse(null, "Internal server error"));
  }
});
