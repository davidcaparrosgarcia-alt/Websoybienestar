import test from "node:test";
import assert from "node:assert/strict";
import {
  GUIDE_MALICIOUS_LOCK_MS,
  GUIDE_MISUSE_WINDOW_MS,
  GUIDE_OFF_TOPIC_LOCK_MS,
  freshGuideGuardState,
  incrementGuideAiCount,
  isGuideDailyLimitReached,
  normalizeGuideGuardState,
  registerGuideMaliciousAttempt,
  registerGuideOffTopicAttempt,
} from "../api/agentGuideGuard";

const NOW = Date.UTC(2026, 8, 13, 12, 0, 0);

test("first malicious attempt warns but does not lock", () => {
  const first = registerGuideMaliciousAttempt(freshGuideGuardState(NOW), NOW);
  assert.equal(first.maliciousCount, 1);
  assert.equal(first.lockedUntil, 0);
});

test("second malicious attempt inside ten minutes locks the guide for thirty minutes", () => {
  const first = registerGuideMaliciousAttempt(freshGuideGuardState(NOW), NOW);
  const secondAt = NOW + 60_000;
  const second = registerGuideMaliciousAttempt(first, secondAt);
  assert.equal(second.maliciousCount, 2);
  assert.equal(second.lockedUntil, secondAt + GUIDE_MALICIOUS_LOCK_MS);
});

test("malicious strike count resets after the misuse window", () => {
  const first = registerGuideMaliciousAttempt(freshGuideGuardState(NOW), NOW);
  const later = NOW + GUIDE_MISUSE_WINDOW_MS + 1;
  const next = registerGuideMaliciousAttempt(first, later);
  assert.equal(next.maliciousCount, 1);
  assert.equal(next.lockedUntil, 0);
});

test("three benign off-topic attempts inside the window trigger a short cooldown", () => {
  let state = freshGuideGuardState(NOW);
  state = registerGuideOffTopicAttempt(state, NOW);
  assert.equal(state.lockedUntil, 0);
  state = registerGuideOffTopicAttempt(state, NOW + 30_000);
  assert.equal(state.lockedUntil, 0);
  const thirdAt = NOW + 60_000;
  state = registerGuideOffTopicAttempt(state, thirdAt);
  assert.equal(state.offTopicCount, 3);
  assert.equal(state.lockedUntil, thirdAt + GUIDE_OFF_TOPIC_LOCK_MS);
});

test("daily AI quota counts only explicit AI increments", () => {
  let state = freshGuideGuardState(NOW);
  for (let index = 0; index < 20; index += 1) {
    state = incrementGuideAiCount(state, NOW + index);
  }
  assert.equal(state.aiCount, 20);
  assert.equal(isGuideDailyLimitReached(state, 20, NOW + 100), true);
  assert.equal(isGuideDailyLimitReached(state, 21, NOW + 100), false);
});

test("new UTC day resets daily AI count and misuse counters", () => {
  let state = freshGuideGuardState(NOW);
  state = incrementGuideAiCount(state, NOW);
  state = registerGuideMaliciousAttempt(state, NOW);
  const tomorrow = NOW + 24 * 60 * 60 * 1000;
  const normalized = normalizeGuideGuardState(state, tomorrow);
  assert.equal(normalized.aiCount, 0);
  assert.equal(normalized.maliciousCount, 0);
  assert.equal(normalized.offTopicCount, 0);
  assert.equal(normalized.lockedUntil, 0);
});
