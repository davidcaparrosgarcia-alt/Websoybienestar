import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { api } from "../services/api";
import { getOrMigrateUserProfile } from "../services/userProfile";

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
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const getDailyStr = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function EmotionDiary() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  
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

  // Optimization: Keep summary and refs to avoid redundant fetches
  const [userSummary, setUserSummary] = useState("");
  const [profileRef, setProfileRef] = useState<any>(null);

  // New lean progress indicators based on scores kept in profile (no massive reads)
  const [recentScores, setRecentScores] = useState<{date: string, score: number}[]>([]);

  // Compute progress by summing available scores, using 1 fallback point for unrecorded days if we wanted, 
  // but let's strictly sum actual scores out of the max possible (4 per day).
  const calculateProgress = (days: number) => {
    let totalScore = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
       const d = new Date(today);
       d.setDate(d.getDate() - i);
       const dateStr = getDailyStr(d);
       const record = recentScores.find(s => s.date === dateStr);
       if (record) {
          totalScore += record.score;
       } else {
          // Standard penalty-free grace or 0. If 0 is too brutal, we count 0.
          totalScore += 0; 
       }
    }
    const maxPossible = days * 4;
    return Math.min(100, Math.round((totalScore / maxPossible) * 100)) || 0;
  }

  const progressWeek = calculateProgress(7);
  const progressMonth = calculateProgress(30);
  const progressYear = calculateProgress(365);

  useEffect(() => {
    if (!user) {
      setEntry1("");
      setEntry2("");
      setScore1(0);
      setScore2(0);
      setReflection("");
      setDeepReflection("");
      setHasDeepened(false);
      setIsValidated(false);
      setRecentScores([]);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        const { userData, profileRef: pRef, profileData } = await getOrMigrateUserProfile(user.uid);
        if (!isMounted) return;

        setProfileRef(pRef);
        setUserSummary(profileData.globalUserSummary || "");
        setIsSilenced(userData.diarySilenced === true);
        
        // Setup scores array locally without huge document counts
        const scoresArr = profileData.diaryProfile?.recentScores || [];
        setRecentScores(scoresArr);

        // Just fetch today's document
        const todayStr = getDailyStr(new Date());
        const todayRef = doc(db, 'users', user.uid, 'diaryEntries', todayStr);
        const todayDoc = await getDoc(todayRef);

        if (!isMounted) return;

        if (todayDoc.exists()) {
          const data = todayDoc.data();
          if (data.score1 !== undefined) {
             setIsValidated(true);
             setEntry1(data.entry1 || "");
             setEntry2(data.entry2 || "");
             setScore1(data.score1 || 0);
             setScore2(data.score2 || 0);
             setReflection(data.reflection || "");
             if (data.hasDeepened) {
                setHasDeepened(true);
                setDeepReflection(data.deepReflection || "");
             }
          }
        }
      } catch (err) {
        console.error("Error loading diary data:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

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
      const accumulatedSummary = userSummary;

      // Re-route with fused summary capability
      const data = await api.diaryValidate(entry1, entry2, accumulatedSummary);
      
      const pRef = profileRef || doc(db, 'userProfiles', user.uid);

      const todayStr = getDailyStr(new Date());
      const s1 = typeof data.score1 === 'number' ? data.score1 : 1;
      const s2 = typeof data.score2 === 'number' ? data.score2 : 1;
      const totalDayScore = s1 + s2;

      const newData = {
        entry1, // Tempsaved for UI resilience initially, data retention script scrubs it securely
        entry2,
        score1: s1,
        score2: s2,
        dayScore: totalDayScore,
        reflection: data.reflection || "Excelente esfuerzo por encontrar la luz de hoy. Sigue adelante.",
        hasDeepened: false,
        deepReflection: "",
        createdAt: new Date().toISOString()
      };
      
      const docRef = doc(db, 'users', user.uid, 'diaryEntries', todayStr);
      await setDoc(docRef, newData).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/diaryEntries/${todayStr}`);
      });
      
      // Update scores history
      let updatedScores = [...recentScores];
      updatedScores = updatedScores.filter(s => s.date !== todayStr); // remove if exists
      updatedScores.push({ date: todayStr, score: totalDayScore });
      
      // Sort and truncate to last 365 elements to keep document small
      updatedScores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (updatedScores.length > 365) {
         updatedScores = updatedScores.slice(updatedScores.length - 365);
      }

      await updateDoc(pRef, {
         globalUserSummary: data.newAccumulatedSummary || accumulatedSummary,
         "diaryProfile.recentScores": updatedScores,
         "diaryProfile.lastUsedAt": new Date().toISOString()
      });

      setUserSummary(data.newAccumulatedSummary || accumulatedSummary);
      setRecentScores(updatedScores);
      setScore1(newData.score1);
      setScore2(newData.score2);
      setReflection(newData.reflection);
      setIsValidated(true);
      
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
      const accumulatedSummary = userSummary;
      const pRef = profileRef || doc(db, 'userProfiles', user.uid);

      const data = await api.diaryDeepen(entry1, entry2, reflection, accumulatedSummary);

      const todayStr = getDailyStr(new Date());
      const docRef = doc(db, 'users', user.uid, 'diaryEntries', todayStr);
      await setDoc(docRef, { hasDeepened: true, deepReflection: data.deepReflection }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/diaryEntries/${todayStr}`);
      });
      
      if (data.newAccumulatedSummary) {
         await updateDoc(pRef, {
            globalUserSummary: data.newAccumulatedSummary,
         });
         setUserSummary(data.newAccumulatedSummary);
      }

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
    <div className="flex-1 bg-transparent dark:bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col pt-32 pb-20 px-8 max-w-7xl mx-auto w-full">
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
                      className="text-secondary font-label text-xs uppercase tracking-widest font-bold px-4 py-2 hover:bg-surface-container rounded-lg transition-colors border border-outline-variant/30"
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
