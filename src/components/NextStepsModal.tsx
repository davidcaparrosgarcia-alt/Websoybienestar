import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";

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
  const [isQuestionnaireSubmitting, setIsQuestionnaireSubmitting] = useState(false);
  const [questionnaireRequestMessage, setQuestionnaireRequestMessage] = useState<{text: string, type: "success"|"error"|"warning"} | null>(null);
  
  const [isDebuggingQuestionnaireBridge, setIsDebuggingQuestionnaireBridge] = useState(false);
  const [questionnaireDebugResult, setQuestionnaireDebugResult] = useState<string | null>(null);

  useEffect(() => {
    setEmailValue(initialEmailValue);
    setPhoneValue(initialPhoneValue);
  }, [initialEmailValue, initialPhoneValue]);

  if (!isOpen) return null;

  const handleFormSubmit = async () => {
    setQuestionnaireRequestMessage(null);

    if (!emailValue.trim() || !/\S+@\S+\.\S+/.test(emailValue)) {
      setQuestionnaireRequestMessage({ text: "Por favor, introduce un email válido.", type: "error" });
      return;
    }
    if (!emailChecked && !whatsappChecked && !smsChecked) {
      setQuestionnaireRequestMessage({ text: "Debes seleccionar al menos un canal de contacto.", type: "error" });
      return;
    }
    
    let telefono = "";
    if (whatsappChecked || smsChecked) {
      telefono = phoneValue;
      if (!telefono || telefono === "+34" || telefono.trim().length < 5) {
        setQuestionnaireRequestMessage({ text: "Para recibir el enlace por WhatsApp o SMS necesitamos que indiques tu número de teléfono.", type: "error" });
        return;
      }
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
          preferredChannels: {
            email: emailChecked,
            whatsapp: whatsappChecked,
            sms: smsChecked
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setQuestionnaireRequestMessage({ text: data.message || "Solicitud enviada correctamente.", type: "success" });
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
  const effectivelyHasDoneConsultation = isDeveloper ? false : hasDoneConsultation;

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
            
            <h5 className="font-bold text-sm text-primary mt-6 mb-3">¿Por dónde prefieres recibir el enlace?</h5>
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
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleFormSubmit}
                disabled={isQuestionnaireSubmitting}
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold text-sm shadow-md hover:bg-primary-container hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isQuestionnaireSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitud"
                )}
              </button>
            </div>

            {/* TEMP DEBUG UI */}
            {user?.email === "davidcaparrosgarcia@gmail.com" && (
              <div className="mt-4 p-3 border border-dashed border-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl flex flex-col items-start gap-2">
                <button 
                  onClick={handleDebugQuestionnaireBridge}
                  disabled={isDebuggingQuestionnaireBridge}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors"
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

          </div>
        </div>
      </div>
    </div>
  );
}
