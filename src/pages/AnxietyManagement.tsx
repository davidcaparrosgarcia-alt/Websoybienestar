import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SYMPTOMS = [
  { id: 1, icon: 'compress', title: 'Presión en el pecho', desc: 'Un peso invisible que parece restringir la entrada de aire y la expansión natural de la calma.', weight: 15 },
  { id: 2, icon: 'psychology', title: 'Rumiación persistente', desc: 'Pensamientos circulares que se repiten como un eco en una estancia vacía, sin encontrar salida.', weight: 22 },
  { id: 3, icon: 'waves', title: 'Inquietud interna', desc: 'Una marea que no termina de bajar; un estado de alerta constante sin un peligro aparente.', weight: 18 },
  { id: 4, icon: 'air', title: 'Falta de aire', desc: 'Esa sensación de asfixia que oprime el pecho, donde el aire parece no llegar, una respuesta física que limita tu libertad respiratoria en momentos de crisis.', weight: 15 },
  { id: 5, icon: 'motion_blur', title: 'Mareos y náuseas', desc: 'Una inestabilidad física que puede manifestarse como un malestar profundo en el equilibrio de su bienestar.', weight: 12 },
  { id: 6, icon: 'ac_unit', title: 'Sudor frío', desc: 'Una respuesta térmica súbita del cuerpo ante una amenaza invisible, enfriando la superficie de la piel.', weight: 10 },
  { id: 7, icon: 'monitor_heart', title: 'Palpitaciones', desc: 'El ritmo del corazón se acelera sin esfuerzo físico, recordándonos una urgencia que aún no comprendemos.', weight: 15 },
  { id: 8, icon: 'schedule', title: 'Procrastinación', desc: 'La parálisis ante la acción por miedo al resultado, postergando la vida por una seguridad ilusoria.', weight: 15 },
  { id: 9, icon: 'spa', title: 'Caída del pelo', desc: 'El registro físico del estrés prolongado, donde el cuerpo sacrifica lo externo para proteger el núcleo.', weight: 5 },
  { id: 10, icon: 'bedtime', title: 'Insomnio', desc: 'La dificultad para apagar la luz de la consciencia cuando el cuerpo más necesita el refugio del sueño.', weight: 20 },
  { id: 11, icon: 'fitness_center', title: 'Tensión muscular', desc: 'Hombros y mandíbula que guardan el registro de batallas que aún no han ocurrido.', weight: 10 },
  { id: 12, icon: 'blur_on', title: 'Sensación de irrealidad', desc: 'Sentir que el mundo se vuelve ajeno, como si se observara la vida a través de un cristal empañado.', weight: 25 }
];

function calcularPresion(sintomasIds: number[]) {
  let sumaBase = 0;
  const n = sintomasIds.length;
  
  sintomasIds.forEach(id => {
    const s = SYMPTOMS.find(x => x.id === id);
    if (s) sumaBase += s.weight;
  });

  let fc = 1.0;
  if (n >= 6) { fc = 2.0; }
  else if (n >= 3) { fc = 1.6; }

  let grados = Math.min(180, Math.round(sumaBase * fc));
  return grados;
}

