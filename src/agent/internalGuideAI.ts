import {
  findInternalGuideAction,
  type InternalGuideAction,
} from "./internalGuide";

export const INTERNAL_GUIDE_AI_MAX_TEXT_LENGTH = 400;

export type InternalGuideAIResult =
  | { readonly status: "suggestion"; readonly action: InternalGuideAction }
  | { readonly status: "no_match" }
  | { readonly status: "safety_blocked" }
  | { readonly status: "temporarily_unavailable" }
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

export async function interpretInternalGuideText(
  value: unknown,
  options: InterpretInternalGuideTextOptions = {},
): Promise<InternalGuideAIResult> {
  const text = normalizeText(value);
  if (!text) return { status: "invalid_input" };

  const fetchImpl = options.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl("/api/agent-guide-interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: options.signal,
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      return { status: "temporarily_unavailable" };
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return { status: "temporarily_unavailable" };
    }

    const status = (payload as Record<string, unknown>).status;
    if (status === "safety_blocked") return { status: "safety_blocked" };
    if (status === "no_match") return { status: "no_match" };
    if (status === "invalid_input") return { status: "invalid_input" };
    if (status === "temporarily_unavailable" || !response.ok) {
      return { status: "temporarily_unavailable" };
    }

    if (status === "suggestion") {
      const action = findInternalGuideAction((payload as Record<string, unknown>).actionId);
      if (!action) return { status: "temporarily_unavailable" };
      return { status: "suggestion", action };
    }

    return { status: "temporarily_unavailable" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { status: "temporarily_unavailable" };
    }
    return { status: "temporarily_unavailable" };
  }
}
