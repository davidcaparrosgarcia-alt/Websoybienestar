import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_ARRIVAL_CONTEXT_STORAGE_KEY,
  type AgentArrivalStorage,
} from "../src/agent/arrivalContext";
import {
  INTERNAL_GUIDE_ACTIONS,
  INTERNAL_GUIDE_SECTIONS,
  executeInternalGuideAction,
  findInternalGuideAction,
  isSoyBienestarInternalGuideEnabled,
} from "../src/agent/internalGuide";
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

  readArrivalContext(): Record<string, unknown> | null {
    const value = this.getItem(AGENT_ARRIVAL_CONTEXT_STORAGE_KEY);
    return value === null ? null : JSON.parse(value);
  }
}

function executeAction(actionId: unknown) {
  const storage = new MemoryStorage();
  const navigations: AgentNavigationPath[] = [];
  const result = executeInternalGuideAction(actionId, {
    navigate: (path) => navigations.push(path),
    storage,
    now: () => NOW,
  });
  return { result, navigations, storage };
}

test("internal guide exposes exactly four deterministic sections", () => {
  assert.deepEqual(
    INTERNAL_GUIDE_SECTIONS.map((section) => section.id),
    ["guides", "tools", "services", "process"],
  );
});

test("internal guide exposes exactly twenty closed actions", () => {
  assert.equal(INTERNAL_GUIDE_ACTIONS.length, 20);
  assert.equal(new Set(INTERNAL_GUIDE_ACTIONS.map((action) => action.id)).size, 20);
});

test("internal guide never exposes the unavailable emotional course capability", () => {
  assert.equal(
    INTERNAL_GUIDE_ACTIONS.some(
      (action) => action.request.capabilityId === "sb.open_emotional_course",
    ),
    false,
  );
});

test("guide section maps only to the seven approved guide topics", () => {
  const section = INTERNAL_GUIDE_SECTIONS.find((item) => item.id === "guides");
  assert.ok(section);
  assert.deepEqual(
    section.actions.map((action) =>
      action.request.capabilityId === "sb.open_guide" ? action.request.input.topic : null,
    ),
    [
      "anxiety",
      "stress",
      "insomnia",
      "procrastination",
      "rumination",
      "emotional_management",
      "emotional_eating",
    ],
  );
});

test("tools section maps only to the five approved wellbeing tools", () => {
  const section = INTERNAL_GUIDE_SECTIONS.find((item) => item.id === "tools");
  assert.ok(section);
  assert.deepEqual(
    section.actions.map((action) =>
      action.request.capabilityId === "sb.open_wellbeing_tool" ? action.request.input.tool : null,
    ),
    ["meditations", "breathing", "emotional_scan", "gratitude_diary", "weekly_goals"],
  );
});

test("services section maps only to the five approved services", () => {
  const section = INTERNAL_GUIDE_SECTIONS.find((item) => item.id === "services");
  assert.ok(section);
  assert.deepEqual(
    section.actions.map((action) =>
      action.request.capabilityId === "sb.open_service" ? action.request.input.service : null,
    ),
    ["treatments", "reprogramate", "hipnodigest", "method", "about"],
  );
});

test("process section maps only to consultation questionnaire and dossier doors", () => {
  const section = INTERNAL_GUIDE_SECTIONS.find((item) => item.id === "process");
  assert.ok(section);
  assert.deepEqual(
    section.actions.map((action) => action.request.capabilityId),
    ["sb.start_free_consultation", "sb.open_questionnaire_step", "sb.open_dossier"],
  );
});

test("all twenty actions execute through the Core and App Executor", () => {
  for (const action of INTERNAL_GUIDE_ACTIONS) {
    const { result, navigations } = executeAction(action.id);
    assert.equal(result.status, "NAVIGATED", action.id);
    assert.equal(navigations.length, 1, action.id);
  }
});

test("meditations uses internal_guide source and preserves its entry point", () => {
  const { result, navigations, storage } = executeAction("tool_meditations");
  assert.equal(result.status, "NAVIGATED");
  assert.deepEqual(navigations, ["/herramientas"]);
  assert.deepEqual(
    {
      source: storage.readArrivalContext()?.source,
      targetPath: storage.readArrivalContext()?.targetPath,
      entryPoint: storage.readArrivalContext()?.entryPoint,
    },
    {
      source: "internal_guide",
      targetPath: "/herramientas",
      entryPoint: "meditations",
    },
  );
});

