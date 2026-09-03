export const RESOURCES_SEO = {
  title: "Herramientas para calmar la ansiedad y el estrés | SoyBienestar",
  description: "Herramientas de bienestar emocional con meditaciones, respiración, diario de gratitud, metas semanales, autoobservación y recursos con apoyo de IA en SoyBienestar.",
  canonicalPath: "/herramientas",
} as const;

export const RESOURCES_EDITORIAL = {
  introduction: {
    title: "Herramientas para trabajar tu bienestar día a día",
    paragraphs: [
      "SoyBienestar reúne herramientas de autoobservación, regulación y aprendizaje diseñadas para ayudarte a detenerte, comprender mejor cómo te encuentras y convertir esa información en pequeñas acciones aplicables a tu día a día. Algunas pueden utilizarse directamente como recursos gratuitos y otras forman parte del recorrido de acompañamiento de ReprogrÁmate. Cuando la función lo permite, la inteligencia artificial añade una capa de reflexión o personalización, sin sustituir la valoración ni el acompañamiento profesional.",
    ],
  },
  sections: [
    {
      title: "Meditaciones multimodales",
      paragraphs: [
        "Una biblioteca de prácticas guiadas que utiliza diferentes formas de acercarse a la calma y a la regulación: trabajo corporal, atención cognitiva y paisajes sonoros ambientales.",
      ],
      listLabel: "Incluye actualmente:",
      items: [
        "Relajación Progresiva Profunda — meditación somática.",
        "Descenso Consciente — meditación somática.",
        "El Cauce de la Calma — meditación cognitiva.",
        "Orilla en Calma — meditación ambiental.",
        "Tarde de verano — meditación ambiental.",
      ],
      notes: [
        "El objetivo no es obligarte a dejar la mente en blanco, sino ofrecer distintas formas de reducir estímulos, llevar la atención al presente y crear un espacio de pausa.",
      ],
    },
    {
      title: "Técnicas de respiración guiada",
      paragraphs: [
        "Ejercicios sencillos para utilizar la respiración como punto de apoyo cuando necesitas bajar el ritmo, dirigir la atención al cuerpo o recuperar foco.",
      ],
      listLabel: "Incluye:",
      items: [
        "Respiración Cuadrada.",
        "Respiración 4-7-8.",
        "Respiración Abdominal.",
      ],
    },
    {
      title: "Diario de Gratitud con reflexión mediante IA",
      paragraphs: [
        "Una práctica diaria para detenerte y reconocer hasta dos elementos de tu día que hayan tenido un significado positivo para ti.",
        "El objetivo no es negar lo difícil, sino entrenar también la atención hacia aquello que normalmente puede pasar desapercibido cuando el malestar ocupa demasiado espacio.",
        "Después de registrar tus motivos, SoyBienestar puede generar una reflexión personalizada mediante inteligencia artificial a partir de lo que has escrito.",
        "La herramienta permite además profundizar una vez más en esa reflexión y conservar una referencia de tu continuidad a lo largo del tiempo.",
        "La IA se presenta únicamente como apoyo para la reflexión.",
      ],
    },
    {
      title: "Metas semanales con apoyo de IA",
      paragraphs: [
        "Una herramienta para convertir una intención amplia en algo más concreto y manejable durante la semana.",
        "Permite organizar propósitos relacionados con bienestar mental, actividad física, desarrollo intelectual o gestión emocional, hacer visible el progreso y mantener presentes aquellos objetivos que todavía necesitan continuidad.",
        "Puedes escribir tus propias metas o solicitar una propuesta mediante inteligencia artificial, que utiliza la categoría elegida y el contexto disponible de tu proceso para sugerir un objetivo y una descripción.",
        "El propósito no es exigirte producir más, sino ayudarte a dar dirección a la semana y transformar una intención difusa en un siguiente paso concreto.",
      ],
    },
    {
      title: "Estado Actual: emoción y energía",
      paragraphs: [
        "Una herramienta de autoobservación que combina dos preguntas: cómo te sientes emocionalmente y con cuánta energía o activación afrontas ese momento.",
        "La combinación de ambas dimensiones permite poner nombre a estados distintos que pueden parecer similares si solo observamos si nos sentimos bien o mal.",
        "Su finalidad es ayudarte a identificar tu estado actual con más matices y disponer de un punto de partida para decidir qué necesitas en ese momento.",
      ],
    },
    {
      title: "Válvula de Presión Interna",
      paragraphs: [
        "Una herramienta orientativa de autoobservación que permite seleccionar diferentes señales físicas, mentales y conductuales relacionadas con tensión y ansiedad y visualizar cómo se acumulan conjuntamente.",
        "Su finalidad es hacer más visible la carga percibida y ayudarte a observar patrones que quizá por separado pasan desapercibidos.",
        "Es una herramienta orientativa y no constituye un diagnóstico ni una evaluación clínica.",
      ],
    },
    {
      title: "Curso de Gestión Emocional",
      paragraphs: [
        "Gestión Emocional es uno de los pilares formativos de ReprogrÁmate y no una herramienta aislada.",
        "Está planteado como un itinerario progresivo de aprendizaje y práctica para aprender a reconocer las emociones, observar cómo aparecen en el cuerpo y en la mente, comprender respuestas automáticas y desarrollar formas más conscientes de actuar ante ellas.",
        "Su arquitectura contempla un módulo inicial de introducción, cinco módulos troncales y tres áreas especiales.",
      ],
      groups: [
        {
          label: "Módulo inicial:",
          items: ["El Despertar de las Emociones."],
        },
        {
          label: "Módulos troncales:",
          items: [
            "Fundamentos y Diagnóstico.",
            "Conciencia Somática.",
            "Flexibilidad Cognitiva.",
            "Fortalezas de Carácter.",
            "Integración y Acción Consciente.",
          ],
        },
        {
          label: "Áreas especiales:",
          items: ["Crisis, Pérdida y Salud.", "Amor y Desamor.", "Trabajo y Finanzas."],
        },
      ],
      notes: [
        "El curso combina contenidos, ejercicios prácticos y un sistema progresivo de avance.",
        "El acceso a sus contenidos aumenta según la modalidad de ReprogrÁmate y puede complementarse con sesiones personales de gestión emocional.",
        "El itinerario continúa ampliándose progresivamente dentro de la plataforma.",
      ],
    },
  ],
} as const;

export function buildResourcesBreadcrumbSchema() {
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
        name: "Herramientas",
        item: "https://soybienestar.es/herramientas",
      },
    ],
  };
}

export function buildResourcesServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://soybienestar.es/herramientas#service",
    name: "Herramientas para calmar la ansiedad y el estrés",
    serviceType: "Recursos online de respiración, meditación y autorregulación emocional",
    provider: {
      "@id": "https://soybienestar.es/#organization",
    },
    areaServed: {
      "@type": "Country",
      name: "España",
    },
    url: "https://soybienestar.es/herramientas",
    description: RESOURCES_SEO.description,
  };
}
