import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  INTERNAL_GUIDE_AI_MAX_TEXT_LENGTH,
  interpretInternalGuideText,
  isSoyBienestarInternalGuideAiEnabled,
} from "../src/agent/internalGuideAI";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("AI guide kill switch disables only on exact false", () => {
  assert.equal(isSoyBienestarInternalGuideAiEnabled({ VITE_INTERNAL_GUIDE_AI_ENABLED: "false" }), false);
  assert.equal(isSoyBienestarInternalGuideAiEnabled({ VITE_INTERNAL_GUIDE_AI_ENABLED: "true" }), true);
  assert.equal(isSoyBienestarInternalGuideAiEnabled({}), true);
});

test("client sends only bounded free text to the dedicated endpoint", async () => {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ input, init });
    return jsonResponse({ status: "no_match", message: "No tengo información suficiente." });
  }) as typeof fetch;

  const result = await interpretInternalGuideText("  necesito dormir  ", { fetchImpl });
  assert.equal(result.status, "no_match");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].input, "/api/agent-guide-interpret");
  assert.equal(calls[0].init?.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { text: "necesito dormir" });
  assert.equal(String(calls[0].init?.body).includes("uid"), false);
  assert.equal(String(calls[0].init?.body).includes("email"), false);
});

test("valid server answer resolves an optional existing deterministic action", async () => {
  const fetchImpl = (async () =>
    jsonResponse({
      status: "answer",
      message: "Tenemos una guía específica sobre insomnio.",
      actionId: "guide_insomnia",
    })) as typeof fetch;
  const result = await interpretInternalGuideText("me cuesta dormir", { fetchImpl });
  assert.equal(result.status, "answer");
  if (result.status === "answer") {
    assert.equal(result.message, "Tenemos una guía específica sobre insomnio.");
    assert.equal(result.action?.id, "guide_insomnia");
    assert.equal(result.action?.request.capabilityId, "sb.open_guide");
  }
});

test("answer without navigation stays useful without inventing an action", async () => {
  const fetchImpl = (async () =>
    jsonResponse({ status: "answer", message: "Puedes escribir a contacto@soybienestar.es." })) as typeof fetch;
  const result = await interpretInternalGuideText("cómo contacto", { fetchImpl });
  assert.equal(result.status, "answer");
  if (result.status === "answer") assert.equal(result.action, undefined);
});

test("unknown action is rejected client-side", async () => {
  const fetchImpl = (async () =>
    jsonResponse({ status: "answer", message: "Abre esto", actionId: "open_any_url" })) as typeof fetch;
  const result = await interpretInternalGuideText("haz algo", { fetchImpl });
  assert.equal(result.status, "temporarily_unavailable");
});

test("process guidance keeps only a closed reason and no private state in the request", async () => {
  const fetchImpl = (async () =>
    jsonResponse({
      status: "process_guidance",
      reason: "next_step",
      message: "Puedo orientarte con tu siguiente paso.",
    })) as typeof fetch;
  const result = await interpretInternalGuideText("qué hago ahora", { fetchImpl });
  assert.deepEqual(result, {
    status: "process_guidance",
    reason: "next_step",
    message: "Puedo orientarte con tu siguiente paso.",
  });
});

for (const [payload, expected] of [
  [{ status: "safety_blocked", message: "Busca ayuda inmediata." }, "safety_blocked"],
  [{ status: "no_match", message: "No puedo confirmarlo." }, "no_match"],
  [{ status: "off_topic", message: "Puedo ayudarte con SoyBienestar." }, "off_topic"],
  [{ status: "malicious_warning", message: "No puedo ayudar con eso." }, "malicious_warning"],
  [{ status: "daily_limit", message: "Límite diario alcanzado." }, "daily_limit"],
  [{ status: "temporarily_blocked", message: "Guía pausada.", retryAfterSeconds: 600 }, "temporarily_blocked"],
  [{ status: "temporarily_unavailable", message: "Espera unos minutos." }, "temporarily_unavailable"],
  [{ status: "invalid_input" }, "invalid_input"],
] as const) {
  test(`closed API status maps to ${expected}`, async () => {
    const fetchImpl = (async () => jsonResponse(payload)) as typeof fetch;
    const result = await interpretInternalGuideText("texto válido", { fetchImpl });
    assert.equal(result.status, expected);
  });
}

test("HTTP failure and malformed JSON preserve deterministic fallback", async () => {
  const failedFetch = (async () => jsonResponse({ status: "unexpected" }, 500)) as typeof fetch;
  assert.equal(
    (await interpretInternalGuideText("texto válido", { fetchImpl: failedFetch })).status,
    "temporarily_unavailable",
  );

  const malformedFetch = (async () => new Response("not-json", { status: 200 })) as typeof fetch;
  assert.equal(
    (await interpretInternalGuideText("texto válido", { fetchImpl: malformedFetch })).status,
    "temporarily_unavailable",
  );
});

test("invalid local input never calls the API", async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return jsonResponse({ status: "no_match" });
  }) as typeof fetch;

  assert.equal((await interpretInternalGuideText("   ", { fetchImpl })).status, "invalid_input");
  assert.equal(
    (await interpretInternalGuideText("x".repeat(INTERNAL_GUIDE_AI_MAX_TEXT_LENGTH + 1), { fetchImpl })).status,
    "invalid_input",
  );
  assert.equal(calls, 0);
});

test("InternalGuide requires an explicit user click before executing a suggested action", () => {
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

  assert.match(source, /interpretInternalGuideText\(query/);
  assert.match(source, /renderActionButton\(aiResult\.action\.id/);
  assert.match(source, /onClick=\{\(\) => handleAction\(actionId\)\}/);
  assert.match(source, /No incluyas datos personales/);
  assert.match(source, /preguntas menos directas pueden usar IA/i);

  const interpretStart = source.indexOf("const handleInterpret = async");
  const interpretEnd = source.indexOf("  const renderActionButton", interpretStart);
  const interpretBlock = source.slice(interpretStart, interpretEnd);
  assert.doesNotMatch(interpretBlock, /navigate\(/);
  assert.doesNotMatch(interpretBlock, /handleAction\(/);
});
