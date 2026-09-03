export type FaqSeoConfig = {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumbName: string;
  breadcrumbSchemaId: string;
  faqSchemaId: string;
};

export const FAQ_SEO = {
  ansiedad: {
    title: "Terapia para la ansiedad online | Síntomas y apoyo emocional",
    description: "Trabaja la ansiedad online con herramientas de regulación, PNL, respiración y acompañamiento emocional para entender y reducir tus alertas internas.",
    canonicalPath: "/ansiedad",
    breadcrumbName: "Ansiedad",
    breadcrumbSchemaId: "breadcrumb-schema-ansiedad",
    faqSchemaId: "faq-schema-ansiedad",
  },
  estres: {
    title: "Terapia online para estrés laboral y sobrecarga emocional",
    description: "Sesiones online para trabajar estrés, presión laboral, agotamiento emocional y sobrecarga mental con herramientas prácticas de regulación.",
    canonicalPath: "/estres",
    breadcrumbName: "Estrés",
    breadcrumbSchemaId: "breadcrumb-schema-estres",
    faqSchemaId: "faq-schema-estres",
  },
  insomnio: {
    title: "Terapia online para insomnio por ansiedad o estrés",
    description: "Si no puedes dormir porque tu mente sigue activa, trabaja el insomnio online desde la regulación emocional, la ansiedad y el estrés.",
    canonicalPath: "/insomnio",
    breadcrumbName: "Insomnio",
    breadcrumbSchemaId: "breadcrumb-schema-insomnio",
    faqSchemaId: "faq-schema-insomnio",
  },
  procrastinacion: {
    title: "Cómo dejar de procrastinar | Apoyo online para bloqueo y foco",
    description: "No siempre es pereza: a veces estás bloqueado, sobrepasado o atrapado en perfeccionismo y miedo. Aquí lo desglosamos y lo trabajamos.",
    canonicalPath: "/procrastinacion",
    breadcrumbName: "Procrastinación",
    breadcrumbSchemaId: "breadcrumb-schema-procrastinacion",
    faqSchemaId: "faq-schema-procrastinacion",
  },
  rumiacion: {
    title: "Pensar demasiado y rumiación mental | Ayuda online para frenar el bucle",
    description: "Si tu cabeza no para, repasa, anticipa y no suelta, esta página te ayuda a entender el patrón y empezar a ordenar el ruido mental.",
    canonicalPath: "/pensar-demasiado-rumiacion",
    breadcrumbName: "Rumiación mental",
    breadcrumbSchemaId: "breadcrumb-schema-rumiacion",
    faqSchemaId: "faq-schema-rumiacion",
  },
  gestionEmocional: {
    title: "Terapia y gestión emocional online | SoyBienestar",
    description: "Aprende a regular emociones intensas, entender tus reacciones y trabajar el bloqueo emocional con acompañamiento online.",
    canonicalPath: "/gestion-emocional",
    breadcrumbName: "Gestión emocional",
    breadcrumbSchemaId: "breadcrumb-schema-gestion-emocional",
    faqSchemaId: "faq-schema-gestion-emocional",
  },
  alimentacionEmocional: {
    title: "Comer por ansiedad y hambre emocional | Acompañamiento online",
    description: "Si usas la comida para calmar ansiedad, estrés o tristeza, trabaja el patrón emocional sin dietas, culpa ni juicios.",
    canonicalPath: "/alimentacion-emocional",
    breadcrumbName: "Alimentación emocional",
    breadcrumbSchemaId: "breadcrumb-schema-alimentacion-emocional",
    faqSchemaId: "faq-schema-alimentacion-emocional",
  },
} as const satisfies Record<string, FaqSeoConfig>;

export function buildBreadcrumbSchema(config: FaqSeoConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://soybienestar.es/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: config.breadcrumbName,
        item: `https://soybienestar.es${config.canonicalPath}`,
      },
    ],
  };
}

export function buildFaqSchema(faqs: ReadonlyArray<{question: string; answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
