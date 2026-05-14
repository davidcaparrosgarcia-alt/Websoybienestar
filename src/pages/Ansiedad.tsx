import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import SEO from "../components/SEO";

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

export default function Ansiedad() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  
  useEffect(() => {
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
  }, []);

  return (
    <>
      <SEO title="Ansiedad: síntomas, causas y cómo recuperar la calma | SoyBienestar" description="Descubre cómo controlar la ansiedad, cuáles son sus síntomas, qué hacer cuando aparece y cuándo puede ayudarte una orientación online inicial." canonicalPath="/ansiedad" noIndex={false} />
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
            aria-label="Cerrar ventana de ansiedad"
            onClick={() => navigate('/')}
            className="absolute right-5 top-5 z-50 w-10 h-10 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="p-8 md:p-12 lg:p-16 pt-20 md:pt-24">
            <p className="font-label text-white/45 uppercase tracking-[0.35em] text-[10px] md:text-xs mb-4">
              Guía sobre ansiedad
            </p>

            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl leading-tight text-white/85 mb-8 max-w-4xl">
              Ansiedad: síntomas, causas y cómo recuperar la calma
            </h1>

            <img
              src="/images/info-ansiedad.jpg"
              alt="Infografía sobre ansiedad con una figura en estado de alerta rodeada de flechas, ondas y señales de alarma. Explica que vivir en alerta también agota y que la ansiedad puede funcionar como un sistema de alarma interno que no siempre responde a un peligro real."
              className="w-full h-auto object-contain rounded-[2rem] shadow-2xl"
            />
            
            <div className="mt-12 rounded-[2rem] bg-black/20 text-white shadow-2xl overflow-hidden border border-white/10">
              <div className="p-8 md:p-10 border-b border-white/10">
                <h2 className="font-headline text-2xl md:text-3xl italic">
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

            {/* Internal Links Block */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <h2 className="font-headline text-2xl text-white/80 mb-6 italic">También puede ayudarte</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/estres" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Estrés</Link>
                <Link to="/insomnio" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Insomnio</Link>
                <Link to="/pensar-demasiado-rumiacion" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Rumiación mental</Link>
                <Link to="/resources" className="px-6 py-2 rounded-full border border-white/20 text-white/90 font-medium hover:bg-white/10 transition-colors">Herramientas</Link>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
