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
} catch (e) {}

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
    const clientEmail =
      process.env.FIREBASE_CLIENT_EMAIL || process.env.client_email;
    const privateKey = (
      process.env.FIREBASE_PRIVATE_KEY || process.env.private_key
    )?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("SUCCESS: Firebase Admin initialized via env variables.");
    } else {
      let fallbackProjectId = projectId;
      try {
        const configPath = path.join(
          process.cwd(),
          "firebase-applet-config.json",
        );
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          fallbackProjectId = config.projectId;
        }
      } catch (e) {
        // ignore
      }

      if (fallbackProjectId) {
        admin.initializeApp({ projectId: fallbackProjectId });
        console.log(
          "SUCCESS: Firebase Admin initialized via App Default Config with projectId:",
          fallbackProjectId,
        );
      } else {
        admin.initializeApp();
        console.log(
          "SUCCESS: Firebase Admin initialized via App Default Config (no explicit projectId).",
        );
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
  console.warn(
    "CRITICAL: GEMINI_API_KEY is not defined in environment variables. AI features will be disabled.",
  );
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
      error:
        "En este momento estamos recibiendo muchas consultas y nuestros guías virtuales están algo saturados. Te agradecemos mucho la paciencia. Por favor, toma un respiro e inténtalo de nuevo en unos minutos.",
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
      res.status(500).json({
        error:
          "Error interno del servidor. Firebase no inicializado. Por favor añade FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en 'Secrets / Environment Variables' de tu panel.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(
      "Error validando token en el API",
      error instanceof Error ? error.message : "Desconocido",
    );
    res.status(401).json({ error: "Token inválido o expirado." });
    return;
  }
};

const TEST_USER_EMAIL = "davidcaparrosgarcia@gmail.com";

function isTestUser(req: any) {
  return req.user?.email === TEST_USER_EMAIL;
}

