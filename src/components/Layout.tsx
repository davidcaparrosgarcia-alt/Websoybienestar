import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logOut } from "../firebase";
import ScrollArrows from "./ScrollArrows";
import { runLazyDataRetentionAndCleanup } from "../services/dataRetention";
import { motion, AnimatePresence } from "motion/react";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Trigger lazy cleanup non-blockingly without awaiting
      runLazyDataRetentionAndCleanup(user.uid);
    }
  }, [user]);

  const handleAuthAction = () => {
    if (user) {
      logOut();
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path === "/method" && location.pathname === "/method-details");
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
              className="fixed inset-0 bg-black/60 z-[90] md:hidden" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-[#2c3e50] z-[100] shadow-2xl p-8 flex flex-col md:hidden"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="self-end mb-10 text-white"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
              <div className="flex flex-col gap-8">
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/")} to="/">Inicio</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/method")} to="/method">El Método</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/session")} to="/session">Consulta Gratuita</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/report")} to="/report">Informe</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/resources")} to="/resources">Recursos</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/privacy")} to="/privacy">Privacidad</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="w-full top-0 sticky z-50 bg-[#2c3e50] border-b border-white/10 relative">
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

        <nav className="flex justify-relative items-center justify-between px-6 md:px-12 py-4 max-w-screen-2xl mx-auto relative z-10">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={(e) => {
              if (window.innerWidth < 768) {
                e.preventDefault();
                setIsMobileMenuOpen(true);
              } else {
                navigate('/');
              }
            }}
          >
            <div className="text-lg md:text-xl font-headline font-bold text-white">
              ReprogrÁmate <span className="italic font-light text-secondary">SoyBienestar.es</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link className={getLinkClass("/")} to="/">Inicio</Link>
            <Link className={getLinkClass("/method")} to="/method">El Método</Link>
            <Link className={getLinkClass("/session")} to="/session">Consulta Gratuita</Link>
            <Link className={getLinkClass("/report")} to="/report">Informe</Link>
            <Link className={getLinkClass("/resources")} to="/resources">Recursos</Link>
            <Link className={getLinkClass("/privacy")} to="/privacy">Privacidad</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <button onClick={handleAuthAction} className="bg-white text-[#11181f] px-3 md:px-5 py-2.5 rounded-lg font-label text-xs md:text-sm md:scale-95 duration-200 ease-in-out hover:bg-gray-200 whitespace-nowrap">
              {user ? "Cerrar Sesión" : "Iniciar Sesión"}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
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
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="font-headline text-2xl text-[#f9f9f8]">
              ReprogrÁmate <span className="italic font-light text-secondary">SoyBienestar.es</span>
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
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/method-details">Método</Link>
              <a 
                className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors cursor-pointer" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/method');
                  setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
              >
                Contacto
              </a>
            </div>
            <div className="space-y-4 flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/70 mb-2">Legal</span>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/privacy">Privacidad</Link>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/">Términos</Link>
              <Link className="font-body text-sm font-light tracking-wide text-white/80 hover:text-white transition-colors" to="/">Cookies</Link>
            </div>
          </div>
          <div className="flex flex-col items-end gap-8">
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-white/60 text-xl">psychology</span>
              <span className="material-symbols-outlined text-white/60 text-xl">favorite</span>
              <span className="material-symbols-outlined text-white/60 text-xl">spa</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 italic">Sanando desde el centro.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
