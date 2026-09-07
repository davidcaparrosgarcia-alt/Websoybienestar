import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_ARRIVAL_CONTEXT_MAX_TTL_MS,
  AGENT_ARRIVAL_CONTEXT_STORAGE_KEY,
  consumeAgentArrivalContextForTarget,
} from "../src/agent/arrivalContext";
import type { AgentArrivalStorage } from "../src/agent/arrivalContext";
import { executeAgentCapabilityRequest } from "../src/agent/appExecutor";
import type { AgentNavigationPath } from "../src/agent/types";

const NOW = 1_800_000_000_000;

class MemoryStorage implements AgentArrivalStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  writeRaw(value: unknown): void {
    this.setItem(
      AGENT_ARRIVAL_CONTEXT_STORAGE_KEY,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  }

  readRaw(): string | null {
    return this.getItem(AGENT_ARRIVAL_CONTEXT_STORAGE_KEY);
  }
}

function validStoredContext(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: 1,
    source: "internal_guide",
    capabilityId: "sb.open_wellbeing_tool",
    targetPath: "/herramientas",
    entryPoint: "meditations",
    createdAt: NOW,
    expiresAt: NOW + AGENT_ARRIVAL_CONTEXT_MAX_TTL_MS,
    ...overrides,
  };
}

function executeWithStorage(request: unknown, storage = new MemoryStorage()) {
  const navigations: AgentNavigationPath[] = [];
  const result = executeAgentCapabilityRequest(request, {
    source: "internal_guide",
    navigate: (path) => navigations.push(path),
    storage,
    now: () => NOW,
  });
  return { result, navigations, storage };
}

function assertRejectedWithoutEffects(
  request: unknown,
  expectedStatus: "UNKNOWN_CAPABILITY" | "INVALID_INPUT" | "FORBIDDEN" | "UNAVAILABLE",
): void {
  const { result, navigations, storage } = executeWithStorage(request);
  assert.equal(result.status, expectedStatus);
  assert.deepEqual(navigations, []);
  assert.equal(storage.readRaw(), null);
}

test("public capability navigates to the exact resolved route", () => {
  const { result, navigations } = executeWithStorage({
    capabilityId: "sb.open_guide",
    input: { topic: "anxiety" },
  });
  assert.equal(result.status, "NAVIGATED");
  assert.deepEqual(navigations, ["/ansiedad"]);
});

test("R1 capability navigates without checking auth", () => {
  const { result, navigations } = executeWithStorage({
    capabilityId: "sb.start_free_consultation",
  });
  assert.equal(result.status, "NAVIGATED");
  assert.deepEqual(navigations, ["/session"]);
});

test("meditations stores its herramientas arrival context", () => {
  const { storage } = executeWithStorage({
    capabilityId: "sb.open_wellbeing_tool",
    input: { tool: "meditations" },
  });
  assert.deepEqual(JSON.parse(storage.readRaw() ?? "null"), {
    version: 1,
    source: "internal_guide",
    capabilityId: "sb.open_wellbeing_tool",
    targetPath: "/herramientas",
    entryPoint: "meditations",
    createdAt: NOW,
    expiresAt: NOW + AGENT_ARRIVAL_CONTEXT_MAX_TTL_MS,
  });
});

test("breathing stores its herramientas arrival context", () => {
  const { storage } = executeWithStorage({
    capabilityId: "sb.open_wellbeing_tool",
    input: { tool: "breathing" },
  });
  const context = JSON.parse(storage.readRaw() ?? "null");
  assert.equal(context.targetPath, "/herramientas");
  assert.equal(context.entryPoint, "breathing");
});

test("emotional scan stores its herramientas arrival context", () => {
  const { storage } = executeWithStorage({
    capabilityId: "sb.open_wellbeing_tool",
    input: { tool: "emotional_scan" },
  });
  const context = JSON.parse(storage.readRaw() ?? "null");
  assert.equal(context.targetPath, "/herramientas");
  assert.equal(context.entryPoint, "emotional_scan");
});

test("questionnaire next step stores its report arrival context", () => {
  const { storage } = executeWithStorage({ capabilityId: "sb.open_questionnaire_step" });
  const context = JSON.parse(storage.readRaw() ?? "null");
  assert.equal(context.targetPath, "/report");
  assert.equal(context.entryPoint, "questionnaire_next_step");
});

test("dossier context contains only UX metadata and no sensitive payload", () => {
  const { storage } = executeWithStorage({ capabilityId: "sb.open_dossier" });
  const context = JSON.parse(storage.readRaw() ?? "null") as Record<string, unknown>;
  assert.deepEqual(Object.keys(context), [
    "version",
    "source",
    "capabilityId",
    "targetPath",
    "createdAt",
    "expiresAt",
  ]);
});

test("unknown capability neither navigates nor writes storage", () => {
  assertRejectedWithoutEffects({ capabilityId: "sb.unknown" }, "UNKNOWN_CAPABILITY");
});

test("invalid input neither navigates nor writes storage", () => {
  assertRejectedWithoutEffects(
    { capabilityId: "sb.open_guide", input: { topic: "unknown" } },
    "INVALID_INPUT",
  );
});

test("forbidden input neither navigates nor writes storage", () => {
  assertRejectedWithoutEffects(
    { capabilityId: "sb.open_dossier", input: { accessCode: "0000" } },
    "FORBIDDEN",
  );
});