async function checkAILimit(
  req: any,
  uid: string,
  limitKey: string,
  period: "daily" | "weekly" | "monthly",
  maxLimit: number,
): Promise<boolean> {
  if (isTestUser(req)) return true;
  if (!admin.apps.length) return true;
  const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);
  const now = new Date();
  let periodStr = "";
  if (period === "daily") periodStr = now.toISOString().split("T")[0];
  if (period === "monthly") periodStr = now.toISOString().slice(0, 7);
  if (period === "weekly") {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const pastDays = (now.getTime() - firstDay.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    periodStr = `${now.getFullYear()}-W${weekNum}`;
  }

  const docId = `${limitKey}_${periodStr}`;
  const limitRef = db
    .collection("users")
    .doc(uid)
    .collection("aiLimits")
    .doc(docId);

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

async function checkGratitudeLimits(
  req: any,
  uid: string,
  entry1: string,
  entry2: string,
): Promise<boolean> {
  if (isTestUser(req)) return true;
  if (!admin.apps.length) return true;
  const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);
  const dateStr = new Date().toISOString().split("T")[0];
  const limitRef = db
    .collection("users")
    .doc(uid)
    .collection("aiLimits")
    .doc(`gratitude_${dateStr}`);

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
    riskAlertEmailsConfigured:
      !!process.env.RISK_ALERT_EMAILS || !!process.env.NOTIFICATION_EMAILS,
    model: AI_MODEL,
    env: process.env.NODE_ENV || "development",
    questionnaireApiConfigured: !!process.env.QUESTIONNAIRE_API_URL,
    questionnaireBridgeConfigured: !!process.env.QUESTIONNAIRE_BRIDGE_SECRET,
    questionnaireWebhookReceiverEnabled: true,
    questionnaireWebhookSecretConfigured:
      !!process.env.QUESTIONNAIRE_BRIDGE_SECRET ||
      !!process.env.SOYBIENESTAR_BRIDGE_SECRET,
    serverFirestoreDatabaseId: SERVER_FIRESTORE_DATABASE_ID,
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
          telefonoAvailable: !!sessionContext?.user?.personalData?.telefono,
        },
        questionnaire: sessionContext?.user?.questionnaire || {},
        resources: sessionContext?.user?.resources || {},
      },
    };

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Mensaje inválido." });
      return;
    }
    const isTest = isTestUser(req);
    const maxChars = isTest ? 8000 : 4000;
    const maxHistory = isTest ? 200 : 50;

    if (message.length > maxChars) {
      res.status(400).json({
        error: `El mensaje no puede superar los ${maxChars} caracteres.`,
      });
      return;
    }

    if (history && !Array.isArray(history)) history = [];
    if (history.length > maxHistory) history = history.slice(-maxHistory);

    // Clean history
    history = history
      .filter(
        (h: any) =>
          h &&
          h.role &&
          Array.isArray(h.parts) &&
          h.parts.length > 0 &&
          h.parts[0].text,
      )
      .map((h: any) => ({
        role: h.role,
        parts: [{ text: h.parts[0].text.substring(0, maxChars) }],
      }));

    if (!ai) return;

    const chatWithHistory = ai.chats.create({
      model: AI_MODEL,
      config: {
        systemInstruction: `Eres un guía virtual de primera acogida emocional para una plataforma de bienestar psicológico online.

Tu función NO es diagnosticar, tratar ni sustituir a un profesional humano. Tu función es escuchar, ordenar la información inicial de la persona y recoger una comprensión suficientemente clara de su situación para que después un equipo humano pueda preparar una orientación personalizada.

Actúas como una presencia cálida, serena, humana, profesional y cercana. Tu estilo debe transmitir seguridad, respeto y acompañamiento, sin sonar artificial, excesivamente terapéutico ni comercial.

OBJETIVO PRINCIPAL DE LA CONVERSACIÓN

Durante una conversación de máximo 15 minutos, con reglas visibles en la página de esta web, debes ayudar a la persona a expresar qué le ocurre, desde cuándo, cómo le afecta y qué necesita.

Tu objetivo es construir una primera comprensión orientativa de su situación para preparar dos salidas posteriores:

1. Un informe visible para el usuario:
   - Empático.
   - Comprensivo.
   - No diagnóstico.
   - Diseñado para que la persona sienta que su situación ha sido escuchada y ordenada con cuidado.
   - Este informe es previo al Cuestionario Espejo y no debe confundirse con el dossier final.

2. Un informe interno para terapeutas:
   - Sintético.
   - Profesional.
   - Claro.
   - Sin maquillaje emocional.
   - Útil para que el equipo humano no empiece desde una hoja en blanco.
   - Debe recoger señales relevantes, contexto, necesidades, intensidad orientativa y próximos pasos prudentes.

El objetivo no es obtener una conversación perfecta, sino reunir información útil, emocionalmente respetuosa y suficientemente clara para que un profesional humano pueda comprender mejor el caso.

IMPORTANTE SOBRE EL CUESTIONARIO ESPEJO

La IA NO puede solicitar, enviar ni activar directamente el Cuestionario Espejo.

La IA debe orientar al usuario para que, al finalizar o salir de la consulta, acceda a la siguiente pantalla y solicite allí el Cuestionario Espejo si desea continuar el proceso.

No pidas email, teléfono, edad o sexo como requisito para enviar el cuestionario.

Solo pregunta por edad o sexo si realmente ayuda a comprender el estado emocional del usuario o si el usuario lo aporta de forma natural. No conviertas estos datos en una parte obligatoria de la conversación.

Cuando recomiendes solicitar el Cuestionario Espejo, debes explicarlo así:
- Es un proceso rápido y sencillo.
- Se solicita desde la siguiente pantalla tras finalizar o salir de la consulta.
- La solicitud llega al equipo de terapeutas.
- El cuestionario no se recibe de forma automática al pulsar solicitar.
- El equipo humano revisa la petición y envía el acceso.
- A veces puede llegar en minutos.
- En otras ocasiones puede tardar algo más.
- Normalmente no debería exceder uno o dos días laborables.
- Si en dos días laborables no ha recibido nada, puede solicitarlo de nuevo por si hubo algún error o contactar mediante los medios disponibles en la web.

No digas:
"Te lo envío ahora."
"Ya he solicitado el cuestionario."
"Ya se ha enviado."
"Lo recibirás automáticamente."
"Dame tu teléfono."
"Dame tu email."
"¿Prefieres email, SMS o WhatsApp?"

Sí puedes decir:
"Cuando salgas de esta consulta, en la siguiente pantalla podrás solicitar el Cuestionario Espejo."
"Es un paso rápido y sencillo."
"La petición llegará al equipo de terapeutas, que será quien te envíe el acceso."
"Mientras esperas, la plataforma dejará disponibles algunos recursos iniciales que pueden ayudarte a empezar a cuidarte desde hoy."

RECURSOS LIBERADOS AL FINALIZAR LA CONSULTA

Al finalizar la consulta, el usuario tendrá liberados varios accesos a recursos de la web que pueden serle útiles mientras espera el Cuestionario Espejo.

Puedes mencionar estos recursos cuando proceda:
- Diario de agradecimientos y propósitos semanales.
- Meditaciones guiadas.
- Ejercicios de respiración.
- Pequeña guía de inicio en el control y gestión de emociones.

Si el usuario menciona insomnio, ansiedad, estrés, pensamientos repetitivos, bloqueo o dificultad para regularse, puedes conectar suavemente estos recursos con su situación.

Ejemplo:
"Mientras esperas el Cuestionario Espejo, en la web tendrás acceso a algunos recursos iniciales. En tu caso, por lo que cuentas del sueño y los pensamientos repetitivos, podría tener sentido empezar por una respiración sencilla o una meditación guiada breve antes de dormir, sin forzarte a conseguir un resultado inmediato."

No presentes estos recursos como tratamiento ni como solución garantizada. Preséntalos como apoyo inicial.

INFORMACIÓN QUE DEBES INTENTAR OBTENER SIN PRESIONAR

A lo largo de la conversación, de forma natural y progresiva, intenta comprender:

1. Motivo principal de consulta:
   - Qué le preocupa o qué le ha traído hasta aquí.
   - Qué sensación, problema o situación quiere mejorar.

2. Estado emocional actual:
   - Ansiedad, tristeza, bloqueo, estrés, miedo, agotamiento, confusión, soledad, irritabilidad, vacío, culpa, sensación de pérdida, desconexión o saturación.
   - No etiquetes clínicamente.
   - Usa expresiones prudentes como:
     "parece que estás viviendo..."
     "por lo que cuentas, podría haber..."
     "da la impresión de que..."
     "suena a una etapa de..."

3. Duración y evolución:
   - Desde cuándo le ocurre.
   - Si apareció de golpe o se ha ido acumulando.
   - Si hay momentos en que empeora o mejora.
   - Si hay ciclos, recaídas o momentos de aparente calma.

4. Impacto en la vida diaria:
   - Sueño.
   - Energía.
   - Trabajo o estudios.
   - Relaciones.
   - Cuerpo.
   - Alimentación.
   - Concentración.
   - Rutinas.
   - Capacidad para disfrutar.
   - Sensación de control o desbordamiento.

5. Posibles desencadenantes:
   - Cambios recientes.
   - Conflictos.
   - Pérdidas.
   - Sobrecarga.
   - Problemas familiares, laborales, de pareja o personales.
   - Experiencias repetidas que puedan estar generando malestar.
   - Situaciones que la persona evita o teme afrontar.

6. Recursos actuales:
   - Qué ha intentado hasta ahora.
   - Qué le ayuda mínimamente.
   - Si tiene apoyo de alguien.
   - Si ha recibido ayuda profesional antes.
   - Qué hace cuando se siente peor.
   - Qué cosas todavía le dan algo de calma, sentido o estabilidad.

7. Expectativa o deseo:
   - Qué le gustaría que cambiara.
   - Qué espera encontrar en la plataforma.
   - Qué sería para esa persona una mejora realista.
   - Qué le gustaría recuperar de sí misma.

TONO Y ESTILO

- Escribe como una persona serena, inteligente y cercana.
- Usa frases claras y naturales.
- Evita sonar como un formulario.
- Evita repetir siempre la estructura: "entiendo lo que dices + resumen + pregunta".
- No termines todas tus respuestas con una pregunta.
- No uses frases exageradas como "eres muy valiente" constantemente.
- No uses lenguaje frío, clínico o administrativo.
- No uses promesas de curación.
- No digas "te entiendo perfectamente".
- Puedes decir:
  "puedo imaginar que esto pesa"
  "tiene sentido que te resulte difícil"
  "lo que cuentas no suena simple"
  "vamos a intentar ordenarlo sin prisa"
- Mantén las respuestas relativamente breves, pero con suficiente calidez.
- Si la persona se expresa mucho, no interrumpas demasiado: recoge lo esencial y guía con suavidad.
- Si la persona se expresa poco, acompaña con preguntas sencillas, concretas y no invasivas.

REGLA IMPORTANTE SOBRE LAS PREGUNTAS

No hagas más de una pregunta principal por mensaje, salvo que sea estrictamente necesario.

Puedes incluir una segunda opción solo si ayuda a que la persona pueda elegir por dónde empezar.

Ejemplo correcto:
"Podemos empezar por lo más sencillo: ¿qué es lo que más te está pesando estos días?"

Ejemplo correcto:
"Si te resulta más fácil, puedes contarme cuándo empezó o en qué momento del día lo notas más."

Ejemplo incorrecto:
"¿Desde cuándo te pasa, cómo te afecta, duermes bien, tienes ansiedad, qué edad tienes y qué esperas de la terapia?"

ADAPTACIÓN SEGÚN EL TIPO DE USUARIO

1. Usuario que no sabe por dónde empezar

Si la persona dice "no sé qué decir", "no sé por dónde empezar", "es complicado", "no sabría explicarlo" o algo parecido, NO cierres la conversación.

No respondas solo:
"Cuéntame lo que sientas."

Eso puede ser demasiado abierto para alguien bloqueado.

Ofrece categorías simples para ayudarle a entrar.

Ejemplo:
"No pasa nada. A veces, cuando algo lleva tiempo dentro, cuesta saber por dónde empezar. Podemos hacerlo muy sencillo: ¿lo que más te pesa ahora está más relacionado con ansiedad, tristeza, sueño, trabajo, relaciones, agotamiento o una mezcla de varias cosas?"

2. Usuario que habla mucho o de forma caótica

No le cortes bruscamente. Resume solo lo imprescindible, identifica ejes y dirige con amabilidad.

Ejemplo:
"Te estoy leyendo con atención. Hay varias cosas mezcladas: cansancio, preocupación constante y una sensación de no poder parar. Para no perdernos, me gustaría centrarme un momento en lo que más te está afectando ahora mismo."

3. Usuario que responde con frases muy cortas

No cierres. Haz preguntas suaves y concretas.

Ejemplo:
"Gracias por decírmelo. Cuando dices 'ansiedad', ¿la notas más en el cuerpo, en los pensamientos o en situaciones concretas?"

4. Usuario emocionalmente desbordado

Reduce la exigencia. No hagas preguntas largas. Ofrece contención y una pregunta muy simple.

Ejemplo:
"Vamos despacio. No necesitas explicarlo todo ahora. Solo dime una cosa: en este momento, ¿lo que más pesa es el miedo, el cansancio o la sensación de no poder más?"

5. Usuario que quiere irse o finalizar

Si dice claramente que quiere terminar, respeta su decisión.

Antes de cerrar, ofrece un cierre amable y explica el siguiente paso sin presionar.

Ejemplo:
"Claro, podemos dejarlo aquí. Con lo que has compartido ya hay una primera base para orientarte. Al salir de esta consulta, verás una primera lectura comprensiva de lo que hemos hablado y podrás validar si refleja cómo te encuentras. Desde esa misma continuidad podrás solicitar el Cuestionario Espejo si decides seguir el proceso."

6. Usuario que pide ayuda urgente o expresa riesgo

Si la persona menciona intención de hacerse daño, suicidio, autolesión, violencia, abuso actual, peligro inmediato o que no puede mantenerse a salvo:

- Prioriza seguridad.
- No continúes con el proceso normal.
- Recomienda contactar inmediatamente con emergencias o con una persona de confianza.
- En España, indica que puede llamar al 112 si hay peligro inmediato.
- Si habla de suicidio o riesgo autolesivo, indica que en España también existe el 024, línea de atención a la conducta suicida.
- Mantén tono humano, claro y directo.
- No prometas confidencialidad absoluta en situación de riesgo.
- No intentes resolver la crisis mediante el cuestionario.

Ejemplo:
"Siento mucho que estés pasando por algo tan intenso. Ahora lo más importante es tu seguridad. Si sientes que podrías hacerte daño o no puedes mantenerte a salvo, llama ahora al 112 o acude a urgencias. Si estás en España y necesitas hablar con alguien especializado en conducta suicida, también puedes llamar al 024. Si puedes, busca ahora a alguien cercano y dile claramente que necesitas compañía. No tienes que manejar esto a solas."

EXPLORACIÓN SUAVE DE DESESPERANZA

Si el usuario dice frases como:
- "quiero recuperar la ilusión de estar vivo"
- "no puedo más"
- "no le veo sentido"
- "estoy cansado de todo"
- "me da igual todo"
- "no sé para qué seguir"
- "ojalá no despertara"
- "no quiero estar aquí"

No cierres inmediatamente ni pases directamente al Cuestionario Espejo.

Haz una pregunta breve, humana y cuidadosa para diferenciar agotamiento emocional de riesgo:

"Cuando dices eso, quiero preguntártelo con cuidado: ¿lo expresas como una forma de decir que estás agotado y has perdido ilusión, o has llegado a sentir que no quieres seguir viviendo?"

Si hay riesgo, activa el protocolo de seguridad.

Si no hay riesgo, continúa con normalidad y recoge la pérdida de ilusión como dato relevante.

CONSEJOS GENERALES CUANDO EL USUARIO LOS PIDA

Aunque tu función principal es la primera escucha, si el usuario pide un consejo concreto y seguro, puedes ofrecer una orientación general breve, no clínica y no personalizada como tratamiento.

Puedes dar consejos de:
- Respiración lenta.
- Escritura de preocupaciones.
- Higiene básica del sueño.
- Pausas breves.
- Ordenar tareas.
- Evitar mirar la hora durante el insomnio.
- Reducir estímulos antes de dormir.
- Buscar apoyo humano si se siente desbordado.
- Usar un recurso inicial de la plataforma cuando encaje con lo que ha contado.

Debes evitar:
- Prescribir tratamientos.
- Recomendar medicación.
- Recomendar retirar sustancias de golpe.
- Dar indicaciones médicas.
- Prometer que el consejo resolverá el problema.
- Convertir el consejo en una sesión terapéutica larga.

Ejemplo para sueño:
"Sí, puedo darte algo sencillo y seguro para esta noche, sin sustituir la valoración del equipo humano. Como me has contado que tu problema principal es que la mente no se apaga, prueba esto: durante 10 minutos antes de acostarte, escribe en una hoja las preocupaciones que aparecen y al lado una frase: 'esto no lo resuelvo ahora, lo retomo mañana'. Después baja la luz, evita mirar la hora y haz respiraciones lentas alargando la salida del aire. No busques dormir a la fuerza; busca bajar la activación. Además, cuando salgas de esta consulta tendrás disponibles recursos iniciales en la web; en tu caso podría tener sentido empezar por una respiración guiada o una meditación breve antes de dormir."

SI EL USUARIO MENCIONA CANNABIS, ALCOHOL, MEDICACIÓN O SUSTANCIAS PARA DORMIR O CALMARSE

No juzgues.
No alarmes.
No des instrucciones de retirada.
No normalices como solución.
No lo ignores.

Respuesta recomendada:
"Gracias por decírmelo. Lo recojo sin juicio, porque es importante para entender cómo estás intentando descansar o regularte. Conviene que el equipo humano lo tenga en cuenta con cuidado, especialmente si lo estás usando de forma frecuente."

Si procede, pregunta solo una aclaración:
"¿Esto empezó con este periodo de malestar o ya venía de antes?"

Si el usuario no quiere profundizar, respeta y continúa el cierre.

GESTIÓN DEL TEMPORIZADOR DE 15 MINUTOS

La sesión tiene un máximo aproximado de 15 minutos, pero el usuario no está obligado a esperar hasta el final.

Si el usuario pregunta si debe esperar:
"No tienes que esperar a que el tiempo llegue al final. Si sientes que ya has contado lo principal, puedes cerrar la sesión cuando quieras usando 'Finalizar sesión' o 'Salir de la sesión'. El límite solo ayuda a que esta primera escucha tenga un marco y no termine de forma brusca."

Si el tiempo está cerca de terminar:
"Nos acercamos al final de esta primera escucha. Para no cerrarlo de golpe, voy a recoger lo principal y después podrás ver una primera lectura comprensiva en la siguiente pantalla."

Si el tiempo ya terminó:
"Parece que esta primera sesión ya ha llegado a su límite. El siguiente paso es revisar el resumen comprensivo, validarlo si refleja cómo te encuentras y solicitar el Cuestionario Espejo desde la siguiente pantalla si decides continuar."

No digas:
"No hay un tiempo establecido."
"Puedes seguir indefinidamente."
"El tiempo no importa."

El tiempo sí importa porque forma parte del marco de la consulta.

GESTIÓN DEL CIERRE Y SIGUIENTE PASO

Cuando la conversación esté madura o el tiempo se acerque al final, empieza a cerrar de forma orgánica.

No cortes de golpe.

No conviertas el cierre en una venta.

No digas que vas a enviar el cuestionario.

No pidas datos de contacto.

El cierre debe incluir:
1. Una recogida breve y personalizada de lo hablado.
2. La indicación de que en la siguiente pantalla verá una primera lectura comprensiva.
3. La aclaración de que no es el dossier final.
4. La posibilidad de validar si refleja cómo se encuentra.
5. La recomendación suave de solicitar el Cuestionario Espejo desde la siguiente pantalla.
6. La explicación de que el cuestionario será enviado por el equipo humano tras revisar la solicitud.
7. La mención de recursos iniciales liberados en la web.

Ejemplo de cierre:
"Gracias por compartir todo esto. Por lo que me has contado, parece que este último periodo ha dejado una carga importante: dificultades para dormir, pensamientos repetitivos, preocupación casi constante y una pérdida de actividades que antes te daban vida. También aparece algo valioso: estás intentando sostenerte y buscar una forma de entender mejor lo que te ocurre.

No voy a convertir esto en una etiqueta ni en un diagnóstico, porque eso debe valorarlo una persona profesional. Pero sí hay una primera base para entender mejor desde dónde estás viviendo todo esto.

Al salir de esta consulta verás una primera lectura comprensiva de la conversación. No es el dossier final, sino un resumen previo para que puedas decir si refleja cómo te encuentras.

Desde la siguiente pantalla también podrás solicitar el Cuestionario Espejo. Es un paso rápido y sencillo. La solicitud llegará al equipo de terapeutas, y ellos serán quienes te envíen el acceso. A veces llega en minutos; en otras ocasiones puede tardar algo más, aunque normalmente no debería superar uno o dos días laborables.

Mientras tanto, quedarán disponibles algunos recursos iniciales en la web, como ejercicios de respiración, meditaciones guiadas, un diario de agradecimientos y propósitos semanales, y una pequeña guía de inicio para la gestión de emociones."

CUÁNDO NO DEBES CERRAR

No cierres la conversación si:

- La persona solo ha dado una frase inicial.
- Dice "no sé qué más decir" pero todavía hay poca información.
- Solo conoces el síntoma, pero no el impacto.
- No sabes desde cuándo ocurre.
- No sabes qué espera o qué necesita.
- Hay frases de desesperanza que no han sido exploradas.
- No hay señales claras de que quiera terminar.
- Todavía no se ha construido una mínima comprensión de su situación.

CUÁNDO SÍ PUEDES EMPEZAR A CERRAR

Puedes empezar a cerrar cuando:

- Ya conoces el motivo principal.
- Tienes una idea de la duración o evolución.
- Sabes cómo le afecta en su día a día.
- Has identificado al menos una necesidad, preocupación o expectativa.
- La persona dice que ya ha contado lo importante.
- La conversación se acerca al límite de tiempo.
- La persona pide directamente el siguiente paso.
- El usuario quiere finalizar.

GESTIÓN DE DUDAS SOBRE EL CUESTIONARIO ESPEJO

Si el usuario pregunta:
"¿Me lo mandas tú?"
"¿Cuándo me llega?"
"¿Por qué no lo he recibido?"
"¿Tengo que esperar?"
"¿Cómo funciona?"

Responde con claridad:

"El Cuestionario Espejo no se envía automáticamente desde este chat. Al salir de la consulta podrás solicitarlo en la siguiente pantalla. Esa petición llega al equipo de terapeutas, que es quien revisa la solicitud y envía el acceso. A veces puede llegar en minutos, pero en otras ocasiones puede tardar algo más. Normalmente no debería superar uno o dos días laborables. Si pasado ese plazo no lo has recibido, puedes solicitarlo de nuevo por si hubo algún error o contactar con el equipo mediante los medios disponibles en la web."

No inventes estados técnicos.

No digas que algo se ha enviado si el sistema no lo confirma.

No pidas datos de contacto desde el chat.

REGLAS SOBRE MARKETING Y PERSUASIÓN

Tu comunicación puede ser persuasiva, pero nunca manipuladora.

Debes transmitir valor, claridad y confianza, no urgencia artificial.

Puedes destacar:
- Que el proceso ayuda a ordenar lo vivido.
- Que el dossier personal es gratuito.
- Que el equipo humano tendrá más contexto.
- Que los recursos de la plataforma pueden acompañar los primeros pasos.
- Que la persona no tendrá que explicarlo todo desde cero.
- Que el Cuestionario Espejo permite convertir una conversación emocional en una comprensión más ordenada.
- Que solicitarlo es un paso rápido y sencillo desde la siguiente pantalla.

No debes:
- Prometer resultados garantizados.
- Decir que la terapia solucionará seguro su problema.
- Usar miedo para empujar la contratación.
- Insistir si la persona no quiere continuar.
- Presentar el cuestionario como obligatorio.
- Crear dependencia emocional.
- Decir que ya sabes lo que le pasa.
- Decir que necesita tratamiento.
- Recomendar una terapia concreta.
- Presentar los recursos liberados como solución suficiente o garantizada.

SALUDO INICIAL

En el primer mensaje:

- Saluda de forma cálida.
- Explica brevemente qué puede hacer la persona en este espacio.
- No hagas una batería de preguntas.
- Si tienes su nombre, úsalo de forma natural.
- No pidas edad, sexo, teléfono ni email de entrada.

Ejemplo:

"Hola, [nombre]. Me alegra que hayas llegado hasta aquí. Este es un espacio de primera escucha: puedes contarme con calma qué te preocupa o qué te gustaría ordenar, sin necesidad de explicarlo perfecto.

No voy a juzgarte ni a ponerte etiquetas. Mi papel es ayudarte a dar forma a lo que estás viviendo para que después el equipo humano pueda acompañarte mejor.

Para empezar, cuéntame solo lo más importante: ¿qué te ha traído hoy hasta aquí?"

+++ CONTEXTO OPERATIVO DE ESTA SESIÓN +++
Duración máxima: 15 minutos.
Tiempo restante: ${safeSessionContext.time?.timeLeftSeconds || 0} segundos.
Tiempo transcurrido: ${safeSessionContext.time?.elapsedSeconds || 0} segundos.
Fase actual de la sesión: ${safeSessionContext.time?.sessionPhase || "desconocida"}.
Usuario:
- Nombre: ${safeSessionContext.user.personalData?.nombre || "No proporcionado"}
- Edad: ${safeSessionContext.user.personalData?.edad || "No proporcionada"}
- Sexo: ${safeSessionContext.user.personalData?.sexo || "No proporcionado"}
- Email: ${safeSessionContext.user.email || "No proporcionado"}
- Tiene teléfono guardado en la plataforma: ${safeSessionContext.user.personalData?.telefonoAvailable ? "Sí" : "No"}
- Estado del cuestionario espejo: ${safeSessionContext.user.questionnaire?.status || "sin solicitar"}`,
        maxOutputTokens: 700,
        tools: [
          {
            functionDeclarations: [
              {
                name: "update_user_profile_data",
                description:
                  "Guarda o actualiza datos básicos del usuario cuando los aporte o confirme.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    nombre: {
                      type: Type.STRING,
                      description: "Nombre real del usuario.",
                    },
                    edad: {
                      type: Type.STRING,
                      description: "Edad del usuario.",
                    },
                    sexo: {
                      type: Type.STRING,
                      description:
                        "Sexo del usuario ('hombre', 'mujer', o 'prefiero_no_definirme').",
                    },
                    telefono: {
                      type: Type.STRING,
                      description: "Teléfono de contacto.",
                    },
                    consentConfirmed: {
                      type: Type.BOOLEAN,
                      description:
                        "True si el usuario ha consentido explícitamente dar esta información.",
                    },
                  },
                  required: ["consentConfirmed"],
                },
              },
              {
                name: "send_internal_risk_alert",
                description:
                  "Envía una alerta interna a los terapeutas sobre una situación de riesgo suicida, autolesivo o de peligro inmediato.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    riskLevel: {
                      type: Type.STRING,
                      description:
                        "Nivel de riesgo ('medio', 'alto', 'inminente').",
                    },
                    reason: {
                      type: Type.STRING,
                      description:
                        "Motivo resumido de la alerta (ej. 'Ideación suicida activa').",
                    },
                    nombre: {
                      type: Type.STRING,
                      description: "Nombre del usuario si se conoce.",
                    },
                    email: {
                      type: Type.STRING,
                      description: "Email del usuario si se conoce.",
                    },
                    telefono: {
                      type: Type.STRING,
                      description: "Teléfono si se conoce.",
                    },
                  },
                  required: ["riskLevel", "reason"],
                },
              },
            ],
          },
        ],
      },
      history,
    });

    const response = await chatWithHistory.sendMessage({ message });

    // Check if the AI decided to call the function
    let functionCallParams = null;
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === "send_questionnaire") {
        functionCallParams = call.args;

        const normalizedParams = {
          preferredChannels: {
            email: !!functionCallParams.email,
            whatsapp: !!functionCallParams.whatsapp,
            sms: !!functionCallParams.sms,
          },
          telefono: functionCallParams.telefono || "",
          edad: functionCallParams.edad || "",
          sexo: functionCallParams.sexo || "",
          nombre: functionCallParams.nombre || "",
          consentConfirmed: !!functionCallParams.consentConfirmed,
        };

        // Optionally, send a follow-up to the AI so it can generate a text response
        const followUp = await chatWithHistory.sendMessage({
          message: [
            {
              functionResponse: {
                name: "send_questionnaire",
                response: { success: true },
              },
            },
          ],
        });
        return res.json({
          text: followUp.text,
          action: "send_questionnaire",
          actionParams: normalizedParams,
        });
      }
    }

    res.json({ text: response.text });
  } catch (error) {
    console.error(
      "AI /api/session-reply failed: " +
        (error instanceof Error
          ? error.message + " " + error.stack
          : JSON.stringify(error)),
    );
    res.status(503).json({
      error:
        "En este momento estamos recibiendo muchas consultas y nuestro sistema está algo saturado. Te agradecemos mucho la paciencia. Por favor, toma un respiro e intenta enviar tu mensaje nuevamente.",
    });
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
    const allowed = await checkAILimit(
      req,
      req.user!.uid,
      "reportAttempts",
      "monthly",
      10,
    );
    if (!allowed) {
      res.status(429).json({
        error:
          "Parece que has llegado al límite de evaluaciones por este mes. Por favor, realiza el cuestionario espejo para seguir avanzando, o contacta con nuestro equipo.",
      });
      return;
    }

    if (messages.length > 50) messages = messages.slice(-50);
    messages = messages.filter((m: any) => m && m.content);

    accumulatedSummary =
      typeof accumulatedSummary === "string"
        ? accumulatedSummary.substring(0, 5000)
        : "";

    if (!ai) return;

    const conversationText = messages
      .map(
        (msg: any) =>
          `${msg.role === "user" ? "Persona" : "IA"}: ${msg.content.substring(0, 4000)}`,
      )
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
          "siguiente_paso": "Explicación de que hay que ir a la siguiente pantalla y solicitar el Cuestionario Espejo allí. La IA no lo envía automáticamente.",
          "recursos_iniciales_liberados": "Mención de recursos sugeridos según la conversación",
          "pregunta_validacion": "¿Sientes que refleja cómo te encuentras?",
          "opciones_validacion": ["Totalmente", "No del todo"],
          "nota_seguridad": "Este resumen no sustituye una valoración profesional ni constituye un diagnóstico."
        },
        "internalTherapistReport": {
          "datos_basicos": { "nombre": "", "edad": "", "sexo": "", "estado_cuestionario_espejo": "pendiente_de_solicitud_por_usuario_desde_siguiente_pantalla" },
          "motivo_principal": "",
          "estado_emocional_predominante": { "expresado_por_usuario": [], "inferido_por_conversacion": [] },
          "duracion_y_evolucion": "",
          "impacto_funcional": { "sueno": "", "energia": "", "trabajo_estudios": "", "relaciones": "", "cuerpo": "", "alimentacion": "", "concentracion": "", "rutinas": "", "capacidad_disfrute": "", "evitacion": "" },
          "contexto_y_posibles_desencadenantes": "",
          "recursos_y_afrontamiento": "",
          "expectativas_usuario": "",
          "sustancias_o_apoyos_para_regular_malestar": "",
          "senales_de_riesgo": { "riesgo_detectado": false, "descripcion": "", "accion_recomendada": "" },
          "nivel_orientativo_intensidad": "bajo | medio | alto | riesgo",
          "hipotesis_de_trabajo_no_diagnostica": "",
          "informacion_faltante_relevante": [],
          "recomendacion_prudente_siguiente_paso": "",
          "recursos_iniciales_sugeridos": [],
          "validacion_usuario_informe_visible": { "respuesta": "", "comentario_adicional": "" },
          "observaciones_estilo_comunicacion": [],
          "resumen_para_derivacion": ""
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 3500 },
    });

    const parsed = parseGeminiJSON(response.text || "{}");

    // If valid conclusion, apply monthly valid limit
    if (parsed.validConclusion && !isTestUser(req)) {
      const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);
      const monthStr = new Date().toISOString().slice(0, 7);
      const docRef = db
        .collection("users")
        .doc(req.user!.uid)
        .collection("aiLimits")
        .doc(`validConclusion_${monthStr}`);
      const doc = await docRef.get();
      if ((doc.data()?.count || 0) >= 1) {
        return res
          .status(429)
          .json({ error: "Solo se permite una conclusión válida por mes." });
      }
      await docRef.set(
        { count: (doc.data()?.count || 0) + 1 },
        { merge: true },
      );
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI /api/report failed", {
      uid: req.user?.uid,
      message: error instanceof Error ? error.message : "Desconocido",
    });
    res.status(503).json({
      error:
        "En este momento estamos procesando muchas consultas y nuestro sistema está algo saturado. Te agradecemos la paciencia. Por favor, intenta de nuevo en unos momentos.",
    });
  }
});

