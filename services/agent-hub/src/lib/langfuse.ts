import { logger } from "./logger.js";

// Optional Langfuse integration for observability
let langfuse: any = null;

try {
  if (process.env.LANGFUSE_SECRET_KEY) {
    const { Langfuse } = await import("@langfuse/node");
    langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL,
    });
    logger.info("Langfuse initialized for observability");
  }
} catch (error) {
  logger.warn({ error }, "Langfuse not available (optional dependency)");
}

export async function startRunTrace(
  runId: string,
  projectId: string,
  agent: string,
  input: unknown
) {
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
