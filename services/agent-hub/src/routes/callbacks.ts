import { Router } from "express";
import { supabaseAdmin, broadcastRunUpdate } from "../lib/supabase.js";
import { endRunTrace } from "../lib/langfuse.js";
import { logger } from "../lib/logger.js";
import { N8nCallbackPayload, createApiResponse } from "@agent-hub/shared";

export const callbacksRouter = Router();

// n8n callback endpoint
callbacksRouter.post("/n8n", async (req, res) => {
  const parse = N8nCallbackPayload.safeParse(req.body);
  if (!parse.success) {
    logger.error({ error: parse.error, body: req.body }, "Invalid n8n callback payload");
    return res.status(400).json(createApiResponse(null, "Invalid callback payload"));
  }
  
  const { runId, status, output, artifacts, costUsd, latencyMs, error } = parse.data;
  
  try {
    // Update run status
    const update: Record<string, unknown> = {
      status: status === "success" ? "success" : status,
      output: output ?? null,
      cost_usd: costUsd ?? null,
      latency_ms: latencyMs ?? null,
      error: error ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error: runUpdateErr } = await supabaseAdmin
      .from("runs")
      .update(update)
      .eq("id", runId);
      
    if (runUpdateErr) {
      logger.error({ runUpdateErr }, "Failed to update run");
    }

    // Insert artifacts if provided
    if (artifacts && artifacts.length > 0) {
      const rows = artifacts.map((a) => ({ ...a, run_id: runId }));
      const { error: artErr } = await supabaseAdmin
        .from("artifacts")
        .insert(rows);
        
      if (artErr) {
        logger.error({ artErr }, "Failed to insert artifacts");
      }
    }

    // Broadcast status update to real-time subscribers
    await broadcastRunUpdate(runId, {
      type: "status",
      payload: { 
        runId, 
        status, 
        costUsd, 
        latencyMs,
        error,
        artifacts: artifacts?.length || 0,
      },
    }).catch((e) => logger.warn({ e }, "Broadcast failed"));

    // End observability trace
    await endRunTrace(runId, status, { output, error, costUsd, latencyMs }).catch(
      (e) => logger.warn({ e }, "Langfuse end failed")
    );

    logger.info({ runId, status, costUsd, latencyMs }, "Run completed via n8n callback");
    
    return res.json(createApiResponse({ success: true }));
    
  } catch (err) {
    logger.error({ err, runId }, "Failed to process n8n callback");
    return res.status(500).json(createApiResponse(null, "Failed to process callback"));
  }
});

// Health check for n8n
callbacksRouter.get("/health", (req, res) => {
  res.json(createApiResponse({ 
    status: "healthy", 
    timestamp: new Date().toISOString() 
  }));
});
