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
    riskAlertEmailsConfigured: !!process.env.RISK_ALERT_EMAILS || !!process.env.NOTIFICATION_EMAILS,
    model: AI_MODEL,
    env: process.env.NODE_ENV || "development",
    questionnaireApiConfigured: !!process.env.QUESTIONNAIRE_API_URL,
    questionnaireBridgeConfigured: !!process.env.QUESTIONNAIRE_BRIDGE_SECRET,
    serverFirestoreDatabaseId: SERVER_FIRESTORE_DATABASE_ID
  });
});

app.post("/api/session-reply", requireAuth, requireAI, async (req, res) => {
  try {
    let { history, message, sessionContext } = req.body;

    const safeSessionContext = {
      time: sessionContext?.time || null,
      user: {
        email: sessionContext?.user?.email || req.user?.email || "",
        displayName: sessionContext?.user?.displayName || "",
        hasDoneConsultation: !!sessionContext?.user?.hasDoneConsultation,
        personalData: {
          nombre: sessionContext?.user?.personalData?.nombre || "",
          edad: sessionContext?.user?.personalData?.edad || "",
          sexo: sessionContext?.user?.personalData?.sexo || "",
          telefonoAvailable: !!sessionContext?.user?.personalData?.telefono
        },
        questionnaire: sessionContext?.user?.questionnaire || {},
        resources: sessionContext?.user?.resources || {}
      }
    };

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
        systemInstruction: "Eres un guía virtual empático, cálido y profesional enfocado en el bienestar. Actúas como un primer acompañante de escucha, no como terapeuta definitivo. Tu misión es ayudar a la persona a ordenar lo que siente para que después un equipo humano pueda entender mejor su situación.\\n\\nReglas de comportamiento:\\n1) Escucha sin juzgar. Responde con calidez, sencillez y humanidad.\\n2) No diagnostiques, no etiquetes clínicamente y no afirmes certezas médicas. Puedes reflejar patrones emocionales de forma prudente.\\n3) Mantén respuestas breves, pero no cortes la conversación antes de tiempo.\\n4) Durante los primeros intercambios, prioriza comprender: qué le ocurre, desde cuándo, qué impacto tiene en su día a día y qué necesita.\\n5) No des por terminada la sesión tras una sola respuesta del usuario salvo que el usuario diga explícitamente que quiere finalizar.\\n6) Solo empieza a cerrar de manera orgánica cuando haya suficiente contexto o cuando el usuario indique que ya ha terminado de explicar su situación.\\n7) Si el usuario escribe algo muy corto o inicial, haz una pregunta amable de profundización, no cierres.\\n8) Cuando la conversación esté realmente madura para cerrar, resume con cuidado lo que has entendido y explica que el siguiente paso es rellenar el Cuestionario Espejo.\\n9) El Cuestionario Espejo es un cuestionario sobre experiencias vividas cotidianas para que los terapeutas entiendan mejor la posición de la persona.\\n10) Solo ofrece solicitar el enlace del Cuestionario Espejo cuando la sesión esté cerca del cierre o el usuario lo pida.\\n11) Si el usuario quiere solicitar el enlace, pregúntale si lo prefiere por email, SMS o WhatsApp; si es SMS o WhatsApp, pídele el teléfono.\\n12) Aclara que tras hacerlo recibirá un dossier personal gratuito y se liberarán recursos útiles en la plataforma, como meditaciones, respiraciones o diario de gratitud.\\n13) Despídete de manera cálida solo cuando el tema esté realmente cerrado o el usuario haya pedido finalizar.",
        maxOutputTokens: 700,
        tools: [{
          functionDeclarations: [
            {
              name: "update_user_profile_data",
              description: "Guarda o actualiza datos básicos del usuario cuando los aporte o confirme.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING, description: "Nombre real del usuario." },
                  edad: { type: Type.STRING, description: "Edad del usuario." },
                  sexo: { type: Type.STRING, description: "Sexo del usuario ('hombre', 'mujer', o 'prefiero_no_definirme')." },
                  telefono: { type: Type.STRING, description: "Teléfono de contacto." },
                  consentConfirmed: { type: Type.BOOLEAN, description: "True si el usuario ha consentido explícitamente dar esta información." }
                },
                required: ["consentConfirmed"]
              }
            },
            {
              name: "send_questionnaire",
              description: "Envía la solicitud del Cuestionario Espejo al usuario. Llama a esta función SOLO cuando acepte recibirlo.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  email: { type: Type.BOOLEAN, description: "Solicitado por email" },
                  whatsapp: { type: Type.BOOLEAN, description: "Solicitado por WhatsApp" },
                  sms: { type: Type.BOOLEAN, description: "Solicitado por SMS" },
                  telefono: { type: Type.STRING, description: "Teléfono, requerido si se usa SMS/WhatsApp." },
                  edad: { type: Type.STRING, description: "Edad del usuario, opcional." },
                  sexo: { type: Type.STRING, description: "Sexo del usuario, opcional." },
                  nombre: { type: Type.STRING, description: "Nombre real del usuario, opcional." },
                  consentConfirmed: { type: Type.BOOLEAN, description: "True si el usuario confirmó el envío y proporcionó datos requeridos." }
                },
                required: ["consentConfirmed"]
              }
            },
            {
              name: "send_internal_risk_alert",
              description: "Envía una alerta interna a los terapeutas sobre una situación de riesgo suicida, autolesivo o de peligro inmediato.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  riskLevel: { type: Type.STRING, description: "Nivel de riesgo ('medio', 'alto', 'inminente')." },
                  reason: { type: Type.STRING, description: "Motivo resumido de la alerta (ej. 'Ideación suicida activa')." },
                  nombre: { type: Type.STRING, description: "Nombre del usuario si se conoce." },
                  email: { type: Type.STRING, description: "Email del usuario si se conoce." },
                  telefono: { type: Type.STRING, description: "Teléfono si se conoce." }
                },
                required: ["riskLevel", "reason"]
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
      Como profesional experto, evalúa si la sesión aporta información relevante.
      
      Necesito que generes:
      1. Un informe visible para el usuario ("visibleOrientationReport"). Emplea un tono empático, elegante, humano y comprensivo. NO debe parecer clínico, ni diagnóstico, ni comercial.
      2. Un informe interno para los terapeutas ("internalTherapistReport"). Objetivo, resumido, sin inventar datos.
      
      Además de estos dos, mantén un mensaje corto compasivo en "userEmpatheticMessage", y los demás valores legacy.

      REGLA CRÍTICA PARA EL INFORME VISIBLE:
      NUNCA uses palabras como "prediagnóstico", "diagnóstico", "evaluación clínica", "trastorno", o "necesitas terapia".
      Si el usuario no ha expresado elementos de riesgo o clínicos graves, mantenlo suave.

      Historial pasado:
      ${accumulatedSummary || "No hay historial."}

      Transcripción Actual:
      ${conversationText}

      EL RESULTADO DEBE SER EXCLUSIVAMENTE UN OBJETO JSON con esta estructura exacta (sin bloques markdown JSON):
      {
        "validConclusion": boolean,
        "userEmpatheticMessage": "Mensaje corto amable de fallback",
        "clinicalSummary": "Resumen básico fallback",
        "newAccumulatedSummary": "Resumen analítico integrado",
        "needsUrgentSupport": boolean,
        "urgentSupportMessage": "mensaje delicado para buscar ayuda inmediata si needsUrgentSupport es true",
        "visibleOrientationReport": {
          "titulo": "Tu primera lectura de claridad",
          "subtitulo": "Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo.",
          "lo_que_parece_pesar_mas": "Párrafo empático",
          "impacto_en_tu_dia_a_dia": "Párrafo sobre cómo afecta a su día a día",
          "lo_que_podria_necesitar_tu_momento_actual": "Sugerencias suaves",
          "lo_que_esta_conversacion_ha_permitido_ver": "Lo que habéis ordenado juntos",
          "siguiente_paso": "El Cuestionario Espejo",
          "pregunta_validacion": "¿Sientes que refleja cómo te encuentras?",
          "opciones_validacion": ["Totalmente", "No del todo"],
          "nota_seguridad": "Este resumen no sustituye una valoración profesional ni constituye un diagnóstico."
        },
        "internalTherapistReport": {
          "datos_basicos": { "nombre": "", "edad": "", "email": "", "telefono": "", "canal_preferido_cuestionario": "", "estado_cuestionario_espejo": "" },
          "motivo_principal": "",
          "estado_emocional_predominante": { "expresado_por_usuario": [], "inferido_por_conversacion": [] },
          "duracion_y_evolucion": "",
          "impacto_funcional": { "sueno": "", "energia": "", "trabajo_estudios": "", "relaciones": "", "cuerpo": "", "alimentacion": "", "concentracion": "", "rutinas": "", "capacidad_disfrute": "", "evitacion": "" },
          "contexto_y_posibles_desencadenantes": "",
          "recursos_y_afrontamiento": "",
          "expectativas_usuario": "",
          "senales_de_riesgo": { "riesgo_detectado": false, "descripcion": "", "accion_recomendada": "" },
          "nivel_orientativo_intensidad": "bajo | medio | alto | riesgo",
          "hipotesis_de_trabajo_no_diagnostica": "",
          "informacion_faltante_relevante": [],
          "recomendacion_prudente_siguiente_paso": "",
          "validacion_usuario_informe_visible": { "respuesta": "", "comentario_adicional": "" },
          "observaciones_estilo_comunicacion": [],
          "resumen_para_derivacion": ""
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 3500 }
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


const ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePersonalAccessCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ACCESS_CODE_CHARS[Math.floor(Math.random() * ACCESS_CODE_CHARS.length)];
  }
  return code;
}

async function getOrCreatePersonalAccessCode(db: FirebaseFirestore.Firestore, uid: string, email: string, userData: any, profileData: any) {
  if (userData?.personalAccessCode || profileData?.personalAccessCode) {
    return userData?.personalAccessCode || profileData?.personalAccessCode;
  }

  const accessCodesRef = db.collection('accessCodes');
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generatePersonalAccessCode(6);
    const codeDocRef = accessCodesRef.doc(code);
    
    try {
      await db.runTransaction(async (t) => {
        const doc = await t.get(codeDocRef);
        if (doc.exists) {
          throw new Error("CodeExists");
        }
        
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        
        t.set(codeDocRef, {
          uid,
          email,
          createdAt: timestamp
        });
        
        t.set(db.collection('users').doc(uid), {
          personalAccessCode: code,
          personalAccessCodeCreatedAt: timestamp
        }, { merge: true });
        
        t.set(db.collection('userProfiles').doc(uid), {
          personalAccessCode: code,
          personalAccessCodeCreatedAt: timestamp
        }, { merge: true });
      });
      return code;
    } catch (e: any) {
      if (e.message !== "CodeExists") {
        console.error("Error creating personal access code", e);
        return null;
      }
    }
  }
  return null;
}

