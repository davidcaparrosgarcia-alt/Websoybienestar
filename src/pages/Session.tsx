import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef("");
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        const space = baseInputRef.current && !baseInputRef.current.endsWith(' ') ? ' ' : '';
        setInput(baseInputRef.current + space + currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setRecordingError("Permiso de micrófono denegado. Por favor, actívalo en tu navegador.");
        } else if (event.error === 'no-speech') {
          setRecordingError("No se detectó voz. Inténtalo de nuevo.");
        } else {
          setRecordingError(`Error de micrófono: ${event.error}`);
        }
        setTimeout(() => setRecordingError(null), 5000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
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

      const chatWithHistory = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "Eres un asistente empático, cálido y profesional, actuando como un puente entre el paciente y un terapeuta humano. Tu objetivo es escuchar al paciente, hacerle preguntas suaves y guiadas para entender su situación (ansiedad, estrés, etc.) y ayudarle a plasmar cómo se siente en un máximo de 15 minutos. Mantén respuestas concisas, conversacionales y muy humanas. No diagnostiques, solo recopila información y brinda apoyo emocional.",
        },
        history: chatHistory.slice(0, -1)
      });

      const response = await chatWithHistory.sendMessage({ message: input });
      
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
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          // Force permission prompt just in case
          await navigator.mediaDevices.getUserMedia({ audio: true });
          
          baseInputRef.current = input;
          recognitionRef.current.start();
          setIsRecording(true);
          setRecordingError(null);
        } catch (e: any) {
          console.error("Could not start recording", e);
          setRecordingError("No se pudo acceder al micrófono. Verifica los permisos.");
          setTimeout(() => setRecordingError(null), 5000);
        }
      } else {
        setRecordingError("Tu navegador no soporta el reconocimiento de voz nativo.");
        setTimeout(() => setRecordingError(null), 5000);
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
          {recordingError && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <span className="material-symbols-outlined text-error text-lg">error</span>
              {recordingError}
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
