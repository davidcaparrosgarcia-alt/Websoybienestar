import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isPersonalSupportSeekingText,
} from "../api/agentGuidePersonalSupport";
import { buildInternalGuideProcessAnswer } from "../src/agent/processGuidance";
import type { AgentCoarseUserState } from "../src/agent/userState";

const personalCases = [
  "Me encuentro solo y deprimido, ¿qué puedo hacer?",
  "Siento que todos me odian en el trabajo y no puedo dormir bien",
  "Mi pareja me ha dejado y no sé qué hacer",
  "Llevo semanas sin ganas de nada y me siento vacío",
  "No puedo dormir y además tengo ansiedad desde hace días",
  "Me siento rechazado por mis compañeros y cada noche me cuesta dormir",
  "Estoy muy angustiado y no sé qué hacer",
  "Mi jefe me humilla delante de mis compañeros y no sé cómo llevarlo",
  "No paro de llorar desde la ruptura",
  "Tengo depresión y me siento muy solo",
  "Estoy pasando una época muy mala y necesito ayuda",
  "Siento que no encajo en ningún sitio y no sé qué hacer",
  "Mi pareja me ignora y no sé cómo manejarlo",
  "Hazme terapia, necesito hablar de lo que me pasa",
  "Quiero que seas mi psicólogo un rato",
] as const;

for (const text of personalCases) {
  test(`personal therapy-style narrative is redirected: ${text}`, () => {
    assert.equal(isPersonalSupportSeekingText(text), true);
  });
}

const simpleGuideCases = [
  "Tengo ansiedad",
  "Tengo ansiedad, ¿qué hago?",
  "Estoy muy estresado",
  "Estoy muy estresado, ¿qué puedo hacer?",
  "No puedo dormir",
  "No puedo dormir, ¿qué puedo hacer?",
  "No paro de darle vueltas a todo",
  "Como por ansiedad",
  "¿Qué es la ansiedad?",
  "¿Qué síntomas puede tener la depresión?",
] as const;

for (const text of simpleGuideCases) {
  test(`single symptom or informational question is not forced into consultation: ${text}`, () => {
    assert.equal(isPersonalSupportSeekingText(text), false);
  });
}

function state(overrides: Partial<AgentCoarseUserState>): AgentCoarseUserState {
  return {
    hasDoneConsultation: false,
    questionnaireStage: "not_started",
    recommendedProcessActionId: "process_free_consultation",
    ...overrides,
  };
}

test("new personal-support users are accompanied to the free consultation", () => {
  const result = buildInternalGuideProcessAnswer("personal_support", null);
  assert.equal(result.action.id, "process_free_consultation");
  assert.match(result.message, /no hace terapia/i);
  assert.match(result.message, /15 minutos/i);
  assert.match(result.message, /explicar con tus propias palabras/i);
  assert.match(result.message, /Dossier Espejo personalizado/i);
  assert.match(result.message, /gratuito y sin compromiso/i);
});

test("personal-support guidance never restarts an active questionnaire", () => {
  const result = buildInternalGuideProcessAnswer(
    "personal_support",
    state({
      hasDoneConsultation: true,
      questionnaireStage: "active",
      recommendedProcessActionId: "process_questionnaire",
    }),
  );
  assert.equal(result.action.id, "process_questionnaire");
  assert.match(result.message, /no necesitas empezar de nuevo/i);
});

test("personal-support guidance sends dossier-ready users to the dossier", () => {
  const result = buildInternalGuideProcessAnswer(
    "personal_support",
    state({
      hasDoneConsultation: true,
      questionnaireStage: "dossier_ready",
      recommendedProcessActionId: "process_dossier",
    }),
  );
  assert.equal(result.action.id, "process_dossier");
  assert.match(result.message, /Dossier Espejo ya figura disponible/i);
});

test("repeated therapy-style use shares the existing benign misuse cooldown instead of creating a second hidden limiter", () => {
  const testDirectory = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(resolve(testDirectory, "..", "api", "agent-guide-ai.ts"), "utf8");
  const personalIndex = source.indexOf("isPersonalSupportSeekingText(text)");
  const registerIndex = source.indexOf("registerGuideOffTopicAttempt(guard, now)", personalIndex);
  const blockedIndex = source.indexOf("personalSupportBlockedResponse", registerIndex);
  assert.ok(personalIndex > 0);
  assert.ok(registerIndex > personalIndex);
  assert.ok(blockedIndex > registerIndex);
});
