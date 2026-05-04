import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json({ limit: "2mb" }));

let SERVER_FIRESTORE_DATABASE_ID = "(default)";
try {
  SERVER_FIRESTORE_DATABASE_ID = 
    process.env.FIRESTORE_DATABASE_ID || 
    process.env.firestoreDatabaseId || 
    "(default)";
  
  if (SERVER_FIRESTORE_DATABASE_ID === "(default)") {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (config.firestoreDatabaseId) {
        SERVER_FIRESTORE_DATABASE_ID = config.firestoreDatabaseId;
      }
    }
  }
} catch(e) {}


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
      console.log("SUCCESS: Firebase Admin initialized via env variables.");
    } else {
      let fallbackProjectId = projectId;
      try {
        const configPath = path.join(process.cwd(), "firebase-applet-config.json");
        if (fs.existsSync(configPath)) {
           const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
           fallbackProjectId = config.projectId;
        }
      } catch (e) {
        // ignore
      }
      
      if (fallbackProjectId) {
         admin.initializeApp({ projectId: fallbackProjectId });
         console.log("SUCCESS: Firebase Admin initialized via App Default Config with projectId:", fallbackProjectId);
      } else {
         admin.initializeApp();
         console.log("SUCCESS: Firebase Admin initialized via App Default Config (no explicit projectId).");
      }
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
      error: "En este momento estamos recibiendo muchas consultas y nuestros guías virtuales están algo saturados. Te agradecemos mucho la paciencia. Por favor, toma un respiro e inténtalo de nuevo en unos minutos."
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
      res.status(500).json({ error: "Error interno del servidor. Firebase no inicializado. Por favor añade FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en 'Secrets / Environment Variables' de tu panel." });
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
  const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);
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
  const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);
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
    env: process.env.NODE_ENV || "development",
    questionnaireApiConfigured: !!process.env.QUESTIONNAIRE_API_URL,
    questionnaireBridgeConfigured: !!process.env.QUESTIONNAIRE_BRIDGE_SECRET,
    serverFirestoreDatabaseId: SERVER_FIRESTORE_DATABASE_ID
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
        systemInstruction: "Eres un guía virtual empático, cálido y profesional enfocado en el bienestar. Reglas: 1) Actúas como un radar que escucha sin juzgar, filtrando casos iniciales. 2) Mantén respuestas breves y humanas, sin diagnosticar; solo ayuda a ordenar sus ideas. 3) La consulta dura como mucho 15 minutos en total; debes ser consciente de ir cerrando de manera orgánica si el usuario ya expresó su situación, NO intentes forzar la conversación agregando preguntas extrañas al final. 4) Cuando la sesión esté por terminar, explícale que el siguiente paso es rellenar el 'Cuestionario Espejo' (un cuestionario sobre experiencias vividas cotidianas para que los terapeutas entiendan mejor su posición). Ofrécete a solicitarle ese enlace directamente en esta charla (pregúntale si lo prefiere por email, SMS o WhatsApp; si es SMS/WhatsApp pídele el teléfono). Aclara que tras hacerlo, recibirá un dossier personal gratuito, y se liberarán recursos útiles en la plataforma (meditaciones, respiraciones). 5) Despídete de manera cálida y natural sin dejar preguntas abiertas si se ha cerrado el tema.",
        maxOutputTokens: 700,
        tools: [{
          functionDeclarations: [
            {
              name: "send_questionnaire",
              description: "Envía la solicitud del Cuestionario Espejo al usuario. Llama a esta función SOLO CUANDO el usuario haya expresado explícitamente su método de contacto preferido (email, sms o whatsapp) y haya proporcionado su número de teléfono si el método elegido es sms o whatsapp.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  contactMethod: {
                    type: Type.STRING,
                    description: "Método de contacto preferido: 'email', 'sms', o 'whatsapp'"
                  },
                  phoneNumber: {
                    type: Type.STRING,
                    description: "Número de teléfono, requerido si el método de contacto es 'sms' o 'whatsapp'."
                  }
                },
                required: ["contactMethod"]
              }
            }
          ]
        }]
      },
      history
    });

    const response = await chatWithHistory.sendMessage({ message });
    
    // Check if the AI decided to call the function
    let functionCallParams = null;
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === "send_questionnaire") {
        functionCallParams = call.args;
        // Optionally, send a follow-up to the AI so it can generate a text response
        const followUp = await chatWithHistory.sendMessage({
          message: [{ functionResponse: { name: "send_questionnaire", response: { success: true } } }]
        });
        return res.json({ text: followUp.text, action: "send_questionnaire", actionParams: functionCallParams });
      }
    }

    res.json({ text: response.text });
  } catch (error) {
    console.error("AI /api/session-reply failed: " + (error instanceof Error ? error.message + " " + error.stack : JSON.stringify(error)));
    res.status(503).json({ error: "En este momento estamos recibiendo muchas consultas y nuestro sistema está algo saturado. Te agradecemos mucho la paciencia. Por favor, toma un respiro e intenta enviar tu mensaje nuevamente." });
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
      res.status(429).json({ error: "Parece que has llegado al límite de evaluaciones por este mes. Por favor, realiza el cuestionario espejo para seguir avanzando, o contacta con nuestro equipo." });
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
      
      Necesito que generes:
      1. Un resumen clínico ("clinicalSummary") que se guardará internamente para el terapeuta (análisis objetivo, 3ª persona).
      2. Un mensaje empático dirigido al usuario ("userEmpatheticMessage" escrito en 2ª persona, como un amigo) que:
        - Resuma la conversación validando lo que el usuario ha expresado.
        - Le comunique que NO es ningún diagnóstico ni el dossier definitivo, sino un resumen de esta primera etapa (la consulta).
        - Le informe que esto se trasladará al terapeuta.
        - Le recuerde que el segundo paso es realizar el "Cuestionario Espejo". Tras hacerlo, recibirá su Dossier Personal con la conclusión del terapeuta de forma gratuita y sin presiones, y tendrá acceso liberado a recursos como meditaciones o el diario de gratitud.
      
      Genera un resumen compacto que integre la nueva información con el historial pasado.
      
      Historial pasado:
      ${accumulatedSummary || "No hay historial."}

      Transcripción Actual:
      ${conversationText}

      EL RESULTADO DEBE SER EXCLUSIVAMENTE UN OBJETO JSON con esta estructura exacta (sin bloques markdown JSON):
      {
        "validConclusion": boolean,
        "clinicalSummary": "Resumen interno para el terapeuta",
        "userEmpatheticMessage": "Mensaje empático y directo al usuario descrito arriba",
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
      const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);
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
    res.status(503).json({ error: "En este momento estamos procesando muchas consultas y nuestro sistema está algo saturado. Te agradecemos la paciencia. Por favor, intenta de nuevo en unos momentos." });
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

// TEMP DEBUG ENDPOINT: remove after bridge validation
app.get("/api/debug-questionnaire-bridge", requireAuth, async (req, res) => {
  try {
    if (req.user?.email !== "davidcaparrosgarcia@gmail.com") {
      return res.status(403).json({ success: false, error: "No autorizado" });
    }

    const apiUrl = process.env.QUESTIONNAIRE_API_URL;
    const bridgeSecret = process.env.QUESTIONNAIRE_BRIDGE_SECRET;

    const questionnaireApiConfigured = !!apiUrl;
    const questionnaireBridgeConfigured = !!bridgeSecret;

    if (!apiUrl || !bridgeSecret) {
      return res.json({
        success: false,
        step: "config",
        questionnaireApiConfigured,
        questionnaireBridgeConfigured
      });
    }

    const normalizedApiUrl = apiUrl.replace(/\/$/, "");
    let normalizedApiUrlHost = "unknown";
    try {
      normalizedApiUrlHost = new URL(normalizedApiUrl).host;
    } catch (e) {}

    let healthStatus = 0;
    let healthOk = false;
    let healthText = "";
    try {
      const healthResponse = await fetch(`${normalizedApiUrl}/api/health?checkFirestore=1`);
      healthStatus = healthResponse.status;
      healthOk = healthResponse.ok;
      healthText = (await healthResponse.text()).substring(0, 500);
    } catch (e) {
      return res.json({
        success: false,
        step: "health",
        questionnaireApiConfigured,
        questionnaireBridgeConfigured,
        normalizedApiUrlHost,
        error: e instanceof Error ? e.message : "Unknown health fetch error"
      });
    }

    let postStatus = 0;
    let postOk = false;
    let postText = "";
    try {
      const payload = {
        id: "debug_" + Date.now(),
        source: "soybienestar_debug",
        sourcePath: "/api/debug-questionnaire-bridge",
        soybienestarUid: req.user!.uid,
        displayName: "Debug SoyBienestar",
        nombre: "Debug SoyBienestar",
        email: req.user!.email || "debug@soybienestar.es",
        telefono: null,
        preferredChannels: {
          email: true,
          whatsapp: false,
          sms: false
        },
        hasDoneConsultation: true,
        status: "pending",
        createdAt: Date.now(),
        createdAtIso: new Date().toISOString(),
        processedAt: null,
        linkedPatientId: null,
        notes: "Solicitud temporal de diagnóstico del puente SoyBienestar-Cuestionario",
        soybienestarContext: {
          contextSchemaVersion: 1,
          debug: true,
          generatedAt: new Date().toISOString()
        }
      };

      const postResponse = await fetch(`${normalizedApiUrl}/api/patient-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bridge-secret": bridgeSecret,
          "x-debug-bridge": "true"
        },
        body: JSON.stringify(payload)
      });

      postStatus = postResponse.status;
      postOk = postResponse.ok;
      postText = (await postResponse.text()).substring(0, 500);
    } catch (e) {
      return res.json({
        success: false,
        step: "post",
        questionnaireApiConfigured,
        questionnaireBridgeConfigured,
        normalizedApiUrlHost,
        health: { status: healthStatus, ok: healthOk, bodyPreview: healthText },
        error: e instanceof Error ? e.message : "Unknown post fetch error"
      });
    }

    return res.json({
      success: healthOk && postOk,
      step: "done",
      questionnaireApiConfigured,
      questionnaireBridgeConfigured,
      normalizedApiUrlHost,
      health: {
        status: healthStatus,
        ok: healthOk,
        bodyPreview: healthText
      },
      post: {
        status: postStatus,
        ok: postOk,
        bodyPreview: postText
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error during debug block" });
  }
});

app.post("/api/request-questionnaire", requireAuth, async (req, res) => {
  let requestStep = "start";
  try {
    const { email, telefono, preferredChannels } = req.body;
    const uid = req.user!.uid;
    const authEmail = req.user!.email;

    requestStep = "validate_input";
    if (!email) {
      return res.status(400).json({ success: false, message: "El email es obligatorio." });
    }
    if (!preferredChannels || (!preferredChannels.email && !preferredChannels.whatsapp && !preferredChannels.sms)) {
      return res.status(400).json({ success: false, message: "Debes seleccionar al menos un canal de contacto." });
    }
    if ((preferredChannels.whatsapp || preferredChannels.sms) && (!telefono || telefono === "+34" || telefono.trim().length < 5)) {
      return res.status(400).json({ success: false, message: "Para recibir el enlace por WhatsApp o SMS necesitamos que indiques tu número de teléfono." });
    }

    requestStep = "init_firestore";
    if (!admin.apps.length) return res.status(500).json({ success: false, message: "Error interno del servidor. Firebase no inicializado. Por favor configura las claves en Secrets de la app." });
    const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);

    requestStep = "read_user_docs";
    const docRef = db.collection('users').doc(uid);
    const profileRef = db.collection('userProfiles').doc(uid);

    const [userDoc, profileDoc] = await Promise.all([docRef.get(), profileRef.get()]);

    const userData = userDoc.data() || {};
    const profileData = profileDoc.data() || {};

    const contactSnapshot = {
      email,
      telefono: telefono || null,
      preferredChannels
    };

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let isResendingDueToContactChange = false;

    requestStep = "rate_limit_check";
    if (!isTestUser(req)) {
      if (userData.lastQuestionnaireRequestAt && (now - userData.lastQuestionnaireRequestAt) < thirtyDaysMs) {
        const lastContact = userData.lastQuestionnaireContactSnapshot || {};
        const contactChanged = 
          lastContact.email !== contactSnapshot.email ||
          lastContact.telefono !== contactSnapshot.telefono ||
          JSON.stringify(lastContact.preferredChannels) !== JSON.stringify(contactSnapshot.preferredChannels);
        
        if (!contactChanged) {
          const nextAvailableAt = new Date(userData.lastQuestionnaireRequestAt + thirtyDaysMs).toISOString();
          return res.status(429).json({
            success: false,
            status: "already_requested_recently",
            message: "Tu petición ya se ha procesado correctamente. Si no has recibido el enlace, revisa tus datos de contacto. Podrás volver a solicitarlo cuando pasen 30 días desde tu última petición. Si necesitas ayuda, puedes contactarnos desde la sección de contacto.",
            nextAvailableAt
          });
        } else {
          isResendingDueToContactChange = true;
        }
      }
    }

    requestStep = "build_context";
    const soybienestarContext: any = {
      contextSchemaVersion: 1,
      generatedAt: new Date().toISOString()
    };

    const copyIfPresent = (source: any, key: string) => {
      if (source && source[key] !== undefined && source[key] !== null) {
        if (typeof source[key] === 'string' && source[key].length > 3000) {
          soybienestarContext[key] = source[key].substring(0, 3000) + '...';
        } else {
          soybienestarContext[key] = source[key];
        }
      }
    };

    copyIfPresent(userData, 'hasDoneConsultation');
    copyIfPresent(userData, 'processStage');
    copyIfPresent(profileData, 'globalUserSummary');
    copyIfPresent(profileData, 'accumulatedSummary');
    copyIfPresent(profileData, 'latestClinicalConclusion');
    copyIfPresent(profileData, 'consultationSummary');
    copyIfPresent(profileData, 'consultationConclusion');
    copyIfPresent(profileData, 'diaryProfile');
    copyIfPresent(profileData, 'weeklyGoalsSummary');
    copyIfPresent(profileData, 'gratitudeDiarySummary');
    copyIfPresent(profileData, 'mainThemes');
    copyIfPresent(profileData, 'emotionalSignals');

    const requestsRef = db.collection('users').doc(uid).collection('questionnaireRequests');
    const requestId = requestsRef.doc().id;
    
    // Create numeric timestamp and ISO string
    const createdAt = Date.now();
    const createdAtIso = new Date(createdAt).toISOString(); 

    requestStep = "build_payload";
    const payload = {
      id: requestId,
      source: "soybienestar",
      sourcePath: "/zen",
      soybienestarUid: uid,
      nombre: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      displayName: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      email,
      telefono,
      preferredChannels,
      hasDoneConsultation: userData.hasDoneConsultation || false,
      status: "pending",
      createdAt,
      createdAtIso,
      processedAt: null,
      linkedPatientId: null,
      notes: "Solicitud del Cuestionario Espejo desde SoyBienestar",
      soybienestarContext
    };

    requestStep = "check_bridge_config";
    const apiUrl = process.env.QUESTIONNAIRE_API_URL;
    const bridgeSecret = process.env.QUESTIONNAIRE_BRIDGE_SECRET;

    if (!apiUrl) {
      console.error("QUESTIONNAIRE_API_URL missing");
    }
    if (!bridgeSecret) {
      console.error("QUESTIONNAIRE_BRIDGE_SECRET missing");
    }

    if (!apiUrl || !bridgeSecret) {
      return res.status(502).json({
        success: false,
        message: "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros."
      });
    }

    const normalizedApiUrl = apiUrl.replace(/\/$/, "");

    requestStep = "send_to_questionnaire";
    const response = await fetch(`${normalizedApiUrl}/api/patient-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bridge-secret": bridgeSecret
      },
      body: JSON.stringify(payload)
    });

    requestStep = "parse_questionnaire_response";
    let apiResponseData = {};
    const responseText = await response.text();
    try {
      apiResponseData = JSON.parse(responseText);
    } catch(e) {}

    if (!response.ok) {
      console.error("Error from Cuestionario API", {
        step: requestStep,
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 500)
      });
      return res.status(502).json({
        success: false,
        message: "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros."
      });
    }

    requestStep = "save_local_request";
    const timestamp = Date.now();
    await requestsRef.doc(requestId).set({
      id: requestId,
      status: "pending",
      createdAt: timestamp,
      resentBecauseContactChanged: isResendingDueToContactChange,
      email,
      telefono,
      preferredChannels,
      questionnaireApiStatus: response.status,
      questionnaireApiResponse: apiResponseData,
      source: "soybienestar",
      sourcePath: "/zen",
      soybienestarContext,
      contactSnapshot
    });

    requestStep = "update_user_request_metadata";
    await docRef.update({
      questionnaireRequestStatus: "pending",
      lastQuestionnaireRequestAt: timestamp,
      lastQuestionnaireRequestId: requestId,
      lastQuestionnaireContactSnapshot: contactSnapshot
    });

    requestStep = "done";
    if (isResendingDueToContactChange) {
      return res.json({
        success: true,
        status: "resent_contact_changed",
        message: "Detectamos que has actualizado tus datos de contacto, así que hemos registrado de nuevo tu solicitud.",
        requestId
      });
    } else {
      return res.json({
        success: true,
        status: "sent",
        message: "Solicitud recibida. Nuestro equipo revisará tus datos y te enviará el enlace del Cuestionario Espejo por la vía seleccionada.",
        requestId
      });
    }

  } catch (error) {
    console.error("API /api/request-questionnaire error:", {
      step: requestStep,
      uid: req.user?.uid,
      code: (error as any)?.code,
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    const xDebug = req.headers['x-debug-request-questionnaire'] === 'true';

    return res.status(500).json({
      success: false,
      message: "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros.",
      ...(xDebug ? {
        debug: {
          step: requestStep,
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code
        }
      } : {})
    });
  }
});

export default app;
