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

/**
 * Privacy-safe signals accepted by the agent state layer.
 *
 * This deliberately does not accept Firestore documents, questionnaire answers,
 * dossier contents, access codes, identifiers or contact/profile data.
 * A future transport may derive these coarse signals outside the agent boundary,
 * but the agent itself only receives the values listed here.
 */
export interface AgentCoarseUserStateSignals {
  readonly hasDoneConsultation?: boolean;
  readonly userQuestionnaireStatus?: string | null;
  readonly userQuestionnaireRequestStatus?: string | null;
  readonly profileQuestionnaireStatus?: string | null;
  readonly profileQuestionnaireRequestStatus?: string | null;
  readonly dossierEvidence?: boolean;
}

export function deriveAgentCoarseUserState(
  signals: AgentCoarseUserStateSignals,
): AgentCoarseUserState {
  const hasDoneConsultation = signals.hasDoneConsultation === true;

  // Reuse the existing canonical questionnaire policy with a synthetic,
  // minimal input. No private document is passed into the agent layer.
  const questionnaireUiState = resolveQuestionnaireUiState(
    {
      questionnaireStatus: signals.userQuestionnaireStatus,
      questionnaireRequestStatus: signals.userQuestionnaireRequestStatus,
      dossierAvailableAt: signals.dossierEvidence === true ? true : undefined,
    },
    {
      questionnaireStatus: signals.profileQuestionnaireStatus,
      questionnaireRequestStatus: signals.profileQuestionnaireRequestStatus,
    },
  );

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
