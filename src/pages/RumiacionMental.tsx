import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { RUMIACION_FAQS } from "../data/symptomFaqs";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";

export default function RumiacionMental() {
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
        "name": "Rumiación mental",
        "item": "https://soybienestar.es/pensar-demasiado-rumiacion"
      }
    ]
  };
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": RUMIACION_FAQS.map((item) => ({
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
      <SEO title="Rumiación mental: cómo dejar de pensar tanto | SoyBienestar" description="Si no puedes dejar de pensar o darle vueltas a todo, descubre qué es la rumiación mental y cómo empezar a calmar el bucle de pensamientos." canonicalPath="/pensar-demasiado-rumiacion" noIndex={false} />
      <StructuredData id="breadcrumb-schema-rumiacion" data={breadcrumbSchema} />
      <StructuredData id="faq-schema-rumiacion" data={faqSchema} />
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
            aria-label="Cerrar ventana de rumiación mental"
            onClick={() => navigate('/')}
            className="absolute right-5 top-5 z-50 w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant hover:text-primary hover:bg-surface-variant/80 backdrop-blur-md flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="p-8 md:p-12 lg:p-16 pt-20 md:pt-24">
            <p className="font-label text-on-surface-variant/70 uppercase tracking-[0.35em] text-[10px] md:text-xs mb-4">
              Guía sobre rumiación mental
            </p>

            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl leading-tight text-primary mb-6 max-w-4xl">
              Rumiación mental: cómo dejar de pensar tanto
            </h1>

            <img
              src="/images/info-rumiacion.jpg"
              alt="Infografía sobre pensar demasiado y rumiación mental con una persona atrapada en un círculo de pensamientos repetitivos, relojes, flechas, recuerdos y escenas que vuelven una y otra vez. Explica que pensar tanto no siempre da paz, sino que puede dejar a la persona atrapada en el mismo bucle mental."
              className="w-full h-auto object-contain rounded-[2rem] shadow-2xl"
            />
            
            <div className="mt-12 rounded-[2rem] bg-surface-container-low text-on-surface shadow-2xl overflow-hidden border border-outline-variant/10">
              <div className="p-8 md:p-10 border-b border-outline-variant/10">
                <h2 className="font-headline text-2xl md:text-3xl italic">
                  Preguntas frecuentes sobre rumiación mental
                </h2>
                <p className="text-on-surface-variant mt-3 font-light">
                  Respuestas claras para empezar a reconocer el bucle mental, ordenar los pensamientos repetitivos y volver al presente.
                </p>
              </div>

              <div className="divide-y divide-outline-variant/10">
                {RUMIACION_FAQS.map((item, index) => (
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
                Empieza a salir del bucle mental
              </h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto mb-8 text-lg leading-relaxed">
                Si pensar demasiado empieza a ocupar demasiado espacio en tu día a día, puedes dar un primer paso sencillo: ordenar lo que se repite en tu mente y decidir después si necesitas continuar.
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
                <Link to="/insomnio" className="px-6 py-2 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors">Insomnio</Link>
                <Link to="/procrastinacion" className="px-6 py-2 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors">Procrastinación</Link>
                <Link to="/herramientas" className="px-6 py-2 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors">Meditaciones</Link>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
