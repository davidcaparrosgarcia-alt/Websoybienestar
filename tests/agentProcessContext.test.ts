import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readAgentProcessContext } from "../src/agent/processContext";
import type { AgentCoarseUserStateSignals } from "../src/agent/userState";

function readerFor(signals: AgentCoarseUserStateSignals | null) {
  return async () => signals;
}

test("phase7b recommends free consultation from empty coarse signals", async () => {
  const state = await readAgentProcessContext(readerFor({}), {});

  assert.deepEqual(state, {
    hasDoneConsultation: false,
    questionnaireStage: "not_started",
    recommendedProcessActionId: "process_free_consultation",
  });
});

test("phase7b recommends questionnaire after canonical completed consultation", async () => {
  const state = await readAgentProcessContext(
    readerFor({ hasDoneConsultation: true }),
    {},
  );

  assert.equal(state?.questionnaireStage, "not_started");
  assert.equal(state?.recommendedProcessActionId, "process_questionnaire");
});

test("phase7b preserves active questionnaire guidance", async () => {
  const state = await readAgentProcessContext(
    readerFor({ userQuestionnaireStatus: "in_progress" }),
    {},
  );

  assert.equal(state?.questionnaireStage, "active");
  assert.equal(state?.recommendedProcessActionId, "process_questionnaire");
});

test("phase7b recommends dossier from coarse dossier evidence", async () => {
  const state = await readAgentProcessContext(
    readerFor({ dossierEvidence: true }),
    {},
  );

  assert.equal(state?.questionnaireStage, "dossier_ready");
  assert.equal(state?.recommendedProcessActionId, "process_dossier");
});

test("phase7b keeps reset_required above dossier evidence", async () => {
  const state = await readAgentProcessContext(
    readerFor({
      profileQuestionnaireStatus: "reset_required",
      dossierEvidence: true,
    }),
    {},
  );

  assert.equal(state?.questionnaireStage, "reset_required");
  assert.equal(state?.recommendedProcessActionId, "process_questionnaire");
});

test("phase7b degrades to null when transport has no safe context", async () => {
  const state = await readAgentProcessContext(readerFor(null), {});
  assert.equal(state, null);
});

test("phase7b kill switch prevents the transport from running", async () => {
  let calls = 0;
  const state = await readAgentProcessContext(
    async () => {
      calls += 1;
      return { hasDoneConsultation: true };
    },
    { VITE_INTERNAL_GUIDE_CONTEXT_ENABLED: "false" },
  );

  assert.equal(state, null);
  assert.equal(calls, 0);
});

test("phase7b context boundary returns only the closed coarse state contract", async () => {
  const state = await readAgentProcessContext(
    readerFor({
      hasDoneConsultation: true,
      userQuestionnaireStatus: "dossier_available",
      dossierEvidence: true,
    }),
    {},
  );

  assert.ok(state);
  assert.deepEqual(Object.keys(state).sort(), [
    "hasDoneConsultation",
    "questionnaireStage",
    "recommendedProcessActionId",
  ]);
  const serialized = JSON.stringify(state);
  for (const forbidden of [
    "token",
    "uid",
    "email",
    "phone",
    "latestDossier",
    "accessCode",
    "patientId",
    "answer",
    "conclusion",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("phase7b composition layer contains no auth, token, Firestore, navigation or AI execution", () => {
  const source = readFileSync("src/agent/processContext.ts", "utf8");

  for (const forbidden of [
    "auth.currentUser",
    "getIdToken",
    "Authorization",
    "Bearer ",
    "firestore.googleapis.com",
    "getDoc(",
    "setDoc(",
    "updateDoc(",
    "navigate(",
    "executeInternalGuideAction",
    "interpretInternalGuideText",
    "GoogleGenAI",
    "GEMINI",
  ]) {
    assert.equal(source.includes(forbidden), false, `unexpected ${forbidden}`);
  }
});

test("phase7c mounts process context only inside InternalGuide and never into Layout", () => {
  const layoutSource = readFileSync("src/components/Layout.tsx", "utf8");
  const guideSource = readFileSync("src/agent/adapters/InternalGuide.tsx", "utf8");

  assert.equal(layoutSource.includes("readAgentProcessContext"), false);
  assert.equal(layoutSource.includes("processContext"), false);
  assert.equal(guideSource.includes("readAgentProcessContext"), true);
  assert.equal(guideSource.includes("processContext"), true);
});