test("unavailable emotional course neither navigates nor writes storage", () => {
  assertRejectedWithoutEffects({ capabilityId: "sb.open_emotional_course" }, "UNAVAILABLE");
});

test("valid context is consumed once and removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext());
  const context = consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW });
  assert.equal(context?.entryPoint, "meditations");
  assert.equal(storage.readRaw(), null);
});

test("second consumption returns null", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext());
  assert.notEqual(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
});

test("expired context returns null and is removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ createdAt: NOW - 1_000, expiresAt: NOW }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("corrupt JSON returns null and is removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw("{not-json");
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("unknown source returns null and is removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ source: "unknown" }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("unknown capability ID returns null and is removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ capabilityId: "sb.unknown" }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("unknown target returns null and is removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ targetPath: "/unknown" }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("unknown entry point returns null and is removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ entryPoint: "unknown" }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("meditations targeting dossier is invalid and removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ targetPath: "/dossier-espejo" }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/dossier-espejo", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("questionnaire next step targeting herramientas is invalid and removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(
    validStoredContext({
      capabilityId: "sb.open_questionnaire_step",
      targetPath: "/herramientas",
      entryPoint: "questionnaire_next_step",
    }),
  );
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("valid target mismatch is not consumed or removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(
    validStoredContext({
      capabilityId: "sb.open_questionnaire_step",
      targetPath: "/report",
      entryPoint: "questionnaire_next_step",
    }),
  );
  const serialized = storage.readRaw();
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), serialized);
});

test("TTL greater than ten minutes is rejected and removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(
    validStoredContext({ expiresAt: NOW + AGENT_ARRIVAL_CONTEXT_MAX_TTL_MS + 1 }),
  );
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("storage write failure does not prevent navigation", () => {
  const storage: AgentArrivalStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("storage unavailable");
    },
    removeItem: () => undefined,
  };
  const { result, navigations } = executeWithStorage(
    { capabilityId: "sb.open_service", input: { service: "about" } },
    storage as MemoryStorage,
  );
  assert.equal(result.status, "NAVIGATED");
  if (result.status === "NAVIGATED") assert.equal(result.arrivalContextSaved, false);
  assert.deepEqual(navigations, ["/quienes-somos"]);
});

test("serialized context has no sensitive or free-text fields", () => {
  const { storage } = executeWithStorage({ capabilityId: "sb.open_dossier" });
  const serialized = storage.readRaw() ?? "";
  for (const field of [
    "email",
    "uid",
    "patientId",
    "accessCode",
    "pin",
    "token",
    "prompt",
    "message",
    "dossier",
  ]) {
    assert.doesNotMatch(serialized, new RegExp(`"${field}"\\s*:`));
  }
});

test("unknown version is rejected and removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ version: 2 }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("unexpected fields are rejected and removed", () => {
  const storage = new MemoryStorage();
  storage.writeRaw(validStoredContext({ message: "free text" }));
  assert.equal(
    consumeAgentArrivalContextForTarget("/herramientas", { storage, now: NOW }),
    null,
  );
  assert.equal(storage.readRaw(), null);
});

test("missing browser storage remains a non-fatal navigation path", () => {
  const navigations: AgentNavigationPath[] = [];
  const result = executeAgentCapabilityRequest(
    { capabilityId: "sb.open_service", input: { service: "treatments" } },
    {
      source: "browser_ai",
      navigate: (path) => navigations.push(path),
      now: () => NOW,
    },
  );
  assert.equal(result.status, "NAVIGATED");
  if (result.status === "NAVIGATED") assert.equal(result.arrivalContextSaved, false);
  assert.deepEqual(navigations, ["/tratamientos-online"]);
});

test("Resources consumes only herramientas public entry points without auto-actions", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const resourcesPath = resolve(testDirectory, "..", "src", "pages", "Resources.tsx");
  const source = readFileSync(resourcesPath, "utf8");

  assert.match(source, /import \{ consumeAgentArrivalContextForTarget \} from "\.\.\/agent\/arrivalContext";/);
  assert.match(source, /consumeAgentArrivalContextForTarget\("\/herramientas"\)/);

  const effectStart = source.indexOf(
    'const arrivalContext = consumeAgentArrivalContextForTarget("/herramientas")',
  );
  const effectEnd = source.indexOf("  }, []);", effectStart);
  assert.notEqual(effectStart, -1);
  assert.notEqual(effectEnd, -1);
  const arrivalEffect = source.slice(effectStart, effectEnd);

  assert.match(arrivalEffect, /entryPoint === "meditations"[\s\S]*setIsAudioModalOpen\(true\)/);
  assert.match(arrivalEffect, /entryPoint === "breathing"[\s\S]*setIsBreathingModalOpen\(true\)/);
  assert.match(arrivalEffect, /entryPoint === "emotional_scan"[\s\S]*resetEstadoActual\(\)/);
  assert.match(arrivalEffect, /estadoActualSectionRef\.current\?\.scrollIntoView/);
  assert.doesNotMatch(arrivalEffect, /setValorSentimiento\(/);
  assert.doesNotMatch(arrivalEffect, /setValorEnergia\(/);
  assert.doesNotMatch(arrivalEffect, /handlePlay\(/);
});
