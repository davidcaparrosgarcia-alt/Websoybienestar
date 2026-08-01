import React from "react";

export type ReprogramateDetailId =
  | "general"
  | "basico"
  | "intermedio"
  | "completo"
  | null;

const e = React.createElement;

export function ReprogramateGeneralDetail() {
  return e(
    "section",
    {
      id: "reprogramate-general-detail",
      className:
        "w-full mt-6 rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-6 md:p-10 shadow-sm text-on-surface-variant leading-relaxed",
    },
    e(
      "div",
      { className: "max-w-5xl mx-auto space-y-10" },
      e(
        "div",
        null,
        e(
          "h2",
          {
            className:
              "font-headline text-3xl md:text-4xl font-bold text-primary mb-4",
          },
          "¿Qué es ReprogrÁmate?",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "ReprogrÁmate es un programa de acompañamiento emocional y crecimiento personal creado para ayudarte a comprender qué hay detrás de tu malestar, trabajar los patrones que pueden mantenerlo y adquirir recursos que puedas aplicar en tu vida cotidiana.",
          ),
          e(
            "p",
            null,
            "El proceso se realiza completamente online y combina sesiones terapéuticas, herramientas de regulación emocional, Programación Neurolingüística (PNL), hipnosis consciente, meditación, ejercicios prácticos y contenidos formativos.",
          ),
          e(
            "p",
            null,
            "No se trata únicamente de aliviar lo que estás sintiendo en este momento. El objetivo es ayudarte a identificar el origen de determinados bloqueos, reorganizar tu dirección y construir cambios más conscientes, realistas y sostenibles.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "¿Qué situaciones puede ayudarte a trabajar?",
        ),
        e(
          "p",
          { className: "mb-3" },
          "ReprogrÁmate puede acompañarte cuando estás atravesando situaciones como:",
        ),
        e(
          "ul",
          { className: "list-disc pl-6 space-y-2" },
          e("li", null, "Ansiedad y estados de alerta constantes."),
          e("li", null, "Estrés personal o laboral."),
          e("li", null, "Rumiación mental y pensamientos repetitivos."),
          e("li", null, "Insomnio o dificultades para descansar."),
          e("li", null, "Falta de concentración, claridad o dirección."),
          e("li", null, "Procrastinación y dificultad para ponerte en marcha."),
          e("li", null, "Rupturas sentimentales y procesos de cambio vital."),
          e(
            "li",
            null,
            "Desajustes emocionales relacionados con la alimentación.",
          ),
          e(
            "li",
            null,
            "Desánimo, apatía, síntomas depresivos o una depresión diagnosticada.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "1. Desprogramación y reprogramación de la mente",
        ),
        e(
          "p",
          { className: "mb-3" },
          "Una parte importante del proceso consiste en descubrir las creencias, pensamientos y respuestas automáticas que pueden estar condicionando tu forma de actuar, relacionarte o tomar decisiones.",
        ),
        e("p", { className: "mb-3" }, "En esta área se puede trabajar mediante:"),
        e(
          "ul",
          { className: "list-disc pl-6 space-y-2 mb-4" },
          e(
            "li",
            null,
            e("strong", null, "Detección de creencias y patrones: "),
            "identificación de pensamientos limitantes, hábitos mentales y respuestas que se repiten de manera automática.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Programación Neurolingüística: "),
            "utilización de técnicas de PNL para revisar determinadas asociaciones, interpretaciones y respuestas aprendidas.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Hipnosis consciente terapéutica: "),
            "acceso a un estado de atención profunda que puede facilitar el trabajo con hábitos, emociones y contenidos subconscientes.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Balance de nueva dirección: "),
            "definición de objetivos deseables, realistas y alcanzables, ordenando los pasos necesarios para avanzar hacia ellos.",
          ),
        ),
        e(
          "p",
          null,
          "En ocasiones, la meta final que una persona desea alcanzar todavía está demasiado lejos de su situación actual. El trabajo consiste entonces en encontrar una dirección adecuada y construir objetivos intermedios que le permitan avanzar de forma progresiva.",
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "2. Sanación y origen del trauma",
        ),
        e(
          "p",
          { className: "mb-3" },
          "Esta parte del proceso está orientada a explorar experiencias, heridas emocionales y aprendizajes que pueden seguir influyendo en el presente.",
        ),
        e(
          "p",
          { className: "mb-3" },
          "El objetivo es comprender, hacer consciente y trabajar aquello que pueda estar sosteniendo un bloqueo emocional o una determinada forma de reaccionar.",
        ),
        e("p", { className: "mb-3" }, "Algunas de las terapias utilizadas son:"),
        e(
          "ul",
          { className: "list-disc pl-6 space-y-2 mb-4" },
          e(
            "li",
            null,
            e("strong", null, "Trabajo con el niño interior: "),
            "exploración de heridas de la infancia, necesidades emocionales, autoestima y formas de protección aprendidas.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Patrones familiares y transgeneracionales: "),
            "identificación de comportamientos, mensajes y respuestas emocionales que pueden haberse repetido dentro de la familia y continuar influyendo de forma inconsciente.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Rastreo de eventos semilla: "),
            "búsqueda de experiencias significativas que pudieron originar determinadas creencias, miedos, bloqueos o respuestas en la vida adulta.",
          ),
        ),
        e(
          "p",
          null,
          "A veces, reconocer el origen de un comportamiento permite comprender que no responde a una decisión consciente propia, sino a una reacción aprendida. Hacerlo visible puede ser el primer paso para empezar a modificarlo.",
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "3. Herramientas de apoyo y crecimiento",
        ),
        e(
          "p",
          { className: "mb-3" },
          "El proceso no se limita a las sesiones. ReprogrÁmate incorpora recursos para que puedas seguir trabajando, observándote y regulándote en tu día a día.",
        ),
        e(
          "p",
          { className: "mb-3" },
          "Según el programa contratado, pueden incluirse:",
        ),
        e(
          "ul",
          { className: "list-disc pl-6 space-y-2 mb-6" },
          e(
            "li",
            null,
            e("strong", null, "Curso de gestión de emociones: "),
            "con distintos grados para cada programa, ofrece contenido para reconocer, comprender y gestionar de manera más consciente lo que sientes.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Ejercicios de autodescubrimiento: "),
            "actividades para profundizar en el conocimiento de tus emociones, necesidades, patrones y objetivos.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Meditaciones multimodales: "),
            "meditaciones sonoras, guiadas, focalizadas o somáticas.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Regulación del sistema nervioso: "),
            "respiraciones y prácticas dirigidas a reducir la activación y recuperar un estado de mayor calma reactivando el nervio vago.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Anclajes de PNL: "),
            "recursos que pueden ayudarte a conectar con estados de seguridad, calma, decisión o confianza adquiridos en las sesiones con la terapeuta para poner en práctica.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Guías personalizadas: "),
            "pautas relacionadas con el descanso, la organización mental, la regulación emocional u otras necesidades detectadas durante el proceso.",
          ),
        ),
        e(
          "div",
          {
            className:
              "bg-surface/60 rounded-2xl p-6 border border-outline-variant/10 space-y-3",
          },
          e(
            "h4",
            { className: "font-headline text-xl font-bold text-primary" },
            "Acceso progresivo al curso y a las herramientas",
          ),
          e(
            "p",
            null,
            "Todos los programas permiten acceder al Curso de gestión de emociones. El plan Básico incluye los módulos generales; el Intermedio amplía el acceso a algunos contenidos especiales; y el Completo desbloquea la totalidad del curso, incluidos todos los módulos especiales.",
          ),
          e(
            "p",
            null,
            "El acceso a otras funciones y herramientas de SoyBienestar.es también aumenta de forma proporcional al programa elegido.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "¿Cómo es el acompañamiento?",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "Las sesiones terapéuticas de ReprogrÁmate son realizadas por María Iris, terapeuta principal y directora de los programas de SoyBienestar.es.",
          ),
          e(
            "p",
            null,
            "David Caparrós se encarga del desarrollo y funcionamiento de la plataforma, de las herramientas relacionadas con la inteligencia artificial y de la creación e impartición del curso de gestión de emociones.",
          ),
          e(
            "p",
            null,
            "Diego Arnold interviene exclusivamente en el programa HipnoDigest.",
          ),
          e(
            "p",
            null,
            "El seguimiento se realiza principalmente a través de las sesiones incluidas en cada programa. En ellas se revisa la evolución de la persona, se adaptan los objetivos y se decide qué aspectos necesitan trabajarse a continuación.",
          ),
          e(
            "p",
            null,
            "También existe acompañamiento mediante WhatsApp. Si durante el proceso surge una duda importante o una situación que requiere orientación, la persona puede ponerse en contacto con el equipo dentro de los límites del acompañamiento ofrecido.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Tres programas adaptables",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "ReprogrÁmate dispone de tres modalidades: Básico, Intermedio y Completo. Todas comparten la misma duración general, pero se diferencian por el número de sesiones, la profundidad del acompañamiento, los contenidos formativos y las herramientas que se desbloquean.",
          ),
          e(
            "p",
            null,
            "Elegir un programa no significa quedar limitado permanentemente a esa modalidad. Si durante el proceso descubres que necesitas más sesiones, un acompañamiento mayor, más herramientas o un acceso más amplio al curso de gestión de emociones, puedes pasar a un programa superior.",
          ),
          e(
            "p",
            null,
            "Para realizar ese cambio se abona la diferencia entre ambos programas, se añaden las sesiones que correspondan a la nueva modalidad y se desbloquean los contenidos y herramientas adicionales.",
          ),
          e(
            "p",
            null,
            "De esta forma, el proceso puede adaptarse si tus necesidades cambian o si durante el acompañamiento se descubre que el problema requiere un trabajo más profundo de lo previsto inicialmente.",
          ),
        ),
        e(
          "div",
          {
            className:
              "mt-6 bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-2",
          },
          e(
            "h4",
            { className: "font-headline text-xl font-bold text-primary" },
            "Programa Básico",
          ),
          e(
            "p",
            null,
            "Pensado para personas que necesitan recuperar calma, descanso, claridad y foco ante situaciones de estrés sostenido, insomnio, sobrecarga laboral o bloqueos cotidianos. Incluye tres sesiones terapéuticas, una sesión personal de gestión emocional, acceso a los cinco módulos básicos del curso de gestión de emociones, ejercicios guiados, recursos personalizados y acompañamiento puntual mediante WhatsApp.",
          ),
        ),
        e(
          "div",
          {
            className:
              "mt-4 bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-2",
          },
          e(
            "h4",
            { className: "font-headline text-xl font-bold text-primary" },
            "Programa Intermedio",
          ),
          e(
            "p",
            null,
            "Pensado para personas que necesitan un acompañamiento más continuado ante ansiedad recurrente, pensamientos en bucle, procrastinación, insomnio grave, desconexión emocional, conflictos relacionales o estrés persistente. Incluye seis sesiones terapéuticas durante tres meses, una sesión aproximadamente cada quince días, y tres sesiones adicionales de gestión emocional.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Una experiencia flexible y personalizada",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "ReprogrÁmate está diseñado para que puedas realizar el proceso desde cualquier lugar y avanzar respetando tu ritmo personal.",
          ),
          e(
            "p",
            null,
            "La combinación de sesiones, materiales, herramientas digitales y seguimiento permite adaptar el acompañamiento a tu situación, sin perder la cercanía, la empatía y el contacto humano.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Proceso previo obligatorio",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "Antes de acceder a cualquiera de los tres programas es obligatorio completar el recorrido de orientación de SoyBienestar.es.",
          ),
          e(
            "p",
            null,
            "No existe una vía alternativa ni una contratación directa sin este proceso previo.",
          ),
          e(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-3 gap-6 my-6" },
            e(
              "div",
              {
                className:
                  "bg-surface/60 rounded-2xl p-5 border border-outline-variant/10",
              },
              e(
                "div",
                {
                  className:
                    "font-headline text-lg font-bold text-primary mb-1",
                },
                "1. Consulta gratuita",
              ),
              e(
                "p",
                { className: "text-sm" },
                "Primera escucha para ordenar la situación y conocer el punto de partida.",
              ),
            ),
            e(
              "div",
              {
                className:
                  "bg-surface/60 rounded-2xl p-5 border border-outline-variant/10",
              },
              e(
                "div",
                {
                  className:
                    "font-headline text-lg font-bold text-primary mb-1",
                },
                "2. Cuestionario Espejo",
              ),
              e(
                "p",
                { className: "text-sm" },
                "Recogida estructurada de información para profundizar en necesidades, patrones y contexto.",
              ),
            ),
            e(
              "div",
              {
                className:
                  "bg-surface/60 rounded-2xl p-5 border border-outline-variant/10",
              },
              e(
                "div",
                {
                  className:
                    "font-headline text-lg font-bold text-primary mb-1",
                },
                "3. Dossier Espejo",
              ),
              e(
                "p",
                { className: "text-sm" },
                "Lectura personalizada que permite orientar la recomendación del programa con mayor precisión.",
              ),
            ),
          ),
          e(
            "p",
            null,
            "La consulta gratuita, el Cuestionario Espejo y el Dossier Espejo permiten analizar el punto de partida, comprender mejor las necesidades de la persona y recomendar la modalidad más coherente con su situación.",
          ),
        ),
      ),
    ),
  );
}

