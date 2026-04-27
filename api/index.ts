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
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.projectId;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.client_email;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || process.env.private_key)?.replace(/\\n/g, "\n");

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
const AI_MODEL = process.env.AI_MODEL || "gemini-2.5-flash-lite";

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
    console.error("Error validando token en el API", error instanceof Error ? error.message : "Desconocido");
    res.status(401).json({ error: "Token inválido o expirado." });
    return;
  }
};

const TEST_USER_EMAIL = "davidcaparrosgarcia@gmail.com";

function isTestUser(req: any) {
  return req.user?.email === TEST_USER_EMAIL;
}

async function checkAILimit(req: any, uid: string, limitKey: string, period: 'daily' | 'weekly' | 'monthly', maxLimit: number): Promise<boolean> {
  if (isTestUser(req)) return true;
  if (!admin.apps.length) return true;
  const db = admin.firestore();
  const now = new Date();
  let periodStr = "";
  if (period === 'daily') periodStr = now.toISOString().split("T")[0];
  if (period === 'monthly') periodStr = now.toISOString().slice(0, 7);
  if (period === 'weekly') {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const pastDays = (now.getTime() - firstDay.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    periodStr = `${now.getFullYear()}-W${weekNum}`;
  }

  const docId = `${limitKey}_${periodStr}`;
  const limitRef = db.collection('users').doc(uid).collection('aiLimits').doc(docId);

  try {
    return await db.runTransaction(async (t) => {
      const doc = await t.get(limitRef);
      let data = doc.data() || { count: 0 };
      if (data.count >= maxLimit) return false;
      data.count += 1;
      t.set(limitRef, data, { merge: true });
      return true;
    });
  } catch (e) {
    console.error("Limit check transaction failed", e);
    return true; 
  }
}

async function checkGratitudeLimits(req: any, uid: string, entry1: string, entry2: string): Promise<boolean> {
  if (isTestUser(req)) return true;
  if (!admin.apps.length) return true;
  const db = admin.firestore();
  const dateStr = new Date().toISOString().split("T")[0];
  const limitRef = db.collection('users').doc(uid).collection('aiLimits').doc(`gratitude_${dateStr}`);
  
  try {
    return await db.runTransaction(async (t) => {
      const doc = await t.get(limitRef);
      let data = doc.data() || { count: 0, validatedTexts: [] };
      
      let increment1 = !!entry1 && !data.validatedTexts.includes(entry1);
      let increment2 = !!entry2 && !data.validatedTexts.includes(entry2);
      let newCount = (increment1 ? 1 : 0) + (increment2 ? 1 : 0);
      
      if (newCount === 0 && (entry1 || entry2)) return false; 
      if (data.count + newCount > 2) return false;
      
      if (increment1) data.validatedTexts.push(entry1);
      if (increment2) data.validatedTexts.push(entry2);
      data.count += newCount;
      
      t.set(limitRef, data, { merge: true });
      return true;
    });
  } catch (e) {
    console.error("Gratitude limit transaction failed", e);
    return true; 
  }
}

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    aiAvailable: !!ai,
    authAvailable: !!admin.apps.length,
    model: AI_MODEL,
    env: process.env.NODE_ENV || "development"
  });
});

app.post("/api/session-reply", requireAuth, requireAI, async (req, res) => {
  try {
    let { history, message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: "Mensaje inválido." });
      return;
    }
    const isTest = isTestUser(req);
    const maxChars = isTest ? 8000 : 4000;
    const maxHistory = isTest ? 200 : 50;

    if (message.length > maxChars) {
      res.status(400).json({ error: `El mensaje no puede superar los ${maxChars} caracteres.` });
      return;
    }

    if (history && !Array.isArray(history)) history = [];
    if (history.length > maxHistory) history = history.slice(-maxHistory);
    
    // Clean history
    history = history.filter((h: any) => h && h.role && Array.isArray(h.parts) && h.parts.length > 0 && h.parts[0].text).map((h: any) => ({
      role: h.role,
      parts: [{ text: h.parts[0].text.substring(0, maxChars) }]
    }));

    if (!ai) return;

    const chatWithHistory = ai.chats.create({
      model: AI_MODEL,
      config: {
        systemInstruction: "Eres un guía virtual empático, cálido y profesional, un puente preliminar entre la persona y un equipo humano. Escucha a la persona, haz preguntas suaves, concisas y guiadas para entender su situación expresada (ansiedad, abrumamiento, etc.). Mantén respuestas breves, conversacionales y humanas. No diagnostiques, solo ayuda a organizar sus ideas y brindar apoyo emocional.",
        maxOutputTokens: 700,
      },
      history
    });

    const response = await chatWithHistory.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error) {
    console.error("AI /api/session-reply failed", { uid: req.user?.uid, message: error instanceof Error ? error.message : "Desconocido" });
    res.status(500).json({ error: "Failed to generate session reply" });
  }
});

