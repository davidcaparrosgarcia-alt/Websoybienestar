import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We initialize GoogleGenAI conditionally to avoid immediate crashes if key is missing
let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
} catch (e) {
  console.warn("Could not initialize GoogleGenAI. Is GEMINI_API_KEY set?");
}

// Utility to parse Gemini JSON safely
function parseGeminiJSON(text: string) {
  if (!text) return {};
  let jsonStr = text.replace(/```json\n?|```/g, "").trim();
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid JSON structure");
  }
}

async function startServer() {
  const app = express();
  // Using 3000 as base infrastructure requirement, with robust fallback
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "2mb" }));

  // Middleware to ensure AI is initialized before handling requests
  const requireAI = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!ai) {
      return res.status(500).json({ error: "Servicio de IA no disponible en el servidor (falta API Key)" });
    }
    next();
  };

  app.post("/api/session-reply", requireAI, async (req, res) => {
    try {
      const { history, message } = req.body;
      if (!message || typeof message !== 'string') return res.status(400).json({ error: "Invalid message" });

      const chatWithHistory = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "Eres un asistente empático, cálido y profesional, actuando como un puente entre el paciente y un terapeuta humano. Tu objetivo es escuchar al paciente, hacerle preguntas suaves y guiadas para entender su situación (ansiedad, estrés, etc.) y ayudarle a plasmar cómo se siente en un máximo de 15 minutos. Mantén respuestas concisas, conversacionales y muy humanas. No diagnostiques, solo recopila información y brinda apoyo emocional.",
        },
        history: Array.isArray(history) ? history : []
      });

      const response = await chatWithHistory.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate session reply" });
    }
  });

  app.post("/api/report", requireAI, async (req, res) => {
    try {
      const { messages, accumulatedSummary } = req.body;
      if (!Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages array" });

      const conversationText = messages
        .map((msg: any) => `${msg.role === "user" ? "Paciente" : "IA"}: ${msg.content}`)
        .join("\n\n");

      const prompt = `
        A continuación se presenta la transcripción de una sesión preliminar entre un paciente y una IA asistente.
        Tu tarea es actuar como un Psicólogo / Coach de vida y evaluar esta sesión.
        Instrucciones:
        1. Determina si la sesión ha llegado a un punto de conclusión válido o aportado información útil y relevante sobre el estado del paciente. (Mero ruido o conversaciones vacías no son válidas).
        2. Genera un informe detallado estructurado en Markdown clásico.
        3. Genera un resumen compacto de la sesión actual sumado a resúmenes pasados (si existen).
        
        Historial pasado de sesiones (Resumen Acumulado):
        ${accumulatedSummary || "No hay historial previo."}

        Transcripción Actual:
        ${conversationText}

        EL RESULTADO DEBE SER EXCLUSIVAMENTE UN OBJETO JSON con esta estructura exacta (sin bloques \`\`\`json):
        {
          "validConclusion": boolean,
          "markdownReport": "El informe clínico completo (motivo, síntomas, contexto, observaciones)",
          "newAccumulatedSummary": "El nuevo resumen que integra lo viejo (si existía) con lo nuevo"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const parsed = parseGeminiJSON(response.text || "{}");
      res.json(parsed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.post("/api/diary-validate", requireAI, async (req, res) => {
    try {
      const { entry1, entry2 } = req.body;
      if (!entry1 || !entry2) return res.status(400).json({ error: "Entries missing" });

      const prompt = `Eres un psicoterapeuta y coach de vida experto. Analiza las siguientes dos razones de gratitud de un paciente (que puede padecer depresión, estrés o ansiedad).
Instrucciones:
1. Puntúa cada motivo con 0, 1 o 2 ('destellos'). 0 = vacío/esquivo/sin esfuerzo real, 1 = superficial, 2 = profundo o significativo. (Max 2 para cada uno).
2. Escribe una pequeña reflexión terapéutica (1 o 2 párrafos). Relaciónate con los hechos relatados por el usuario. Sé profesional, amigable y didáctico. Evita la positividad tóxica; ofrece una valoración realista con un leve decantamiento hacia la motivación para que no se desanime.
Motivo 1: "${entry1}"
Motivo 2: "${entry2}"
Responde EXCLUSIVAMENTE con un objeto JSON (sin comillas invertidas extra):
{
  "score1": número,
  "score2": número,
  "reflection": "tu reflexión"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const parsed = parseGeminiJSON(response.text || "{}");
      res.json(parsed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to validate diary" });
    }
  });

  app.post("/api/diary-deepen", requireAI, async (req, res) => {
    try {
      const { entry1, entry2, reflection } = req.body;
      if (!entry1 || !entry2 || !reflection) return res.status(400).json({ error: "Data missing" });

      const prompt = `Eres el mismo psicoterapeuta y coach de vida. Basándote en los motivos de gratitud del paciente y tu reflexión anterior, profundiza aún más en el análisis.
Motivos: 1. "${entry1}", 2. "${entry2}"
Reflexión anterior: "${reflection}"
Genera un análisis más profundo (2 o 3 párrafos) y proporciona una pequeña herramienta o anclaje relacionado. Mantén tu tono amigable y profesional.
Responde EXCLUSIVAMENTE con un objeto JSON:
{
  "deepReflection": "tu texto aquí"
}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const parsed = parseGeminiJSON(response.text || "{}");
      res.json(parsed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to deepen emotion diary" });
    }
  });

  app.post("/api/weekly-goal", requireAI, async (req, res) => {
    try {
      const { category, accumulatedSummary } = req.body;
      if (!category) return res.status(400).json({ error: "Category missing" });

      const prompt = `
      Eres un psicoterapeuta y coach de vida. Necesitas generar una meta semanal estimulante para el usuario basándote en la siguiente categoría: "${category}".
      Aquí tienes un resumen de contexto del usuario y sesiones previas (puede estar vacío): "${accumulatedSummary || ""}".
      
      Instrucciones:
      Si el resumen menciona problemas específicos (ej., dormir, estrés, ansiedad, sedentarismo), la meta debe sugerir algo para contrarrestarlos de forma empática y sutil. 
      Si la categoría es "Azar", elige libremente una de las otras categorías y sé creativo.
      Mantén el título muy breve, y la descripción como un consejo accionable de no más de 1-2 líneas largas.
      
      DEBES responder ÚNICAMENTE con un JSON con los campos: "title" y "description".
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const parsed = parseGeminiJSON(response.text || "{}");
      res.json(parsed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate weekly goal" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on all interfaces
  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
