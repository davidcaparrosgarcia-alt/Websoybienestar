// Capa de abstracción de API para endpoints de IA.
// Mantiene las asunciones simples pero con mejor gestión de errores.

import { auth } from "../firebase";

async function fetchAPI(endpoint: string, body: any) {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error("Usuario no autenticado");
  }

  const token = await currentUser.getIdToken();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    let errorMessage = `Error ${res.status} en ${endpoint}`;
    try {
      const data = await res.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch (e) {
      // Si la respuesta no es JSON, mantenemos el mensaje genérico
    }
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export const api = {
  async sessionReply(history: any[], message: string) {
    return fetchAPI("/api/session-reply", { history, message });
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
  }
};