app.post("/api/report", requireAuth, requireAI, async (req, res) => {
  try {
    let { messages, accumulatedSummary } = req.body;
    if (!Array.isArray(messages)) {
      res.status(400).json({ error: "Mensajes inválidos." });
      return;
    }

    // Limit check
    const allowed = await checkAILimit(req, req.user!.uid, 'reportAttempts', 'monthly', 10);
    if (!allowed) {
      res.status(429).json({ error: "Has superado el límite mensual de evaluaciones de consulta." });
      return;
    }

    if (messages.length > 50) messages = messages.slice(-50);
    messages = messages.filter((m: any) => m && m.content);
    
    accumulatedSummary = typeof accumulatedSummary === 'string' ? accumulatedSummary.substring(0, 5000) : "";

    if (!ai) return;

    const conversationText = messages
      .map((msg: any) => `${msg.role === "user" ? "Persona" : "IA"}: ${msg.content.substring(0, 4000)}`)
      .join("\n\n");

    const prompt = `
      A continuación se presenta la transcripción de una consulta guiada preliminar entre una persona y un asistente inicial.
      Como coach de bienestar empático, evalúa si la sesión aporta información relevante sobre la situación expresada (vacías o mero ruido no valen).
      Genera un resumen de orientación detallado en Markdown clásico.
      Genera un resumen compacto que integre la nueva información con el historial pasado.
      
      Historial pasado:
      ${accumulatedSummary || "No hay historial."}

      Transcripción Actual:
      ${conversationText}

      EL RESULTADO DEBE SER EXCLUSIVAMENTE UN OBJETO JSON con esta estructura exacta (sin bloques markdown JSON):
      {
        "validConclusion": boolean,
        "markdownReport": "El informe completo",
        "newAccumulatedSummary": "Resumen integrado",
        "needsUrgentSupport": boolean,
        "urgentSupportMessage": "mensaje muy delicado, empático y orientado a buscar ayuda inmediata si needsUrgentSupport es true, si es false dejar vacío"
      }
    `;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 1200 }
    });

    const parsed = parseGeminiJSON(response.text || "{}");
    
    // If valid conclusion, apply monthly valid limit
    if (parsed.validConclusion && !isTestUser(req)) {
      const db = admin.firestore();
      const monthStr = new Date().toISOString().slice(0, 7);
      const docRef = db.collection('users').doc(req.user!.uid).collection('aiLimits').doc(`validConclusion_${monthStr}`);
      const doc = await docRef.get();
      if ((doc.data()?.count || 0) >= 1) {
         return res.status(429).json({ error: "Solo se permite una conclusión válida por mes." });
      }
      await docRef.set({ count: (doc.data()?.count || 0) + 1 }, { merge: true });
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI /api/report failed", { uid: req.user?.uid, message: error instanceof Error ? error.message : "Desconocido" });
    res.status(500).json({ error: "Failed to generate report" });
  }
});

