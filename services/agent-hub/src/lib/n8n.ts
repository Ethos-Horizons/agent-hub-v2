import fetch from "node-fetch";
import { logger } from "./logger.js";

const N8N_BASE = process.env.N8N_BASE || "";

export async function callN8n(flow: string, payload: any): Promise<{ executionId?: string } | undefined> {
  if (!N8N_BASE) {
    throw new Error("N8N_BASE environment variable not set");
  }
  
  const url = `${N8N_BASE.replace(/\/$/, "")}/${flow}`;
  
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    const text = await resp.text();
    
    try {
      const json = JSON.parse(text);
      logger.info({ url, status: resp.status, executionId: json?.executionId }, "n8n called successfully");
      return { executionId: json?.executionId };
    } catch {
      logger.info({ url, status: resp.status, response: text }, "n8n called (non-json response)");
      return undefined;
    }
  } catch (error) {
    logger.error({ error, url }, "n8n call failed");
    throw error;
  }
}
