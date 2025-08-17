import { logger } from "./logger.js";

// Optional Langfuse integration for observability
let langfuse: any = null;
let langfuseInitialized = false;

async function initLangfuse() {
  if (langfuseInitialized) return;
  
  // Langfuse is optional - currently disabled to avoid dependency issues
  // To enable: install @langfuse/node and set LANGFUSE_SECRET_KEY
  logger.info("Langfuse integration disabled (optional observability feature)");
  
  langfuseInitialized = true;
}

export async function startRunTrace(
  runId: string,
  projectId: string,
  agent: string,
  input: unknown
) {
  await initLangfuse();
  if (!langfuse) return;
  
  try {
    const trace = langfuse.trace({
      id: runId,
      name: `agent:${agent}`,
      metadata: {
        projectId,
        agent,
      },
      input,
    });
    
    return trace;
  } catch (error) {
    logger.warn({ error, runId }, "Failed to start Langfuse trace");
  }
}

export async function endRunTrace(
  runId: string,
  status: string,
  data: {
    output?: unknown;
    error?: string;
    costUsd?: number;
    latencyMs?: number;
  }
) {
  await initLangfuse();
  if (!langfuse) return;
  
  try {
    await langfuse.trace({
      id: runId,
      output: data.output,
      level: status === "success" ? "DEFAULT" : "ERROR",
      statusMessage: data.error,
      metadata: {
        costUsd: data.costUsd,
        latencyMs: data.latencyMs,
      },
    });
    
    await langfuse.flushAsync();
  } catch (error) {
    logger.warn({ error, runId }, "Failed to end Langfuse trace");
  }
}
