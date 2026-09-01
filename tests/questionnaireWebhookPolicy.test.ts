import test from "node:test";
import assert from "node:assert/strict";
import {
  decideQuestionnaireWebhook,
  isNewCycleAfterReset,
  resolveQuestionnaireMatch,
  resolveQuestionnaireUiState,
  selectQuestionnaireRequestId,
  type QuestionnaireCycleInput,
  type QuestionnaireWebhookEvent,
} from "../api/questionnaireWebhookPolicy";

function decision(
  currentStatus: string,
  event: QuestionnaireWebhookEvent,
  overrides: Partial<QuestionnaireCycleInput> = {},
) {
  return decideQuestionnaireWebhook({
    currentStatus,
    currentRequestId: "request-current",
    currentPatientId: "patient-current",
    incomingRequestId: "request-current",
    incomingPatientId: "patient-current",
    event,
    ...overrides,
  });
}

const policyCases: Array<{
  name: string;
  actual: () => ReturnType<typeof decideQuestionnaireWebhook>;
  action: string;
  nextStatus?: string | null;
}> = [
  { name: "requested + started applies in_progress", actual: () => decision("requested", "questionnaire_started"), action: "apply", nextStatus: "in_progress" },
  { name: "sent + started applies in_progress", actual: () => decision("sent", "questionnaire_started"), action: "apply", nextStatus: "in_progress" },
  { name: "in_progress + started is duplicate", actual: () => decision("in_progress", "questionnaire_started"), action: "duplicate" },
  { name: "completed_pending_dossier + started is regression", actual: () => decision("completed_pending_dossier", "questionnaire_started"), action: "regression" },
  { name: "completed + started is regression", actual: () => decision("completed", "questionnaire_started"), action: "regression" },
  { name: "in_progress + completed applies pending dossier", actual: () => decision("in_progress", "questionnaire_completed"), action: "apply", nextStatus: "completed_pending_dossier" },
  { name: "completed_pending_dossier + completed is duplicate", actual: () => decision("completed_pending_dossier", "questionnaire_completed"), action: "duplicate" },
  { name: "completed + completed is duplicate", actual: () => decision("completed", "questionnaire_completed"), action: "duplicate" },
  { name: "completed + dossier applies dossier_available", actual: () => decision("completed", "dossier_available"), action: "apply", nextStatus: "dossier_available" },
  { name: "dossier_available + completed is regression", actual: () => decision("dossier_available", "questionnaire_completed"), action: "regression" },
  { name: "dossier_available + started is regression", actual: () => decision("dossier_available", "questionnaire_started"), action: "regression" },
  { name: "reset_required + started is reset blocked", actual: () => decision("reset_required", "questionnaire_started"), action: "stale_cycle" },
  { name: "reset_required + dossier is reset blocked", actual: () => decision("reset_required", "dossier_available"), action: "stale_cycle" },
  { name: "reset_required + deleted is duplicate", actual: () => decision("reset_required", "questionnaire_deleted"), action: "duplicate" },
  { name: "old request event against new request is stale", actual: () => decision("requested", "questionnaire_started", { incomingRequestId: "request-old" }), action: "stale_cycle" },
  { name: "different incoming patient is stale", actual: () => decision("requested", "questionnaire_started", { incomingPatientId: "patient-other" }), action: "stale_cycle" },
  { name: "matching request can establish first patient", actual: () => decision("requested", "questionnaire_started", { currentPatientId: null, incomingPatientId: "patient-first" }), action: "apply", nextStatus: "in_progress" },
  { name: "matching patient proves cycle without incoming request", actual: () => decision("requested", "questionnaire_started", { incomingRequestId: null }), action: "apply", nextStatus: "in_progress" },
  { name: "missing request and patient proof is stale", actual: () => decision("requested", "questionnaire_started", { incomingRequestId: null, incomingPatientId: null }), action: "stale_cycle" },
  { name: "existing semantic fingerprint prevents second apply", actual: () => decision("requested", "questionnaire_started", { semanticEventExists: true }), action: "duplicate" },
];

for (const policyCase of policyCases) {
  test(`policy: ${policyCase.name}`, () => {
    const actual = policyCase.actual();
    assert.equal(actual.action, policyCase.action);
    if ("nextStatus" in policyCase) assert.equal(actual.nextStatus, policyCase.nextStatus);
  });
}

function match(overrides: Partial<Parameters<typeof resolveQuestionnaireMatch>[0]> = {}) {
  return resolveQuestionnaireMatch({
    explicitUidProvided: false,
    validExplicitUid: null,
    sourceRequestIdProvided: false,
    sourceRequestCandidates: [],
    emailCandidates: [],
    ...overrides,
  });
}