export function ReprogramateBasicDetail() {
  return e(
    "section",
    {
      id: "reprogramate-basic-detail",
      className:
        "w-full mt-6 rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-6 md:p-10 shadow-sm text-on-surface-variant leading-relaxed",
    },
    e(
      "div",
      { className: "max-w-5xl mx-auto space-y-10" },
      e(
        "div",
        null,
        e(
          "h2",
          {
            className:
              "font-headline text-3xl md:text-4xl font-bold text-primary mb-2",
          },
          "Programa Básico",
        ),
        e(
          "h3",
          {
            className:
              "font-headline text-xl md:text-2xl font-semibold text-primary/80 mb-4",
          },
          "Recuperar calma, claridad y estabilidad",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "El Programa Básico está dirigido a personas que atraviesan un periodo de estrés sostenido, dificultades para descansar, sobrecarga laboral, falta de concentración o bloqueos cotidianos que están afectando a su bienestar y a su funcionamiento diario.",
          ),
          e(
            "p",
            null,
            "Durante tres meses se combina el trabajo terapéutico con aprendizaje emocional, ejercicios y recursos prácticos para ayudar a recuperar una base más estable y aplicar lo trabajado también fuera de las sesiones.",
          ),
        ),
        e(
          "div",
          {
            className:
              "mt-6 bg-surface/60 rounded-2xl p-6 border border-outline-variant/10",
          },
          e(
            "h4",
            {
              className:
                "font-headline text-lg font-bold text-primary mb-3",
            },
            "El programa pone el foco especialmente en:",
          ),
          e(
            "ul",
            { className: "list-disc pl-6 space-y-2" },
            e("li", null, "Estrés personal y laboral."),
            e("li", null, "Descanso e insomnio."),
            e("li", null, "Organización emocional."),
            e("li", null, "Claridad, concentración y foco."),
            e("li", null, "Bloqueos cotidianos que dificultan avanzar."),
            e("li", null, "Recuperación de la calma y del equilibrio diario."),
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Cuatro sesiones personales online",
        ),
        e(
          "p",
          { className: "mb-3" },
          "El programa incluye cuatro sesiones individuales realizadas en directo a lo largo de los tres meses:",
        ),
        e(
          "ul",
          { className: "list-disc pl-6 space-y-3 mb-4" },
          e(
            "li",
            null,
            e("strong", null, "Tres sesiones terapéuticas: "),
            "una primera sesión de 90 minutos y dos sesiones posteriores de una hora.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Una sesión personal de gestión emocional: "),
            "destinada a presentar el curso, explicar cómo utilizarlo y facilitar las pautas iniciales para aprovechar sus contenidos, guías y ejercicios.",
          ),
        ),
        e(
          "p",
          null,
          "Las sesiones terapéuticas permiten revisar la situación, detectar patrones y aplicar las herramientas que resulten más adecuadas para el proceso, como PNL, hipnosis consciente, respiración terapéutica, regulación emocional, detección de patrones o meditación personalizada.",
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "El curso de gestión de emociones",
        ),
        e(
          "div",
          { className: "space-y-4 mb-6" },
          e(
            "p",
            null,
            "La gestión emocional es una parte fundamental del Programa Básico y no un complemento secundario.",
          ),
          e(
            "p",
            null,
            "El plan da acceso a los cinco módulos básicos del curso de gestión de emociones, junto con sus guías y ejercicios prácticos.",
          ),
          e(
            "p",
            null,
            "Los ejercicios no son exámenes. Están diseñados para facilitar la comprensión de cada módulo, fijar lo aprendido y ayudar a trasladarlo a situaciones reales de la vida cotidiana.",
          ),
          e(
            "p",
            null,
            "La sesión personal de gestión emocional sirve como punto de partida: presenta el recorrido del curso, explica cómo trabajarlo correctamente y ofrece las pautas iniciales para que después la persona pueda avanzar con autonomía durante el programa.",
          ),
        ),
        e(
          "div",
          {
            className:
              "bg-surface/60 rounded-2xl p-6 border border-outline-variant/10 space-y-2",
          },
          e(
            "h4",
            { className: "font-headline text-xl font-bold text-primary" },
            "Qué aporta el curso en este plan",
          ),
          e(
            "p",
            null,
            "Una base estructurada para reconocer lo que se está sintiendo, comprender mejor determinadas respuestas emocionales, observar patrones que se repiten y adquirir recursos para gestionar esas emociones de una forma más consciente.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Herramientas y materiales personalizados",
        ),
        e(
          "div",
          { className: "space-y-4 mb-6" },
          e("p", null, "El acompañamiento no se limita a las sesiones."),
          e(
            "p",
            null,
            "Según las necesidades detectadas, la persona puede recibir ejercicios, guías y recursos para continuar trabajando entre encuentros.",
          ),
        ),
        e(
          "div",
          { className: "space-y-6" },
          e(
            "div",
            {
              className:
                "bg-surface/60 rounded-2xl p-6 border border-outline-variant/10 space-y-3",
            },
            e(
              "h4",
              {
                className: "font-headline text-xl font-bold text-primary",
              },
              "Meditación guiada personalizada",
            ),
            e(
              "p",
              null,
              "Uno de los principales recursos personalizados es una meditación creada específicamente para cada persona a partir de su situación, sus emociones y los objetivos que se están trabajando.",
            ),
            e(
              "p",
              null,
              "No se selecciona una meditación de un catálogo previo: se prepara de manera individual para ese proceso concreto.",
            ),
            e(
              "p",
              null,
              "Además de esta meditación personalizada, la plataforma puede ofrecer otras meditaciones generales y herramientas aplicables a diferentes situaciones emocionales.",
            ),
          ),
          e(
            "div",
            {
              className:
                "bg-surface/60 rounded-2xl p-6 border border-outline-variant/10 space-y-3",
            },
            e(
              "h4",
              {
                className: "font-headline text-xl font-bold text-primary",
              },
              "Moneda de anclaje personalizada",
            ),
            e(
              "p",
              null,
              "Cuando forma parte del trabajo terapéutico, puede prepararse una moneda de anclaje impresa en 3D y adaptada al proceso de la persona.",
            ),
            e(
              "p",
              null,
              "Su función es servir como apoyo físico para conectar con el estado, recurso o aprendizaje trabajado mediante PNL, hipnosis u otras técnicas utilizadas durante las sesiones.",
            ),
            e(
              "p",
              null,
              "La pieza se plantea de forma individual para cada usuario y se integra como un recurso más dentro del acompañamiento cuando resulta útil para su proceso.",
            ),
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Acompañamiento mediante WhatsApp",
        ),
        e(
          "div",
          { className: "space-y-4 mb-6" },
          e(
            "p",
            null,
            "El Programa Básico incluye contacto mediante WhatsApp durante los tres meses para que la persona pueda resolver dudas puntuales relacionadas con ejercicios, materiales o indicaciones concretas del proceso.",
          ),
          e(
            "p",
            null,
            "También permite trasladar alguna situación específica surgida entre sesiones cuando sea necesario recibir una orientación breve.",
          ),
          e(
            "p",
            null,
            "Su función es mantener la continuidad del acompañamiento y evitar que la persona quede desconectada entre una sesión y la siguiente.",
          ),
        ),
        e(
          "div",
          {
            className:
              "bg-surface/60 rounded-2xl p-6 border border-outline-variant/10 space-y-3",
          },
          e(
            "h4",
            { className: "font-headline text-xl font-bold text-primary" },
            "Uso del acompañamiento",
          ),
          e(
            "p",
            null,
            "El WhatsApp complementa el programa, pero no sustituye las sesiones ni está planteado como un sistema de consultas terapéuticas ilimitadas.",
          ),
          e(
            "p",
            null,
            "Se utiliza para dudas puntuales y situaciones excepcionales y concretas vinculadas al proceso.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Un plan que puede evolucionar contigo",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "El Programa Básico ofrece una estructura definida de sesiones, curso y herramientas.",
          ),
          e(
            "p",
            null,
            "Si durante el proceso se detecta que la persona necesita más sesiones, un seguimiento más intenso, módulos especiales del curso o recursos adicionales, puede pasar a un programa superior.",
          ),
          e(
            "p",
            null,
            "El cambio se realiza abonando la diferencia entre ambas modalidades.",
          ),
          e(
            "p",
            null,
            "Se añaden las sesiones correspondientes y se desbloquean los contenidos y herramientas adicionales del nuevo programa.",
          ),
          e(
            "p",
            null,
            "De esta manera, empezar por el Programa Básico no impide ampliar posteriormente el acompañamiento si las necesidades cambian o si durante el proceso se considera conveniente profundizar más.",
          ),
        ),
      ),
    ),
  );
}

export function ReprogramateIntermediateDetail() {
  return e(
    "section",
    {
      id: "reprogramate-intermediate-detail",
      className:
        "w-full mt-6 rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-6 md:p-10 shadow-sm text-on-surface-variant leading-relaxed",
    },
    e(
      "div",
      { className: "max-w-5xl mx-auto space-y-10" },
      e(
        "div",
        null,
        e(
          "h2",
          {
            className:
              "font-headline text-3xl md:text-4xl font-bold text-primary mb-2",
          },
          "Programa Intermedio",
        ),
        e(
          "h3",
          {
            className:
              "font-headline text-xl md:text-2xl font-semibold text-primary/80 mb-4",
          },
          "Un acompañamiento más continuado para recuperar dirección y equilibrio",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "El Programa Intermedio está dirigido a personas que conviven con ansiedad recurrente, pensamientos que vuelven una y otra vez, procrastinación, insomnio grave, desconexión emocional, conflictos en sus relaciones o un estrés que persiste en el tiempo.",
          ),
          e(
            "p",
            null,
            "Durante tres meses se plantea un seguimiento terapéutico más frecuente que en el Programa Básico, con una sesión personal aproximadamente cada quince días. Esta continuidad permite revisar con mayor regularidad la evolución de la persona y trabajar de manera progresiva los patrones, hábitos y respuestas emocionales que están interfiriendo en su bienestar.",
          ),
        ),
        e(
          "div",
          {
            className:
              "mt-6 bg-surface/60 rounded-2xl p-6 border border-outline-variant/10",
          },
          e(
            "h4",
            {
              className:
                "font-headline text-lg font-bold text-primary mb-3",
            },
            "El programa pone el foco especialmente en:",
          ),
          e(
            "ul",
            { className: "list-disc pl-6 space-y-2" },
            e(
              "li",
              null,
              "Ansiedad recurrente y estados de alerta que se repiten.",
            ),
            e("li", null, "Pensamientos en bucle y rumiación mental."),
            e("li", null, "Hábitos bloqueantes y procrastinación."),
            e(
              "li",
              null,
              "Gestión de emociones y desconexión emocional.",
            ),
            e("li", null, "Autoestima."),
            e("li", null, "Relaciones y conflictos relacionales."),
            e("li", null, "Insomnio grave y estrés persistente."),
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Seis sesiones terapéuticas en tres meses",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "El programa incluye seis sesiones terapéuticas distribuidas a lo largo de tres meses, con una sesión personal online aproximadamente cada quince días.",
          ),
          e(
            "p",
            null,
            "La mayor frecuencia de encuentros permite mantener un seguimiento más continuado del proceso, revisar qué está funcionando, detectar resistencias o nuevos bloqueos y ajustar el trabajo a medida que la persona avanza.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Tres sesiones adicionales de gestión emocional",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "Además de las seis sesiones terapéuticas, el Programa Intermedio incluye tres sesiones personales de gestión emocional, online y en directo.",
          ),
          e(
            "p",
            null,
            "Estas sesiones se alternan con las sesiones terapéuticas y permiten acompañar de forma más cercana el recorrido por el curso de gestión de emociones, resolver dudas y reforzar la aplicación práctica de sus contenidos.",
          ),
          e(
            "p",
            null,
            "El programa da acceso a los cinco módulos básicos del curso y permite desbloquear uno de los tres módulos de especialidad disponibles, junto con sus ejercicios de refuerzo.",
          ),
          e(
            "p",
            null,
            "El módulo de especialidad se selecciona según la situación y las necesidades de la persona. Si ninguno se adapta específicamente a su necesidad en ese momento, puede elegir el que prefiera trabajar.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Qué trabajamos",
        ),
        e(
          "div",
          { className: "space-y-4 mb-4" },
          e(
            "p",
            null,
            "El Programa Intermedio profundiza en aspectos que pueden mantenerse o repetirse a pesar de los intentos de cambio.",
          ),
          e(
            "p",
            null,
            "El objetivo es trabajar tanto la respuesta emocional inmediata como los patrones que la sostienen y su repercusión en la vida cotidiana.",
          ),
        ),
        e(
          "ul",
          { className: "list-disc pl-6 space-y-3" },
          e(
            "li",
            null,
            e("strong", null, "Ansiedad: "),
            "observar detonantes, respuestas automáticas y formas de recuperar regulación y sensación de control.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Bucles mentales: "),
            "reconocer pensamientos repetitivos y trabajar formas más útiles de relacionarse con ellos.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Hábitos bloqueantes: "),
            "identificar conductas que frenan el avance y desarrollar respuestas alternativas.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Gestión de emociones: "),
            "ampliar la capacidad de reconocer, comprender y regular lo que se siente.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Autoestima: "),
            "revisar creencias y patrones que afectan a la valoración personal.",
          ),
          e(
            "li",
            null,
            e("strong", null, "Relaciones: "),
            "trabajar respuestas emocionales y patrones que influyen en los vínculos y los conflictos relacionales.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Herramientas clave",
        ),
        e(
          "p",
          { className: "mb-3" },
          "Según la situación y las necesidades detectadas, el proceso puede apoyarse en diferentes herramientas terapéuticas y recursos de acompañamiento.",
        ),
        e(
          "ul",
          { className: "list-disc pl-6 space-y-2 mb-4" },
          e("li", null, "Programación Neurolingüística (PNL)."),
          e("li", null, "Reprogramación de patrones y creencias."),
          e(
            "li",
            null,
            "Balance mental y reorganización de la dirección personal.",
          ),
          e("li", null, "Meditación."),
          e("li", null, "Hipnosis cuando resulte adecuada para el proceso."),
          e("li", null, "Prácticas apoyadas por guías audiovisuales."),
          e("li", null, "Materiales personalizados."),
        ),
        e(
          "p",
          null,
          "La hipnosis no tiene que utilizarse necesariamente en todos los casos. Se incorpora cuando la terapeuta considera que puede aportar valor al proceso; en otras situaciones, el tiempo de terapia puede aprovecharse mediante técnicas más adecuadas y eficientes para la necesidad concreta de la persona.",
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Seguimiento y continuidad entre sesiones",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "El Programa Intermedio mantiene el acompañamiento mediante WhatsApp durante los tres meses para dudas puntuales relacionadas con ejercicios, materiales o indicaciones concretas del proceso, y para situaciones excepcionales surgidas entre sesiones cuando sea necesaria una orientación breve.",
          ),
          e(
            "p",
            null,
            "El WhatsApp complementa el programa, pero no sustituye las sesiones ni está planteado como un sistema de consultas terapéuticas ilimitadas.",
          ),
          e(
            "p",
            null,
            "Su función es mantener la continuidad del acompañamiento únicamente cuando resulte necesario entre una sesión y la siguiente.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Materiales y recursos personalizados",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "El Programa Intermedio incorpora guías y materiales personalizados. Estos recursos permiten trasladar parte del trabajo de las sesiones al día a día y continuar practicando entre encuentros.",
          ),
          e(
            "p",
            null,
            "En este plan se libera un número mayor de meditaciones genéricas adicionales y de guías de ejercicios. También se mantiene la meditación guiada creada específicamente para la persona y, cuando forma parte del trabajo terapéutico, la moneda de anclaje impresa en 3D y adaptada a su proceso.",
          ),
        ),
      ),
      e(
        "div",
        null,
        e(
          "h3",
          {
            className:
              "font-headline text-2xl md:text-3xl font-bold text-primary mb-4",
          },
          "Un plan con mayor continuidad y profundidad",
        ),
        e(
          "div",
          { className: "space-y-4" },
          e(
            "p",
            null,
            "La principal diferencia respecto al Programa Básico es la frecuencia y profundidad del acompañamiento: seis sesiones terapéuticas durante tres meses, aproximadamente una cada quince días, además de tres sesiones de gestión emocional.",
          ),
          e(
            "p",
            null,
            "Este ritmo permite trabajar con mayor continuidad situaciones más complejas o persistentes, revisar con más frecuencia los cambios y sostener de forma más cercana la aplicación de las herramientas aprendidas.",
          ),
          e(
            "p",
            null,
            "También amplía el acceso al curso de gestión de emociones, a las meditaciones, a las guías y a los materiales disponibles durante el proceso.",
          ),
        ),
      ),
    ),
  );
}

