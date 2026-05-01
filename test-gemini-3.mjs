import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  let history = [
      { role: "model", parts: [{ text: "Hola soy Asistente" }]}
  ];

  try {
    const chatWithHistory = ai.chats.create({
      model: "gemini-2.5-flash",
      history
    });

    const response = await chatWithHistory.sendMessage({ message: "Qué tal" });
    console.log("Success:", response.text);
  } catch(e) {
    console.error("SDK Error details:", e.status, e.message);
  }
}
run();
