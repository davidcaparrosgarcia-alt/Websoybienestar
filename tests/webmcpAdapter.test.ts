import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_ARRIVAL_CONTEXT_STORAGE_KEY,
} from "../src/agent/arrivalContext";
import type { AgentArrivalStorage } from "../src/agent/arrivalContext";
import {
  SoyBienestarWebMcpRegistrationError,
  registerSoyBienestarWebMcpTools,
} from "../src/agent/adapters/webmcp";
import type {
  WebMcpModelContext,
  WebMcpRegistrationOptions,
  WebMcpToolDefinition,
} from "../src/agent/adapters/webmcp";
import type { AgentNavigationPath } from "../src/agent/types";

const EXPECTED_TOOL_NAMES = [
  "soybienestar_open_guide",
  "soybienestar_open_wellbeing_tool",
  "soybienestar_open_service",
  "soybienestar_start_free_consultation",
  "soybienestar_open_questionnaire_step",
  "soybienestar_open_dossier",
] as const;

const CONTROLLED_OUTPUTS = new Set([
  "NAVIGATED",
  "UNKNOWN_CAPABILITY",
  "INVALID_INPUT",
  "FORBIDDEN",
  "UNAVAILABLE",
  "CANCELLED",
]);

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

interface RegistrationCall {
  readonly tool: WebMcpToolDefinition;
  readonly options: WebMcpRegistrationOptions;
}

class FakeModelContext implements WebMcpModelContext {
  readonly calls: RegistrationCall[] = [];
  readonly activeTools = new Set<string>();

  constructor(private readonly failAtIndex: number | null = null) {}

  async registerTool(
    tool: WebMcpToolDefinition,
    options: WebMcpRegistrationOptions,
  ): Promise<void> {
    const callIndex = this.calls.length;
    this.calls.push({ tool, options });
    if (callIndex === this.failAtIndex) throw new Error("registration failed");
    if (options.signal.aborted) throw new Error("registration aborted");

    this.activeTools.add(tool.name);
    options.signal.addEventListener(
      "abort",
      () => this.activeTools.delete(tool.name),
      { once: true },
    );
  }

  tool(name: string): WebMcpToolDefinition {
    const tool = this.calls.find((call) => call.tool.name === name)?.tool;
    if (!tool) throw new Error(`Missing tool: ${name}`);
    return tool;
  }
}

async function registerAdapter(options: {
  readonly modelContext?: FakeModelContext;
  readonly storage?: MemoryStorage;
  readonly env?: Readonly<Record<string, unknown>>;
} = {}) {
  const modelContext = options.modelContext ?? new FakeModelContext();
  const storage = options.storage ?? new MemoryStorage();
  const navigations: AgentNavigationPath[] = [];
  const registration = registerSoyBienestarWebMcpTools({
    modelContext,
    navigate: (path) => navigations.push(path),
    storage,
    env: options.env ?? {},
  });
  await registration.ready;
  return { modelContext, storage, navigations, registration };
}

async function executeTool(
  modelContext: FakeModelContext,
  name: string,
  input: unknown,
  signal = new AbortController().signal,
): Promise<string> {
  return modelContext.tool(name).execute(input, { signal });
}

test("registers exactly six tools", async () => {
  const { modelContext } = await registerAdapter();
  assert.equal(modelContext.calls.length, 6);
});

test("registers the six exact tool names in order", async () => {
  const { modelContext } = await registerAdapter();
  assert.deepEqual(modelContext.calls.map((call) => call.tool.name), EXPECTED_TOOL_NAMES);
});

test("does not register emotional course", async () => {
  const { modelContext } = await registerAdapter();
  assert.equal(
    modelContext.calls.some((call) => call.tool.name.includes("emotional_course")),
    false,
  );
});

test("registration options never use exposedTo", async () => {
  const { modelContext } = await registerAdapter();
  for (const call of modelContext.calls) {
    assert.equal(Object.hasOwn(call.options, "exposedTo"), false);
  }
});

test("every registration receives the same lifecycle AbortSignal", async () => {
  const { modelContext, registration } = await registerAdapter();
  assert.equal(modelContext.calls.length, 6);
  for (const call of modelContext.calls) {
    assert.equal(call.options.signal, registration.signal);
  }
});

test("cleanup aborts lifecycle and removes all active fake registrations", async () => {
  const { modelContext, registration } = await registerAdapter();
  assert.equal(modelContext.activeTools.size, 6);
  registration.cleanup();
  assert.equal(registration.signal.aborted, true);
  assert.equal(modelContext.activeTools.size, 0);
});

test("every schema rejects additional properties", async () => {
  const { modelContext } = await registerAdapter();
  for (const call of modelContext.calls) {
    assert.equal(call.tool.inputSchema.additionalProperties, false);
  }
});

