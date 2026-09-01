export type QuestionnaireWebhookEvent =
  | "questionnaire_started"
  | "questionnaire_completed"
  | "dossier_available"
  | "questionnaire_deleted";

export type QuestionnairePolicyAction =
  | "apply"
  | "duplicate"
  | "regression"
  | "stale_cycle";

export interface QuestionnaireCycleInput {
  currentStatus: string | null;
  currentRequestId: string | null;
  currentPatientId: string | null;
  incomingRequestId: string | null;
  incomingPatientId: string | null;
  event: QuestionnaireWebhookEvent;
  semanticEventExists?: boolean;
}

export interface QuestionnaireCycleDecision {
  action: QuestionnairePolicyAction;
  nextStatus: string | null;
  reason: string;
}

export interface QuestionnaireMatchInput {
  explicitUidProvided: boolean;
  validExplicitUid: string | null;
  sourceRequestIdProvided: boolean;
  sourceRequestCandidates: string[];
  emailCandidates: string[];
}

export type QuestionnaireMatchDecision =
  | { kind: "match"; uid: string; matchedBy: "uid" | "sourceRequestId" | "email" }
  | { kind: "unmatched" | "ambiguous"; matchedBy: "uid" | "sourceRequestId" | "email" };

const ORDINARY_STATUS_RANK: Record<string, number> = {
  requested: 0,
  sent: 1,
  in_progress: 2,
  completed_pending_dossier: 3,
  completed: 4,
  dossier_available: 5,
  concluded: 6,
  finalized: 6,
};

const STATUS_PRIORITY = [
  "reset_required",
  "finalized",
  "concluded",
  "dossier_available",
  "completed",
  "completed_pending_dossier",
  "in_progress",
  "sent",
  "requested",
];

const EVENT_TARGET_STATUS: Record<QuestionnaireWebhookEvent, string> = {
  questionnaire_started: "in_progress",
  questionnaire_completed: "completed_pending_dossier",
  dossier_available: "dossier_available",
  questionnaire_deleted: "reset_required",
};

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function uniqueNonEmptyValues(values: unknown[]): string[] {
  return [...new Set(values.map(clean).filter((value): value is string => !!value))];
}

export function isNewCycleAfterReset(
  lastRequestAt: number,
  resetRequiredAt: number | null,
): boolean {
  return (resetRequiredAt || 0) > 0 && (resetRequiredAt || 0) >= lastRequestAt;
}

export function selectQuestionnaireRequestId(
  isContinuingQuestionnaire: boolean,
  previousRequestId: string | null,
  newRequestId: string,
): string {
  return isContinuingQuestionnaire && previousRequestId
    ? previousRequestId
    : newRequestId;
}

export function resolveUniqueUid(candidates: string[]):
  | { kind: "match"; uid: string }
  | { kind: "unmatched" | "ambiguous" } {
  const unique = uniqueNonEmptyValues(candidates);
  if (unique.length === 1) return { kind: "match", uid: unique[0] };
  return { kind: unique.length === 0 ? "unmatched" : "ambiguous" };
}

export function resolveQuestionnaireMatch(input: QuestionnaireMatchInput): QuestionnaireMatchDecision {
  if (input.validExplicitUid) {
    return { kind: "match", uid: input.validExplicitUid, matchedBy: "uid" };
  }

  if (input.sourceRequestIdProvided) {
    const sourceMatch = resolveUniqueUid(input.sourceRequestCandidates);
    return sourceMatch.kind === "match"
      ? { ...sourceMatch, matchedBy: "sourceRequestId" }
      : { kind: sourceMatch.kind, matchedBy: "sourceRequestId" };
  }

  if (input.explicitUidProvided) {
    return { kind: "unmatched", matchedBy: "uid" };
  }

  const emailMatch = resolveUniqueUid(input.emailCandidates);
  return emailMatch.kind === "match"
    ? { ...emailMatch, matchedBy: "email" }
    : { kind: emailMatch.kind, matchedBy: "email" };
}

export function resolveEffectiveQuestionnaireStatus(
  userData: Record<string, unknown>,
  profileData: Record<string, unknown>,
): string | null {
  const statuses = [
    clean(userData.questionnaireStatus),
    clean(userData.questionnaireRequestStatus),
    clean(profileData.questionnaireStatus),
    clean(profileData.questionnaireRequestStatus),
  ].filter((status): status is string => !!status);

  return STATUS_PRIORITY.find((status) => statuses.includes(status)) || statuses[0] || null;
}