test("breathing and emotional scan retain user-selection entry points", () => {
  for (const [actionId, entryPoint] of [
    ["tool_breathing", "breathing"],
    ["tool_emotional_scan", "emotional_scan"],
  ] as const) {
    const { result, storage } = executeAction(actionId);
    assert.equal(result.status, "NAVIGATED");
    assert.equal(storage.readArrivalContext()?.entryPoint, entryPoint);
  }
});

test("R1 process actions navigate only to their protected doors", () => {
  assert.deepEqual(executeAction("process_free_consultation").navigations, ["/session"]);
  assert.deepEqual(executeAction("process_questionnaire").navigations, ["/report"]);
  assert.deepEqual(executeAction("process_dossier").navigations, ["/dossier-espejo"]);
});

test("unknown action has no navigation and no arrival context", () => {
  const { result, navigations, storage } = executeAction("not_a_real_action");
  assert.deepEqual(result, { status: "UNKNOWN_ACTION" });
  assert.deepEqual(navigations, []);
  assert.equal(storage.readArrivalContext(), null);
  assert.equal(findInternalGuideAction({}), null);
});

test("internal guide kill switch disables only on exact false", () => {
  assert.equal(isSoyBienestarInternalGuideEnabled({ VITE_INTERNAL_GUIDE_ENABLED: "false" }), false);
  assert.equal(isSoyBienestarInternalGuideEnabled({}), true);
  assert.equal(isSoyBienestarInternalGuideEnabled({ VITE_INTERNAL_GUIDE_ENABLED: "False" }), true);
  assert.equal(isSoyBienestarInternalGuideEnabled({ VITE_INTERNAL_GUIDE_ENABLED: true }), true);
});

test("internal guide catalog contains no arbitrary route fields", () => {
  for (const action of INTERNAL_GUIDE_ACTIONS) {
    const serialized = JSON.stringify(action.request);
    assert.doesNotMatch(serialized, /"url"\s*:/i);
    assert.doesNotMatch(serialized, /"path"\s*:/i);
    assert.doesNotMatch(serialized, /"href"\s*:/i);
    assert.doesNotMatch(serialized, /"endpoint"\s*:/i);
  }
});

test("InternalGuide keeps deterministic execution while isolating optional AI transport", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const componentPath = resolve(
    testDirectory,
    "..",
    "src",
    "agent",
    "adapters",
    "InternalGuide.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  assert.match(source, /executeInternalGuideAction/);
  assert.match(source, /isSoyBienestarInternalGuideEnabled/);
  assert.match(source, /interpretInternalGuideText/);
  assert.match(source, /<input\b/i);
  assert.match(source, /<form\b/i);
  assert.doesNotMatch(source, /firebase|firestore/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /modelContext|registerTool|sessionReply/i);
});

test("InternalGuide UI is transparent about AI orientation and its limits", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const componentPath = resolve(
    testDirectory,
    "..",
    "src",
    "agent",
    "adapters",
    "InternalGuide.tsx",
  );
  const source = readFileSync(componentPath, "utf8");
  assert.match(
    source,
    /La guía puede orientarte hacia recursos de SoyBienestar; no diagnostica ni sustituye atención profesional/,
  );
  assert.match(source, /La orientación automática usa IA para clasificar solo este texto/);
  assert.match(source, /No incluyas datos personales/);
});

test("Layout mounts WebMCP and InternalGuide exactly once without replacing existing integration", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const layoutPath = resolve(testDirectory, "..", "src", "components", "Layout.tsx");
  const source = readFileSync(layoutPath, "utf8");

  assert.match(source, /import WebMcpBridge from "\.\.\/agent\/adapters\/WebMcpBridge";/);
  assert.match(source, /import InternalGuide from "\.\.\/agent\/adapters\/InternalGuide";/);
  assert.equal(source.match(/<WebMcpBridge\s*\/>/g)?.length, 1);
  assert.equal(source.match(/<InternalGuide\s*\/>/g)?.length, 1);
});
