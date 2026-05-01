import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: "Hola"
    });
    console.log("Success:", response.text);
  } catch(e) {
    console.error("SDK Error:", e.status, e.message);
  }
}
run();
