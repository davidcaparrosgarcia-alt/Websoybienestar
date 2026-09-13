import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

test("phase7c loads coarse process context only when Tu proceso is selected", () => {
  assert.match(source, /import \{ readAgentProcessContext \} from "\.\.\/processContext";/);
  assert.match(source, /selectedSectionId !== "process"/);
  assert.match(source, /readAgentProcessContext\(\)/);
  assert.match(source, /setProcessContext\(null\)/);
});

test("phase7c recommendation is visual guidance only and keeps every process action clickable", () => {
  assert.match(
    source,
    /processContext\?\.recommendedProcessActionId === action\.id/,
  );
  assert.match(source, /aria-current=\{isRecommended \? "step" : undefined\}/);
  assert.match(source, />\s*Recomendado\s*</);
  assert.match(source, /selectedSection\.actions\.map\(\(action\) =>/);
  assert.match(source, /onClick=\{\(\) => handleAction\(action\.id\)\}/);
  assert.doesNotMatch(source, /selectedSection\.actions\.(?:filter|sort)\s*\(/);
});

test("phase7c never auto-executes the recommended action", () => {
  assert.doesNotMatch(source, /handleAction\(processContext/);
  assert.doesNotMatch(source, /executeInternalGuideAction\(processContext/);
  assert.doesNotMatch(source, /navigate\([^)]*recommendedProcessActionId/);
});

test("phase7c keeps coarse process context out of the AI interpreter", () => {
  assert.match(source, /interpretInternalGuideText\(query,/);
  assert.doesNotMatch(source, /interpretInternalGuideText\([^)]*processContext/s);
  assert.doesNotMatch(source, /setQuery\([^)]*processContext/s);
});

test("phase7c adapter has no direct Firebase, Firestore, token or network access", () => {
  assert.doesNotMatch(source, /firebase|firestore|getIdToken|Authorization/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});

test("phase7c preserves silent fallback when context is unavailable", () => {
  assert.match(source, /\.catch\(\(\) => \{/);
  assert.match(source, /if \(active\) setProcessContext\(null\);/);
  assert.doesNotMatch(source, /No se pudo cargar.*proceso/i);
});
