import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  AGENT_USER_STATE_PROFILE_FIELD_MASK,
  AGENT_USER_STATE_USER_FIELD_MASK,
  readAgentCoarseUserStateSignalsForAuthenticatedUser,
} from "../src/services/agentCoarseStateTransport";
import { deriveAgentCoarseUserState } from "../src/agent/userState";

function firestoreDocument(fields: Record<string, unknown>) {
  return new Response(JSON.stringify({ fields }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function fieldMaskFromUrl(url: string): string[] {
  return new URL(url).searchParams.getAll("mask.fieldPaths");
}

test("transport masks contain only the approved coarse fields", () => {
  assert.deepEqual(AGENT_USER_STATE_USER_FIELD_MASK, [
    "hasDoneConsultation",
    "questionnaireStatus",
    "questionnaireRequestStatus",
    "dossierAvailableAt",
  ]);
  assert.deepEqual(AGENT_USER_STATE_PROFILE_FIELD_MASK, [
    "questionnaireStatus",
    "questionnaireRequestStatus",
    "dossierAvailableAt",
  ]);

  const serialized = JSON.stringify([
    ...AGENT_USER_STATE_USER_FIELD_MASK,
    ...AGENT_USER_STATE_PROFILE_FIELD_MASK,
  ]);
  assert.doesNotMatch(
    serialized,
    /email|phone|nombre|name|age|edad|sex|sexo|patient|access.?code|pin|latestDossier|conclusion|answer|summary|token/i,
  );
});

test("transport requests only masked owner documents with the Firebase bearer token", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  let tokenCalls = 0;

  const fakeFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, init });

    if (url.includes("/documents/users/")) {
      return firestoreDocument({
        hasDoneConsultation: { booleanValue: true },
        questionnaireStatus: { stringValue: "in_progress" },
        questionnaireRequestStatus: { stringValue: "sent" },
        dossierAvailableAt: { nullValue: null },
      });
    }

    return firestoreDocument({
      questionnaireStatus: { stringValue: "in_progress" },
      questionnaireRequestStatus: { stringValue: "sent" },
      dossierAvailableAt: { nullValue: null },
    });
  };

  const signals = await readAgentCoarseUserStateSignalsForAuthenticatedUser(
    {
      uid: "owner-uid",
      async getIdToken() {
        tokenCalls += 1;
        return "temporary-id-token";
      },
    },
    fakeFetch,
  );

  assert.equal(tokenCalls, 1);
  assert.equal(requests.length, 2);

  const userRequest = requests.find((request) => request.url.includes("/documents/users/"));
  const profileRequest = requests.find((request) => request.url.includes("/documents/userProfiles/"));
  assert.ok(userRequest);
  assert.ok(profileRequest);

  assert.match(userRequest.url, /\/documents\/users\/owner-uid\?/);
  assert.match(profileRequest.url, /\/documents\/userProfiles\/owner-uid\?/);
  assert.deepEqual(fieldMaskFromUrl(userRequest.url), [...AGENT_USER_STATE_USER_FIELD_MASK]);
  assert.deepEqual(fieldMaskFromUrl(profileRequest.url), [...AGENT_USER_STATE_PROFILE_FIELD_MASK]);

  for (const request of requests) {
    assert.equal(request.init?.method, "GET");
    assert.equal(request.init?.cache, "no-store");
    assert.equal(
      (request.init?.headers as Record<string, string>)?.Authorization,
      "Bearer temporary-id-token",
    );
    assert.doesNotMatch(request.url, /temporary-id-token/);
    assert.equal(request.init?.body, undefined);
  }

  assert.deepEqual(signals, {
    hasDoneConsultation: true,
    userQuestionnaireStatus: "in_progress",
    userQuestionnaireRequestStatus: "sent",
    profileQuestionnaireStatus: "in_progress",
    profileQuestionnaireRequestStatus: "sent",
    dossierEvidence: false,
  });
  assert.doesNotMatch(JSON.stringify(signals), /owner-uid|temporary-id-token/);
});

