import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Markdown from "react-markdown";
import { api } from "../services/api";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  
  const messages = location.state?.messages || [];
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const generateReport = async () => {
      // Small delay or check to ensure auth state is resolved or we don't care initially if they are anonymous.
      // We will save if user is present.
      if (!messages || messages.length <= 1) {
        setReport("No hay suficiente información en la sesión para generar un informe detallado.");
        setIsLoading(false);
        return;
      }

      try {
        let accumulatedSummary = "";
        
        // Obtenemos historial si el usuario está logueado
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              accumulatedSummary = userDoc.data()?.accumulatedSummary || "";
            }
          } catch (e) {
            console.error("Firebase read error", e);
          }
        }

        const parsedData = await api.report(messages, accumulatedSummary);

        if (parsedData) {
          if (parsedData.validConclusion) {
            setReport(parsedData.markdownReport);
            
            // Guardar en Firebase si hay usuario
            if (user) {
              const conversationText = messages
                .map((msg: any) => `${msg.role === "user" ? "Paciente" : "IA"}: ${msg.content}`)
                .join("\n\n");

              const userRef = doc(db, "users", user.uid);
              const docSnap = await getDoc(userRef);
              
              const updateData = {
                hasDoneConsultation: true,
                accumulatedSummary: parsedData.newAccumulatedSummary,
                latestSessionTranscript: conversationText,
                lastUpdated: new Date().toISOString()
              };

              if (docSnap.exists()) {
                await updateDoc(userRef, updateData);
              } else {
                await setDoc(userRef, updateData);
              }
            }
          } else {
            setReport("La sesión no proporcionó suficiente información estructurada para alcanzar una conclusión clínica válida y guardarla en el historial. Por favor, realice una sesión más profunda.");
          }

        } else {
          setError("No se pudo generar el informe.");
        }
      } catch (err) {
        console.error("Error generating report:", err);
        setError("Ocurrió un error al analizar la clínica o el formato de respuesta de la IA.");
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
  }, [messages, user]);

  const handleShare = async () => {
    const shareData = {
      title: 'ReprogrÁmate - Sesión Gratuita',
      text: 'Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un terapeuta de IA, con una conclusión gratuita y máxima privacidad.',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + " ¡Pruébalo aquí: " + shareData.url)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="flex-1 bg-surface w-full">
      {/* POST-ACCESS CONTENT: BENTO GRID SUMMARY */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-16 border-l-4 border-secondary pl-8">
          <h2 className="text-5xl font-headline font-bold text-primary mb-4">Su Informe de Bienestar</h2>
          <p className="text-xl text-on-surface-variant max-w-2xl">Resultados preliminares basados en su sesión. Una brújula para navegar su momento actual.</p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="material-symbols-outlined animate-spin text-secondary text-4xl">progress_activity</span>
            <p className="font-label text-on-surface-variant">Analizando su sesión y generando el informe...</p>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container p-8 rounded-xl border border-error/20">
            <p className="font-headline text-xl mb-2">No se pudo generar el informe</p>
            <p className="font-body">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Main AI Report Markdown Rendering */}
            <div className="md:col-span-12 bg-surface-container p-10 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 prose prose-slate max-w-none text-on-surface">
                <Markdown>{report || ""}</Markdown>
              </div>
            </div>

            {/* Meditation Placeholder */}
            <div className="md:col-span-6 bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 group">
              <div className="flex items-start justify-between mb-12">
                <div>
                  <h4 className="text-2xl font-headline font-bold text-primary mb-2">Meditación: "La Niebla Mental"</h4>
                  <p className="text-on-surface-variant font-label">Ejercicio guiado • 5 minutos</p>
                </div>
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-primary hover:bg-primary-container hover:scale-105 transition-all flex items-center justify-center text-white cursor-pointer shadow-md">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer" onClick={togglePlay}>
                <img className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105 opacity-80' : 'group-hover:scale-105'}`} alt="Minimalist mountain landscape with soft clouds and ethereal morning light, zen meditation aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFUALo3f7B6x6NjOC9HNYr2mjq7WSHLlC4tyP2TEl2c6cZo1BoPjNHGWbz4NpOMu26F0IliuGEjJ4d1YtYqEQov3BoiQwsadBxCx1e1JkwZU4oQnT3IWFzcq2f-Sg44FA8f-1CTMJOvGpqWXtns16uOOr-qn3Z3-LjZAMds5UpORSdLBYKnPeibhnnMY3iy3AVfib0fMzCf8jwY4fMrYbyjaLWta-pTxJZ-PLm2qAmJFe_ngOlzX5vi9_1uwIw10MpNegmpvpTp0hs"/>
                <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className="text-white font-label font-bold uppercase tracking-widest">Reproducir ahora</span>
                </div>
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-1 items-center justify-center h-12">
                      <div className="w-1.5 h-1/3 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '0ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-2/3 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '200ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-full bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '400ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-1/2 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '600ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-1/4 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '800ms', animationDuration: '800ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              <audio 
                ref={audioRef} 
                src="/audios/meditacion_guiada_breve/meditacion_guiada_breve.m4a" 
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
              />
            </div>

            {/* Next Steps Checklist */}
            <div className="md:col-span-6 bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10">
              <h4 className="text-2xl font-headline font-bold text-primary mb-6">Próximos Pasos</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border-2 border-secondary rounded-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-sm font-bold">check</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-primary">Sesión de Validación</p>
                    <p className="text-sm text-on-surface-variant">Reserve su encuentro individual con un especialista para validar estos hallazgos.</p>
                    <button className="mt-2 text-secondary text-sm font-label font-bold underline">Agendar ahora</button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border-2 border-outline-variant rounded-md"></div>
                  <div>
                    <p className="font-headline font-bold text-primary">Cuestionario "El Espejo"</p>
                    <p className="text-sm text-on-surface-variant">Profundice en las raíces de la niebla detectada con nuestro test avanzado.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border-2 border-outline-variant rounded-md"></div>
                  <div>
                    <p className="font-headline font-bold text-primary">Descarga de Guía</p>
                    <p className="text-sm text-on-surface-variant">Obtenga el PDF con ejercicios prácticos para su rutina diaria.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SHARE THE LIGHT FOOTER CTA */}
      <section className="max-w-screen-xl mx-auto px-6 mb-24">
        <div className="bg-secondary-fixed p-12 md:p-20 rounded-3xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6">¿Le ha servido este proceso?</h2>
            <p className="text-lg text-on-secondary-container max-w-2xl mx-auto mb-10">Creemos que nadie debería navegar la oscuridad a solas. Comparta la posibilidad de encontrar un faro con alguien que lo necesite.</p>
            <button onClick={handleShare} className="bg-primary text-white px-10 py-4 rounded-full font-label font-semibold flex items-center gap-3 mx-auto hover:scale-105 transition-transform">
              <span className="material-symbols-outlined">share</span>
              Compartir la Luz
            </button>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
}
