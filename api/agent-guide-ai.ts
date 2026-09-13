import "dotenv/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import { GoogleGenAI, Type } from "@google/genai";
import {
  AGENT_GUIDE_MAX_TEXT_LENGTH,
  MALICIOUS_GUIDANCE,
  OFF_TOPIC_GUIDANCE,
  buildAgentGuideInterpreterPrompt,
  classifyDeterministicGuideRequest,
  isImmediateRiskText,
  normalizeAgentGuideText,
  parseAgentGuideModelDecision,
  type AgentGuideModelDecision,
} from "./agentGuidePolicy.js";
import {
  PERSONAL_SUPPORT_GUIDANCE,
  isPersonalSupportSeekingText,
} from "./agentGuidePersonalSupport.js";
import {
  freshGuideGuardState,
  incrementGuideAiCount,
  isGuideDailyLimitReached,
  normalizeGuideGuardState,
  registerGuideMaliciousAttempt,
  registerGuideOffTopicAttempt,
  type GuideGuardState,
} from "./agentGuideGuard.js";

const API_KEY = process.env.GEMINI_API_KEY;
const PRIMARY_MODEL = process.env.INTERNAL_GUIDE_AI_MODEL || process.env.AI_MODEL || "gemini-3.1-flash-lite";
const MODEL_CANDIDATES = [
  PRIMARY_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
].filter((value, index, array) => value && array.indexOf(value) === index);

const RATE_WINDOW_MS = 20 * 1000;
const GUARD_HEADER_NAME = "X-SB-Guide-Guard";

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

const RATE_MAX_REQUESTS = Math.min(
  3,
  boundedInteger(process.env.INTERNAL_GUIDE_AI_BURST_LIMIT, 3, 1, 30),
);
const DAILY_AI_LIMIT = Math.min(
  10,
  boundedInteger(process.env.INTERNAL_GUIDE_AI_DAILY_LIMIT, 10, 1, 100),
);

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
  const realIp = req?.headers?.["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return String(req?.socket?.remoteAddress || "unknown");
}

function reserveRateSlot(key: string, now = Date.now()): boolean {
  if (rateBuckets.size > 5000) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
    }
  }

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

function guardSecret(): string | null {
  return process.env.INTERNAL_GUIDE_RATE_SECRET || API_KEY || null;
}

function signGuardPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function readGuardHeader(req: any): string | null {
  const value = req?.headers?.["x-sb-guide-guard"];
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : null;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readGuardState(req: any, now: number): GuideGuardState {
  const secret = guardSecret();
  if (!secret) return freshGuideGuardState(now);
  const encoded = readGuardHeader(req);
  if (!encoded) return freshGuideGuardState(now);

  const separator = encoded.lastIndexOf(".");
  if (separator <= 0) return freshGuideGuardState(now);
  const payload = encoded.slice(0, separator);
  const signature = encoded.slice(separator + 1);
  const expected = signGuardPayload(payload, secret);

  try {
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return freshGuideGuardState(now);
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return normalizeGuideGuardState(parsed, now);
  } catch {
    return freshGuideGuardState(now);
  }
}

function writeGuardState(res: any, state: GuideGuardState): void {
  const secret = guardSecret();
  if (!secret) return;
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  const signature = signGuardPayload(payload, secret);
  res.setHeader(GUARD_HEADER_NAME, `${payload}.${signature}`);
}

function blockedResponse(res: any, state: GuideGuardState, now: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil((state.lockedUntil - now) / 1000));
  res.setHeader("Retry-After", String(retryAfterSeconds));
  writeGuardState(res, state);
  return res.status(429).json({
    status: "temporarily_blocked",
    message: "He pausado temporalmente la guía porque se han repetido usos fuera de su finalidad. Podrás volver a utilizarla dentro de unos minutos para preguntas sobre SoyBienestar.",
    retryAfterSeconds,
  });
}

function personalSupportBlockedResponse(res: any, state: GuideGuardState, now: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil((state.lockedUntil - now) / 1000));
  res.setHeader("Retry-After", String(retryAfterSeconds));
  writeGuardState(res, state);
  return res.status(429).json({
    status: "temporarily_blocked",
    message: "He pausado temporalmente las preguntas libres porque esta guía no está diseñada para mantener una conversación terapéutica. La consulta guiada gratuita y el recorrido de SoyBienestar siguen disponibles para ayudarte a continuar. Podrás volver a usar las preguntas libres dentro de unos minutos.",
    retryAfterSeconds,
  });
}

