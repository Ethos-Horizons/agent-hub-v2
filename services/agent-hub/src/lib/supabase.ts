import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function broadcastRunUpdate(
  runId: string,
  message: { type: string; payload?: unknown }
) {
  try {
    await supabaseAdmin.channel(`run:${runId}`).send({
      type: "broadcast",
      event: message.type,
      payload: message,
    });
  } catch (error) {
    logger.warn({ error, runId }, "Failed to broadcast run update");
  }
}