test("guide schema exposes exactly seven allowed topics", async () => {
  const { modelContext } = await registerAdapter();
  const schema = modelContext.tool("soybienestar_open_guide").inputSchema;
  assert.deepEqual(schema.required, ["topic"]);
  assert.deepEqual((schema.properties.topic as { enum: readonly string[] }).enum, [
    "anxiety",
    "stress",
    "insomnia",
    "procrastination",
    "rumination",
    "emotional_management",
    "emotional_eating",
  ]);
});

test("wellbeing schema exposes exactly five allowed tools", async () => {
  const { modelContext } = await registerAdapter();
  const schema = modelContext.tool("soybienestar_open_wellbeing_tool").inputSchema;
  assert.deepEqual(schema.required, ["tool"]);
  assert.deepEqual((schema.properties.tool as { enum: readonly string[] }).enum, [
    "meditations",
    "breathing",
    "emotional_scan",
    "gratitude_diary",
    "weekly_goals",
  ]);
});

test("service schema exposes exactly five allowed services", async () => {
  const { modelContext } = await registerAdapter();
  const schema = modelContext.tool("soybienestar_open_service").inputSchema;
  assert.deepEqual(schema.required, ["service"]);
  assert.deepEqual((schema.properties.service as { enum: readonly string[] }).enum, [
    "treatments",
    "reprogramate",
    "hipnodigest",
    "method",
    "about",
  ]);
});

test("parameterless tools use a closed empty object schema", async () => {
  const { modelContext } = await registerAdapter();
  for (const name of [
    "soybienestar_start_free_consultation",
    "soybienestar_open_questionnaire_step",
    "soybienestar_open_dossier",
  ]) {
    assert.deepEqual(modelContext.tool(name).inputSchema, {
      type: "object",
      properties: {},
      additionalProperties: false,
    });
  }
});

test("guide execution navigates through the Core and Executor", async () => {
  const { modelContext, navigations } = await registerAdapter();
  const output = await executeTool(modelContext, "soybienestar_open_guide", {
    topic: "anxiety",
  });
  assert.equal(output, "NAVIGATED");
  assert.deepEqual(navigations, ["/ansiedad"]);
});

for (const [toolInput, expectedEntryPoint] of [
  ["meditations", "meditations"],
  ["breathing", "breathing"],
  ["emotional_scan", "emotional_scan"],
] as const) {
  test(`${toolInput} navigates to herramientas with external WebMCP arrival context`, async () => {
    const { modelContext, storage, navigations } = await registerAdapter();
    const output = await executeTool(modelContext, "soybienestar_open_wellbeing_tool", {
      tool: toolInput,
    });
    assert.equal(output, "NAVIGATED");
    assert.deepEqual(navigations, ["/herramientas"]);
    assert.deepEqual(
      {
        source: storage.readArrivalContext()?.source,
        targetPath: storage.readArrivalContext()?.targetPath,
        entryPoint: storage.readArrivalContext()?.entryPoint,
      },
      {
        source: "external_webmcp",
        targetPath: "/herramientas",
        entryPoint: expectedEntryPoint,
      },
    );
  });
}

test("gratitude diary navigates to its protected route", async () => {
  const { modelContext, navigations } = await registerAdapter();
  assert.equal(
    await executeTool(modelContext, "soybienestar_open_wellbeing_tool", {
      tool: "gratitude_diary",
    }),
    "NAVIGATED",
  );
  assert.deepEqual(navigations, ["/emotion-diary"]);
});

test("weekly goals navigates to its protected route", async () => {
  const { modelContext, navigations } = await registerAdapter();
  assert.equal(
    await executeTool(modelContext, "soybienestar_open_wellbeing_tool", {
      tool: "weekly_goals",
    }),
    "NAVIGATED",
  );
  assert.deepEqual(navigations, ["/weekly-goals"]);
});

test("free consultation navigates only to session", async () => {
  const { modelContext, navigations } = await registerAdapter();
  assert.equal(
    await executeTool(modelContext, "soybienestar_start_free_consultation", {}),
    "NAVIGATED",
  );
  assert.deepEqual(navigations, ["/session"]);
});

test("questionnaire tool navigates only to report", async () => {
  const { modelContext, navigations } = await registerAdapter();
  assert.equal(
    await executeTool(modelContext, "soybienestar_open_questionnaire_step", {}),
    "NAVIGATED",
  );
  assert.deepEqual(navigations, ["/report"]);
});

test("dossier tool navigates only to the dossier gate", async () => {
  const { modelContext, navigations } = await registerAdapter();
  assert.equal(
    await executeTool(modelContext, "soybienestar_open_dossier", {}),
    "NAVIGATED",
  );
  assert.deepEqual(navigations, ["/dossier-espejo"]);
});

