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
    return jsonResponse({ status: "no_match" });
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

test("valid server suggestion resolves to an existing deterministic action", async () => {
  const fetchImpl = (async () =>
    jsonResponse({ status: "suggestion", actionId: "guide_insomnia" })) as typeof fetch;
  const result = await interpretInternalGuideText("me cuesta dormir", { fetchImpl });
  assert.equal(result.status, "suggestion");
  if (result.status === "suggestion") {
    assert.equal(result.action.id, "guide_insomnia");
    assert.equal(result.action.request.capabilityId, "sb.open_guide");
  }
});

test("unknown suggestion is rejected client-side", async () => {
  const fetchImpl = (async () =>
    jsonResponse({ status: "suggestion", actionId: "open_any_url" })) as typeof fetch;
  const result = await interpretInternalGuideText("haz algo", { fetchImpl });
  assert.equal(result.status, "temporarily_unavailable");
});

for (const [payload, expected] of [
  [{ status: "safety_blocked" }, "safety_blocked"],
  [{ status: "no_match" }, "no_match"],
  [{ status: "temporarily_unavailable" }, "temporarily_unavailable"],
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

test("InternalGuide asks for explicit confirmation before executing an AI suggestion", () => {
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
  assert.match(source, /aiResult\.action\.label/);
  assert.match(source, /onClick=\{\(\) => handleAction\(aiResult\.action\.id\)\}/);
  assert.match(source, />\s*Abrir\s*</);
  assert.match(source, /No incluyas datos personales/);
  assert.match(source, /Puedes seguir usando las opciones de abajo/);

  const interpretStart = source.indexOf("const handleInterpret = async");
  const interpretEnd = source.indexOf("  return (", interpretStart);
  const interpretBlock = source.slice(interpretStart, interpretEnd);
  assert.doesNotMatch(interpretBlock, /navigate\(/);
  assert.doesNotMatch(interpretBlock, /handleAction\(/);
});
