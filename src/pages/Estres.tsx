import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ESTRES_FAQS } from "../data/symptomFaqs";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";

export default function Estres() {
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
        "name": "Estrés",
        "item": "https://soybienestar.es/estres"
      }
    ]
  };
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ESTRES_FAQS.map((item) => ({
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
      <SEO title="Estrés y agotamiento mental: síntomas y cómo aliviarlo | SoyBienestar" description="Aprende a reconocer el estrés, el agotamiento mental y la ansiedad en el trabajo, y descubre recursos para recuperar calma y claridad." canonicalPath="/estres" noIndex={false} />
      <StructuredData id="breadcrumb-schema-estres" data={breadcrumbSchema} />
      <StructuredData id="faq-schema-estres" data={faqSchema} />
    <div 
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={() => navigate('/')}
    >
      <div className="min-h-screen px-4 md:px-8 py-10 md:py-16 flex justify-center items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 36 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.86, y: 36 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl rounded-[3rem] bg-[#101820] text-white shadow-2xl border border-white/10 overflow-hidden"
        >
          <button
            type="button"
            aria-label="Cerrar ventana de estrés"
            onClick={() => navigate('/')}
            className="absolute right-5 top-5 z-50 w-10 h-10 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="p-8 md:p-12 lg:p-16 pt-20 md:pt-24">
            <p className="font-label text-white/45 uppercase tracking-[0.35em] text-[10px] md:text-xs mb-4">
              Guía sobre estrés
            </p>

            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl leading-tight text-white/85 mb-8 max-w-4xl">
              Estrés y agotamiento mental: síntomas y cómo aliviarlo
            </h1>

            <img
              src="/images/info-estres.jpg"
              alt="Infografía sobre estrés con una persona agotada bajo presión, rodeada de relojes, listas de tareas, papeles acumulados, trabajo, maternidad y flechas de exigencia. Explica que no siempre estoy fuerte: a veces sigo funcionando bajo demasiada presión, y que el estrés sostenido mantiene al cuerpo y a la mente en alerta cuando necesitan descanso."
              className="w-full h-auto object-contain rounded-[2rem] shadow-2xl"
            />
            
            <div className="mt-12 rounded-[2rem] bg-black/20 text-white shadow-2xl overflow-hidden border border-white/10">
              <div className="p-8 md:p-10 border-b border-white/10">
                <h2 className="font-headline text-2xl md:text-3xl italic">
                  Preguntas frecuentes sobre estrés y agotamiento mental
                </h2>
                <p className="text-white/65 mt-3 font-light">
                  Respuestas claras para empezar a ordenar la presión diaria, el estrés laboral y el cansancio acumulado.
                </p>
              </div>

              <div className="divide-y divide-white/10">
                {ESTRES_FAQS.map((item, index) => (
                  <div key={item.question}>
                    <button
                      type="button"
                      aria-expanded={openFaqIndex === index}
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full text-left px-8 md:px-10 py-6 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                    >
                      <h3 className="font-headline text-lg md:text-xl text-white">
                        {item.question}
                      </h3>
                      <span className="material-symbols-outlined text-white/70">
                        {openFaqIndex === index ? "remove" : "add"}
                      </span>
                    </button>

                    {openFaqIndex === index && (
                      <div className="px-8 md:px-10 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <h2 className="font-headline text-3xl md:text-4xl text-white mb-4">
                Empieza a ordenar la presión que sostienes
              </h2>
              <p className="text-white/70 max-w-3xl mx-auto mb-8 text-lg leading-relaxed">
                Si el estrés empieza a ocupar demasiado espacio en tu descanso, tu trabajo o tu forma de vivir, puedes dar un primer paso sencillo: ordenar lo que estás sosteniendo y decidir después si necesitas continuar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/session')}
                  className="px-8 py-4 rounded-full bg-white text-primary font-label font-bold hover:scale-[1.02] transition-transform"
                >
                  Realizar consulta gratuita
                </button>
                <button
                  onClick={() => navigate('/herramientas')}
                  className="px-8 py-4 rounded-full border border-white/30 text-white font-label font-bold hover:bg-white/10 transition-colors"
                >
                  Ver herramientas
                </button>
              </div>
            </div>

            {/* Internal Links Block */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <h2 className="font-headline text-2xl text-white/80 mb-6 italic">También puede ayudarte</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/ansiedad" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Ansiedad</Link>
                <Link to="/insomnio" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Insomnio</Link>
                <Link to="/procrastinacion" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Procrastinación</Link>
                <Link to="/herramientas" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Herramientas</Link>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
