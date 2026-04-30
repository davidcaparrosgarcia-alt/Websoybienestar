import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, signInWithGoogle } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Zen() {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  
  // Modals state
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [selectedBreathingInfographic, setSelectedBreathingInfographic] = useState<{ id: string, src: string } | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [pendingAction, setPendingAction] = useState<"reservado" | "emocional" | null>(null);
  const [isGrayscaleForceOff, setIsGrayscaleForceOff] = useState(false);

  // Form states for Registration Modal
  const [emailChecked, setEmailChecked] = useState(true);
  const [emailValue, setEmailValue] = useState("");
  const [whatsappChecked, setWhatsappChecked] = useState(false);
  const [whatsappValue, setWhatsappValue] = useState("+34");
  const [smsChecked, setSmsChecked] = useState(false);
  const [smsValue, setSmsValue] = useState("+34");
  const [hasDoneConsultation, setHasDoneConsultation] = useState(false);

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

  useEffect(() => {
    if (user?.email) {
      setEmailValue(user.email);
    }
    
    if (!user) {
      setHasDoneConsultation(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        setHasDoneConsultation(docSnap.data()?.hasDoneConsultation === true);
      } else {
        setHasDoneConsultation(false);
      }
    }).catch((error) => {
      console.error("Firestore error in Zen:", error);
    });
  }, [user]);

  const handleRegisterClick = async () => {
    if (user) {
      setIsRegModalOpen(true);
    } else {
      try {
        await signInWithGoogle();
        setIsRegModalOpen(true);
      } catch (e) {
        console.error("Error signing in:", e);
      }
    }
  };

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
          setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/gestión-emocional.pdf' });
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

  const handleFormSubmit = () => {
    setIsRegModalOpen(false);
    alert("Solicitud enviada correctamente. Recibirá el enlace a la brevedad.");
  };

  return (
    <div className="flex-1 bg-transparent text-on-surface w-full font-body relative">

      {/* Hero Section: "The Breathing Hero" */}
      <header className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Watercolor illustration of a serene sanctuary in misty mountains" className="w-full h-full object-cover" data-alt="Serene watercolor painting of a traditional oriental sanctuary nestled among misty turquoise mountains and calm waters with pink lotus flowers" src="/images/fondo-zen.jpg"/>
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-12 flex flex-col md:flex-row items-end gap-12">
          <div className="md:w-3/5 bg-white/5 backdrop-blur-md p-12 rounded-2xl shadow-xl">
            <h1 className="text-6xl lg:text-7xl font-headline mb-8 leading-tight !text-[#0a0a0a]">Tu refugio de calma te espera.</h1>
            <p className="text-xl font-body leading-relaxed mb-8 max-w-2xl font-medium !text-[#111111]">
              El acceso a nuestra plataforma de bienestar es exclusivo y gratuito. Comienza tu camino de introspección registrándote y completando nuestra <span className="italic font-bold">Consulta con IA</span> y el <span className="italic font-bold">Cuestionario Espejo</span>.
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={handleRegisterClick} 
                disabled={loading}
                className="px-10 py-5 bg-primary text-on-primary font-body font-semibold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
              >
                {loading ? "CARGANDO..." : "REGISTRARSE AHORA"}
              </button>
              <button onClick={() => navigate('/method')} className="px-10 py-5 bg-secondary-container text-on-secondary-container font-body font-semibold rounded-2xl hover:bg-surface-container-highest transition-all">
                SABER MÁS
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Herramientas Section: Bento Grid */}
      <section className="py-32 bg-transparent">
        <div className="max-w-screen-2xl mx-auto px-12">
          <div className="mb-20">
            <h2 className="text-4xl lg:text-5xl font-headline text-primary mb-4">Herramientas diseñadas para habitar el presente</h2>
            <div className="h-1 w-24 bg-primary-container"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Large card */}
            <div 
              onClick={() => setIsAudioModalOpen(true)}
              className="cursor-pointer md:col-span-2 bg-surface-container-low p-10 rounded-2xl flex flex-col justify-between group hover:bg-surface-container transition-colors duration-500 border border-outline-variant/10"
            >
              <div>
                <span className="material-symbols-outlined text-4xl text-primary mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                <h3 className="text-2xl font-headline text-primary mb-4">Meditaciones guiadas</h3>
                <p className="text-on-surface-variant max-w-md">Sesiones inmersivas de audio diseñadas para reducir la ansiedad y reconectar con tu esencia en momentos de ruido externo.</p>
              </div>
              <div className="mt-8 flex justify-end">
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
              </div>
            </div>
            {/* Small card */}
            <div 
              onClick={() => navigate('/emotion-diary')}
              className="bg-surface-container-highest p-10 rounded-2xl hover:translate-y-[-4px] transition-transform duration-300 border border-outline-variant/10 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-4xl text-primary mb-6">edit_note</span>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
              </div>
              <h3 className="text-2xl font-headline text-primary mb-4">Diario de emociones</h3>
              <p className="text-on-surface-variant">Un espacio seguro para volcar tus pensamientos y rastrear tu evolución emocional día tras día.</p>
            </div>
            {/* Three columns */}
            <div 
              onClick={() => navigate('/weekly-goals')}
              className="bg-surface-container-lowest border border-outline-variant/10 p-10 rounded-2xl shadow-sm hover:translate-y-[-4px] transition-transform duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-4xl text-primary mb-6">calendar_today</span>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
              </div>
              <h3 className="text-2xl font-headline text-primary mb-4">Propósitos semanales</h3>
              <p className="text-on-surface-variant">Pequeños pasos conscientes hacia metas de bienestar realistas y transformadoras.</p>
            </div>
            <div onClick={() => setIsBreathingModalOpen(true)} className="cursor-pointer bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10 group hover:bg-surface-container transition-colors duration-500 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-4xl text-primary mb-6">air</span>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
              </div>
              <h3 className="text-2xl font-headline text-primary mb-4">Técnicas de respiración</h3>
              <p className="text-on-surface-variant">Ejercicios rítmicos para regular el sistema nervioso y recuperar el control en segundos.</p>
            </div>
            <div 
              onClick={() => {
                if (hasAccess) {
                  setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/gestión-emocional.pdf' });
                } else {
                  setPendingAction("emocional");
                  setIsCodeModalOpen(true);
                }
              }}
              className="bg-surface dark:bg-[#d1e7e4] p-10 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 border border-primary/10"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-4xl mb-6 !text-[#162839]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <span className="material-symbols-outlined opacity-50 group-hover:opacity-100 transition-opacity !text-[#162839]">
                    {hasAccess ? 'open_in_new' : 'lock'}
                  </span>
                </div>
                <h3 className="text-2xl font-headline mb-4 !text-[#162839]">Gestión Emocional</h3>
                <p className="!text-[#334155]">Módulos avanzados de autoconocimiento basados en arquitectura psicológica moderna.</p>
              </div>
              
              {!hasAccess && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex flex-col items-center justify-start py-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 px-6 py-3 rounded-full shadow-lg border border-[#162839]/10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm !text-[#162839]" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
                    <span className="font-label text-sm font-bold !text-[#162839] tracking-widest">SE REQUIERE CLAVE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Guías Section: Editorial Layout */}
      <section className="py-32 bg-transparent">
        <div className="max-w-screen-2xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative group cursor-pointer" 
                 onClick={() => setIsGrayscaleForceOff(!isGrayscaleForceOff)}
                 onTouchStart={() => setIsGrayscaleForceOff(true)}
            >
              <img alt="Person meditating in calm space" className={`w-full h-[600px] object-cover rounded-2xl transition-all duration-700 shadow-xl ${isGrayscaleForceOff ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} data-alt="A person sitting in a peaceful meditative pose in a bright, minimalist room with natural wood and linen textures, soft morning sunlight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDezZvAvohhg90z-FTDQW9ufFmgWrxZPty-2arqGExkoV24NqfkSISG7KE5JVsEo0ORJ2wF5JMmiOx-UyeYtMXfYQ8Qh6oUZaFp9yH0gVDPFMiVwlyRnpgbOBOJenwANXkJSf9QVLWs0AB3hmwoP_Z82QRlb1klqJ1Q8TLLLznwaOGLgsvYzxkitC15QbWUMqgI_ECGqlLzGzUtlyvTDTVjnhcptoa-6fITF7H_6ixQFsOy5FfunomGUPQ6pE2qdHNkrmfotoCFFKu9"/>
              <div className="absolute -bottom-8 -right-8 bg-primary-container text-on-primary p-8 rounded-full hidden xl:block max-w-xs shadow-2xl">
                <p className="font-headline italic text-lg text-on-primary-container">"La paz no es la ausencia de ruido, sino la armonía dentro de él."</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-headline mb-8 text-[#162839] dark:text-white">Guías de relajación progresiva</h2>
            <p className="font-body text-lg leading-relaxed mb-10 text-[#334155] dark:text-white/90">
              Nuestra biblioteca exclusiva ofrece un viaje sensorial a través de paisajes visuales y auditivos diseñados para desarticular la tensión acumulada. Cada guía ha sido curada para ofrecer una experiencia inmersiva que trasciende lo digital.
            </p>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[#162839] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-medium uppercase tracking-widest text-xs text-[#162839] dark:text-white/80">Contenido validado por expertos</span>
              </li>
              <li className="flex items-center gap-4 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[#162839] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-medium uppercase tracking-widest text-xs text-[#162839] dark:text-white/80">Disponible 24/7 en cualquier dispositivo</span>
              </li>
              <li className="flex items-center gap-4 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[#162839] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-medium uppercase tracking-widest text-xs text-[#162839] dark:text-white/80">Acceso sólo a miembros del ciclo completo</span>
              </li>
            </ul>
            <button 
              onClick={() => {
                if (hasAccess) {
                  alert("Acceso a contenido reservado concedido. (Área exclusiva en desarrollo)");
                } else {
                  setPendingAction("reservado");
                  setIsCodeModalOpen(true);
                }
              }} 
              className="group flex items-center gap-4 font-bold text-lg hover:opacity-80 transition-opacity text-[#162839] dark:text-white"
            >
              <span className="text-[#162839] dark:text-white">Acceder a contenido reservado</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2 text-[#162839] dark:text-white">lock_open</span>
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Area */}
      <section className="py-24 bg-transparent flex justify-center border-t border-outline-variant/10">
        <button onClick={() => navigate('/session')} className="px-16 py-8 bg-primary-container text-on-primary font-headline text-2xl rounded-full shadow-2xl hover:bg-primary transition-colors duration-500 !text-white dark:!text-white">
          Iniciar Consulta Gratuita
        </button>
      </section>

      {/* Registration Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setIsRegModalOpen(false)}
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
                  {hasDoneConsultation ? (
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
                      className="text-sm px-3 py-1.5 bg-surface-container rounded-md border border-outline-variant/20 focus:ring-1 focus:ring-primary outline-none flex-1 min-w-0"
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
                    <input 
                      type="tel" 
                      value={whatsappValue} 
                      onChange={(e) => setWhatsappValue(e.target.value)}
                      className="text-sm px-3 py-1.5 bg-surface-container rounded-md border border-outline-variant/20 focus:ring-1 focus:ring-[#25D366] outline-none flex-1 min-w-0"
                      placeholder="+34"
                    />
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
                    <input 
                      type="tel" 
                      value={smsValue} 
                      onChange={(e) => setSmsValue(e.target.value)}
                      className="text-sm px-3 py-1.5 bg-surface-container rounded-md border border-outline-variant/20 focus:ring-1 focus:ring-primary outline-none flex-1 min-w-0"
                      placeholder="+34"
                    />
                  </label>
                </form>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleFormSubmit}
                    className="bg-primary text-on-primary px-8 py-3 rounded-full font-label font-bold text-sm shadow-md hover:bg-primary-container hover:shadow-lg transition-all"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => setIsCodeModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10 border border-white/10"
            >
              <span className="material-symbols-outlined text-white/70 text-sm">close</span>
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


      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border border-outline-variant/10">
            <button 
              onClick={() => setIsBreathingModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors z-10"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
            <div className="p-8 pb-6 border-b border-outline-variant/10 bg-surface">
              <h3 className="font-headline text-3xl text-primary mb-2">Ejercicios de Respiración</h3>
              <p className="text-on-surface-variant text-sm">Selecciona una técnica para ver las instrucciones guiadas paso a paso.</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { id: '1', title: 'Respiración Cuadrada', type: 'ENFOQUE' },
                { id: '2', title: 'Respiración 4-7-8', type: 'CALMA' },
                { id: '3', title: 'Respiración Abdominal', type: 'PROFUNDA' },
              ].map((technique) => (
                <div 
                  key={technique.id} 
                  onClick={() => {
                    setIsBreathingModalOpen(false);
                    const imageMap: Record<string, string> = {
                      '1': '/images/info-resp-cuadrada.jpg',
                      '2': '/images/info-resp-478.jpg',
                      '3': '/images/info-resp-abdominal.jpg'
                    };
                    setSelectedBreathingInfographic({ id: technique.id, src: imageMap[technique.id] });
                  }}
                  className="cursor-pointer bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container transition-colors group"
                >
                  <div className="w-14 h-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shadow-sm">
                    <span className="material-symbols-outlined text-2xl">air</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-lg text-primary truncate border-b border-outline-variant/10 pb-1 mb-1">{technique.title}</p>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="font-semibold uppercase tracking-wider">{technique.type}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
                </div>
              ))}
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
