import "dotenv/config";
import express from "express";
import cors from "cors";
import { runsRouter } from "./routes/runs.js";
import { callbacksRouter } from "./routes/callbacks.js";
import { agentsRouter } from "./routes/agents.js";
import { conversationsRouter } from "./routes/conversations.js";
import { logger } from "./lib/logger.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API routes
app.use("/runs", runsRouter);
app.use("/callbacks", callbacksRouter);
app.use("/agents", agentsRouter);
app.use("/conversations", conversationsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, url: req.url }, "Request error");
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  logger.info({ port }, "AgentHub API server listening");
});
