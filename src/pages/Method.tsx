import { useState, useEffect, useRef, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import NextStepsModal from "../components/NextStepsModal";

type FogTrailPoint = {
  id: number;
  x: number;
  y: number;
  createdAt: number;
  rx: number;
  ry: number;
  rotation: number;
};

export default function Method() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [selectedInfographic, setSelectedInfographic] = useState<{ id: string, src: string } | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hasDoneConsultation, setHasDoneConsultation] = useState(false);
  const [isNextStepsModalOpen, setIsNextStepsModalOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState("+34");
  const [progressStep, setProgressStep] = useState(1);

  const [fogTrail, setFogTrail] = useState<FogTrailPoint[]>([]);
  const [fogTick, setFogTick] = useState(() => Date.now());
  const lastFogPointAt = useRef(0);
  const fogPointId = useRef(0);

  const FOG_LIFE_MS = 1900;
  const FOG_ADD_INTERVAL_MS = 70;
  const MAX_FOG_TRAIL_POINTS = 22;

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setFogTick(now);
      setFogTrail((prev) => prev.filter((point) => now - point.createdAt < FOG_LIFE_MS));
    }, 80);

    return () => window.clearInterval(interval);
  }, []);

  const handleAnxietyFogMove = (event: MouseEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastFogPointAt.current < FOG_ADD_INTERVAL_MS) {
      return;
    }
    lastFogPointAt.current = now;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const safeX = Math.max(0, Math.min(100, x));
    const safeY = Math.max(0, Math.min(100, y));

    const point: FogTrailPoint = {
      id: fogPointId.current++,
      x: safeX,
      y: safeY,
      createdAt: now,
      rx: 8 + Math.random() * 4,
      ry: 5.5 + Math.random() * 3,
      rotation: Math.random() * 180,
    };

    setFogTrail((prev) => [...prev.slice(-MAX_FOG_TRAIL_POINTS + 1), point]);
  };

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHasDoneConsultation(data?.hasDoneConsultation === true);
          if (data?.hasDoneCuestionario) {
             setProgressStep(3);
          } else if (data?.hasDoneConsultation) {
             setProgressStep(2);
          } else {
             setProgressStep(1);
          }
          const contactPhone = data?.contactPhone || data?.phone || data?.whatsappPhone || data?.smsPhone || data?.telefono;
          if (contactPhone) {
            const prefix = data?.contactPhoneCountryCode || "+34";
            const fullPhone = contactPhone.startsWith('+') ? contactPhone : `${prefix}${contactPhone}`;
            setPhoneValue(fullPhone);
          }
        }
      });
    } else {
      setHasDoneConsultation(false);
      setProgressStep(1);
    }
  }, [user]);

  const handleConsultaClick = () => { navigate('/session'); };
  const handleCuestionarioClick = () => { setIsNextStepsModalOpen(true); };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ReprogrÁmate',
        text: 'Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un asistente inicial, con una orientación gratuita y máxima privacidad.',
        url: window.location.origin
      }).catch(console.error);
    } else {
      alert('La función de compartir no está soportada en este navegador, pero puedes copiar este enlace: ' + window.location.origin);
    }
  };

  return (
    <div className="flex-1 w-full">
      {/* Hero Section: Anxiety Hero */}
      <section 
        className="relative min-h-[85vh] flex items-center overflow-hidden bg-transparent"
        onMouseMove={handleAnxietyFogMove}
      >
        <div className="absolute inset-0 z-0">
          {/* Imagen base nítida */}
          <img
            alt="Dense atmospheric fog in a quiet forest at dawn"
            className="hidden lg:block w-full h-full object-cover"
            src="/images/ansiedad_impide_avanzar.jpg"
          />
          <img
            alt="Dense atmospheric fog in a quiet forest at dawn"
            className="block lg:hidden w-full h-full object-cover"
            src="/images/ansiedad_impide_avanzar_vertical.jpg"
          />

          {/* Overlay de niebla + atmósfera. El ratón despeja ESTA capa para revelar la imagen limpia */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="anxiety-fog-soften" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.65" />
              </filter>

              <filter id="anxiety-fog-texture" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.018 0.045"
                  numOctaves="2"
                  seed="11"
                  result="fogNoise"
                />
                <feDisplacementMap in="SourceGraphic" in2="fogNoise" scale="1.8" />
              </filter>

              <linearGradient id="anxiety-hero-atmosphere" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(44,62,80,0.70)" />
                <stop offset="55%" stopColor="rgba(44,62,80,0.30)" />
                <stop offset="100%" stopColor="rgba(44,62,80,0.06)" />
              </linearGradient>

              {/* Máscara: blanco = se mantiene el overlay / negro = se despeja y se ve la imagen limpia */}
              <mask id="anxiety-fog-cover-mask">
                <rect width="100" height="100" fill="white" />
                {fogTrail.map((point) => {
                  const progress = Math.min(1, Math.max(0, (fogTick - point.createdAt) / FOG_LIFE_MS));
                  const delayedProgress = Math.max(0, (progress - 0.18) / 0.82);
                  const opacity = Math.max(0, 0.92 * (1 - delayedProgress));

                  return (
                    <ellipse
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      rx={point.rx}
                      ry={point.ry}
                      fill="black"
                      opacity={opacity}
                      filter="url(#anxiety-fog-soften)"
                      transform={`rotate(${point.rotation} ${point.x} ${point.y})`}
                    />
                  );
                })}
              </mask>
            </defs>

            {/* Atmósfera azul oscura */}
            <rect
              width="100"
              height="100"
              fill="url(#anxiety-hero-atmosphere)"
              mask="url(#anxiety-fog-cover-mask)"
            />

            {/* Niebla principal blanca con textura */}
            <rect
              width="100"
              height="100"
              fill="rgba(255,255,255,0.22)"
              filter="url(#anxiety-fog-texture)"
              mask="url(#anxiety-fog-cover-mask)"
            />

            {/* Segunda capa de niebla suave para dar volumen */}
            <rect
              width="100"
              height="100"
              fill="rgba(255,255,255,0.10)"
              mask="url(#anxiety-fog-cover-mask)"
            />
          </svg>
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 md:px-12 w-full h-full min-h-[85vh] flex items-end justify-start pb-16 md:pb-20">
          <div className="max-w-xl bg-white/35 dark:bg-[#11181f]/40 backdrop-blur-md border border-white/25 dark:border-white/10 rounded-[1.75rem] p-6 md:p-8 shadow-xl">
            <p className="font-body text-xl md:text-2xl text-primary dark:text-white/90 leading-snug font-light">
              En{" "}
              <span className="font-headline text-3xl md:text-4xl font-semibold text-primary dark:text-white">
                ReprogrÁmate
              </span>
              , tratamos la ansiedad como una niebla que puedes despejar y volver a encontrar tu camino.
            </p>
          </div>
        </div>
      </section>

      {/* The Method: Puente Section */}
      <section className="w-full px-8 mb-24 mt-24">
        <div 
          className="w-full max-w-screen-2xl mx-auto px-8 md:px-24 py-12 bg-surface-container-low rounded-[3rem] relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/images/fondo_privacidad.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/65 dark:bg-[#11181f]/45 pointer-events-none"></div>
          <div className="relative z-10 py-8 flex flex-col items-center justify-center space-y-10 w-full">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
              <div className="relative px-8 font-headline italic text-primary text-xl tracking-widest uppercase">El Puente</div>
            </div>
            
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <button
                onClick={progressStep === 1 ? handleConsultaClick : undefined}
                className={`w-full py-4 rounded-xl font-label font-medium transition-all ${
                  progressStep > 1 
                    ? 'opacity-20 bg-surface-container text-on-surface-variant cursor-not-allowed' 
                    : progressStep === 1 
                      ? 'bg-primary dark:bg-[#d1e7e4] text-white dark:text-[#2c3e50] shadow-md hover:opacity-90 cursor-pointer' 
                      : 'opacity-50 bg-surface-container text-on-surface-variant cursor-not-allowed'
                }`}
              >
                Consulta Gratuita
              </button>
              <button
                disabled={progressStep !== 2}
                onClick={progressStep === 2 ? handleCuestionarioClick : undefined}
                className={`w-full py-4 rounded-xl font-label font-medium transition-all ${
                  progressStep > 2 
                    ? 'opacity-20 bg-surface-container text-on-surface-variant cursor-not-allowed'
                    : progressStep === 2
                      ? 'bg-primary dark:bg-[#d1e7e4] text-white dark:text-[#2c3e50] shadow-md hover:opacity-90 cursor-pointer'
                      : 'opacity-50 bg-surface-container text-on-surface-variant cursor-not-allowed hover:bg-transparent border border-outline-variant/20'
                }`}
              >
                Cuestionario Espejo
              </button>
              <button
                disabled={progressStep !== 3}
                onClick={progressStep === 3 ? () => navigate('/report') : undefined}
                className={`w-full py-4 rounded-xl font-label font-medium transition-all ${
                  progressStep === 3
                    ? 'bg-primary dark:bg-[#d1e7e4] text-white dark:text-[#2c3e50] shadow-md hover:opacity-90 cursor-pointer'
                    : 'opacity-50 bg-surface-container text-on-surface-variant cursor-not-allowed hover:bg-transparent border border-outline-variant/20'
                }`}
              >
                Dosier Personalizado
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Infografía: Puente Digital */}
      <section className="mx-8 xl:mx-auto mb-32 max-w-screen-2xl">
        <div className="w-full rounded-[3rem] overflow-hidden shadow-sm border border-outline-variant/10 bg-surface-container-low">
          <picture>
            <source media="(min-width: 768px)" srcSet="/images/puente-digital.jpg" />
            <img alt="Infografía Puente Digital" className="w-full h-auto block" src="/images/puente-digital-vertical.jpg" />
          </picture>
        </div>
      </section>

      {/* Treatments Bento Grid */}
      <section className="py-24 px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className="md:col-span-2 flex flex-col justify-center">
              <h2 className="text-4xl font-headline text-primary mb-4 italic">Áreas de Especialización</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl">Un enfoque integral para navegar los diferentes estados de la niebla emocional.</p>
            </div>
            <a href="#" className="group bg-primary-container p-6 rounded-2xl flex items-center justify-center text-center relative overflow-hidden hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 min-h-[120px]">
              <span className="font-headline text-2xl text-white relative z-10 group-hover:scale-105 transition-transform duration-500">Ver todos los tratamientos</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-surface dark:bg-[#d1e7e4] p-10 rounded-2xl flex flex-col justify-between h-[400px] hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="hidden dark:block pointer-events-none absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay"></div>
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-4xl mb-6 inline-block group-hover:scale-[1.3] transition-transform duration-500 origin-left">waves</span>
                  <h3 className="text-2xl font-headline text-primary dark:text-[#2c3e50] mb-4 transition-colors">Gestión de Ansiedad</h3>
                  <p className="text-on-surface-variant dark:text-[#43474c] leading-relaxed transition-colors">Reconoce tu estado actual para calmar las tormentas internas y recuperar el control del presente.</p>
                </div>
                <div className="w-fit">
                  <button onClick={() => navigate('/anxiety')} className="font-label text-sm font-semibold flex items-center gap-2 text-on-surface-variant dark:text-[#2c3e50] group-hover:text-primary dark:group-hover:text-[#1a252f] transition-all duration-500 group-hover:scale-[1.8] origin-left text-left">
                    LEER MÁS <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Card 2 (Highlight/Dark) */}
            <div className="group bg-primary-container p-10 rounded-2xl flex flex-col justify-between h-[400px] relative overflow-hidden hover:-translate-y-3 hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <span className="material-symbols-outlined text-8xl text-secondary-fixed group-hover:scale-110 transition-transform duration-500">light_mode</span>
              </div>
              <div className="z-10">
                <span className="material-symbols-outlined text-secondary-container text-4xl mb-6 inline-block group-hover:scale-[1.3] transition-transform duration-500 origin-left">psychology</span>
                <h3 className="text-2xl font-headline text-white mb-4">Gestión de Emociones</h3>
                <p className="text-on-primary-container leading-relaxed">Herramientas para comprender lo que sientes, ordenar tus pensamientos y responder con más calma.</p>
              </div>
              <div className="w-fit z-10">
                <button onClick={() => setSelectedInfographic({ id: 'terapia_cognitiva', src: '/images/info-terapia-cognitiva.jpg' })} className="font-label text-sm font-semibold flex items-center gap-2 text-secondary-fixed hover:opacity-80 transition-all duration-500 group-hover:scale-[1.8] origin-left">
                  DETALLES DEL MÉTODO <span className="material-symbols-outlined text-lg">open_in_new</span>
                </button>
              </div>
            </div>
            {/* Card 3 */}
            <div className="group bg-surface dark:bg-[#d1e7e4] p-10 rounded-2xl flex flex-col justify-between h-[400px] hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="hidden dark:block pointer-events-none absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay"></div>
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-4xl mb-6 inline-block group-hover:scale-[1.3] transition-transform duration-500 origin-left">self_improvement</span>
                  <h3 className="text-2xl font-headline text-primary dark:text-[#2c3e50] mb-4 transition-colors">ReprogrÁmate</h3>
                  <p className="text-on-surface-variant dark:text-[#43474c] leading-relaxed transition-colors">Espacios de silencio y reflexión guiada para conectar con tu centro interior, con herramientas diseñadas para ayudarte a recuperar calma, claridad y presencia.</p>
                </div>
                <div className="w-fit">
                  <button onClick={() => navigate('/zen')} className="font-label text-sm font-semibold flex items-center gap-2 text-on-surface-variant dark:text-[#2c3e50] group-hover:text-primary dark:group-hover:text-[#1a252f] transition-all duration-500 group-hover:scale-[1.8] origin-left text-left">
                    SABER MÁS <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section: The Bridge Metaphor */}
      <section className="relative min-h-[60vh] flex items-center pt-8 pb-16 px-12 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 z-10">
            <span className="font-label text-secondary font-semibold tracking-widest uppercase text-xs mb-6 block">Nuestro Método</span>
            <h2 className="text-5xl md:text-6xl font-headline text-primary leading-[1.1] mb-8">
              Cruzando el puente con SoyBienestar.es
            </h2>
            <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed mb-10">
              Entendemos la ansiedad no como un muro, sino como una niebla. Nuestro método utiliza la metáfora del puente: una estructura firme que te permite caminar desde la confusión hacia un horizonte despejado.
            </p>
          </div>
          <div className="lg:col-span-6 relative">
            <div
              onClick={() => setIsVideoModalOpen(true)}
              className="relative group aspect-video rounded-2xl overflow-hidden bg-surface-container-highest shadow-2xl cursor-pointer"
            >
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                alt="cinematic shot of a modern architectural wooden bridge disappearing into a soft morning mist at dawn with golden sunlight flares"
                src="/images/cruzando_el_puente.jpg"
              />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-headline text-3xl text-white uppercase tracking-tighter drop-shadow-xl">
                  Video Presentación: Nuestro Proceso
                </p>
              </div>
            </div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary-container/30 blur-[100px] rounded-full -z-10"></div>
          </div>
        </div>
      </section>


      {/* Contact and Network */}
      <section className="py-24 px-12" id="contacto">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-headline text-primary mb-8 italic">Conecta con Nosotros</h2>
            <p className="text-on-surface-variant mb-10 leading-relaxed">
              Explora nuestros recursos gratuitos en redes sociales o contáctanos de forma privada para una primera aproximación sin compromiso.
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <a className="flex items-center gap-4 group" href="https://www.youtube.com/channel/UCz2TVzApLNgng3i9KDhnUdg" target="_blank" rel="noopener noreferrer">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined">video_library</span>
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-primary">YouTube</h4>
                    <p className="text-xs text-on-surface-variant">Guías de meditación y charlas.</p>
                  </div>
                </a>
                <a 
                  className="flex items-center gap-4 group" 
                  href="https://www.instagram.com/soybienestar.es?igsh=cGdycmIwNWZ3d3Zr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-primary">Instagram</h4>
                    <p className="text-xs text-on-surface-variant">Dosis diarias de calma visual.</p>
                  </div>
                </a>
              </div>
              {/* Discrete WhatsApp Button */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent("Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un asistente inicial, con una orientación gratuita y máxima privacidad. ¡Pruébalo aquí: " + window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white px-8 py-3 rounded-full font-label font-semibold inline-flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100 w-fit"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.197 1.441 4.934 1.442 5.333 0 9.673-4.34 9.676-9.674.002-5.332-4.338-9.674-9.671-9.675-2.585-.001-5.015 1.007-6.843 2.837-1.828 1.83-2.834 4.26-2.835 6.844-.001 1.705.469 3.376 1.36 4.827l-1.055 3.854 3.954-1.035zm12.188-4.63c-.334-.167-1.974-.974-2.279-1.084-.303-.11-.524-.167-.745.167-.221.334-.856 1.084-1.05 1.308-.194.223-.389.25-.723.084-.333-.167-1.408-.52-2.681-1.656-.991-.884-1.659-1.976-1.853-2.31-.194-.334-.021-.514.146-.68.15-.15.334-.389.501-.584.166-.194.222-.333.333-.556.111-.223.056-.417-.028-.584-.084-.167-.745-1.794-1.021-2.459-.269-.646-.543-.558-.745-.568-.192-.01-.413-.012-.634-.012-.221 0-.579.083-.883.417-.304.334-1.162 1.14-1.162 2.783 0 1.643 1.198 3.226 1.365 3.449.167.222 2.358 3.599 5.712 5.048.798.344 1.42.55 1.905.706.802.255 1.533.219 2.11.134.643-.095 1.974-.807 2.251-1.587.277-.779.277-1.447.194-1.586-.083-.14-.304-.223-.637-.39z"></path></svg>
                  Consulta por WhatsApp
                </a>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary transition-all">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-primary">Email</h4>
                    <p className="text-xs text-on-surface-variant">contacto@SoyBienestar.es</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button 
                onClick={() => {
                  if (hasDoneConsultation) {
                    setIsNextStepsModalOpen(true);
                  } else {
                    navigate('/session');
                  }
                }}
                className="text-white w-full h-24 rounded-full font-label font-semibold flex justify-center items-center gap-3 shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url("/images/fondo_boton.jpg")' }}
              >
                <span className="material-symbols-outlined text-xl">psychology</span>
                {hasDoneConsultation ? "¿Qué debo hacer ahora?" : "Iniciar Consulta Gratuita"}
              </button>
            </div>
          </div>
          <div 
            className="p-10 md:p-12 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden flex flex-col items-center bg-cover bg-center h-full justify-center"
            style={{ backgroundImage: "url('/images/fondo_compartir.jpg')" }}
          >
            <div className="absolute inset-0 bg-[#2c3e50]/55 dark:bg-[#11181f]/45 pointer-events-none"></div>
            <div className="relative z-10 space-y-8 w-full max-w-md flex flex-col items-center">
              <h2 className="font-headline text-3xl text-white dark:text-[#2c3e50] italic font-light">¿Listo para comenzar tu propio viaje?</h2>
              <Link 
                to="/report#next-steps"
                className="w-full py-6 bg-white dark:bg-[#1a252f] text-primary dark:text-white rounded-full font-headline italic tracking-wide text-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98] block"
              >
                ¿Dónde estoy?
              </Link>
              <button 
                onClick={handleShare}
                className="w-full py-6 bg-white dark:bg-[#1a252f] text-primary dark:text-white rounded-full font-headline italic tracking-wide text-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                Compartir este Santuario
              </button>
              <p className="text-[11px] text-white/60 dark:text-[#2c3e50]/70 uppercase tracking-[0.4em] font-medium">Compasión • Tecnología • Silencio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Organic Animated Infographic Modal */}
      <AnimatePresence>
        {selectedInfographic && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm"
              onClick={() => setSelectedInfographic(null)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                layoutId={'card-' + selectedInfographic.id}
                className="relative w-full max-w-5xl max-h-[90vh] bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Elegant Action Buttons */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-[130]">
                  <a 
                    href={selectedInfographic.src} 
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
                      setSelectedInfographic(null);
                    }}
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur border border-outline-variant/30 hover:bg-surface text-primary flex items-center justify-center transition-all duration-300 shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
                  </button>
                </div>
                
                {/* Scrollable document area */}
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    src={selectedInfographic.src} 
                    alt="Infografía Detalle" 
                    className="w-full h-auto rounded-xl shadow-sm"
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsVideoModalOpen(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Close Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoModalOpen(false);
                  }}
                  className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 z-[100] rounded-full bg-black/50 backdrop-blur border border-white/20 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                >
                  <span className="material-symbols-outlined text-2xl font-light">close</span>
                </button>
                
                {/* Video Player */}
                <video 
                  className="w-full h-full object-contain bg-black"
                  controls
                  autoPlay
                  controlsList="nodownload"
                >
                  <source src="/videos/video-metodo.mp4" type="video/mp4" />
                  Tu navegador no soporta la etiqueta de vídeo.
                </video>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <NextStepsModal 
        isOpen={isNextStepsModalOpen}
        onClose={() => setIsNextStepsModalOpen(false)}
        user={user}
        hasDoneConsultation={hasDoneConsultation}
        emailValue={user?.email || ""}
        phoneValue={phoneValue}
      />
    </div>
  );
}
