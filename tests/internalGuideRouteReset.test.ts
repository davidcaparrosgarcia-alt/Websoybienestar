import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("InternalGuide clears transient user context on route changes", () => {
  const source = readFileSync(
    new URL("../src/agent/adapters/InternalGuide.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /useLocation/);
  assert.match(source, /const location = useLocation\(\);/);
  assert.match(source, /\[location\.key\]/);
  assert.match(source, /setQuery\(""\)/);
  assert.match(source, /setAiResult\(null\)/);
  assert.match(source, /setProcessContext\(null\)/);
  assert.match(source, /interpretControllerRef\.current\?\.abort\(\)/);
  assert.doesNotMatch(source, /firebase|firestore/i);
});
