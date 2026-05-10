import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import Markdown from "react-markdown";

export default function DossierEspejo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);

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

  // Render Dossier
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
           <h1 className="font-headline font-bold text-4xl text-primary mb-3">Dossier Espejo personalizado</h1>
           <p className="text-xl text-on-surface-variant font-light">
             Una lectura más completa construida a partir de tu Consulta Gratuita y el Cuestionario Espejo.
           </p>
        </div>
        <button 
           onClick={() => navigate("/report")}
           className="shrink-0 px-4 py-2 border border-outline-variant rounded-full text-on-surface-variant font-label font-bold text-sm hover:border-primary hover:text-primary transition-colors"
        >
           Cerrar Dossier
        </button>
      </div>

      <div className="bg-surface-container rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/20">
         {isDemoMode ? (
            <div className="bg-secondary-container text-on-secondary-container p-6 rounded-2xl mb-8">
               <h3 className="font-bold font-headline text-lg mb-2 flex items-center gap-2">
                 <span className="material-symbols-outlined shrink-0 text-secondary">experiment</span>
                 Modo Demo
               </h3>
               <p className="text-sm">
                 Vista tester provisional. Este acceso permite revisar el diseño del Dossier Espejo antes de recibir un dossier real desde Cuestionario Espejo.
               </p>
            </div>
         ) : null}

         {latestDossier ? (
           typeof latestDossier === 'string' ? (
              <div className="prose prose-slate max-w-none text-on-surface">
                 <Markdown>{latestDossier}</Markdown>
              </div>
           ) : (
              <div className="space-y-12">
                 {/* Renderizar campos conocidos del objeto latestDossier */}
                 {latestDossier.tu_lectura_principal && (
                   <section>
                      <h3 className="font-headline font-bold text-2xl text-secondary mb-4">Tu lectura principal</h3>
                      <p className="text-on-surface leading-relaxed text-lg">{latestDossier.tu_lectura_principal}</p>
                   </section>
                 )}
                 {latestDossier.aspectos_con_mas_peso && (
                   <section>
                      <h3 className="font-headline font-bold text-2xl text-secondary mb-4">Aspectos que parecen tener más peso</h3>
                      <div className="prose prose-slate max-w-none text-on-surface"><Markdown>{latestDossier.aspectos_con_mas_peso}</Markdown></div>
                   </section>
                 )}
                 {latestDossier.recursos_sugeridos && (
                   <section>
                      <h3 className="font-headline font-bold text-2xl text-secondary mb-4">Recursos iniciales sugeridos</h3>
                      <div className="prose prose-slate max-w-none text-on-surface"><Markdown>{latestDossier.recursos_sugeridos}</Markdown></div>
                   </section>
                 )}
                 {latestDossier.proximo_paso && (
                   <section className="bg-surface p-6 rounded-2xl mt-4">
                      <h3 className="font-headline font-bold text-xl text-primary mb-2">Próximo paso</h3>
                      <p className="text-on-surface-variant">{latestDossier.proximo_paso}</p>
                   </section>
                 )}
                 {/* Fallback si no hay estructura conocida */}
                 {!latestDossier.tu_lectura_principal && (
                   <div className="prose prose-slate max-w-none text-on-surface">
                     <pre className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(latestDossier, null, 2)}</pre>
                   </div>
                 )}
              </div>
           )
         ) : (
           <div className="space-y-12 opacity-50 select-none">
              <section>
                 <div className="h-8 bg-outline-variant/30 rounded w-1/3 mb-4 animate-pulse"></div>
                 <div className="h-4 bg-outline-variant/20 rounded w-full mb-2"></div>
                 <div className="h-4 bg-outline-variant/20 rounded w-full mb-2"></div>
                 <div className="h-4 bg-outline-variant/20 rounded w-5/6"></div>
              </section>
              <section>
                 <div className="h-8 bg-outline-variant/30 rounded w-1/4 mb-4 animate-pulse"></div>
                 <div className="h-4 bg-outline-variant/20 rounded w-full mb-2"></div>
                 <div className="h-4 bg-outline-variant/20 rounded w-4/5"></div>
              </section>
           </div>
         )}
      </div>
    </div>
  );
}
