import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_CAPABILITY_CATALOG,
  AGENT_CAPABILITY_IDS,
} from "../src/agent/capabilities";
import { resolveAgentCapabilityRequest } from "../src/agent/runtime";
import type {
  AgentCapabilityPlan,
  AgentCapabilityRequest,
  AgentRiskLevel,
  EmotionalCourseAccessContract,
} from "../src/agent/types";

function resolveAllowed(request: AgentCapabilityRequest): AgentCapabilityPlan {
  const result = resolveAgentCapabilityRequest(request);
  assert.equal(result.status, "ALLOWED");
  if (result.status !== "ALLOWED") throw new Error("Expected an allowed capability plan");
  return result.plan;
}

test("guide topics resolve to their exact public routes", () => {
  const cases = [
    ["anxiety", "/ansiedad"],
    ["stress", "/estres"],
    ["insomnia", "/insomnio"],
    ["procrastination", "/procrastinacion"],
    ["rumination", "/pensar-demasiado-rumiacion"],
    ["emotional_management", "/gestion-emocional"],
    ["emotional_eating", "/alimentacion-emocional"],
  ] as const;

  for (const [topic, path] of cases) {
    const plan = resolveAllowed({ capabilityId: "sb.open_guide", input: { topic } });
    assert.deepEqual(plan, {
      riskLevel: "R0",
      requiresAuth: false,
      effect: { kind: "navigate", path },
    });
  }
});

test("meditations resolves to herramientas with its semantic entry point", () => {
  assert.deepEqual(
    resolveAllowed({ capabilityId: "sb.open_wellbeing_tool", input: { tool: "meditations" } }),
    {
      riskLevel: "R0",
      requiresAuth: false,
      effect: { kind: "navigate", path: "/herramientas", entryPoint: "meditations" },
    },
  );
});

test("breathing resolves to herramientas with its semantic entry point", () => {
  assert.deepEqual(
    resolveAllowed({ capabilityId: "sb.open_wellbeing_tool", input: { tool: "breathing" } }),
    {
      riskLevel: "R0",
      requiresAuth: false,
      effect: { kind: "navigate", path: "/herramientas", entryPoint: "breathing" },
    },
  );
});

test("emotional scan resolves to herramientas with its semantic entry point", () => {
  assert.deepEqual(
    resolveAllowed({ capabilityId: "sb.open_wellbeing_tool", input: { tool: "emotional_scan" } }),
    {
      riskLevel: "R0",
      requiresAuth: false,
      effect: { kind: "navigate", path: "/herramientas", entryPoint: "emotional_scan" },
    },
  );
});

test("gratitude diary stops at the authenticated route", () => {
  assert.deepEqual(
    resolveAllowed({ capabilityId: "sb.open_wellbeing_tool", input: { tool: "gratitude_diary" } }),
    {
      riskLevel: "R1",
      requiresAuth: true,
      effect: { kind: "navigate", path: "/emotion-diary" },
    },
  );
});

test("weekly goals stops at the authenticated route", () => {
  assert.deepEqual(
    resolveAllowed({ capabilityId: "sb.open_wellbeing_tool", input: { tool: "weekly_goals" } }),
    {
      riskLevel: "R1",
      requiresAuth: true,
      effect: { kind: "navigate", path: "/weekly-goals" },
    },
  );
});

test("services resolve to their exact public routes", () => {
  const cases = [
    ["treatments", "/tratamientos-online"],
    ["reprogramate", "/reprogramate"],
    ["hipnodigest", "/hipnodigest"],
    ["method", "/como-trabajamos"],
    ["about", "/quienes-somos"],
  ] as const;

  for (const [service, path] of cases) {
    const plan = resolveAllowed({ capabilityId: "sb.open_service", input: { service } });
    assert.deepEqual(plan, {
      riskLevel: "R0",
      requiresAuth: false,
      effect: { kind: "navigate", path },
    });
  }
});

test("free consultation stops at the authenticated session route", () => {
  assert.deepEqual(resolveAllowed({ capabilityId: "sb.start_free_consultation" }), {
    riskLevel: "R1",
    requiresAuth: true,
    effect: { kind: "navigate", path: "/session" },
  });
});