app.post("/api/diary-validate", requireAuth, requireAI, async (req, res) => {
  try {
    let { entry1, entry2, accumulatedSummary } = req.body;

    entry1 = typeof entry1 === "string" ? entry1.substring(0, 1200) : "";
    entry2 = typeof entry2 === "string" ? entry2.substring(0, 1200) : "";
    accumulatedSummary =
      typeof accumulatedSummary === "string"
        ? accumulatedSummary.substring(0, 5000)
        : "";

    if (!entry1 && !entry2) {
      res.status(400).json({ error: "Faltan entradas." });
      return;
    }

    const allowed = await checkGratitudeLimits(
      req,
      req.user!.uid,
      entry1,
      entry2,
    );
    if (!allowed) {
      res.status(429).json({
        error: "Límite de agradecimientos diarios alcanzado o ya validados.",
      });
      return;
    }

    if (!ai) return;

    const prompt = `Eres un coach de vida amigable y experto. Analiza el/los motivos de gratitud de una persona.
Instrucciones:
1. Puntúa CADA motivo proporcionado con 0, 1 o 2. 0=vacío/esquivo, 1=superficial, 2=profundo. (Max 2 para cada uno). Si solo hay uno, ignora el otro.
2. Escribe una pequeña y cálida reflexión (1 o 2 párrafos). Sé breve y cercano.
3. Fusiona hallazgos con el resumen previo.
Resumen previo: "${accumulatedSummary || "Ninguno"}"
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
      config: { maxOutputTokens: 700 },
    });

    const parsed = parseGeminiJSON(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("AI /api/diary-validate failed", {
      uid: req.user?.uid,
      message: error instanceof Error ? error.message : "Desconocido",
    });
    res.status(500).json({ error: "Failed to validate diary" });
  }
});

app.post("/api/diary-deepen", requireAuth, requireAI, async (req, res) => {
  try {
    let { entry1, entry2, reflection, accumulatedSummary } = req.body;

    entry1 = typeof entry1 === "string" ? entry1.substring(0, 1200) : "";
    entry2 = typeof entry2 === "string" ? entry2.substring(0, 1200) : "";
    reflection =
      typeof reflection === "string" ? reflection.substring(0, 3000) : "";
    accumulatedSummary =
      typeof accumulatedSummary === "string"
        ? accumulatedSummary.substring(0, 5000)
        : "";

    if (!entry1 || !entry2 || !reflection) {
      res.status(400).json({ error: "Faltan datos." });
      return;
    }

    if (!ai) return;

    const prompt = `Eres un coach de vida amigable y empático. Basándote en los motivos de gratitud y tu reflexión, profundiza brevemente.
Motivos: 1. "${entry1}", 2. "${entry2}"
Reflexión anterior: "${reflection}"

Profundiza (1 o 2 párrafos) y da un pequeño anclaje. Mantén el tono humano.
Resumen global previo: "${accumulatedSummary || "Ninguno"}". 
Fusiona hallazgos sin repeticiones.

Responde EXCLUSIVAMENTE con un JSON:
{
  "deepReflection": "tu texto aquí",
  "newAccumulatedSummary": "resumen global fusionado"
}`;
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 700 },
    });

    const parsed = parseGeminiJSON(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("AI /api/diary-deepen failed", {
      uid: req.user?.uid,
      message: error instanceof Error ? error.message : "Desconocido",
    });
    res.status(500).json({ error: "Failed to deepen emotion diary" });
  }
});

app.post("/api/weekly-goal", requireAuth, requireAI, async (req, res) => {
  try {
    let { category, accumulatedSummary } = req.body;

    category = typeof category === "string" ? category.substring(0, 100) : "";
    accumulatedSummary =
      typeof accumulatedSummary === "string"
        ? accumulatedSummary.substring(0, 5000)
        : "";

    if (!category) {
      res.status(400).json({ error: "Categoría faltante." });
      return;
    }

    const allowed = await checkAILimit(
      req,
      req.user!.uid,
      "weeklyGoalGeneration",
      "weekly",
      25,
    );
    if (!allowed) {
      res.status(429).json({
        error:
          "Has alcanzado el límite semanal de generaciones IA de propósitos.",
      });
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
      config: { maxOutputTokens: 300 },
    });

    const parsed = parseGeminiJSON(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("AI /api/weekly-goal failed", {
      uid: req.user?.uid,
      message: error instanceof Error ? error.message : "Desconocido",
    });
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
        questionnaireBridgeConfigured,
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
      const healthResponse = await fetch(
        `${normalizedApiUrl}/api/health?checkFirestore=1`,
      );
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
        error: e instanceof Error ? e.message : "Unknown health fetch error",
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
          sms: false,
        },
        hasDoneConsultation: true,
        status: "pending",
        createdAt: Date.now(),
        createdAtIso: new Date().toISOString(),
        processedAt: null,
        linkedPatientId: null,
        notes:
          "Solicitud temporal de diagnóstico del puente SoyBienestar-Cuestionario",
        soybienestarContext: {
          contextSchemaVersion: 1,
          debug: true,
          generatedAt: new Date().toISOString(),
        },
      };

      const postResponse = await fetch(
        `${normalizedApiUrl}/api/patient-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-bridge-secret": bridgeSecret,
            "x-debug-bridge": "true",
          },
          body: JSON.stringify(payload),
        },
      );

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
        error: e instanceof Error ? e.message : "Unknown post fetch error",
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
        bodyPreview: healthText,
      },
      post: {
        status: postStatus,
        ok: postOk,
        bodyPreview: postText,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error during debug block",
    });
  }
});

const ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePersonalAccessCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code +=
      ACCESS_CODE_CHARS[Math.floor(Math.random() * ACCESS_CODE_CHARS.length)];
  }
  return code;
}

async function getOrCreatePersonalAccessCode(
  db: FirebaseFirestore.Firestore,
  uid: string,
  email?: string | null,
) {
  const userRef = db.collection("users").doc(uid);
  const profileRef = db.collection("userProfiles").doc(uid);

  const [userSnap, profileSnap] = await Promise.all([
    userRef.get(),
    profileRef.get(),
  ]);

  const userData = userSnap.data() || {};
  const profileData = profileSnap.data() || {};

  const existingCode =
    userData.personalAccessCode || profileData.personalAccessCode;
  if (existingCode) {
    return String(existingCode).trim().toUpperCase();
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generatePersonalAccessCode(6);
    const codeRef = db.collection("accessCodes").doc(code);

    try {
      await db.runTransaction(async (tx) => {
        const codeSnap = await tx.get(codeRef);
        if (codeSnap.exists) {
          throw new Error("CODE_ALREADY_EXISTS");
        }

        const payload = {
          uid,
          email: email || userData.email || profileData.email || null,
          createdAt: Date.now(),
        };

        tx.set(codeRef, payload);
        tx.set(
          userRef,
          {
            personalAccessCode: code,
            personalAccessCodeCreatedAt: Date.now(),
          },
          { merge: true },
        );
        tx.set(
          profileRef,
          {
            personalAccessCode: code,
            personalAccessCodeCreatedAt: Date.now(),
          },
          { merge: true },
        );
      });

      return code;
    } catch (error) {
      if (error instanceof Error && error.message === "CODE_ALREADY_EXISTS") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se pudo generar un código único tras varios intentos.");
}

app.post("/api/request-questionnaire", requireAuth, async (req, res) => {
  let requestStep = "start";
  try {
    const { email, telefono, preferredChannels, edad, sexo } = req.body;
    const uid = req.user!.uid;
    const authEmail = req.user!.email;

    requestStep = "validate_input";
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "El email es obligatorio." });
    }
    if (
      !preferredChannels ||
      (!preferredChannels.email &&
        !preferredChannels.whatsapp &&
        !preferredChannels.sms)
    ) {
      return res.status(400).json({
        success: false,
        message: "Debes seleccionar al menos un canal de contacto.",
      });
    }
    if (
      (preferredChannels.whatsapp || preferredChannels.sms) &&
      (!telefono || telefono === "+34" || telefono.trim().length < 5)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Para recibir el enlace por WhatsApp o SMS necesitamos que indiques tu número de teléfono.",
      });
    }
    // Added validation for edad and sexo, though they might not be fully required if backend allows, but let's encourage them
    // Wait, the client already validates. But backend can be safe. Let's just pass them through.

    requestStep = "init_firestore";
    if (!admin.apps.length)
      return res.status(500).json({
        success: false,
        message:
          "Error interno del servidor. Firebase no inicializado. Por favor configura las claves en Secrets de la app.",
      });
    const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);

    requestStep = "read_user_docs";
    const docRef = db.collection("users").doc(uid);
    const profileRef = db.collection("userProfiles").doc(uid);

    const [userDoc, profileDoc] = await Promise.all([
      docRef.get(),
      profileRef.get(),
    ]);

    const userData = userDoc.data() || {};
    const profileData = profileDoc.data() || {};

    const contactSnapshot = {
      email,
      telefono: telefono || null,
      edad: edad || null,
      sexo: sexo || null,
      preferredChannels,
    };

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let isResendingDueToContactChange = false;

    requestStep = "rate_limit_check";
    if (!isTestUser(req)) {
      if (
        userData.lastQuestionnaireRequestAt &&
        now - userData.lastQuestionnaireRequestAt < thirtyDaysMs
      ) {
        const lastContact = userData.lastQuestionnaireContactSnapshot || {};
        const contactChanged =
          lastContact.email !== contactSnapshot.email ||
          lastContact.telefono !== contactSnapshot.telefono ||
          JSON.stringify(lastContact.preferredChannels) !==
            JSON.stringify(contactSnapshot.preferredChannels);

        if (!contactChanged) {
          const nextAvailableAt = new Date(
            userData.lastQuestionnaireRequestAt + thirtyDaysMs,
          ).toISOString();
          return res.status(429).json({
            success: false,
            status: "already_requested_recently",
            message:
              "Tu petición ya se ha procesado correctamente. Si no has recibido el enlace, revisa tus datos de contacto. Podrás volver a solicitarlo cuando pasen 30 días desde tu última petición. Si necesitas ayuda, puedes contactarnos desde la sección de contacto.",
            nextAvailableAt,
          });
        } else {
          isResendingDueToContactChange = true;
        }
      }
    }

    requestStep = "build_context";
    const soybienestarContext: any = {
      contextSchemaVersion: 1,
      generatedAt: new Date().toISOString(),
    };

    const copyIfPresent = (source: any, key: string) => {
      if (source && source[key] !== undefined && source[key] !== null) {
        if (typeof source[key] === "string" && source[key].length > 3000) {
          soybienestarContext[key] = source[key].substring(0, 3000) + "...";
        } else {
          soybienestarContext[key] = source[key];
        }
      }
    };

    copyIfPresent(userData, "hasDoneConsultation");
    copyIfPresent(userData, "processStage");
    copyIfPresent(userData, "reportFeedback");
    copyIfPresent(userData, "latestReportFeedbackAgrees");
    copyIfPresent(userData, "latestReportFeedbackLabel");
    copyIfPresent(userData, "latestReportFeedbackComment");
    copyIfPresent(userData, "latestReportFeedbackAt");
    copyIfPresent(userData, "latestVisibleOrientationReport");
    copyIfPresent(userData, "latestInternalTherapistReport");
    copyIfPresent(profileData, "globalUserSummary");
    copyIfPresent(profileData, "accumulatedSummary");
    copyIfPresent(profileData, "latestClinicalConclusion");
    copyIfPresent(profileData, "latestUserEmpatheticMessage");
    copyIfPresent(profileData, "consultationSummary");
    copyIfPresent(profileData, "consultationConclusion");
    copyIfPresent(profileData, "diaryProfile");
    copyIfPresent(profileData, "weeklyGoalsSummary");
    copyIfPresent(profileData, "gratitudeDiarySummary");
    copyIfPresent(profileData, "mainThemes");
    copyIfPresent(profileData, "emotionalSignals");
    copyIfPresent(profileData, "reportFeedback");
    copyIfPresent(profileData, "latestReportFeedbackAgrees");
    copyIfPresent(profileData, "latestReportFeedbackLabel");
    copyIfPresent(profileData, "latestReportFeedbackComment");
    copyIfPresent(profileData, "latestReportFeedbackAt");
    copyIfPresent(profileData, "latestVisibleOrientationReport");
    copyIfPresent(profileData, "latestInternalTherapistReport");

    const requestsRef = db
      .collection("users")
      .doc(uid)
      .collection("questionnaireRequests");
    const requestId = requestsRef.doc().id;

    // Create numeric timestamp and ISO string
    const createdAt = Date.now();
    const createdAtIso = new Date(createdAt).toISOString();

    requestStep = "get_access_code";
    const personalAccessCode = await getOrCreatePersonalAccessCode(
      db,
      uid,
      authEmail || email,
    );
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
      nombre: userData.displayName || authEmail?.split("@")[0] || "Usuario",
      displayName:
        userData.displayName || authEmail?.split("@")[0] || "Usuario",
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
      soybienestarContext,
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
        message:
          "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros.",
      });
    }

    const normalizedApiUrl = apiUrl.replace(/\/$/, "");

    requestStep = "send_to_questionnaire";
    const response = await fetch(`${normalizedApiUrl}/api/patient-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bridge-secret": bridgeSecret,
      },
      body: JSON.stringify(payload),
    });

    requestStep = "parse_questionnaire_response";
    let apiResponseData = {};
    const responseText = await response.text();
    try {
      apiResponseData = JSON.parse(responseText);
    } catch (e) {}

    if (!response.ok) {
      console.error("Error from Cuestionario API", {
        step: requestStep,
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 500),
      });
      return res.status(502).json({
        success: false,
        message:
          "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros.",
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
      contactSnapshot,
    });

    requestStep = "update_user_request_metadata";
    const updateData: any = {
      questionnaireRequestStatus: "pending",
      questionnaireStatus: "requested",
      questionnaireRequestedAt: timestamp,
      lastQuestionnaireRequestAt: timestamp,
      lastQuestionnaireRequestId: requestId,
      lastQuestionnaireContactSnapshot: contactSnapshot,
    };

    if (personalAccessCode) {
      updateData.questionnaireAccessCodeSharedAt = timestamp;
      updateData.lastQuestionnaireProposedAccessCode = personalAccessCode;
    }

    if (userData.dossierAvailableAt !== undefined)
      updateData.dossierAvailableAt = userData.dossierAvailableAt;
    if (userData.dossierViewedAt !== undefined)
      updateData.dossierViewedAt = userData.dossierViewedAt;

    if (!userData.linkedQuestionnairePatientId) {
      updateData.linkedQuestionnairePatientId = null;
    }

    await docRef.update(updateData);

    await profileRef.update({
      questionnaireStatus: "requested",
      ...(personalAccessCode
        ? {
            questionnaireAccessCodeSharedAt: timestamp,
            lastQuestionnaireProposedAccessCode: personalAccessCode,
          }
        : {}),
    });

    requestStep = "done";
    if (isResendingDueToContactChange) {
      return res.json({
        success: true,
        status: "resent_contact_changed",
        message:
          "Detectamos que has actualizado tus datos de contacto, así que hemos registrado de nuevo tu solicitud.",
        requestId,
      });
    } else {
      return res.json({
        success: true,
        status: "sent",
        message:
          "Solicitud recibida. Nuestro equipo revisará tus datos y te enviará el enlace del Cuestionario Espejo por la vía seleccionada.",
        requestId,
      });
    }
  } catch (error) {
    console.error("API /api/request-questionnaire error:", {
      step: requestStep,
      uid: req.user?.uid,
      code: (error as any)?.code,
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const xDebug = req.headers["x-debug-request-questionnaire"] === "true";

    return res.status(500).json({
      success: false,
      message:
        "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros.",
      ...(xDebug
        ? {
            debug: {
              step: requestStep,
              name: error instanceof Error ? error.name : "Unknown",
              message: error instanceof Error ? error.message : String(error),
              code: (error as any)?.code,
            },
          }
        : {}),
    });
  }
});

app.post("/api/questionnaire-status-webhook", async (req, res) => {
  try {
    const incomingSecret = req.headers["x-bridge-secret"];
    const expectedSecrets = [
      process.env.QUESTIONNAIRE_BRIDGE_SECRET,
      process.env.SOYBIENESTAR_BRIDGE_SECRET,
    ].filter(Boolean);

    if (!incomingSecret || !expectedSecrets.includes(String(incomingSecret))) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const payload = req.body;
    if (!payload || payload.event !== "dossier_available") {
      return res.status(400).json({ error: "Evento inválido o no soportado" });
    }

    const {
      soybienestarUid,
      sourceRequestId,
      linkedQuestionnairePatientId,
      email,
      telefono,
      accessPinProvidedBySoyBienestar,
      status,
      occurredAt,
      dossier,
    } = payload;

    if (!soybienestarUid && !sourceRequestId && !email) {
      return res.status(400).json({
        error: "Debe proveer soybienestarUid, sourceRequestId o email",
      });
    }

    if (
      !dossier ||
      (!dossier.finalConclusion && !dossier.conversationSummary)
    ) {
      return res.status(400).json({
        error: "Debe existir dossier con finalConclusion o conversationSummary",
      });
    }

    const db = getFirestore(admin.app(), SERVER_FIRESTORE_DATABASE_ID);
    let matchedUid: string | null = null;
    let targetUserRef: FirebaseFirestore.DocumentReference | null = null;
    let targetProfileRef: FirebaseFirestore.DocumentReference | null = null;

    if (soybienestarUid) {
      const userRef = db.collection("users").doc(soybienestarUid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        matchedUid = soybienestarUid;
        targetUserRef = userRef;
        targetProfileRef = db.collection("userProfiles").doc(matchedUid);
      }
    }

    if (!matchedUid && sourceRequestId) {
      const qs1 = await db
        .collection("users")
        .where("lastQuestionnaireRequestId", "==", sourceRequestId)
        .limit(1)
        .get();
      if (!qs1.empty) {
        matchedUid = qs1.docs[0].id;
        targetUserRef = qs1.docs[0].ref;
        targetProfileRef = db.collection("userProfiles").doc(matchedUid);
      } else {
        const qs2 = await db
          .collection("users")
          .where("sourceRequestId", "==", sourceRequestId)
          .limit(1)
          .get();
        if (!qs2.empty) {
          matchedUid = qs2.docs[0].id;
          targetUserRef = qs2.docs[0].ref;
          targetProfileRef = db.collection("userProfiles").doc(matchedUid);
        }
      }
    }

    if (!matchedUid && email) {
      const qsEmail = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (!qsEmail.empty) {
        matchedUid = qsEmail.docs[0].id;
        targetUserRef = qsEmail.docs[0].ref;
        targetProfileRef = db.collection("userProfiles").doc(matchedUid);
      } else {
        const qsContactEmail = await db
          .collection("users")
          .where("contactEmail", "==", email)
          .limit(1)
          .get();
        if (!qsContactEmail.empty) {
          matchedUid = qsContactEmail.docs[0].id;
          targetUserRef = qsContactEmail.docs[0].ref;
          targetProfileRef = db.collection("userProfiles").doc(matchedUid);
        }
      }
    }

    const now = Date.now();

    if (!matchedUid || !targetUserRef || !targetProfileRef) {
      await db.collection("questionnaireWebhookInbox").add({
        status: "unmatched",
        receivedAt: now,
        payload: {
          soybienestarUid: soybienestarUid || null,
          sourceRequestId: sourceRequestId || null,
          linkedQuestionnairePatientId: linkedQuestionnairePatientId || null,
          email: email || null,
          telefono: telefono || null,
          status: status || null,
          occurredAt: occurredAt || null,
          dossierProvided: !!dossier,
        },
      });
      return res.status(202).json({ ok: true, matched: false, stored: true });
    }

    const latestDossier = dossier.finalConclusion || "";
    const latestDossierInternalContext = dossier.conversationSummary || "";

    const updatePayload = {
      questionnaireStatus: "concluded",
      dossierAvailableAt: now,
      latestDossier,
      latestDossierInternalContext,
      latestQuestionnaireStatusEvent: payload.event,
      linkedQuestionnairePatientId: linkedQuestionnairePatientId || null,
      linkedQuestionnaireSourceRequestId: sourceRequestId || null,
      latestQuestionnaireCompletedStatus: status || null,
      latestQuestionnaireDossierReceivedAt: now,
      latestQuestionnaireDossierDateConclusionSent:
        dossier.dateConclusionSent || null,
      latestQuestionnaireAudioConclusion: dossier.audioConclusion || null,
      accessPinProvidedBySoyBienestar: !!accessPinProvidedBySoyBienestar,
      telefonoFromQuestionnaire: telefono || null,
      questionnaireWebhookLastPayloadAt: now,
    };

    await targetUserRef.set(updatePayload, { merge: true });
    await targetProfileRef.set(updatePayload, { merge: true });

    await db
      .collection("users")
      .doc(matchedUid)
      .collection("questionnaireEvents")
      .add({
        event: payload.event,
        sourceRequestId: sourceRequestId || null,
        linkedQuestionnairePatientId: linkedQuestionnairePatientId || null,
        status: status || null,
        occurredAt: occurredAt || null,
        receivedAt: now,
        hasFinalConclusion: !!dossier.finalConclusion,
        hasConversationSummary: !!dossier.conversationSummary,
        hasAudioConclusion: !!dossier.audioConclusion,
      });

    return res.json({
      ok: true,
      matched: true,
      uid: matchedUid,
      dossierAvailable: true,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Error interno" });
  }
});

export default app;
