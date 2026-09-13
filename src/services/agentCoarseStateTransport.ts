import { auth } from "../firebase";
import firebaseConfig from "../../firebase-applet-config.json";
import type { AgentCoarseUserStateSignals } from "../agent/userState";

export const AGENT_USER_STATE_USER_FIELD_MASK = [
  "hasDoneConsultation",
  "questionnaireStatus",
  "questionnaireRequestStatus",
  "dossierAvailableAt",
] as const;

export const AGENT_USER_STATE_PROFILE_FIELD_MASK = [
  "questionnaireStatus",
  "questionnaireRequestStatus",
  "dossierAvailableAt",
] as const;

type AgentStateCollection = "users" | "userProfiles";

type FirestoreValue = {
  booleanValue?: boolean;
  stringValue?: string;
  integerValue?: string | number;
  doubleValue?: number;
  timestampValue?: string;
  nullValue?: null | string;
};

type FirestoreFields = Record<string, FirestoreValue>;

type FirestoreDocumentResponse = {
  fields?: FirestoreFields;
};

export interface AgentAuthenticatedUserLike {
  readonly uid: string;
  getIdToken(): Promise<string>;
}

function buildMaskedDocumentUrl(
  collection: AgentStateCollection,
  uid: string,
  fieldPaths: readonly string[],
): string {
  const projectId = String(firebaseConfig.projectId || "").trim();
  const databaseId = String(firebaseConfig.firestoreDatabaseId || "").trim();

  if (!projectId || !databaseId || !uid) {
    throw new Error("AGENT_STATE_TRANSPORT_CONFIG_INVALID");
  }

  const params = new URLSearchParams();
  for (const fieldPath of fieldPaths) {
    params.append("mask.fieldPaths", fieldPath);
  }

  return (
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
    `/databases/${encodeURIComponent(databaseId)}/documents/${collection}/${encodeURIComponent(uid)}` +
    `?${params.toString()}`
  );
}

function readStringField(fields: FirestoreFields, fieldName: string): string | null {
  const value = fields[fieldName]?.stringValue;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBooleanField(fields: FirestoreFields, fieldName: string): boolean {
  return fields[fieldName]?.booleanValue === true;
}

function hasValidTimestampField(fields: FirestoreFields, fieldName: string): boolean {
  const value = fields[fieldName]?.timestampValue;
  return typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

async function readMaskedDocument(
  collection: AgentStateCollection,
  uid: string,
  token: string,
  fieldPaths: readonly string[],
  fetchImpl: typeof fetch,
): Promise<FirestoreFields> {
  const response = await fetchImpl(buildMaskedDocumentUrl(collection, uid, fieldPaths), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) return {};
  if (!response.ok) throw new Error(`AGENT_STATE_TRANSPORT_HTTP_${response.status}`);

  const payload = (await response.json()) as FirestoreDocumentResponse;
  return payload?.fields && typeof payload.fields === "object" ? payload.fields : {};
}

export async function readAgentCoarseUserStateSignalsForAuthenticatedUser(
  user: AgentAuthenticatedUserLike,
  fetchImpl: typeof fetch = fetch,
): Promise<AgentCoarseUserStateSignals | null> {
  try {
    const uid = String(user.uid || "").trim();
    if (!uid) return null;

    const token = await user.getIdToken();
    if (!token) return null;

    const [userFields, profileFields] = await Promise.all([
      readMaskedDocument(
        "users",
        uid,
        token,
        AGENT_USER_STATE_USER_FIELD_MASK,
        fetchImpl,
      ),
      readMaskedDocument(
        "userProfiles",
        uid,
        token,
        AGENT_USER_STATE_PROFILE_FIELD_MASK,
        fetchImpl,
      ),
    ]);

    return {
      hasDoneConsultation: readBooleanField(userFields, "hasDoneConsultation"),
      userQuestionnaireStatus: readStringField(userFields, "questionnaireStatus"),
      userQuestionnaireRequestStatus: readStringField(
        userFields,
        "questionnaireRequestStatus",
      ),
      profileQuestionnaireStatus: readStringField(
        profileFields,
        "questionnaireStatus",
      ),
      profileQuestionnaireRequestStatus: readStringField(
        profileFields,
        "questionnaireRequestStatus",
      ),
      dossierEvidence:
        hasValidTimestampField(userFields, "dossierAvailableAt") ||
        hasValidTimestampField(profileFields, "dossierAvailableAt"),
    };
  } catch {
    return null;
  }
}

export async function readAgentCoarseUserStateSignals(): Promise<AgentCoarseUserStateSignals | null> {
  const user = auth.currentUser;
  if (!user) return null;

  return readAgentCoarseUserStateSignalsForAuthenticatedUser(user);
}
