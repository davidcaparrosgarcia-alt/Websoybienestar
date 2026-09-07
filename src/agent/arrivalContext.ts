import {
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
  AgentEntryPoint,
  AgentNavigationPath,
} from "./types";

export const AGENT_ARRIVAL_CONTEXT_STORAGE_KEY = "soybienestar.agentArrival.v1";
export const AGENT_ARRIVAL_CONTEXT_MAX_TTL_MS = 10 * 60 * 1000;

export type AgentArrivalSource =
  | "internal_guide"
  | "external_webmcp"
  | "browser_ai";

export interface AgentArrivalContext {
  readonly version: 1;
  readonly source: AgentArrivalSource;
  readonly capabilityId: AgentCapabilityId;
  readonly targetPath: AgentNavigationPath;
  readonly entryPoint?: AgentEntryPoint;
  readonly createdAt: number;
  readonly expiresAt: number;
}

export interface AgentArrivalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface CreateAgentArrivalContextInput {
  readonly source: AgentArrivalSource;
  readonly capabilityId: AgentCapabilityId;
  readonly targetPath: AgentNavigationPath;
  readonly entryPoint?: AgentEntryPoint;
}

interface ConsumeAgentArrivalContextOptions {
  readonly storage?: AgentArrivalStorage;
  readonly now?: number;
}

const AGENT_ARRIVAL_SOURCES: readonly AgentArrivalSource[] = [
  "internal_guide",
  "external_webmcp",
  "browser_ai",
];

const ENTRY_POINT_TARGETS = {
  meditations: "/herramientas",
  breathing: "/herramientas",
  emotional_scan: "/herramientas",
  questionnaire_next_step: "/report",
} as const satisfies Readonly<Record<AgentEntryPoint, AgentNavigationPath>>;

const VALID_TARGET_PATHS = new Set<AgentNavigationPath>([
  ...Object.values(GUIDE_DESTINATIONS),
  ...Object.values(WELLBEING_TOOL_PLANS).map((plan) => plan.effect.path),
  ...Object.values(SERVICE_DESTINATIONS),
  FREE_CONSULTATION_EFFECT.path,
  QUESTIONNAIRE_STEP_EFFECT.path,
  DOSSIER_EFFECT.path,
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactlyKeys(record: Record<string, unknown>, expectedKeys: readonly string[]): boolean {
  const keys = Object.keys(record);
  return keys.length === expectedKeys.length && keys.every((key) => expectedKeys.includes(key));
}

function isAgentArrivalSource(value: unknown): value is AgentArrivalSource {
  return typeof value === "string" && (AGENT_ARRIVAL_SOURCES as readonly string[]).includes(value);
}

function isAgentCapabilityId(value: unknown): value is AgentCapabilityId {
  return typeof value === "string" && (AGENT_CAPABILITY_IDS as readonly string[]).includes(value);
}

function isAgentNavigationPath(value: unknown): value is AgentNavigationPath {
  return typeof value === "string" && VALID_TARGET_PATHS.has(value as AgentNavigationPath);
}

function isAgentEntryPoint(value: unknown): value is AgentEntryPoint {
  return typeof value === "string" && Object.hasOwn(ENTRY_POINT_TARGETS, value);
}

function isValidEntryPointTarget(
  entryPoint: AgentEntryPoint | undefined,
  targetPath: AgentNavigationPath,
): boolean {
  return entryPoint === undefined || ENTRY_POINT_TARGETS[entryPoint] === targetPath;
}

function resolveStorage(storage?: AgentArrivalStorage): AgentArrivalStorage | null {
  if (storage) return storage;
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function removeStoredContext(storage: AgentArrivalStorage): void {
  try {
    storage.removeItem(AGENT_ARRIVAL_CONTEXT_STORAGE_KEY);
  } catch {
    // Arrival Context is optional UX state; storage failures must remain non-fatal.
  }
}

function parseAgentArrivalContext(value: unknown, now: number): AgentArrivalContext | null {
  if (!isRecord(value)) return null;

  const hasEntryPoint = Object.hasOwn(value, "entryPoint");
  const expectedKeys = hasEntryPoint
    ? ["version", "source", "capabilityId", "targetPath", "entryPoint", "createdAt", "expiresAt"]
    : ["version", "source", "capabilityId", "targetPath", "createdAt", "expiresAt"];

  if (!hasExactlyKeys(value, expectedKeys)) return null;
  if (value.version !== 1) return null;
  if (!isAgentArrivalSource(value.source)) return null;
  if (!isAgentCapabilityId(value.capabilityId)) return null;
  if (!isAgentNavigationPath(value.targetPath)) return null;
  if (hasEntryPoint && !isAgentEntryPoint(value.entryPoint)) return null;
  if (typeof value.createdAt !== "number" || !Number.isInteger(value.createdAt)) return null;
  if (typeof value.expiresAt !== "number" || !Number.isInteger(value.expiresAt)) return null;

  const createdAt = value.createdAt;
  const expiresAt = value.expiresAt;
  if (createdAt < 0 || createdAt > now) return null;
  if (expiresAt <= createdAt || expiresAt - createdAt > AGENT_ARRIVAL_CONTEXT_MAX_TTL_MS) {
    return null;
  }
  if (expiresAt <= now) return null;

  const entryPoint = hasEntryPoint ? (value.entryPoint as AgentEntryPoint) : undefined;
  if (!isValidEntryPointTarget(entryPoint, value.targetPath)) return null;

  return {
    version: 1,
    source: value.source,
    capabilityId: value.capabilityId,
    targetPath: value.targetPath,
    ...(entryPoint === undefined ? {} : { entryPoint }),
    createdAt,
    expiresAt,
  };
}

export function createAgentArrivalContext(
  input: CreateAgentArrivalContextInput,
  now = Date.now(),
): AgentArrivalContext {
  return {
    version: 1,
    source: input.source,
    capabilityId: input.capabilityId,
    targetPath: input.targetPath,
    ...(input.entryPoint === undefined ? {} : { entryPoint: input.entryPoint }),
    createdAt: now,
    expiresAt: now + AGENT_ARRIVAL_CONTEXT_MAX_TTL_MS,
  };
}

export function saveAgentArrivalContext(
  context: AgentArrivalContext,
  storage?: AgentArrivalStorage,
): boolean {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) return false;

  try {
    resolvedStorage.setItem(AGENT_ARRIVAL_CONTEXT_STORAGE_KEY, JSON.stringify(context));
    return true;
  } catch {
    return false;
  }
}

export function consumeAgentArrivalContextForTarget(
  targetPath: AgentNavigationPath,
  options: ConsumeAgentArrivalContextOptions = {},
): AgentArrivalContext | null {
  const storage = resolveStorage(options.storage);
  if (!storage) return null;

  let serialized: string | null;
  try {
    serialized = storage.getItem(AGENT_ARRIVAL_CONTEXT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (serialized === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    removeStoredContext(storage);
    return null;
  }

  const context = parseAgentArrivalContext(parsed, options.now ?? Date.now());
  if (!context) {
    removeStoredContext(storage);
    return null;
  }
  if (context.targetPath !== targetPath) return null;

  try {
    storage.removeItem(AGENT_ARRIVAL_CONTEXT_STORAGE_KEY);
  } catch {
    return null;
  }
  return context;
}
