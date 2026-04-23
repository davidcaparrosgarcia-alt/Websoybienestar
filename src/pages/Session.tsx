import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../services/api";

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

  const navigate = useNavigate();

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
    } catch (error) {
      console.error("Error calling AI:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error de conexión. ¿Podrías repetir lo último que dijiste?"
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

  const finishSession = () => {
    navigate("/session-ended", { state: { messages } });
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest max-h-[calc(100vh-5.5rem)]">
      {/* Header Info */}
      <div className="bg-surface-container-low border-b border-outline-variant/10 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">psychology</span>
          <div>
            <h2 className="font-headline text-primary font-medium">Sesión de Claridad</h2>
            <p className="font-body text-xs text-on-surface-variant font-light">Máx. 15 minutos</p>
          </div>
        </div>
        <button
          onClick={finishSession}
          className="font-label text-sm uppercase tracking-widest text-primary hover:text-secondary transition-colors flex items-center gap-2 border border-outline-variant/30 px-4 py-2 rounded-full hover:bg-surface-container"
        >
          Finalizar Sesión <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-[2rem] px-8 py-6 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-on-primary rounded-br-sm"
                    : "bg-surface-container-low text-on-surface rounded-bl-sm border border-outline-variant/10"
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
              <div className="bg-surface-container-low text-on-surface rounded-[2rem] rounded-bl-sm border border-outline-variant/10 px-8 py-6 shadow-sm flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-secondary">progress_activity</span>
                <span className="font-body text-on-surface-variant text-sm font-light italic">Escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-surface-container-lowest border-t border-outline-variant/10 p-4 md:p-6">
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
              className={`p-4 rounded-full flex-shrink-0 transition-all duration-300 ${
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
                className="w-full bg-surface-container-low border-0 focus:ring-0 focus:bg-surface-container rounded-[2rem] px-8 py-4 resize-none min-h-[60px] max-h-[200px] transition-all font-body font-light text-on-surface"
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary text-on-primary p-4 rounded-full flex-shrink-0 hover:bg-primary-container transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
