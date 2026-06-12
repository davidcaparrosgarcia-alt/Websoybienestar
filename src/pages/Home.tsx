import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import RippleWindow from "../components/RippleWindow";
import LighthouseBeamFrame from "../components/LighthouseBeamFrame";
import SymptomCard from "../components/SymptomCard";
import NextStepsModal from "../components/NextStepsModal";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import ProcessStepsPanel from "../components/ProcessStepsPanel";
import {
  ANSIEDAD_FAQS,
  ESTRES_FAQS,
  INSOMNIO_FAQS,
  PROCRASTINACION_FAQS,
  RUMIACION_FAQS,
  GESTION_EMOCIONAL_FAQS,
  ALIMENTACION_EMOCIONAL_FAQS,
} from "../data/symptomFaqs";















export default function Home() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [loginError, setLoginError] = useState("");
  const [selectedInfographic, setSelectedInfographic] = useState<{ id: string, slug?: string, src: string } | null>(null);

  const symptomInfographicImages = [
    "/images/info-ansiedad.jpg",
    "/images/info-estres.jpg",
    "/images/info-insomnio.jpg",
    "/images/info-procrastinacion.jpg",
    "/images/info-rumiacion.jpg",
    "/images/info-emociones.jpg",
    "/images/info-alimentacion.jpg",
  ];

  useEffect(() => {
    symptomInfographicImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // States for the new logged-in panel
  const [phone, setPhone] = useState("");
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [channels, setChannels] = useState({ whatsapp: false, sms: false, telegram: false });
  const [validationError, setValidationError] = useState("");
  
  // New States requested
  const [showPostLoginModal, setShowPostLoginModal] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDoneConsultation, setHasDoneConsultation] = useState(false);
  const [isNextStepsModalOpen, setIsNextStepsModalOpen] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  
  const [openAnsiedadFaqIndex, setOpenAnsiedadFaqIndex] = useState<number | null>(null);
  const [openEstresFaqIndex, setOpenEstresFaqIndex] = useState<number | null>(null);
  const [openInsomnioFaqIndex, setOpenInsomnioFaqIndex] = useState<number | null>(null);
  const [openProcrastinacionFaqIndex, setOpenProcrastinacionFaqIndex] = useState<number | null>(null);
  const [openRumiacionFaqIndex, setOpenRumiacionFaqIndex] = useState<number | null>(null);
  const [openGestionEmocionalFaqIndex, setOpenGestionEmocionalFaqIndex] = useState<number | null>(null);
  const [openAlimentacionEmocionalFaqIndex, setOpenAlimentacionEmocionalFaqIndex] = useState<number | null>(null);

  const closeInfographicModal = () => {
    const overlayId = selectedInfographic?.id;
    const shouldRestoreHome =
      (overlayId === 'ansiedad' && window.location.pathname === '/ansiedad') ||
      (overlayId === 'estres' && window.location.pathname === '/estres') ||
      (overlayId === 'insomnio' && window.location.pathname === '/insomnio') ||
      (overlayId === 'procrastinacion' && window.location.pathname === '/procrastinacion') ||
      (overlayId === 'rumiacion' && window.location.pathname === '/pensar-demasiado-rumiacion') ||
      ((overlayId === 'gestion-emocional' || overlayId === 'emociones') && window.location.pathname === '/gestion-emocional') ||
      ((overlayId === 'alimentacion-emocional' || overlayId === 'alimentacion') && window.location.pathname === '/alimentacion-emocional');

    setSelectedInfographic(null);
    setOpenAnsiedadFaqIndex(null);
    setOpenEstresFaqIndex(null);
    setOpenInsomnioFaqIndex(null);
    setOpenProcrastinacionFaqIndex(null);
    setOpenRumiacionFaqIndex(null);
    setOpenGestionEmocionalFaqIndex(null);
    setOpenAlimentacionEmocionalFaqIndex(null);

    if (shouldRestoreHome) {
      window.history.pushState({}, '', '/');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (
        selectedInfographic?.id === 'ansiedad' &&
        window.location.pathname !== '/ansiedad'
      ) {
        setSelectedInfographic(null);
        setOpenAnsiedadFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'estres' &&
        window.location.pathname !== '/estres'
      ) {
        setSelectedInfographic(null);
        setOpenEstresFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'insomnio' &&
        window.location.pathname !== '/insomnio'
      ) {
        setSelectedInfographic(null);
        setOpenInsomnioFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'procrastinacion' &&
        window.location.pathname !== '/procrastinacion'
      ) {
        setSelectedInfographic(null);
        setOpenProcrastinacionFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'rumiacion' &&
        window.location.pathname !== '/pensar-demasiado-rumiacion'
      ) {
        setSelectedInfographic(null);
        setOpenRumiacionFaqIndex(null);
      }

      if (
        (selectedInfographic?.id === 'gestion-emocional' || selectedInfographic?.id === 'emociones') &&
        window.location.pathname !== '/gestion-emocional'
      ) {
        setSelectedInfographic(null);
        setOpenGestionEmocionalFaqIndex(null);
      }

      if (
        (selectedInfographic?.id === 'alimentacion-emocional' || selectedInfographic?.id === 'alimentacion') &&
        window.location.pathname !== '/alimentacion-emocional'
      ) {
        setSelectedInfographic(null);
        setOpenAlimentacionEmocionalFaqIndex(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedInfographic]);

  const phoneValue = phone ? (phone.startsWith('+') ? phone : `+34${phone}`) : "+34";

  // Load user data from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      if (!user) {
        if (isMounted) {
          setIsLoadingProfile(false);
          setProgressStep(1);
        }
        return;
      }
      if (isMounted) setIsLoadingProfile(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && isMounted) {
          const data = userDoc.data();
          if (data.hasDoneConsultation) {
            setHasDoneConsultation(true);
          }
          if (data.hasDoneCuestionario === true || ["completed", "concluded", "finalized"].includes(data.questionnaireStatus)) {
            setProgressStep(3);
          } else if (data.hasDoneConsultation === true) {
            setProgressStep(2);
          } else {
            setProgressStep(1);
          }

          if (data.contactPreferencesSaved) {
            setPhone(data.contactPhone || "");
            setContactEmail(data.contactEmail || user.email || "");
            setWantsAlerts(data.contactAlertsEnabled || false);
            setChannels(data.contactAlertChannels || { whatsapp: false, sms: false, telegram: false });
            setProfileSaved(true);
            setIsEditingProfile(false);
          } else {
            setContactEmail(user.email || "");
            setProfileSaved(false);
          }
        } else if (isMounted) {
          setContactEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        if (isMounted) setContactEmail(user.email || "");
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }
    loadUserData();
    return () => { isMounted = false; };
  }, [user]);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/session");
  };

  const handleContinueLogged = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    let cleanedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    
    if (wantsAlerts && !channels.whatsapp && !channels.sms && !channels.telegram) {
      setValidationError("Selecciona al menos un canal si deseas recibir alertas.");
      return;
    }

    const needsPhone = (wantsAlerts && (channels.whatsapp || channels.sms)) || cleanedPhone.length > 0;
    
    if (needsPhone) {
      if (!/^\d{9}$/.test(cleanedPhone)) {
        setValidationError("Introduce un número de teléfono válido de 9 dígitos.");
        return;
      }
    }

    if (!user) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        contactPhone: cleanedPhone,
        contactPhoneCountryCode: "+34",
        contactAlertsEnabled: wantsAlerts,
        contactAlertChannels: {
          whatsapp: channels.whatsapp,
          sms: channels.sms,
          telegram: channels.telegram
        },
        contactEmail: contactEmail,
        contactPreferencesSaved: true,
        contactPreferencesUpdatedAt: serverTimestamp()
      }, { merge: true });

      setPhone(cleanedPhone);
      setProfileSaved(true);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setValidationError("No se pudieron guardar tus datos. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      if (!user) {
        await signInWithGoogle();
      }
      setShowPostLoginModal(true);
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("Error al iniciar sesión. Por favor, permite las ventanas emergentes.");
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://soybienestar.es/#organization",
    "name": "SoyBienestar",
    "alternateName": "ReprogrÁmate",
    "url": "https://soybienestar.es",
    "sameAs": [
      "https://www.instagram.com/soybienestar.es"
    ],
    "description": "SoyBienestar.es es una plataforma online de bienestar emocional que combina consulta inicial, recursos de calma, Cuestionario Espejo y acompañamiento humano para ayudar a ordenar el malestar emocional sin sustituir una valoración profesional."
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://soybienestar.es/#website",
    "url": "https://soybienestar.es",
    "name": "SoyBienestar",
    "alternateName": "ReprogrÁmate",
    "publisher": {
      "@id": "https://soybienestar.es/#organization"
    },
    "inLanguage": "es-ES"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://soybienestar.es/"
      }
    ]
  };

  const homeServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://soybienestar.es/#servicio-bienestar-emocional",
    "name": "Terapia online y bienestar emocional",
    "serviceType": "Terapia online, acompañamiento emocional y recursos de bienestar emocional",
    "provider": {
      "@id": "https://soybienestar.es/#organization"
    },
    "areaServed": {
      "@type": "Country",
      "name": "España"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": "https://soybienestar.es/session",
      "availableLanguage": {
        "@type": "Language",
        "name": "Español"
      }
    },
    "description": "SoyBienestar.es ofrece sesiones online personalizadas, recursos de calma, guías sobre ansiedad, estrés, insomnio y bloqueo emocional, junto con el Cuestionario Espejo y acompañamiento humano. No sustituye una valoración profesional ni constituye un diagnóstico."
  };

  const homeGuidesItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://soybienestar.es/#guias-bienestar-emocional",
    "name": "Guías de bienestar emocional",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ansiedad",
        "url": "https://soybienestar.es/ansiedad"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Estrés",
        "url": "https://soybienestar.es/estres"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Insomnio",
        "url": "https://soybienestar.es/insomnio"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Procrastinación",
        "url": "https://soybienestar.es/procrastinacion"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Rumiación mental",
        "url": "https://soybienestar.es/pensar-demasiado-rumiacion"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "Gestión emocional",
        "url": "https://soybienestar.es/gestion-emocional"
      },
      {
        "@type": "ListItem",
        "position": 7,
        "name": "Alimentación emocional",
        "url": "https://soybienestar.es/alimentacion-emocional"
      }
    ]
  };

  const getProcessCtaLabel = () => {
    if (progressStep === 3) return "Ir al dosier";
    if (progressStep === 2) return "Solicitar cuestionario";
    return "Consulta gratuita";
  };

  const handleProcessCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeInfographicModal();

    if (progressStep === 3) {
      navigate('/report');
      return;
    }

    if (progressStep === 2) {
      setIsNextStepsModalOpen(true);
      return;
    }

    navigate('/session');
  };

  return (
    <div className="flex-1 flex flex-col">
      <SEO
        title="Terapia online y bienestar emocional | SoyBienestar"
        description="Sesiones online personalizadas para trabajar ansiedad, estrés, insomnio y bloqueo emocional con PNL, hipnosis consciente y reprogramación emocional."
        canonicalPath="/"
        noIndex={false}
      />
      <StructuredData id="organization-schema" data={organizationSchema} />
      <StructuredData id="website-schema" data={websiteSchema} />
      <StructuredData id="breadcrumb-schema-home" data={breadcrumbSchema} />
      <StructuredData id="home-service-schema" data={homeServiceSchema} />
      <StructuredData id="home-guides-itemlist-schema" data={homeGuidesItemListSchema} />
      {/* Hero Section */}
      <section className="w-full px-6 md:px-12 lg:px-16 xl:px-20 mb-2 md:mb-12">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto relative overflow-hidden rounded-[2rem] shadow-xl border border-outline-variant/10 bg-surface-container-low">
          {/* Desktop/Horizontal Image */}
          <img 
            alt="Soy Bienestar - Hero Desktop" 
            className="hidden md:block w-full h-auto object-contain object-top" 
            src="/images/inicio-horizontal.jpg"
            referrerPolicy="no-referrer"
          />
          {/* Mobile/Vertical Image */}
          <img 
            alt="Soy Bienestar - Hero Mobile" 
            className="block md:hidden w-full h-auto object-contain object-top" 
            src="/images/inicio-movil.jpg"
            referrerPolicy="no-referrer"
          />
          {/* Gradiente sutil inferior para asegurar la legibilidad de la frase */}
          
          {/* Floating Quote Overlay Style - Hidden for design but kept for SEO */}
          <div className="sr-only">
            <h1>
              Terapia online y bienestar emocional para recuperar tu calma
            </h1>
            <p>
              "Un espacio donde ser escuchado sin juicios"
            </p>
          </div>
        </div>
      </section>

      <section className="lg:hidden px-4 pt-2 pb-4">
        <ProcessStepsPanel
          progressStep={progressStep}
          onConsultaClick={() => navigate('/session')}
          onCuestionarioClick={() => setIsNextStepsModalOpen(true)}
          onDossierClick={() => navigate('/report')}
          className="mt-0 mb-0"
        />
      </section>

      {/* Symptoms Section: Reconociendo tus batallas */}
      <section className="pt-8 md:pt-16 pb-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-headline text-5xl md:text-6xl text-primary mb-8">Reconociendo tus batallas</h2>
            <p className="font-body text-on-surface-variant text-xl max-w-3xl mx-auto font-light leading-relaxed">Ponemos nombre a lo que sientes para empezar a sanar. No son solo síntomas, es tu historia pidiendo atención desde un lugar de compasión.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <SymptomCard
              id="ansiedad"
              title="Ansiedad"
              description="Ese estado de alerta que no te deja descansar. Te ayudamos a encontrar la calma en medio de la tormenta."
              actionText="Recuperar la calma"
              icon="air"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-light-gray"
              isDarkText={true}
              onClick={() => {
                setSelectedInfographic({ id: 'ansiedad', src: '/images/info-ansiedad.jpg' });
                window.history.pushState({ symptomOverlay: 'ansiedad' }, '', '/ansiedad');
              }}
            />
            
            <SymptomCard
              id="estres"
              title="Estrés"
              description="Cuando tu mundo va muy rápido y sientes no tener tiempo ni para respirar. Estrategias prácticas para recuperar tu ritmo vital."
              actionText="Soltar carga"
              icon="speed"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-taupe"
              onClick={() => {
                setSelectedInfographic({ id: 'estres', src: '/images/info-estres.jpg' });
                window.history.pushState({ symptomOverlay: 'estres' }, '', '/estres');
              }}
            />

            <SymptomCard
              id="insomnio"
              title="Insomnio"
              description="Recupera tu descanso. Reparación del sueño y regulación somática para noches de paz real."
              actionText="Dulce descanso"
              icon="bedtime"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-sand"
              onClick={() => {
                setSelectedInfographic({ id: 'insomnio', src: '/images/info-insomnio.jpg' });
                window.history.pushState({ symptomOverlay: 'insomnio' }, '', '/insomnio');
              }}
            />

            <SymptomCard
              id="procrastinacion"
              title="Procrastinación"
              description="Deja de posponer las cosas. Te ayudamos a saber ponerte en marcha para que cumplas tus tareas diarias sin que se te haga una montaña."
              actionText="Activar el cambio"
              icon="schedule"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-mist"
              onClick={() => {
                setSelectedInfographic({ id: 'procrastinacion', src: '/images/info-procrastinacion.jpg' });
                window.history.pushState({ symptomOverlay: 'procrastinacion' }, '', '/procrastinacion');
              }}
            />

            <SymptomCard
              id="rumiacion"
              title="Rumiación / Bucle Mental"
              description="Rompe el ciclo de pensamientos circulares. Técnicas cognitivas avanzadas para salir de la trampa mental y recuperar la presencia."
              actionText="Liberar la mente"
              icon="all_inclusive"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-azure-fog"
              onClick={() => {
                setSelectedInfographic({ id: 'rumiacion', src: '/images/info-rumiacion.jpg' });
                window.history.pushState({ symptomOverlay: 'rumiacion' }, '', '/pensar-demasiado-rumiacion');
              }}
            />

            <SymptomCard
              id="emociones"
              title="Gestión Emocional"
              description="Aprende a navegar tus emociones sin que ellas te gobiernen. Inteligencia emocional aplicada a tu día a día."
              actionText="Equilibrio interno"
              icon="psychology_alt"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-stone"
              onClick={() => {
                setSelectedInfographic({ id: 'emociones', slug: 'gestion-emocional', src: '/images/info-emociones.jpg' });
                window.history.pushState({ symptomOverlay: 'gestion-emocional' }, '', '/gestion-emocional');
              }}
            />

            <SymptomCard
              id="alimentacion"
              title="Alimentación"
              description="Sana tu relación con el cuerpo y la comida desde un enfoque consciente y sin culpas."
              actionText="Nutrir el cuerpo"
              icon="restaurant"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-light-gray"
              isDarkText={true}
              onClick={() => {
                setSelectedInfographic({ id: 'alimentacion', slug: 'alimentacion-emocional', src: '/images/info-alimentacion.jpg' });
                window.history.pushState({ symptomOverlay: 'alimentacion-emocional' }, '', '/alimentacion-emocional');
              }}
            />

            <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden group min-h-[380px] shadow-xl">
              <img alt="soft morning sunlight" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/fondo-zen.jpg"/>
              <div className="absolute inset-0 bg-primary/35 backdrop-blur-[2px]"></div>
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-end text-on-primary">
                <h3 className="font-headline text-4xl md:text-5xl mb-6">ReprogrÁmate Ahora</h3>
                <p className="font-body opacity-90 font-light text-2xl mb-10 leading-relaxed max-w-xl">Tu primer paso hacia la liberación física, mental y emocional.</p>
                <div onClick={() => {
                  if (hasDoneConsultation) {
                    setIsNextStepsModalOpen(true);
                  } else {
                    navigate('/session');
                  }
                }} className="bg-[#2c3e50] text-white px-10 py-5 rounded-full self-start font-bold text-[12px] uppercase tracking-[0.2em] hover:opacity-90 transition-all cursor-pointer shadow-lg active:scale-95 inline-block">
                  {hasDoneConsultation ? "Solicitar Cuestionario Espejo" : "Consulta Gratuita"}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Section: Un faro en la niebla */}
      <section className="relative w-full mb-6 md:mb-10 overflow-visible">
        <div className="cenefa-decorative mb-16">
          <div className="cenefa-line left"></div>
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>flare</span>
          <div className="cenefa-line right"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8">
          <LighthouseBeamFrame
            className="relative w-full h-[550px] rounded-[2.5rem] shadow-2xl border border-outline-variant/10 group"
            background={
              <>
                <img
                  alt="Lighthouse landscape"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  src="/images/fondo-faro.jpg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
              </>
            }
          >
            <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-primary text-6xl mb-6">light_mode</span>
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-primary mb-6 drop-shadow-sm">Un faro en la niebla</h2>
              <h3 className="font-headline text-2xl md:text-3xl text-primary/90 mb-8 italic font-light">Tu Puente hacia el Bienestar</h3>
              <p className="font-body text-xl text-primary max-w-2xl leading-relaxed font-light mb-10">
                Te guiamos a través de la niebla hacia un puerto seguro. Nuestra metodología combina estructura y sensibilidad para que recuperes el mando de tu vida.
              </p>
              <button 
                onClick={() => {
                  if (hasDoneConsultation) {
                    setIsNextStepsModalOpen(true);
                  } else {
                    navigate('/session');
                  }
                }} 
                className="bg-[#2c3e50] text-white px-12 py-5 rounded-full font-headline text-xl tracking-wide shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1 relative z-20 overflow-hidden group"
              >
                <span className="relative z-10">
                  {hasDoneConsultation ? "Solicitar Cuestionario Espejo" : "Comenzar Consulta Gratuita"}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </LighthouseBeamFrame>
        </div>
        <div className="cenefa-decorative mt-10 md:mt-12">
          <div className="cenefa-line left"></div>
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>flare</span>
          <div className="cenefa-line right"></div>
        </div>
      </section>

      {/* The Hybrid Approach */}
      <section className="pt-20 pb-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <RippleWindow className="rounded-[2rem] shadow-2xl aspect-[4/5]">
              <img alt="serene lake water" className="w-full h-full object-cover" src="/images/ondas.jpg"/>
            </RippleWindow>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="space-y-12">
              <div>
                <h2 className="font-headline text-4xl md:text-5xl text-primary mb-6">Un enfoque híbrido para el alma moderna</h2>
                <p className="font-body text-xl text-on-surface-variant leading-relaxed font-light">
                  Fusionamos la precisión de la tecnología con la profundidad de la empatía humana.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">neurology</span>
                  <h3 className="font-headline text-2xl text-primary">IA que escucha</h3>
                  <p className="font-body text-on-surface-variant font-light text-lg">Un espacio disponible 24/7 para expresarse sin juicios, donde nuestra tecnología ofrece herramientas inmediatas.</p>
                </div>
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">volunteer_activism</span>
                  <h3 className="font-headline text-2xl text-primary">Humano que valida</h3>
                  <p className="font-body text-on-surface-variant font-light text-lg">Expertos en salud emocional supervisan y validan cada paso de tu proceso terapéutico.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 md:mb-28">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
          <div>
            <h2 className="font-headline text-3xl text-primary mb-6">Un regalo para tu calma</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 font-light">
              Como agradecimiento por tu honestidad en este proceso, queremos entregarte un kit de herramientas personalizado.
            </p>
          </div>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">self_improvement</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Meditaciones Guiadas</h3>
                <p className="text-on-surface-variant text-sm font-light">Sesiones de audio enfocadas en reducir la ansiedad según tu perfil.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">description</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Guía de Ejercicios</h3>
                <p className="text-on-surface-variant text-sm font-light">Protocolos somáticos para regular tu sistema nervioso.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">verified_user</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Tu Espacio Seguro</h3>
                <p className="text-on-surface-variant text-sm font-light">Tus datos son un vínculo sagrado de confianza.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: The Form */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-sm border border-outline-variant/10">
            {!user ? (
              <>
                <div className="mb-10">
                  <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 bg-primary text-on-primary border border-transparent py-4 rounded-full shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-300 group dark:bg-primary dark:text-on-primary">
                    <div className="bg-white rounded-full p-1 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                    </div>
                    <span className="font-headline text-lg tracking-wide">Acceso automático vía Google</span>
                  </button>
                  <div className="relative flex py-8 items-center">
                    <div className="flex-grow border-t border-outline-variant/20"></div>
                    <span className="flex-shrink mx-4 text-on-surface-variant/40 text-xs uppercase tracking-[0.3em] font-bold">o completa manualmente</span>
                    <div className="flex-grow border-t border-outline-variant/20"></div>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="font-headline text-2xl text-primary mb-2">Comienza tu Sesión de Claridad</h2>
                  <p className="text-on-surface-variant font-light">Por favor, facilítanos la vía para enviarte tu material personalizado.</p>
                </div>
                <form className="space-y-8" onSubmit={handleStartSession}>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Nombre Completo</label>
                    <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="Ej. Martina García" type="text" required />
                  </div>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Correo Electrónico</label>
                    <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="martina@ejemplo.com" type="email" required />
                  </div>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">WhatsApp (Opcional)</label>
                    <div className="flex gap-4">
                      <span className="bg-surface-container-low border-b-2 border-outline/30 py-3 px-4 text-on-surface-variant">+34</span>
                      <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="600 000 000" type="tel"/>
                    </div>
                  </div>
                  <div className="pt-6">
                    <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container transition-all duration-300 active:scale-[0.98]">
                      Recibir mis guías personalizadas
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant/60 justify-center">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <p className="text-xs uppercase tracking-wide opacity-90">Tus datos están protegidos por cifrado de extremo a extremo.</p>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-headline text-3xl text-primary mb-4">Acceso a recursos y cuestionario espejo</h2>
                  {(!profileSaved || isEditingProfile) && (
                    <p className="text-on-surface-variant text-lg font-light mb-4 leading-relaxed">
                      Si deseas recibir enlaces directos a recursos y al cuestionario espejo, puedes añadir también tu teléfono para que podamos enviártelos por WhatsApp.
                    </p>
                  )}
                  <div className="bg-surface-variant/30 p-4 rounded-xl border border-outline-variant/20 mb-8">
                    <div className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">info</span>
                      <p className="text-sm text-on-surface-variant font-light">
                        Tras finalizar la consulta gratuita desbloquearás tus primeras herramientas.
                        Completando el Cuestionario Espejo accederás a tu dosier personalizado y otros recursos exclusivos.
                        Todo el material que desbloquees será tuyo de por vida.
                      </p>
                    </div>
                  </div>
                  {(!profileSaved || isEditingProfile) && (
                    <p className="text-xs text-on-surface-variant/60 mt-4 leading-relaxed mb-8">
                      Tu teléfono solo se utilizará para el envío de enlaces y recursos solicitados por ti. Nunca se usará con fines publicitarios ni se cederá a terceros.
                    </p>
                  )}
                </div>

                {isLoadingProfile ? (
                  <div className="flex justify-center py-12 opacity-60">
                    <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                  </div>
                ) : profileSaved && !isEditingProfile ? (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <p className="text-primary font-medium mt-0.5">Tus preferencias han sido guardadas con éxito.</p>
                    </div>

                    {!wantsAlerts && (
                      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 transition-all hover:border-primary/40 cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center p-1">
                            <div className="w-5 h-5 border-2 border-outline rounded-md"></div>
                          </div>
                          <div>
                            <span className="text-primary font-medium block">Deseo recibir también alertas sobre nuevos recursos o eventos de SoyBienestar.es</span>
                            <span className="text-xs text-on-surface-variant/60 mt-1 block">Puedes activar las alertas modificando tus datos.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                       <button onClick={() => setIsEditingProfile(true)} className="w-full bg-surface-container-low border border-primary/20 text-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-surface-container-high transition-all duration-300">
                         Modificar datos
                       </button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-8 animate-in fade-in duration-500" onSubmit={handleContinueLogged}>
                    
                    {isEditingProfile && (
                      <div className="group border border-primary/10 bg-primary/5 p-6 rounded-2xl mb-6">
                        <h4 className="font-headline text-xl text-primary mb-4">Cambiar Login (Correo)</h4>
                        <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Email de Contacto</label>
                        <input 
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" 
                          placeholder="tu@email.com"
                          type="email"
                        />
                        <p className="text-xs text-on-surface-variant/70 mt-2">Al cambiar tu correo principal conservarás tus avances, recursos y contraseñas.</p>
                      </div>
                    )}

                    <div className="group">
                      <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Añadir WhatsApp (Opcional)</label>
                      <div className="flex gap-4">
                        <span className="bg-surface-container-low border-b-2 border-outline/30 py-3 px-4 text-on-surface-variant">+34</span>
                        <input 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" 
                          placeholder="600 000 000" 
                          type="tel"
                        />
                      </div>
                    </div>

                    {/* Alerts Block */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 mt-8">
                      <label className="flex items-start gap-4 cursor-pointer group mb-1">
                        <div className="relative flex items-center justify-center p-1">
                          <input 
                            type="checkbox" 
                            checked={wantsAlerts}
                            onChange={(e) => setWantsAlerts(e.target.checked)}
                            className="peer sr-only" 
                          />
                          <div className="w-5 h-5 border-2 border-outline rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                          <span className="material-symbols-outlined absolute text-white text-sm opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none">check</span>
                        </div>
                        <span className="text-primary font-medium">Deseo recibir también alertas sobre nuevos recursos o eventos de SoyBienestar.es</span>
                      </label>

                      <AnimatePresence>
                        {wantsAlerts && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-11 pt-4 pb-2 space-y-3">
                              <p className="text-xs text-on-surface-variant mb-3 uppercase tracking-wider font-semibold">Selecciona los canales:</p>
                              
                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.whatsapp}
                                    onChange={(e) => setChannels({...channels, whatsapp: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">WhatsApp</span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.sms}
                                    onChange={(e) => setChannels({...channels, sms: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">SMS</span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.telegram}
                                    onChange={(e) => setChannels({...channels, telegram: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">Telegram</span>
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {validationError && (
                      <div className="flex items-center gap-2 text-error text-sm mt-4 bg-error/10 p-3 rounded font-medium">
                        <span className="material-symbols-outlined text-base">error</span>
                        {validationError}
                      </div>
                    )}

                    <div className="pt-6">
                      <button type="submit" disabled={isSaving} className="w-full bg-primary text-on-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container transition-all duration-300 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                        {isSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
                        {isEditingProfile ? "Guardar Cambios" : "Validar y Continuar Sesión"}
                      </button>
                      
                      {isEditingProfile && (
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="w-full text-on-surface-variant font-medium mt-4 pt-2 pb-2 hover:text-primary transition-colors">
                           Cancelar edición
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-on-surface-variant/60 justify-center">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <p className="text-xs uppercase tracking-wide opacity-90">Tus datos están protegidos por cifrado de extremo a extremo.</p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>



      {/* Reassurance Banner */}
      <section className="max-w-7xl mx-auto px-8 mt-12 mb-32">
        <div className="bg-surface-container-low p-16 rounded-[2.5rem] text-center border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] scale-150">
            <span className="material-symbols-outlined text-[300px] text-primary">security</span>
          </div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-5xl text-secondary mb-6">shield_with_heart</span>
            <h3 className="font-headline text-3xl text-primary mb-6">Un Compromiso de Confidencialidad</h3>
            <p className="max-w-3xl mx-auto text-on-surface-variant leading-relaxed font-light text-lg">
              Entendemos que compartir tus sentimientos es un acto de vulnerabilidad. En ReprogrÁmate, tratamos cada dato bajo los más estrictos estándares éticos y de privacidad europeos. Tu seguridad es la base de nuestra terapia.
            </p>
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
              onClick={closeInfographicModal}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                layoutId={`card-${selectedInfographic.id}`}
                className="relative w-full max-w-5xl max-h-[90vh] bg-[#0b1221] text-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Elegant Action Buttons */}
                <div className="p-4 pb-0 flex flex-wrap justify-center sm:justify-end gap-3 md:p-0 md:absolute md:top-8 md:right-8 z-[130] shrink-0">
                  <button
                    type="button"
                    onClick={handleProcessCtaClick}
                    className="h-12 px-4 sm:px-6 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group font-medium whitespace-nowrap text-sm sm:text-base"
                  >
                    {getProcessCtaLabel()}
                  </button>
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
                      closeInfographicModal();
                    }}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
                    aria-label="Cerrar infographic"
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
                    alt="Infografía" 
                    className="w-full h-auto rounded-xl shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {selectedInfographic?.id === 'ansiedad' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre ansiedad
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a ordenar lo que sientes sin etiquetarte ni exigirte tenerlo todo resuelto.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {ANSIEDAD_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openAnsiedadFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenAnsiedadFaqIndex(openAnsiedadFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openAnsiedadFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openAnsiedadFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'estres' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre estrés
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a ordenar la presión diaria, el estrés laboral y el cansancio acumulado.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {ESTRES_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openEstresFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenEstresFaqIndex(openEstresFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openEstresFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openEstresFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'insomnio' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre insomnio
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a ordenar el descanso, la activación nocturna y las preocupaciones que no se apagan.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {INSOMNIO_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openInsomnioFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenInsomnioFaqIndex(openInsomnioFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openInsomnioFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openInsomnioFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'procrastinacion' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre procrastinación
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para entender por qué cuesta arrancar, cómo gestionar la parálisis y empezar poco a poco.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {PROCRASTINACION_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openProcrastinacionFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenProcrastinacionFaqIndex(openProcrastinacionFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openProcrastinacionFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openProcrastinacionFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'rumiacion' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre pensar demasiado y rumiación mental
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a reconocer el bucle mental, ordenar los pensamientos repetitivos y volver al presente.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {RUMIACION_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openRumiacionFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRumiacionFaqIndex(openRumiacionFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openRumiacionFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openRumiacionFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedInfographic?.id === 'gestion-emocional' || selectedInfographic?.id === 'emociones') && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre gestión emocional
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a reconocer, regular y comprender lo que sientes sin dejar que tus emociones decidan por ti.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {GESTION_EMOCIONAL_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openGestionEmocionalFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenGestionEmocionalFaqIndex(openGestionEmocionalFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openGestionEmocionalFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openGestionEmocionalFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedInfographic?.id === 'alimentacion-emocional' || selectedInfographic?.id === 'alimentacion') && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre alimentación emocional
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a distinguir hambre física, hambre emocional, ansiedad y relación con la comida sin juzgarte.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {ALIMENTACION_EMOCIONAL_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openAlimentacionEmocionalFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenAlimentacionEmocionalFaqIndex(openAlimentacionEmocionalFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openAlimentacionEmocionalFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openAlimentacionEmocionalFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Post-Login Transition Modal */}
      <AnimatePresence>
        {showPostLoginModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
              onClick={() => setShowPostLoginModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-surface p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-outline-variant/20"
              >
                <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                </div>
                <h3 className="font-headline text-3xl text-primary mb-4">¡Te damos la bienvenida!</h3>
                <p className="text-on-surface-variant text-lg font-light mb-10 leading-relaxed">
                  Has accedido correctamente a tu espacio seguro. ¿Deseas realizar tu consulta gratuita ahora o prefieres seguir navegando?
                </p>
                <div className="flex flex-col gap-4">
                  <button onClick={() => navigate('/session')} className="w-full bg-primary text-on-primary py-4 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container hover:text-on-primary-container transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Realizar ahora la Consulta Gratuita
                  </button>
                  <button onClick={() => setShowPostLoginModal(false)} className="w-full bg-surface-container-lowest text-primary py-4 rounded-full font-headline text-lg border border-outline-variant/30 hover:bg-surface-container-low transition-all">
                    Seguir navegando por la web
                  </button>
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
        emailValue={contactEmail || user?.email || ""}
        phoneValue={phoneValue}
      />
    </div>
  );
}
