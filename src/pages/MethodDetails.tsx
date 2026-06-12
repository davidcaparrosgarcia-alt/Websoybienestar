import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import { motion, AnimatePresence } from "motion/react";

interface Profile {
  id: string;
  name: string;
  role: string;
  portrait: string;
  sheet: string;
  portraitAlt: string;
  sheetAlt: string;
  description: string;
}

const teamProfiles: Profile[] = [
  {
    id: "maria",
    name: "María Iris",
    role: "Terapeuta y directora de los programas de SoyBienestar.es",
    portrait: "/images/equipo-maria-iris.png",
    sheet: "/images/ficha-maria-iris.jpg",
    portraitAlt: "Retrato de María Iris, terapeuta y directora de los programas de SoyBienestar.es",
    sheetAlt: "Ficha profesional de María Iris, terapeuta psicosomática, hipnoterapeuta y directora de los programas de SoyBienestar.es",
    description: "María Iris es terapeuta psicosomática, hipnoterapeuta, profesora de kundalini yoga y meditación, con experiencia acompañando procesos de transformación emocional, corporal y mental."
  },
  {
    id: "david",
    name: "David Caparrós",
    role: "Creador del proyecto y desarrollo de contenidos terapéuticos digitales",
    portrait: "/images/equipo-david-caparros.png",
    sheet: "/images/ficha-david-caparros.jpg",
    portraitAlt: "Retrato de David Caparrós, creador del proyecto SoyBienestar.es",
    sheetAlt: "Ficha profesional de David Caparrós, creador del proyecto y desarrollo de contenidos terapéuticos digitales de SoyBienestar.es",
    description: "David Caparrós participa en la creación, estructura y desarrollo de contenidos del proyecto, integrando comunicación, experiencia de usuario y herramientas digitales orientadas al bienestar emocional."
  },
  {
    id: "diego",
    name: "Diego Arnold",
    role: "Asesor y coach nutricional especializado en Kinesiología Bioenergética",
    portrait: "/images/equipo-diego-arnold.png",
    sheet: "/images/ficha-diego-arnold.jpg",
    portraitAlt: "Retrato de Diego Arnold, asesor y coach nutricional especializado en Kinesiología Bioenergética",
    sheetAlt: "Ficha profesional de Diego Arnold, asesor y coach nutricional especializado en Kinesiología Bioenergética",
    description: "Diego Arnold acompaña el área nutricional desde una mirada integradora, ayudando a cuidar el cuerpo, equilibrar hábitos y favorecer una transformación más completa."
  }
];

