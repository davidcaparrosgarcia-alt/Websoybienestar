import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, deleteField } from "firebase/firestore";
import { api } from "../services/api";
import { getOrMigrateUserProfile } from "../services/userProfile";
import SEO from "../components/SEO";

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
  const [entry1Saved, setEntry1Saved] = useState(false);
  const [entry2Saved, setEntry2Saved] = useState(false);
  const [hasDeepened, setHasDeepened] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);
  
  const [validateError, setValidateError] = useState<string | null>(null);
  const [deepenError, setDeepenError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDeep, setIsLoadingDeep] = useState(false);

  // Voice recording and transcription states
  const [recordingState1, setRecordingState1] = useState<"initial" | "recording" | "transcribing" | "reviewing">("initial");
  const [recordingState2, setRecordingState2] = useState<"initial" | "recording" | "transcribing" | "reviewing">("initial");
  const [recordingError1, setRecordingError1] = useState<string | null>(null);
  const [recordingError2, setRecordingError2] = useState<string | null>(null);

  const [originalText1, setOriginalText1] = useState("");
  const [originalText2, setOriginalText2] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isStoppingRef = useRef(false);

  const supportsMediaRecorderAudio = () => {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    );
  };

  const cleanupMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  useEffect(() => {
    return () => {
      cleanupMic();
    };
  }, []);

  const startRecording = async (fieldNum: 1 | 2) => {
    if (!supportsMediaRecorderAudio()) {
      const errMsg = "El micrófono no está soportado en este navegador.";
      if (fieldNum === 1) setRecordingError1(errMsg);
      else setRecordingError2(errMsg);
      return;
    }

    if (fieldNum === 1) {
      setOriginalText1(entry1);
      setRecordingError1(null);
      setRecordingState1("recording");
    } else {
      setOriginalText2(entry2);
      setRecordingError2(null);
      setRecordingState2("recording");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = "audio/webm";
      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          mimeType = "audio/aac";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;
      isStoppingRef.current = false;

    } catch (e: any) {
      console.error("Could not start microphone recording", e);
      cleanupMic();
      const errMsg = "Permiso de micrófono denegado o error al iniciar la grabación.";
      if (fieldNum === 1) {
        setRecordingState1("initial");
        setRecordingError1(errMsg);
      } else {
        setRecordingState2("initial");
        setRecordingError2(errMsg);
      }
    }
  };

  const stopRecording = async (fieldNum: 1 | 2) => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    if (fieldNum === 1) {
      setRecordingState1("transcribing");
    } else {
      setRecordingState2("transcribing");
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupMic();
      if (fieldNum === 1) {
        setRecordingState1("initial");
        setRecordingError1("Grabación inactiva.");
      } else {
        setRecordingState2("initial");
        setRecordingError2("Grabación inactiva.");
      }
      return;
    }

    const mimeType = recorder.mimeType || "audio/webm";

    const stopPromise = new Promise<Blob>((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve(new Blob(audioChunksRef.current, { type: mimeType }));
        }
      };
      recorder.onstop = done;
      setTimeout(done, 1000);
    });

    try {
      recorder.stop();
    } catch (e) {
      console.error("Error stopping MediaRecorder", e);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      const blob = await stopPromise;
      if (blob.size === 0) {
        cleanupMic();
        if (fieldNum === 1) {
          setRecordingState1("initial");
          setRecordingError1("Grabación de audio vacía.");
        } else {
          setRecordingState2("initial");
          setRecordingError2("Grabación de audio vacía.");
        }
        return;
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1] || "";
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);

      const base64Data = await base64Promise;
      const res = await api.transcribeAudio(base64Data, mimeType);

      if (res && res.text) {
        const transcribed = res.text.trim();
        if (transcribed) {
          if (fieldNum === 1) {
            const previousText = originalText1.trim();
            const finalText = previousText ? `${previousText} ${transcribed}` : transcribed;
            setEntry1(finalText);
            setRecordingState1("reviewing");
          } else {
            const previousText = originalText2.trim();
            const finalText = previousText ? `${previousText} ${transcribed}` : transcribed;
            setEntry2(finalText);
            setRecordingState2("reviewing");
          }
        } else {
          throw new Error("La transcripción no devolvió ningún texto.");
        }
      } else {
        throw new Error("Error en la respuesta del servicio de transcripción.");
      }

    } catch (err: any) {
      console.error("Audio transcription error", err);
      const errMsg = err?.message?.includes("límite diario")
        ? "Has alcanzado el límite diario de transcripciones por voz. Puedes continuar escribiendo manualmente."
        : "No hemos podido transcribir tu audio. Puedes reintentar o escribir manualmente.";
      if (fieldNum === 1) {
        setRecordingState1("initial");
        setRecordingError1(errMsg);
      } else {
        setRecordingState2("initial");
        setRecordingError2(errMsg);
      }
    } finally {
      cleanupMic();
    }
  };

  const saveTranscription = (fieldNum: 1 | 2) => {
    if (fieldNum === 1) {
      setRecordingState1("initial");
      setOriginalText1("");
    } else {
      setRecordingState2("initial");
      setOriginalText2("");
    }
  };

  const cancelTranscription = (fieldNum: 1 | 2) => {
    if (fieldNum === 1) {
      setEntry1(originalText1);
      setRecordingState1("initial");
      setOriginalText1("");
    } else {
      setEntry2(originalText2);
      setRecordingState2("initial");
      setOriginalText2("");
    }
  };

  const isAnyRecordingOrTranscribing = 
    recordingState1 === "recording" || 
    recordingState1 === "transcribing" || 
    recordingState2 === "recording" || 
    recordingState2 === "transcribing";

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
      setEntry1Saved(false);
      setEntry2Saved(false);
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
          const hasEntry1 = !!(data.entry1 && data.entry1.trim());
          const hasEntry2 = !!(data.entry2 && data.entry2.trim());

          setEntry1(data.entry1 || "");
          setEntry2(data.entry2 || "");

          const validScore1 = hasEntry1 && typeof data.score1 === "number" ? data.score1 : 0;
          const validScore2 = hasEntry2 && typeof data.score2 === "number" ? data.score2 : 0;

          setScore1(validScore1);
          setScore2(validScore2);

          setEntry1Saved(hasEntry1);
          setEntry2Saved(hasEntry2);

          setIsValidated(hasEntry1 || hasEntry2);
          setReflection(data.reflection || "");
          if (data.hasDeepened) {
            setHasDeepened(true);
            setDeepReflection(data.deepReflection || "");
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
    setValidateError(null);
    if (!user) {
      setValidateError("Por favor, regístrate o inicia sesión para usar el diario.");
      return;
    }
    
    const send1 = entry1Saved ? "" : entry1;
    const send2 = entry2Saved ? "" : entry2;

    if (!send1.trim() && !send2.trim()) {
      setValidateError("Por favor, detalla al menos un nuevo motivo de gratitud antes de validar.");
      return;
    }
    setIsLoading(true);
    try {
      const accumulatedSummary = userSummary;

      // Re-route with fused summary capability
      const data = await api.diaryValidate(send1, send2, accumulatedSummary);
      
      const pRef = profileRef || doc(db, 'userProfiles', user.uid);
      const todayStr = getDailyStr(new Date());

      const isE1Saved = entry1Saved || !!send1.trim();
      const isE2Saved = entry2Saved || !!send2.trim();

      const s1 = isE1Saved ? (entry1Saved ? score1 : (typeof data.score1 === 'number' ? data.score1 : (send1.trim() ? 1 : 0))) : 0;
      const s2 = isE2Saved ? (entry2Saved ? score2 : (typeof data.score2 === 'number' ? data.score2 : (send2.trim() ? 1 : 0))) : 0;

      const totalDayScore = (isE1Saved ? s1 : 0) + (isE2Saved ? s2 : 0);

      // merge old reflection if exists and new is generated
      let newReflection = reflection;
      if (data.reflection && data.reflection.trim()) {
        const incoming = data.reflection.trim();
        if (reflection && reflection.trim()) {
          if (!reflection.includes(incoming)) {
            newReflection = `${reflection.trim()}\n\n${incoming}`;
          }
        } else {
          newReflection = incoming;
        }
      }
      if (!newReflection) {
        newReflection = "Excelente esfuerzo por encontrar la luz de hoy. Sigue adelante.";
      }

      const newData: any = {
        dayScore: totalDayScore,
        reflection: newReflection,
        createdAt: new Date().toISOString()
      };

      if (isE1Saved) {
        newData.entry1 = entry1;
        newData.score1 = s1;
      } else {
        newData.score1 = deleteField();
      }

      if (isE2Saved) {
        newData.entry2 = entry2;
        newData.score2 = s2;
      } else {
        newData.score2 = deleteField();
      }

      const docRef = doc(db, 'users', user.uid, 'diaryEntries', todayStr);
      await setDoc(docRef, newData, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/diaryEntries/${todayStr}`);
      });
      
      // Update scores history
      let updatedScores = [...recentScores];
      updatedScores = updatedScores.filter(s => s.date !== todayStr); // remove if exists
      updatedScores.push({ date: todayStr, score: totalDayScore });
      
      // Sort and truncate to last 365 elements
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
      setScore1(isE1Saved ? s1 : 0);
      setScore2(isE2Saved ? s2 : 0);
      setReflection(newReflection);
      setEntry1Saved(isE1Saved);
      setEntry2Saved(isE2Saved);
      setIsValidated(true);
      
    } catch (e: any) {
      console.error("AI or Firestore Error:", e);
      setValidateError("No hemos podido completar esta reflexión en este momento. Puedes volver a intentarlo.");
    } finally {
      setIsLoading(false);
    }
  };

  const isTesterUser = user?.email?.toLowerCase() === "davidcaparrosgarcia@gmail.com";

  const handleResetTodayTester = async () => {
    if (!user || !isTesterUser) return;
    const confirmed = window.confirm("¿Seguro que deseas reiniciar el diario de hoy para hacer pruebas?");
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const todayStr = getDailyStr(new Date());

      // 1. Delete today's diaryEntries document
      const todayRef = doc(db, 'users', user.uid, 'diaryEntries', todayStr);
      await deleteDoc(todayRef).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/diaryEntries/${todayStr}`);
      });

      // 2. Remove today's score from recentScores in profile
      const pRef = profileRef || doc(db, 'userProfiles', user.uid);
      let updatedScores = [...recentScores];
      updatedScores = updatedScores.filter(s => s.date !== todayStr);

      await updateDoc(pRef, {
        "diaryProfile.recentScores": updatedScores,
        "diaryProfile.lastUsedAt": new Date().toISOString()
      }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `userProfiles/${user.uid}`);
      });

      // 3. Reset local state
      setRecentScores(updatedScores);
      setEntry1("");
      setEntry2("");
      setScore1(0);
      setScore2(0);
      setReflection("");
      setDeepReflection("");
      setEntry1Saved(false);
      setEntry2Saved(false);
      setHasDeepened(false);
      setIsValidated(false);
      setValidateError(null);
      setDeepenError(null);
      setRecordingState1("initial");
      setRecordingState2("initial");
      setRecordingError1(null);
      setRecordingError2(null);
      setOriginalText1("");
      setOriginalText2("");

    } catch (err) {
      console.error("Error resetting tester daily entry:", err);
      alert("Error al reiniciar el diario de hoy.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepen = async () => {
    if (hasDeepened || !isValidated || !user) return;
    setDeepenError(null);
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
    } catch (e: any) {
      console.error(e);
      setDeepenError("No hemos podido profundizar en esta reflexión en este momento. Puedes volver a intentarlo.");
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
    <>
      <SEO title="Diario emocional privado | SoyBienestar" description="Herramienta privada de diario emocional dentro de SoyBienestar.es." canonicalPath="/emotion-diary" noIndex={true} />
    <div className="flex-1 bg-transparent dark:bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col pt-20 md:pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Tester reset button */}
      {isTesterUser && (
        <div className="mb-6 flex justify-start">
          <button
            onClick={handleResetTodayTester}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            title="Borra únicamente la entrada del día de hoy para pruebas"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Reiniciar diario de hoy (tester)
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Image & Title Section */}
        <div className="lg:col-span-5 relative">
          <div className="md:sticky md:top-32">
            <div className="mb-12 overflow-hidden rounded-xl">
              <img 
                alt="Serene morning interior" 
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700 ease-in-out" 
                src="/images/habitación_diario_gratitud.jpg"
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
                  {entry1Saved && <span className="ml-auto font-label text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">+{score1} destellos</span>}
                </div>
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 font-body text-xl text-on-surface placeholder:text-outline-variant/50 resize-none h-32 outline-none disabled:opacity-70 disabled:cursor-not-allowed" 
                  placeholder="Hoy agradezco por..."
                  value={entry1}
                  onChange={e => {
                    setEntry1(e.target.value);
                    if (validateError) setValidateError(null);
                  }}
                  disabled={entry1Saved || isLoading || recordingState1 === "recording" || recordingState1 === "transcribing" || recordingState1 === "reviewing"}
                ></textarea>

                {!entry1Saved && (
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-2">
                    {/* Status Message */}
                    <div className="flex items-center gap-2 text-sm min-h-[36px]">
                      {recordingState1 === "recording" && (
                        <span className="text-error flex items-center gap-1.5 font-medium animate-pulse">
                          <span className="w-2.5 h-2.5 bg-error rounded-full inline-block"></span>
                          Grabando tu voz...
                        </span>
                      )}
                      {recordingState1 === "transcribing" && (
                        <span className="text-secondary flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                          Transcribiendo...
                        </span>
                      )}
                      {recordingError1 && (
                        <span className="text-error text-xs font-medium bg-error/10 px-3 py-1 rounded border border-error/20 max-w-[200px] sm:max-w-none">
                          {recordingError1}
                        </span>
                      )}
                    </div>

                    {/* Microphone control action */}
                    <div className="flex items-center gap-2">
                      {recordingState1 === "initial" && (
                        <button
                          type="button"
                          onClick={() => startRecording(1)}
                          disabled={isAnyRecordingOrTranscribing || isLoading}
                          className="flex items-center justify-center p-2 rounded-full text-secondary hover:text-primary hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Grabar por voz"
                        >
                          <span className="material-symbols-outlined text-2xl">mic</span>
                        </button>
                      )}

                      {recordingState1 === "recording" && (
                        <button
                          type="button"
                          onClick={() => stopRecording(1)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-full text-xs uppercase tracking-wider font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">stop</span>
                          STOP
                        </button>
                      )}

                      {recordingState1 === "transcribing" && (
                        <button
                          type="button"
                          disabled
                          className="flex items-center justify-center p-2 rounded-full text-outline-variant disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                        </button>
                      )}

                      {recordingState1 === "reviewing" && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveTranscription(1)}
                            className="px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-xs uppercase tracking-wider font-bold transition-all shadow-sm"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelTranscription(1)}
                            className="px-3 py-1.5 bg-outline-variant/20 text-secondary hover:bg-outline-variant/30 rounded-lg text-xs uppercase tracking-wider font-bold transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Entry 2 */}
              <div className="bg-surface-container-low p-8 rounded-xl space-y-4 transition-all hover:bg-surface-container border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="font-label text-xs text-secondary-container font-bold bg-secondary py-1 px-3 rounded-full">02</span>
                  <span className="font-label text-sm text-secondary uppercase tracking-wider font-semibold">Segundo motivo</span>
                  {entry2Saved && <span className="ml-auto font-label text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">+{score2} destellos</span>}
                </div>
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 font-body text-xl text-on-surface placeholder:text-outline-variant/50 resize-none h-32 outline-none disabled:opacity-70 disabled:cursor-not-allowed" 
                  placeholder="También he notado un destello en..."
                  value={entry2}
                  onChange={e => {
                    setEntry2(e.target.value);
                    if (validateError) setValidateError(null);
                  }}
                  disabled={entry2Saved || isLoading || recordingState2 === "recording" || recordingState2 === "transcribing" || recordingState2 === "reviewing"}
                ></textarea>

                {!entry2Saved && (
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-2">
                    {/* Status Message */}
                    <div className="flex items-center gap-2 text-sm min-h-[36px]">
                      {recordingState2 === "recording" && (
                        <span className="text-error flex items-center gap-1.5 font-medium animate-pulse">
                          <span className="w-2.5 h-2.5 bg-error rounded-full inline-block"></span>
                          Grabando tu voz...
                        </span>
                      )}
                      {recordingState2 === "transcribing" && (
                        <span className="text-secondary flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                          Transcribiendo...
                        </span>
                      )}
                      {recordingError2 && (
                        <span className="text-error text-xs font-medium bg-error/10 px-3 py-1 rounded border border-error/20 max-w-[200px] sm:max-w-none">
                          {recordingError2}
                        </span>
                      )}
                    </div>

                    {/* Microphone control action */}
                    <div className="flex items-center gap-2">
                      {recordingState2 === "initial" && (
                        <button
                          type="button"
                          onClick={() => startRecording(2)}
                          disabled={isAnyRecordingOrTranscribing || isLoading}
                          className="flex items-center justify-center p-2 rounded-full text-secondary hover:text-primary hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Grabar por voz"
                        >
                          <span className="material-symbols-outlined text-2xl">mic</span>
                        </button>
                      )}

                      {recordingState2 === "recording" && (
                        <button
                          type="button"
                          onClick={() => stopRecording(2)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-full text-xs uppercase tracking-wider font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">stop</span>
                          STOP
                        </button>
                      )}

                      {recordingState2 === "transcribing" && (
                        <button
                          type="button"
                          disabled
                          className="flex items-center justify-center p-2 rounded-full text-outline-variant disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                        </button>
                      )}

                      {recordingState2 === "reviewing" && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveTranscription(2)}
                            className="px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-xs uppercase tracking-wider font-bold transition-all shadow-sm"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelTranscription(2)}
                            className="px-3 py-1.5 bg-outline-variant/20 text-secondary hover:bg-outline-variant/30 rounded-lg text-xs uppercase tracking-wider font-bold transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(entry1Saved && entry2Saved) ? (
              <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl text-primary font-body text-center shadow-sm mt-8 space-y-1">
                <p className="font-semibold text-base sm:text-lg">
                  Ya has completado tus dos agradecimientos de hoy.
                </p>
                <p className="text-sm sm:text-base text-primary/80">
                  Mañana podrás añadir nuevos motivos de gratitud.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-3 border-t border-outline-variant/10 pt-8">
                {validateError && (
                  <div className="w-full bg-error/10 text-error text-sm font-body p-3 rounded-lg border border-error/20">
                    {validateError}
                  </div>
                )}
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
                        <div className="pt-4 space-y-3">
                          {deepenError && (
                            <div className="bg-error/10 text-error text-sm font-body p-3 rounded-lg border border-error/20">
                              {deepenError}
                            </div>
                          )}
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
    </>
  );
}
