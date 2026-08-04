import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import { motion, AnimatePresence } from "motion/react";

export default function HipnoDigestive() {
  const [openProgramMonth, setOpenProgramMonth] = useState<string | null>("valoracion");
  const [isProgramImageOpen, setIsProgramImageOpen] = useState(false);
  const [isDoubtsModalOpen, setIsDoubtsModalOpen] = useState(false);
  const [openDoubtIndex, setOpenDoubtIndex] = useState<number | null>(null);
  const programMonthRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const closeDoubtsModal = () => {
    setIsDoubtsModalOpen(false);
    setOpenDoubtIndex(null);
  };

  const scrollToProgramMonth = (month: string) => {
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    window.setTimeout(() => {
      const target = programMonthRefs.current[month];
      if (!target) return;

      const headerOffset = 88;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth"
      });
    }, 80);
  };

  const toggleProgramMonth = (month: string) => {
    setOpenProgramMonth((current) => {
      const next = current === month ? null : month;

      if (next) {
        scrollToProgramMonth(month);
      }

      return next;
    });
  };

  const programTimeline = [
    {
      id: "valoracion",
      title: "Sesión inicial de valoración",
      content: (
        <>
          <p>
            Tras contratar este tratamiento, y antes de comenzar el acompañamiento de cuatro meses, tendremos una primera entrevista de entre 20 y 30 minutos con nuestros dos terapeutas para comprender tu punto de partida con calma y precisión.
          </p>
          <p>
            En esta fase realizamos una valoración nutricional y psicosomática para recoger información sobre tus síntomas, hábitos, historia digestiva y objetivos. A partir de ahí, definimos un plan de intervención adaptado a ti.
          </p>
        </>
      )
    },
    {
      id: "mes-1",
      title: "Mes 1 — Puesta en marcha y seguridad",
      content: (
        <>
          <p>
            Durante el primer mes empezamos a activar cambios sin forzar el proceso. El objetivo es que tu cuerpo empiece a sentirse acompañado, comprendido y más seguro.
          </p>
          <ul>
            <li><strong>Nutrición:</strong> introducimos un ajuste nutricional semanal adaptado a tu evolución, con dos videollamadas de seguimiento por semana con el coach nutricional.</li>
            <li><strong>Psicosomática:</strong> realizamos la primera sesión de hipnosis digestiva y creamos el primer anclaje psicosomático para ayudarte a conectar con un estado corporal más regulado.</li>
            <li><strong>Práctica en casa:</strong> recibirás secuencias de respiración y meditación para reforzar el trabajo entre sesiones.</li>
          </ul>
        </>
      )
    },
    {
      id: "mes-2",
      title: "Mes 2 — Profundización digestivo-emocional",
      content: (
        <>
          <p>
            En el segundo mes empezamos a mirar más allá del síntoma superficial, observando cómo tu sistema digestivo puede estar relacionado con tensiones, patrones emocionales o respuestas somáticas aprendidas.
          </p>
          <ul>
            <li><strong>Nutrición:</strong> el seguimiento pasa a una videollamada semanal con el coach nutricional, manteniendo ajustes personalizados según tu respuesta.</li>
            <li><strong>Psicosomática:</strong> realizamos la segunda sesión de hipnosis digestiva, orientada a trabajar de forma más profunda memorias, bloqueos o tensiones digestivo-emocionales.</li>
            <li><strong>Práctica en casa:</strong> reforzamos el proceso con un nuevo anclaje y nuevas secuencias de regulación, respiración y presencia corporal.</li>
          </ul>
        </>
      )
    },
    {
      id: "mes-3",
      title: "Mes 3 — Integración y consolidación",
      content: (
        <>
          <p>
            En esta etapa el foco se desplaza hacia integrar lo aprendido. Queremos que empieces a reconocer mejor tus señales corporales y a responder a ellas con más claridad, en lugar de vivirlas solo como una molestia o una amenaza.
          </p>
          <ul>
            <li><strong>Nutrición:</strong> continúa el seguimiento semanal, con ajustes personalizados según la respuesta real de tu cuerpo.</li>
            <li><strong>Psicosomática:</strong> reforzamos los anclajes, la respiración y las herramientas de regulación que ya has ido incorporando.</li>
            <li><strong>Autonomía:</strong> iniciamos un trabajo de integración para que puedas empezar a utilizar tus propios recursos internos en la vida diaria sin depender exclusivamente de las sesiones.</li>
          </ul>
        </>
      )
    },
    {
      id: "mes-4",
      title: "Mes 4 — Autonomía y cierre",
      content: (
        <>
          <p>
            El cuarto mes está dedicado a cerrar el proceso de forma progresiva, ayudándote a sostener lo aprendido y a retirar poco a poco los apoyos externos.
          </p>
          <ul>
            <li><strong>Nutrición:</strong> realizamos una revisión final de hábitos y los últimos ajustes para que el plan pueda mantenerse de forma realista fuera del programa.</li>
            <li><strong>Psicosomática:</strong> Realizaremos la última sesión de hipnosis y durante los últimos 10 días, el acompañamiento se orienta específicamente a soltar los anclajes externos e integrar tu propia capacidad de regulación.</li>
            <li><strong>Cierre:</strong> concluimos con una orientación clara de mantenimiento y prevención de recaídas, para que reconozcas tu capacidad de gestión digestiva autónoma.</li>
          </ul>
        </>
      )
    }
  ];

  const hipnoDigestFaqs = [
    {
      question: "¿Este programa es para mí si mis molestias digestivas empeoran con el estrés?",
      answer: "Puede tener sentido si notas que tu digestión cambia cuando estás bajo tensión, preocupación o bloqueo emocional. HipnoDigest está pensado para acompañar molestias digestivas vinculadas al estrés, la tensión emocional y  hábitos u otros sintomas que parecen no estar relacionados con el sistema digestivo directamente pero sí pueden estarlo. En la primera sesión se hace una valoración completa y conjunta con la terapeuta y el nutricionista para evaluar tu caso personalmente."
    },
    {
      question: "¿Qué incluye exactamente el programa?",
      answer: "Incluye una sesión inicial de valoración, acompañamiento nutricional constante y muy personalizado, varias sesiones de hipnosis digestiva, prácticas de respiración y meditación, anclajes psicosomáticos y seguimiento progresivo durante cuatro meses."
    },
    {
      question: "¿Tengo que tener experiencia previa con hipnosis?",
      answer: "No. El proceso se guía de forma sencilla y progresiva. No se trata de perder el control ni de forzarte a nada, sino de ayudarte a entrar en un estado de atención, calma y conexión corporal para trabajar la relación entre sistema nervioso, digestión y hábitos."
    },
    {
      question: "¿Qué papel tiene la nutrición en el programa?",
      answer: "La parte nutricional ayuda a ordenar hábitos, observar respuestas digestivas y adaptar cambios de forma realista a tu cuerpo y a tu día a día. No se plantea como una dieta genérica, sino como un acompañamiento personalizado y específico en cada caso particular, adaptado para obtener resultados y que no se abandone con el tiempo."
    },
    {
      question: "¿Y si mi problema digestivo tiene una causa médica?",
      answer: "Si existe dolor intenso, pérdida de peso inexplicada, sangrado, vómitos persistentes, fiebre, síntomas nuevos o cualquier señal de alarma, lo adecuado es consultar con un profesional sanitario. HipnoDigest puede acompañar la parte emocional y de hábitos, pero no debe utilizarse para retrasar una valoración médica. La solución ideal para estos casos nunca suele ser elegir una de las dos opciones, abordar tu problema como un equipo, acompañando y potenciando tu tratamiento médico agiliza y mejora los resultados que todos buscamos."
    },
    {
      question: "¿Cuánto dura el acompañamiento?",
      answer: "El programa está diseñado para cuatro meses, con una valoración inicial y una evolución por fases: puesta en marcha, profundización, integración y autonomía. La intención es que el proceso no dependa solo de una sesión aislada, sino de una transformación progresiva. Tienes toda la información detallada en la página de hipnodigest."
    },
    {
      question: "¿Por qué tiene este precio?",
      answer: "Porque no es una sesión suelta ni un material grabado genérico o una dieta cualquiera. Es un proceso de cuatro meses que combina valoración, seguimiento, nutrición personalizada, hipnosis digestiva, prácticas guiadas y adaptación progresiva a tu caso concreto con dos profesionales de experiencia probada. El importe también incluye iva e impuestos de obligado cumplimiento."
    },
    {
      question: "¿Qué pasa después de reservar?",
      answer: "Después de reservar, el equipo revisará tus datos y se pondrá en contacto contigo para organizar la primera valoración y explicarte los siguientes pasos del acompañamiento."
    },
    {
      question: "¿Cómo se realiza el tratamiento si es online?",
      answer: "El programa está preparado para realizarse online de forma sencilla. En la mayoría de casos, un teléfono móvil con cámara, micrófono y altavoz es suficiente para poder hacer las sesiones, siempre que tenga una conexión estable y puedas colocarte en un lugar tranquilo. Después de la reserva, nos pondremos en contacto contigo por email, teléfono o la vía que nos hayas dejado para explicarte cómo preparar el espacio, si necesitas algo concreto para las sesiones y cómo recibirás toda la información necesaria antes de empezar."
    },
    {
      question: "¿Puedo resolver mis dudas antes de tomar la decisión final?",
      answer: "Sí. Esta ventana está pensada precisamente para aclarar las dudas principales antes de reservar. Si necesitas confirmar algo concreto antes de tomar la decisión final, puedes escribirnos a contacto@soybienestar.es y revisaremos tu consulta con calma. Después de la reserva también nos pondremos en contacto contigo por email, teléfono o la vía que nos hayas dejado para explicarte los siguientes pasos."
    }
  ];

  const renderFaqAnswer = (answer: string) => {
    const email = "contacto@soybienestar.es";
    const lowerAnswer = answer.toLowerCase();
    if (!lowerAnswer.includes(email)) return answer;

    const matchIndex = lowerAnswer.indexOf(email);
    const before = answer.slice(0, matchIndex);
    const matchedEmail = answer.slice(matchIndex, matchIndex + email.length);
    const after = answer.slice(matchIndex + email.length);

    return (
      <>
        {before}
        <a
          href={`mailto:${email}`}
          className="font-bold text-white underline decoration-white/50 hover:decoration-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {matchedEmail}
        </a>
        {after}
      </>
    );
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
        "name": "HipnoDigest",
        "item": "https://soybienestar.es/hipnodigest"
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://soybienestar.es/hipnodigest#service",
    "name": "Programa HipnoDigest",
    "serviceType": "Acompañamiento en bienestar digestivo y hábitos",
    "provider": {
      "@id": "https://soybienestar.es/#organization"
    },
    "url": "https://soybienestar.es/hipnodigest",
    "description": "Acompañamiento complementario que une hipnosis digestiva y asesoramiento nutricional para favorecer una mejor relación cuerpo-mente y digestión.",
    "areaServed": {
      "@type": "Country",
      "name": "España"
    },
    "image": "https://soybienestar.es/images/fondo_hipnodigestive.jpg",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": "https://soybienestar.es/hipnodigest",
      "availableLanguage": {
        "@type": "Language",
        "name": "Español"
      }
    }
  };

  return (
    <div className="flex-1 w-full bg-transparent text-on-surface flex flex-col min-h-screen">
      <SEO
        title="HipnoDigest | Hipnosis digestiva y acompañamiento nutricional | SoyBienestar"
        description="Programa online en preparación que combina hipnosis digestiva de María Iris y acompañamiento nutricional personalizado de Diego Arnold para cuidar digestión, hábitos y bienestar emocional."
        canonicalPath="/hipnodigest"
        noIndex={false}
        imagePath="/images/fondo_hipnodigestive.jpg"
        imageAlt="Programa HipnoDigest de acompañamiento digestivo, nutricional y emocional"
      />
      <StructuredData id="breadcrumb-schema-hipnodigest" data={breadcrumbSchema} />
      <StructuredData id="hipnodigest-service-schema" data={serviceSchema} />

      {/* Main Content Area */}
      <section className="px-6 md:px-12 py-16 max-w-4xl lg:max-w-screen-2xl mx-auto flex-grow flex flex-col justify-center animate-in fade-in duration-500">
        <div className="space-y-8 text-center md:text-left">
          {/* IDEAL PARA section */}
          <div className="rounded-[2rem] bg-surface-container-low border border-outline-variant/10 shadow-sm p-6 md:p-8 lg:p-10 text-left mb-8 md:mb-10">
            <span className="font-headline block text-[#162839] dark:text-white text-2xl md:text-3xl lg:text-4xl leading-tight mb-4">
              Ideal Para
            </span>
            <p className="text-on-surface-variant/90 leading-relaxed text-base md:text-lg lg:text-xl font-light">
              Molestias digestivas vinculadas al estrés, la tensión emocional y los bloqueos psicosomáticos, que pueden manifestarse como inflamación, digestiones pesadas, estreñimiento, cansancio, irritabilidad, apatía o incluso falta de pasión por la vida.
            </p>
          </div>

          {/* Enmarcar con imagen de fondo */}
          <div
            className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-cover bg-center min-h-[360px] md:min-h-[420px] lg:min-h-[520px] flex items-center"
            style={{ backgroundImage: "url('/images/fondo_hipnodigestive.jpg')" }}
          >
            <div className="relative z-10 w-full p-8 md:p-12 lg:p-14 text-center md:text-left">
              <div className="font-label text-[#d1e7e4] font-semibold tracking-widest uppercase text-xs">
                Hipnosis digestiva acompañada • SoyBienestar.es
              </div>

              <div className="space-y-4 mt-6">
                <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-white font-medium tracking-tight">
                  HipnoDigest
                </h1>
                <p className="font-headline text-xl md:text-2xl lg:text-3xl text-[#d1e7e4] italic font-light leading-relaxed max-w-4xl">
                  Hipnosis digestiva creada por María Iris y acompañamiento nutricional personalizado de Diego Arnold.
                </p>
              </div>

              <div className="h-px w-24 bg-[#d1e7e4]/40 my-8 hidden md:block"></div>
            </div>
          </div>

          {/* Main Description */}
          <div className="space-y-6 text-on-surface-variant/90 leading-relaxed text-base md:text-lg lg:text-xl font-light max-w-6xl">
            <p>
              HipnoDigest nace como un programa de acompañamiento online para trabajar la relación entre digestión, sistema nervioso, hábitos y bienestar emocional. Combina recursos de hipnosis digestiva con una de mirada nutricional personalizada para ayudar a la persona a cuidarse con más claridad, calma y coherencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 my-12">
            {/* Card Creator 1 */}
            <div className="group relative p-6 lg:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-start gap-4 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-2xl hover:border-secondary/30">
              <span className="material-symbols-outlined text-secondary text-2xl shrink-0">psychology</span>
              <div>
                <h3 className="font-headline text-lg lg:text-2xl font-medium text-primary">Hipnosis Digestiva</h3>
                <p className="text-sm lg:text-base text-on-surface-variant/80 font-light mt-2 leading-relaxed">Concebida y guiada por María Iris para favorecer el reequilibrio y la autorregulación somática.</p>
              </div>
              <span className="material-symbols-outlined absolute top-5 right-5 text-secondary/0 group-hover:text-secondary/60 transition-all duration-500 group-hover:scale-110 pointer-events-none">
                zoom_in
              </span>
            </div>

            {/* Card Creator 2 */}
            <div className="group relative p-6 lg:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-start gap-4 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-2xl hover:border-secondary/30">
              <span className="material-symbols-outlined text-secondary text-2xl shrink-0">nutrition</span>
              <div>
                <h3 className="font-headline text-lg lg:text-2xl font-medium text-primary">Nutrición Personalizada</h3>
                <p className="text-sm lg:text-base text-on-surface-variant/80 font-light mt-2 leading-relaxed">Asesorada por Diego Arnold, cuidando la alimentación sintónica con tus biorritmos y cuerpo.</p>
              </div>
              <span className="material-symbols-outlined absolute top-5 right-5 text-secondary/0 group-hover:text-secondary/60 transition-all duration-500 group-hover:scale-110 pointer-events-none">
                zoom_in
              </span>
            </div>
          </div>

          <div className="my-12 rounded-[2rem] bg-surface-container-low border border-outline-variant/10 overflow-hidden shadow-sm text-left">
            <div className="p-6 md:p-8 border-b border-outline-variant/10">
              <span className="font-label text-secondary font-semibold tracking-widest uppercase text-xs">
                Evolución del programa
              </span>
              <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl text-primary mt-3 font-medium">
                Cuatro meses para pasar del ajuste inicial a la autonomía digestiva
              </h2>
              <p className="text-on-surface-variant/85 font-light leading-relaxed mt-4 text-base md:text-lg lg:text-xl max-w-6xl">
                HipnoDigest está estructurado como un acompañamiento progresivo de cuatro meses, precedido por una sesión inicial de valoración. La idea es que no camines este proceso de golpe, sino paso a paso: primero creando seguridad, después profundizando, integrando lo aprendido y finalmente ganando autonomía en tu salud digestiva.
              </p>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {programTimeline.map((item) => {
                const isOpen = openProgramMonth === item.id;
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      programMonthRefs.current[item.id] = el;
                    }}
                    className="scroll-mt-24"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleProgramMonth(item.id)}
                      className="w-full px-6 md:px-8 py-5 flex items-center justify-between gap-6 text-left hover:bg-surface-container-high/60 transition-colors"
                    >
                      <span className="font-headline text-lg md:text-xl lg:text-2xl text-primary">
                        {item.title}
                      </span>
                      <span className={`material-symbols-outlined text-primary/75 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        keyboard_arrow_down
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 md:px-8 lg:px-10 pb-8 lg:pb-10 text-on-surface-variant/90 font-body leading-relaxed space-y-4 text-base md:text-lg lg:text-xl">
                        <div className="[&_ul]:space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-primary [&_strong]:font-medium">
                          {item.content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Program Overview Image */}
          <motion.button
            type="button"
            layoutId="hipnodigest-program-image"
            onClick={() => setIsProgramImageOpen(true)}
            whileHover={{ y: -8, scale: 1.01, boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="group my-12 rounded-[2rem] overflow-hidden bg-surface-container-low border border-outline-variant/10 shadow-xl w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/50"
            aria-label="Ampliar resumen visual del programa HipnoDigest"
          >
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/programa_hipnodigest_vertical.jpg" />
              <img
                src="/images/programa_hipnodigest.jpg"
                alt="Resumen visual del programa HipnoDigest: características, objetivos y contenido general de la terapia"
                loading="lazy"
                decoding="async"
                className="block w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.015]"
              />
            </picture>
          </motion.button>

          {/* HipnoDigest Reservation Card */}
          <div
            className="relative rounded-[2rem] border border-outline-variant/10 shadow-xl overflow-hidden my-12 bg-cover bg-top bg-no-repeat before:absolute before:inset-0 before:content-[''] before:bg-surface-container-lowest/70 dark:before:bg-[#11181f]/65 before:z-0"
            style={{ backgroundImage: "url('/images/fondo_privacidad.jpg')" }}
          >
            <div className="relative z-10 p-6 md:p-8 space-y-8">
              <div className="text-center space-y-3">
                <span className="font-label text-secondary font-semibold tracking-widest uppercase text-xs">
                  Recorrido del programa
                </span>
                <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl text-primary font-medium">
                  Reserva tu plaza para HipnoDigest
                </h2>
                <p className="text-on-surface-variant/85 font-light leading-relaxed text-base md:text-lg lg:text-xl max-w-4xl mx-auto">
                  Un acompañamiento digestivo-emocional de cuatro meses con valoración inicial, intervención coordinada e integración progresiva.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-surface-container-low border border-outline-variant/10 p-5 lg:p-7 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline text-xl mx-auto md:mx-0 mb-4">
                    1
                  </div>
                  <h3 className="font-headline text-lg lg:text-2xl text-primary mb-2">Evaluación integral</h3>
                  <p className="text-sm md:text-base lg:text-lg text-on-surface-variant/85 font-light leading-relaxed">
                    Valoración nutricional + entrevista psicosomática inicial.
                  </p>
                </div>

                <div className="rounded-2xl bg-surface-container-low border border-outline-variant/10 p-5 lg:p-7 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline text-xl mx-auto md:mx-0 mb-4">
                    2
                  </div>
                  <h3 className="font-headline text-lg lg:text-2xl text-primary mb-2">Intervención coordinada</h3>
                  <p className="text-sm md:text-base lg:text-lg text-on-surface-variant/85 font-light leading-relaxed">
                    Dieta personalizada, seguimiento nutricional, hipnosis digestiva, anclajes y prácticas de respiración y meditación.
                  </p>
                </div>

                <div className="rounded-2xl bg-surface-container-low border border-outline-variant/10 p-5 lg:p-7 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline text-xl mx-auto md:mx-0 mb-4">
                    3
                  </div>
                  <h3 className="font-headline text-lg lg:text-2xl text-primary mb-2">Integración y autonomía</h3>
                  <p className="text-sm md:text-base lg:text-lg text-on-surface-variant/85 font-light leading-relaxed">
                    Consolidación de hábitos, regulación del eje intestino-cerebro y recursos para sostener el bienestar en el tiempo.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="font-label text-sm uppercase tracking-widest text-secondary font-semibold">
                    Precio del programa
                  </p>
                  <p className="font-headline text-4xl md:text-5xl text-primary mt-1">
                    1.300 €
                  </p>
                </div>

                <div className="flex flex-col items-stretch md:items-end gap-3">
                  <Link
                    to="/sesion-validacion?plan=hipnodigest"
                    className="px-8 py-4 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-opacity font-label font-bold text-center shadow-md"
                  >
                    Agendar y pagar reserva
                  </Link>
                  <p className="text-xs md:text-sm text-on-surface-variant/75 font-light text-center md:text-right max-w-xs">
                    Accederás a una página segura para confirmar tus datos y seleccionar la modalidad de abono.
                  </p>
                </div>
              </div>
            </div>
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
            <button
              type="button"
              onClick={() => setIsDoubtsModalOpen(true)}
              className="bg-[#1F9E5A] text-white px-8 py-3 rounded-full font-label font-semibold inline-flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100 w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              Resuelve tus dudas
            </button>
          </div>
        </div>
      </section>

      {/* Program Image Modal */}
      <AnimatePresence>
        {isProgramImageOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsProgramImageOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 pointer-events-none">
              <motion.div
                layoutId="hipnodigest-program-image"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[min(96vw,1200px)] max-h-[94vh] bg-white dark:bg-[#1a252f] rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/10 cursor-default flex flex-col pointer-events-auto"
              >
                <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
                  <a
                    href="/images/programa_hipnodigest.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:flex w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/80 items-center justify-center transition-all backdrop-blur-md group pointer-events-auto"
                    title="Abrir en pantalla completa / Descargar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">
                      open_in_new
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsProgramImageOpen(false)}
                    className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center transition-all backdrop-blur-md group pointer-events-auto"
                    title="Cerrar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">
                      close
                    </span>
                  </button>
                </div>

                <div className="relative w-full flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar">
                  <picture>
                    <source media="(max-width: 767px)" srcSet="/images/programa_hipnodigest_vertical.jpg" />
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.25 }}
                      src="/images/programa_hipnodigest.jpg"
                      alt="Resumen visual del programa HipnoDigest: características, objetivos y contenido general de la terapia"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto max-h-none rounded-2xl shadow-xl border border-outline-variant/5 object-contain"
                    />
                  </picture>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Doubts / FAQ Modal */}
      <AnimatePresence>
        {isDoubtsModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeDoubtsModal}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[90vh] bg-[#0b1221] text-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50 border border-white/10"
              >
                {/* Close Button */}
                <div className="p-4 pb-0 flex justify-end md:p-0 md:absolute md:top-8 md:right-8 z-[130] shrink-0">
                  <button
                    type="button"
                    onClick={closeDoubtsModal}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
                    aria-label="Cerrar modal de dudas"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">
                      close
                    </span>
                  </button>
                </div>

                {/* Scrollable Area */}
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
                  {/* Header */}
                  <div className="rounded-[2rem] bg-black/25 text-white border border-white/10 p-6 md:p-8">
                    <h2 className="font-headline text-2xl md:text-3xl italic">
                      Preguntas frecuentes sobre HipnoDigest
                    </h2>
                    <p className="text-white/60 mt-2 font-light">
                      Respuestas claras para decidir con calma si este acompañamiento digestivo-emocional encaja con lo que necesitas.
                    </p>
                  </div>

                  {/* FAQs Accordion */}
                  <div className="mt-8 rounded-[2rem] bg-black/25 text-white border border-white/10 overflow-hidden divide-y divide-white/10">
                    {hipnoDigestFaqs.map((item, index) => (
                      <div key={item.question}>
                        <button
                          type="button"
                          aria-expanded={openDoubtIndex === index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDoubtIndex(openDoubtIndex === index ? null : index);
                          }}
                          className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                        >
                          <h3 className="font-headline text-lg md:text-xl text-white">
                            {item.question}
                          </h3>
                          <span className="material-symbols-outlined text-white/70">
                            {openDoubtIndex === index ? "remove" : "add"}
                          </span>
                        </button>

                        {openDoubtIndex === index && (
                          <div className="px-6 md:px-8 pt-5 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                            {renderFaqAnswer(item.answer)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Final Conversion Card */}
                  <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                      <p className="font-label text-sm uppercase tracking-widest text-white/60 font-semibold">
                        Precio del programa
                      </p>
                      <p className="font-headline text-4xl md:text-5xl text-white mt-1">
                        1.300 €
                      </p>
                      <p className="text-white/65 font-body mt-3 max-w-2xl">
                        Reserva tu plaza para iniciar el proceso HipnoDigest. Accederás a una página segura para confirmar tus datos y seleccionar la modalidad de abono.
                      </p>
                    </div>
                    <Link
                      to="/sesion-validacion?plan=hipnodigest"
                      className="px-8 py-4 rounded-xl bg-white text-primary hover:bg-white/90 transition-opacity font-label font-bold text-center shadow-md whitespace-nowrap"
                    >
                      Agendar y pagar reserva
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
