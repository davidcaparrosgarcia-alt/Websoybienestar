import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import Markdown from "react-markdown";
import SEO from "../components/SEO";
import ProgramPlansSection from "../components/ProgramPlansSection";
import { userCache } from "../lib/userCache";

export default function DossierEspejo() {
  const navigate = useNavigate();
  const location = useLocation();
  const testerPreviewParam = new URLSearchParams(location.search).get("testerPreview") === "1";
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [verySlowLoad, setVerySlowLoad] = useState(false);
  
  const [dossierState, setDossierState] = useState<any>(null);
  
  const [dossierAvailable, setDossierAvailable] = useState(false);
  const [hasAccessCode, setHasAccessCode] = useState(false);
  const [unlocked, setUnlocked] = useState(userCache.unlocked);
  const [latestDossier, setLatestDossier] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedPlanImage, setSelectedPlanImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!loading) {
      setSlowLoad(false);
      setVerySlowLoad(false);
      return;
    }

    const timer1 = window.setTimeout(() => setSlowLoad(true), 2000);
    const timer2 = window.setTimeout(() => setVerySlowLoad(true), 8000);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [loading]);

  useEffect(() => {
    const auth = getAuth();
    
    const checkAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const isTester = user.email === "davidcaparrosgarcia@gmail.com";
        const isDemo = isTester && testerPreviewParam;

        if (isDemo) {
          setUnlocked(true);
          setLoading(false);
        } else {
          setLoading(true);
        }

        try {
          const loadStart = performance.now();
          const token = await user.getIdToken();
          const response = await fetch("/api/dossier-espejo-state", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();

          if (isTester) {
            console.log("[DOSSIER STATE DEBUG]", {
              elapsedMs: Math.round(performance.now() - loadStart),
              dossierAvailable: data.dossierAvailable,
              hasAccessCode: data.hasAccessCode,
              dossierViewed: data.dossierViewed,
              questionnaireStatus: data.questionnaireStatus
            });
          }

          if (data.success) {
            setDossierState(data);
            setDossierAvailable(data.dossierAvailable);
            setHasAccessCode(data.hasAccessCode);
            setLatestDossier(data.latestDossier);
            setAudioUrl(data.audioUrl || null);
            
            if (data.dossierViewed) {
               setUnlocked(true);
               userCache.unlocked = true;
            }
          }
        } catch (error) {
          console.error("Error fetching dossier state", error);
        } finally {
          if (!isDemo) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => checkAuth();
  }, [testerPreviewParam]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        {slowLoad && (
          <p className="mt-4 text-sm text-on-surface-variant font-medium animate-in fade-in">
            Estamos recuperando tu dossier. Puede tardar unos segundos.
          </p>
        )}
        {verySlowLoad && (
          <p className="mt-2 text-sm text-on-surface-variant font-medium animate-in fade-in max-w-sm text-center">
            Si la espera se alarga, recarga la página o vuelve a intentarlo en unos minutos.
          </p>
        )}
      </div>
    );
  }

  const auth = getAuth();
  const isTester = auth.currentUser?.email === "davidcaparrosgarcia@gmail.com";
  const testerPreview = isTester && new URLSearchParams(location.search).get("testerPreview") === "1";
  const isDemoMode = (!dossierState?.hasLatestDossier && isTester) || testerPreview;

  if (!hasAccessCode && !testerPreview) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <h2 className="font-headline font-bold text-3xl text-primary mb-4 text-center">Dossier Espejo personalizado</h2>
        <div className="bg-surface-container rounded-2xl p-8 max-w-lg text-center shadow-sm">
          <p className="text-on-surface-variant font-medium">
            Todavía no se ha generado tu clave personal. Se creará al solicitar el Cuestionario Espejo.
          </p>
          <button 
            onClick={() => navigate("/report")}
            className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-full font-label font-bold text-sm hover:bg-primary-container hover:text-primary transition-colors"
          >
            Volver a mi lectura
          </button>
        </div>
      </div>
    );
  }

  if (!dossierAvailable && !isTester && !testerPreview) {
    return (
       <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <h2 className="font-headline font-bold text-3xl text-primary mb-4 text-center">Dossier Espejo personalizado</h2>
        <div className="bg-surface-container rounded-2xl p-8 max-w-lg text-center shadow-sm border border-outline-variant/20">
          <h3 className="font-headline font-bold text-xl text-secondary mb-3">Tu Dossier Espejo todavía no está disponible</h3>
          <p className="text-on-surface-variant mb-6 text-sm">
            Cuando completes el Cuestionario Espejo y el equipo prepare tu devolución, podrás acceder desde aquí con el código que recibiste en el enlace del cuestionario.
          </p>
          <button 
            onClick={() => navigate("/report")}
            className="px-6 py-2 bg-primary text-on-primary rounded-full font-label font-bold text-sm hover:bg-primary-container hover:text-primary transition-colors"
          >
            Volver a mi lectura
          </button>
        </div>
      </div>
    );
  }

  const handleUnlock = async () => {
    setErrorMsg("");
    const normalizedInput = accessCodeInput.trim().toUpperCase();

    if (!isDemoMode) {
      setUnlocking(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("No user");

        const token = await user.getIdToken();
        const response = await fetch("/api/dossier-espejo-verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ accessCode: normalizedInput })
        });
        
        const data = await response.json();
        
        if (isTester) {
          console.log("[DOSSIER VERIFY DEBUG]", {
            status: response.status,
            ok: response.ok,
            hasCandidates: data.hasCandidates
          });
        }

        if (response.ok && data.success) {
          setUnlocked(true);
          setLatestDossier(data.latestDossier);
          userCache.unlocked = true;
        } else {
          setErrorMsg(data.error || "La clave no coincide. Revisa el código personal que recibiste con tu enlace.");
        }
      } catch (error) {
        console.error("Error verifying access code", error);
        setErrorMsg("Error de conexión. Intenta de nuevo.");
      } finally {
        setUnlocking(false);
      }
    } else {
      // Demo mode
      if (normalizedInput === "DEMO") {
        setUnlocked(true);
      } else {
        setErrorMsg("La clave no coincide. Revisa el código personal que recibiste con tu enlace.");
      }
    }
  };

  if (!unlocked && !testerPreview) {
    return (
       <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <h2 className="font-headline font-bold text-3xl text-primary mb-4 text-center">Dossier Espejo personalizado</h2>
        <p className="text-on-surface-variant font-label text-center mb-8 max-w-xl">
           Introduce tu clave personal para acceder a tu dossier estructurado. 
           {isDemoMode && <span className="block mt-2 font-bold text-secondary">MODO DEMO TESTER: Ingresa el código "DEMO" para ver el placeholder.</span>}
        </p>

        <div className="bg-surface-container-high rounded-2xl p-8 max-w-sm w-full flex flex-col gap-4 shadow-sm border border-outline-variant/30">
           <div>
             <label htmlFor="codigoAcceso" className="block text-sm font-label font-bold text-on-surface mb-1">Código personal de 4 caracteres</label>
             <input 
               id="codigoAcceso"
               type="text" 
               value={accessCodeInput}
               onChange={e => setAccessCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
               placeholder="P. ej. SR3V"
               className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-on-surface font-mono tracking-widest text-center text-lg focus:outline-none focus:border-primary uppercase"
               maxLength={4}
             />
           </div>
           
           {errorMsg && (
             <div className="text-error text-xs font-bold text-center bg-error-container text-on-error-container p-2 rounded-lg">
               {errorMsg}
             </div>
           )}

           <button 
             onClick={handleUnlock}
             disabled={accessCodeInput.trim().length < 4 || unlocking}
             className="w-full bg-primary text-on-primary py-3 rounded-full font-label font-bold hover:bg-primary-container hover:text-primary transition-colors disabled:bg-outline-variant/30 disabled:text-on-surface-variant/50"
           >
             {unlocking ? "Verificando..." : "Desbloquear"}
           </button>
        </div>
        
        <button 
           onClick={() => navigate("/report")}
           className="mt-6 text-sm font-label font-bold text-on-surface-variant hover:text-primary underline decoration-1 underline-offset-4"
        >
           Volver atrás
        </button>
      </div>
    );
  }

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  const getDossierContent = () => {
    if (!latestDossier) {
        if (isDemoMode) {
            return "Esta es una vista tester provisional del Dossier Espejo. Aquí aparecerá la devolución final enviada desde Cuestionario Espejo cuando el equipo humano complete la revisión.";
        }
        return null;
    }
    if (typeof latestDossier === 'string') {
        return latestDossier;
    }
    if (typeof latestDossier === 'object') {
        if (latestDossier.finalConclusion) return latestDossier.finalConclusion;
        if (latestDossier.conclusion) return latestDossier.conclusion;
        if (latestDossier.text) return latestDossier.text;
        if (latestDossier.content) return latestDossier.content;
        
        if (latestDossier.tu_lectura_principal) {
            let combined = `### Tu lectura principal\n\n${latestDossier.tu_lectura_principal}\n\n`;
            if (latestDossier.aspectos_con_mas_peso) combined += `### Aspectos con más peso\n\n${latestDossier.aspectos_con_mas_peso}\n\n`;
            if (latestDossier.recursos_sugeridos) combined += `### Recursos sugeridos\n\n${latestDossier.recursos_sugeridos}\n\n`;
            if (latestDossier.proximo_paso) combined += `### Próximo paso\n\n${latestDossier.proximo_paso}\n\n`;
            return combined;
        }

        return "```json\n" + JSON.stringify(latestDossier, null, 2) + "\n```";
    }
    return null;
  };

  // Render Dossier
  return (
    <>
      <SEO title="Dossier Espejo personalizado | SoyBienestar" description="Acceso privado al Dossier Espejo personalizado de SoyBienestar.es." canonicalPath="/dossier-espejo" noIndex={true} />
    <div className="flex-grow flex flex-col items-center w-full max-w-screen-2xl mx-auto px-6 md:px-12 py-16 space-y-32">
      {/* Hero Section */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 space-y-8 max-w-xl">
          <h1 className="font-headline text-5xl md:text-6xl text-primary tracking-tight leading-tight">
            Tu Reflejo.<br/>
            <span className="text-primary/70 italic font-light">Tu Historia.</span>
          </h1>
          <p className="font-body tracking-wide text-lg text-on-surface-variant leading-relaxed">
            Bienvenido a tu Dossier Espejo. Este espacio recoge la devolución preparada a partir de tu Consulta Gratuita y del Cuestionario Espejo. Tómate tu tiempo. Aquí no hay juicios, solo claridad para mirar el camino que tienes por delante.
          </p>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed italic text-primary/80">
            "Hecho para ti. Contigo."
          </p>
        </div>
        <div className="order-1 lg:order-2 relative rounded-[2rem] overflow-hidden aspect-[4/3] bg-surface-container-low shadow-sm">
          <img alt="Dossier Espejo" className="w-full h-full object-cover" src="/images/fondo_dosier.jpg"/>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
        </div>
      </section>

      {/* Detailed Report Section */}
      <section className="w-full relative py-8">
        <div className="absolute inset-0 bg-surface-container-low -skew-y-1 transform origin-top-left z-0 rounded-[3rem] overflow-hidden shadow-sm border border-outline-variant/20">
          <img src="/images/fondo_diario.jpg" alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          <div className="absolute inset-0 bg-white/[0.02] dark:bg-black/[0.02] pointer-events-none"></div>
        </div>
        <div className="relative z-10 bg-white/90 dark:bg-surface-container-lowest/90 backdrop-blur-md shadow-2xl rounded-[2rem] p-8 md:p-16 max-w-4xl mx-auto border border-outline-variant/15">
          <div className="flex flex-col md:flex-row justify-between md:items-start mb-12 border-b border-outline-variant/20 pb-8 gap-6">
            <div>
              <p className="font-label text-sm text-primary tracking-widest uppercase mb-2">Conclusiones personalizadas</p>
              <h2 className="font-headline text-3xl md:text-4xl text-primary">Dossier Espejo Personal</h2>
            </div>
            
            <button 
              onClick={toggleAudio}
              disabled={!audioUrl}
              className={`flex shrink-0 items-center space-x-3 bg-surface-container-lowest hover:bg-surface-container transition-colors border border-outline-variant/20 rounded-xl px-5 py-3 group ${!audioUrl ? 'opacity-50 cursor-not-allowed' : 'text-primary'}`}
            >
              <span className="font-label font-medium text-sm">{!audioUrl ? "Audio no disponible" : (isAudioPlaying ? "Pausar audio" : "Escuchar audio")}</span>
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                {audioUrl ? (isAudioPlaying ? "pause_circle" : "volume_up") : "volume_off"}
              </span>
            </button>

            {audioUrl && (
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsAudioPlaying(false)} 
                className="hidden" 
              />
            )}
          </div>
          
          <div className="space-y-8 font-body text-lg text-on-surface-variant leading-relaxed">
            <div className="prose prose-slate dark:prose-invert max-w-none text-on-surface whitespace-pre-wrap prose-p:mb-6 prose-p:leading-relaxed">
              {getDossierContent() ? (
                <Markdown>{getDossierContent() as string}</Markdown>
              ) : (
                <div className="space-y-12 opacity-50 select-none">
                  <section>
                    <div className="h-8 bg-outline-variant/30 rounded w-1/3 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-outline-variant/20 rounded w-full mb-2"></div>
                    <div className="h-4 bg-outline-variant/20 rounded w-full mb-2"></div>
                    <div className="h-4 bg-outline-variant/20 rounded w-5/6"></div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProgramPlansSection />
    </div>
    </>
  );
}