test("questionnaire capability stops at the existing next-step policy page", () => {
  assert.deepEqual(resolveAllowed({ capabilityId: "sb.open_questionnaire_step" }), {
    riskLevel: "R1",
    requiresAuth: true,
    effect: { kind: "navigate", path: "/report", entryPoint: "questionnaire_next_step" },
  });
});

test("dossier capability stops at the dossier security page", () => {
  assert.deepEqual(resolveAllowed({ capabilityId: "sb.open_dossier" }), {
    riskLevel: "R1",
    requiresAuth: true,
    effect: { kind: "navigate", path: "/dossier-espejo" },
  });
});

test("emotional course returns unavailable and no plan", () => {
  assert.deepEqual(resolveAgentCapabilityRequest({ capabilityId: "sb.open_emotional_course" }), {
    status: "UNAVAILABLE",
  });
});

test("unknown capability is rejected", () => {
  assert.deepEqual(resolveAgentCapabilityRequest({ capabilityId: "sb.unknown" }), {
    status: "UNKNOWN_CAPABILITY",
  });
});

test("unknown guide topic is invalid", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_guide", input: { topic: "unknown" } }),
    { status: "INVALID_INPUT" },
  );
});

test("unknown wellbeing tool is invalid", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_wellbeing_tool", input: { tool: "unknown" } }),
    { status: "INVALID_INPUT" },
  );
});

test("unknown service is invalid", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_service", input: { service: "unknown" } }),
    { status: "INVALID_INPUT" },
  );
});

test("arbitrary url input is forbidden", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_guide", input: { topic: "anxiety", url: "https://example.test" } }),
    { status: "FORBIDDEN" },
  );
});

test("arbitrary path input is forbidden", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_service", input: { service: "about", path: "/other" } }),
    { status: "FORBIDDEN" },
  );
});

test("api endpoint input is forbidden", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.start_free_consultation", input: { endpoint: "/api/sessionReply" } }),
    { status: "FORBIDDEN" },
  );
});

test("dossier access code input is forbidden", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_dossier", input: { accessCode: "0000" } }),
    { status: "FORBIDDEN" },
  );
});

test("questionnaire patient identifier input is forbidden", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_questionnaire_step", input: { patientId: "patient" } }),
    { status: "FORBIDDEN" },
  );
});

test("no executable capability produces an api route", () => {
  const requests: AgentCapabilityRequest[] = [
    { capabilityId: "sb.open_guide", input: { topic: "anxiety" } },
    { capabilityId: "sb.open_wellbeing_tool", input: { tool: "meditations" } },
    { capabilityId: "sb.open_wellbeing_tool", input: { tool: "gratitude_diary" } },
    { capabilityId: "sb.open_service", input: { service: "treatments" } },
    { capabilityId: "sb.start_free_consultation" },
    { capabilityId: "sb.open_questionnaire_step" },
    { capabilityId: "sb.open_dossier" },
  ];

  for (const request of requests) {
    assert.equal(resolveAllowed(request).effect.path.startsWith("/api/"), false);
  }
});

test("catalog contains exactly seven unique capability identifiers", () => {
  assert.deepEqual(
    AGENT_CAPABILITY_IDS,
    [
      "sb.open_guide",
      "sb.open_wellbeing_tool",
      "sb.open_service",
      "sb.start_free_consultation",
      "sb.open_questionnaire_step",
      "sb.open_dossier",
      "sb.open_emotional_course",
    ],
  );
  assert.equal(new Set(AGENT_CAPABILITY_CATALOG.map((item) => item.id)).size, 7);
});

test("wellbeing tool auth requirement depends on its input", () => {
  const capability = AGENT_CAPABILITY_CATALOG.find(
    (item) => item.id === "sb.open_wellbeing_tool",
  );
  assert.equal(capability?.authRequirement, "input_dependent");
});

test("exclusively public capabilities declare no auth requirement", () => {
  const publicCapabilityIds = AGENT_CAPABILITY_CATALOG
    .filter((item) => item.authRequirement === "none")
    .map((item) => item.id);
  assert.deepEqual(publicCapabilityIds, ["sb.open_guide", "sb.open_service"]);
});

