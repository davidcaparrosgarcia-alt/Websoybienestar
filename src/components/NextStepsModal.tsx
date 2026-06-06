import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function NextStepsModal({
  isOpen,
  onClose,
  user,
  hasDoneConsultation,
  emailValue: initialEmailValue,
  phoneValue: initialPhoneValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null | undefined;
  hasDoneConsultation: boolean;
  emailValue: string;
  phoneValue: string;
}) {
  const navigate = useNavigate();
  
  const [emailChecked, setEmailChecked] = useState(true);
  const [emailValue, setEmailValue] = useState(initialEmailValue);
  const [whatsappChecked, setWhatsappChecked] = useState(false);
  const [smsChecked, setSmsChecked] = useState(false);
  const [phoneValue, setPhoneValue] = useState(initialPhoneValue);
  const [ageValue, setAgeValue] = useState("");
  const [sexValue, setSexValue] = useState("");
  const [isQuestionnaireSubmitting, setIsQuestionnaireSubmitting] = useState(false);
  const [questionnaireRequestMessage, setQuestionnaireRequestMessage] = useState<{text: string, type: "success"|"error"|"warning"} | null>(null);
  const [questionnaireSuccessData, setQuestionnaireSuccessData] = useState<{accessCode?: string; questionnaireUrl?: string; directAccessAvailable?: boolean;} | null>(null);
  const [questionnaireStatus, setQuestionnaireStatus] = useState<string | null>(null);
  const [dossierViewedAt, setDossierViewedAt] = useState<any>(null);
  const [fullUserData, setFullUserData] = useState<any>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{text: string, type: "success"|"error"} | null>(null);
  
  const [isDebuggingQuestionnaireBridge, setIsDebuggingQuestionnaireBridge] = useState(false);
  const [questionnaireDebugResult, setQuestionnaireDebugResult] = useState<string | null>(null);

  const [lastQuestionnaireAction, setLastQuestionnaireAction] = useState<"manual_request" | "direct_now" | "resend" | null>(null);
  const [forceQuestionnaireRequestForm, setForceQuestionnaireRequestForm] = useState(false);

  const resetQuestionnaireLocalState = () => {
    setQuestionnaireStatus(null);
    setQuestionnaireSuccessData(null);
    setResendMessage(null);
    setQuestionnaireRequestMessage(null);
    setLastQuestionnaireAction(null);
    setForceQuestionnaireRequestForm(false);
  };

  const questionnaireRequestStatus = fullUserData?.questionnaireRequestStatus || null;

  useEffect(() => {
    setEmailValue(initialEmailValue);
    setPhoneValue(initialPhoneValue);
  }, [initialEmailValue, initialPhoneValue]);

  useEffect(() => {
    if (isOpen) {
      setQuestionnaireSuccessData(null);
      setResendMessage(null);
      setQuestionnaireRequestMessage(null);
      setLastQuestionnaireAction(null);
      setForceQuestionnaireRequestForm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user?.uid) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullUserData(data || null);
          setQuestionnaireStatus(data?.questionnaireStatus || null);
          setDossierViewedAt(data?.dossierViewedAt || null);
          const age = data?.age || data?.edad || data?.profileAge || data?.birthDate || "";
          if (age) setAgeValue(String(age));

          const sex = data?.sex || data?.sexo || data?.gender || data?.genero || "";
          if (sex === "hombre" || sex === "mujer" || sex === "prefiero_no_definirme") {
            setSexValue(sex);
          } else if (sex) {
            const ls = String(sex).toLowerCase();
            if (ls.startsWith("hom") || ls.startsWith("man") || ls.startsWith("masc")) setSexValue("hombre");
            else if (ls.startsWith("muj") || ls.startsWith("wom") || ls.startsWith("fem")) setSexValue("mujer");
            else setSexValue("prefiero_no_definirme");
          }

          const contactPhone = data?.contactPhone || data?.phone || data?.whatsappPhone || data?.smsPhone || data?.telefono || "";
          setPhoneValue(prev => {
            const shouldUseStoredPhone = !initialPhoneValue || initialPhoneValue === "+34" || prev === "+34" || !prev;
            if (contactPhone && shouldUseStoredPhone) {
              const prefix = data?.contactPhoneCountryCode || "+34";
              return contactPhone.startsWith('+') ? contactPhone : `${prefix}${contactPhone}`;
            }
            return prev;
          });
        }
      }).catch(console.error);
    }
  }, [user, initialPhoneValue]);

  // Clases de botones constantes locales corregidas para asegurar legibilidad en modo claro y oscuro
  const actionButtonLightClass =
    "bg-white text-[#162839] border border-outline-variant/20 hover:bg-surface-container-high text-center rounded-full font-bold cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed";

  const actionButtonLightSmallClass =
    `${actionButtonLightClass} px-6 py-3 text-sm flex items-center justify-center gap-2`;

  const actionButtonLightWideClass =
    `${actionButtonLightClass} py-3 text-sm hover:-translate-y-0.5 w-full flex items-center justify-center gap-2`;

  const actionButtonLightLargeClass =
    `${actionButtonLightClass} py-4 text-base hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] w-full flex items-center justify-center`;

  const buttonOnDarkPanelClass =
    "bg-[#162839] text-white border border-white/10 hover:bg-[#20384f] text-center rounded-full font-bold cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed";

  const buttonOnDarkPanelSmallClass =
    `${buttonOnDarkPanelClass} py-2 px-4 text-xs`;

  const buttonOnDarkPanelLargeClass =
    `${buttonOnDarkPanelClass} py-3 px-4 text-sm`;

  const actionButtonLightOutlineClass =
    "bg-transparent text-[#162839] dark:text-white border border-[#162839]/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 text-center rounded-full font-bold cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const actionButtonLightOutlineSmallClass =
    `${actionButtonLightOutlineClass} px-6 py-3 text-sm flex items-center justify-center gap-2`;

  const dangerDebugButtonClass =
    "bg-red-600 text-white border border-red-400/30 hover:bg-red-700 text-center rounded-full font-bold cursor-pointer transition-all duration-300";

  if (!isOpen) return null;

  const handleFormSubmit = async (mode: "manual_request" | "direct_now") => {
    setQuestionnaireRequestMessage(null);
    setQuestionnaireSuccessData(null);

    if (!emailValue.trim() || !/\S+@\S+\.\S+/.test(emailValue)) {
      setQuestionnaireRequestMessage({ text: "Por favor, introduce un email válido.", type: "error" });
      return;
    }
    
    if (!ageValue.trim()) {
      setQuestionnaireRequestMessage({ text: "Por favor, indica tu edad.", type: "error" });
      return;
    }

    if (!sexValue) {
      setQuestionnaireRequestMessage({ text: "Por favor, selecciona tu sexo.", type: "error" });
      return;
    }

    if (!emailChecked && !whatsappChecked && !smsChecked) {
      setQuestionnaireRequestMessage({ text: "Debes seleccionar al menos un canal de contacto.", type: "error" });
      return;
    }
    
    let telefono = "";
    const normalizedPhone = phoneValue.trim();
    
    if (whatsappChecked || smsChecked) {
      telefono = normalizedPhone;
      if (!telefono || telefono === "+34" || telefono.trim().length < 5) {
        setQuestionnaireRequestMessage({ text: "Para recibir el enlace por WhatsApp o SMS necesitamos que indiques tu número de teléfono.", type: "error" });
        return;
      }
    } else if (normalizedPhone && normalizedPhone !== "+34" && normalizedPhone.length >= 5) {
      telefono = normalizedPhone;
    }

    if (!user) {
      setQuestionnaireRequestMessage({ text: "Debes iniciar sesión para realizar la solicitud.", type: "error" });
      return;
    }

    setIsQuestionnaireSubmitting(true);
    try {
      const token = await user.getIdToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (user.email === "davidcaparrosgarcia@gmail.com") {
        headers["x-debug-request-questionnaire"] = "true";
      }

      const response = await fetch('/api/request-questionnaire', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: emailValue,
          telefono,
          edad: ageValue,
          sexo: sexValue,
          requestMode: mode,
          preferredChannels: {
            email: emailChecked,
            whatsapp: whatsappChecked,
            sms: smsChecked
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLastQuestionnaireAction(mode);
        setQuestionnaireStatus(data.status === "sent" ? "sent" : "requested");
        setQuestionnaireRequestMessage({ text: data.message || "Solicitud enviada correctamente.", type: "success" });
        setQuestionnaireSuccessData({
          accessCode: data.accessCode,
          questionnaireUrl: data.questionnaireUrl,
          directAccessAvailable: data.directAccessAvailable
        });
        try {
          await setDoc(doc(db, "users", user.uid), {
            edad: ageValue,
            sexo: sexValue,
            profileAge: ageValue,
            gender: sexValue,
            lastQuestionnaireAge: ageValue,
            lastQuestionnaireSex: sexValue,
            questionnairePersonalDataUpdatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("Error saving age/sex after successful request", e);
        }
      } else {
        let msg = data.message || "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros.";
        
        if (user.email === "davidcaparrosgarcia@gmail.com" && data.debug) {
          msg += `\n\n--- TEMP DEBUG UI ---\nPaso de error: ${data.debug.step}\nName: ${data.debug.name}\nMensaje: ${data.debug.message}\nCode: ${data.debug.code || 'N/A'}`;
        }

        if (response.status === 429) {
          setQuestionnaireRequestMessage({ text: msg, type: "warning" });
        } else {
          setQuestionnaireRequestMessage({ text: msg, type: "error" });
        }
      }
    } catch (e) {
      console.error("Error submitting questionnaire request", e);
      setQuestionnaireRequestMessage({ text: "No hemos podido registrar la solicitud en este momento. Inténtalo de nuevo más tarde o contacta con nosotros.", type: "error" });
    } finally {
      setIsQuestionnaireSubmitting(false);
    }
  };

  const handleResendQuestionnaire = async () => {
    if (!user) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/resend-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.action === "resend_requested") {
          setQuestionnaireSuccessData(null);
          setLastQuestionnaireAction(null);
          setQuestionnaireStatus("requested");
          setResendMessage({
            text: data.message || "Su solicitud ha sido procesada para que reciba por los medios solicitados un enlace y clave del cuestionario. Si no marcó ningún medio, lo recibirá al email con el que se ha registrado.",
            type: "success"
          });
          return;
        }
        setLastQuestionnaireAction("resend");
        setQuestionnaireSuccessData({
          accessCode: data.accessCode,
          questionnaireUrl: data.questionnaireUrl
        });
        setResendMessage({ text: "Hemos recuperado tu enlace y clave.", type: "success" });
      } else if (data.status === "manual_request_pending") {
        setResendMessage({
          text: data.message || "Tu solicitud sigue pendiente de validación por el terapeuta. Recibirás el enlace por los medios indicados cuando sea enviada.",
          type: "success"
        });
        setQuestionnaireSuccessData(null);
        setLastQuestionnaireAction(null);
      } else if (data.status === "reset_required" || response.status === 404) {
        setQuestionnaireStatus("reset_required");
        setQuestionnaireSuccessData(null);
        setLastQuestionnaireAction(null);
        setQuestionnaireRequestMessage(null);
        setResendMessage({ text: data.message || "Tu solicitud anterior ya no está activa.", type: "error" });
      } else {
        setResendMessage({ text: data.error || "Error al solicitar el reenvío.", type: "error" });
      }
    } catch (e) {
      console.error("Error resending questionnaire", e);
      setResendMessage({ text: "Error de conexión al solicitar el reenvío.", type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  const handleDebugQuestionnaireBridge = async () => {
    setIsDebuggingQuestionnaireBridge(true);
    setQuestionnaireDebugResult(null);
    try {
      const token = await user?.getIdToken() || "";
      const res = await fetch("/api/debug-questionnaire-bridge", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setQuestionnaireDebugResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setQuestionnaireDebugResult("Error en el diagnóstico: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsDebuggingQuestionnaireBridge(false);
    }
  };

  const isDeveloper = user?.email === "davidcaparrosgarcia@gmail.com";
  const hasRecoveredQuestionnaireUrl = !!questionnaireSuccessData?.questionnaireUrl;
  const effectivelyHasDoneConsultation = hasDoneConsultation;

  const availableQuestionnaireUrl =
    questionnaireSuccessData?.questionnaireUrl ||
    fullUserData?.latestQuestionnaireDirectUrl ||
    fullUserData?.questionnaireUrl ||
    null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-md animate-in fade-in text-left">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors z-10"
        >
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>
        <div className="p-8 pb-6 border-b border-outline-variant/10 bg-primary-container text-on-primary">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl">how_to_reg</span>
          </div>
          <h3 className="font-headline text-3xl mb-2">Ya estás registrado</h3>
          <p className="text-on-primary-container text-sm font-body">Continúa tu proceso seleccionando uno de tus siguientes pasos de bienestar.</p>
        </div>
        
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Option 1 */}
          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">psychology</span>
                <h4 className="font-headline text-lg text-primary">1. Consulta con IA Gratuita</h4>
              </div>
              {effectivelyHasDoneConsultation ? (
                <div className="flex flex-col items-end gap-2">
                  <span className="flex items-center gap-1 text-secondary bg-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Realizado
                  </span>
                  <button onClick={() => navigate('/session')} className="text-primary text-xs font-bold underline hover:text-primary/80 transition-colors">
                    Rehacer consulta
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate('/session')} className="text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
                  Iniciar
                </button>
              )}
            </div>
          </div>

          {/* Option 2 */}
          <div className="bg-surface p-5 rounded-2xl border border-primary/20">
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">assignment</span>
                <h4 className="font-headline text-lg text-primary">2. Solicitar Cuestionario Espejo</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Es necesario completar este formulario para poder generar la conclusión terapéutica detallada de sus resultados y trazar un plan personalizado.
              </p>
            </div>
            
            {!effectivelyHasDoneConsultation ? (
              <div className="mt-4 p-5 bg-primary-container/30 border border-primary/20 rounded-2xl flex flex-col gap-4">
                 <p className="text-sm text-on-surface-variant leading-relaxed">
                   Antes de solicitar el Cuestionario Espejo, necesitamos que completes la Consulta gratuita. Así podremos preparar una solicitud más útil y personalizada para ti.
                 </p>
                 <button onClick={() => navigate('/session')} className={`${actionButtonLightSmallClass} self-start`}>
                   Ir a la Consulta Gratuita
                 </button>
              </div>
            ) : !forceQuestionnaireRequestForm && (questionnaireStatus === "reset_required" || questionnaireRequestStatus === "reset_required") ? (
              <div className="mt-4 p-5 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-2xl flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Tu solicitud anterior de Cuestionario Espejo ya no está activa. Si deseas continuar, inicia una nueva valoración para actualizar tu situación actual.
                </p>
                <button 
                  onClick={async () => {
                    if (user?.uid) {
                      await setDoc(doc(db, "users", user.uid), {
                        questionnaireStatus: null,
                        questionnaireRequestStatus: null,
                        questionnaireDeliveryMode: null,
                        latestQuestionnaireDirectUrl: null,
                        latestQuestionnairePatientId: null,
                        linkedQuestionnairePatientId: null,
                        latestQuestionnaireResendStatus: null,
                        questionnaireResetClearedAt: serverTimestamp()
                      }, { merge: true });

                      await setDoc(doc(db, "userProfiles", user.uid), {
                        questionnaireStatus: null,
                        questionnaireRequestStatus: null,
                        questionnaireDeliveryMode: null,
                        latestQuestionnaireDirectUrl: null,
                        latestQuestionnairePatientId: null,
                        linkedQuestionnairePatientId: null,
                        latestQuestionnaireResendStatus: null,
                        questionnaireResetClearedAt: serverTimestamp()
                      }, { merge: true });
                    }
                    
                    if (typeof setQuestionnaireStatus === "function") {
                       setQuestionnaireStatus(null);
                    }
                    if (typeof setDossierViewedAt === "function") {
                       setDossierViewedAt(null);
                    }
                    if (typeof setFullUserData === "function") {
                       setFullUserData(prev => ({
                         ...(prev || {}),
                         questionnaireStatus: null,
                         questionnaireRequestStatus: null,
                         dossierAvailableAt: null,
                         dossierViewedAt: null,
                         latestDossier: null
                       }));
                    }
                    
                    resetQuestionnaireLocalState();
                    setForceQuestionnaireRequestForm(true);
                  }}
                  className={`${actionButtonLightSmallClass} self-start`}
                >
                  Iniciar nueva valoración
                </button>
              </div>
            ) : !forceQuestionnaireRequestForm && (questionnaireStatus === "dossier_available" || questionnaireStatus === "concluded" || dossierViewedAt) && questionnaireStatus !== "reset_required" && questionnaireRequestStatus !== "reset_required" ? (
              <div className="mt-4 p-5 bg-green-50/50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-800/30 rounded-2xl flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant leading-relaxed font-bold text-green-700 dark:text-green-300">
                  {dossierViewedAt ? "Dosier leído" : "Tu dosier está disponible para lectura."}
                </p>
                <button onClick={() => { onClose(); navigate('/report'); }} className={`${actionButtonLightSmallClass} self-start`}>
                  Leer dosier
                </button>
              </div>
            ) : !forceQuestionnaireRequestForm && (questionnaireStatus === "completed_pending_dossier" || questionnaireStatus === "completed") ? (
              <div className="mt-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant leading-relaxed text-blue-700 dark:text-blue-300">
                  Has completado el Cuestionario Espejo. Nuestro equipo revisará tus respuestas y te avisaremos cuando el dosier esté disponible.
                </p>
              </div>
            ) : !forceQuestionnaireRequestForm && ((questionnaireStatus === "sent" || questionnaireStatus === "in_progress") && availableQuestionnaireUrl) ? (
              <div className="mt-4 p-5 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant leading-relaxed text-blue-700 dark:text-blue-300">
                  Tu Cuestionario Espejo está iniciado. Puedes continuar desde donde lo dejaste usando el mismo enlace y tu clave personal.
                </p>
                
                {questionnaireRequestMessage && (
                  <div className={`mt-3 p-3 whitespace-pre-wrap rounded-xl text-sm font-medium ${
                    questionnaireRequestMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
                    questionnaireRequestMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {questionnaireRequestMessage.text}
                  </div>
                )}

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                      window.location.href = availableQuestionnaireUrl;
                    } else {
                      window.open(availableQuestionnaireUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className={`${actionButtonLightWideClass} mt-2`}
                >
                  Continuar con mi cuestionario iniciado
                </button>

                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    onClick={handleResendQuestionnaire} 
                    disabled={isResending}
                    className="text-primary text-xs font-bold underline hover:text-primary/80 transition-colors self-start flex items-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        Solicitando reenvío...
                      </>
                    ) : (
                      "Solicitar reenvío del enlace"
                    )}
                  </button>
                  {resendMessage && (
                    <p className={`text-xs ${resendMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{resendMessage.text}</p>
                  )}
                </div>
                
                {questionnaireSuccessData?.accessCode && lastQuestionnaireAction !== null && (
                  <div className="mt-2 p-4 bg-white dark:bg-black/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm flex flex-col gap-4">
                    <p className="text-sm">Tu clave personal es: <strong className="text-lg ml-2 px-3 py-1 bg-green-50 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-700">{questionnaireSuccessData.accessCode?.toUpperCase()}</strong></p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-row gap-2">
                        <button 
                          onClick={(e) => {
                             e.preventDefault();
                             navigator.clipboard.writeText(availableQuestionnaireUrl);
                             alert("Enlace copiado al portapapeles");
                          }}
                          className={`${buttonOnDarkPanelSmallClass} flex-1`}
                        >
                          Copiar enlace
                        </button>
                        <button 
                          onClick={(e) => {
                             e.preventDefault();
                             navigator.clipboard.writeText(questionnaireSuccessData.accessCode!.toUpperCase());
                             alert("Clave copiada al portapapeles");
                          }}
                          className={`${buttonOnDarkPanelSmallClass} flex-1`}
                        >
                          Copiar clave
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !forceQuestionnaireRequestForm && ((questionnaireStatus === "sent" || questionnaireStatus === "in_progress") && !availableQuestionnaireUrl) ? (
              <div className="mt-4 p-5 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Tu Cuestionario Espejo está iniciado, pero necesitamos recuperar el enlace para que puedas continuar.
                </p>
                {questionnaireRequestMessage && (
                  <div className={`mt-3 p-3 whitespace-pre-wrap rounded-xl text-sm font-medium ${
                    questionnaireRequestMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
                    questionnaireRequestMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {questionnaireRequestMessage.text}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleResendQuestionnaire} 
                    disabled={isResending}
                    className="text-primary text-xs font-bold underline hover:text-primary/80 transition-colors self-start flex items-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        Solicitando reenvío...
                      </>
                    ) : (
                      "Recuperar enlace para continuar"
                    )}
                  </button>
                  {resendMessage && (
                    <p className={`text-xs ${resendMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{resendMessage.text}</p>
                  )}
                </div>
              </div>
            ) : !forceQuestionnaireRequestForm && (questionnaireStatus === "requested" && !questionnaireSuccessData?.questionnaireUrl) ? (
              <div className="mt-4 p-5 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex flex-col gap-4">
                <div className="text-sm text-on-surface-variant leading-relaxed">
                  <p className="mb-2">
                    Tu solicitud de Cuestionario Espejo ha sido registrada. En cuanto un terapeuta la valide, recibirás el enlace por los medios que has solicitado.
                  </p>
                  <p className="mb-3">
                    Conserva tu clave personal. Te servirá para acceder al cuestionario cuando recibas el enlace.
                  </p>
                  <p>
                    Si prefieres hacerlo ahora mismo, puedes iniciar el cuestionario de forma inmediata.
                  </p>
                </div>
                
                <button 
                  onClick={() => handleFormSubmit("direct_now")}
                  disabled={isQuestionnaireSubmitting}
                  className={`${actionButtonLightSmallClass} self-start`}
                >
                  {isQuestionnaireSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#162839]/20 border-t-[#162839] rounded-full animate-spin mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    "Hacer Cuestionario Espejo ahora"
                  )}
                </button>

                {questionnaireRequestMessage && (
                  <div className={`mt-3 p-3 whitespace-pre-wrap rounded-xl text-sm font-medium ${
                    questionnaireRequestMessage.type === 'success'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : questionnaireRequestMessage.type === 'warning'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  }`}>
                    {questionnaireRequestMessage.text}
                  </div>
                )}

                {questionnaireSuccessData?.accessCode && lastQuestionnaireAction !== null && (
                  <div className="mt-2 p-4 bg-white dark:bg-black/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm flex flex-col gap-4">
                    <p className="text-sm">Tu clave personal es: <strong className="text-lg ml-2 px-3 py-1 bg-green-50 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-700">{questionnaireSuccessData.accessCode?.toUpperCase()}</strong></p>
                    <button 
                      onClick={(e) => {
                         e.preventDefault();
                         navigator.clipboard.writeText(questionnaireSuccessData.accessCode!.toUpperCase());
                         alert("Clave copiada al portapapeles");
                      }}
                      className={buttonOnDarkPanelLargeClass}
                    >
                      Copiar clave
                    </button>
                  </div>
                )}
              </div>

            ) : (
              <>
                <h5 className="font-bold text-sm text-primary mt-6 mb-3">Tus datos personales</h5>
            <form className="space-y-3 font-body mb-6">
              <div className="flex flex-row gap-3">
                <label className="w-24 flex flex-col gap-1 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <span className="text-sm text-on-surface-variant font-medium">Edad</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ageValue} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                      setAgeValue(value);
                    }}
                    className="text-sm px-2 py-1.5 bg-surface-container rounded-md border border-outline-variant/20 focus:ring-1 focus:ring-primary outline-none min-w-0 bg-transparent text-on-surface text-center placeholder:text-on-surface-variant/40 focus:placeholder:text-transparent"
                    placeholder="35"
                    maxLength={2}
                  />
                </label>
                <label className="flex-1 min-w-0 flex flex-col gap-1 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <span className="text-sm text-on-surface-variant font-medium">Sexo</span>
                  <select 
                    value={sexValue} 
                    onChange={(e) => setSexValue(e.target.value)}
                    className="text-sm px-2 py-1.5 bg-surface-container dark:bg-[#162839] rounded-md border border-outline-variant/20 focus:ring-1 focus:ring-primary outline-none min-w-0 bg-transparent text-on-surface dark:text-white w-full overflow-hidden text-ellipsis"
                  >
                    <option className="bg-white text-[#162839] dark:bg-[#162839] dark:text-white" value="" disabled>Selecciona...</option>
                    <option className="bg-white text-[#162839] dark:bg-[#162839] dark:text-white" value="hombre">Hombre</option>
                    <option className="bg-white text-[#162839] dark:bg-[#162839] dark:text-white" value="mujer">Mujer</option>
                    <option className="bg-white text-[#162839] dark:bg-[#162839] dark:text-white" value="prefiero_no_definirme">Prefiero no definirme</option>
                  </select>
                </label>
              </div>
            </form>

            <h5 className="font-bold text-sm text-primary mb-3">¿Por dónde prefieres recibir el enlace?</h5>
            <form className="space-y-3 font-body">
              <label className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  checked={emailChecked}
                  onChange={(e) => setEmailChecked(e.target.checked)}
                />
                <div className="flex items-center gap-2 text-on-surface-variant w-24 shrink-0">
                  <span className="material-symbols-outlined text-base">mail</span>
                  <span className="text-sm">Email</span>
                </div>
                <input 
                  type="email" 
                  value={emailValue} 
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="text-sm px-3 py-1.5 bg-surface-container rounded-md border border-outline-variant/20 focus:ring-1 focus:ring-primary outline-none flex-1 min-w-0 bg-transparent text-on-surface"
                  placeholder="tu@email.com"
                />
              </label>

              <label className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  checked={whatsappChecked}
                  onChange={(e) => setWhatsappChecked(e.target.checked)}
                />
                <div className="flex items-center gap-2 text-on-surface-variant w-24 shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.197 1.441 4.934 1.442 5.333 0 9.673-4.34 9.676-9.674.002-5.332-4.338-9.674-9.671-9.675-2.585-.001-5.015 1.007-6.843 2.837-1.828 1.83-2.834 4.26-2.835 6.844-.001 1.705.469 3.376 1.36 4.827l-1.055 3.854 3.954-1.035zm12.188-4.63c-.334-.167-1.974-.974-2.279-1.084-.303-.11-.524-.167-.745.167-.221.334-.856 1.084-1.05 1.308-.194.223-.389.25-.723.084-.333-.167-1.408-.52-2.681-1.656-.991-.884-1.659-1.976-1.853-2.31-.194-.334-.021-.514.146-.68.15-.15.334-.389.501-.584.166-.194.222-.333.333-.556.111-.223.056-.417-.028-.584-.084-.167-.745-1.794-1.021-2.459-.269-.646-.543-.558-.745-.568-.192-.01-.413-.012-.634-.012-.221 0-.579.083-.883.417-.304.334-1.162 1.14-1.162 2.783 0 1.643 1.198 3.226 1.365 3.449.167.222 2.358 3.599 5.712 5.048.798.344 1.42.55 1.905.706.802.255 1.533.219 2.11.134.643-.095 1.974-.807 2.251-1.587.277-.779.277-1.447.194-1.586-.083-.14-.304-.223-.637-.39z"></path></svg>
                  <span className="text-sm">WhatsApp</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  checked={smsChecked}
                  onChange={(e) => setSmsChecked(e.target.checked)}
                />
                <div className="flex items-center gap-2 text-on-surface-variant w-24 shrink-0">
                  <span className="material-symbols-outlined text-base">sms</span>
                  <span className="text-sm">SMS</span>
                </div>
              </label>

              {(whatsappChecked || smsChecked) && (
                <label className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-base">phone_iphone</span>
                    <span className="text-sm">Número para WhatsApp y/o SMS</span>
                  </div>
                  <input 
                    type="tel" 
                    value={phoneValue} 
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="text-sm px-3 py-1.5 bg-surface-container rounded-md border border-outline-variant/20 focus:ring-1 focus:ring-primary outline-none flex-1 min-w-0 bg-transparent text-on-surface"
                    placeholder="+34"
                  />
                </label>
              )}
            </form>

            {questionnaireRequestMessage && (
              <div className={`mt-4 p-4 whitespace-pre-wrap rounded-xl text-sm font-medium ${questionnaireRequestMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : questionnaireRequestMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
                {questionnaireRequestMessage.text}
                
                {questionnaireRequestMessage.type === 'success' && questionnaireSuccessData?.accessCode && lastQuestionnaireAction !== null && (
                  <div className="mt-4 p-5 bg-white dark:bg-black/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm flex flex-col gap-4">
                    <p className="text-base">Tu clave personal es: <strong className="text-xl ml-2 px-3 py-1 bg-green-50 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-700">{questionnaireSuccessData.accessCode.toUpperCase()}</strong></p>
                    
                    <div className="flex flex-col gap-3">
                      {questionnaireSuccessData.questionnaireUrl && (
                         <button 
                           onClick={(e) => {
                             e.preventDefault();
                             if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                               window.location.href = questionnaireSuccessData.questionnaireUrl!;
                             } else {
                               window.open(questionnaireSuccessData.questionnaireUrl!, "_blank", "noopener,noreferrer");
                             }
                           }}
                           className={actionButtonLightLargeClass}
                         >
                           Hacer Cuestionario Espejo ahora
                         </button>
                      )}
                      
                      <div className="flex flex-row gap-3">
                        {questionnaireSuccessData.questionnaireUrl && (
                          <button 
                            onClick={(e) => {
                               e.preventDefault();
                               navigator.clipboard.writeText(questionnaireSuccessData.questionnaireUrl!);
                               alert("Enlace copiado al portapapeles");
                            }}
                            className={`${buttonOnDarkPanelLargeClass} flex-1`}
                          >
                            Copiar enlace
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                             e.preventDefault();
                             navigator.clipboard.writeText(questionnaireSuccessData.accessCode!.toUpperCase());
                             alert("Clave copiada al portapapeles");
                          }}
                          className={`${buttonOnDarkPanelLargeClass} flex-1`}
                        >
                          Copiar clave
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs opacity-90 mt-1 font-normal">
                      Puedes copiar el enlace y la clave para guardarlos. Si has elegido email, WhatsApp o SMS, el equipo podrá usar esos datos para enviártelo también por la vía indicada.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 flex flex-col md:flex-row gap-3 justify-end">
              <button 
                onClick={() => handleFormSubmit("direct_now")}
                disabled={isQuestionnaireSubmitting}
                className={actionButtonLightSmallClass}
              >
                {isQuestionnaireSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#162839]/20 border-t-[#162839] rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  "Hacer Cuestionario Espejo ahora"
                )}
              </button>
              <button 
                onClick={() => handleFormSubmit("manual_request")}
                disabled={isQuestionnaireSubmitting}
                className={actionButtonLightOutlineSmallClass}
              >
                Enviar Solicitud
              </button>
            </div>

            {/* TEMP DEBUG UI */}
            {user?.email === "davidcaparrosgarcia@gmail.com" && (
              <div className="mt-4 p-3 border border-dashed border-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl flex flex-col items-start gap-2">
                <button 
                  onClick={handleDebugQuestionnaireBridge}
                  disabled={isDebuggingQuestionnaireBridge}
                  className={`${dangerDebugButtonClass} py-1.5 px-3 text-xs`}
                >
                  {isDebuggingQuestionnaireBridge ? "Diagnosticando..." : "Diagnóstico puente cuestionario"}
                </button>
                {questionnaireDebugResult && (
                  <pre className="text-[10px] w-full mt-2 overflow-x-auto bg-gray-900 text-green-400 p-2 text-left rounded-md whitespace-pre-wrap word-break">
                    {questionnaireDebugResult}
                  </pre>
                )}
              </div>
            )}
            
            </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
