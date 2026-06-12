import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logOut, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import ScrollArrows from "./ScrollArrows";
import { runLazyDataRetentionAndCleanup } from "../services/dataRetention";
import { motion, AnimatePresence } from "motion/react";
import ThemeToggle from "./ThemeToggle";
import NextStepsModal from "./NextStepsModal";

export default function Layout() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasDoneConsultation, setHasDoneConsultation] = useState(false);
  const [dossierAvailable, setDossierAvailable] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [isNextStepsModalOpen, setIsNextStepsModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (user) {
      // Trigger lazy cleanup non-blockingly without awaiting
      runLazyDataRetentionAndCleanup(user.uid);
      
      const loadUserProcessState = async () => {
        try {
          const udRef = doc(db, "users", user.uid);
          const snap = await getDoc(udRef);
          if (snap.exists() && !cancelled) {
            const data = snap.data();
            
            const consultationDone =
              data?.hasDoneConsultation === true ||
              data?.consultationCompleted === true ||
              data?.sessionCompleted === true;

            const questionnaireCompleted =
              data?.hasDoneCuestionario === true ||
              data?.questionnaireStatus === "completed" ||
              data?.questionnaireStatus === "concluded" ||
              data?.questionnaireStatus === "finalized" ||
              data?.questionnaireStatus === "dossier_available";

            const dossierReady =
              !!data?.dossierAvailableAt ||
              !!data?.latestDossier ||
              !!data?.dossierViewedAt ||
              questionnaireCompleted;

            const contactPhone =
              data?.contactPhone ||
              data?.phone ||
              data?.whatsappPhone ||
              data?.smsPhone ||
              data?.telefono ||
              "";

            setHasDoneConsultation(consultationDone);
            setDossierAvailable(dossierReady);
            setPhoneValue(contactPhone ? String(contactPhone) : "");
          }
        } catch (error) {
          console.error("Error loading mobile process CTA state", error);
        }
      };
      loadUserProcessState();
    } else {
      if (!cancelled) {
        setHasDoneConsultation(false);
        setDossierAvailable(false);
        setPhoneValue("");
      }
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleAuthAction = () => {
    if (user) {
      logOut();
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const getMobilePrimaryCtaLabel = () => {
    if (dossierAvailable) return "Ir al dosier";
    if (hasDoneConsultation) return "Solicitar cuestionario";
    return "Consulta gratuita";
  };

  const handleMobilePrimaryCta = () => {
    if (dossierAvailable) {
      navigate("/report");
      return;
    }

    if (!user) {
      navigate("/session");
      return;
    }

    if (hasDoneConsultation) {
      setIsNextStepsModalOpen(true);
      return;
    }

    navigate("/session");
  };

  const getLinkClass = (path: string) => {
    const activeGroups: Record<string, string[]> = {
      "/tratamientos-online": ["/tratamientos-online", "/treatments", "/reprogramate", "/hipnodigestive", "/hipnodisgest"],
      "/como-trabajamos": ["/como-trabajamos", "/method", "/method-details"],
      "/quienes-somos": ["/quienes-somos", "/como-trabajamos/detalles"],
      "/herramientas": ["/herramientas", "/resources"],
    };

    const aliases = activeGroups[path] ?? [path];
    const isActive = aliases.includes(location.pathname);

    if (isActive) {
      // Activo: Blanco puro
      return "text-white border-b-2 border-white pb-1 font-bold font-headline text-lg";
    }
    // Hover: blanco puro en oscuro y color fuerte
    return "text-[#e5e2de] opacity-80 hover:text-white hover:opacity-100 transition-all font-headline text-lg";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollArrows />
      
      {/* Drawer Móvil (Menú Desplegable) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[90] lg:hidden" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-[#2c3e50] z-[100] shadow-2xl p-8 flex flex-col lg:hidden"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="self-end mb-10 text-white"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
              <div className="flex flex-col gap-8">
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/")} to="/">Inicio</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/tratamientos-online")} to="/tratamientos-online">Tratamientos</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/session")} to="/session">Consulta Gratuita</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/report")} to="/report">Tu Dosier Personal</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/herramientas")} to="/herramientas">Herramientas</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/como-trabajamos")} to="/como-trabajamos">Nuestro Método</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/quienes-somos")} to="/quienes-somos">Quiénes somos</Link>
                <div className="h-px bg-white/10 my-2" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleAuthAction();
                  }}
                  className="text-[#e5e2de] opacity-80 hover:text-white hover:opacity-100 transition-all font-headline text-lg text-left"
                >
                  {user ? "Cerrar sesión" : "Iniciar sesión"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#2c3e50] border-b border-white/10">
        {/* Luxury Leather Texture Overlay - Menú */}
        <div className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light opacity-[0.3] overflow-hidden">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <filter id="leather-header">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04"
                numOctaves="3"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0,
                        0 0 0 0 0,
                        0 0 0 0 0,
                        1 0 0 0 0"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#leather-header)" />
          </svg>
        </div>

        <nav className="flex justify-between lg:grid lg:grid-cols-[220px_1fr_220px] items-center w-full px-4 md:px-8 py-2.5 md:py-3 max-w-7xl mx-auto relative z-10 gap-2 lg:gap-8">
          <div 
            className="flex items-center justify-start cursor-pointer"
            onClick={(e) => {
              if (window.innerWidth < 1024) {
                e.preventDefault();
                setIsMobileMenuOpen(true);
              } else {
                navigate('/');
              }
            }}
          >
            <div className="text-white flex flex-col items-start leading-tight text-left">
              <span className="font-headline font-bold text-xl md:text-2xl lg:hidden">SoyBienestar</span>
              <span className="lg:hidden italic font-light text-secondary text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-sm leading-none">keyboard_arrow_down</span>
                Menú
              </span>
              <span className="hidden lg:block font-headline font-bold text-lg md:text-xl">ReprogrÁmate</span>
              <span className="hidden lg:block italic font-light text-secondary text-sm md:text-lg">SoyBienestar.es</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center lg:gap-5 xl:gap-7">
            <Link className={getLinkClass("/")} to="/">Inicio</Link>
            <Link className={getLinkClass("/tratamientos-online")} to="/tratamientos-online">Tratamientos</Link>
            <Link className={`${getLinkClass("/session")} text-center leading-[1.1]`} to="/session">
              Consulta<br className="hidden lg:block xl:hidden" /> Gratuita
            </Link>
            <Link className={getLinkClass("/report")} to="/report">Informe</Link>
            <Link className={getLinkClass("/herramientas")} to="/herramientas">Herramientas</Link>
            <Link className={getLinkClass("/como-trabajamos")} to="/como-trabajamos">Método</Link>
            <Link className={`${getLinkClass("/quienes-somos")} text-center leading-[1.1]`} to="/quienes-somos">
              Quiénes<br className="hidden lg:block xl:hidden" /> somos
            </Link>
          </div>
          <div className="flex items-center justify-end gap-2 md:gap-4 pl-0 lg:pl-8 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="hidden md:flex lg:hidden text-white/80 hover:text-white items-center justify-center transition-colors mr-1"
              title="Volver atrás"
            >
              <span className="material-symbols-outlined font-light text-2xl" style={{ fontVariationSettings: "'wght' 300" }}>arrow_back</span>
            </button>
            <button
              type="button"
              onClick={handleMobilePrimaryCta}
              className="lg:hidden h-10 px-3 sm:px-4 rounded-full bg-transparent border border-[#e5e2de]/70 text-[#e5e2de] hover:text-white hover:border-white/90 font-label text-[11px] sm:text-xs font-medium tracking-wide transition-all duration-300 whitespace-nowrap flex items-center justify-center"
            >
              {getMobilePrimaryCtaLabel()}
            </button>
            <ThemeToggle />
            {/* Desktop Auth Button */}
            <button onClick={handleAuthAction} className="hidden lg:block bg-white text-[#11181f] px-3 md:px-5 py-2.5 rounded-lg font-label text-xs md:text-sm md:scale-95 duration-200 ease-in-out hover:bg-gray-200 whitespace-nowrap">
              {user ? "Cerrar Sesión" : "Iniciar Sesión"}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col w-full overflow-x-hidden pt-[72px] md:pt-[78px]">
        <Outlet />
      </main>

      <footer className="bg-[#2c3e50] w-full py-10 px-8 border-t border-white/10 relative overflow-hidden">
        {/* Luxury Leather Texture Overlay - Footer */}
        <div className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light opacity-[0.3] overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <filter id="leather-footer">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" />
              <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 1 0 0 0 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#leather-footer)" />
          </svg>
        </div>
        
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="font-headline text-2xl text-[#f9f9f8] flex flex-col items-start xl:flex-row xl:items-baseline xl:gap-2 leading-tight text-left">
              <span>ReprogrÁmate</span>
              <span className="italic font-light text-secondary text-lg">SoyBienestar.es</span>
            </div>
            <p className="font-body text-xs font-light uppercase tracking-[0.2em] text-white/80 max-w-xs leading-loose">
              ReprogrÁmate SoyBienestar.es <br/>
              © 2024. Tu espacio de claridad.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-6">
            <div className="space-y-4 flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/70 mb-2">Compañía</span>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/">Inicio</Link>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/quienes-somos">Quiénes somos</Link>
              <a 
                className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors cursor-pointer" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/como-trabajamos');
                  setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
              >
                Contacto
              </a>
            </div>
            <div className="space-y-4 flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/70 mb-2">Legal</span>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/privacy">Privacidad</Link>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/terms">Términos</Link>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/cookies">Cookies</Link>
            </div>
          </div>
          <div className="flex flex-col items-end gap-8">
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-white/60 text-xl">psychology</span>
              <span className="material-symbols-outlined text-white/60 text-xl">favorite</span>
              <span className="material-symbols-outlined text-white/60 text-xl">spa</span>
            </div>
            <div className="flex flex-col items-end gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 italic">Sanando desde el centro.</p>
              <Link to="/report#next-steps" className="font-headline text-2xl text-[#f9f9f8] hover:text-white transition-colors">¿Dónde estoy?</Link>
            </div>
          </div>
        </div>
      </footer>

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
