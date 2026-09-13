import test from "node:test";
import assert from "node:assert/strict";
import { buildInternalGuideProcessAnswer } from "../src/agent/processGuidance";
import type { AgentCoarseUserState } from "../src/agent/userState";

function state(overrides: Partial<AgentCoarseUserState>): AgentCoarseUserState {
  return {
    hasDoneConsultation: false,
    questionnaireStage: "not_started",
    recommendedProcessActionId: "process_free_consultation",
    ...overrides,
  };
}

test("next-step guidance starts a new user at the free consultation", () => {
  const result = buildInternalGuideProcessAnswer("next_step", null);
  assert.equal(result.action.id, "process_free_consultation");
  assert.match(result.message, /consulta guiada gratuita/i);
  assert.match(result.message, /15 minutos/i);
});

test("next-step guidance continues an active questionnaire", () => {
  const result = buildInternalGuideProcessAnswer(
    "next_step",
    state({
      hasDoneConsultation: true,
      questionnaireStage: "active",
      recommendedProcessActionId: "process_questionnaire",
    }),
  );
  assert.equal(result.action.id, "process_questionnaire");
  assert.match(result.message, /continuar con el Cuestionario Espejo/i);
});

test("reset_required keeps questionnaire precedence", () => {
  const result = buildInternalGuideProcessAnswer(
    "next_step",
    state({
      hasDoneConsultation: true,
      questionnaireStage: "reset_required",
      recommendedProcessActionId: "process_questionnaire",
    }),
  );
  assert.equal(result.action.id, "process_questionnaire");
  assert.match(result.message, /necesita retomarse/i);
});

test("dossier-ready guidance recommends the dossier and never exposes its content", () => {
  const result = buildInternalGuideProcessAnswer(
    "next_step",
    state({
      hasDoneConsultation: true,
      questionnaireStage: "dossier_ready",
      recommendedProcessActionId: "process_dossier",
    }),
  );
  assert.equal(result.action.id, "process_dossier");
  assert.match(result.message, /Dossier Espejo/i);
  assert.match(result.message, /no puede leer el contenido/i);
});

test("pricing guidance never invents a ReprogrÁmate amount and follows the user's current process", () => {
  const result = buildInternalGuideProcessAnswer(
    "pricing",
    state({
      hasDoneConsultation: true,
      questionnaireStage: "active",
      recommendedProcessActionId: "process_questionnaire",
    }),
  );
  assert.equal(result.action.id, "process_questionnaire");
  assert.match(result.message, /programas completos/i);
  assert.match(result.message, /decidir libremente/i);
  assert.doesNotMatch(result.message, /\b\d{2,5}\s*€/);
});
