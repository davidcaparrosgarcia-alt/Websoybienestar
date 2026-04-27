import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SessionEnded() {
  const location = useLocation();
  const navigate = useNavigate();
  const messages = location.state?.messages || [];
  const reportData = location.state?.reportData || null;
  const [user, loading] = useAuthState(auth);
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;
      
      const isDeveloper = user?.email === "davidcaparrosgarcia@gmail.com";
      if (isDeveloper) {
        setIsAuthorized(true);
        return;
      }

      if (!user) {
        setIsAuthorized(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data()?.hasDoneConsultation) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [user, loading]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const meditations = [
    {
      id: "breve",
      title: "La Niebla Mental",
      type: "Meditación Breve",
      duration: "Aprox 5 min",
      src: "/audios/meditacion_guiada_breve/meditacion_guiada_breve.m4a"
    },
    {
      id: "standard",
      title: "Ducha de lluvia",
      type: "Meditación Standard",
      duration: "Aprox 15 min",
      src: "/audios/meditacion_guiada_standard/meditacion_guiada_standard.m4a"
    }
  ];

  const handlePlay = (src: string) => {
    if (currentAudio === src && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    } else {
      setCurrentAudio(src);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 50);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudio(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ReprogrÁmate - Mi progreso',
      text: 'Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un asistente inicial, con una orientación gratuita y máxima privacidad.',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + " ¡Pruébalo aquí: " + shareData.url)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="flex-1 w-full bg-transparent flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-secondary text-4xl">progress_activity</span>
          <p className="font-label text-on-surface-variant">Verificando estado de la sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex-1 w-full bg-transparent p-8 flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md w-full bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 text-center space-y-6">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="font-headline text-2xl text-primary">Acceso Restringido</h2>
          <p className="text-on-surface-variant leading-relaxed">
            Esta página solo está disponible tras completar con éxito y validar la Consulta Gratuita. Por favor, finalice una sesión validada por la IA para continuar.
          </p>
          <button onClick={() => navigate("/")} className="w-full bg-primary text-on-primary py-3 rounded-xl font-label flex items-center justify-center gap-2 hover:bg-secondary transition-all">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-transparent">
      <div className="pt-8 pb-32 px-4 md:px-6 max-w-4xl mx-auto w-full">
        {/* Hero Section */}
        <section className="relative min-h-[400px] flex flex-col justify-end mb-12 overflow-hidden rounded-2xl shadow-xl">
          <div className="absolute inset-0 z-0">
            <img alt="Atmospheric landscape" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc5MKzE6-DBk-xVDt3skrnsm3x7l8XeaqQJ--9w4TXlTeHZmh1Wo3GLxf2kSrN5ZZADR8e-k5PNSZVTARNh1XnegNmmuVdPudCfK3Xdl-lbASlqJhlASZ2bfHVl9qUPO4V8PZKE8G-25DDa94T3rXERTMYoYgcqQDlmhZPGmAN__2Qm69PRbuxOxOQPFJKLVr3xDfakIOoXslF3RCGV5ocNZLusgarJ7aCWVhEpLnvjMbXjE_eZxz1jduEeHdGLYiWTF3vGkL4ChTL"/>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
          </div>
          <div className="relative z-10 p-6 md:p-10">
            <span className="inline-block px-3 py-1 mb-4 text-[10px] tracking-[0.15em] uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full">Proceso Finalizado</span>
            <h2 className="font-headline text-4xl md:text-5xl text-white leading-tight mb-4">Sesión Finalizada con Éxito</h2>
            <p className="text-white/90 font-body text-base md:text-lg max-w-lg leading-relaxed">
              Tu camino hacia la claridad continúa. Hemos comenzado a procesar tu experiencia.
            </p>
          </div>
        </section>

        {/* Information Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="space-y-4">
            <h3 className="font-headline text-2xl text-primary italic border-l-4 border-secondary/50 pl-4">Análisis en curso</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Nuestro sistema de IA ha comenzado a procesar las narrativas compartidas durante tu sesión para identificar patrones y pilares de bienestar.
            </p>
          </div>
          <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">mail</span>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Cuestionario Espejo</h4>
                <p className="text-sm text-on-surface-variant">Recibirás un enlace para profundizar en tu realidad cotidiana.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">psychology</span>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Alineación Colaborativa</h4>
                <p className="text-sm text-on-surface-variant">Tus respuestas construirán una orientación detallada con nuestros especialistas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Section: Servicios Desbloqueados */}
        <section className="mb-16">
          <div className="flex flex-col mb-8">
            <h3 className="font-headline text-3xl text-primary mb-2">Servicios Desbloqueados</h3>
            <p className="text-on-surface-variant text-sm uppercase tracking-widest">Herramientas para tu práctica diaria</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="h-48 overflow-hidden">
                <img alt="Meditaciones" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGnbeBF5RxwwXbeBMx6b7GBso36ljns-OQbul2RlhitOIxvd4wltjGHLtKDgaHQtE0OVTEsHWR9if6Gmu7THucto0YwjL4xsVGPsvgb8N17GzEstHx4iKkhS2jwDJRTQ-fxkAongY9C8Dkd355E-ER0poImQ8JbsnvfKQgAQiBECO2sZwxOrP-_08KxUTwdL5LENtFetBHZ6nqlVxF8d0mphhlBMBhRUWvDM1CDbVwiR5UjpLrb53YcqIifjK7-OSq-Ahyl5XkfuRd"/>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Bienestar Mental</span>
                  <span className="material-symbols-outlined text-primary text-xl">spa</span>
                </div>
                <h4 className="font-headline text-xl text-primary mb-2">Meditaciones Guiadas</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">Sesiones auditivas para anclar tu presencia.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explorar <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="h-48 overflow-hidden">
                <img alt="Ejercicios" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVGzkzRKrBjebS5objlCcFmQZdfeI5FJqJb9fVGJRkOiu_eX0dwkJ-jrnmdt091I1xChI21TzyKq26my2PoJ1vPH5irvoPjBFpVJG1so3VlPGhURsGRsvJjhKrRX1QplYI8jwWPvYa17xzh3spWYh1iCI1qoe35KylfeR-heXrYRYbm3F4NiNlGgZD-_0WK8HHv3o-oYI1-5ZzxJj9mtL5h7A3Tk5n5DLKW0LBpEKhtfwYfG-5iqgC8_iM68ZoemZRLmwiV7kVHNJz"/>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Reflexión Activa</span>
                  <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                </div>
                <h4 className="font-headline text-xl text-primary mb-2">Ejercicios de Claridad</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">Prácticas para integrar tus descubrimientos.</p>
                <button onClick={() => navigate("/report", { state: { messages, reportData } })} className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Ver mi Informe <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="flex flex-col gap-4 items-center justify-center py-8 border-t border-outline-variant/10">
          <button onClick={() => navigate("/")} className="w-full md:w-auto bg-primary text-on-primary px-10 py-4 rounded-full font-bold text-base hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">dashboard</span>
            Ir al Inicio
          </button>
          <button onClick={handleShare} className="w-full md:w-auto bg-transparent text-primary border border-primary/20 px-10 py-3 rounded-full font-bold text-sm hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">share</span>
            Compartir Experiencia
          </button>
          <p className="mt-4 text-on-surface-variant text-xs font-light italic">Tu progreso ha sido guardado automáticamente.</p>
        </div>
      </div>

      {/* Floating Modal for Meditations */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors z-10"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
            <div className="p-8 pb-6 border-b border-outline-variant/10">
              <h3 className="font-headline text-3xl text-primary mb-2">Meditaciones Guiadas</h3>
              <p className="text-on-surface-variant text-sm">Selecciona una meditación para comenzar tu práctica.</p>
            </div>
            <div className="p-4 space-y-4">
              {meditations.map((meditation) => {
                const isPlaying = currentAudio === meditation.src && audioRef.current && !audioRef.current.paused;
                return (
                  <div key={meditation.id} className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4">
                    <button 
                      onClick={() => handlePlay(meditation.src)}
                      className="w-14 h-14 shrink-0 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline text-lg text-primary truncate border-b border-primary/10 pb-1 mb-1">{meditation.title}</p>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="font-semibold uppercase tracking-wider">{meditation.type}</span>
                        <span>•</span>
                        <span className="opacity-80">{meditation.duration}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Audio Element Hidden */}
            {currentAudio && (
              <div className="p-4 bg-primary/5 pt-2">
                <audio 
                  ref={audioRef} 
                  src={currentAudio} 
                  controls 
                  className="w-full h-10" 
                  onPlay={() => setCurrentAudio(currentAudio)}
                  onEnded={() => setCurrentAudio(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