app.post("/api/diary-validate", requireAuth, requireAI, async (req, res) => {
  try {
    let { entry1, entry2, accumulatedSummary } = req.body;
    
    entry1 = typeof entry1 === 'string' ? entry1.substring(0, 1200) : "";
    entry2 = typeof entry2 === 'string' ? entry2.substring(0, 1200) : "";
    accumulatedSummary = typeof accumulatedSummary === 'string' ? accumulatedSummary.substring(0, 5000) : "";

    if (!entry1 && !entry2) {
      res.status(400).json({ error: "Faltan entradas." });
      return;
    }

    const allowed = await checkGratitudeLimits(req, req.user!.uid, entry1, entry2);
    if (!allowed) {
      res.status(429).json({ error: "Límite de agradecimientos diarios alcanzado o ya validados." });
      return;
    }

    if (!ai) return;

    const prompt = `Eres un coach de vida amigable y experto. Analiza el/los motivos de gratitud de una persona.
Instrucciones:
1. Puntúa CADA motivo proporcionado con 0, 1 o 2. 0=vacío/esquivo, 1=superficial, 2=profundo. (Max 2 para cada uno). Si solo hay uno, ignora el otro.
2. Escribe una pequeña y cálida reflexión (1 o 2 párrafos). Sé breve y cercano.
3. Fusiona hallazgos con el resumen previo.
Resumen previo: "${accumulatedSummary || 'Ninguno'}"
${entry1 ? `Motivo 1: "${entry1}"` : ""}
${entry2 ? `Motivo 2: "${entry2}"` : ""}

Responde EXCLUSIVAMENTE con un JSON:
{
  ${entry1 ? `"score1": numero,` : ""}
  ${entry2 ? `"score2": numero,` : ""}
  "reflection": "tu reflexión reconfortante",
  "newAccumulatedSummary": "resumen global"
}`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 700 }
    });

    const parsed = parseGeminiJSON(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("AI /api/diary-validate failed", { uid: req.user?.uid, message: error instanceof Error ? error.message : "Desconocido" });
    res.status(500).json({ error: "Failed to validate diary" });
  }
});

app.post("/api/diary-deepen", requireAuth, requireAI, async (req, res) => {
  try {
    let { entry1, entry2, reflection, accumulatedSummary } = req.body;
    
    entry1 = typeof entry1 === 'string' ? entry1.substring(0, 1200) : "";
    entry2 = typeof entry2 === 'string' ? entry2.substring(0, 1200) : "";
    reflection = typeof reflection === 'string' ? reflection.substring(0, 3000) : "";
    accumulatedSummary = typeof accumulatedSummary === 'string' ? accumulatedSummary.substring(0, 5000) : "";

    if (!entry1 || !entry2 || !reflection) {
      res.status(400).json({ error: "Faltan datos." });
      return;
    }

    if (!ai) return;

    const prompt = `Eres un coach de vida amigable y empático. Basándote en los motivos de gratitud y tu reflexión, profundiza brevemente.
Motivos: 1. "${entry1}", 2. "${entry2}"
Reflexión anterior: "${reflection}"

Profundiza (1 o 2 párrafos) y da un pequeño anclaje. Mantén el tono humano.
Resumen global previo: "${accumulatedSummary || 'Ninguno'}". 
Fusiona hallazgos sin repeticiones.

Responde EXCLUSIVAMENTE con un JSON:
{
  "deepReflection": "tu texto aquí",
  "newAccumulatedSummary": "resumen global fusionado"
}`;
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 700 }
    });

    const parsed = parseGeminiJSON(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("AI /api/diary-deepen failed", { uid: req.user?.uid, message: error instanceof Error ? error.message : "Desconocido" });
    res.status(500).json({ error: "Failed to deepen emotion diary" });
  }
});

app.post("/api/weekly-goal", requireAuth, requireAI, async (req, res) => {
  try {
    let { category, accumulatedSummary } = req.body;
    
    category = typeof category === 'string' ? category.substring(0, 100) : "";
    accumulatedSummary = typeof accumulatedSummary === 'string' ? accumulatedSummary.substring(0, 5000) : "";

    if (!category) {
      res.status(400).json({ error: "Categoría faltante." });
      return;
    }

    const allowed = await checkAILimit(req, req.user!.uid, 'weeklyGoalGeneration', 'weekly', 25);
    if (!allowed) {
      res.status(429).json({ error: "Has alcanzado el límite semanal de generaciones IA de propósitos." });
      return;
    }

    if (!ai) return;

    const prompt = `
    Eres un empático coach de vida. Genera una breve meta semanal estimulante para esta categoría: "${category}".
    Resumen de contexto del usuario: "${accumulatedSummary || ""}".
    
    Instrucciones:
    Si hay problemas específicos (ej., dormir, estrés), la meta debe contrarrestarlos sutilmente.
    Mantén el título breve, y la descripción como un consejo accionable de 1-2 líneas. Sé cercano.
    
    DEBES responder ÚNICAMENTE con JSON: {"title": "breve", "description": "1 consejo"}
    `;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 300 }
    });

    const parsed = parseGeminiJSON(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("AI /api/weekly-goal failed", { uid: req.user?.uid, message: error instanceof Error ? error.message : "Desconocido" });
    res.status(500).json({ error: "Failed to generate weekly goal" });
  }
});

export default app;