test("invalid input does not navigate", async () => {
  const { modelContext, navigations } = await registerAdapter();
  assert.equal(
    await executeTool(modelContext, "soybienestar_open_guide", { topic: "unknown" }),
    "INVALID_INPUT",
  );
  assert.deepEqual(navigations, []);
});

test("URL and path extras are rejected without navigation", async () => {
  const { modelContext, navigations } = await registerAdapter();
  assert.equal(
    await executeTool(modelContext, "soybienestar_open_guide", {
      topic: "anxiety",
      url: "https://example.test",
    }),
    "FORBIDDEN",
  );
  assert.equal(
    await executeTool(modelContext, "soybienestar_open_service", {
      service: "about",
      path: "/other",
    }),
    "FORBIDDEN",
  );
  assert.deepEqual(navigations, []);
});

test("already aborted execution neither navigates nor stores arrival context", async () => {
  const { modelContext, storage, navigations } = await registerAdapter();
  const controller = new AbortController();
  controller.abort();
  assert.equal(
    await executeTool(
      modelContext,
      "soybienestar_open_wellbeing_tool",
      { tool: "meditations" },
      controller.signal,
    ),
    "CANCELLED",
  );
  assert.deepEqual(navigations, []);
  assert.equal(storage.readArrivalContext(), null);
});

test("execute outputs are controlled strings without free input", async () => {
  const { modelContext } = await registerAdapter();
  const freeInput = "private user text";
  const output = await executeTool(modelContext, "soybienestar_open_guide", {
    topic: freeInput,
  });
  assert.equal(typeof output, "string");
  assert.equal(CONTROLLED_OUTPUTS.has(output), true);
  assert.equal(output.includes(freeInput), false);
});

test("registration failure aborts all registrations and exposes a controlled error", async () => {
  const modelContext = new FakeModelContext(2);
  const registration = registerSoyBienestarWebMcpTools({
    modelContext,
    navigate: () => undefined,
    env: {},
  });
  await assert.rejects(registration.ready, SoyBienestarWebMcpRegistrationError);
  assert.equal(registration.signal.aborted, true);
  assert.equal(modelContext.activeTools.size, 0);
});

test("exact false kill switch disables all registration", async () => {
  const modelContext = new FakeModelContext();
  const registration = registerSoyBienestarWebMcpTools({
    modelContext,
    navigate: () => undefined,
    env: { VITE_WEBMCP_ENABLED: "false" },
  });
  await registration.ready;
  assert.equal(registration.enabled, false);
  assert.equal(modelContext.calls.length, 0);
});

test("missing modelContext is an unsupported no-op", async () => {
  const registration = registerSoyBienestarWebMcpTools({
    modelContext: null,
    navigate: () => undefined,
    env: {},
  });
  await registration.ready;
  assert.equal(registration.supported, false);
  assert.equal(registration.signal.aborted, false);
});

test("all tools use the exact conservative annotations", async () => {
  const { modelContext } = await registerAdapter();
  for (const call of modelContext.calls) {
    assert.deepEqual(call.tool.annotations, {
      readOnlyHint: false,
      untrustedContentHint: false,
      consequentialHint: false,
    });
  }
});

test("WebMCP adapter uses only the current document API surface", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const adapterPath = resolve(testDirectory, "..", "src", "agent", "adapters", "webmcp.ts");
  const source = readFileSync(adapterPath, "utf8");
  assert.match(source, /modelContext\?: WebMcpModelContext/);
  assert.match(source, /\.registerTool\(tool, \{ signal: controller\.signal \}\)/);
  assert.doesNotMatch(source, /navigator\.modelContext/);
  assert.doesNotMatch(source, /provideContext/);
  assert.doesNotMatch(source, /exposedTo/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /firebase|firestore/i);
});

test("Bridge is invisible, router-only and free of data access", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const bridgePath = resolve(
    testDirectory,
    "..",
    "src",
    "agent",
    "adapters",
    "WebMcpBridge.tsx",
  );
  const source = readFileSync(bridgePath, "utf8");
  assert.match(source, /const navigate = useNavigate\(\);/);
  assert.match(source, /return null;/);
  assert.match(source, /return registration\.cleanup;/);
  assert.doesNotMatch(source, /firebase|firestore/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});

test("Layout imports and mounts WebMcpBridge exactly once", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const layoutPath = resolve(testDirectory, "..", "src", "components", "Layout.tsx");
  const source = readFileSync(layoutPath, "utf8");
  assert.match(source, /import WebMcpBridge from "\.\.\/agent\/adapters\/WebMcpBridge";/);
  assert.equal(source.match(/<WebMcpBridge\s*\/>/g)?.length, 1);
});