const ANSIEDAD_FAQS = [
  {
    question: "¿Cómo controlar la ansiedad?",
    answer: `Controlar la ansiedad no significa “apagarla” de golpe ni luchar contra ella con fuerza. Muchas veces, el primer paso es justo el contrario: dejar de pelearse con la sensación y ayudar al cuerpo a entender que no está en peligro inmediato.\n\nCuando notes ansiedad, prueba a bajar el ritmo. Respira más despacio, apoya los pies en el suelo, mira a tu alrededor y nombra mentalmente dónde estás y qué está ocurriendo realmente. Intenta que tu atención vuelva al presente sin que nada más importe.\n\nTambién puede ayudarte preguntarte: “¿Estoy ante un peligro real ahora mismo?”. Seguramente tu respuesta pueda reducir la intensidad de la ansiedad, si consigues que tu cuerpo deje de reaccionar a un peligro que no existe.\n\nSi la ansiedad aparece a menudo, afecta a tu descanso, tus relaciones o tu día a día, no tienes por qué gestionarla en soledad. Hablar con un profesional puede ayudarte a comprender qué la activa y qué necesitas para recuperar calma. También puedes comenzar con nuestra consulta gratuita con IA: un primer espacio de escucha para ordenar tu situación, reconocer tus señales internas y abrir un camino más claro hacia tu bienestar.`
  },
  {
    question: "¿Cuáles son los síntomas de la ansiedad?",
    answer: `La ansiedad puede sentirse de muchas formas. A veces aparece en la mente, como una preocupación constante, pensamientos repetitivos, miedo a que algo te pueda salir mal, dificultad para concentrarte junto a al hecho de no poder desconectar de una situación o pensamiento que te inquieta.\n\nOtras veces se nota en el cuerpo: presión en el pecho, respiración acelerada, palpitaciones, tensión muscular, sudoración, molestias digestivas, cansancio, temblores, mareo o sensación de nudo en la garganta. Ataques de pánico y en casos extremos vómitos y hasta desmayos.\n\nTambién puede afectar al comportamiento: evitar situaciones, buscar seguridad constantemente, revisar demasiado las cosas, aislarse o sentir que cualquier tarea sencilla pesa mucho más de lo normal.\n\nNo todas las personas viven la ansiedad igual. Por eso, más que compararte con otros, es importante observar cómo se manifiesta en ti y si está limitando tu vida.`
  },
  {
    question: "¿Qué hacer cuando tienes ansiedad?",
    answer: `Cuando tienes ansiedad, para intentar no llegar a esos ataques de pánico, debes intentar empezar a llevar todas las acciones de tu día a algo sencillo: no exigirte resolverlo todo en ese momento. La ansiedad suele crecer cuando intentamos controlarlo todo de golpe.\n\nTambién puedes probar este pequeño paso: detente, lleva una mano al pecho o al abdomen, respira lento y alarga un poco la exhalación. Después, mira a tu alrededor y busca cinco cosas que puedas ver. Esto ayuda a tu mente a volver al presente.\n\nY puede servirte escribir en una frase qué estás sintiendo: “ahora mismo siento miedo”, “estoy anticipando algo”, “mi cuerpo está activado”. Poner palabras ordena la experiencia.\n\nSi la ansiedad es muy intensa, se repite con frecuencia o te impide vivir con normalidad, pedir ayuda no es exagerar. Es una forma de cuidarte antes de que el malestar se haga más grande.\n\nSi al leer esto sientes que la ansiedad no es solo un momento puntual, sino algo que empieza a ocupar demasiado espacio en tu día a día, puedes dar un primer paso sin compromiso: realizar nuestra consulta gratuita con IA. En unos minutos podrás ordenar lo que estás viviendo, comprender mejor qué puede estar sosteniendo tu malestar y recibir una primera lectura personalizada que te ayude a decidir, con más claridad, si quieres continuar el proceso con nuestro Cuestionario Espejo recibirás un dosier gratuito que podría ayudarte.`
  },
  {
    question: "¿Cómo saber si tengo ansiedad?",
    answer: `Puedes sospechar que estás viviendo ansiedad cuando tu mente o tu cuerpo se mantienen en alerta incluso sin un peligro claro delante.\n\nAlgunas señales frecuentes son preocuparte demasiado por todo, imaginar constantemente escenarios negativos, sentir presión en el pecho, notar el corazón acelerado, dormir peor, estar irritable, evitar situaciones o sentir que no consigues descansar mentalmente.\n\nLa clave no es solo qué síntomas tienes, sino cuánto interfieren en tu vida. Si te cuesta dormir, relacionarte, concentrarte, trabajar, disfrutar o tomar decisiones por culpa de esa sensación de alerta, merece la pena prestarle atención.\n\nEsto no sustituye una valoración profesional. No se trata de ponerte una etiqueta, sino de entender qué te está pasando y qué apoyo puede ayudarte. A veces la ansiedad no necesita que la enfrentes con más fuerza, sino que alguien te ayude a traducir lo que está intentando decirte.\n\nSi sientes que ha llegado el momento de entender mejor lo que te ocurre, puedes comenzar con nuestra consulta gratuita con IA: un primer espacio de escucha para ordenar tu situación, reconocer tus señales internas y abrir un camino más claro hacia tu bienestar.`
  },
  {
    question: "¿Qué es un ataque de ansiedad?",
    answer: `Un ataque de ansiedad o ataque de pánico es un episodio intenso en el que el cuerpo se activa de forma brusca, como si estuviera ante un peligro. Puede aparecer como miedo intenso, o una sensación de perder el control, palpitaciones, falta de aire, presión en el pecho, temblores, sudoración, mareo, náuseas o sensación de irrealidad.\n\nLos ataques de pánico aparecen como periodos repentinos de miedo intenso con síntomas físicos como corazón acelerado, falta de aire, sudoración, temblores, mareo o sensación de fatalidad en los que te sientes confuso por los síntomas, sin saber realmente porqué te está pasando.\n\nAunque puede asustar mucho, un ataque de ansiedad no significa que estés perdiendo la cabeza. Tu cuerpo está reaccionando con una alarma muy fuerte, aunque no siempre haya un peligro real.\n\nDurante el episodio, intenta respirar despacio, no salir corriendo si no es necesario, recordar que la ola sube y baja, y buscar un punto de apoyo: una persona, un lugar tranquilo, una frase breve o una técnica de anclaje.\n\nImportante: si hay dolor fuerte en el pecho, dificultad respiratoria intensa, desmayo, síntomas nuevos o dudas sobre si puede ser algo médico, es mejor pedir atención sanitaria urgente por precaución.`
  },
  {
    question: "¿Por qué tengo ansiedad sin motivo?",
    answer: `A veces la ansiedad parece aparecer “sin motivo”, pero eso no significa que sea inventada. Puede que el motivo no esté claro todavía, o que tu cuerpo esté reaccionando a una acumulación de tensión, cansancio, preocupaciones, experiencias pasadas, cambios recientes o emociones que llevas tiempo sosteniendo.\n\nLa ansiedad no siempre responde a una causa visible en el momento. A veces aparece cuando por fin paras, cuando intentas dormir, cuando algo pequeño toca una inseguridad más profunda o cuando tu sistema nervioso lleva demasiado tiempo en alerta. El miedo o el pánico pueden tener causas diferentes en cada persona y el cuerpo libera hormonas del estrés como adrenalina y cortisol cuando se siente ansioso o asustado aunque tu parte consciente no se sienta así.\n\nNo encontrar el motivo de inmediato no significa que no exista. Significa que quizá necesitas observar con más calma qué situaciones, pensamientos, relaciones o momentos activan esa respuesta.\n\nEl objetivo no es culparte por sentir ansiedad, sino comprender qué intenta decir tu cuerpo o tu inconsciente y qué necesitas para recuperar seguridad.\n\nLa ansiedad no siempre se calma ignorándola; a veces empieza a transformarse cuando conseguimos comprenderla. Si lo deseas podemos intentar averiguar el origen de tu ansiedad juntos, puedes realizar nuestra consulta gratuita con IA: un primer espacio de escucha para ordenar lo que te ocurre, recibir una lectura inicial de tu situación y decidir con más claridad si quieres continuar con el Cuestionario Espejo y recibir un dosier gratuito que podría serte de ayuda.`
  }
];

