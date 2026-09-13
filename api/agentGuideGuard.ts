export const GUIDE_MISUSE_WINDOW_MS = 10 * 60 * 1000;
export const GUIDE_MALICIOUS_LOCK_MS = 30 * 60 * 1000;
export const GUIDE_OFF_TOPIC_LOCK_MS = 10 * 60 * 1000;

export interface GuideGuardState {
  readonly version: 1;
  readonly day: string;
  readonly aiCount: number;
  readonly misuseWindowStartedAt: number;
  readonly maliciousCount: number;
  readonly offTopicCount: number;
  readonly lockedUntil: number;
}

function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function isFiniteNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function freshGuideGuardState(now: number): GuideGuardState {
  return {
    version: 1,
    day: dayKey(now),
    aiCount: 0,
    misuseWindowStartedAt: now,
    maliciousCount: 0,
    offTopicCount: 0,
    lockedUntil: 0,
  };
}

export function normalizeGuideGuardState(value: unknown, now: number): GuideGuardState {
  const fresh = freshGuideGuardState(now);
  if (!value || typeof value !== "object" || Array.isArray(value)) return fresh;
  const record = value as Record<string, unknown>;
  if (
    record.version !== 1 ||
    typeof record.day !== "string" ||
    !isFiniteNonNegativeInteger(record.aiCount) ||
    !isFiniteNonNegativeInteger(record.misuseWindowStartedAt) ||
    !isFiniteNonNegativeInteger(record.maliciousCount) ||
    !isFiniteNonNegativeInteger(record.offTopicCount) ||
    !isFiniteNonNegativeInteger(record.lockedUntil)
  ) {
    return fresh;
  }

  if (record.day !== dayKey(now)) return fresh;

  const misuseExpired = now - record.misuseWindowStartedAt >= GUIDE_MISUSE_WINDOW_MS;
  return {
    version: 1,
    day: record.day,
    aiCount: record.aiCount,
    misuseWindowStartedAt: misuseExpired ? now : record.misuseWindowStartedAt,
    maliciousCount: misuseExpired ? 0 : record.maliciousCount,
    offTopicCount: misuseExpired ? 0 : record.offTopicCount,
    lockedUntil: record.lockedUntil > now ? record.lockedUntil : 0,
  };
}

export function registerGuideMaliciousAttempt(
  state: GuideGuardState,
  now: number,
): GuideGuardState {
  const normalized = normalizeGuideGuardState(state, now);
  const maliciousCount = normalized.maliciousCount + 1;
  return {
    ...normalized,
    maliciousCount,
    lockedUntil:
      maliciousCount >= 2 ? now + GUIDE_MALICIOUS_LOCK_MS : normalized.lockedUntil,
  };
}

export function registerGuideOffTopicAttempt(
  state: GuideGuardState,
  now: number,
): GuideGuardState {
  const normalized = normalizeGuideGuardState(state, now);
  const offTopicCount = normalized.offTopicCount + 1;
  return {
    ...normalized,
    offTopicCount,
    lockedUntil:
      offTopicCount >= 3 ? now + GUIDE_OFF_TOPIC_LOCK_MS : normalized.lockedUntil,
  };
}

export function incrementGuideAiCount(state: GuideGuardState, now: number): GuideGuardState {
  const normalized = normalizeGuideGuardState(state, now);
  return { ...normalized, aiCount: normalized.aiCount + 1 };
}

export function isGuideDailyLimitReached(
  state: GuideGuardState,
  dailyLimit: number,
  now: number,
): boolean {
  return normalizeGuideGuardState(state, now).aiCount >= dailyLimit;
}