test("capabilities that always reach an auth gate declare auth required", () => {
  const requiredCapabilityIds = AGENT_CAPABILITY_CATALOG
    .filter((item) => item.authRequirement === "required")
    .map((item) => item.id);
  assert.deepEqual(requiredCapabilityIds, [
    "sb.start_free_consultation",
    "sb.open_questionnaire_step",
    "sb.open_dossier",
    "sb.open_emotional_course",
  ]);
});

test("intermediate emotional course can have no selected specialty", () => {
  const access = {
    tier: "intermediate",
    specialtyAccess: "one_persistent",
    selectedSpecialty: null,
  } as const satisfies EmotionalCourseAccessContract;
  assert.equal(access.selectedSpecialty, null);
});

test("intermediate emotional course can persist exactly one selected specialty", () => {
  const access = {
    tier: "intermediate",
    specialtyAccess: "one_persistent",
    selectedSpecialty: "love_heartbreak",
  } as const satisfies EmotionalCourseAccessContract;
  assert.equal(access.selectedSpecialty, "love_heartbreak");
});

test("no R2, R3 or R4 capability is executable", () => {
  const futureRiskLevels: AgentRiskLevel[] = ["R2", "R3", "R4"];
  const executableFutureRisks = AGENT_CAPABILITY_CATALOG.filter(
    (item) =>
      item.availability === "available" &&
      item.riskLevels.some((riskLevel) => futureRiskLevels.includes(riskLevel)),
  );
  assert.deepEqual(executableFutureRisks, []);
});

test("emotional course catalog entry remains unavailable", () => {
  const course = AGENT_CAPABILITY_CATALOG.find((item) => item.id === "sb.open_emotional_course");
  assert.equal(course?.availability, "unavailable");
  assert.equal(course?.futurePath, "/emocionario");
});

test("allowed plans do not contain credentials or sensitive identifiers", () => {
  const plans = [
    resolveAllowed({ capabilityId: "sb.open_guide", input: { topic: "stress" } }),
    resolveAllowed({ capabilityId: "sb.open_wellbeing_tool", input: { tool: "breathing" } }),
    resolveAllowed({ capabilityId: "sb.open_service", input: { service: "about" } }),
    resolveAllowed({ capabilityId: "sb.start_free_consultation" }),
    resolveAllowed({ capabilityId: "sb.open_questionnaire_step" }),
    resolveAllowed({ capabilityId: "sb.open_dossier" }),
  ];
  const serialized = JSON.stringify(plans);

  for (const forbiddenName of ["accessCode", "patientId", "token", "pin", "code", "uid"]) {
    assert.equal(serialized.includes(forbiddenName), false);
  }
});

test("unknown extra fields are rejected instead of being ignored", () => {
  assert.deepEqual(
    resolveAgentCapabilityRequest({ capabilityId: "sb.open_guide", input: { topic: "anxiety", note: "extra" } }),
    { status: "INVALID_INPUT" },
  );
});

test("ordinary invalid input never throws", () => {
  for (const value of [null, undefined, "request", 1, [], {}, { capabilityId: null }]) {
    assert.doesNotThrow(() => resolveAgentCapabilityRequest(value));
  }
});

test("agent source remains isolated from application and browser side effects", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const sourceFiles = ["types.ts", "capabilities.ts", "runtime.ts"].map((fileName) =>
    resolve(testDirectory, "..", "src", "agent", fileName),
  );
  const prohibitedReferences = [
    /\bfirebase\b/i,
    /\bfirestore\b/i,
    /react-router/i,
    /services\/api/i,
    /document\.modelContext/i,
    /sessionStorage/i,
    /localStorage/i,
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\beval\s*\(/,
    /\bnew\s+Function\b/,
  ];

  for (const sourceFile of sourceFiles) {
    const source = readFileSync(sourceFile, "utf8");
    for (const prohibitedReference of prohibitedReferences) {
      assert.equal(prohibitedReference.test(source), false, `${sourceFile} contains ${prohibitedReference}`);
    }
  }
});
