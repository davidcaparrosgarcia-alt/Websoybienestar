import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import { motion } from "motion/react";

export default function HipnoDigestive() {
  const [openProgramMonth, setOpenProgramMonth] = useState<string | null>("valoracion");
  const programMonthRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
            Antes de comenzar el acompañamiento de cuatro meses, tendremos una primera entrevista de entre 30 y 60 minutos para comprender tu punto de partida con calma y precisión.
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
            <li><strong>Psicosomática:</strong> durante los últimos 10 días, el acompañamiento se orienta específicamente a soltar los anclajes externos e integrar tu propia capacidad de regulación.</li>
            <li><strong>Cierre:</strong> concluimos con una orientación clara de mantenimiento y prevención de recaídas, para que reconozcas tu capacidad de gestión digestiva autónoma.</li>
          </ul>
        </>
      )
    }
  ];

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
        "item": "https://soybienestar.es/hipnodisgest"
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://soybienestar.es/hipnodisgest#service",
    "name": "Programa HipnoDigest",
    "serviceType": "Acompañamiento en bienestar digestivo y hábitos",
    "provider": {
      "@id": "https://soybienestar.es/#organization"
    },
    "url": "https://soybienestar.es/hipnodisgest",
    "description": "Acompañamiento complementario que une hipnosis digestiva y asesoramiento nutricional para favorecer una mejor relación cuerpo-mente y digestión."
  };

  return (
    <div className="flex-1 w-full bg-surface-container-lowest text-on-surface flex flex-col min-h-screen">
      <SEO
        title="HipnoDigest | Hipnosis digestiva y acompañamiento nutricional | SoyBienestar"
        description="Programa online en preparación que combina hipnosis digestiva de María Iris y acompañamiento nutricional personalizado de Diego Arnold para cuidar digestión, hábitos y bienestar emocional."
        canonicalPath="/hipnodisgest"
        noIndex={false}
      />
      <StructuredData id="breadcrumb-schema-hipnodisgest" data={breadcrumbSchema} />
      <StructuredData id="hipnodisgest-service-schema" data={serviceSchema} />

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
              HipnoDigest
            </h1>
            <p className="font-headline text-xl md:text-2xl text-secondary italic font-light leading-relaxed max-w-3xl">
              Hipnosis digestiva creada por María Iris y acompañamiento nutricional personalizado de Diego Arnold.
            </p>
          </div>

          <div className="h-px w-24 bg-secondary/30 my-8 hidden md:block"></div>

          {/* Main Description */}
          <div className="space-y-6 text-on-surface-variant/90 leading-relaxed text-base md:text-lg font-light">
            <p>
              HipnoDigest nace como un programa de acompañamiento online para trabajar la relación entre digestión, sistema nervioso, hábitos y bienestar emocional. Combina recursos de hipnosis digestiva con una de mirada nutricional personalizada para ayudar a la persona a cuidarse con más claridad, calma y coherencia.
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

          <div className="my-12 rounded-[2rem] bg-surface-container-low border border-outline-variant/10 overflow-hidden shadow-sm text-left">
            <div className="p-6 md:p-8 border-b border-outline-variant/10">
              <span className="font-label text-secondary font-semibold tracking-widest uppercase text-xs">
                Evolución del programa
              </span>
              <h2 className="font-headline text-2xl md:text-3xl text-primary mt-3 font-medium">
                Cuatro meses para pasar del ajuste inicial a la autonomía digestiva
              </h2>
              <p className="text-on-surface-variant/85 font-light leading-relaxed mt-4 text-base md:text-lg">
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
                      <span className="font-headline text-lg md:text-xl text-primary">
                        {item.title}
                      </span>
                      <span className={`material-symbols-outlined text-primary/75 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        keyboard_arrow_down
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 md:px-8 pb-8 text-on-surface-variant/90 font-body leading-relaxed space-y-4 text-base md:text-lg">
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
