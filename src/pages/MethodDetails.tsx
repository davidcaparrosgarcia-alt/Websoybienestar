import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import NextStepsModal from "../components/NextStepsModal";
import SEO from "../components/SEO";

export default function MethodDetails() {
  const navigate = useNavigate();
  const [progressStep, setProgressStep] = useState(1);
  const [user] = useAuthState(auth);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isNextStepsModalOpen, setIsNextStepsModalOpen] = useState(false);

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
    setIsNextStepsModalOpen(true);
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
      <SEO
        title="Método ReprogrÁmate: claridad, cuestionario y dossier personal | SoyBienestar"
        description="Descubre las fases del método ReprogrÁmate: consulta inicial, Cuestionario Espejo, Dossier Espejo personalizado y próximos pasos de acompañamiento."
        canonicalPath="/method-details"
        noIndex={false}
      />
      {/* Hero: Professional Presentation with Large Logo Integration */}
      <section className="relative w-full aspect-[21/9] min-h-[600px] overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(min-width: 768px)" srcSet="/images/metodo-intro.jpg" />
            <img alt="Viaje Transformación" className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110" src="/images/metodo-intro.jpg"/>
          </picture>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center">
          <div 
            onClick={() => setIsVideoModalOpen(true)}
            className="mt-12 w-20 h-20 rounded-full border border-white/40 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform bg-white/5"
          >
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </div>
        </div>
      </section>

      {/* Intro Content */}
      <section className="px-8 md:px-24 py-24 flex flex-col lg:flex-row items-center gap-20 max-w-screen-2xl mx-auto">
        <div className="lg:w-1/2 flex justify-center lg:justify-start">
          <div className="relative group w-96 h-96 flex items-center justify-center overflow-hidden p-8">
            <img 
              alt="Logo Integrado" 
              className="relative w-full h-full object-cover" 
              src="/images/logo-integrado.jpg"
            />
          </div>
        </div>
        <div className="lg:w-1/2 space-y-8">
          <h1 className="font-label text-secondary font-semibold tracking-widest uppercase text-xs block mb-4">Método ReprogrÁmate: consulta, cuestionario y dossier personal</h1>
          <h2 className="font-headline text-4xl md:text-5xl text-primary italic leading-tight">Un espacio para ordenar lo que sientes y recuperar claridad.</h2>
          <p className="text-on-surface-variant leading-relaxed text-xl font-light">
            <span className="font-bold text-primary">SoyBienestar.es ReprogrÁmate</span> combina una consulta gratuita guiada, el Cuestionario Espejo y la revisión de un equipo humano para ayudarte a expresar lo que te ocurre, ordenar tu malestar emocional y recibir una primera orientación personalizada sin sentir que empiezas desde cero.
          </p>
          <div className="h-px w-24 bg-secondary/30"></div>
        </div>
      </section>

      {/* The Method: Puente Section */}
      <section className="w-full px-8 mb-24">
        <div 
          className="w-full max-w-screen-2xl mx-auto px-8 md:px-24 py-12 bg-surface-container-low rounded-[3rem] relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/images/fondo_privacidad.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/65 dark:bg-[#11181f]/45 pointer-events-none"></div>
          <div className="relative z-10 py-8 flex flex-col items-center justify-center space-y-10 w-full">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
              <h2 className="relative px-8 font-headline italic text-primary text-xl tracking-widest uppercase text-center bg-transparent">El Puente Digital</h2>
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

      {/* Next Steps Modal */}
      <NextStepsModal 
        isOpen={isNextStepsModalOpen}
        onClose={() => setIsNextStepsModalOpen(false)}
        user={user}
        hasDoneConsultation={progressStep >= 2}
        emailValue={user?.email || ""}
        phoneValue=""
      />

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
                  <p className="font-headline text-xl text-primary">Consultas</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">Vía WhatsApp</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
            <a 
              className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" 
              href="https://www.instagram.com/soybienestar.es?igsh=cGdycmIwNWZ3d3Zr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-secondary text-3xl">photo_camera</span>
                <div>
                  <p className="font-headline text-xl text-primary">Inspiración Diaria</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">Instagram</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" href="https://www.youtube.com/channel/UCz2TVzApLNgng3i9KDhnUdg" target="_blank" rel="noopener noreferrer">
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
        <div 
          className="p-16 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden flex flex-col items-center bg-cover bg-center"
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
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <video 
              controls 
              autoPlay 
              className="w-full h-full"
              src="/images/metodo-intro.mp4"
            >
              Tu navegador no soporta el video.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