app.post("/api/request-questionnaire", requireAuth, async (req, res) => {
  let requestStep = "start";
  try {
    const { email, telefono, preferredChannels, edad, sexo } = req.body;
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
    // Added validation for edad and sexo, though they might not be fully required if backend allows, but let's encourage them
    // Wait, the client already validates. But backend can be safe. Let's just pass them through.

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
      edad: edad || null,
      sexo: sexo || null,
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
    copyIfPresent(userData, 'reportFeedback');
    copyIfPresent(userData, 'latestReportFeedbackAgrees');
    copyIfPresent(userData, 'latestReportFeedbackLabel');
    copyIfPresent(userData, 'latestReportFeedbackComment');
    copyIfPresent(userData, 'latestReportFeedbackAt');
    copyIfPresent(userData, 'latestVisibleOrientationReport');
    copyIfPresent(userData, 'latestInternalTherapistReport');
    copyIfPresent(profileData, 'globalUserSummary');
    copyIfPresent(profileData, 'accumulatedSummary');
    copyIfPresent(profileData, 'latestClinicalConclusion');
    copyIfPresent(profileData, 'latestUserEmpatheticMessage');
    copyIfPresent(profileData, 'consultationSummary');
    copyIfPresent(profileData, 'consultationConclusion');
    copyIfPresent(profileData, 'diaryProfile');
    copyIfPresent(profileData, 'weeklyGoalsSummary');
    copyIfPresent(profileData, 'gratitudeDiarySummary');
    copyIfPresent(profileData, 'mainThemes');
    copyIfPresent(profileData, 'emotionalSignals');
    copyIfPresent(profileData, 'reportFeedback');
    copyIfPresent(profileData, 'latestReportFeedbackAgrees');
    copyIfPresent(profileData, 'latestReportFeedbackLabel');
    copyIfPresent(profileData, 'latestReportFeedbackComment');
    copyIfPresent(profileData, 'latestReportFeedbackAt');
    copyIfPresent(profileData, 'latestVisibleOrientationReport');
    copyIfPresent(profileData, 'latestInternalTherapistReport');

    const requestsRef = db.collection('users').doc(uid).collection('questionnaireRequests');
    const requestId = requestsRef.doc().id;
    
    // Create numeric timestamp and ISO string
    const createdAt = Date.now();
    const createdAtIso = new Date(createdAt).toISOString(); 

    requestStep = "get_access_code";
    const personalAccessCode = await getOrCreatePersonalAccessCode(db, uid, email, userData, profileData);
    if (personalAccessCode) {
      soybienestarContext.personalAccessCodeProvided = true;
      soybienestarContext.personalAccessCodeLength = personalAccessCode.length;
    }

    requestStep = "build_payload";
    const payload: any = {
      id: requestId,
      source: "soybienestar",
      sourcePath: "/zen",
      soybienestarUid: uid,
      nombre: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      displayName: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      email,
      telefono,
      edad: edad || null,
      sexo: sexo || null,
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
    
    if (personalAccessCode) {
      payload.proposedAccessCode = personalAccessCode;
    }

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
      edad: edad || null,
      sexo: sexo || null,
      preferredChannels,
      questionnaireApiStatus: response.status,
      questionnaireApiResponse: apiResponseData,
      source: "soybienestar",
      sourcePath: "/zen",
      soybienestarContext,
      contactSnapshot
    });

    requestStep = "update_user_request_metadata";
    const updateData: any = {
      questionnaireRequestStatus: "pending",
      questionnaireStatus: "requested",
      questionnaireRequestedAt: timestamp,
      lastQuestionnaireRequestAt: timestamp,
      lastQuestionnaireRequestId: requestId,
      lastQuestionnaireContactSnapshot: contactSnapshot
    };
    
    if (personalAccessCode) {
      updateData.questionnaireAccessCodeSharedAt = timestamp;
      updateData.lastQuestionnaireProposedAccessCode = personalAccessCode;
    }
    
    if (userData.dossierAvailableAt !== undefined) updateData.dossierAvailableAt = userData.dossierAvailableAt;
    if (userData.dossierViewedAt !== undefined) updateData.dossierViewedAt = userData.dossierViewedAt;
    
    if (!userData.linkedQuestionnairePatientId) {
      updateData.linkedQuestionnairePatientId = null;
    }

    await docRef.update(updateData);
    
    await profileRef.update({
      questionnaireStatus: "requested",
      ...(personalAccessCode ? { 
        questionnaireAccessCodeSharedAt: timestamp,
        lastQuestionnaireProposedAccessCode: personalAccessCode
      } : {})
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
