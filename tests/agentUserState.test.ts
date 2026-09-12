import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  deriveAgentCoarseUserState,
  isSoyBienestarInternalGuideContextEnabled,
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
  assert.deepEqual(deriveAgentCoarseUserState({}, {}), {
    hasDoneConsultation: false,
    questionnaireStage: "not_started",
    recommendedProcessActionId: "process_free_consultation",
  });
});

test("completed consultation recommends questionnaire step", () => {
  assert.deepEqual(deriveAgentCoarseUserState({ hasDoneConsultation: true }, {}), {
    hasDoneConsultation: true,
    questionnaireStage: "not_started",
    recommendedProcessActionId: "process_questionnaire",
  });
});

test("profile consultation flags are respected", () => {
  const state = deriveAgentCoarseUserState({}, { sessionCompleted: true });
  assert.equal(state.hasDoneConsultation, true);
  assert.equal(state.recommendedProcessActionId, "process_questionnaire");
});

for (const status of [
  "requested",
  "sent",
  "in_progress",
  "completed_pending_dossier",
  "completed",
]) {
  test(`${status} remains an active questionnaire process`, () => {
    const state = deriveAgentCoarseUserState({ questionnaireStatus: status }, {});
    assert.equal(state.questionnaireStage, "active");
    assert.equal(state.recommendedProcessActionId, "process_questionnaire");
  });
}

for (const status of ["dossier_available", "concluded", "finalized"]) {
  test(`${status} recommends the dossier door`, () => {
    const state = deriveAgentCoarseUserState({ questionnaireStatus: status }, {});
    assert.equal(state.questionnaireStage, "dossier_ready");
    assert.equal(state.recommendedProcessActionId, "process_dossier");
  });
}

test("dossier evidence uses the canonical questionnaire UI policy", () => {
  const state = deriveAgentCoarseUserState({}, { dossierAvailableAt: "2026-09-12T00:00:00Z" });
  assert.equal(state.questionnaireStage, "dossier_ready");
  assert.equal(state.recommendedProcessActionId, "process_dossier");
});

test("reset_required wins over dossier evidence", () => {
  const state = deriveAgentCoarseUserState(
    { questionnaireStatus: "reset_required", latestDossier: "sensitive-content" },
    { dossierViewedAt: "2026-09-12T00:00:00Z" },
  );
  assert.equal(state.questionnaireStage, "reset_required");
  assert.equal(state.recommendedProcessActionId, "process_questionnaire");
});

test("coarse state output contains no sensitive fields or values", () => {
  const state = deriveAgentCoarseUserState(
    {
      email: "person@example.com",
      telefono: "+34123456789",
      latestDossier: "private dossier text",
      latestQuestionnaireAccessCode: "AB12",
      questionnaireStatus: "dossier_available",
    },
    { globalUserSummary: "private summary" },
  );
  const serialized = JSON.stringify(state);
  for (const key of sensitiveKeys) assert.equal(serialized.includes(key), false, key);
  assert.equal(serialized.includes("person@example.com"), false);
  assert.equal(serialized.includes("private dossier text"), false);
  assert.equal(serialized.includes("AB12"), false);
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

test("Firestore adapter is read-only and does not reuse migration writer", () => {
  const source = readFileSync(
    new URL("../src/agent/adapters/firestoreUserState.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /getDoc/);
  assert.doesNotMatch(source, /setDoc|updateDoc|addDoc|deleteDoc|writeBatch|runTransaction/);
  assert.doesNotMatch(source, /getOrMigrateUserProfile/);
  assert.doesNotMatch(source, /fetch\s*\(/);
});

test("coarse-state policy reuses canonical questionnaire policy", () => {
  const source = readFileSync(new URL("../src/agent/userState.ts", import.meta.url), "utf8");
  assert.match(source, /resolveQuestionnaireUiState/);
  assert.doesNotMatch(source, /latestQuestionnaireAccessCode|latestDossierInternalContext/);
});
