import {
  AGENT_CAPABILITY_CATALOG,
  AGENT_CAPABILITY_IDS,
  DOSSIER_EFFECT,
  FREE_CONSULTATION_EFFECT,
  GUIDE_DESTINATIONS,
  QUESTIONNAIRE_STEP_EFFECT,
  SERVICE_DESTINATIONS,
  WELLBEING_TOOL_PLANS,
} from "./capabilities";
import type {
  AgentCapabilityId,
  AgentCapabilityPlan,
  AgentCapabilityResult,
  AgentGuideTopic,
  AgentService,
  AgentWellbeingTool,
} from "./types";

const FORBIDDEN_FIELD_NAMES = new Set([
  "url",
  "path",
  "href",
  "route",
  "endpoint",
  "action",
  "function",
  "functionname",
  "code",
  "pin",
  "accesscode",
  "token",
  "uid",
  "patientid",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function containsForbiddenField(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => containsForbiddenField(item, seen));
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (FORBIDDEN_FIELD_NAMES.has(key.toLowerCase())) return true;
    if (containsForbiddenField(nestedValue, seen)) return true;
  }

  return false;
}

function hasOnlyKeys(record: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  const keys = Object.keys(record);
  return keys.length === allowedKeys.length && keys.every((key) => allowedKeys.includes(key));
}

function isEmptyInput(input: unknown): boolean {
  return input === undefined || (isRecord(input) && Object.keys(input).length === 0);
}

function isCapabilityId(value: unknown): value is AgentCapabilityId {
  return typeof value === "string" && (AGENT_CAPABILITY_IDS as readonly string[]).includes(value);
}

function allowed(
  capabilityId: AgentCapabilityId,
  plan: AgentCapabilityPlan,
): AgentCapabilityResult {
  return { status: "ALLOWED", capabilityId, plan };
}

function resolveGuide(input: unknown): AgentCapabilityResult {
  if (!isRecord(input) || !hasOnlyKeys(input, ["topic"])) return { status: "INVALID_INPUT" };
  const topic = input.topic;
  if (typeof topic !== "string" || !Object.hasOwn(GUIDE_DESTINATIONS, topic)) {
    return { status: "INVALID_INPUT" };
  }

  return allowed("sb.open_guide", {
    riskLevel: "R0",
    requiresAuth: false,
    effect: {
      kind: "navigate",
      path: GUIDE_DESTINATIONS[topic as AgentGuideTopic],
    },
  });
}

function resolveWellbeingTool(input: unknown): AgentCapabilityResult {
  if (!isRecord(input) || !hasOnlyKeys(input, ["tool"])) return { status: "INVALID_INPUT" };
  const tool = input.tool;
  if (typeof tool !== "string" || !Object.hasOwn(WELLBEING_TOOL_PLANS, tool)) {
    return { status: "INVALID_INPUT" };
  }

  const plan = WELLBEING_TOOL_PLANS[tool as AgentWellbeingTool];
  return allowed("sb.open_wellbeing_tool", plan);
}

function resolveService(input: unknown): AgentCapabilityResult {
  if (!isRecord(input) || !hasOnlyKeys(input, ["service"])) return { status: "INVALID_INPUT" };
  const service = input.service;
  if (typeof service !== "string" || !Object.hasOwn(SERVICE_DESTINATIONS, service)) {
    return { status: "INVALID_INPUT" };
  }

  return allowed("sb.open_service", {
    riskLevel: "R0",
    requiresAuth: false,
    effect: {
      kind: "navigate",
      path: SERVICE_DESTINATIONS[service as AgentService],
    },
  });
}

export function resolveAgentCapabilityRequest(request: unknown): AgentCapabilityResult {
  if (!isRecord(request)) return { status: "INVALID_INPUT" };
  if (containsForbiddenField(request)) return { status: "FORBIDDEN" };
  if (!Object.keys(request).every((key) => key === "capabilityId" || key === "input")) {
    return { status: "INVALID_INPUT" };
  }

  const capabilityId = request.capabilityId;
  if (!isCapabilityId(capabilityId)) return { status: "UNKNOWN_CAPABILITY" };

  const descriptor = AGENT_CAPABILITY_CATALOG.find((item) => item.id === capabilityId);
  if (!descriptor) return { status: "UNKNOWN_CAPABILITY" };

  switch (capabilityId) {
    case "sb.open_guide":
      return resolveGuide(request.input);

    case "sb.open_wellbeing_tool":
      return resolveWellbeingTool(request.input);

    case "sb.open_service":
      return resolveService(request.input);

    case "sb.start_free_consultation":
      if (!isEmptyInput(request.input)) return { status: "INVALID_INPUT" };
      return allowed(capabilityId, {
        riskLevel: "R1",
        requiresAuth: true,
        effect: FREE_CONSULTATION_EFFECT,
      });

    case "sb.open_questionnaire_step":
      if (!isEmptyInput(request.input)) return { status: "INVALID_INPUT" };
      return allowed(capabilityId, {
        riskLevel: "R1",
        requiresAuth: true,
        effect: QUESTIONNAIRE_STEP_EFFECT,
      });

    case "sb.open_dossier":
      if (!isEmptyInput(request.input)) return { status: "INVALID_INPUT" };
      return allowed(capabilityId, {
        riskLevel: "R1",
        requiresAuth: true,
        effect: DOSSIER_EFFECT,
      });

    case "sb.open_emotional_course":
      if (!isEmptyInput(request.input)) return { status: "INVALID_INPUT" };
      if (descriptor.availability === "unavailable") return { status: "UNAVAILABLE" };
      return { status: "UNAVAILABLE" };
  }
}