test("transport converts only dossier availability into a boolean coarse signal", async () => {
  const fakeFetch: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("/documents/users/")) {
      return firestoreDocument({
        hasDoneConsultation: { booleanValue: true },
        questionnaireStatus: { stringValue: "dossier_available" },
        dossierAvailableAt: { timestampValue: "2026-09-13T08:00:00Z" },
      });
    }
    return firestoreDocument({});
  };

  const signals = await readAgentCoarseUserStateSignalsForAuthenticatedUser(
    { uid: "owner", getIdToken: async () => "token" },
    fakeFetch,
  );

  assert.equal(signals?.dossierEvidence, true);
  assert.equal("dossierAvailableAt" in (signals || {}), false);

  const state = deriveAgentCoarseUserState(signals || {});
  assert.deepEqual(state, {
    hasDoneConsultation: true,
    questionnaireStage: "dossier_ready",
    recommendedProcessActionId: "process_dossier",
  });
});

test("reset_required still wins after masked transport", async () => {
  const fakeFetch: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("/documents/users/")) {
      return firestoreDocument({
        hasDoneConsultation: { booleanValue: true },
        questionnaireStatus: { stringValue: "dossier_available" },
        dossierAvailableAt: { timestampValue: "2026-09-13T08:00:00Z" },
      });
    }
    return firestoreDocument({
      questionnaireStatus: { stringValue: "reset_required" },
    });
  };

  const signals = await readAgentCoarseUserStateSignalsForAuthenticatedUser(
    { uid: "owner", getIdToken: async () => "token" },
    fakeFetch,
  );
  const state = deriveAgentCoarseUserState(signals || {});

  assert.deepEqual(state, {
    hasDoneConsultation: true,
    questionnaireStage: "reset_required",
    recommendedProcessActionId: "process_questionnaire",
  });
});

test("missing profile document is treated as empty without widening the read", async () => {
  const fakeFetch: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("/documents/userProfiles/")) {
      return new Response("{}", { status: 404 });
    }
    return firestoreDocument({
      hasDoneConsultation: { booleanValue: true },
      questionnaireStatus: { stringValue: "requested" },
    });
  };

  const signals = await readAgentCoarseUserStateSignalsForAuthenticatedUser(
    { uid: "owner", getIdToken: async () => "token" },
    fakeFetch,
  );

  assert.deepEqual(signals, {
    hasDoneConsultation: true,
    userQuestionnaireStatus: "requested",
    userQuestionnaireRequestStatus: null,
    profileQuestionnaireStatus: null,
    profileQuestionnaireRequestStatus: null,
    dossierEvidence: false,
  });
});

test("transport fails closed and returns no state on authorization or network failure", async () => {
  const unauthorizedFetch: typeof fetch = async () => new Response("{}", { status: 403 });
  const networkFailureFetch: typeof fetch = async () => {
    throw new Error("offline");
  };

  assert.equal(
    await readAgentCoarseUserStateSignalsForAuthenticatedUser(
      { uid: "owner", getIdToken: async () => "token" },
      unauthorizedFetch,
    ),
    null,
  );
  assert.equal(
    await readAgentCoarseUserStateSignalsForAuthenticatedUser(
      { uid: "owner", getIdToken: async () => "token" },
      networkFailureFetch,
    ),
    null,
  );
});

test("transport source has no Firestore SDK reads, writes, sensitive field reads or logging", () => {
  const source = readFileSync(
    new URL("../src/services/agentCoarseStateTransport.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /firebase\/firestore|\bgetDoc\b|\bsetDoc\b|\bupdateDoc\b|\bdeleteDoc\b|\baddDoc\b/);
  assert.doesNotMatch(source, /latestDossier|InternalContext|patientId|accessCode|personalAccessCode|questionnaireAccessCode|finalConclusion|conversationSummary/i);
  assert.doesNotMatch(source, /console\.(?:log|warn|error)/);
  assert.match(source, /mask\.fieldPaths/);
  assert.match(source, /Authorization: `Bearer \$\{token\}`/);
});

test("Phase 7A transport is not connected to Layout or InternalGuide", () => {
  const layoutSource = readFileSync(
    new URL("../src/components/Layout.tsx", import.meta.url),
    "utf8",
  );
  const guideSource = readFileSync(
    new URL("../src/agent/adapters/InternalGuide.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(layoutSource, /agentCoarseStateTransport/);
  assert.doesNotMatch(guideSource, /agentCoarseStateTransport/);
});
