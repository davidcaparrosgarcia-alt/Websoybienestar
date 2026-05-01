import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  // Simulated request history
  // history = history.filter((h: any) => h && h.role && Array.isArray(h.parts) && h.parts.length > 0 && h.parts[0].text).map((h: any) => ({ ... }));
  
  // Wait, does ai.chats.create support config.systemInstruction?
  // Let's test providing exactly what api/index.ts provides.
  
  let history = [
      { role: "user", parts: [{ text: "Hola" }]}
  ];

  try {
    const chatWithHistory = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "Eres un guía virtual",
        maxOutputTokens: 700,
      },
      history
    });

    const response = await chatWithHistory.sendMessage({ message: "Qué tal" });
    console.log("Success:", response.text);
  } catch(e) {
    console.error("SDK Error:", e);
  }
}
run();