function cycleIsCurrent(input: QuestionnaireCycleInput): boolean {
  const currentRequestId = clean(input.currentRequestId);
  const currentPatientId = clean(input.currentPatientId);
  const incomingRequestId = clean(input.incomingRequestId);
  const incomingPatientId = clean(input.incomingPatientId);

  if (currentRequestId && incomingRequestId && currentRequestId !== incomingRequestId) return false;
  if (currentPatientId && incomingPatientId && currentPatientId !== incomingPatientId) return false;

  if (currentRequestId) {
    if (incomingRequestId) return currentRequestId === incomingRequestId;
    return !!currentPatientId && currentPatientId === incomingPatientId;
  }

  return !!currentPatientId && currentPatientId === incomingPatientId;
}

export function decideQuestionnaireWebhook(
  input: QuestionnaireCycleInput,
): QuestionnaireCycleDecision {
  const nextStatus = EVENT_TARGET_STATUS[input.event];

  if (!cycleIsCurrent(input)) {
    return { action: "stale_cycle", nextStatus: null, reason: "stale_cycle" };
  }

  if (input.currentStatus === "reset_required") {
    return input.event === "questionnaire_deleted"
      ? { action: "duplicate", nextStatus: null, reason: "duplicate" }
      : { action: "stale_cycle", nextStatus: null, reason: "reset_blocked" };
  }

  if (input.semanticEventExists) {
    return { action: "duplicate", nextStatus: null, reason: "duplicate" };
  }

  if (input.event === "questionnaire_deleted") {
    return { action: "apply", nextStatus, reason: "applied" };
  }

  const currentRank = input.currentStatus ? ORDINARY_STATUS_RANK[input.currentStatus] : undefined;
  const targetRank = ORDINARY_STATUS_RANK[nextStatus];

  if (input.event === "questionnaire_started") {
    if (input.currentStatus === "in_progress") {
      return { action: "duplicate", nextStatus: null, reason: "duplicate" };
    }
    if (input.currentStatus === "requested" || input.currentStatus === "sent") {
      return { action: "apply", nextStatus, reason: "applied" };
    }
  }

  if (input.event === "questionnaire_completed") {
    if (input.currentStatus === "completed_pending_dossier" || input.currentStatus === "completed") {
      return { action: "duplicate", nextStatus: null, reason: "duplicate" };
    }
    if (["requested", "sent", "in_progress"].includes(input.currentStatus || "")) {
      return { action: "apply", nextStatus, reason: "applied" };
    }
  }

  if (input.event === "dossier_available") {
    if (input.currentStatus === "dossier_available") {
      return { action: "duplicate", nextStatus: null, reason: "duplicate" };
    }
    if (["requested", "sent", "in_progress", "completed_pending_dossier", "completed"].includes(input.currentStatus || "")) {
      return { action: "apply", nextStatus, reason: "applied" };
    }
  }

  return {
    action: currentRank !== undefined && currentRank >= targetRank ? "regression" : "regression",
    nextStatus: null,
    reason: "regression",
  };
}

export function resolveQuestionnaireUiState(
  userData: Record<string, unknown>,
  profileData: Record<string, unknown>,
) {
  const statuses = [
    clean(userData.questionnaireStatus),
    clean(userData.questionnaireRequestStatus),
    clean(profileData.questionnaireStatus),
    clean(profileData.questionnaireRequestStatus),
  ].filter((status): status is string => !!status);
  const resetRequired = statuses.includes("reset_required");
  const dossierStatuses = ["dossier_available", "concluded", "finalized"];
  const activeStatuses = [
    "requested",
    "sent",
    "in_progress",
    "completed_pending_dossier",
    "completed",
  ];
  const dossierEvidence = [
    userData.dossierAvailableAt,
    userData.latestDossier,
    userData.dossierViewedAt,
    profileData.dossierAvailableAt,
    profileData.latestDossier,
    profileData.dossierViewedAt,
  ].some(Boolean);

  return {
    resetRequired,
    dossierReady: !resetRequired && (dossierEvidence || statuses.some((status) => dossierStatuses.includes(status))),
    questionnaireActive: !resetRequired && statuses.some((status) => activeStatuses.includes(status)),
  };
}