test("matching: email with zero matches is unmatched", () => {
  assert.equal(match().kind, "unmatched");
});

test("matching: email with one UID is unique", () => {
  assert.deepEqual(match({ emailCandidates: ["uid-a"] }), { kind: "match", uid: "uid-a", matchedBy: "email" });
});

test("matching: email with two UIDs is ambiguous", () => {
  assert.equal(match({ emailCandidates: ["uid-a", "uid-b"] }).kind, "ambiguous");
});

test("matching: email and contactEmail for the same UID deduplicate", () => {
  assert.deepEqual(match({ emailCandidates: ["uid-a", "uid-a"] }), { kind: "match", uid: "uid-a", matchedBy: "email" });
});

test("matching: email and contactEmail for different UIDs are ambiguous", () => {
  assert.equal(match({ emailCandidates: ["uid-a", "uid-b"] }).kind, "ambiguous");
});

test("matching: sourceRequestId with one UID is unique", () => {
  assert.deepEqual(match({ sourceRequestIdProvided: true, sourceRequestCandidates: ["uid-a"] }), { kind: "match", uid: "uid-a", matchedBy: "sourceRequestId" });
});

test("matching: sourceRequestId with two UIDs is ambiguous", () => {
  assert.equal(match({ sourceRequestIdProvided: true, sourceRequestCandidates: ["uid-a", "uid-b"] }).kind, "ambiguous");
});

test("matching: explicit sourceRequestId failure never falls back to email", () => {
  assert.deepEqual(match({ sourceRequestIdProvided: true, sourceRequestCandidates: [], emailCandidates: ["uid-email"] }), { kind: "unmatched", matchedBy: "sourceRequestId" });
});

test("matching: a valid explicit UID has priority", () => {
  assert.deepEqual(match({ explicitUidProvided: true, validExplicitUid: "uid-direct", sourceRequestIdProvided: true, sourceRequestCandidates: ["uid-other"] }), { kind: "match", uid: "uid-direct", matchedBy: "uid" });
});

test("UI: profile reset dominates user dossier_available", () => {
  const state = resolveQuestionnaireUiState({ questionnaireStatus: "dossier_available" }, { questionnaireStatus: "reset_required" });
  assert.equal(state.resetRequired, true);
  assert.equal(state.dossierReady, false);
});

test("UI: user reset dominates profile dossier_available", () => {
  const state = resolveQuestionnaireUiState({ questionnaireStatus: "reset_required" }, { questionnaireStatus: "dossier_available" });
  assert.equal(state.resetRequired, true);
  assert.equal(state.dossierReady, false);
});

test("UI: completed without dossier is not dossier ready", () => {
  assert.equal(resolveQuestionnaireUiState({ questionnaireStatus: "completed" }, {}).dossierReady, false);
});

test("UI: completed_pending_dossier is not dossier ready", () => {
  assert.equal(resolveQuestionnaireUiState({ questionnaireStatus: "completed_pending_dossier" }, {}).dossierReady, false);
});

test("UI: hasDoneCuestionario alone is not dossier ready", () => {
  assert.equal(resolveQuestionnaireUiState({ hasDoneCuestionario: true }, {}).dossierReady, false);
});

test("UI: dossier_available status is dossier ready", () => {
  assert.equal(resolveQuestionnaireUiState({ questionnaireStatus: "dossier_available" }, {}).dossierReady, true);
});

test("UI: latestDossier is real dossier evidence", () => {
  assert.equal(resolveQuestionnaireUiState({ latestDossier: "available" }, {}).dossierReady, true);
});

test("UI: reset dominates residual latestDossier", () => {
  assert.equal(resolveQuestionnaireUiState({ questionnaireStatus: "reset_required", latestDossier: "residual" }, {}).dossierReady, false);
});

test("reset cooldown: reset after request enables one new cycle", () => {
  assert.equal(isNewCycleAfterReset(100, 200), true);
});

test("reset cooldown: reset older than request does not bypass", () => {
  assert.equal(isNewCycleAfterReset(200, 100), false);
});

test("reset cooldown: absent reset does not bypass", () => {
  assert.equal(isNewCycleAfterReset(200, 0), false);
  assert.equal(isNewCycleAfterReset(200, null), false);
});

test("reset cooldown: saved new request consumes the bypass", () => {
  assert.equal(isNewCycleAfterReset(300, 200), false);
});

test("reset cycle: non-continuation selects a new request ID", () => {
  assert.equal(
    selectQuestionnaireRequestId(false, "request-old", "request-new"),
    "request-new",
  );
});
