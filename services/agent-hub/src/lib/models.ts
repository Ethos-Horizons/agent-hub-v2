import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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
      model: options.model || "gpt-4o-mini",
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

export async function callAnthropic(prompt: string, options: {
  model?: string;
  maxTokens?: number;
  temperature?: number;
} = {}) {
  if (!anthropic) {
    throw new Error("Anthropic API key not configured");
  }
  try {
    const resp = await anthropic.messages.create({
      model: options.model || "claude-3-5-sonnet-latest",
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: "user", content: prompt }],
    } as any);
    const content = (resp as any)?.content?.[0]?.text || (resp as any)?.content?.[0]?.content || "";
    return content;
  } catch (error) {
    logger.error({ error }, "Anthropic API call failed");
    throw error;
  }
}

export async function callGemini(prompt: string, options: {
  model?: string;
  maxTokens?: number;
  temperature?: number;
} = {}) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  try {
    const model = genAI.getGenerativeModel({ model: options.model || "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxTokens || 1000,
        temperature: options.temperature ?? 0.7,
      },
    } as any);
    const text = result.response.text();
    return text;
  } catch (error) {
    logger.error({ error }, "Gemini API call failed");
    throw error;
  }
}
