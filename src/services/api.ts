// Capa de abstracción de API para endpoints de IA.
// Mantiene las asunciones simples pero con mejor gestión de errores.

import { auth } from "../firebase";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function fetchAPI(endpoint: string, body: any) {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error("Usuario no autenticado");
  }

  const token = await currentUser.getIdToken(true);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error || `Error ${res.status} en ${endpoint}`, res.status, data);
  }

  return data;
}

async function fetchAuthenticatedGET(endpoint: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Usuario no autenticado");
  }

  const token = await currentUser.getIdToken(true);
  const res = await fetch(endpoint, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error || `Error ${res.status} en ${endpoint}`, res.status, data);
  }
  return data;
}

export const api = {
  async sessionReply(history: any[], message: string, sessionContext?: any) {
    return fetchAPI("/api/session-reply", { history, message, sessionContext });
  },

  async report(messages: any[], accumulatedSummary: string) {
    return fetchAPI("/api/report", { messages, accumulatedSummary });
  },

  async diaryValidate(entry1: string, entry2: string, accumulatedSummary: string) {
    return fetchAPI("/api/diary-validate", { entry1, entry2, accumulatedSummary });
  },

  async diaryDeepen(entry1: string, entry2: string, reflection: string, accumulatedSummary: string) {
    return fetchAPI("/api/diary-deepen", { entry1, entry2, reflection, accumulatedSummary });
  },

  async weeklyGoal(category: string, accumulatedSummary: string) {
    return fetchAPI("/api/weekly-goal", { category, accumulatedSummary });
  },

  async transcribeAudio(audioBase64: string, mimeType: string, slot?: 1 | 2) {
    return fetchAPI("/api/transcribe-audio", { audioBase64, mimeType, ...(slot ? { slot } : {}) });
  },

  async audioTranscriptionUsage() {
    return fetchAuthenticatedGET("/api/audio-transcription-usage");
  }
};
