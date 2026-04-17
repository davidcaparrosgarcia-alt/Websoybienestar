import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, onSnapshot } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getDailyStr = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function EmotionDiary() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  
  const [entries, setEntries] = useState<any[]>([]);
  
  const [entry1, setEntry1] = useState("");
  const [entry2, setEntry2] = useState("");
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [reflection, setReflection] = useState("");
  const [deepReflection, setDeepReflection] = useState("");
  
  const [isValidated, setIsValidated] = useState(false);
  const [hasDeepened, setHasDeepened] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDeep, setIsLoadingDeep] = useState(false);

  const [progressWeek, setProgressWeek] = useState(0);
  const [progressMonth, setProgressMonth] = useState(0);
  const [progressYear, setProgressYear] = useState(0);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setEntry1("");
      setEntry2("");
      setScore1(0);
      setScore2(0);
      setReflection("");
      setDeepReflection("");
      setHasDeepened(false);
      setIsValidated(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (userDoc) => {
      if (userDoc.exists()) {
        setIsSilenced(userDoc.data().diarySilenced === true);
      } else {
        setDoc(userRef, { diarySilenced: false, hasDoneConsultation: false }, { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        });
      }
    }, (err) => {
      console.error("Diary profile error:", err);
      try {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      } catch (e) { /* logged */ }
    });

    const diaryColl = collection(db, 'users', user.uid, 'diaryEntries');
    const unsubDiary = onSnapshot(diaryColl, (snapshot) => {
      const loadedEntries = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          entry1: data.entry1,
          entry2: data.entry2,
          score1: data.score1,
          score2: data.score2,
          reflection: data.reflection,
          deepReflection: data.deepReflection,
          hasDeepened: data.hasDeepened
        };
      });
      setEntries(loadedEntries);
      
      const todayStr = getDailyStr(new Date());
      const todayEntry = loadedEntries.find(e => e.id === todayStr);
      if (todayEntry) {
        setEntry1(todayEntry.entry1 || "");
        setEntry2(todayEntry.entry2 || "");
        setScore1(todayEntry.score1 || 0);
        setScore2(todayEntry.score2 || 0);
        setReflection(todayEntry.reflection || "");
        setDeepReflection(todayEntry.deepReflection || "");
        setHasDeepened(todayEntry.hasDeepened || false);
        setIsValidated(true);
      } else {
        // Reset for new day
        setEntry1("");
        setEntry2("");
        setScore1(0);
        setScore2(0);
        setReflection("");
        setDeepReflection("");
        setHasDeepened(false);
        setIsValidated(false);
      }
    }, (err) => {
      console.error("Diary entries error:", err);
      try {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/diaryEntries`);
      } catch (e) { /* logged */ }
    });

    return () => {
      unsubUser();
      unsubDiary();
    };
  }, [user]);

  useEffect(() => {
    const calculateProgress = (days: number) => {
      const today = new Date();
      let totalScore = 0;
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getDailyStr(d);
        
        const entry = entries.find(e => e.id === dateStr);
        if (entry) {
          totalScore += (entry.score1 + entry.score2);
        } else {
          // Día no registrado contabliza como 1 destello
          totalScore += 1;
        }
      }
      const maxPossible = days * 4;
      return Math.min(100, Math.round((totalScore / maxPossible) * 100));
    };

    setProgressWeek(calculateProgress(7));
    setProgressMonth(calculateProgress(30));
    setProgressYear(calculateProgress(365));
  }, [entries]);

  const handleValidate = async () => {
    if (!user) {
      alert("Por favor, regístrate o inicia sesión para usar el diario.");
      return;
    }
    if (!entry1.trim() || !entry2.trim()) {
      alert("Por favor, detalla ambos motivos de gratitud antes de validar.");
      return;
    }
    setIsLoading(true);
    try {
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

      let jsonStr = response.text || "";
      // Strip markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?|```/g, "").trim();
      
      let data;
      try {
        data = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError, "Raw string:", jsonStr);
        // Attempt to find JSON object in text if parsing failed
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          throw parseError;
        }
      }

      const todayStr = getDailyStr(new Date());
      const newData = {
        entry1,
        entry2,
        score1: typeof data.score1 === 'number' ? data.score1 : 1,
        score2: typeof data.score2 === 'number' ? data.score2 : 1,
        reflection: data.reflection || "Excelente esfuerzo por encontrar la luz de hoy. Sigue adelante.",
        hasDeepened: false,
        deepReflection: ""
      };
      
      const docRef = doc(db, 'users', user.uid, 'diaryEntries', todayStr);
      await setDoc(docRef, newData).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/diaryEntries/${todayStr}`);
      });
      
      setScore1(newData.score1);
      setScore2(newData.score2);
      setReflection(newData.reflection);
      setIsValidated(true);
      
      setEntries(prev => {
        const filtered = prev.filter(e => e.id !== todayStr);
        return [...filtered, { id: todayStr, ...newData }];
      });
      
    } catch (e) {
      console.error("AI or Firestore Error:", e);
      alert("Ocurrió un error al contactar al guía o guardar los datos. Verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepen = async () => {
    if (hasDeepened || !isValidated || !user) return;
    setIsLoadingDeep(true);
    try {
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

      let jsonStr = response.text || "";
      if (jsonStr.includes("\`\`\`json")) jsonStr = jsonStr.split("\`\`\`json")[1].split("\`\`\`")[0].trim();
      else if (jsonStr.includes("\`\`\`")) jsonStr = jsonStr.split("\`\`\`")[1].split("\`\`\`")[0].trim();
      
      const data = JSON.parse(jsonStr);

      const todayStr = getDailyStr(new Date());
      const docRef = doc(db, 'users', user.uid, 'diaryEntries', todayStr);
      await setDoc(docRef, { hasDeepened: true, deepReflection: data.deepReflection }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/diaryEntries/${todayStr}`);
      });
      
      setDeepReflection(data.deepReflection);
      setHasDeepened(true);
    } catch (e) {
      console.error(e);
      alert("Error profundizando en la sesión.");
    } finally {
      setIsLoadingDeep(false);
    }
  };

  const toggleSilence = async () => {
    if (!user) return;
    const newVal = !isSilenced;
    setIsSilenced(newVal);
    await updateDoc(doc(db, 'users', user.uid), { diarySilenced: newVal }).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    });
  };

  return (
    <div className="flex-1 bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col pt-32 pb-20 px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Image & Title Section */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="mb-12 overflow-hidden rounded-xl">
              <img 
                alt="Serene morning interior" 
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700 ease-in-out" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7U8wTXHnTYYh4s7FlJ02q7gkqeEID_zgaCxq93KqRMo9s_wBDiB-cfnDDpTN2GINRfBrQvB2iJ8xW4u6zsd0STt79Go8snS_F6eEJSHMgMHK-Ss3c1_v-hxBB4RyRNxvkyaM4seWqYvJA95v0UVlBcQrrbFYRJ9o27RIO4VHzdznOR12-x6-HQnVNiBr_C9X0fRqabmD1ijiGIUZv7Ch_cF86LGrAPwDtWVWzsDdNfFOytjDcWsdu8qXR2H-McHeNCTWeq_ta0CrQ"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="font-headline text-5xl font-bold text-primary tracking-tight leading-tight mb-4 tracking-tighter">Tu Diario de Gratitud</h1>
            <p className="font-body text-secondary text-lg italic max-w-md">Un santuario digital para reconocer la luz en lo cotidiano. Tómate un momento para respirar y reflexionar.</p>
            
            {/* Destellos/Progress Display */}
            <div className="mt-12 bg-surface-container rounded-xl p-6 space-y-6 shadow-sm border border-outline-variant/10">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between font-label text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                    <span>Semanal</span>
                    <span>{progressWeek}% de luz</span>
                  </div>
                  <div className="h-2 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressWeek}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between font-label text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                    <span>Mensual</span>
                    <span>{progressMonth}% de luz</span>
                  </div>
                  <div className="h-2 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressMonth}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between font-label text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                    <span>Anual</span>
                    <span>{progressYear}% de luz</span>
                  </div>
                  <div className="h-2 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressYear}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-outline-variant/20">
                <p className="font-label text-xs uppercase tracking-widest text-secondary font-semibold mb-2">Luz capturada hoy</p>
                <div className="flex gap-2 items-center mb-1">
                  {[1, 2, 3, 4].map(star => {
                    const earned = isValidated ? (score1 + score2) : 0;
                    const filled = star <= earned;
                    return (
                      <span 
                        key={star} 
                        className={`material-symbols-outlined text-4xl transition-all duration-500 ${filled ? 'text-secondary-container' : 'text-outline-variant/50'}`} 
                        style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        stars
                      </span>
                    )
                  })}
                </div>
                <p className="font-headline text-2xl text-primary font-bold">
                  {isValidated ? (score1 + score2) : 0} de 4 destellos
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 font-label text-sm text-secondary hover:text-primary transition-colors group"
              >
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Regresar
              </button>
            </div>
          </div>
        </div>

        {/* Right: The Writing Sanctuary */}
        <div className="lg:col-span-7 space-y-12">
          {/* Daily Reasons Inputs */}
          <section className="space-y-8">
            <div className="space-y-6">
              <label className="font-headline text-2xl text-primary font-semibold block">¿Qué ha traído luz a tu día hoy?</label>
              
              {/* Entry 1 */}
              <div className="bg-surface-container-low p-8 rounded-xl space-y-4 transition-all hover:bg-surface-container border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="font-label text-xs text-secondary-container font-bold bg-secondary py-1 px-3 rounded-full">01</span>
                  <span className="font-label text-sm text-secondary uppercase tracking-wider font-semibold">Primer motivo</span>
                  {isValidated && <span className="ml-auto font-label text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">+{score1} destellos</span>}
                </div>
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 font-body text-xl text-on-surface placeholder:text-outline-variant/50 resize-none h-32 outline-none disabled:opacity-70 disabled:cursor-not-allowed" 
                  placeholder="Hoy agradezco por..."
                  value={entry1}
                  onChange={e => setEntry1(e.target.value)}
                  disabled={isValidated || isLoading}
                ></textarea>
              </div>

              {/* Entry 2 */}
              <div className="bg-surface-container-low p-8 rounded-xl space-y-4 transition-all hover:bg-surface-container border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="font-label text-xs text-secondary-container font-bold bg-secondary py-1 px-3 rounded-full">02</span>
                  <span className="font-label text-sm text-secondary uppercase tracking-wider font-semibold">Segundo motivo</span>
                  {isValidated && <span className="ml-auto font-label text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">+{score2} destellos</span>}
                </div>
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 font-body text-xl text-on-surface placeholder:text-outline-variant/50 resize-none h-32 outline-none disabled:opacity-70 disabled:cursor-not-allowed" 
                  placeholder="También he notado un destello en..."
                  value={entry2}
                  onChange={e => setEntry2(e.target.value)}
                  disabled={isValidated || isLoading}
                ></textarea>
              </div>
            </div>

            {!isValidated && (
              <div className="flex justify-end border-t border-outline-variant/10 pt-8">
                <button 
                  onClick={handleValidate}
                  disabled={isLoading || !user}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label text-sm uppercase tracking-wide font-bold hover:shadow-lg disabled:opacity-50 transition-all hover:bg-primary-container hover:text-on-primary-container flex items-center gap-3"
                >
                  {isLoading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">task_alt</span>}
                  {isLoading ? "Validando tu día..." : "Validar Destellos"}
                </button>
              </div>
            )}

            {/* AI Feedback Area (The Fog Filter) */}
            {(isValidated && reflection) && (
              <div className="bg-surface-container-highest/20 backdrop-blur-3xl p-8 rounded-xl border border-primary/20 flex flex-col md:flex-row gap-8 items-start shadow-xl shadow-primary/5 mt-12 animate-in fade-in duration-1000 slide-in-from-bottom-8">
                <div className="p-4 bg-primary rounded-full text-on-primary shrink-0 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-3xl">{isSilenced ? "volume_off" : "spa"}</span>
                </div>
                <div className="space-y-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
                    <h4 className="font-headline text-xl text-primary font-bold">Reflexión de tu Guía</h4>
                    <button 
                      onClick={toggleSilence} 
                      className="text-secondary font-label text-xs uppercase tracking-widest font-bold px-4 py-2 hover:bg-white rounded-lg transition-colors border border-outline-variant/30"
                    >
                      {isSilenced ? "Reanudar" : "Silenciar"}
                    </button>
                  </div>
                  
                  {isSilenced ? (
                    <p className="text-secondary/60 leading-relaxed font-body italic">La reflexión de tu guía se encuentra silenciada temporalmente. Pulsa reanudar cuando desees leerla.</p>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-on-surface leading-relaxed font-body text-lg whitespace-pre-wrap">{reflection}</p>
                      
                      {hasDeepened && deepReflection && (
                        <div className="pt-6 border-t border-primary/10">
                          <h5 className="font-headline text-sm uppercase tracking-widest text-primary mb-3 font-bold">En Profundidad</h5>
                          <p className="text-on-surface leading-relaxed font-body text-lg whitespace-pre-wrap">{deepReflection}</p>
                        </div>
                      )}

                      {!hasDeepened && (
                        <div className="pt-4">
                          <button 
                            onClick={handleDeepen}
                            disabled={isLoadingDeep}
                            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                          >
                            {isLoadingDeep ? "Reflexionando..." : "Profundizar más"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Decorative Quote */}
          <section className="py-12 mt-20 border-t border-outline-variant/15">
            <blockquote className="font-headline text-3xl italic text-on-surface-variant/40 text-center leading-snug">
              "La gratitud convierte lo que tenemos en suficiente."
            </blockquote>
          </section>
        </div>
      </div>
    </div>
  );
}