export default function AnxietyManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSeoAnxietyPage = location.pathname === "/ansiedad";
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);

  useEffect(() => {
    if (!isSeoAnxietyPage) return;

    const previousTitle = document.title;
    document.title = "Ansiedad: síntomas, causas y qué hacer para recuperar la calma | SoyBienestar.es";

    const metaDescriptionContent = "Reconoce síntomas frecuentes de ansiedad, comprende por qué puedes vivir en alerta incluso sin un peligro real y descubre primeros pasos para ordenar lo que sientes.";

    let metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content") || "";

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", metaDescriptionContent);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const previousCanonical = canonical?.getAttribute("href") || "";

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/ansiedad`);

    return () => {
      document.title = previousTitle;

      if (metaDescription) {
        metaDescription.setAttribute("content", previousDescription);
      }

      if (canonical) {
        if (previousCanonical) {
          canonical.setAttribute("href", previousCanonical);
        } else {
          canonical.remove();
        }
      }
    };
  }, [isSeoAnxietyPage]);

  useEffect(() => {
    if (!isSeoAnxietyPage) return;

    const scriptId = "faq-jsonld-ansiedad";
    document.getElementById(scriptId)?.remove();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ANSIEDAD_FAQS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [isSeoAnxietyPage]);

  const toggleSymptom = (id: number) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const pressureDegrees = calcularPresion(selectedSymptoms);
  
  // Zone determination (RESTORED 5-ZONE RIGOROUS SCALE)
  let zoneColor = "text-[#4f6260]"; 
  let zoneGradient = "from-[#d1e7e4] to-[#b6cbc8]";
  let iconName = "check_circle";
  let gradientId = "gradCalm";

  let zoneText = "Estado de Calma o Estrés Leve";
  let analysisText = "Capacidad de procesamiento óptima. La carga neuroemocional se encuentra dentro de un margen seguro y sostenible. Mantenimiento correcto de tu energía.";
  let riskIndex = "BAJO";
  let tolerance = "ALTA";

  if (pressureDegrees >= 141) {
    zoneColor = "text-[#991b1b]";
    zoneGradient = "from-[#7f1d1d] to-[#991b1b]";
    iconName = "warning";
    gradientId = "gradCritical";
    zoneText = "Crisis de Angustia / Burnout Agudo";
    analysisText = "Cuando el hashrate de tus pensamientos sube tanto que no genera bloques de solución, sino que solo consume energía, ocurre el bloqueo funcional. El gasto innecesario de energía ha saturado el sistema. Necesitas intervención y descompresión urgente.";
    riskIndex = "CRÍTICO";
    tolerance = "MÍNIMA";
  } else if (pressureDegrees >= 101) {
    zoneColor = "text-[#ef4444]";
    zoneGradient = "from-[#ef4444] to-[#991b1b]";
    iconName = "error";
    gradientId = "gradSevere";
    zoneText = "Ansiedad Severa / Pre-bloqueo";
    analysisText = "Tu sistema está reportando sobrecarga severa. Estás empezando a perder resiliencia frente a nuevos estímulos y el riesgo de un ataque de pánico o bloqueo funcional está escalando drásticamente.";
    riskIndex = "MUY ALTO";
    tolerance = "BAJA";
  } else if (pressureDegrees >= 61) {
    zoneColor = "text-[#f97316]";
    zoneGradient = "from-[#f97316] to-[#ef4444]";
    iconName = "notifications_active";
    gradientId = "gradHigh";
    zoneText = "Ansiedad Clínica / Estrés Crónico";
    analysisText = "Tu sistema está drenando energía rápidamente sin llegar a un consenso interno sano. La acumulación sintomática está consumiendo tus recursos como un bucle infinito, elevando el riesgo de agotamiento funcional.";
    riskIndex = "ALTO";
    tolerance = "MEDIA-BAJA";
  } else if (pressureDegrees >= 31) {
    zoneColor = "text-[#eab308]";
    zoneGradient = "from-[#eab308] to-[#f97316]";
    iconName = "info";
    gradientId = "gradModerate";
    zoneText = "Estrés Moderado";
    analysisText = "El sistema empieza a drenar energía. Está procesando eventos en segundo plano de forma constante. Cuidado con no optimizar o soltar estas pesadas cargas a tiempo para evitar la cronicidad.";
    riskIndex = "MEDIO";
    tolerance = "MEDIA";
  }

  if (selectedSymptoms.length === 0) {
    analysisText = "La válvula está a la espera. Señala los indicadores para realizar el escáner de carga emocional de tu sistema central.";
    zoneText = "Modo Espera";
    zoneColor = "text-[#4f6260]";
    zoneGradient = "from-[#d1e7e4] to-[#b6cbc8]";
    iconName = "query_stats";
    gradientId = "gradInactive";
    riskIndex = "--";
    tolerance = "--";
  }

  const ARC_LENGTH = 216.77; 
  const CIRCUMFERENCE = 289.03; 
  const strokeDashoffsetValue = selectedSymptoms.length === 0 
    ? CIRCUMFERENCE 
    : CIRCUMFERENCE - (Math.min(pressureDegrees, 180) / 180) * ARC_LENGTH;

  const getProjectionColor = (deg: number) => {
    if (deg >= 141) return '#ef4444'; // Rojo normal equilibrado
    if (deg >= 101) return '#f87171'; // Rojo suave
    if (deg >= 61) return '#f97316';  // Naranja
    if (deg >= 31) return '#eab308';  // Amarillo
    return '#00d4ff'; // Azul
  };

  const getProjectionGlow = (deg: number) => {
    if (deg >= 141) return '0 0 20px #ef4444';
    if (deg >= 101) return '0 0 15px #ef4444';
    if (deg >= 61) return '0 0 15px #f97316';
    if (deg >= 31) return '0 0 15px #eab308';
    return '0 0 15px #00d4ff';
  };

  return (
    <div className="flex-1 bg-transparent w-full font-body text-on-surface">
      {isSeoAnxietyPage && (
        <section className="pt-24 pb-20 px-6 md:px-12">
          <div className="max-w-screen-xl mx-auto rounded-[3rem] bg-[#101820] text-white shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-8 md:p-12 lg:p-16">
              <p className="font-label text-white/55 uppercase tracking-[0.35em] text-xs mb-6">
                Guía sobre ansiedad
              </p>

              <h1 className="font-headline text-4xl md:text-6xl leading-tight mb-6">
                Ansiedad: síntomas, causas y qué hacer para recuperar la calma
              </h1>

              <p className="font-headline italic text-2xl md:text-3xl text-white/80 mb-12">
                Vivir en alerta también agota, sobre todo cuando no consigues sentirte a salvo.
              </p>

              <div className="space-y-8">
                <div>
                  <h2 className="font-headline text-3xl md:text-4xl mb-4">
                    Comprender la ansiedad como una alarma interna
                  </h2>
                  <p className="font-body text-white/72 text-lg leading-relaxed max-w-4xl">
                    Esta imagen representa la ansiedad como un sistema de alarma interno: una red de pensamientos, señales corporales y sensación de peligro que puede mantenerse activa incluso cuando no existe una amenaza real.
                  </p>
                </div>

                <img
                  src="/images/info-ansiedad.jpg"
                  alt="Infografía sobre ansiedad con una figura en estado de alerta rodeada de flechas, ondas y señales de alarma. Explica que vivir en alerta también agota y que la ansiedad puede funcionar como un sistema de alarma interno que no siempre responde a un peligro real."
                  className="w-full h-auto object-contain rounded-[2rem] shadow-2xl"
                />
              </div>

              <div className="mt-12 rounded-[2rem] bg-black/20 text-white shadow-2xl overflow-hidden border border-white/10">
                <div className="p-8 md:p-10 border-b border-white/10">
                  <h2 className="font-headline text-3xl md:text-4xl italic">
                    Preguntas frecuentes sobre ansiedad
                  </h2>
                  <p className="text-white/65 mt-3 font-light">
                    Respuestas claras para empezar a ordenar lo que sientes sin etiquetarte ni exigirte tenerlo todo resuelto.
                  </p>
                </div>

                <div className="divide-y divide-white/10">
                  {ANSIEDAD_FAQS.map((item, index) => (
                    <div key={item.question}>
                      <button
                        type="button"
                        aria-expanded={openFaqIndex === index}
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full text-left px-8 md:px-10 py-6 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                      >
                        <h3 className="font-headline text-xl md:text-2xl text-white">
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
                  Empieza a ordenar lo que sientes
                </h2>
                <p className="text-white/70 max-w-3xl mx-auto mb-8 text-lg leading-relaxed">
                  Si la ansiedad empieza a ocupar demasiado espacio en tu día a día, puedes dar un primer paso sencillo: ordenar lo que estás viviendo y decidir después si quieres continuar.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/session')}
                    className="px-8 py-4 rounded-full bg-white text-primary font-label font-bold hover:scale-[1.02] transition-transform"
                  >
                    Realizar consulta gratuita
                  </button>
                  <button
                    onClick={() => navigate('/resources')}
                    className="px-8 py-4 rounded-full border border-white/30 text-white font-label font-bold hover:bg-white/10 transition-colors"
                  >
                    Ver herramientas
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}
      {/* Intro Section */}
      <section className="pt-24 pb-12 bg-transparent">
        <div className="max-w-screen-2xl mx-auto px-12">
          <div className="text-center md:text-left">
            <h2 className="font-headline text-4xl text-primary mb-4">Reconociendo las señales.</h2>
            <p className="text-xl text-on-surface-variant italic">Escucha lo que tu cuerpo intenta comunicar.</p>
          </div>
        </div>
      </section>

      {/* Barometer Section */}
      <section className="py-24 bg-transparent border-t border-b border-black/5 relative overflow-hidden">
        {/* Subtle background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-fixed/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-screen-2xl mx-auto px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl text-primary mb-4 tracking-tight">Válvula de Presión Interna.</h2>
            <p className="text-lg text-on-surface-variant font-light max-w-2xl mx-auto">
              Monitoreo en tiempo real de su carga neuroemocional. Los indicadores reflejan la tensión acumulada y la capacidad de procesamiento actual de su sistema.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_0.85fr] gap-8 items-center max-w-7xl mx-auto">
            {/* Left Card: Análisis de Telemetría (Restaurada al original) */}
            <div className="bg-white/90 backdrop-blur-xl border border-primary/10 p-8 rounded-2xl shadow-[0_8px_32px_-12px_rgba(22,40,57,0.1)] relative overflow-hidden group self-stretch">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#b5c8df] to-[#d1e4fb]"></div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-xl" style={{ color: '#162839', fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                <h3 className="font-headline text-sm font-bold uppercase tracking-widest" style={{ color: '#162839' }}>Análisis de Telemetría</h3>
              </div>
              <p className="font-body text-base font-light leading-relaxed mb-6" style={{ color: '#334155' }}>
                <strong className="font-medium block mb-2" style={{ color: '#162839' }}>
                  {selectedSymptoms.length === 0 ? "Sistema inactivo." : "Estudio cognitivo procesado."}
                </strong>
                {analysisText}
              </p>
              <div className="flex justify-start items-center text-xs font-mono border-t border-black/5 pt-4" style={{ color: '#64748b' }}>
                <span>ACTUALIZADO: {selectedSymptoms.length > 0 ? "TIEMPO REAL" : "ESPERANDO SENSOR"}</span>
              </div>
            </div>

            {/* Center: Valve JPG with Clean Projection */}
            <div className="flex flex-col items-center justify-center relative py-4">
              <div className="relative w-full max-w-[580px] aspect-[1.5/1] flex items-center justify-center">
                {/* Background Image (.jpg) */}
                <img 
                  src="/images/valvula-presion.jpg" 
                  alt="Válvula" 
                  className="absolute inset-0 w-full h-full object-contain z-0"
                />

                {/* Projection Layer: Centered over the dial (Adjusted to 29% left, 53% top) */}
                <div className="relative z-10 w-full h-full pointer-events-none">
                  
                  {/* Digital Display (WHITE) */}
                  <div className="absolute top-[52%] left-[27%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1 drop-shadow-xl" style={{ color: selectedSymptoms.length > 0 ? getProjectionColor(pressureDegrees) : '#ffffff' }}>Presión</span>
                    <div className="flex items-start">
                      <span className="font-headline text-6xl leading-none tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" style={{ textShadow: selectedSymptoms.length > 0 ? getProjectionGlow(pressureDegrees) : 'none' }}>{pressureDegrees}</span>
                      <span className="text-white text-2xl font-medium ml-1 mt-1 drop-shadow-md">°</span>
                    </div>
                    <span className="text-[9px] text-white/50 font-mono mt-1 tracking-widest uppercase">CALC_DYNAMIC</span>
                  </div>

                  {/* SVG Arc - Scaled to match dial borders */}
                  <div className="absolute top-[52%] left-[27%] -translate-x-1/2 -translate-y-1/2 w-[44%] h-[66%]">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="vGrad" x1="0%" x2="100%">
                          {/* Sólido de punta a punta en el nivel crítico final */}
                          <stop offset="0%" stopColor={pressureDegrees >= 141 ? '#ef4444' : (pressureDegrees >= 61 ? getProjectionColor(pressureDegrees) : "#ffffff")} stopOpacity={pressureDegrees >= 61 ? "1" : "0.1"}></stop>
                          <stop offset="100%" stopColor={selectedSymptoms.length > 0 ? getProjectionColor(pressureDegrees) : '#00d4ff'} stopOpacity="1"></stop>
                        </linearGradient>
                      </defs>
                      {/* Track background */}
                      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeDasharray="216 288" transform="rotate(135 50 50)" />
                      {/* Active indicator */}
                      <circle 
                        className="transition-all duration-1000 ease-out" 
                        cx="50" cy="50" r="46" fill="none" 
                        stroke="url(#vGrad)" strokeWidth="6" 
                        strokeDasharray="288 288" 
                        strokeDashoffset={288 - (pressureDegrees / 180) * 216}
                        strokeLinecap="round" transform="rotate(135 50 50)" 
                        style={{ filter: selectedSymptoms.length > 0 ? `drop-shadow(${getProjectionGlow(pressureDegrees)})` : 'none' }}
                      />
                    </svg>
                  </div>

                  {/* 0 and 180 (Positioned relative to 27% center) */}
                  <span className="absolute font-headline text-xl font-bold text-white/30" style={{ left: '13%', top: '79%' }}>0</span>
                  <span className="absolute font-headline text-xl font-bold text-white/30" style={{ left: '41.5%', top: '79%' }}>180</span>
                </div>
              </div>
            </div>

            {/* Right Card: Estado de Situación (Adjusted Width/Height) */}
            <div className="bg-white/90 backdrop-blur-xl border border-primary/10 p-8 rounded-2xl shadow-xl relative overflow-hidden flex flex-col self-stretch">
              <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${zoneGradient}`}></div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-xl" style={{ color: pressureDegrees >= 131 ? '#991b1b' : pressureDegrees >= 81 ? '#f97316' : '#4f6260', fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
                <h3 className="font-headline text-sm font-bold uppercase tracking-widest" style={{ color: '#162839' }}>Situación</h3>
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-headline mb-4" style={{ color: pressureDegrees >= 131 ? '#991b1b' : pressureDegrees >= 81 ? '#f97316' : '#4f6260' }}>{zoneText}</h4>
                <p className="font-body text-sm font-light leading-relaxed mb-8" style={{ color: '#334155' }}>
                  {selectedSymptoms.length === 0 
                  ? "Analizando marcadores..." 
                  : "Fluctuaciones detectadas por sumatorio de síntomas."}
                </p>
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-black/5">
                  <div className="flex justify-between items-center bg-black/5 p-3 rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Riesgo</span>
                    <span className="font-bold text-[#162839]">{riskIndex}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Symptoms Grid Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-screen-2xl mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
            {SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom.id);
              return (
                <div 
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`relative flex flex-col gap-6 p-8 rounded-xl cursor-pointer transition-all duration-500 border ${
                    isSelected 
                      ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10 dark:bg-primary/[0.02] dark:border-primary/30 dark:shadow-none' 
                      : 'bg-surface-container-lowest border-transparent hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`material-symbols-outlined text-4xl transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-primary-fixed-dim'}`}>
                      {symptom.icon}
                    </span>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-primary border-primary dark:bg-primary/80 dark:border-primary' : 'border-outline-variant'}`}>
                      {isSelected && <span className="material-symbols-outlined text-white dark:text-[#0b1221] text-sm font-bold">check</span>}
                    </div>
                  </div>
                  <h3 className={`font-headline text-2xl transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-primary'}`}>{symptom.title}</h3>
                  <p className="text-on-surface-variant font-light leading-relaxed">{symptom.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Section 1: Restructured 'La naturaleza del ruido' */}
      <section className="relative py-48 overflow-hidden bg-transparent">
        <div className="absolute inset-0 z-0">
          <img alt="A path lost in thick fog with ethereal light" className="w-full h-full object-cover opacity-80 scale-105" src="/images/naturaleza_del_ruido.jpg"/>
          <div className="absolute inset-0 bg-[#2c3e50]/40"></div>
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-12 text-center">
          <h2 className="font-headline text-3xl text-primary-fixed-dim mb-12 italic uppercase tracking-widest">La naturaleza del ruido</h2>
          <div className="max-w-4xl mx-auto">
            <p className="font-headline text-2xl md:text-3xl lg:text-4xl text-white leading-[1.6] md:leading-[1.6] font-light italic">
              La ansiedad no es tu enemiga, sino una brújula interior que ha perdido su norte. Es tu instinto primitivo gritando que no estás a salvo, convirtiendo tu entorno en un lugar hostil aunque racionalmente sepas que no hay peligro. El ruido excesivo es el eco de esa brújula rompiéndose, indicando un peligro invisible que tu cuerpo intenta desesperadamente evitar. Nuestro objetivo es que esa aguja deje de dar vueltas sin sentido y recupere su centro, su paz interior.
            </p>
          </div>
          <div className="mt-14 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button onClick={() => navigate('/session')} className="px-8 py-5 bg-[#2c3e50] text-white font-bold rounded-full text-lg hover:bg-[#42617c] transition-all duration-300">
              Iniciar Consulta Gratuita
            </button>
            <button onClick={() => navigate('/resources')} className="px-8 py-5 border border-white/30 text-white font-medium rounded-full text-lg hover:bg-white/10 transition-all duration-300">
              Regresar
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
