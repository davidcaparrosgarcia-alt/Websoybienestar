import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDirectory, "..");

function read(relativePath: string): string {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

test("dedicated AI endpoint is isolated from auth and private data systems", () => {
  const source = read("api/agent-guide-ai.ts");
  assert.match(source, /GEMINI_API_KEY/);
  assert.match(source, /INTERNAL_GUIDE_AI_ENABLED/);
  assert.match(source, /normalizeAgentGuideText/);
  assert.match(source, /isImmediateRiskText/);
  assert.match(source, /parseAgentGuideModelActionId/);
  assert.doesNotMatch(source, /firebase|firestore/i);
  assert.doesNotMatch(source, /requireAuth/);
  assert.doesNotMatch(source, /uid|email|patientId|accessCode|dossier/);
});

test("safety gate executes before rate-limited model classification", () => {
  const source = read("api/agent-guide-ai.ts");
  const safetyIndex = source.indexOf("isImmediateRiskText(text)");
  const rateIndex = source.indexOf("reserveRateSlot(requestKey(req))");
  const modelIndex = source.indexOf("classifyWithGemini(text)");
  assert.ok(safetyIndex > 0);
  assert.ok(rateIndex > safetyIndex);
  assert.ok(modelIndex > rateIndex);
});

test("endpoint never logs the user's free text", () => {
  const source = read("api/agent-guide-ai.ts");
  const consoleCalls = source.match(/console\.(?:log|warn|error)\([^;]+/g) ?? [];
  assert.equal(consoleCalls.some((call) => /\btext\b|req\.body|prompt/.test(call)), false);
});

test("Vercel exact rewrite precedes the existing API catch-all", () => {
  const config = JSON.parse(read("vercel.json")) as {
    rewrites: Array<{ source: string; destination: string }>;
  };
  assert.deepEqual(config.rewrites[0], {
    source: "/api/agent-guide-interpret",
    destination: "/api/agent-guide-ai",
  });
  assert.deepEqual(config.rewrites[1], {
    source: "/api/(.*)",
    destination: "/api",
  });
});

test("local development mounts the same endpoint before the legacy API app", () => {
  const source = read("server.ts");
  const guideRouteIndex = source.indexOf('"/api/agent-guide-interpret"');
  const apiMountIndex = source.indexOf('app.use("/", apiApp)');
  assert.ok(guideRouteIndex > 0);
  assert.ok(apiMountIndex > guideRouteIndex);
  assert.match(source, /express\.json\(\{ limit: "8kb" \}\)/);
});
