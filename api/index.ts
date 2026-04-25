import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";

const app = express();
app.use(express.json({ limit: "2mb" }));

// Extensión del Request para Typescript
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

// Initialize Firebase Admin gracefully
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log("SUCCESS: Firebase Admin initialized.");
    } else {
      console.warn("WARNING: Firebase Admin credentials not set. Auth middleware will fail.");
    }
  } catch (error) {
    console.error("ERROR: Failed to initialize Firebase Admin:", error);
  }
}

// Initialize Gemini
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("CRITICAL: GEMINI_API_KEY is not defined in environment variables. AI features will be disabled.");
} else {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log("SUCCESS: GoogleGenAI initialized correctly.");
  } catch (e) {
    console.error("ERROR: Failed to initialize GoogleGenAI:", e);
  }
}

function parseGeminiJSON(text: string) {
  if (!text) return {};
  let jsonStr = text.replace(/```json\n?|```/g, "").trim();
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerE) {
        console.error("Failed to parse extracted JSON:", innerE);
      }
    }
    throw new Error("Invalid JSON structure returned from AI");
  }
}

const requireAI = (req: Request, res: Response, next: NextFunction) => {
  if (!ai) {
    return res.status(503).json({ 
      error: "Servicio de IA temporalmente no disponible",
      message: "El servidor no tiene configurada una clave de API válida para Gemini." 
    });
  }
  next();
};

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No autorizado. Token requerido." });
      return;
    }
    
    if (!admin.apps.length) {
      res.status(500).json({ error: "Error interno del servidor. Firebase no inicializado." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error validando token en el API:", error);
    res.status(401).json({ error: "Token inválido o expirado." });
    return;
  }
};

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    aiAvailable: !!ai,
    authAvailable: !!admin.apps.length,
    env: process.env.NODE_ENV || "development"
  });
});

app.post("/api/session-reply", requireAuth, requireAI, async (req, res) => {
  try {
    const { history, message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: "Invalid message" });
      return;
    }

    if (!ai) return;

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

app.post("/api/report", requireAuth, requireAI, async (req, res) => {
  try {
    const { messages, accumulatedSummary } = req.body;
    if (!Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array" });
      return;
    }

    if (!ai) return;

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

app.post("/api/diary-validate", requireAuth, requireAI, async (req, res) => {
  try {
    const { entry1, entry2, accumulatedSummary } = req.body;
    if (!entry1 || !entry2) {
      res.status(400).json({ error: "Entries missing" });
      return;
    }

    if (!ai) return;

    const prompt = `Eres un psicoterapeuta y coach de vida experto. Analiza las siguientes dos razones de gratitud de un paciente (que puede padecer depresión, estrés o ansiedad).
Instrucciones:
1. Puntúa cada motivo con 0, 1 o 2 ('destellos'). 0 = vacío/esquivo/sin esfuerzo real, 1 = superficial, 2 = profundo o significativo. (Max 2 para cada uno).
2. Escribe una pequeña reflexión terapéutica (1 o 2 párrafos). Relaciónate con los hechos relatados por el usuario. Sé profesional, amigable y didáctico. Evita la positividad tóxica; ofrece una valoración realista con un leve decantamiento hacia la motivación para que no se desanime.
3. Fusiona la nueva conclusión con el resumen global previo del usuario. No repitas hallazgos ya presentes salvo para reforzarlos o matizarlos. Devuelve un único resumen acumulado, compacto, útil para personalizar futuras propuestas y sin redundancias.

Resumen global previo del usuario: "${accumulatedSummary || 'Ninguno'}"
Motivo 1: "${entry1}"
Motivo 2: "${entry2}"

Responde EXCLUSIVAMENTE con un objeto JSON (sin comillas invertidas extra):
{
  "score1": número,
  "score2": número,
  "reflection": "tu reflexión",
  "newAccumulatedSummary": "resumen global fusionado"
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

app.post("/api/diary-deepen", requireAuth, requireAI, async (req, res) => {
  try {
    const { entry1, entry2, reflection, accumulatedSummary } = req.body;
    if (!entry1 || !entry2 || !reflection) {
      res.status(400).json({ error: "Data missing" });
      return;
    }

    if (!ai) return;

    const prompt = `Eres el mismo psicoterapeuta y coach de vida. Basándote en los motivos de gratitud del paciente y tu reflexión anterior, profundiza aún más en el análisis.
Motivos: 1. "${entry1}", 2. "${entry2}"
Reflexión anterior: "${reflection}"

Genera un análisis más profundo (2 o 3 párrafos) y proporciona una pequeña herramienta o anclaje relacionado. Mantén tu tono amigable y profesional.
Considera el Resumen global previo del usuario: "${accumulatedSummary || 'Ninguno'}". 
Fusiona la nueva conclusión con el resumen global previo del usuario. No repitas hallazgos ya presentes salvo para reforzarlos o matizarlos. Devuelve un único resumen acumulado, compacto, útil para personalizar futuras propuestas y sin redundancias.

Responde EXCLUSIVAMENTE con un objeto JSON:
{
  "deepReflection": "tu texto aquí",
  "newAccumulatedSummary": "resumen global fusionado"
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

app.post("/api/weekly-goal", requireAuth, requireAI, async (req, res) => {
  try {
    const { category, accumulatedSummary } = req.body;
    if (!category) {
      res.status(400).json({ error: "Category missing" });
      return;
    }

    if (!ai) return;

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

export default app;
