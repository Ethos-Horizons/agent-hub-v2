import OpenAI from "openai";
import { logger } from "./logger.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

export async function draftPlan(agent: string, input: unknown) {
  // Simple plan generation - can be enhanced with actual AI planning
  const estimatedTokens = JSON.stringify(input).length / 4;
  
  const steps = [
    { id: "validate", desc: `Validate inputs for ${agent}` },
    { id: "execute", desc: `Execute n8n workflow: ${agent}` },
    { id: "process", desc: `Process results and artifacts` },
  ];
  
  return { 
    steps,
    estimatedTokens: Math.round(estimatedTokens),
    estimatedCostUsd: Number((estimatedTokens * 0.000002).toFixed(6)),
  };
}

export async function callOpenAI(prompt: string, options: {
  model?: string;
  maxTokens?: number;
  temperature?: number;
} = {}) {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: options.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
    });
    
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    logger.error({ error, prompt: prompt.slice(0, 100) }, "OpenAI API call failed");
    throw error;
  }
}