async function classifyWithGemini(text: string): Promise<AgentGuideModelDecision> {
  if (!ai) throw new Error("AI unavailable");
  const prompt = buildAgentGuideInterpreterPrompt(text);
  let lastError: unknown = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 260,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kind: { type: Type.STRING },
              message: { type: Type.STRING },
              actionId: { type: Type.STRING },
            },
            required: ["kind", "message", "actionId"],
          },
        },
      });
      const parsed = JSON.parse(response.text || "{}");
      const decision = parseAgentGuideModelDecision(parsed);
      if (!decision) throw new Error("Invalid model output");
      return decision;
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
    return res.status(200).json({
      status: "safety_blocked",
      message: "Esta guía no puede atender una situación de riesgo inmediato. Si hay peligro ahora, contacta con emergencias de tu país o con una persona de confianza que pueda estar contigo.",
    });
  }

  const now = Date.now();
  let guard = readGuardState(req, now);

  if (guard.lockedUntil > now) {
    return blockedResponse(res, guard, now);
  }

  if (!reserveRateSlot(requestKey(req), now)) {
    return res.status(429).json({
      status: "temporarily_unavailable",
      message: "Has enviado varias consultas en muy pocos segundos. Espera un momento antes de volver a preguntar.",
    });
  }

  const deterministic = classifyDeterministicGuideRequest(text);
  if (deterministic?.status === "malicious") {
    guard = registerGuideMaliciousAttempt(guard, now);
    if (guard.lockedUntil > now) return blockedResponse(res, guard, now);
    writeGuardState(res, guard);
    return res.status(200).json({ status: "malicious_warning", message: MALICIOUS_GUIDANCE });
  }

  if (deterministic?.status === "off_topic") {
    guard = registerGuideOffTopicAttempt(guard, now);
    if (guard.lockedUntil > now) return blockedResponse(res, guard, now);
    writeGuardState(res, guard);
    return res.status(200).json({ status: "off_topic", message: OFF_TOPIC_GUIDANCE });
  }

  if (isPersonalSupportSeekingText(text)) {
    guard = registerGuideOffTopicAttempt(guard, now);
    if (guard.lockedUntil > now) return personalSupportBlockedResponse(res, guard, now);
    writeGuardState(res, guard);
    return res.status(200).json({
      status: "process_guidance",
      reason: "personal_support",
      message: PERSONAL_SUPPORT_GUIDANCE,
    });
  }

  if (deterministic?.status === "answer") {
    return res.status(200).json(deterministic);
  }

  if (deterministic?.status === "process_guidance") {
    return res.status(200).json(deterministic);
  }

  if (isGuideDailyLimitReached(guard, DAILY_AI_LIMIT, now)) {
    writeGuardState(res, guard);
    return res.status(429).json({
      status: "daily_limit",
      message: "Has alcanzado el límite diario de consultas inteligentes de esta guía. Las opciones directas de SoyBienestar siguen disponibles y mañana podrás volver a utilizar la orientación con IA.",
    });
  }

  guard = incrementGuideAiCount(guard, now);
  writeGuardState(res, guard);

  try {
    const decision = await classifyWithGemini(text);

    if (decision.kind === "off_topic") {
      guard = registerGuideOffTopicAttempt(guard, now);
      if (guard.lockedUntil > now) return blockedResponse(res, guard, now);
      writeGuardState(res, guard);
      return res.status(200).json({ status: "off_topic", message: decision.message || OFF_TOPIC_GUIDANCE });
    }

    if (decision.kind === "unclear") {
      return res.status(200).json({
        status: "no_match",
        message: decision.message,
      });
    }

    return res.status(200).json({
      status: "answer",
      message: decision.message,
      ...(decision.actionId === "none" ? {} : { actionId: decision.actionId }),
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error("Internal guide AI orientation failed", { errorName });
    return res.status(503).json({ status: "temporarily_unavailable" });
  }
}
