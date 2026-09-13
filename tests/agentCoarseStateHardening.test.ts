import test from "node:test";
import assert from "node:assert/strict";
import {
  readAgentCoarseUserStateSignalsForAuthenticatedUser,
} from "../src/services/agentCoarseStateTransport";

function firestoreDocument(fields: Record<string, unknown>) {
  return new Response(JSON.stringify({ fields }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function dossierEvidenceFor(value: Record<string, unknown>) {
  const fakeFetch: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("/documents/users/")) {
      return firestoreDocument({ dossierAvailableAt: value });
    }
    return firestoreDocument({});
  };

  const signals = await readAgentCoarseUserStateSignalsForAuthenticatedUser(
    { uid: "owner", getIdToken: async () => "token" },
    fakeFetch,
  );

  return signals?.dossierEvidence ?? null;
}

test("dossier evidence requires a valid Firestore timestamp", async () => {
  assert.equal(await dossierEvidenceFor({ nullValue: null }), false);
  assert.equal(await dossierEvidenceFor({ booleanValue: true }), false);
  assert.equal(await dossierEvidenceFor({ stringValue: "2026-09-13T08:00:00Z" }), false);
  assert.equal(await dossierEvidenceFor({ timestampValue: "" }), false);
  assert.equal(await dossierEvidenceFor({ timestampValue: "not-a-date" }), false);
  assert.equal(
    await dossierEvidenceFor({ timestampValue: "2026-09-13T08:00:00.000Z" }),
    true,
  );
});
