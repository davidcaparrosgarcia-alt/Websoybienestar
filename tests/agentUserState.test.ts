import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  deriveAgentCoarseUserState,
  isSoyBienestarInternalGuideContextEnabled,
  type AgentCoarseUserStateSignals,
} from "../src/agent/userState";

const sensitiveKeys = [
  "email",
  "uid",
  "phone",
  "telefono",
  "accessCode",
  "pin",
  "token",
  "latestDossier",
  "latestDossierInternalContext",
  "answers",
  "messages",
];

test("no completed consultation recommends free consultation", () => {
  assert.deepEqual(deriveAgentCoarseUserState({}), {
    hasDoneConsultation: false,
    questionnaireStage: "not_started",
    recommendedProcessActionId: "process_free_consultation",
  });
});

test("canonical completed consultation flag recommends questionnaire step", () => {
  assert.deepEqual(deriveAgentCoarseUserState({ hasDoneConsultation: true }), {
    hasDoneConsultation: true,
    questionnaireStage: "not_started",
    recommendedProcessActionId: "process_questionnaire",
  });
});

for (const status of [
  "requested",
  "sent",
  "in_progress",
  "completed_pending_dossier",
  "completed",
]) {
  test(`${status} remains an active questionnaire process`, () => {
    const state = deriveAgentCoarseUserState({ userQuestionnaireStatus: status });
    assert.equal(state.questionnaireStage, "active");
    assert.equal(state.recommendedProcessActionId, "process_questionnaire");
  });
}

for (const status of ["dossier_available", "concluded", "finalized"]) {
  test(`${status} recommends the dossier door`, () => {
    const state = deriveAgentCoarseUserState({ userQuestionnaireStatus: status });
    assert.equal(state.questionnaireStage, "dossier_ready");
    assert.equal(state.recommendedProcessActionId, "process_dossier");
  });
}

test("coarse dossier evidence uses the canonical questionnaire UI policy", () => {
  const state = deriveAgentCoarseUserState({ dossierEvidence: true });
  assert.equal(state.questionnaireStage, "dossier_ready");
  assert.equal(state.recommendedProcessActionId, "process_dossier");
});

test("reset_required wins over dossier evidence", () => {
  const state = deriveAgentCoarseUserState({
    userQuestionnaireStatus: "reset_required",
    dossierEvidence: true,
  });
  assert.equal(state.questionnaireStage, "reset_required");
  assert.equal(state.recommendedProcessActionId, "process_questionnaire");
});

test("profile questionnaire status remains supported through coarse signals", () => {
  const state = deriveAgentCoarseUserState({ profileQuestionnaireStatus: "in_progress" });
  assert.equal(state.questionnaireStage, "active");
  assert.equal(state.recommendedProcessActionId, "process_questionnaire");
});

test("coarse state ignores unexpected private fields even if supplied at runtime", () => {
  const unsafeRuntimeObject = {
    hasDoneConsultation: true,
    userQuestionnaireStatus: "dossier_available",
    email: "person@example.com",
    telefono: "+34123456789",
    latestDossier: "private dossier text",
    latestQuestionnaireAccessCode: "AB12",
    globalUserSummary: "private summary",
  } as AgentCoarseUserStateSignals & Record<string, unknown>;

  const state = deriveAgentCoarseUserState(unsafeRuntimeObject);
  const serialized = JSON.stringify(state);
  for (const key of sensitiveKeys) assert.equal(serialized.includes(key), false, key);
  assert.equal(serialized.includes("person@example.com"), false);
  assert.equal(serialized.includes("private dossier text"), false);
  assert.equal(serialized.includes("AB12"), false);
  assert.equal(serialized.includes("private summary"), false);
});

test("context kill switch disables only when explicitly false", () => {
  assert.equal(isSoyBienestarInternalGuideContextEnabled({}), true);
  assert.equal(
    isSoyBienestarInternalGuideContextEnabled({ VITE_INTERNAL_GUIDE_CONTEXT_ENABLED: "true" }),
    true,
  );
  assert.equal(
    isSoyBienestarInternalGuideContextEnabled({ VITE_INTERNAL_GUIDE_CONTEXT_ENABLED: "false" }),
    false,
  );
});

test("agent coarse-state layer has no Firestore or network reader", () => {
  const stateSource = readFileSync(
    new URL("../src/agent/userState.ts", import.meta.url),
    "utf8",
  );
  const oldAdapterPath = new URL(
    "../src/agent/adapters/firestoreUserState.ts",
    import.meta.url,
  );

  assert.equal(existsSync(oldAdapterPath), false);
  assert.doesNotMatch(stateSource, /from\s+["']firebase(?:\/[^"']*)?["']/i);
  assert.doesNotMatch(stateSource, /\b(?:getDoc|setDoc|updateDoc|addDoc|deleteDoc)\s*\(/);
  assert.doesNotMatch(stateSource, /\bfetch\s*\(/);
});

test("coarse-state policy reuses canonical questionnaire policy", () => {
  const source = readFileSync(new URL("../src/agent/userState.ts", import.meta.url), "utf8");
  assert.match(source, /resolveQuestionnaireUiState/);
  assert.doesNotMatch(source, /latestQuestionnaireAccessCode|latestDossierInternalContext/);
});

test("consultation state uses only the canonical hasDoneConsultation signal", () => {
  const source = readFileSync(new URL("../src/agent/userState.ts", import.meta.url), "utf8");
  assert.match(source, /signals\.hasDoneConsultation === true/);
  assert.doesNotMatch(source, /consultationCompleted|sessionCompleted/);
});
