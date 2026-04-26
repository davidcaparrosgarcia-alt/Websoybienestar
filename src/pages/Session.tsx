import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../services/api";
import { auth } from "../firebase";
import { setDoc, updateDoc } from "firebase/firestore";
import { getOrMigrateUserProfile } from "../services/userProfile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Session() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hola. Soy un asistente virtual diseñado para escucharte. Estoy aquí para entender cómo te sientes y ayudarte a plasmar tu situación para que un terapeuta humano pueda valorarla de la mejor manera. Tenemos unos 15 minutos. ¿Cómo te gustaría empezar a contarme lo que te trae por aquí hoy?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [showHelpText, setShowHelpText] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef("");
  
  // Custom refs for robust state handling independently of closure states
  const isRecordingRef = useRef(false);
  const restartAttemptsRef = useRef(0);
  const sessionStartTimeRef = useRef(Date.now());

  const navigate = useNavigate();
  const [hasDoneConsultation, setHasDoneConsultation] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      // Small delay to let Auth state settle
      await new Promise(r => setTimeout(r, 500));
      const user = auth.currentUser;
      if (user) {
        try {
          const { userRef } = await getOrMigrateUserProfile(user.uid);
          const { getDoc } = await import("firebase/firestore");
          const userDoc = await getDoc(userRef);
          if (isMounted) {
            setHasDoneConsultation(!!userDoc.data()?.hasDoneConsultation);
          }
        } catch (e) {
          console.error("Auth check failed", e);
          if (isMounted) setHasDoneConsultation(false);
        }
      } else {
        if (isMounted) setHasDoneConsultation(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const scrollToBottom = () => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        const space = baseInputRef.current && !baseInputRef.current.endsWith(' ') && !finalTranscript.startsWith(' ') ? ' ' : '';
        baseInputRef.current = baseInputRef.current + space + finalTranscript;
      }

      const space2 = baseInputRef.current && !baseInputRef.current.endsWith(' ') && interimTranscript && !interimTranscript.startsWith(' ') ? ' ' : '';
      setInput(baseInputRef.current + space2 + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      isRecordingRef.current = false;
      
      if (event.error === 'not-allowed') {
        setRecordingError("Permiso de micrófono denegado. Actívalo en los ajustes del navegador.");
        setShowHelpText(false);
      } else if (event.error === 'no-speech') {
        setRecordingError("No se detectó voz. Inténtalo de nuevo acercando más el micrófono.");
        setShowHelpText(false);
      } else if (['network', 'audio-capture', 'bad-grammar'].includes(event.error)) {
        setRecordingError("La función de voz no está disponible temporalmente en este dispositivo.");
        setShowHelpText(true);
      } else {
        setRecordingError("Este navegador móvil no ofrece una compatibilidad suficiente con el dictado por voz.");
        setShowHelpText(true);
      }
      setTimeout(() => setRecordingError(null), 8000);
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        // Unintended stop, try to restart once
        if (restartAttemptsRef.current < 1) {
          restartAttemptsRef.current += 1;
          try {
            recognition.start();
            return; // Don't trigger stop states
          } catch (e) {
            console.error("No se pudo reiniciar el reconocimiento", e);
          }
        }
        // If we get here, restart failed or max attempts reached
        setIsRecording(false);
        isRecordingRef.current = false;
        setRecordingError("La grabación por voz se ha detenido en este dispositivo. Puedes volver a intentarlo o escribir manualmente.");
        setShowHelpText(true);
        setTimeout(() => setRecordingError(null), 8000);
      } else {
        // Intended normal manual stop
        setIsRecording(false);
      }
    };

    return recognition;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const isTest = auth.currentUser?.email === "davidcaparrosgarcia@gmail.com";

    if (!isTest && Date.now() - sessionStartTimeRef.current > 15 * 60 * 1000) {
      alert("La sesión ha superado el máximo de 15 minutos permitidos.");
      return;
    }

    const maxChars = isTest ? 8000 : 4000;
    if (input.trim().length > maxChars) {
      alert(`Por favor, acorta tu mensaje. El máximo permitido es de ${maxChars} caracteres.`);
      return;
    }

    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current?.stop();
      } catch (err) {}
    }

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    baseInputRef.current = "";
    setIsLoading(true);

    try {
      const chatHistory = newMessages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const response = await api.sessionReply(chatHistory.slice(0, -1), input);
      
      if (response.text) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.text
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error("Error calling AI:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Lo siento, ha ocurrido un error de conexión. ¿Podrías repetir lo último que dijiste?"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecordingRef.current) {
      // Manual stop
      isRecordingRef.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current?.stop();
      } catch (err) {}
    } else {
      // First, check basic support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setRecordingError("Tu navegador no ofrece compatibilidad suficiente con el dictado por voz en esta función. Puedes seguir escribiendo manualmente.");
        setShowHelpText(true);
        setTimeout(() => setRecordingError(null), 10000);
        return;
      }

      // Then verify media devices / request permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e: any) {
        console.error("Could not start microphone", e);
        setRecordingError("Permiso de micrófono denegado. Actívalo en los ajustes del navegador.");
        setShowHelpText(false);
        setTimeout(() => setRecordingError(null), 8000);
        return;
      }

      // Initialize if missing
      if (!recognitionRef.current) {
         recognitionRef.current = initSpeechRecognition();
      }
      
      // Attempt start
      if (recognitionRef.current) {
        baseInputRef.current = input;
        restartAttemptsRef.current = 0; // Reset restart attempts
        try {
          recognitionRef.current.start();
          isRecordingRef.current = true;
          setIsRecording(true);
          setRecordingError(null);
          setShowHelpText(false);
        } catch (err) {
          console.error("Start error:", err);
          setRecordingError("La función de voz no está disponible temporalmente en este dispositivo.");
          setShowHelpText(true);
          setTimeout(() => setRecordingError(null), 8000);
        }
      }
    }
  };

  const [isFinishing, setIsFinishing] = useState(false);
  const [finishingError, setFinishingError] = useState<string | null>(null);

  const finishSession = async () => {
    if (messages.length <= 1) {
      setFinishingError("No hay suficiente información. Por favor comunícate más con el asistente antes de finalizar.");
      setTimeout(() => setFinishingError(null), 8000);
      return;
    }

    setIsFinishing(true);
    setFinishingError(null);

    const user = auth.currentUser;
    let accumulatedSummary = "";
    let profileReference: any = null;
    let userReference: any = null;

    if (user) {
      try {
        const { userRef, profileRef, profileData } = await getOrMigrateUserProfile(user.uid);
        userReference = userRef;
        profileReference = profileRef;
        accumulatedSummary = profileData.globalUserSummary || "";
      } catch (e) {
        console.error("Firebase read error", e);
      }
    }

    try {
      const parsedData = await api.report(messages, accumulatedSummary);
      
      const isDeveloper = user?.email === "davidcaparrosgarcia@gmail.com";
      
      if (parsedData && (parsedData.validConclusion || isDeveloper)) {
        if (user && profileReference && userReference) {
          const updateDataUser = {
            hasDoneConsultation: true,
            lastUpdated: new Date().toISOString()
          };
          
          const updateDataProfile = {
            globalUserSummary: parsedData.newAccumulatedSummary || accumulatedSummary,
            latestClinicalConclusion: parsedData.markdownReport || "Reporte generado (bypass de desarrollo)",
          };

          await updateDoc(userReference, updateDataUser).catch(async () => {
             await setDoc(userReference, updateDataUser, { merge: true });
          });
          
          await updateDoc(profileReference, updateDataProfile).catch(async () => {
             await setDoc(profileReference, updateDataProfile, { merge: true });
          });
        }
        
        navigate("/session-ended", { state: { messages, reportData: parsedData.markdownReport } });
      } else {
        setFinishingError("La IA ha determinado que la sesión no tiene suficiente información o no ha llegado a una conclusión válida. Por favor, expande más tus respuestas.");
      }
    } catch (err: any) {
      console.error(err);
      setFinishingError(err.message || "Ocurrió un error al evaluar la sesión. Por favor, intenta de nuevo.");
    } finally {
      setIsFinishing(false);
    }
  };

  if (hasDoneConsultation === null) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-5.5rem)]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (hasDoneConsultation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface">
        <div className="max-w-md w-full bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/20 shadow-xl text-center flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">fact_check</span>
          </div>
          <h2 className="font-headline text-3xl text-primary leading-tight">Consulta Gratuita Completada</h2>
          <p className="text-on-surface-variant font-light text-lg">
            Tu próximo paso es solicitar el <strong className="text-primary font-medium">Cuestionario Espejo</strong>. ¿Deseas solicitarlo ahora?
          </p>
          <div className="w-full flex flex-col gap-4 mt-4">
            <button 
              onClick={() => navigate('/method-details')}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md active:scale-95"
            >
              Solicitar Cuestionario Espejo
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-surface-container-lowest text-primary border border-outline-variant/30 py-4 rounded-full font-headline hover:bg-surface-container-low transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-h-[calc(100vh-5.5rem)]">
      {/* Header Info */}
      <div className="border-b border-outline-variant/10 py-4 px-8 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">psychology</span>
          <div>
            <h2 className="font-headline text-primary font-medium">Sesión de Claridad</h2>
            <p className="font-body text-xs text-on-surface-variant font-light">Máx. 15 minutos</p>
          </div>
        </div>
        <button
          onClick={finishSession}
          disabled={isFinishing}
          className="font-label text-sm uppercase tracking-widest bg-primary text-on-primary transition-opacity hover:opacity-90 flex items-center gap-2 px-6 py-2 rounded-full shadow-sm disabled:opacity-50"
        >
          {isFinishing ? (
            <>Evaluando <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span></>
          ) : (
            <>Finalizar Sesión <span className="material-symbols-outlined text-sm">arrow_forward</span></>
          )}
        </button>
      </div>

      {finishingError && (
        <div className="bg-error/10 text-error p-3 text-center text-sm font-label flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span>{finishingError}</span>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto relative p-4 md:p-8 bg-[#64748b]/90 backdrop-blur-sm border-y border-outline-variant/10">
        {/* Fractal Noise Texture Overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-5 mix-blend-multiply dark:mix-blend-overlay">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <filter id="chat-texture">
              <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="3" />
              <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 1 0 0 0 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#chat-texture)" />
          </svg>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-[2rem] px-8 py-6 shadow-md border border-gray-800 dark:border-gray-200 ${
                  msg.role === "user"
                    ? "bg-primary text-on-primary rounded-br-sm shadow-black/30 dark:shadow-black/50"
                    : "bg-surface-container-low text-on-surface rounded-bl-sm shadow-black/30 dark:shadow-black/50"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-stone max-w-none font-body font-light leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap font-body font-light leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-low text-on-surface rounded-[2rem] rounded-bl-sm border border-gray-800 dark:border-gray-200 px-8 py-6 shadow-md shadow-black/30 dark:shadow-black/50 flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-secondary">progress_activity</span>
                <span className="font-body text-on-surface-variant text-sm font-light italic">Escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-outline-variant/10 p-4 md:p-6 bg-transparent">
        <div className="max-w-3xl mx-auto">
          
          {/* Error and Help Messages */}
          {(recordingError || showHelpText) && (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2">
              {recordingError && (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label flex items-start gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-error text-lg mt-[1px]">error</span>
                  <span className="leading-snug">{recordingError}</span>
                </div>
              )}
              {showHelpText && (
                <div className="p-3 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-body flex items-start gap-2 shadow-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-base mt-[1px]">lightbulb</span>
                  <span className="leading-relaxed">Recomendación: prueba con Chrome actualizado en Android. Si estás en iPhone o iPad, el soporte puede ser limitado.</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-4 rounded-full flex-shrink-0 transition-all duration-300 border border-gray-800 dark:border-gray-200 ${
                isRecording 
                  ? "bg-error/10 text-error hover:bg-error/20" 
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">
                {isRecording ? "stop" : "mic"}
              </span>
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full bg-surface-container-low border border-gray-800 dark:border-gray-200 focus:ring-1 focus:ring-gray-500 focus:bg-surface-container rounded-[2rem] px-8 py-4 resize-none min-h-[60px] max-h-[200px] transition-all font-body font-light text-on-surface"
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary text-on-primary p-4 rounded-full flex-shrink-0 hover:bg-primary-container transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-800 dark:border-gray-200"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
