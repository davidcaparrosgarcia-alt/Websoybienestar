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
  assert.match(source, /classifyDeterministicGuideRequest/);
  assert.match(source, /parseAgentGuideModelDecision/);
  assert.doesNotMatch(source, /firebase|firestore/i);
  assert.doesNotMatch(source, /requireAuth/);
  assert.doesNotMatch(source, /\buid\b|\bemail\b|\bpatientId\b|\baccessCode\b|\bdossier\b/i);
});

test("safety runs before burst limiting and deterministic answers still bypass AI quota", () => {
  const source = read("api/agent-guide-ai.ts");
  const safetyIndex = source.indexOf("isImmediateRiskText(text)");
  const rateIndex = source.indexOf("reserveRateSlot(requestKey(req), now)");
  const deterministicIndex = source.indexOf("classifyDeterministicGuideRequest(text)");
  const dailyIndex = source.indexOf("isGuideDailyLimitReached(guard, DAILY_AI_LIMIT, now)");
  const modelIndex = source.indexOf("classifyWithGemini(text)");
  assert.ok(safetyIndex > 0);
  assert.ok(rateIndex > safetyIndex);
  assert.ok(deterministicIndex > rateIndex);
  assert.ok(dailyIndex > deterministicIndex);
  assert.ok(modelIndex > dailyIndex);
});

test("endpoint enforces at most three guide submissions per twenty seconds and ten AI calls per day", () => {
  const source = read("api/agent-guide-ai.ts");
  assert.match(source, /RATE_WINDOW_MS = 20 \* 1000/);
  assert.match(source, /Math\.min\(\s*3,\s*boundedInteger\(process\.env\.INTERNAL_GUIDE_AI_BURST_LIMIT, 3, 1, 30\)/s);
  assert.match(source, /Math\.min\(\s*10,\s*boundedInteger\(process\.env\.INTERNAL_GUIDE_AI_DAILY_LIMIT, 10, 1, 100\)/s);
});

test("endpoint carries signed anonymous quota in a response header and never creates cookies", () => {
  const source = read("api/agent-guide-ai.ts");
  assert.match(source, /createHmac/);
  assert.match(source, /timingSafeEqual/);
  assert.match(source, /X-SB-Guide-Guard/);
  assert.match(source, /x-sb-guide-guard/);
  assert.match(source, /DAILY_AI_LIMIT/);
  assert.match(source, /registerGuideMaliciousAttempt/);
  assert.match(source, /registerGuideOffTopicAttempt/);
  assert.doesNotMatch(source, /Set-Cookie|document\.cookie|req\?\.headers\?\.cookie/i);
});

test("client stores only the opaque signed guard token in localStorage and sends it explicitly", () => {
  const source = read("src/agent/internalGuideAI.ts");
  assert.match(source, /soybienestar\.guideGuard\.v1/);
  assert.match(source, /window\.localStorage\.getItem/);
  assert.match(source, /window\.localStorage\.setItem/);
  assert.match(source, /headers\["X-SB-Guide-Guard"\] = guardToken/);
  assert.match(source, /response\.headers\.get\("X-SB-Guide-Guard"\)/);
  assert.doesNotMatch(source, /document\.cookie|Set-Cookie/i);
});

test("guard policy encodes exact two-malicious and three-off-topic cooldown thresholds", () => {
  const source = read("api/agentGuideGuard.ts");
  assert.match(source, /GUIDE_MALICIOUS_LOCK_MS = 30 \* 60 \* 1000/);
  assert.match(source, /GUIDE_OFF_TOPIC_LOCK_MS = 10 \* 60 \* 1000/);
  assert.match(source, /maliciousCount >= 2/);
  assert.match(source, /offTopicCount >= 3/);
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
