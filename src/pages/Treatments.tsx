import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import { motion } from "motion/react";

export default function Treatments() {
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
    "name": "Tratamientos online de SoyBienestar",
    "serviceType": "Programas online de bienestar emocional, hipnosis digestiva y acompañamiento nutricional",
    "provider": {
      "@id": "https://soybienestar.es/#organization"
    },
    "areaServed": {
      "@type": "Country",
      "name": "España"
    },
    "url": "https://soybienestar.es/tratamientos-online",
    "description": "Conoce los tratamientos online de SoyBienestar.es: ReprogrÁmate, programa terapéutico emocional de 3 meses, e HipnoDigestive, hipnosis digestiva acompañada con nutrición personalizada."
  };

  return (
    <div className="flex-1 w-full bg-surface-container-lowest text-on-surface flex flex-col min-h-screen">
      <SEO
        title="Tratamientos online | ReprogrÁmate e HipnoDigestive | SoyBienestar"
        description="Conoce los tratamientos online de SoyBienestar.es: ReprogrÁmate, programa terapéutico emocional de 3 meses, e HipnoDigestive, hipnosis digestiva acompañada con nutrición personalizada."
        canonicalPath="/tratamientos-online"
        noIndex={false}
      />
      <StructuredData id="breadcrumb-schema-tratamientos" data={breadcrumbSchema} />
      <StructuredData id="treatments-service-schema" data={treatmentsServiceSchema} />

      {/* Hero Section */}
      <section className="px-8 md:px-24 pt-16 pb-12 max-w-screen-2xl mx-auto text-center animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="font-label text-secondary font-semibold tracking-widest uppercase text-xs block">Tratamientos online • SoyBienestar.es</div>
          <h1 className="font-headline text-4.5xl md:text-5.5.xl lg:text-6xl text-primary leading-tight font-medium">
            Elige el acompañamiento que mejor encaja contigo
          </h1>
          <p className="font-headline text-lg md:text-xl text-primary max-w-2xl mx-auto font-light leading-relaxed">
            Cada proceso necesita una puerta de entrada distinta. En SoyBienestar.es reunimos programas online diseñados para acompañarte desde la raíz emocional, corporal y nutricional.
          </p>
          <div className="h-px w-24 bg-secondary/30 mx-auto my-8"></div>
        </div>
      </section>

      {/* Two Treatment Cards Section */}
      <section className="px-6 md:px-24 py-12 max-w-screen-2xl mx-auto mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          
          {/* Card 1: ReprogrÁmate */}
          <motion.div 
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col rounded-[2.5rem] bg-surface-container-low border border-outline-variant/10 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <Link to="/reprogramate" className="block h-64 sm:h-80 overflow-hidden relative group/image" aria-label="Ver programa ReprogrÁmate">
              <img 
                src="/images/fondo_modulo_5.jpg" 
                alt="Programa ReprogrÁmate" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover/image:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 md:p-8">
                <span className="inline-flex items-center rounded-full bg-[#162839]/50 text-white/85 backdrop-blur-md border border-white/20 px-4 py-2 text-xs md:text-sm font-label font-medium tracking-wide shadow-lg">
                  Tu viaje de regreso a la calma comienza aquí.
                </span>
              </div>
            </Link>
            <div className="p-8 sm:p-10 flex-grow flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">Bienestar Integral</div>
                <h2 className="font-headline text-3xl text-primary font-medium">ReprogrÁmate</h2>
                <p className="text-secondary italic text-sm font-light">Programa terapéutico integral de 3 meses</p>
                <p className="text-sm sm:text-base text-on-surface-variant/90 leading-relaxed font-light">
                  Un proceso online para trabajar el malestar desde la mente, el cuerpo y la emoción, reprogramando creencias, patrones y respuestas para recuperar equilibrio y bienestar.
                </p>
              </div>
              <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-xl">person</span>
                  <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Dirigido por María Iris</span>
                </div>
                <Link 
                  to="/reprogramate" 
                  className="w-full sm:w-auto px-6 py-3 bg-[#2c3e50] dark:bg-white text-white dark:text-[#2c3e50] rounded-xl font-label text-xs font-medium tracking-wide hover:opacity-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  Ver ReprogrÁmate
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 2: HipnoDigestive */}
          <motion.div 
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col rounded-[2.5rem] bg-surface-container-low border border-outline-variant/10 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <Link to="/hipnodigestive" className="block h-64 sm:h-80 overflow-hidden relative group/image" aria-label="Ver programa HipnoDigestive">
              <img 
                src="/images/fondo_hipnodigestive.jpg" 
                alt="Programa HipnoDigestive" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                <span className="px-4 py-1.5 rounded-full bg-secondary/90 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  Próximamente
                </span>
              </div>
            </Link>
            <div className="p-8 sm:p-10 flex-grow flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">Cuerpo y Mente</div>
                <h2 className="font-headline text-3xl text-primary font-medium">HipnoDigestive</h2>
                <p className="text-secondary italic text-sm font-light">Hipnosis digestiva acompañada y nutrición personalizada</p>
                <p className="text-sm sm:text-base text-on-surface-variant/90 leading-relaxed font-light">
                  Un programa que combina hipnosis digestiva creada por María Iris con acompañamiento nutricional personalizado desarrollado por Diego Arnold, para cuidar la relación entre cuerpo, digestión, hábitos y equilibrio emocional.
                </p>
              </div>
              <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-xl">group</span>
                  <span className="text-[10px] leading-tight text-on-surface-variant font-medium uppercase tracking-wider">
                    María Iris y Diego Arnold
                  </span>
                </div>
                <Link 
                  to="/hipnodigestive" 
                  className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-primary hover:bg-surface-container-highest rounded-xl font-label text-xs font-medium tracking-wide active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2 border border-outline-variant/20"
                >
                  Ver HipnoDigestive
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
