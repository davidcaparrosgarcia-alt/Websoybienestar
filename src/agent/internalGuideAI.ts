import {
  findInternalGuideAction,
  type InternalGuideAction,
} from "./internalGuide";

export const INTERNAL_GUIDE_AI_MAX_TEXT_LENGTH = 500;
export const INTERNAL_GUIDE_GUARD_STORAGE_KEY = "soybienestar.guideGuard.v1";
export type InternalGuideProcessReason = "next_step" | "pricing" | "personal_support";

export type InternalGuideAIResult =
  | { readonly status: "answer"; readonly message: string; readonly action?: InternalGuideAction }
  | { readonly status: "process_guidance"; readonly message: string; readonly reason: InternalGuideProcessReason }
  | { readonly status: "no_match"; readonly message?: string }
  | { readonly status: "off_topic"; readonly message: string }
  | { readonly status: "malicious_warning"; readonly message: string }
  | { readonly status: "temporarily_blocked"; readonly message: string; readonly retryAfterSeconds?: number }
  | { readonly status: "daily_limit"; readonly message: string }
  | { readonly status: "safety_blocked"; readonly message?: string }
  | { readonly status: "temporarily_unavailable"; readonly message?: string }
  | { readonly status: "invalid_input" };

export interface InterpretInternalGuideTextOptions {
  readonly fetchImpl?: typeof fetch;
  readonly signal?: AbortSignal;
}

function readBuildEnvironment(): Readonly<Record<string, unknown>> | undefined {
  return (import.meta as ImportMeta & { readonly env?: Readonly<Record<string, unknown>> }).env;
}

export function isSoyBienestarInternalGuideAiEnabled(
  env: Readonly<Record<string, unknown>> | undefined = readBuildEnvironment(),
): boolean {
  return env?.VITE_INTERNAL_GUIDE_AI_ENABLED !== "false";
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > INTERNAL_GUIDE_AI_MAX_TEXT_LENGTH) return null;
  return text;
}

function readMessage(payload: Record<string, unknown>): string | undefined {
  return typeof payload.message === "string" && payload.message.trim()
    ? payload.message.trim()
    : undefined;
}

function readGuardToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(INTERNAL_GUIDE_GUARD_STORAGE_KEY);
    return typeof value === "string" && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

function storeGuardToken(value: string | null): void {
  if (!value) return;
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(INTERNAL_GUIDE_GUARD_STORAGE_KEY, value);
  } catch {
    // Abuse-control state is best-effort and must never break the guide.
  }
}

export async function interpretInternalGuideText(
  value: unknown,
  options: InterpretInternalGuideTextOptions = {},
): Promise<InternalGuideAIResult> {
  const text = normalizeText(value);
  if (!text) return { status: "invalid_input" };

  const fetchImpl = options.fetchImpl ?? fetch;
  const guardToken = readGuardToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (guardToken) headers["X-SB-Guide-Guard"] = guardToken;

  try {
    const response = await fetchImpl("/api/agent-guide-interpret", {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
      signal: options.signal,
    });

    storeGuardToken(response.headers.get("X-SB-Guide-Guard"));

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      return { status: "temporarily_unavailable" };
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return { status: "temporarily_unavailable" };
    }

    const record = payload as Record<string, unknown>;
    const status = record.status;
    const message = readMessage(record);

    if (status === "safety_blocked") return { status: "safety_blocked", message };
    if (status === "no_match") return { status: "no_match", message };
    if (status === "invalid_input") return { status: "invalid_input" };
    if (status === "off_topic" && message) return { status: "off_topic", message };
    if (status === "malicious_warning" && message) return { status: "malicious_warning", message };
    if (status === "daily_limit" && message) return { status: "daily_limit", message };
    if (status === "temporarily_blocked" && message) {
      return {
        status: "temporarily_blocked",
        message,
        ...(typeof record.retryAfterSeconds === "number"
          ? { retryAfterSeconds: record.retryAfterSeconds }
          : {}),
      };
    }
    if (
      status === "process_guidance" &&
      message &&
      (record.reason === "next_step" ||
        record.reason === "pricing" ||
        record.reason === "personal_support")
    ) {
      return { status: "process_guidance", message, reason: record.reason };
    }
    if (status === "answer" && message) {
      const action = record.actionId === undefined ? null : findInternalGuideAction(record.actionId);
      if (record.actionId !== undefined && !action) return { status: "temporarily_unavailable" };
      return {
        status: "answer",
        message,
        ...(action ? { action } : {}),
      };
    }
    if (status === "temporarily_unavailable" || !response.ok) {
      return { status: "temporarily_unavailable", message };
    }

    return { status: "temporarily_unavailable" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { status: "temporarily_unavailable" };
    }
    return { status: "temporarily_unavailable" };
  }
}