export default function MethodDetails() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

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
        "name": "Quiénes somos",
        "item": "https://soybienestar.es/quienes-somos"
      }
    ]
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProfile(null);
      }
    };
    if (selectedProfile) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProfile]);

  const handleShare = async () => {
    const shareData = {
      title: 'ReprogrÁmate - Quiénes somos',
      text: 'Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un guía, con una orientación gratuita y máxima privacidad.',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
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
        title="Quiénes somos | Equipo SoyBienestar.es"
        description="Conoce al equipo humano de SoyBienestar.es: María Iris, David Caparrós y Diego Arnold, perfiles complementarios para acompañarte en tu proceso de bienestar emocional, terapéutico y corporal."
        canonicalPath="/quienes-somos"
        noIndex={false}
      />
      <StructuredData id="breadcrumb-schema-quienes-somos" data={breadcrumbSchema} />

      {/* Header Section */}
      <section className="px-8 md:px-24 pt-8 md:pt-12 pb-6 max-w-screen-2xl mx-auto text-center animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="font-headline text-[63.2px] text-primary leading-tight font-medium">¿Quiénes Somos?</h1>
          <p className="font-headline text-lg md:text-xl text-primary max-w-2xl mx-auto font-light leading-relaxed">
            Somos David y María, fundadores de SoyBienestar.es.
          </p>
          <div className="h-px w-24 bg-secondary/30 mx-auto my-6 font-light"></div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="px-8 md:px-24 pt-8 pb-12 max-w-screen-2xl mx-auto animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Text */}
          <div className="space-y-10 md:space-y-12 text-on-surface-variant text-[22.4px] font-light leading-relaxed text-justify max-w-xl lg:max-w-none">
            <p>
              SoyBienestar.es nace para acercar el acompañamiento terapéutico a personas que necesitan claridad, calma y una guía cercana.
            </p>
            <p>
              Somos David y María. Hemos unido experiencia terapéutica, sensibilidad humana y herramientas digitales para crear un espacio donde empezar a ordenar lo que duele, lo que pesa o lo que se repite.
            </p>
            <p>
              No creemos en procesos fríos ni impersonales. Creemos en escuchar mejor, comprender mejor y acompañar de forma más clara.
            </p>
            <p className="font-headline text-[25.08px] text-primary leading-snug pt-4 md:pt-6 text-left">
              Tu viaje de regreso a la calma comienza aquí.
            </p>
          </div>
          {/* Right Column: Image */}
          <div className="relative overflow-hidden rounded-[2rem] bg-surface-container-low shadow-2xl dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] border border-outline-variant/10 dark:border-transparent">
            <img
              src="/images/fundadores-david-maria.webp"
              alt="David y María, fundadores de SoyBienestar.es"
              loading="lazy"
              decoding="async"
              className="block w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Introduction to Team */}
      <section className="px-8 md:px-24 pt-16 pb-4 max-w-screen-2xl mx-auto text-center animate-in fade-in duration-500">
        <p className="font-headline text-lg md:text-xl lg:text-xl text-primary max-w-3xl mx-auto font-light leading-relaxed">
          Un equipo humano para acompañarte desde la cercanía, la empatía y el respeto por tu proceso.
        </p>
        <div className="h-px w-24 bg-secondary/20 mx-auto mt-8 font-light"></div>
      </section>

      {/* Team Section */}
      <section className="px-8 md:px-24 py-8 max-w-screen-2xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {teamProfiles.map((profile) => (
            <motion.div 
              key={profile.id} 
              layoutId={`team-card-${profile.id}`}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-surface-container-low border border-outline-variant/10 rounded-[2rem] p-8 flex flex-col items-center text-center cursor-default"
            >
              <button
                type="button"
                onClick={() => setSelectedProfile(profile)}
                className="group/avatar mx-auto block rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/60 shrink-0 mb-6"
                aria-label={`Conocer a ${profile.name}`}
              >
                <div className="relative w-44 h-44 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-high shrink-0 shadow-sm transition-transform duration-300 group-hover/avatar:scale-105">
                  <img 
                    src={profile.portrait} 
                    alt={profile.portraitAlt} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
              <h3 className="font-headline text-2xl text-primary mb-2 font-medium">{profile.name}</h3>
              <p className="text-sm text-secondary font-medium tracking-wide mb-6 uppercase h-12 flex items-center justify-center">
                {profile.role}
              </p>
              <p className="text-sm text-on-surface-variant/85 font-light leading-relaxed mb-8 flex-grow">
                {profile.description}
              </p>
              <button 
                onClick={() => setSelectedProfile(profile)}
                className="mt-auto px-6 py-3 bg-[#2c3e50] dark:bg-white text-white dark:text-[#2c3e50] rounded-xl font-label text-sm font-medium tracking-wide hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">badge</span>
                {profile.id === "maria" ? "Conoce a María" : profile.id === "david" ? "Conoce a David" : "Conoce a Diego"}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Moved Narrative Section */}
      <section className="px-8 md:px-24 pt-4 md:pt-6 pb-16 md:pb-20 max-w-5xl mx-auto text-center animate-in fade-in duration-500">
        <p className="text-on-surface-variant leading-relaxed text-base md:text-lg font-light max-w-3xl mx-auto">
          SoyBienestar.es es un acompañamiento terapéutico, escucha humana y herramientas digitales para ayudarte a ordenar lo que sientes y recuperar dirección. Cada persona del equipo aporta una mirada distinta, pero todas comparten el mismo objetivo: acompañarte con seriedad, sensibilidad y coherencia.
        </p>
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
              Compartir Soybienestar
            </button>
            <p className="text-[11px] text-white/60 dark:text-[#2c3e50]/70 uppercase tracking-[0.4em] font-medium">Compasión • Tecnología • Silencio</p>
          </div>
        </div>
      </section>

      {/* Profile Sheet Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedProfile(null)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 pointer-events-none">
              <motion.div 
                layoutId={`team-card-${selectedProfile.id}`}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[min(96vw,1200px)] max-h-[94vh] bg-white dark:bg-[#1a252f] rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/10 cursor-default flex flex-col pointer-events-auto"
              >
                <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
                  <a
                    href={selectedProfile.sheet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center transition-all backdrop-blur-md group pointer-events-auto"
                    title="Abrir en pantalla completa / Descargar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">open_in_new</span>
                  </a>
                  <button 
                    onClick={() => setSelectedProfile(null)}
                    className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center transition-all backdrop-blur-md group pointer-events-auto"
                    title="Cerrar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
                  </button>
                </div>
                <div className="relative w-full flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar">
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                    src={selectedProfile.sheet} 
                    alt={selectedProfile.sheetAlt} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-h-none rounded-2xl shadow-xl border border-outline-variant/5 object-contain"
                  />
                  {/* sr-only description for SEO and screen readers */}
                  <p className="sr-only">{selectedProfile.description}</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
