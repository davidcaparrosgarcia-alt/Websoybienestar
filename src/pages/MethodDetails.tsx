import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MethodDetails() {
  const navigate = useNavigate();
  const [progressStep, setProgressStep] = useState(1);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Step 1 is default (Consultation)
            // If they did consultation, Step is 2 (Cuestionario)
            // Assume we add 'hasDoneCuestionario' in the future
            if (data.hasDoneCuestionario) {
              setProgressStep(3);
            } else if (data.hasDoneConsultation) {
              setProgressStep(2);
            } else {
              setProgressStep(1);
            }
          }
        } catch (e) {
           console.error("Error fetching user progress", e);
        }
      } else {
         setProgressStep(1);
      }
    };
    fetchProgress();
  }, [user]);

  const handleConsultaClick = () => {
    navigate('/session');
  };

  const handleCuestionarioClick = () => {
    // navigate('/cuestionario');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ReprogrÁmate - Nuestro Método',
      text: 'Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un guía de IA, con una orientación gratuita y máxima privacidad.',
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
    <div className="flex-1 flex flex-col">
      {/* Hero: Professional Presentation with Large Logo Integration */}
      <section className="relative w-full aspect-[21/9] min-h-[600px] overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(min-width: 768px)" srcSet="/images/viaje-transformacion.jpg" />
            <img alt="Viaje Transformación" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="/images/viaje-transformacion.jpg"/>
          </picture>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center">
          <div className="mt-12 w-20 h-20 rounded-full border border-white/40 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform bg-white/5">
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </div>
        </div>
      </section>

      {/* Intro Content */}
      <section className="px-8 md:px-24 py-24 flex flex-col lg:flex-row items-center gap-20 max-w-screen-2xl mx-auto">
        <div className="lg:w-1/2 flex justify-center lg:justify-start">
          <div className="relative group w-96 h-96 flex items-center justify-center overflow-hidden p-8">
            <div className="absolute bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all -inset-8"></div>
            <img 
              alt="Logo Integrado" 
              className="relative w-full h-full object-cover scale-110" 
              style={{ maskImage: 'radial-gradient(circle at center, black 40%, rgba(0,0,0,0) 65%)', WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0,0,0,0) 65%)' }}
              src="/images/logo-integrado.jpg"
            />
          </div>
        </div>
        <div className="lg:w-1/2 space-y-8">
          <h2 className="font-headline text-4xl md:text-5xl text-primary italic leading-tight">La arquitectura del bienestar moderno.</h2>
          <p className="text-on-surface-variant leading-relaxed text-xl font-light">
            <span className="font-bold text-primary">SoyBienestar.es ReprogrÁmate</span> no es solo una plataforma; es un refugio diseñado para equilibrar la precisión de la inteligencia artificial con la profundidad irreemplazable de la escucha humana.
          </p>
          <div className="h-px w-24 bg-secondary/30"></div>
        </div>
      </section>

      {/* The Method: IA + Humano Grid */}
      <section className="px-8 md:px-24 py-24 bg-surface-container-low rounded-[3rem] mx-8 mb-24 max-w-screen-2xl xl:mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
          {/* Phase 1 */}
          <div className="bg-surface-container-lowest p-12 rounded-[2.5rem] border border-outline-variant/10 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>analytics</span>
              </div>
              <h3 className="font-headline text-3xl text-primary mb-6">Fase 1: Claridad Algorítmica</h3>
              <p className="text-lg text-on-surface-variant leading-relaxed font-light">
                Nuestra IA analiza patrones de lenguaje y estados emocionales para proporcionar un mapa inicial de su paisaje interior, eliminando el ruido y detectando lo esencial.
              </p>
            </div>
          </div>
          {/* Phase 2 */}
          <div className="bg-primary dark:bg-[#d1e7e4] p-12 rounded-[2.5rem] shadow-2xl flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500 text-white dark:text-[#2c3e50]">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 dark:bg-[#2c3e50]/10 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-white dark:text-[#2c3e50] text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>auto_awesome</span>
              </div>
              <h3 className="font-headline text-3xl mb-6 text-white dark:text-[#2c3e50]">Fase 2: Conexión Humana</h3>
              <p className="text-lg text-white/90 dark:text-[#43474c] leading-relaxed font-light">
                Donde la IA termina, comienza el equipo humano. Un guía experto recibe su "mapa" para profundizar en la empatía, la intuición y el acompañamiento real que solo otra alma puede ofrecer.
              </p>
            </div>
          </div>
        </div>
        <div className="relative py-12 flex flex-col items-center justify-center space-y-12">
          <div className="relative w-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
            <div className="relative bg-surface-container-low px-8 font-headline italic text-primary text-xl tracking-widest uppercase">El Puente</div>
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
              Dossier Personalizado
            </button>
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

      {/* Channels & Action */}
      <section className="px-8 md:px-24 mb-32 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center max-w-screen-2xl mx-auto">
        <div className="space-y-6">
          <h4 className="font-sans text-xs uppercase tracking-[0.4em] text-outline mb-12">Canales de Acompañamiento</h4>
          <div className="space-y-4">
            <a 
              className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" 
              href={`https://wa.me/?text=${encodeURIComponent("Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un guía, con una orientación y máxima privacidad. ¡Pruébalo aquí: " + window.location.origin)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-secondary text-3xl">chat</span>
                <div>
                  <p className="font-headline text-xl text-primary">Consultas Discretas</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">Vía WhatsApp</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" href="#">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-secondary text-3xl">photo_camera</span>
                <div>
                  <p className="font-headline text-xl text-primary">Inspiración Diaria</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">Instagram</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" href="#">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-secondary text-3xl">smart_display</span>
                <div>
                  <p className="font-headline text-xl text-primary">Sesiones de Claridad</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">YouTube</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
          </div>
        </div>
        <div className="bg-primary dark:bg-[#d1e7e4] p-16 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 opacity-10">
            <img alt="texture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNm2HLjqWbCmeIQ8CL4M7kRUrRaLJ3rJned_WLrEtgJWunyIhBaQYl2KQGy26WkLNaUyXUNifaFltAmoRY4PPxIOUnEithCUKe611JWkfeU-ums-vc0mf2Z6hyPFW_nW8CnGt_nTBzXY3jIefolNjxMNsTGoNq1MsTrbsh6AyPizoejtDbL0byUjeQbfkMT4woWyD5XWh7W89K19IZ-2G_XLTi0SbuP2pbT45MUlGC3UfYm9Vo9qXeNnN95IOabEVVAjhv9NvuFLEm"/>
          </div>
          <div className="relative z-10 space-y-8 w-full max-w-md">
            <img alt="SoyBienestar.es Logo White" className="h-32 w-auto mx-auto brightness-0 invert opacity-40 mb-4 dark:brightness-0 dark:invert-0 dark:opacity-60" src="/images/logo-soybienestar.svg"/>
            <h2 className="font-headline text-3xl text-white dark:text-[#2c3e50] italic font-light">¿Listo para comenzar su propio viaje?</h2>
            <button 
              onClick={handleShare}
              className="w-full py-6 bg-white dark:bg-[#1a252f] text-primary dark:text-white rounded-full font-headline italic tracking-wide text-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              Compartir este Santuario
            </button>
            <p className="text-[11px] text-white/60 dark:text-[#2c3e50]/70 uppercase tracking-[0.4em] font-medium">Compasión • Tecnología • Silencio</p>
          </div>
        </div>
      </section>
    </div>
  );
}
