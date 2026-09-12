import { resolveQuestionnaireUiState } from "../../api/questionnaireWebhookPolicy";

export type AgentProcessActionId =
  | "process_free_consultation"
  | "process_questionnaire"
  | "process_dossier";

export type AgentQuestionnaireStage =
  | "not_started"
  | "active"
  | "reset_required"
  | "dossier_ready";

export interface AgentCoarseUserState {
  readonly hasDoneConsultation: boolean;
  readonly questionnaireStage: AgentQuestionnaireStage;
  readonly recommendedProcessActionId: AgentProcessActionId;
}

function consultationIsDone(
  userData: Record<string, unknown>,
  profileData: Record<string, unknown>,
): boolean {
  return [
    userData.hasDoneConsultation,
    userData.consultationCompleted,
    userData.sessionCompleted,
    profileData.hasDoneConsultation,
    profileData.consultationCompleted,
    profileData.sessionCompleted,
  ].some((value) => value === true);
}

export function deriveAgentCoarseUserState(
  userData: Record<string, unknown>,
  profileData: Record<string, unknown>,
): AgentCoarseUserState {
  const hasDoneConsultation = consultationIsDone(userData, profileData);
  const questionnaireUiState = resolveQuestionnaireUiState(userData, profileData);

  let questionnaireStage: AgentQuestionnaireStage = "not_started";
  let recommendedProcessActionId: AgentProcessActionId = "process_free_consultation";

  if (questionnaireUiState.resetRequired) {
    questionnaireStage = "reset_required";
    recommendedProcessActionId = "process_questionnaire";
  } else if (questionnaireUiState.dossierReady) {
    questionnaireStage = "dossier_ready";
    recommendedProcessActionId = "process_dossier";
  } else if (questionnaireUiState.questionnaireActive || hasDoneConsultation) {
    questionnaireStage = questionnaireUiState.questionnaireActive ? "active" : "not_started";
    recommendedProcessActionId = "process_questionnaire";
  }

  return {
    hasDoneConsultation,
    questionnaireStage,
    recommendedProcessActionId,
  };
}

function readBuildEnvironment(): Readonly<Record<string, unknown>> | undefined {
  return (import.meta as ImportMeta & { readonly env?: Readonly<Record<string, unknown>> }).env;
}

export function isSoyBienestarInternalGuideContextEnabled(
  env: Readonly<Record<string, unknown>> | undefined = readBuildEnvironment(),
): boolean {
  return env?.VITE_INTERNAL_GUIDE_CONTEXT_ENABLED !== "false";
}
