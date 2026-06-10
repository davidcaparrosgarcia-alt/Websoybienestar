import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import { motion } from "motion/react";

export default function HipnoDigestive() {
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
        "name": "Tratamientos",
        "item": "https://soybienestar.es/tratamientos-online"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "HipnoDigestive",
        "item": "https://soybienestar.es/hipnodigestive"
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://soybienestar.es/hipnodigestive#service",
    "name": "Programa HipnoDigestive",
    "serviceType": "Acompañamiento en bienestar digestivo y hábitos",
    "provider": {
      "@id": "https://soybienestar.es/#organization"
    },
    "url": "https://soybienestar.es/hipnodigestive",
    "description": "Acompañamiento complementario que une hipnosis digestiva y asesoramiento nutricional para favorecer una mejor relación cuerpo-mente y digestión."
  };

  return (
    <div className="flex-1 w-full bg-surface-container-lowest text-on-surface flex flex-col min-h-screen">
      <SEO
        title="HipnoDigestive | Hipnosis digestiva y acompañamiento nutricional | SoyBienestar"
        description="Programa online en preparación que combina hipnosis digestiva de María Iris y acompañamiento nutricional personalizado de Diego Arnold para cuidar digestión, hábitos y bienestar emocional."
        canonicalPath="/hipnodigestive"
        noIndex={false}
      />
      <StructuredData id="breadcrumb-schema-hipnodigestive" data={breadcrumbSchema} />
      <StructuredData id="hipnodigestive-service-schema" data={serviceSchema} />

      {/* Main Content Area */}
      <section className="px-6 md:px-12 py-16 max-w-4xl mx-auto flex-grow flex flex-col justify-center animate-in fade-in duration-500">
        <div className="space-y-8 text-center md:text-left">
          {/* Eyebrow */}
          <div className="font-label text-secondary font-semibold tracking-widest uppercase text-xs">
            Hipnosis digestiva acompañada • SoyBienestar.es
          </div>

          {/* Title & Creators */}
          <div className="space-y-4">
            <h1 className="font-headline text-5xl md:text-6xl text-primary font-medium tracking-tight">
              HipnoDigestive
            </h1>
            <p className="font-headline text-xl md:text-2xl text-secondary italic font-light leading-relaxed max-w-3xl">
              Hipnosis digestiva creada por María Iris y acompañamiento nutricional personalizado de Diego Arnold.
            </p>
          </div>

          <div className="h-px w-24 bg-secondary/30 my-8 hidden md:block"></div>

          {/* Main Description */}
          <div className="space-y-6 text-on-surface-variant/90 leading-relaxed text-base md:text-lg font-light">
            <p>
              HipnoDigestive nace como un programa de acompañamiento online para trabajar la relación entre digestión, sistema nervioso, hábitos y bienestar emocional. Combina recursos de hipnosis digestiva con una de mirada nutricional personalizada para ayudar a la persona a cuidarse con más claridad, calma y coherencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
            {/* Card Creator 1 */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-2xl shrink-0">psychology</span>
              <div>
                <h3 className="font-headline text-lg font-medium text-primary">Hipnosis Digestiva</h3>
                <p className="text-sm text-on-surface-variant/80 font-light mt-1">Concebida y guiada por María Iris para favorecer el reequilibrio y la autorregulación somática.</p>
              </div>
            </div>

            {/* Card Creator 2 */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-2xl shrink-0">nutrition</span>
              <div>
                <h3 className="font-headline text-lg font-medium text-primary">Nutrición Personalizada</h3>
                <p className="text-sm text-on-surface-variant/80 font-light mt-1">Asesorada por Diego Arnold, cuidando la alimentación sintónica con tus biorritmos y cuerpo.</p>
              </div>
            </div>
          </div>

          {/* Development Status banner */}
          <div className="p-8 rounded-[2rem] bg-secondary/5 border border-secondary/20 space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined text-sm">construction</span>
              Programa en desarrollo
            </div>
            <h3 className="font-headline text-xl text-primary font-medium">Próximamente disponible</h3>
            <p className="text-sm text-on-surface-variant max-w-xl mx-auto font-light">
              Estamos preparando esta página con más información sobre estructura, sesiones, objetivos y forma de acompañamiento.
            </p>
          </div>

          {/* Cautionary Note */}
          <div className="p-6 rounded-xl bg-surface-container-high/40 border border-outline-variant/10 text-xs text-on-surface-variant/75 font-light leading-relaxed">
            <strong className="text-secondary block mb-1">Nota importante de claridad:</strong>
            Este programa no sustituye una valoración médica ni un tratamiento sanitario. Está pensado como acompañamiento complementario de bienestar, hábitos y regulación emocional.
          </div>

          {/* Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link
              to="/tratamientos-online"
              className="w-full sm:w-auto px-8 py-3 bg-[#2c3e50] dark:bg-white text-white dark:text-[#2c3e50] rounded-xl font-label text-sm font-medium tracking-wide hover:opacity-95 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Volver a tratamientos
            </Link>
            <Link
              to="/session"
              className="w-full sm:w-auto px-8 py-3 bg-surface-container-high text-primary hover:bg-surface-container-highest rounded-xl font-label text-sm font-medium tracking-wide active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2 border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              Consulta gratuita
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
