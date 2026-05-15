import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { PROCRASTINACION_FAQS } from "../data/symptomFaqs";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";

export default function Procrastinacion() {
  const navigate = useNavigate();

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
        "name": "Procrastinación",
        "item": "https://soybienestar.es/procrastinacion"
      }
    ]
  };
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": PROCRASTINACION_FAQS.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <>
      <SEO title="Procrastinación: por qué procrastinas y cómo dejarlo | SoyBienestar" description="Aprende cómo dejar de procrastinar, por qué pospones tareas y qué relación puede tener la procrastinación con ansiedad, bloqueo o perfeccionismo." canonicalPath="/procrastinacion" noIndex={false} />
      <StructuredData id="breadcrumb-schema-procrastinacion" data={breadcrumbSchema} />
      <StructuredData id="faq-schema-procrastinacion" data={faqSchema} />
    <div
      className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm overflow-y-auto"
      onClick={() => navigate('/')}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.86, y: 36 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.86, y: 36 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen px-4 md:px-8 py-10 md:py-16 flex justify-center items-start"
      >
        <div className="relative w-full max-w-6xl rounded-[3rem] bg-surface text-on-surface shadow-2xl border border-outline-variant/10 overflow-hidden">
          <button
            type="button"
            aria-label="Cerrar ventana de procrastinación"
            onClick={() => navigate('/')}
            className="absolute right-5 top-5 z-50 w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant hover:text-primary hover:bg-surface-variant/80 backdrop-blur-md flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="p-8 md:p-12 lg:p-16 pt-20 md:pt-24">
            <p className="font-label text-on-surface-variant/70 uppercase tracking-[0.35em] text-[10px] md:text-xs mb-4">
              Guía sobre procrastinación
            </p>

            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl leading-tight text-primary mb-6 max-w-4xl">
              Procrastinación: por qué procrastinas y cómo dejarlo
            </h1>

            <img
              src="/images/info-procrastinacion.jpg"
              alt="Infografía sobre procrastinación con una persona sentada entre papeles, carpetas, relojes, notas pendientes y flechas circulares, mirando hacia una salida iluminada. Explica que no avanzar también agota y que la procrastinación no siempre es una decisión consciente, sino una señal de bloqueo, saturación o estado alterado."
              className="w-full h-auto object-contain rounded-[2rem] shadow-2xl"
            />
            
            <div className="mt-12 rounded-[2rem] bg-surface-container-low text-on-surface shadow-2xl overflow-hidden border border-outline-variant/10">
              <div className="p-8 md:p-10 border-b border-outline-variant/10">
                <h2 className="font-headline text-2xl md:text-3xl italic">
                  Preguntas frecuentes sobre procrastinación
                </h2>
                <p className="text-on-surface-variant mt-3 font-light">
                  Respuestas claras para empezar a entender el bloqueo, la evitación y la dificultad para ponerte en marcha.
                </p>
              </div>

              <div className="divide-y divide-outline-variant/10">
                {PROCRASTINACION_FAQS.map((item, index) => (
                  <div key={item.question}>
                    <button
                      type="button"
                      aria-expanded={openFaqIndex === index}
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full text-left px-8 md:px-10 py-6 flex items-center justify-between gap-6 hover:bg-surface-variant/30 transition-colors"
                    >
                      <h3 className="font-headline text-lg md:text-xl text-primary">
                        {item.question}
                      </h3>
                      <span className="material-symbols-outlined text-on-surface-variant">
                        {openFaqIndex === index ? "remove" : "add"}
                      </span>
                    </button>

                    {openFaqIndex === index && (
                      <div className="px-8 md:px-10 pb-8 text-on-surface-variant font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <h2 className="font-headline text-3xl md:text-4xl text-primary mb-4">
                Empieza a romper el bloqueo sin exigirte perfección
              </h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto mb-8 text-lg leading-relaxed">
                Si posponer empieza a pesarte demasiado, puedes dar un primer paso sencillo: entender qué emoción o patrón aparece antes del bloqueo y decidir después si necesitas continuar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/session')}
                  className="px-8 py-4 rounded-full bg-primary text-on-primary font-label font-bold hover:scale-[1.02] transition-transform"
                >
                  Realizar consulta gratuita
                </button>
                <button
                  onClick={() => navigate('/herramientas')}
                  className="px-8 py-4 rounded-full border border-primary/30 text-primary font-label font-bold hover:bg-primary/5 transition-colors"
                >
                  Ver herramientas
                </button>
              </div>
            </div>

            {/* Internal Links Block */}
            <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
              <h2 className="font-headline text-2xl text-on-surface-variant mb-6 italic">También puede ayudarte</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/ansiedad" className="px-6 py-2 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors">Ansiedad</Link>
                <Link to="/estres" className="px-6 py-2 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors">Estrés</Link>
                <Link to="/pensar-demasiado-rumiacion" className="px-6 py-2 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors">Rumiación mental</Link>
                <Link to="/herramientas" className="px-6 py-2 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors">Herramientas</Link>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
