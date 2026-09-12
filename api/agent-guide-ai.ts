import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";
import {
  AGENT_GUIDE_MAX_TEXT_LENGTH,
  buildAgentGuideInterpreterPrompt,
  isImmediateRiskText,
  normalizeAgentGuideText,
  parseAgentGuideModelActionId,
} from "./agentGuidePolicy.js";

const API_KEY = process.env.GEMINI_API_KEY;
const PRIMARY_MODEL = process.env.INTERNAL_GUIDE_AI_MODEL || process.env.AI_MODEL || "gemini-3.1-flash-lite";
const MODEL_CANDIDATES = [
  PRIMARY_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
].filter((value, index, array) => value && array.indexOf(value) === index);

const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX_REQUESTS = 12;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch {
    ai = null;
  }
}

function requestKey(req: any): string {
  const forwarded = req?.headers?.["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0] || "unknown";
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return String(req?.socket?.remoteAddress || "unknown");
}

function reserveRateSlot(key: string, now = Date.now()): boolean {
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function readBodyText(req: any): unknown {
  if (req?.body && typeof req.body === "object") return req.body.text;
  if (typeof req?.body === "string") {
    try {
      return JSON.parse(req.body)?.text;
    } catch {
      return null;
    }
  }
  return null;
}

async function classifyWithGemini(text: string): Promise<string> {
  if (!ai) throw new Error("AI unavailable");
  const prompt = buildAgentGuideInterpreterPrompt(text);
  let lastError: unknown = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 80,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionId: { type: Type.STRING },
            },
            required: ["actionId"],
          },
        },
      });
      const parsed = JSON.parse(response.text || "{}");
      const actionId = parseAgentGuideModelActionId(parsed?.actionId);
      if (!actionId) throw new Error("Invalid model output");
      return actionId;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("AI unavailable");
}

export default async function agentGuideAiHandler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ status: "method_not_allowed" });
  }

  if (process.env.INTERNAL_GUIDE_AI_ENABLED === "false" || !ai) {
    return res.status(503).json({ status: "temporarily_unavailable" });
  }

  const text = normalizeAgentGuideText(readBodyText(req));
  if (!text) {
    return res.status(400).json({
      status: "invalid_input",
      maxLength: AGENT_GUIDE_MAX_TEXT_LENGTH,
    });
  }

  if (isImmediateRiskText(text)) {
    return res.status(200).json({ status: "safety_blocked" });
  }

  if (!reserveRateSlot(requestKey(req))) {
    return res.status(429).json({ status: "temporarily_unavailable" });
  }

  try {
    const actionId = await classifyWithGemini(text);
    if (actionId === "none") {
      return res.status(200).json({ status: "no_match" });
    }
    return res.status(200).json({ status: "suggestion", actionId });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error("Internal guide AI classification failed", { errorName });
    return res.status(503).json({ status: "temporarily_unavailable" });
  }
}
