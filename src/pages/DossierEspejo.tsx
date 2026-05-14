import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import Markdown from "react-markdown";
import SEO from "../components/SEO";

export default function DossierEspejo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedPlanImage, setSelectedPlanImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    
    // Auth observer would be better but we rely on ProtectedRoute which ensures user is logged in
    const checkAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const profileDocRef = doc(db, 'userProfiles', user.uid);

          const [userDoc, profileDoc] = await Promise.all([
            getDoc(userDocRef),
            getDoc(profileDocRef)
          ]);

          const uData = userDoc.data() || {};
          const pData = profileDoc.data() || {};

          setUserData(uData);
          setProfileData(pData);

          // If they already viewed it, unlock automatically
          const dossierViewed = !!uData.dossierViewedAt || !!pData.dossierViewedAt;
          if (dossierViewed) {
             setUnlocked(true);
          }

        } catch (error) {
          console.error("Error fetching dossier data", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 w-full bg-surface flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const code = userData?.personalAccessCode || profileData?.personalAccessCode;
  const latestDossier = userData?.latestDossier || profileData?.latestDossier;
  const dossierAvailable = !!userData?.dossierAvailableAt || !!profileData?.dossierAvailableAt || !!latestDossier;
  const auth = getAuth();
  const isTester = auth.currentUser?.email === "davidcaparrosgarcia@gmail.com";
  const testerPreview = isTester && new URLSearchParams(location.search).get("testerPreview") === "1";
  const effectiveCode = code || (isTester ? "DEMO25" : "");

  if (!effectiveCode && !testerPreview) {
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

  const isDemoMode = (!latestDossier && isTester) || testerPreview;

  const handleUnlock = async () => {
    setErrorMsg("");
    const normalizedInput = accessCodeInput.trim().toUpperCase();
    const normalizedCode = effectiveCode.trim().toUpperCase();

    if (normalizedInput === normalizedCode) {
      setUnlocked(true);
      if (!isDemoMode) {
        // Ensure dossierViewedAt is saved
        const userDocRef = doc(getFirestore(), 'users', auth.currentUser!.uid);
        const userProfRef = doc(getFirestore(), 'userProfiles', auth.currentUser!.uid);
        
        const ts = Date.now();
        try {
          if (!userData.dossierViewedAt) {
             await updateDoc(userDocRef, { dossierViewedAt: ts });
          }
          if (!profileData.dossierViewedAt) {
             await updateDoc(userProfRef, { dossierViewedAt: ts });
          }
        } catch (e) {
          console.error("Error setting dossierViewedAt", e);
        }
      }
    } else {
      setErrorMsg("La clave no coincide. Revisa el código personal que recibiste con tu enlace.");
    }
  };

  if (!unlocked && !testerPreview) {
    return (
       <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <h2 className="font-headline font-bold text-3xl text-primary mb-4 text-center">Dossier Espejo personalizado</h2>
        <p className="text-on-surface-variant font-label text-center mb-8 max-w-xl">
           Introduce tu clave personal para acceder a tu dossier estructurado. 
           {isDemoMode && <span className="block mt-2 font-bold text-secondary">MODO DEMO TESTER: Ingresa el código "{effectiveCode}" para ver el placeholder.</span>}
        </p>

        <div className="bg-surface-container-high rounded-2xl p-8 max-w-sm w-full flex flex-col gap-4 shadow-sm border border-outline-variant/30">
           <div>
             <label htmlFor="codigoAcceso" className="block text-sm font-label font-bold text-on-surface mb-1">Código personal de 6 caracteres</label>
             <input 
               id="codigoAcceso"
               type="text" 
               value={accessCodeInput}
               onChange={e => setAccessCodeInput(e.target.value.toUpperCase())}
               placeholder="P. ej. K7M4Q2"
               className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-on-surface font-mono tracking-widest text-center text-lg focus:outline-none focus:border-primary uppercase"
               maxLength={6}
             />
           </div>
           
           {errorMsg && (
             <div className="text-error text-xs font-bold text-center bg-error-container text-on-error-container p-2 rounded-lg">
                {errorMsg}
             </div>
           )}

           <button 
             onClick={handleUnlock}
             disabled={accessCodeInput.length < 6}
             className="w-full bg-primary text-on-primary py-3 rounded-full font-label font-bold hover:bg-primary-container hover:text-primary transition-colors disabled:bg-outline-variant/30 disabled:text-on-surface-variant/50"
           >
             Desbloquear
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

  const audioUrl = userData?.latestQuestionnaireAudioConclusion ||
    profileData?.latestQuestionnaireAudioConclusion ||
    userData?.latestQuestionnaireAudioConclusionUrl ||
    profileData?.latestQuestionnaireAudioConclusionUrl ||
    userData?.audioConclusion ||
    profileData?.audioConclusion ||
    userData?.latestDossierAudio ||
    profileData?.latestDossierAudio ||
    userData?.latestDossierAudioUrl ||
    profileData?.latestDossierAudioUrl;

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
          <button 
            onClick={() => navigate("/report")}
            className="mt-4 px-6 py-2 border border-outline-variant/30 rounded-full text-on-surface-variant font-label font-bold text-sm hover:border-primary hover:text-primary transition-colors inline-block"
          >
            Volver a mi lectura
          </button>
        </div>
        <div className="order-1 lg:order-2 relative rounded-[2rem] overflow-hidden aspect-[4/3] bg-surface-container-low shadow-sm">
          <img alt="Dossier Espejo" className="w-full h-full object-cover" src="/images/fondo_dosier.jpg"/>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
        </div>
      </section>

      {/* Detailed Report Section */}
      <section className="w-full relative py-8">
        <div className="absolute inset-0 bg-surface-container-low -skew-y-1 transform origin-top-left z-0 rounded-[3rem]"></div>
        <div className="relative z-10 bg-white/80 dark:bg-surface-container-lowest/80 backdrop-blur-xl shadow-xl rounded-[2rem] p-8 md:p-16 max-w-4xl mx-auto border border-outline-variant/15">
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
            <div className="prose prose-slate dark:prose-invert max-w-none text-on-surface">
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

      {/* Plans Section */}
      <section className="w-full space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <h2 className="font-headline text-3xl md:text-4xl text-primary">El camino hacia la transformación</h2>
          <p className="font-body tracking-wide text-lg text-on-surface-variant">Selecciona la estructura que mejor se adapte a tu necesidad de profundidad y acompañamiento en este proceso.</p>
        </div>
        
        <div className="w-full bg-[#162839] rounded-3xl py-8 px-6 md:px-12 flex items-center justify-center shadow-xl mb-8">
          <h3 className="font-headline text-2xl md:text-3xl text-white tracking-wide text-center">Descubre nuestros planes de ayuda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Básico */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 shadow-lg hover:-translate-y-1 transition-transform duration-500 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">spa</span>
            </div>
            <div className="mb-8 relative z-10">
              <button 
                onClick={() => setSelectedPlanImage('/images/fondo_basico.jpg')}
                className="inline-flex items-center text-xs font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-3xl text-primary mb-2">Plan Básico</h3>
              <p className="font-body text-on-surface-variant text-sm h-12">Estrés práctico del día a día.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="flex items-center space-x-3 text-on-surface">
                <span className="material-symbols-outlined text-primary/60">calendar_month</span>
                <span className="font-label">1 sesión al mes (3 total)</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">550€</span>
                </div>
                <p className="text-xs text-on-surface-variant/80 italic font-body">O a plazos: Reserva 90€ + 3 cuotas de 170€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=basico')}
              className="w-full py-4 rounded-xl text-primary border border-primary/20 hover:bg-surface-container-low transition-colors font-label font-bold mt-auto relative z-10"
            >
              Agendar y pagar reserva
            </button>
          </div>

          {/* Plan Intermedio */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 shadow-xl hover:-translate-y-1 transition-transform duration-500 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute inset-0 border-2 border-primary/10 rounded-3xl pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">mediation</span>
            </div>
            <div className="mb-8 relative z-10">
              <button 
                onClick={() => setSelectedPlanImage('/images/fondo_inermedio.jpg')}
                className="inline-flex items-center text-xs font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-3xl text-primary mb-2">Plan Intermedio</h3>
              <p className="font-body text-on-surface-variant text-sm h-12">Pensamientos circulares, procrastinación.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="flex items-center space-x-3 text-on-surface">
                <span className="material-symbols-outlined text-primary/60">calendar_month</span>
                <span className="font-label">1 sesión/15 días (6 total)</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">1.700€</span>
                </div>
                <p className="text-xs text-on-surface-variant/80 italic font-body">O a plazos: Reserva 290€ + 3 cuotas de 570€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=intermedio')}
              className="w-full py-4 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-opacity font-label font-bold mt-auto relative z-10"
            >
              Agendar y pagar reserva
            </button>
          </div>

          {/* Plan Completo */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 shadow-lg hover:-translate-y-1 transition-transform duration-500 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">diamond</span>
            </div>
            <div className="mb-8 relative z-10">
              <button 
                onClick={() => setSelectedPlanImage('/images/fondo_completo.jpg')}
                className="inline-flex items-center text-xs font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-3xl text-primary mb-2">Plan Completo</h3>
              <p className="font-body text-on-surface-variant text-sm h-12">Ansiedad profunda, heridas del pasado.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="flex items-center space-x-3 text-on-surface">
                <span className="material-symbols-outlined text-primary/60">calendar_month</span>
                <span className="font-label">1 sesión/semana (12 total)</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">2.200€</span>
                </div>
                <p className="text-xs text-on-surface-variant/80 italic font-body">O a plazos: Reserva 400€ + 3 cuotas de 700€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=completo')}
              className="w-full py-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-label font-bold mt-auto relative z-10"
              style={{ background: 'linear-gradient(135deg, var(--color-primary, #162839) 0%, var(--color-primary-container, #2c3e50) 100%)', color: 'white' }}
            >
              Agendar y pagar reserva
            </button>
          </div>
        </div>
      </section>

      {/* Plan Details Modal */}
      {selectedPlanImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191c1c]/60 backdrop-blur-sm" 
          onClick={() => setSelectedPlanImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-surface rounded-[2rem] overflow-hidden shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPlanImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#191c1c]/30 hover:bg-[#191c1c]/50 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="relative w-full overflow-y-auto max-h-[85vh]">
              <img 
                src={selectedPlanImage} 
                alt="Detalle del plan" 
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const msg = document.createElement('div');
                  msg.className = 'p-12 text-center text-on-surface-variant font-label';
                  msg.innerText = 'Infografía pendiente de incorporar.';
                  e.currentTarget.parentElement?.appendChild(msg);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
