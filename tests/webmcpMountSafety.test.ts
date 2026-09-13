import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isSoyBienestarWebMcpEnabled } from "../src/agent/adapters/webmcp";

test("WebMCP stays available by default for compatible browser agents", () => {
  assert.equal(isSoyBienestarWebMcpEnabled({}), true);
  assert.equal(isSoyBienestarWebMcpEnabled({ VITE_WEBMCP_ENABLED: "true" }), true);
  assert.equal(isSoyBienestarWebMcpEnabled({ VITE_WEBMCP_ENABLED: "False" }), true);
  assert.equal(isSoyBienestarWebMcpEnabled({ VITE_WEBMCP_ENABLED: "false" }), false);
});

test("mounted bridge delegates support and emergency disablement to the WebMCP adapter", () => {
  const source = readFileSync(
    new URL("../src/agent/adapters/WebMcpBridge.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /registerSoyBienestarWebMcpTools\(\{/);
  assert.match(source, /getDocumentModelContext\(\)/);
  assert.doesNotMatch(source, /VITE_WEBMCP_DIRECT_NAVIGATION_ENABLED/);
  assert.doesNotMatch(source, /isSoyBienestarWebMcpBridgeEnabled/);
  assert.doesNotMatch(source, /firebase|firestore|\bfetch\s*\(/i);
});
