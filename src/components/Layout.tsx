import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logOut } from "../firebase";
import ScrollArrows from "./ScrollArrows";
import { runLazyDataRetentionAndCleanup } from "../services/dataRetention";

export default function Layout() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();

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
      return "text-[#42617c] dark:text-[#d1e4fb] border-b-2 border-[#42617c] pb-1 font-bold font-headline text-lg";
    }
    return "text-[#2c3e50] dark:text-[#e5e2de] opacity-80 hover:text-[#42617c] transition-all font-headline text-lg";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollArrows />
      <header className="w-full top-0 sticky z-50 bg-[#f9f9f8] dark:bg-[#2c3e50] border-b border-outline-variant/10">
        <nav className="flex justify-between items-center px-12 py-4 max-w-screen-2xl mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="text-xl font-headline font-bold text-primary dark:text-white">ReprogrÁmate <span className="italic font-light text-secondary">SoyBienestar.es</span></div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className={getLinkClass("/")} to="/">Inicio</Link>
            <Link className={getLinkClass("/method")} to="/method">Nuestro Método</Link>
            <Link className={getLinkClass("/session")} to="/session">Consulta</Link>
            <Link className={getLinkClass("/report")} to="/report">Mi Informe</Link>
            <Link className={getLinkClass("/privacy")} to="/privacy">Privacidad</Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <button className="flex items-center gap-1 font-label text-sm uppercase tracking-wider text-[#2c3e50] dark:text-white hover:text-secondary transition-all">
                ES <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-surface-container-lowest shadow-xl rounded-lg border border-outline-variant/20 hidden group-hover:block overflow-hidden z-50">
                <a className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low" href="#">Español</a>
                <a className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low" href="#">Catalán</a>
                <a className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low" href="#">Euskera</a>
                <a className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low" href="#">Gallego</a>
              </div>
            </div>
            <button onClick={handleAuthAction} className="bg-[#2c3e50] text-white px-5 py-2.5 rounded-lg font-label text-sm scale-95 duration-200 ease-in-out hover:bg-primary-container">
              {user ? "Cerrar Sesión" : "Iniciar Sesión"}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-surface-container-highest dark:bg-[#2c3e50] w-full py-10 px-8 border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="font-headline text-2xl text-primary dark:text-[#f9f9f8]">
              ReprogrÁmate <span className="italic font-light text-secondary">SoyBienestar.es</span>
            </div>
            <p className="font-body text-xs font-light uppercase tracking-[0.2em] text-primary/80 dark:text-white/80 max-w-xs leading-loose">
              ReprogrÁmate SoyBienestar.es <br/>
              © 2024. Tu espacio de claridad.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-6">
            <div className="space-y-4 flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/70 dark:text-white/70 mb-2">Compañía</span>
              <Link className="font-body text-sm font-light tracking-wide text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors" to="/">Inicio</Link>
              <Link className="font-body text-sm font-light tracking-wide text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors" to="/method-details">Método</Link>
              <a 
                className="font-body text-sm font-light tracking-wide text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors cursor-pointer" 
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
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/70 dark:text-white/70 mb-2">Legal</span>
              <Link className="font-body text-sm font-light tracking-wide text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors" to="/privacy">Privacidad</Link>
              <Link className="font-body text-sm font-light tracking-wide text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors" to="/">Términos</Link>
              <Link className="font-body text-sm font-light tracking-wide text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors" to="/">Cookies</Link>
            </div>
          </div>
          <div className="flex flex-col items-end gap-8">
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-primary/60 text-xl">psychology</span>
              <span className="material-symbols-outlined text-primary/60 text-xl">favorite</span>
              <span className="material-symbols-outlined text-primary/60 text-xl">spa</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 dark:text-white/80 italic">Sanando desde el centro.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
