// Simple API client to replace direct Gemini calls from the frontend

export const api = {
  async sessionReply(history: any[], message: string) {
    const res = await fetch("/api/session-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, message })
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  },

  async report(messages: any[], accumulatedSummary: string) {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, accumulatedSummary })
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  },

  async diaryValidate(entry1: string, entry2: string) {
    const res = await fetch("/api/diary-validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry1, entry2 })
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  },

  async diaryDeepen(entry1: string, entry2: string, reflection: string) {
    const res = await fetch("/api/diary-deepen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry1, entry2, reflection })
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  },

  async weeklyGoal(category: string, accumulatedSummary: string) {
    const res = await fetch("/api/weekly-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, accumulatedSummary })
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }
};
