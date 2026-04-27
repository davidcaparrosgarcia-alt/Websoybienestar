import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function Resources() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  
  // Modals state
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [selectedBreathingInfographic, setSelectedBreathingInfographic] = useState<{ id: string, src: string } | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [pendingAction, setPendingAction] = useState<"reservado" | "emocional" | null>(null);

  useEffect(() => {
    // Scroll to color effect
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('grayscale', 'contrast-110');
          entry.target.classList.add('grayscale-0', 'contrast-100');
        } else {
          entry.target.classList.add('grayscale', 'contrast-110');
          entry.target.classList.remove('grayscale-0', 'contrast-100');
        }
      });
    }, { threshold: 0.5 });

    const imgs = document.querySelectorAll('.dynamic-color-img');
    imgs.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, []);

  // Audio Player State
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Code Modal State
  const [accessCode, setAccessCode] = useState(["", "", "", ""]);
  
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

  const closeAudioModal = () => {
    setIsAudioModalOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudio(null);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...accessCode];
    newCode[index] = value;
    setAccessCode(newCode);
    
    if (value && index < 3) {
      const el = document.getElementById(`code-input-${index + 1}`);
      el?.focus();
    }
  };

  const handleCodeSubmit = () => {
    const code = accessCode.join("");
    if (code.length === 4) {
      if (code === "1234" || code === "0000") { // Códigos de prueba
        setHasAccess(true);
        setIsCodeModalOpen(false);
        setAccessCode(["", "", "", ""]);
        
        if (pendingAction === "emocional") {
          setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/gestion-emocional.pdf' });
        } else if (pendingAction === "reservado") {
          alert("Acceso a contenido reservado concedido. (Área exclusiva en desarrollo)");
        }
        setPendingAction(null);
      } else {
        alert("Código incorrecto. Por favor, inténtelo de nuevo.");
        setAccessCode(["", "", "", ""]);
      }
    }
  };

  return (
    <div className="flex-1 bg-transparent text-on-surface w-full font-body relative">
      <main className="pt-12 md:pt-24 pb-24 max-w-screen-xl mx-auto px-6 lg:px-8">
        {/* Hero Header Section */}
        <header className="mb-24 mt-12">
          <div className="max-w-3xl">
            <p className="text-primary tracking-[0.2em] uppercase text-xs font-bold mb-4">Recursos de Claridad</p>
            <h1 className="font-headline text-5xl md:text-7xl text-primary leading-tight mb-8">
              El Refugio de la <span className="italic font-normal">Consciencia</span>
            </h1>
            <div className="h-px w-24 bg-primary/20 mb-8"></div>
            <p className="text-on-surface-variant text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              Una colección curada de herramientas diseñadas para calmar el espíritu y estructurar el pensamiento. Cada módulo es un paso hacia su arquitectura interior.
            </p>
          </div>
        </header>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Meditaciones (Main Feature) */}
          <div className="md:col-span-8 group cursor-pointer" onClick={() => setIsAudioModalOpen(true)}>
            <div className="relative overflow-hidden aspect-[16/9] rounded-2xl">
              <img alt="Meditaciones" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfN1KLjNEUOuARrTiE7gXulSa9Kc3gDaoiuciEFyr9W2a2_vYGBl8MG8tY0s7NgLQ8xtzmawsAH9-hz3-ZTChJ97u8oha7ei3ykxWndbZKwosHDSelxiIrmN9vGCvmMK-UwZ1kCVR22_QRFrsJO2TLPdbs4uxvgTox_9DNIKo-ItEJsjYcpAv2yl_YKLHRM_YVlg3k5YXe9hfkwmB0BaZendMwKPT55nl-F21yDkQbMQxepdQO4CwNKVJEqaCp9WcBLIUMmUhPJz0j" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#162839]/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10 text-white">
                <h2 className="font-headline text-4xl mb-2 text-white">Meditaciones</h2>
                <p className="text-white/80 font-light tracking-wide max-w-md">Guías sonoras para navegar el silencio y encontrar el centro gravitacional de su ser.</p>
              </div>
            </div>
          </div>

          {/* Diario de Gratitud */}
          <div className="md:col-span-4 group cursor-pointer flex flex-col" onClick={() => navigate('/emotion-diary')}>
            <div className="relative overflow-hidden aspect-[4/5] rounded-2xl mb-6">
              <img alt="Diario de Gratitud" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUuDrDPE8hGGe2nuQ6qyG5gvfpgu8Wu1ycLuXQ6MLgehZ7k9PXOHJ7flYxBAxKvivv1qsYPbAYaQQ-PCV3OGwSI8celpHqBwLLBI8iRMZLf7BoTVIAM-sIft0MJo_gY-n6fIkf5cTsqmOzsc-uPy3e7CPK_kQwKGURPMZMgsk9Xn2dn6gZ-i4WLzQqttT1i8oW2bvVfUtHpDMV1EGQE8FfC1KMUJTjCpTOZ95Xk3Ga8--e_zCCXHh57MT6pyN-TiZcxOA9ebVnTNmX" />
              <div className="absolute inset-0 bg-primary/10"></div>
            </div>
            <h3 className="font-headline text-2xl text-primary mb-2 italic">Diario de Gratitud</h3>
            <p className="text-on-surface-variant text-sm font-light leading-relaxed">Un espacio para anclar lo positivo y reconocer la abundancia en lo sutil.</p>
          </div>

          {/* Spacer Row with Text (Editorial feel) */}
          <div className="hidden md:block md:col-span-3"></div>
          <div className="md:col-span-9 py-12">
            <blockquote className="font-headline text-3xl text-primary italic leading-relaxed border-l-4 border-primary/10 pl-12">
              "La arquitectura del bienestar no es un destino, sino el diseño consciente de cada espacio mental que habitamos."
            </blockquote>
          </div>

          {/* Metas Semanales */}
          <div className="md:col-span-5 group cursor-pointer" onClick={() => navigate('/weekly-goals')}>
            <div className="bg-surface-container-low p-12 h-full flex flex-col justify-between rounded-2xl hover:bg-surface-container-highest transition-colors duration-500 border border-outline-variant/10">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-8">architecture</span>
                <h3 className="font-headline text-3xl text-primary mb-4">Metas Semanales</h3>
                <p className="text-on-surface-variant font-light leading-loose">Estructure sus intenciones con precisión arquitectónica. Defina objetivos que respiren y evolucionen con usted.</p>
              </div>
              <div className="mt-12 flex items-center gap-4 text-primary font-semibold tracking-widest text-xs uppercase group-hover:scale-105 transition-transform origin-left">
                <span>Configurar tablero</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Técnicas de Respiración */}
          <div className="md:col-span-7 group">
            <div className="relative overflow-hidden aspect-[16/10] rounded-2xl border border-outline-variant/10">
              <img alt="Respiración" className="dynamic-color-img w-full h-full object-cover transition-all duration-1000 grayscale contrast-110 md:group-hover:scale-105 group-hover:grayscale-0 group-hover:contrast-100 active:grayscale-0 active:contrast-100" src="/images/fondo-respira.jpg" />
              <div className="absolute inset-0 bg-primary/40 mix-blend-multiply transition-opacity duration-1000 group-hover:opacity-60"></div>
              <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 text-center pointer-events-none">
                <div className="w-full">
                  <p className="text-white/90 font-light text-xl">El ritmo de los pulmones es la base de toda estructura mental sólida.</p>
                </div>
                <div className="w-full">
                  <h3 className="font-headline text-4xl text-white">Técnicas de Respiración</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión Emocional (Full Width) */}
          <div 
            className="md:col-span-12 mt-12 group cursor-pointer"
            onClick={() => {
              setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/terapia_cognitiva.jpg' });
            }}
          >
            <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
              <div className="p-12 md:p-16 flex flex-col justify-center bg-surface-container-lowest z-10">
                <p className="text-primary tracking-widest uppercase text-[10px] font-bold mb-6">Nivel Avanzado</p>
                <h3 className="font-headline text-4xl md:text-5xl text-primary mb-8 leading-tight flex items-center justify-between">
                  <span>Gestión <br/><span className="italic">Emocional</span></span>
                  <span className="material-symbols-outlined opacity-50 group-hover:opacity-100 transition-opacity !text-[#162839] text-3xl">
                    open_in_new
                  </span>
                </h3>
                <p className="text-on-surface-variant text-lg font-light leading-relaxed mb-6 max-w-sm">
                    Aprenda a observar las mareas internas sin ser arrastrado por ellas. Un sistema de herramientas para la resiliencia y el equilibrio.
                </p>
                <ul className="text-on-surface-variant text-sm font-light leading-relaxed mb-10 max-w-sm space-y-3">
                  <li><span style={{fontSize: '12px', letterSpacing: '0.6px', textTransform: 'uppercase'}} className="text-primary/70 font-semibold">guia de módulos y método</span></li>
                  <li><span style={{fontSize: '12px', letterSpacing: '0.6px', textTransform: 'uppercase'}} className="text-primary/50 font-medium">Los módulos y método están reservados para miembros en sus zonas personalizadas</span></li>
                </ul>
                <button className="flex items-center justify-center gap-4 w-fit bg-primary dark:bg-[#1a252f] text-white px-10 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-secondary dark:hover:bg-[#2c3e50] transition-all">
                    Explorar Metodología
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>
              </div>
              <div className="relative min-h-[300px] md:min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/50 to-transparent z-10 md:block hidden"></div>
                <img alt="Gestión Emocional" className="dynamic-color-img absolute inset-0 w-full h-full object-cover grayscale contrast-110 opacity-90 transition-all duration-1000 group-hover:grayscale-0 group-hover:contrast-100 group-hover:opacity-100 active:grayscale-0 active:contrast-100 active:opacity-100" src="/images/fondo-gestion-emocional.jpg" />
              </div>
            </div>
          </div>
        </div>

        {/* Recursos Personalizados Section */}
        <section className="mt-32 py-24 border-t border-outline-variant/10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <div className="relative overflow-hidden aspect-[4/3] rounded-2xl group border border-outline-variant/10">
                <img alt="Recursos Personalizados" className="dynamic-color-img w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105 grayscale contrast-110 transition-all group-hover:grayscale-0 group-hover:contrast-100 active:grayscale-0 active:contrast-100" src="/images/logo-recursos.jpg" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply transition-opacity duration-1000 group-hover:opacity-60"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 max-w-xl">
              <p className="text-primary tracking-[0.2em] uppercase text-xs font-bold mb-4">Su Camino Único</p>
              <h2 className="font-headline text-4xl text-primary mb-6">Recursos Personalizados</h2>
              <p className="text-on-surface-variant text-lg font-light mb-10 leading-relaxed">
                Acceda a una selección de herramientas curadas específicamente para sus necesidades, basándose en sus prácticas recientes y su evolución personal hacia el bienestar integral.
              </p>
              <button 
                onClick={() => {
                  if (hasAccess) {
                    alert("Acceso a contenido reservado concedido. (Área exclusiva en desarrollo)");
                  } else {
                    setPendingAction("reservado");
                    setIsCodeModalOpen(true);
                  }
                }} 
                className="flex items-center justify-center gap-4 w-fit bg-primary dark:bg-[#1a252f] text-white px-8 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-secondary dark:hover:bg-[#2c3e50] transition-all"
              >
                {hasAccess ? "Ver Colección" : "Introducir Clave"}
                <span className="material-symbols-outlined text-sm dark:text-white">{hasAccess ? "arrow_forward" : "lock"}</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Modal for Meditations */}
      {isAudioModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border border-outline-variant/10">
            <button 
              onClick={closeAudioModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors z-10"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
            <div className="p-8 pb-6 border-b border-outline-variant/10 bg-surface">
              <h3 className="font-headline text-3xl text-primary mb-2">Meditaciones Guiadas</h3>
              <p className="text-on-surface-variant text-sm">Selecciona una meditación para comenzar tu práctica hoy.</p>
            </div>
            <div className="p-6 space-y-4">
              {meditations.map((meditation) => {
                const isPlaying = currentAudio === meditation.src && audioRef.current && !audioRef.current.paused;
                return (
                  <div key={meditation.id} className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container transition-colors">
                    <button 
                      onClick={() => handlePlay(meditation.src)}
                      className="w-14 h-14 shrink-0 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-2xl text-white dark:!text-[#162839]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline text-lg text-primary truncate border-b border-outline-variant/10 pb-1 mb-1">{meditation.title}</p>
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

      {/* Luxury Access Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0f12]/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-gradient-to-b from-[#1c2834] to-[#121a22] w-full max-w-sm rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#cca969]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsCodeModalOpen(false);
              }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-[100] border border-white/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-lg">close</span>
            </button>
            
            <div className="p-10 text-center relative z-10">
              <div className="w-16 h-16 mx-auto bg-[#cca969]/10 rounded-full flex items-center justify-center mb-6 border border-[#cca969]/20 shadow-[0_0_20px_rgba(204,169,105,0.1)]">
                <span className="material-symbols-outlined text-[#cca969] text-3xl">key</span>
              </div>
              <h3 className="font-headline text-2xl text-white mb-2 italic tracking-wide">Acceso Privado</h3>
              <p className="text-white/50 text-sm font-light mb-8">Introduzca su código de acceso de 4 dígitos proporcionado en consulta.</p>
              
              <div className="flex justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={accessCode[index]}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-14 h-16 text-center text-2xl font-serif text-[#cca969] bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#cca969]/50 focus:bg-white/10 transition-all shadow-inner"
                  />
                ))}
              </div>

              <button 
                onClick={handleCodeSubmit}
                disabled={accessCode.join("").length !== 4}
                className="w-full bg-gradient-to-r from-[#b39150] to-[#cca969] text-[#121a22] py-4 rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(204,169,105,0.3)] transition-all disabled:opacity-50 disabled:grayscale"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organic Animated Infographic Modal for Breathing Techniques */}
      <AnimatePresence>
        {selectedBreathingInfographic && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-white/20 backdrop-blur-sm"
              onClick={() => setSelectedBreathingInfographic(null)}
            />
            
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                layoutId={'card-' + selectedBreathingInfographic.id}
                className="relative w-full max-w-5xl max-h-[90vh] bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Elegant Action Buttons */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-[130]">
                  <a 
                    href={selectedBreathingInfographic.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur border border-outline-variant/30 hover:bg-surface text-primary flex items-center justify-center transition-all duration-300 shadow-sm group"
                    title="Abrir en pantalla completa / Descargar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">open_in_new</span>
                  </a>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBreathingInfographic(null);
                    }}
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur border border-outline-variant/30 hover:bg-surface text-primary flex items-center justify-center transition-all duration-300 shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
                  </button>
                </div>
                
                {/* Scrollable document area */}
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
                  {selectedBreathingInfographic.src.endsWith('.pdf') ? (
                    <motion.iframe 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      src={selectedBreathingInfographic.src} 
                      className="w-full h-[80vh] rounded-2xl relative z-[120] border-none bg-white shadow-sm"
                      title="Documento PDF"
                    />
                  ) : (
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      src={selectedBreathingInfographic.src} 
                      alt="Infografía Detalle" 
                      className="w-full h-auto rounded-xl shadow-sm relative z-[120]"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
