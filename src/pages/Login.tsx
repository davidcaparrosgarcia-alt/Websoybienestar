import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle } from "../firebase";

export default function Login() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState("");

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async () => {
    try {
      setErrorMsg("");
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
      setErrorMsg("No se pudo iniciar sesión. Por favor, permite las ventanas emergentes (popups) en tu navegador.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-secondary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-5.5rem)]">
      <section className="relative flex-1 flex items-center justify-center overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover grayscale opacity-20" alt="Distant lighthouse beam cutting through dense white coastal fog at dusk, dramatic lighting and moody oceanic atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBePndAwe0rBGmFcIRMQZrREcwyz93bRjTkCtA5AJAQypyye26tKrStGwNEHHGX3AX3f6km37DZLT7-luKsktmZfZKKONSECeehzlvFrfBsL4hdyFXdiI5lnE87f8zAxAo--zXSko7gTxzCA8H06EjKpJbkEMVlMMnUW9_v-HTIUzGyHs7u9s0XsGIogMo9qMwPaLhXsu5RKQjfLOcA3pgYhhg1n2SDQW794r-7F6Iq-e2ong1Kgzo7wjVO9pvIutKoQOci1xdmsW9h"/>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface"></div>
        </div>
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="text-center mb-12">
            <span className="material-symbols-outlined text-primary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4 leading-tight">Acceso Privado</h1>
            <p className="text-on-surface-variant font-body">Su espacio es un lugar sagrado. Por favor, valide su identidad para continuar.</p>
          </div>
          <div className="bg-surface-container p-8 rounded-lg shadow-sm border border-outline-variant/15">
            <button 
              onClick={handleLogin}
              className="w-full bg-primary-container text-on-primary py-4 rounded-md font-label font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path>
              </svg>
              <span>Validar Identidad con Google</span>
            </button>
            {errorMsg && (
              <p className="text-error text-sm mt-4 text-center">{errorMsg}</p>
            )}
            <p className="mt-4 text-center text-xs font-label text-on-surface-variant/60 italic">Su seguridad es nuestra prioridad.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
