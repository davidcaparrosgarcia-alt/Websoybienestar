import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isSoyBienestarWebMcpBridgeEnabled,
} from "../src/agent/adapters/WebMcpBridge";

test("mounted WebMCP bridge requires explicit double opt-in", () => {
  assert.equal(isSoyBienestarWebMcpBridgeEnabled({}), false);
  assert.equal(
    isSoyBienestarWebMcpBridgeEnabled({ VITE_WEBMCP_ENABLED: "true" }),
    false,
  );
  assert.equal(
    isSoyBienestarWebMcpBridgeEnabled({
      VITE_WEBMCP_DIRECT_NAVIGATION_ENABLED: "true",
    }),
    false,
  );
  assert.equal(
    isSoyBienestarWebMcpBridgeEnabled({
      VITE_WEBMCP_ENABLED: "true",
      VITE_WEBMCP_DIRECT_NAVIGATION_ENABLED: "True",
    }),
    false,
  );
  assert.equal(
    isSoyBienestarWebMcpBridgeEnabled({
      VITE_WEBMCP_ENABLED: "true",
      VITE_WEBMCP_DIRECT_NAVIGATION_ENABLED: true,
    }),
    false,
  );
  assert.equal(
    isSoyBienestarWebMcpBridgeEnabled({
      VITE_WEBMCP_ENABLED: "true",
      VITE_WEBMCP_DIRECT_NAVIGATION_ENABLED: "true",
    }),
    true,
  );
});

test("bridge checks explicit opt-in before registering navigation tools", () => {
  const source = readFileSync(
    new URL("../src/agent/adapters/WebMcpBridge.tsx", import.meta.url),
    "utf8",
  );

  const guardIndex = source.indexOf("if (!isSoyBienestarWebMcpBridgeEnabled()) return;");
  const registrationIndex = source.indexOf("registerSoyBienestarWebMcpTools({");

  assert.ok(guardIndex >= 0);
  assert.ok(registrationIndex > guardIndex);
  assert.match(source, /VITE_WEBMCP_DIRECT_NAVIGATION_ENABLED/);
  assert.doesNotMatch(source, /firebase|firestore|\bfetch\s*\(/i);
});
