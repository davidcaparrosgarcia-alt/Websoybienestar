import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import NextStepsModal from "../components/NextStepsModal";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";

export default function Treatments() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [selectedInfographic, setSelectedInfographic] = useState<{ id: string, src: string, mobileSrc?: string, plan?: "basico" | "intermedio" | "completo" } | null>(null);
  const [hasDoneConsultation, setHasDoneConsultation] = useState(false);
  const [hasDoneCuestionario, setHasDoneCuestionario] = useState(false);
  const [dossierAvailable, setDossierAvailable] = useState(false);
  const [dossierViewed, setDossierViewed] = useState(false);
  const [isNextStepsModalOpen, setIsNextStepsModalOpen] = useState(false);
  const [showReservationState, setShowReservationState] = useState(false);

  const handleReservationClick = () => {
    if (dossierViewed) {
      if (selectedInfographic?.plan) {
         navigate(`/reservar-programa?plan=${selectedInfographic.plan}`);
      } else {
         navigate('/reservar-programa');
      }
    } else {
      setShowReservationState(true);
    }
  };

  const renderReservationState = () => {
    if (!user) {
      return (
        <div className="bg-[#11181f]/80 p-6 md:p-8 rounded-2xl max-w-2xl mx-auto text-center border border-white/10 mt-8 mb-4">
          <p className="text-white/90 text-lg mb-6 leading-relaxed">Para reservar un programa necesitamos que inicies sesión. Así podremos guardar tu proceso y acompañarte de forma segura.</p>
          <button onClick={() => navigate('/login')} className="bg-white text-[#11181f] px-8 py-3 rounded-full font-label font-bold hover:scale-105 transition-transform">Iniciar sesión</button>
        </div>
      );
    }
    if (!hasDoneConsultation) {
      return (
        <div className="bg-[#11181f]/80 p-6 md:p-8 rounded-2xl max-w-2xl mx-auto text-center border border-white/10 mt-8 mb-4">
          <p className="text-white/90 text-lg mb-6 leading-relaxed">Antes de reservar, necesitamos conocer tu punto de partida. La consulta gratuita nos ayuda a orientarte mejor y a recomendarte el programa adecuado.</p>
          <button onClick={() => navigate('/session')} className="bg-white text-[#11181f] px-8 py-3 rounded-full font-label font-bold hover:scale-105 transition-transform">Realizar consulta gratuita</button>
        </div>
      );
    }
    if (!hasDoneCuestionario) {
      return (
        <div className="bg-[#11181f]/80 p-6 md:p-8 rounded-2xl max-w-2xl mx-auto text-center border border-white/10 mt-8 mb-4">
          <p className="text-white/90 text-lg mb-6 leading-relaxed">Ya tenemos tu primera lectura. El siguiente paso es completar el Cuestionario Espejo para poder recomendarte un programa con más precisión.</p>
          <button onClick={() => { setShowReservationState(false); setIsNextStepsModalOpen(true); }} className="bg-white text-[#11181f] px-8 py-3 rounded-full font-label font-bold hover:scale-105 transition-transform">¿Qué debo hacer ahora?</button>
        </div>
      );
    }
    if (!dossierAvailable) {
      return (
        <div className="bg-[#11181f]/80 p-6 md:p-8 rounded-2xl max-w-2xl mx-auto text-center border border-white/10 mt-8 mb-4">
          <p className="text-white/90 text-lg mb-6 leading-relaxed">Tu Dossier Espejo está en preparación. Cuando esté listo, podrás leerlo y reservar el programa más adecuado con más claridad.</p>
          <button onClick={() => navigate('/report#next-steps')} className="bg-white text-[#11181f] px-8 py-3 rounded-full font-label font-bold hover:scale-105 transition-transform">Ver próximos pasos</button>
        </div>
      );
    }
    if (!dossierViewed) {
      return (
        <div className="bg-[#11181f]/80 p-6 md:p-8 rounded-2xl max-w-2xl mx-auto text-center border border-white/10 mt-8 mb-4">
          <p className="text-white/90 text-lg mb-6 leading-relaxed">Tu Dossier Espejo ya está disponible. Antes de reservar, te recomendamos leerlo para elegir el programa con más seguridad.</p>
          <button onClick={() => navigate('/dossier-espejo')} className="bg-white text-[#11181f] px-8 py-3 rounded-full font-label font-bold hover:scale-105 transition-transform">Leer Dossier personalizado</button>
        </div>
      );
    }
    return null;
  };

  const [showAllTreatmentsModal, setShowAllTreatmentsModal] = useState(false);
  const [phoneValue, setPhoneValue] = useState("+34");

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://soybienestar.es/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tratamientos online",
        "item": "https://soybienestar.es/tratamientos-online"
      }
    ]
  };

  const treatmentsServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://soybienestar.es/tratamientos-online#service",
    "name": "Tratamientos online de bienestar emocional",
    "serviceType": "Programas online de bienestar emocional",
    "provider": {
      "@id": "https://soybienestar.es/#organization"
    },
    "areaServed": {
      "@type": "Country",
      "name": "España"
    },
    "url": "https://soybienestar.es/tratamientos-online",
    "description": "Programas online de bienestar emocional orientados a ansiedad, estrés, insomnio, procrastinación, rumiación mental, gestión emocional y alimentación emocional, sin sustituir una valoración profesional ni constituir diagnóstico."
  };

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

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHasDoneConsultation(data?.hasDoneConsultation === true);
          setHasDoneCuestionario(data?.hasDoneCuestionario === true || data?.questionnaireStatus === "completed" || data?.questionnaireStatus === "concluded" || data?.questionnaireStatus === "finalized");
          setDossierAvailable(!!data?.dossierAvailableAt || !!data?.latestDossier);
          setDossierViewed(!!data?.dossierViewedAt);
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
    }
  }, [user]);

  return (
    <div className="flex-1 w-full">
      <SEO
        title="Tratamientos online para ansiedad, estrés e insomnio | SoyBienestar"
        description="Descubre programas online de bienestar emocional para ansiedad, estrés, insomnio, procrastinación, rumiación mental, gestión emocional y alimentación emocional."
        canonicalPath="/tratamientos-online"
        noIndex={false}
      />
      <StructuredData id="breadcrumb-schema-tratamientos" data={breadcrumbSchema} />
      <StructuredData id="treatments-service-schema" data={treatmentsServiceSchema} />
      {/* Hero Section: The Bridge Metaphor */}
      <section className="relative flex items-center pt-16 pb-12 px-6 md:px-12 mx-auto max-w-screen-2xl overflow-hidden w-full">
        <div className="w-full">
          <div className="z-10 max-w-screen-xl">
            <h1 className="font-label text-secondary font-semibold tracking-widest uppercase text-xs mb-6 block break-words">Tratamientos online para tu bienestar emocional</h1>
            <h2 className="text-[12vw] sm:text-6xl md:text-7xl font-headline text-primary leading-[1.1] mb-8 max-w-full break-words">ReprogrÁmate</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-on-surface-variant max-w-5xl leading-relaxed mb-10">
              Un sistema de tratamiento online, flexible y cercano para aliviar el malestar mental y transformar tu bienestar desde la base sin importar la distancia.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-6 md:px-12 mb-24">
        <div className="w-full rounded-[2rem] overflow-hidden bg-surface-container-low shadow-xl border border-outline-variant/10">
          <img
            src="/images/tratamientos_reprogramate.jpg"
            alt="Infografía de tratamientos ReprogrÁmate"
            className="w-full h-auto object-contain block"
          />
        </div>
      </div>

      {/* Treatments Bento Grid */}
      <section className="py-24 px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className="md:col-span-2 flex flex-col justify-center">
              <h2 className="text-4xl font-headline text-primary mb-4 italic">Elige uno de nuestros programas</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl">Un enfoque integral para navegar los diferentes estados de la niebla emocional.</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedInfographic({ id: 'todos_los_tratamientos', src: '/images/tratamientos.jpg', mobileSrc: '/images/tratamientos_vertical.jpg' })}
              className="group bg-primary-container p-6 rounded-2xl flex items-center justify-center text-center relative overflow-hidden hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 min-h-[120px]"
            >
              <span className="font-headline text-2xl text-white relative z-10 group-hover:scale-105 transition-transform duration-500">Ver todos los tratamientos</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div 
              onClick={() => setSelectedInfographic({ id: 'programa_basico', src: '/images/infografia_basico.jpg', plan: 'basico' })}
              className="group bg-surface dark:bg-[#d1e7e4] rounded-2xl aspect-[4/5] md:aspect-square hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden cursor-pointer"
            >
              <picture>
                <source
                  media="(max-width: 1024px) and (orientation: portrait)"
                  srcSet="/images/programa_basico_vertical.jpg"
                />
                <img
                  src="/images/programa_basico.jpg"
                  alt="Programa básico"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </picture>
            </div>
            {/* Card 2 */}
            <div 
              onClick={() => setSelectedInfographic({ id: 'programa_intermedio', src: '/images/infografia_intermedio.jpg', plan: 'intermedio' })}
              className="group bg-surface dark:bg-[#d1e7e4] rounded-2xl aspect-[4/5] md:aspect-square hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden cursor-pointer"
            >
              <picture>
                <source
                  media="(max-width: 1024px) and (orientation: portrait)"
                  srcSet="/images/programa_intermedio_vertical.jpg"
                />
                <img
                  src="/images/programa_intermedio.jpg"
                  alt="Programa intermedio"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </picture>
            </div>
            {/* Card 3 */}
            <div 
              onClick={() => setSelectedInfographic({ id: 'programa_completo', src: '/images/infografia_completo.jpg', plan: 'completo' })}
              className="group bg-surface dark:bg-[#d1e7e4] rounded-2xl aspect-[4/5] md:aspect-square hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden cursor-pointer"
            >
              <picture>
                <source
                  media="(max-width: 1024px) and (orientation: portrait)"
                  srcSet="/images/programa_completo_vertical.jpg"
                />
                <img
                  src="/images/programa_completo.jpg"
                  alt="Programa completo"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </picture>
            </div>
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
                  className="bg-[#1F9E5A] text-white px-8 py-3 rounded-full font-label font-semibold inline-flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100 w-fit order-2 sm:order-1"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.197 1.441 4.934 1.442 5.333 0 9.673-4.34 9.676-9.674.002-5.332-4.338-9.674-9.671-9.675-2.585-.001-5.015 1.007-6.843 2.837-1.828 1.83-2.834 4.26-2.835 6.844-.001 1.705.469 3.376 1.36 4.827l-1.055 3.854 3.954-1.035zm12.188-4.63c-.334-.167-1.974-.974-2.279-1.084-.303-.11-.524-.167-.745.167-.221.334-.856 1.084-1.05 1.308-.194.223-.389.25-.723.084-.333-.167-1.408-.52-2.681-1.656-.991-.884-1.659-1.976-1.853-2.31-.194-.334-.021-.514.146-.68.15-.15.334-.389.501-.584.166-.194.222-.333.333-.556.111-.223.056-.417-.028-.584-.084-.167-.745-1.794-1.021-2.459-.269-.646-.543-.558-.745-.568-.192-.01-.413-.012-.634-.012-.221 0-.579.083-.883.417-.304.334-1.162 1.14-1.162 2.783 0 1.643 1.198 3.226 1.365 3.449.167.222 2.358 3.599 5.712 5.048.798.344 1.42.55 1.905.706.802.255 1.533.219 2.11.134.643-.095 1.974-.807 2.251-1.587.277-.779.277-1.447.194-1.586-.083-.14-.304-.223-.637-.39z"></path></svg>
                  Consulta por WhatsApp
                </a>

                <div className="flex items-center gap-4 group order-1 sm:order-2">
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
                  if (dossierAvailable && dossierViewed) {
                    navigate('/reservar-programa');
                  } else if (hasDoneConsultation) {
                    setIsNextStepsModalOpen(true);
                  } else {
                    navigate('/session');
                  }
                }}
                className="text-white w-full h-24 rounded-full font-label font-semibold flex justify-center items-center gap-3 shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url("/images/fondo_boton.jpg")' }}
              >
                <span className="material-symbols-outlined text-xl">psychology</span>
                {dossierAvailable && dossierViewed ? "Reservar programa" : hasDoneConsultation ? "¿Qué debo hacer ahora?" : "Iniciar Consulta Gratuita"}
              </button>
            </div>
          </div>
          <div 
            className="p-16 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden flex flex-col items-center bg-cover bg-center h-full justify-center"
            style={{ backgroundImage: "url('/images/fondo_compartir.jpg')" }}
          >
            <div className="absolute inset-0 bg-[#2c3e50]/55 dark:bg-[#11181f]/45 pointer-events-none"></div>
            <div className="relative z-10 space-y-8 w-full max-w-md flex flex-col items-center">
              <h2 className="font-headline text-3xl text-white italic font-light">
                ¿Listo para comenzar tu propio viaje?
              </h2>

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

              <p className="text-[11px] text-white/60 uppercase tracking-[0.4em] font-medium">
                Compasión • Tecnología • Silencio
              </p>
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
                className="relative w-full max-w-6xl max-h-[90vh] bg-[#11181f] rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Elegant Action Buttons */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-[130]">
                  <a 
                    href={selectedInfographic.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
                    title="Abrir en pantalla completa / Descargar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">open_in_new</span>
                  </a>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInfographic(null);
                      setShowReservationState(false);
                    }}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
                  </button>
                </div>
                
                {/* Scrollable document area */}
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar flex flex-col">
                  {selectedInfographic.mobileSrc ? (
                    <motion.picture
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="w-full"
                    >
                      <source
                        media="(max-width: 1024px) and (orientation: portrait)"
                        srcSet={selectedInfographic.mobileSrc}
                      />
                      <img 
                        src={selectedInfographic.src} 
                        alt="Infografía Detalle" 
                        className="w-full h-auto rounded-xl shadow-sm"
                      />
                    </motion.picture>
                  ) : (
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      src={selectedInfographic.src} 
                      alt="Infografía Detalle" 
                      className="w-full h-auto rounded-xl shadow-sm"
                    />
                  )}

                  {selectedInfographic.id !== 'todos_los_tratamientos' && (
                    <div className="mt-8 flex flex-col items-center">
                      {showReservationState ? (
                        renderReservationState()
                      ) : (
                        <button 
                          onClick={handleReservationClick}
                          className="w-full sm:w-auto bg-white text-[#11181f] px-12 py-4 rounded-full font-headline italic tracking-wide text-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98] mt-4"
                        >
                          Reservar programa
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
