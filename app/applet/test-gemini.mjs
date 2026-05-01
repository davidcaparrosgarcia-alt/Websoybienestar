import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No GEMINI_API_KEY found");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "Eres un asistente",
      },
      history: []
    });
    const response = await chat.sendMessage({ message: "Hola" });
    console.log("Response:", response.text);
  } catch(e) {
    console.error("SDK Error details:", e);
  }
}
run();
