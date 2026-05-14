import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import RippleWindow from "../components/RippleWindow";
import LighthouseBeamFrame from "../components/LighthouseBeamFrame";
import SymptomCard from "../components/SymptomCard";
import NextStepsModal from "../components/NextStepsModal";
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

export const ESTRES_FAQS = [
  {
    question: "¿Cómo quitar el estrés?",
    answer: `Quitar el estrés no siempre significa eliminar todos los problemas de golpe. Muchas veces, el primer paso es bajar la intensidad con la que tu cuerpo y tu mente están intentando sostenerlo todo.\n\nCuando sientas que el estrés te supera, prueba a detenerte unos minutos y preguntarte: “¿Qué parte de todo esto depende realmente de mí ahora mismo?”. Separar lo urgente de lo importante, y lo controlable de lo que no está en tus manos, puede ayudarte a recuperar un poco de claridad. Identificar qué te estresa, centrarte en lo que puedes cambiar y hablar con alguien de confianza cuando el estrés laboral o cotidiano pesa demasiado.\n\nTambién puede ayudarte algo muy sencillo: respirar más despacio, salir a caminar, escribir lo que tienes en la cabeza o reducir una tarea grande a un solo paso manejable. El estrés crece cuando todo parece mezclado; empieza a bajar cuando conseguimos ordenar una parte. Sé que a veces llevar esto a la práctica se hace cuesta arriba, pero todo es empezar.\n\nSi sientes que el estrés lleva tiempo ocupando demasiado espacio en tu vida, nuestra consulta gratuita puede ayudarte a ponerle nombre a lo que estás viviendo y recibir una primera lectura personalizada, sin compromiso y sin tener que explicarlo todo perfecto desde el principio.`
  },
  {
    question: "¿Cuáles son los síntomas del estrés?",
    answer: `El estrés puede aparecer en la mente, en el cuerpo y en la forma en que te relacionas con los demás. A veces se nota como preocupación constante, irritabilidad, dificultad para concentrarte, sensación de prisa interna o pensamientos que no se apagan.\n\nEn el cuerpo puede sentirse como tensión muscular, dolor de cabeza, molestias digestivas, cansancio, presión en el pecho, sueño alterado o sensación de estar siempre “en marcha”. En el comportamiento puede aparecer como impaciencia, aislamiento, comer peor, procrastinar, discutir más o sentir que todo te cuesta el doble. Y normalmente te das cuenta o se manifiestan estos síntomas cuando ya es tarde y frenas de golpe por unas vacaciones o algo similar.\n\nNo todas las personas viven el estrés igual. Algunas se aceleran; otras se apagan. Algunas parecen funcionar por fuera, pero por dentro sienten que van al límite.\n\nLa señal importante no es solo “tener estrés”, sino notar que empieza a afectar a tu descanso, tu energía, tus relaciones, tu trabajo o tu forma de disfrutar. Cuando eso ocurre, conviene escucharlo antes de que el cuerpo tenga que gritar más fuerte.\n\nSi no lo tienes muy claro aún, podemos ayudarte a identificar los síntomas y tu estado actual. Inicia una consulta gratuita con una IA y un cuestionario para obtener un dosier gratuito que puede ayudarte a definir mejor tu estado.`
  },
  {
    question: "¿Qué es el estrés laboral?",
    answer: `El estrés laboral aparece cuando lo que el trabajo te exige empieza a sentirse mayor que los recursos, el tiempo, la energía o el control que tienes para resolverlo. No siempre se debe a trabajar mucho; a veces nace de la presión constante, la falta de reconocimiento, los plazos imposibles, la incertidumbre, los conflictos o la sensación de no poder parar.\n\nEl Instituto Nacional de Seguridad y Salud en el Trabajo describe el estrés como una respuesta ante un estímulo o agente estresor, y señala factores laborales habituales como la falta de control sobre el trabajo, la monotonía, los plazos ajustados o trabajar a alta velocidad.\n\nPuede sentirse como cansancio mental, tensión antes de empezar la jornada, ansiedad al abrir el correo, irritabilidad, bloqueo, falta de motivación o sensación de estar perdiendo partes de ti por intentar cumplir con todo.\n\nNo significa que seas débil ni que no sirvas para tu trabajo. A veces significa que tu sistema lleva demasiado tiempo adaptándose a una carga que necesita ser revisada.`
  },
  {
    question: "¿Por qué me da ansiedad en el trabajo?",
    answer: `La ansiedad en el trabajo puede aparecer por muchas razones: exceso de responsabilidad, miedo a equivocarte, presión por rendir, conflictos con compañeros, sensación de vigilancia, falta de control, inseguridad laboral o acumulación de tareas que nunca termina.\n\nA veces no es una sola causa, sino una suma. Tu cuerpo empieza a asociar el trabajo con amenaza, aunque racionalmente sepas que “solo es trabajo”. Entonces pueden aparecer nervios antes de entrar, palpitaciones, bloqueo, ganas de evitar ciertas tareas, preocupación constante o dificultad para desconectar al llegar a casa.\n\nTambién puede ocurrir que el trabajo active heridas más profundas: miedo a no valer, necesidad de demostrar, miedo al rechazo, culpa por descansar o dificultad para poner límites.\n\nSi te pasa a menudo, no lo reduzcas a “soy así” o “tengo que aguantar”. Puede ser una señal de que necesitas entender mejor qué parte del trabajo está activando esa alarma interna y qué recursos necesitas para recuperar seguridad.\n\nPodemos ayudarte si no eres capaz de resolverlo solo. Da el primer paso, realiza ahora la consulta gratuita con IA y descubre qué puede estar detrás de tu ansiedad, sin diagnósticos automáticos, sin compromiso y con una primera orientación pensada para ayudarte a comprenderte mejor.`
  },
  {
    question: "¿Qué hacer cuando el trabajo me supera?",
    answer: `Cuando el trabajo te supera, intenta no convertir ese momento en un juicio contra ti. Sentirte desbordado no significa que seas incapaz; significa que tu sistema está intentando responder a más carga de la que puede procesar con calma.\n\nEmpieza por ordenar. Escribe todo lo que tienes pendiente y separa tres grupos: lo urgente, lo importante y lo que puede esperar. Después, elige un solo primer paso. Cuando estás saturado, intentar resolverlo todo a la vez suele aumentar el bloqueo.\n\nTambién es importante revisar límites: horarios, disponibilidad, pausas, nivel de exigencia y capacidad real. Si puedes, habla con alguien de confianza o con una persona responsable para aclarar prioridades. El NHS recomienda, ante el estrés laboral, centrarse en lo que se puede cambiar y buscar apoyo en personas de confianza.\n\nSi el trabajo lleva tiempo superándote y notas que afecta a tu sueño, tu ánimo o tu salud, quizá no necesitas esforzarte más, sino comprender mejor qué está pasando. Nuestra consulta gratuita puede ser un primer espacio para ordenar tu situación y ver si lo que vives es estrés puntual, agotamiento acumulado o una señal de que necesitas acompañamiento.`
  },
  {
    question: "¿Qué es el burnout?",
    answer: `El burnout, o síndrome de estar quemado por el trabajo, suele aparecer cuando el estrés laboral se mantiene durante demasiado tiempo y la persona empieza a sentirse emocionalmente agotada, distante o cada vez menos capaz de implicarse como antes.\n\nNo es simplemente “estar cansado”. Es una forma de desgaste más profunda, relacionada con la sensación de haber dado demasiado durante demasiado tiempo sin recuperar energía, sentido o control. El INSST lo describe como una respuesta al estrés laboral crónico, vinculada a actitudes y sentimientos negativos en el contexto del trabajo.\n\nPuede manifestarse como agotamiento persistente, desmotivación, cinismo, irritabilidad, sensación de inutilidad, bajo rendimiento, bloqueo o rechazo hacia tareas que antes se toleraban mejor.\n\nSi te reconoces en esto, no lo ignores. El burnout no suele mejorar solo con “un fin de semana de descanso”. A menudo necesita una revisión más profunda de cargas, límites, apoyo, expectativas y recuperación emocional.`
  }
];

export const INSOMNIO_FAQS = [
  {
    question: "¿Qué hacer cuando no puedes dormir?",
    answer: `Cuando no puedes dormir, lo peor suele ser empezar una pelea mental contra el reloj. Mirar la hora, calcular cuánto queda para levantarte o repetirte “tengo que dormir ya” puede activar aún más el cuerpo.\n\nPrueba a cambiar el objetivo: en lugar de obligarte a dormir, intenta crear condiciones para descansar. Baja la luz, aparta el móvil, respira despacio y lleva la atención a algo simple: el peso del cuerpo en la cama, el aire entrando y saliendo, o una imagen tranquila.\n\nSi pasan muchos minutos y sigues muy activado, puede ayudarte levantarte un momento, hacer algo suave y aburrido con poca luz, y volver a la cama cuando aparezca somnolencia. El NHS explica que el insomnio implica problemas regulares para dormir y que suele mejorar con cambios en los hábitos de sueño.\n\nSi esto te ocurre con frecuencia, quizá tu insomnio no sea solo un problema de sueño, sino una señal de preocupación, ansiedad o sobrecarga acumulada. Nuestra consulta gratuita puede ayudarte a ordenar qué está manteniendo tu mente despierta y darte una primera lectura personalizada de tu situación sin compromisos.`
  },
  {
    question: "¿Cómo dormir rápido?",
    answer: `Dormir rápido no siempre depende de “hacer una técnica para dormir perfecta”. El sueño llega mejor cuando el cuerpo deja de sentirse en alerta. Por eso, más que forzarlo, conviene preparar una transición.\n\nUna hora antes de dormir, intenta bajar estímulos: menos pantallas, menos conversación intensa, menos trabajo, menos luz fuerte. Cuidar el entorno de sueño y gestionar las preocupaciones antes de acostarse, por ejemplo anotando lo que tienes en mente y dejándolo para el día siguiente.\n\nTambién puedes probar una respiración sencilla: inspira lentamente, suelta el aire más despacio de lo que lo tomas y repite varias veces. No busques dormir en el primer minuto; busca decirle al cuerpo que ya no tiene que resolver nada ahora.\n\nUna frase útil puede ser: “Ahora no tengo que solucionar mi vida, solo descansar”. Parece simple, pero a veces la mente necesita permiso para soltar.`
  },
  {
    question: "¿Por qué no puedo dormir?",
    answer: `No poder dormir puede tener muchas causas. A veces se relaciona con estrés, preocupaciones, cambios de horarios, exceso de pantallas, cafeína, dolor, hábitos irregulares o una etapa emocionalmente exigente. El estrés por trabajo, salud, dinero, familia o acontecimientos vitales puede mantener la mente activa por la noche y dificultar el sueño.\n\nTambién puede ocurrir que durante el día consigas funcionar, pero al llegar la noche tu mente encuentre el primer silencio para sacar todo lo que quedó pendiente. Entonces aparecen pensamientos, anticipaciones, recuerdos o esa sensación de “no puedo desconectar”.\n\nEl insomnio no siempre significa que haya algo “mal” en ti. A veces significa que tu sistema nervioso no ha encontrado todavía una forma segura de bajar la guardia.\n\nSi te pasa de forma repetida, conviene observar no solo cómo duermes, sino cómo estás viviendo durante el día: qué cargas sostienes, qué emociones callas, qué preocupaciones se repiten y qué necesita tu cuerpo para sentirse más seguro. Permítenos ayudarte a descubrir las posibles causas de tu insomnio. Puedes dar un primer paso sin coste realizando una consulta gratuita en nuestra consulta IA y cuestionario; recibirás un dosier que puede intentar ayudarte a conocer esas causas.`
  },
  {
    question: "¿Cómo combatir el insomnio?",
    answer: `Combatir el insomnio no debería convertirse en otra batalla. Muchas veces ayuda más construir una rutina amable y constante que buscar una solución inmediata cada noche.\n\nIntenta mantener horarios parecidos, reducir pantallas antes de dormir, evitar cenas muy pesadas, cuidar la oscuridad y reservar la cama para dormir o descansar, no para discutir con tus pensamientos. El NHS recomienda acudir a un profesional si los cambios de hábitos no ayudan o si crees que puedes tener un problema de sueño.\n\nTambién puede ser útil escribir antes de acostarte: qué queda pendiente, qué puedes hacer mañana y qué no necesitas resolver esta noche. Esto ayuda a que la mente no use la cama como despacho emocional.\n\nSi el insomnio viene acompañado de ansiedad, tristeza, tensión corporal o preocupación constante, quizá necesita una mirada más amplia. No se trata solo de dormir más, sino de entender qué te mantiene despierto por dentro.`
  },
  {
    question: "¿Cómo dormir con ansiedad?",
    answer: `Dormir con ansiedad es difícil porque el cuerpo intenta descansar mientras la mente sigue vigilando. Por eso, antes de dormir, no conviene discutir con los pensamientos ni intentar ganarles por fuerza.\n\nPuedes empezar por bajar la activación física: luz suave, respiración lenta, una ducha templada, estiramientos suaves o una música tranquila. Después, intenta sacar los pensamientos de la cabeza y ponerlos en papel. No para resolverlos, sino para decirle a tu mente: “ya está registrado, mañana lo miraré”.\n\nTambién ayuda llevar la atención al cuerpo de forma amable: notar los pies, las piernas, la espalda, la respiración. Si aparece un pensamiento, no hace falta perseguirlo; puedes volver una y otra vez al cuerpo.\n\nLa ansiedad nocturna suele necesitar comprensión, no solo disciplina. Si cada noche se convierte en una lucha, nuestra consulta gratuita puede ayudarte a identificar qué preocupaciones, miedos o cargas están activando y enseñarte alguna herramienta de utilidad para tu caso.`
  },
  {
    question: "¿Por qué me despierto muchas veces por la noche?",
    answer: `Despertarse varias veces por la noche puede deberse a muchos factores: estrés, ansiedad, hábitos de sueño irregulares, ruido, luz, temperatura, alcohol, cafeína, molestias físicas o preocupaciones que se reactivan cuando el sueño se vuelve más ligero.\n\nA veces la persona se duerme, pero no descansa profundamente porque el cuerpo sigue en modo vigilancia. Es como si una parte de ti comprobara cada cierto tiempo si todo está bajo control.\n\nLa clave está en observar el patrón: si te despiertas siempre a la misma hora, si aparece un pensamiento concreto, si hay tensión corporal, si necesitas mirar el móvil, si te cuesta volver a dormir o si al día siguiente te levantas agotado.\n\nSi los despertares son frecuentes, duran semanas o afectan a tu energía diaria, merece la pena revisarlo con calma. No se trata solo de “dormir del tirón”, sino de entender por qué tu descanso se está fragmentando.`
  }
];

export const PROCRASTINACION_FAQS = [
  {
    question: "¿Cómo dejar de procrastinar?",
    answer: `A veces no evitamos la tarea en sí, sino la sensación que nos provoca: miedo a hacerlo mal, presión por hacerlo perfecto, aburrimiento, inseguridad, saturación o cansancio mental. Por eso, repetirte “tengo que hacerlo ya” puede aumentar todavía más el bloqueo.\n\nUn primer paso útil es reducir la tarea hasta que parezca casi demasiado pequeña. En lugar de “tengo que ordenar todo”, prueba con “voy a dedicar cinco minutos a empezar”. En lugar de “tengo que terminar el proyecto”, prueba con “voy a abrir el documento y escribir una primera frase”.\n\nLa clave no es esperar a tener ganas, sino crear una entrada suave. Muchas veces la motivación aparece después de empezar, no antes.\n\nSi sientes que procrastinas mucho y eso empieza a afectar a tu autoestima, tu trabajo o tu tranquilidad, puede ayudarte mirar más allá de la tarea. Nuestra consulta gratuita puede ser un primer espacio para entender qué emoción, miedo o patrón está detrás de ese bloqueo.`
  },
  {
    question: "¿Por qué procrastino tanto?",
    answer: `Procrastinar mucho no significa necesariamente que seas una persona vaga o irresponsable. A menudo significa que tu mente ha aprendido a posponer aquello que le genera tensión, miedo, confusión o exigencia.\n\nPuedes procrastinar porque una tarea te parece demasiado grande, porque no sabes por dónde empezar, porque temes equivocarte, porque quieres hacerlo perfecto o porque estás mentalmente agotado. También puede ocurrir cuando algo te importa mucho: cuanto más importante es, más presión puede generar.\n\nLa procrastinación alivia a corto plazo, porque al posponer sientes un pequeño descanso. Pero después suele aparecer culpa, prisa, ansiedad o sensación de haber fallado otra vez. Ese ciclo puede ser muy desgastante.\n\nLa pregunta útil no es solo “¿por qué no lo hago?”, sino “¿qué siento justo antes de evitarlo?”. Ahí suele estar la pista más importante.`
  },
  {
    question: "¿La procrastinación es pereza?",
    answer: `No siempre. A veces puede haber falta de interés o cansancio, claro, pero muchas veces la procrastinación no nace de la pereza, sino de una dificultad para gestionar lo que una tarea despierta por dentro.\n\nUna persona puede querer hacer algo, saber que le conviene hacerlo y aun así no conseguir empezar. Eso suele indicar que no es simplemente “no querer”, sino estar atrapado entre la intención y la emoción que bloquea la acción.\n\nPuede haber ansiedad, perfeccionismo, miedo al juicio, confusión, falta de energía, exceso de opciones o una sensación de que la tarea es demasiado grande para abordarla.\n\nLlamarlo pereza puede hacer que la persona se culpe más y se bloquee todavía más. Entenderlo como una señal permite preguntarse: “¿Qué necesito para empezar de una forma más amable y realista?”.`
  },
  {
    question: "¿Cómo vencer la procrastinación?",
    answer: `Vencer la procrastinación no consiste en castigarte hasta funcionar. Consiste en diseñar un inicio tan claro y pequeño que tu mente no lo viva como una montaña.\n\nPuedes probar tres pasos:\n\nPrimero, define la tarea de forma concreta. No “ponerme al día”, sino “responder tres correos”. No “estudiar”, sino “leer dos páginas”.\n\nSegundo, reduce el tiempo. Proponte empezar solo diez minutos. Si después continúas, perfecto. Si no, al menos has roto la inercia.\n\nTercero, elimina una fricción. Prepara el documento, deja el material visible, apaga una notificación o limpia el espacio mínimo necesario.\n\nTambién ayuda cambiar la frase “tengo que hacerlo perfecto” por “solo necesito hacer una primera versión”. Muchas tareas no necesitan excelencia al principio; necesitan movimiento.\n\nSi la procrastinación se repite en muchas áreas de tu vida, quizá no se trata solo de organización. Puede haber un patrón emocional detrás que merece ser escuchado.`
  },
  {
    question: "¿Qué hacer cuando no puedo empezar una tarea?",
    answer: `Cuando no puedes empezar una tarea, no te preguntes primero “¿por qué soy así?”. Pregúntate algo más útil: “¿qué hace que esta tarea se sienta tan difícil ahora mismo?”.\n\nPuede que la tarea sea demasiado grande, que no esté clara, que te dé miedo hacerla mal o que estés agotado. Según la causa, la solución cambia.\n\nPrueba a hacer esto: escribe la tarea y después conviértela en el primer gesto físico. Por ejemplo, “abrir el archivo”, “poner el título”, “leer el primer párrafo”, “buscar el documento”, “preparar la mesa”. El primer paso debe ser tan pequeño que casi no puedas discutirlo.\n\nTambién puedes usar una frase de permiso: “No tengo que terminarlo ahora, solo tengo que empezar de forma imperfecta”. Esto reduce la presión y facilita la acción.\n\nA veces el bloqueo no se rompe pensando más, sino bajando el listón de entrada.`
  },
  {
    question: "¿La procrastinación tiene que ver con la ansiedad?",
    answer: `Sí, muchas veces puede tener relación. La ansiedad puede hacer que una tarea se sienta amenazante, aunque no lo sea realmente. Entonces aparece la evitación: posponer, distraerse, revisar el móvil, hacer otras tareas menos importantes o esperar “el momento perfecto”.\n\nEl problema es que evitar calma durante unos minutos, pero suele aumentar la ansiedad después. La tarea sigue ahí, el tiempo se reduce y la culpa crece. Así se forma un ciclo: ansiedad, evitación, alivio breve, culpa, más ansiedad.\n\nTambién puede aparecer con el perfeccionismo. Si sientes que algo debe salir impecable, empezar puede dar miedo. Posponer se convierte entonces en una forma de no enfrentarte todavía a la posibilidad de fallar.\n\nSi reconoces este ciclo, no necesitas juzgarte con dureza. Necesitas comprender qué emoción se activa antes de procrastinar y aprender formas más pequeñas, seguras y manejables de entrar en la acción.\n\nNuestra consulta gratuita puede ayudarte a ordenar este patrón y ver si tu procrastinación está más relacionada con ansiedad, agotamiento, miedo al error, perfeccionismo o falta de claridad.`
  }
];

export const RUMIACION_FAQS = [
  {
    question: "¿Cómo dejar de pensar tanto?",
    answer: `Dejar de pensar tanto no significa dejar la mente en blanco. La mente no funciona así. El primer paso suele ser dejar de pelearte con cada pensamiento y empezar a relacionarte con ellos de otra manera.\n\nCuando notas que estás pensando demasiado, puedes preguntarte: “¿Estoy resolviendo algo o solo estoy dando vueltas?”. Si la respuesta es que estás dando vueltas, quizá no necesitas más análisis, sino un cambio de estado.\n\nPrueba a llevar la atención al cuerpo: respira despacio, camina, escribe lo que piensas o haz una tarea sencilla con las manos. El objetivo no es negar lo que sientes, sino sacar a la mente del bucle.\n\nTambién ayuda reservar un momento concreto para pensar o escribir sobre el tema. Si aparece fuera de ese momento, puedes decirte: “esto lo miraré luego, ahora no necesito resolverlo”.\n\nSi pensar demasiado se ha convertido en una forma de vivir en alerta, nuestra consulta gratuita puede ayudarte a entender qué hay debajo de ese ruido mental y qué necesitas para recuperar calma.`
  },
  {
    question: "¿Cómo dejar de darle vueltas a las cosas?",
    answer: `Darle vueltas a las cosas suele aparecer cuando tu mente intenta encontrar seguridad. Quiere una respuesta perfecta, una explicación cerrada o una garantía de que nada saldrá mal. El problema es que muchas veces, cuanto más revisas, menos calma encuentras.\n\nUn paso útil es distinguir entre reflexión y bucle. La reflexión te ayuda a decidir o comprender. El bucle te deja agotado y en el mismo lugar.\n\nPuedes preguntarte: “¿Este pensamiento me está acercando a una acción concreta o solo me está desgastando?”. Si no hay acción posible ahora, quizá es momento de soltar temporalmente el tema.\n\nEscribir también ayuda. Pon en una hoja qué ocurrió, qué interpretación estás haciendo, qué sabes con certeza y qué estás suponiendo. Muchas vueltas mentales se alimentan de mezclar hechos con miedos.\n\nNo se trata de obligarte a no pensar, sino de recuperar el mando sobre cuándo y cómo le das espacio a ese pensamiento.`
  },
  {
    question: "¿Por qué no puedo dejar de pensar?",
    answer: `A veces no puedes dejar de pensar porque tu mente cree que pensar más te protegerá. Intenta anticipar errores, evitar dolor, entender lo que pasó o controlar lo que todavía no sabes.\n\nEsto puede aparecer en momentos de ansiedad, incertidumbre, culpa, miedo al rechazo, conflictos, cambios importantes o cansancio acumulado. También ocurre cuando una emoción no ha podido expresarse bien y se convierte en pensamiento repetitivo.\n\nPensar mucho puede dar la sensación de estar haciendo algo útil, pero no siempre lo es. A veces solo mantiene activada la alarma interna.\n\nUna pregunta sencilla puede ayudarte: “¿Qué emoción hay debajo de este pensamiento?”. Puede ser miedo, tristeza, rabia, vergüenza, inseguridad o necesidad de control. Cuando reconoces la emoción, el pensamiento deja de ser el único protagonista.\n\nNo es que tu mente esté contra ti. Probablemente está intentando protegerte, pero de una forma que ya te está agotando.`
  },
  {
    question: "¿Qué hacer cuando no puedes sacarte algo de la cabeza?",
    answer: `Cuando no puedes sacarte algo de la cabeza, intentar expulsarlo con fuerza suele hacer que vuelva con más intensidad. En vez de luchar contra el pensamiento, prueba a darle un lugar más ordenado.\n\nPuedes escribirlo tal como aparece, sin hacerlo bonito. Después añade tres columnas: qué sé con certeza, qué estoy imaginando y qué puedo hacer ahora. Esta separación ayuda a que el pensamiento deje de ser una nube enorme y se convierta en algo más manejable.\n\nTambién puedes cambiar de canal: moverte, ducharte, salir a caminar, hablar con alguien de confianza o hacer una respiración lenta. El cuerpo puede ayudar a la mente a salir del atasco.\n\nSi el pensamiento vuelve, no significa que hayas fallado. Puedes decirte: “ya he visto este pensamiento; ahora vuelvo a lo que estoy haciendo”. Repetir esto con paciencia entrena a la mente a no seguir cada hilo.\n\nSi ese pensamiento está conectado con una situación dolorosa o una preocupación importante, quizá no necesita ser expulsado, sino comprendido con acompañamiento.`
  },
  {
    question: "¿Pensar demasiado genera ansiedad?",
    answer: `Sí, pensar demasiado puede aumentar la ansiedad, sobre todo cuando los pensamientos se centran en amenazas, errores, dudas o futuros negativos. La mente empieza a buscar certezas, pero muchas veces solo encuentra más preguntas.\n\nEl cuerpo no siempre distingue entre un peligro real y una escena imaginada con mucha intensidad. Por eso, si pasas mucho tiempo anticipando conversaciones, problemas o posibles rechazos, tu cuerpo puede reaccionar como si todo estuviera ocurriendo ahora.\n\nEsto puede provocar tensión, dificultad para dormir, presión en el pecho, cansancio, irritabilidad o sensación de no poder desconectar.\n\nPensar no es malo. De hecho, reflexionar puede ayudarte. El problema aparece cuando pensar deja de abrir caminos y empieza a encerrarte en el mismo círculo.\n\nCuando eso ocurre, el trabajo no es pensar más, sino aprender a cortar el bucle, volver al presente y entender qué miedo o necesidad está intentando proteger ese pensamiento.`
  },
  {
    question: "¿Qué es la rumiación mental?",
    answer: `La rumiación mental es una forma de pensamiento repetitivo en la que una persona vuelve una y otra vez sobre una preocupación, una conversación, un error, una duda o una situación dolorosa, sin llegar realmente a una solución.\n\nEs como si la mente intentara resolver algo, pero acabara atrapada en el mismo recorrido. Por fuera puede parecer que estás reflexionando, pero por dentro se siente como desgaste, tensión y dificultad para soltar.\n\nLa rumiación suele aparecer con preguntas como: “¿y si hice mal?”, “¿por qué me dijo eso?”, “¿y si pasa algo?”, “¿qué habría ocurrido si…?”, “¿por qué no puedo superarlo?”.\n\nNo es una falta de inteligencia ni una manía sin sentido. Muchas veces es una estrategia de protección: tu mente intenta evitar dolor futuro o encontrar una explicación que te dé calma. El problema es que, cuando se repite demasiado, termina generando más ansiedad.\n\nLa salida no suele estar en encontrar la respuesta perfecta, sino en aprender a reconocer el bucle, regular la emoción que hay debajo y volver poco a poco a una sensación de seguridad interna.`
  }
];

export const GESTION_EMOCIONAL_FAQS = [
  {
    question: "¿Cómo controlar las emociones?",
    answer: `Controlar las emociones no significa apagarlas, esconderlas o fingir que no están. Las emociones no son enemigas: son señales. El problema aparece cuando llegan con tanta fuerza que parece que toman el mando por completo.\n\nEl primer paso es hacer una pausa antes de reaccionar. A veces bastan unos segundos para preguntarte: “¿Qué estoy sintiendo realmente?” y “¿Qué necesito antes de responder?”. Esa pequeña distancia puede evitar que una emoción intensa decida por ti.\n\nTambién ayuda llevar la atención al cuerpo: respirar más despacio, notar los pies en el suelo, relajar la mandíbula o salir unos minutos del lugar si la situación lo permite. No se trata de negar lo que sientes, sino de darle espacio sin dejar que lo dirija todo.\n\nSi notas que tus emociones te desbordan con frecuencia, nuestra consulta gratuita puede ayudarte a entender qué situaciones las activan y qué patrón emocional se está repitiendo, sin juzgarte y sin tener que explicarlo todo perfecto desde el principio.`
  },
  {
    question: "¿Cómo gestionar mis emociones?",
    answer: `Gestionar tus emociones empieza por reconocerlas con honestidad. Muchas veces decimos “estoy mal”, pero debajo puede haber tristeza, miedo, rabia, culpa, vergüenza, cansancio o una mezcla difícil de separar.\n\nUna forma sencilla de empezar es ponerle nombre a lo que sientes. No hace falta hacerlo perfecto. Puedes decir: “creo que esto es miedo”, “creo que estoy saturado” o “me siento herido”. Nombrar una emoción suele hacerla un poco más manejable.\n\nDespués conviene preguntarte qué te está pidiendo esa emoción. La tristeza puede pedir descanso o consuelo. La rabia puede señalar un límite. El miedo puede estar buscando seguridad. La culpa puede necesitar reparación o perspectiva.\n\nGestionar no es controlar con dureza. Es escuchar, comprender y elegir una respuesta más consciente. Con práctica, las emociones dejan de sentirse como una ola que arrasa y empiezan a convertirse en información útil sobre ti.`
  },
  {
    question: "¿Por qué exploto o lloro por todo?",
    answer: `Explotar o llorar por todo no significa que seas débil ni que estés exagerando. A veces ocurre cuando llevas demasiado tiempo acumulando tensión, conteniendo emociones o intentando funcionar como si nada pasara.\n\nCuando una persona está saturada, el cuerpo puede reaccionar de forma intensa ante cosas pequeñas. No porque esas cosas sean el verdadero problema, sino porque se suman a una carga que ya estaba llena. Es como un vaso que rebosa: la última gota no explica todo el desbordamiento.\n\nTambién puede pasar cuando no has tenido espacio para descansar, expresar lo que sientes, poner límites o sentirte acompañado. Entonces la emoción sale de golpe: como llanto, irritabilidad, bloqueo o necesidad de alejarte.\n\nEn lugar de preguntarte “¿por qué soy así?”, puede ser más útil preguntarte: “¿qué llevo demasiado tiempo sosteniendo?”. Esa pregunta abre una puerta más amable para empezar a comprenderte.`
  },
  {
    question: "¿Cómo regular emociones intensas?",
    answer: `Cuando una emoción es muy intensa, no suele ayudar intentar razonar demasiado en ese mismo momento. Primero conviene bajar la activación del cuerpo. Después ya será más fácil pensar con claridad.\n\nPuedes empezar por respirar más lento, soltar el aire despacio, apoyar los pies en el suelo y mirar a tu alrededor. Nombra mentalmente cinco cosas que ves, cuatro que puedes tocar y tres sonidos que escuchas. Esto ayuda a volver al presente.\n\nTambién puede servir alejarte un momento de la situación si puedes hacerlo sin empeorar el conflicto. No para huir, sino para no responder desde el pico más alto de la emoción.\n\nCuando la intensidad baje, puedes preguntarte: “¿Qué ha activado esto?”, “¿qué necesitaba en ese momento?” y “¿qué puedo hacer ahora de forma más cuidadosa?”. Regular una emoción no es eliminarla; es atravesarla sin que te arrastre.`
  },
  {
    question: "¿Qué hacer cuando no sé cómo me siento?",
    answer: `No saber cómo te sientes es más común de lo que parece. A veces hay tantas emociones mezcladas que ninguna se distingue bien. Otras veces llevas tanto tiempo tirando hacia adelante que has dejado de escuchar lo que ocurre dentro.\n\nPuedes empezar por el cuerpo. Pregúntate: “¿Dónde noto algo ahora mismo?”. Puede ser presión en el pecho, nudo en la garganta, tensión en la mandíbula, cansancio, vacío, inquietud o ganas de llorar. El cuerpo muchas veces da pistas antes que las palabras.\n\nDespués prueba con opciones sencillas: “¿esto se parece más a tristeza, miedo, rabia, vergüenza, culpa, cansancio o confusión?”. No hace falta acertar de inmediato. Basta con acercarte.\n\nTambién puedes escribir una frase incompleta: “Ahora mismo me siento como si…”. A veces la imagen aparece antes que el nombre exacto de la emoción.\n\nSi te cuesta mucho identificar lo que sientes, no significa que estés desconectado para siempre. Significa que quizá necesitas un espacio seguro para aprender a escucharte con menos exigencia.`
  },
  {
    question: "¿Qué es la gestión emocional?",
    answer: `La gestión emocional es la capacidad de reconocer, comprender y regular lo que sentimos para responder de una forma más consciente. No consiste en no enfadarse, no llorar o estar siempre tranquilo.\n\nUna buena gestión emocional permite darte cuenta de lo que está pasando dentro de ti antes de actuar impulsivamente. Te ayuda a distinguir entre sentir una emoción y dejar que esa emoción decida por completo lo que haces.\n\nPor ejemplo, puedes sentir rabia sin atacar, tristeza sin hundirte, miedo sin bloquearte o culpa sin castigarte. La emoción sigue estando ahí, pero tú recuperas un poco de espacio para elegir cómo cuidarte y cómo responder.\n\nGestionar emociones no es controlar la vida. Es aprender a acompañarte mejor cuando la vida te mueve por dentro.`
  }
];

export const ALIMENTACION_EMOCIONAL_FAQS = [
  {
    question: "¿Qué es el hambre emocional?",
    answer: `El hambre emocional aparece cuando comes no tanto porque tu cuerpo necesite alimento, sino porque intentas calmar, llenar, distraer o compensar una emoción. Puede surgir con ansiedad, tristeza, aburrimiento, soledad, estrés, cansancio o sensación de vacío.\n\nA diferencia del hambre física, suele aparecer de forma más repentina y pedir alimentos concretos, normalmente muy placenteros o fáciles de comer. También puede venir acompañada de urgencia: “lo necesito ya”. Después, a veces aparece culpa o sensación de haber perdido el control.\n\nEsto no significa que seas débil ni que no tengas voluntad. Muchas veces la comida se convierte en una forma rápida de regular algo que por dentro está siendo difícil de sostener.\n\nSi sientes que comes para calmar ansiedad o vacío, nuestra consulta gratuita puede ayudarte a observar qué emoción aparece antes de comer y qué necesidad real puede estar detrás. No se trata de juzgarte, sino de comprender el patrón para empezar a cuidarte de otra manera.`
  },
  {
    question: "¿Cómo dejar de comer por ansiedad?",
    answer: `Dejar de comer por ansiedad no empieza por prohibirte comida con más dureza. De hecho, cuanto más te castigas, más fácil es que el ciclo se repita: ansiedad, impulso, comida, culpa y otra vez ansiedad.\n\nUn primer paso es hacer una pausa breve antes de comer. No para prohibirte, sino para preguntarte: “¿Tengo hambre física o necesito calmar algo?”. Si la respuesta es emocional, puedes intentar darte unos minutos antes de decidir: respirar, beber agua, salir a caminar, escribir lo que sientes o llamar a alguien.\n\nTambién ayuda tener alternativas de regulación. Si la comida es la única forma de calmarte, es normal que tu mente vuelva a ella. Necesitas construir otros apoyos: descanso, movimiento suave, conversación, respiración, rutina y menos autoexigencia.\n\nNo se trata de hacerlo perfecto. Se trata de ganar segundos de conciencia antes del impulso. Ahí empieza el cambio.\n\nSi esto se repite mucho o te genera culpa intensa, puede ser importante pedir apoyo profesional para trabajarlo con cuidado.`
  },
  {
    question: "¿Por qué como por ansiedad?",
    answer: `Puedes comer por ansiedad porque la comida ofrece alivio rápido. Comer puede distraer, calmar, dar sensación de recompensa o llenar momentáneamente un vacío. El problema es que ese alivio suele durar poco si la emoción de fondo sigue sin ser atendida.\n\nA veces comes por ansiedad cuando llevas muchas horas aguantando, cuando te sientes solo, cuando estás saturado, cuando no sabes qué hacer con una preocupación o cuando necesitas una pausa y no te permites descansar de otra forma.\n\nTambién puede influir el cansancio. Cuando estás agotado, tu capacidad de decidir con calma baja, y el cuerpo busca energía o consuelo inmediato.\n\nLa pregunta no debería ser solo “¿por qué no tengo fuerza de voluntad?”, sino “¿qué emoción estoy intentando calmar con comida?”. Esa pregunta cambia la mirada: deja de ser una lucha contra ti y empieza a ser una forma de escucharte.`
  },
  {
    question: "¿Cómo distinguir hambre física y hambre emocional?",
    answer: `El hambre física suele aparecer poco a poco. Puede sentirse en el estómago, mejora con distintos tipos de comida y normalmente permite esperar un poco. Después de comer, aparece saciedad.\n\nEl hambre emocional suele aparecer de forma más repentina. A menudo pide algo concreto, como dulce, salado, comida rápida o algo muy placentero. Puede sentirse como urgencia, ansiedad o necesidad de calmarte ya.\n\nUna forma sencilla de distinguirlas es preguntarte: “¿Comería algo simple y nutritivo ahora, o solo quiero ese alimento concreto?”. Si aceptarías una comida normal, quizá hay hambre física. Si solo te sirve algo específico y urgente, puede haber hambre emocional.\n\nOtra pista es lo que aparece después. El hambre física suele dejar alivio y energía. El hambre emocional, if se usa como única vía de calma, puede dejar culpa, vergüenza o sensación de desconexión.\n\nNo hace falta acertar siempre. Aprender a distinguirlas es un proceso de observación, no un examen.`
  },
  {
    question: "¿Qué hacer después de un atracón?",
    answer: `Después de un atracón, lo más importante es no castigarte. Aunque aparezcan culpa, vergüenza o rabia contigo, castigarte suele alimentar el mismo ciclo que quieres romper.\n\nIntenta volver a un gesto básico de cuidado: beber agua, respirar, moverte suavemente si te apetece y evitar compensaciones extremas. No necesitas “pagar” por lo ocurrido. Necesitas comprender qué pasó antes.\n\nCuando estés más tranquilo, pregúntate con honestidad y sin juicio: “¿Qué estaba sintiendo antes del atracón?”, “¿tenía hambre física?”, “¿estaba ansioso, cansado, solo, triste o saturado?”, “¿qué necesitaba en realidad?”.\n\nUn atracón no define quién eres. Es una señal de que algo necesita atención. Si ocurre con frecuencia, si sientes pérdida de control o si intentas compensarlo con vómitos, ayunos extremos, ejercicio excesivo o laxantes, es importante pedir ayuda profesional cuanto antes.`
  },
  {
    question: "¿La ansiedad puede afectar al estómago y la comida?",
    answer: `Sí. La ansiedad puede afectar mucho al estómago y a la forma de comer. Algunas personas pierden el apetito; otras comen más; otras notan náuseas, nudo en el estómago, digestiones pesadas, urgencia por comer o molestias intestinales.\n\nCuando estás ansioso, el cuerpo entra en modo alerta. En ese estado, la digestión puede alterarse y la comida puede convertirse tanto en un problema como en una forma rápida de buscar calma.\n\nTambién puede ocurrir que la ansiedad cambie tus decisiones alimentarias. Si estás muy activado, cansado o preocupado, es más fácil buscar alimentos que den alivio rápido, aunque luego no te sienten bien o te generen culpa.\n\nNo se trata de culparte por cómo comes, sino de entender la relación entre lo que sientes y cómo responde tu cuerpo. A veces, mejorar la alimentación emocional empieza por cuidar la ansiedad que la está empujando.`
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [loginError, setLoginError] = useState("");
  const [selectedInfographic, setSelectedInfographic] = useState<{ id: string, src: string } | null>(null);

  // States for the new logged-in panel
  const [phone, setPhone] = useState("");
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [channels, setChannels] = useState({ whatsapp: false, sms: false, telegram: false });
  const [validationError, setValidationError] = useState("");
  
  // New States requested
  const [showPostLoginModal, setShowPostLoginModal] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDoneConsultation, setHasDoneConsultation] = useState(false);
  const [isNextStepsModalOpen, setIsNextStepsModalOpen] = useState(false);
  
  const [openAnsiedadFaqIndex, setOpenAnsiedadFaqIndex] = useState<number | null>(null);
  const [openEstresFaqIndex, setOpenEstresFaqIndex] = useState<number | null>(null);
  const [openInsomnioFaqIndex, setOpenInsomnioFaqIndex] = useState<number | null>(null);
  const [openProcrastinacionFaqIndex, setOpenProcrastinacionFaqIndex] = useState<number | null>(null);
  const [openRumiacionFaqIndex, setOpenRumiacionFaqIndex] = useState<number | null>(null);
  const [openGestionEmocionalFaqIndex, setOpenGestionEmocionalFaqIndex] = useState<number | null>(null);
  const [openAlimentacionEmocionalFaqIndex, setOpenAlimentacionEmocionalFaqIndex] = useState<number | null>(null);

  const closeInfographicModal = () => {
    const overlayId = selectedInfographic?.id;
    const shouldRestoreHome =
      (overlayId === 'ansiedad' && window.location.pathname === '/ansiedad') ||
      (overlayId === 'estres' && window.location.pathname === '/estres') ||
      (overlayId === 'insomnio' && window.location.pathname === '/insomnio') ||
      (overlayId === 'procrastinacion' && window.location.pathname === '/procrastinacion') ||
      (overlayId === 'rumiacion' && window.location.pathname === '/pensar-demasiado-rumiacion') ||
      (overlayId === 'gestion-emocional' && window.location.pathname === '/gestion-emocional') ||
      (overlayId === 'alimentacion-emocional' && window.location.pathname === '/alimentacion-emocional');

    setSelectedInfographic(null);
    setOpenAnsiedadFaqIndex(null);
    setOpenEstresFaqIndex(null);
    setOpenInsomnioFaqIndex(null);
    setOpenProcrastinacionFaqIndex(null);
    setOpenRumiacionFaqIndex(null);
    setOpenGestionEmocionalFaqIndex(null);
    setOpenAlimentacionEmocionalFaqIndex(null);

    if (shouldRestoreHome) {
      window.history.pushState({}, '', '/');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (
        selectedInfographic?.id === 'ansiedad' &&
        window.location.pathname !== '/ansiedad'
      ) {
        setSelectedInfographic(null);
        setOpenAnsiedadFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'estres' &&
        window.location.pathname !== '/estres'
      ) {
        setSelectedInfographic(null);
        setOpenEstresFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'insomnio' &&
        window.location.pathname !== '/insomnio'
      ) {
        setSelectedInfographic(null);
        setOpenInsomnioFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'procrastinacion' &&
        window.location.pathname !== '/procrastinacion'
      ) {
        setSelectedInfographic(null);
        setOpenProcrastinacionFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'rumiacion' &&
        window.location.pathname !== '/pensar-demasiado-rumiacion'
      ) {
        setSelectedInfographic(null);
        setOpenRumiacionFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'gestion-emocional' &&
        window.location.pathname !== '/gestion-emocional'
      ) {
        setSelectedInfographic(null);
        setOpenGestionEmocionalFaqIndex(null);
      }

      if (
        selectedInfographic?.id === 'alimentacion-emocional' &&
        window.location.pathname !== '/alimentacion-emocional'
      ) {
        setSelectedInfographic(null);
        setOpenAlimentacionEmocionalFaqIndex(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedInfographic]);

  const phoneValue = phone ? (phone.startsWith('+') ? phone : `+34${phone}`) : "+34";

  // Load user data from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      if (!user) {
        if (isMounted) setIsLoadingProfile(false);
        return;
      }
      if (isMounted) setIsLoadingProfile(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && isMounted) {
          const data = userDoc.data();
          if (data.hasDoneConsultation) {
            setHasDoneConsultation(true);
          }
          if (data.contactPreferencesSaved) {
            setPhone(data.contactPhone || "");
            setContactEmail(data.contactEmail || user.email || "");
            setWantsAlerts(data.contactAlertsEnabled || false);
            setChannels(data.contactAlertChannels || { whatsapp: false, sms: false, telegram: false });
            setProfileSaved(true);
            setIsEditingProfile(false);
          } else {
            setContactEmail(user.email || "");
            setProfileSaved(false);
          }
        } else if (isMounted) {
          setContactEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        if (isMounted) setContactEmail(user.email || "");
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }
    loadUserData();
    return () => { isMounted = false; };
  }, [user]);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/session");
  };

  const handleContinueLogged = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    let cleanedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    
    if (wantsAlerts && !channels.whatsapp && !channels.sms && !channels.telegram) {
      setValidationError("Selecciona al menos un canal si deseas recibir alertas.");
      return;
    }

    const needsPhone = (wantsAlerts && (channels.whatsapp || channels.sms)) || cleanedPhone.length > 0;
    
    if (needsPhone) {
      if (!/^\d{9}$/.test(cleanedPhone)) {
        setValidationError("Introduce un número de teléfono válido de 9 dígitos.");
        return;
      }
    }

    if (!user) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        contactPhone: cleanedPhone,
        contactPhoneCountryCode: "+34",
        contactAlertsEnabled: wantsAlerts,
        contactAlertChannels: {
          whatsapp: channels.whatsapp,
          sms: channels.sms,
          telegram: channels.telegram
        },
        contactEmail: contactEmail,
        contactPreferencesSaved: true,
        contactPreferencesUpdatedAt: serverTimestamp()
      }, { merge: true });

      setPhone(cleanedPhone);
      setProfileSaved(true);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setValidationError("No se pudieron guardar tus datos. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      if (!user) {
        await signInWithGoogle();
      }
      setShowPostLoginModal(true);
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("Error al iniciar sesión. Por favor, permite las ventanas emergentes.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <SEO
        title="Terapia online para ansiedad, estrés e insomnio | SoyBienestar"
        description="Recupera tu bienestar emocional desde casa con SoyBienestar.es: consulta gratuita, recursos de calma y orientación online para ansiedad, estrés, insomnio y otros bloqueos emocionales."
        canonicalPath="/"
        noIndex={false}
      />
      {/* Hero Section */}
      <section className="relative w-full mb-20 md:mb-32">
        <div className="relative w-full">
          {/* Desktop/Horizontal Image */}
          <img 
            alt="Soy Bienestar - Hero Desktop" 
            className="hidden md:block w-full h-auto object-contain object-top" 
            src="/images/inicio-horizontal.jpg"
            referrerPolicy="no-referrer"
          />
          {/* Mobile/Vertical Image */}
          <img 
            alt="Soy Bienestar - Hero Mobile" 
            className="block md:hidden w-full h-auto object-contain object-top" 
            src="/images/inicio-movil.jpg"
            referrerPolicy="no-referrer"
          />
          {/* Gradiente sutil inferior para asegurar la legibilidad de la frase */}
          
          {/* Floating Quote Overlay Style */}
          <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 max-w-lg z-10 w-[calc(100%-2.5rem)]">
            <p className="font-headline text-2xl md:text-3xl lg:text-4xl text-primary/90 italic font-light tracking-wide drop-shadow-md border-l-4 border-primary/40 pl-4 md:pl-6 py-2">
              "Un espacio donde ser escuchado sin juicios"
            </p>
          </div>
        </div>
      </section>

      {/* Symptoms Section: Reconociendo tus batallas */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-headline text-5xl md:text-6xl text-primary mb-8">Reconociendo tus batallas</h2>
            <p className="font-body text-on-surface-variant text-xl max-w-3xl mx-auto font-light leading-relaxed">Ponemos nombre a lo que sientes para empezar a sanar. No son solo síntomas, es tu historia pidiendo atención desde un lugar de compasión.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <SymptomCard
              id="ansiedad"
              title="Ansiedad"
              description="Ese estado de alerta que no te deja descansar. Te ayudamos a encontrar la calma en medio de la tormenta."
              actionText="Recuperar la calma"
              icon="air"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-light-gray"
              isDarkText={true}
              onClick={() => {
                setSelectedInfographic({ id: 'ansiedad', src: '/images/info-ansiedad.jpg' });
                window.history.pushState({ symptomOverlay: 'ansiedad' }, '', '/ansiedad');
              }}
            />
            
            <SymptomCard
              id="estres"
              title="Estrés"
              description="Cuando tu mundo va muy rápido y sientes no tener tiempo ni para respirar. Estrategias prácticas para recuperar tu ritmo vital."
              actionText="Soltar carga"
              icon="speed"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-taupe"
              onClick={() => {
                setSelectedInfographic({ id: 'estres', src: '/images/info-estres.jpg' });
                window.history.pushState({ symptomOverlay: 'estres' }, '', '/estres');
              }}
            />

            <SymptomCard
              id="insomnio"
              title="Insomnio"
              description="Recupera tu descanso. Reparación del sueño y regulación somática para noches de paz real."
              actionText="Dulce descanso"
              icon="bedtime"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-sand"
              onClick={() => {
                setSelectedInfographic({ id: 'insomnio', src: '/images/info-insomnio.jpg' });
                window.history.pushState({ symptomOverlay: 'insomnio' }, '', '/insomnio');
              }}
            />

            <SymptomCard
              id="procrastinacion"
              title="Procrastinación"
              description="Deja de posponer las cosas. Te ayudamos a saber ponerte en marcha para que cumplas tus tareas diarias sin que se te haga una montaña."
              actionText="Activar el cambio"
              icon="schedule"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-mist"
              onClick={() => {
                setSelectedInfographic({ id: 'procrastinacion', src: '/images/info-procrastinacion.jpg' });
                window.history.pushState({ symptomOverlay: 'procrastinacion' }, '', '/procrastinacion');
              }}
            />

            <SymptomCard
              id="rumiacion"
              title="Rumiación / Bucle Mental"
              description="Rompe el ciclo de pensamientos circulares. Técnicas cognitivas avanzadas para salir de la trampa mental y recuperar la presencia."
              actionText="Liberar la mente"
              icon="all_inclusive"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-azure-fog"
              onClick={() => {
                setSelectedInfographic({ id: 'rumiacion', src: '/images/info-rumiacion.jpg' });
                window.history.pushState({ symptomOverlay: 'rumiacion' }, '', '/pensar-demasiado-rumiacion');
              }}
            />

            <SymptomCard
              id="emociones"
              title="Gestión Emocional"
              description="Aprende a navegar tus emociones sin que ellas te gobiernen. Inteligencia emocional aplicada a tu día a día."
              actionText="Equilibrio interno"
              icon="psychology_alt"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-stone"
              onClick={() => {
                setSelectedInfographic({ id: 'gestion-emocional', src: '/images/info-emociones.jpg' });
                window.history.pushState({ symptomOverlay: 'gestion-emocional' }, '', '/gestion-emocional');
              }}
            />

            <SymptomCard
              id="alimentacion"
              title="Alimentación"
              description="Sana tu relación con el cuerpo y la comida desde un enfoque consciente y sin culpas."
              actionText="Nutrir el cuerpo"
              icon="restaurant"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-light-gray"
              isDarkText={true}
              onClick={() => {
                setSelectedInfographic({ id: 'alimentacion-emocional', src: '/images/info-alimentacion.jpg' });
                window.history.pushState({ symptomOverlay: 'alimentacion-emocional' }, '', '/alimentacion-emocional');
              }}
            />

            <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden group min-h-[380px] shadow-xl">
              <img alt="soft morning sunlight" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/fondo-zen.jpg"/>
              <div className="absolute inset-0 bg-primary/35 backdrop-blur-[2px]"></div>
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-end text-on-primary">
                <h3 className="font-headline text-4xl md:text-5xl mb-6">ReprogrÁmate Ahora</h3>
                <p className="font-body opacity-90 font-light text-2xl mb-10 leading-relaxed max-w-xl">Tu primer paso hacia la liberación física, mental y emocional.</p>
                <div onClick={() => {
                  if (hasDoneConsultation) {
                    setIsNextStepsModalOpen(true);
                  } else {
                    navigate('/session');
                  }
                }} className="bg-[#2c3e50] text-white px-10 py-5 rounded-full self-start font-bold text-[12px] uppercase tracking-[0.2em] hover:opacity-90 transition-all cursor-pointer shadow-lg active:scale-95 inline-block">
                  {hasDoneConsultation ? "Solicitar Cuestionario Espejo" : "Consulta Gratuita"}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Section: Un faro en la niebla */}
      <section className="relative w-full mb-6 md:mb-10 overflow-visible">
        <div className="cenefa-decorative mb-16">
          <div className="cenefa-line left"></div>
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>flare</span>
          <div className="cenefa-line right"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8">
          <LighthouseBeamFrame
            className="relative w-full h-[550px] rounded-[2.5rem] shadow-2xl border border-outline-variant/10 group"
            background={
              <>
                <img
                  alt="Lighthouse landscape"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  src="/images/fondo-faro.jpg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
              </>
            }
          >
            <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-primary text-6xl mb-6">light_mode</span>
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-primary mb-6 drop-shadow-sm">Un faro en la niebla</h2>
              <h3 className="font-headline text-2xl md:text-3xl text-primary/90 mb-8 italic font-light">Tu Puente hacia el Bienestar</h3>
              <p className="font-body text-xl text-primary max-w-2xl leading-relaxed font-light mb-10">
                Te guiamos a través de la niebla hacia un puerto seguro. Nuestra metodología combina estructura y sensibilidad para que recuperes el mando de tu vida.
              </p>
              <button 
                onClick={() => {
                  if (hasDoneConsultation) {
                    setIsNextStepsModalOpen(true);
                  } else {
                    navigate('/session');
                  }
                }} 
                className="bg-[#2c3e50] text-white px-12 py-5 rounded-full font-headline text-xl tracking-wide shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1 relative z-20 overflow-hidden group"
              >
                <span className="relative z-10">
                  {hasDoneConsultation ? "Solicitar Cuestionario Espejo" : "Comenzar Consulta Gratuita"}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </LighthouseBeamFrame>
        </div>
        <div className="cenefa-decorative mt-10 md:mt-12">
          <div className="cenefa-line left"></div>
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>flare</span>
          <div className="cenefa-line right"></div>
        </div>
      </section>

      {/* The Hybrid Approach */}
      <section className="pt-20 pb-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <RippleWindow className="rounded-[2rem] shadow-2xl aspect-[4/5]">
              <img alt="serene lake water" className="w-full h-full object-cover" src="/images/ondas.jpg"/>
            </RippleWindow>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="space-y-12">
              <div>
                <h2 className="font-headline text-4xl md:text-5xl text-primary mb-6">Un enfoque híbrido para el alma moderna</h2>
                <p className="font-body text-xl text-on-surface-variant leading-relaxed font-light">
                  Fusionamos la precisión de la tecnología con la profundidad de la empatía humana.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">neurology</span>
                  <h3 className="font-headline text-2xl text-primary">IA que escucha</h3>
                  <p className="font-body text-on-surface-variant font-light text-lg">Un espacio disponible 24/7 para expresarse sin juicios, donde nuestra tecnología ofrece herramientas inmediatas.</p>
                </div>
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">volunteer_activism</span>
                  <h3 className="font-headline text-2xl text-primary">Humano que valida</h3>
                  <p className="font-body text-on-surface-variant font-light text-lg">Expertos en salud emocional supervisan y validan cada paso de tu proceso terapéutico.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 md:mb-28">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
          <div>
            <h2 className="font-headline text-3xl text-primary mb-6">Un regalo para tu calma</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 font-light">
              Como agradecimiento por tu honestidad en este proceso, queremos entregarte un kit de herramientas personalizado.
            </p>
          </div>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">self_improvement</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Meditaciones Guiadas</h3>
                <p className="text-on-surface-variant text-sm font-light">Sesiones de audio enfocadas en reducir la ansiedad según tu perfil.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">description</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Guía de Ejercicios</h3>
                <p className="text-on-surface-variant text-sm font-light">Protocolos somáticos para regular tu sistema nervioso.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">verified_user</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Tu Espacio Seguro</h3>
                <p className="text-on-surface-variant text-sm font-light">Tus datos son un vínculo sagrado de confianza.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: The Form */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-sm border border-outline-variant/10">
            {!user ? (
              <>
                <div className="mb-10">
                  <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 bg-primary text-on-primary border border-transparent py-4 rounded-full shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-300 group dark:bg-primary dark:text-on-primary">
                    <div className="bg-white rounded-full p-1 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                    </div>
                    <span className="font-headline text-lg tracking-wide">Acceso automático vía Google</span>
                  </button>
                  <div className="relative flex py-8 items-center">
                    <div className="flex-grow border-t border-outline-variant/20"></div>
                    <span className="flex-shrink mx-4 text-on-surface-variant/40 text-xs uppercase tracking-[0.3em] font-bold">o completa manualmente</span>
                    <div className="flex-grow border-t border-outline-variant/20"></div>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="font-headline text-2xl text-primary mb-2">Comienza tu Sesión de Claridad</h2>
                  <p className="text-on-surface-variant font-light">Por favor, facilítanos la vía para enviarte tu material personalizado.</p>
                </div>
                <form className="space-y-8" onSubmit={handleStartSession}>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Nombre Completo</label>
                    <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="Ej. Martina García" type="text" required />
                  </div>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Correo Electrónico</label>
                    <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="martina@ejemplo.com" type="email" required />
                  </div>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">WhatsApp (Opcional)</label>
                    <div className="flex gap-4">
                      <span className="bg-surface-container-low border-b-2 border-outline/30 py-3 px-4 text-on-surface-variant">+34</span>
                      <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="600 000 000" type="tel"/>
                    </div>
                  </div>
                  <div className="pt-6">
                    <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container transition-all duration-300 active:scale-[0.98]">
                      Recibir mis guías personalizadas
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant/60 justify-center">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <p className="text-xs uppercase tracking-wide opacity-90">Tus datos están protegidos por cifrado de extremo a extremo.</p>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-headline text-3xl text-primary mb-4">Acceso a recursos y cuestionario espejo</h2>
                  {(!profileSaved || isEditingProfile) && (
                    <p className="text-on-surface-variant text-lg font-light mb-4 leading-relaxed">
                      Si deseas recibir enlaces directos a recursos y al cuestionario espejo, puedes añadir también tu teléfono para que podamos enviártelos por WhatsApp.
                    </p>
                  )}
                  <div className="bg-surface-variant/30 p-4 rounded-xl border border-outline-variant/20 mb-8">
                    <div className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">info</span>
                      <p className="text-sm text-on-surface-variant font-light">
                        Tras finalizar la consulta gratuita desbloquearás tus primeras herramientas.
                        Completando el Cuestionario Espejo accederás a tu dosier personalizado y otros recursos exclusivos.
                        Todo el material que desbloquees será tuyo de por vida.
                      </p>
                    </div>
                  </div>
                  {(!profileSaved || isEditingProfile) && (
                    <p className="text-xs text-on-surface-variant/60 mt-4 leading-relaxed mb-8">
                      Tu teléfono solo se utilizará para el envío de enlaces y recursos solicitados por ti. Nunca se usará con fines publicitarios ni se cederá a terceros.
                    </p>
                  )}
                </div>

                {isLoadingProfile ? (
                  <div className="flex justify-center py-12 opacity-60">
                    <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                  </div>
                ) : profileSaved && !isEditingProfile ? (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <p className="text-primary font-medium mt-0.5">Tus preferencias han sido guardadas con éxito.</p>
                    </div>

                    {!wantsAlerts && (
                      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 transition-all hover:border-primary/40 cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center p-1">
                            <div className="w-5 h-5 border-2 border-outline rounded-md"></div>
                          </div>
                          <div>
                            <span className="text-primary font-medium block">Deseo recibir también alertas sobre nuevos recursos o eventos de SoyBienestar.es</span>
                            <span className="text-xs text-on-surface-variant/60 mt-1 block">Puedes activar las alertas modificando tus datos.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                       <button onClick={() => setIsEditingProfile(true)} className="w-full bg-surface-container-low border border-primary/20 text-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-surface-container-high transition-all duration-300">
                         Modificar datos
                       </button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-8 animate-in fade-in duration-500" onSubmit={handleContinueLogged}>
                    
                    {isEditingProfile && (
                      <div className="group border border-primary/10 bg-primary/5 p-6 rounded-2xl mb-6">
                        <h4 className="font-headline text-xl text-primary mb-4">Cambiar Login (Correo)</h4>
                        <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Email de Contacto</label>
                        <input 
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" 
                          placeholder="tu@email.com"
                          type="email"
                        />
                        <p className="text-xs text-on-surface-variant/70 mt-2">Al cambiar tu correo principal conservarás tus avances, recursos y contraseñas.</p>
                      </div>
                    )}

                    <div className="group">
                      <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Añadir WhatsApp (Opcional)</label>
                      <div className="flex gap-4">
                        <span className="bg-surface-container-low border-b-2 border-outline/30 py-3 px-4 text-on-surface-variant">+34</span>
                        <input 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" 
                          placeholder="600 000 000" 
                          type="tel"
                        />
                      </div>
                    </div>

                    {/* Alerts Block */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 mt-8">
                      <label className="flex items-start gap-4 cursor-pointer group mb-1">
                        <div className="relative flex items-center justify-center p-1">
                          <input 
                            type="checkbox" 
                            checked={wantsAlerts}
                            onChange={(e) => setWantsAlerts(e.target.checked)}
                            className="peer sr-only" 
                          />
                          <div className="w-5 h-5 border-2 border-outline rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                          <span className="material-symbols-outlined absolute text-white text-sm opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none">check</span>
                        </div>
                        <span className="text-primary font-medium">Deseo recibir también alertas sobre nuevos recursos o eventos de SoyBienestar.es</span>
                      </label>

                      <AnimatePresence>
                        {wantsAlerts && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-11 pt-4 pb-2 space-y-3">
                              <p className="text-xs text-on-surface-variant mb-3 uppercase tracking-wider font-semibold">Selecciona los canales:</p>
                              
                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.whatsapp}
                                    onChange={(e) => setChannels({...channels, whatsapp: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">WhatsApp</span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.sms}
                                    onChange={(e) => setChannels({...channels, sms: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">SMS</span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.telegram}
                                    onChange={(e) => setChannels({...channels, telegram: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">Telegram</span>
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {validationError && (
                      <div className="flex items-center gap-2 text-error text-sm mt-4 bg-error/10 p-3 rounded font-medium">
                        <span className="material-symbols-outlined text-base">error</span>
                        {validationError}
                      </div>
                    )}

                    <div className="pt-6">
                      <button type="submit" disabled={isSaving} className="w-full bg-primary text-on-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container transition-all duration-300 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                        {isSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
                        {isEditingProfile ? "Guardar Cambios" : "Validar y Continuar Sesión"}
                      </button>
                      
                      {isEditingProfile && (
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="w-full text-on-surface-variant font-medium mt-4 pt-2 pb-2 hover:text-primary transition-colors">
                           Cancelar edición
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-on-surface-variant/60 justify-center">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <p className="text-xs uppercase tracking-wide opacity-90">Tus datos están protegidos por cifrado de extremo a extremo.</p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>



      {/* Reassurance Banner */}
      <section className="max-w-7xl mx-auto px-8 mt-12 mb-32">
        <div className="bg-surface-container-low p-16 rounded-[2.5rem] text-center border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] scale-150">
            <span className="material-symbols-outlined text-[300px] text-primary">security</span>
          </div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-5xl text-secondary mb-6">shield_with_heart</span>
            <h3 className="font-headline text-3xl text-primary mb-6">Un Compromiso de Confidencialidad</h3>
            <p className="max-w-3xl mx-auto text-on-surface-variant leading-relaxed font-light text-lg">
              Entendemos que compartir tus sentimientos es un acto de vulnerabilidad. En ReprogrÁmate, tratamos cada dato bajo los más estrictos estándares éticos y de privacidad europeos. Tu seguridad es la base de nuestra terapia.
            </p>
          </div>
        </div>
      </section>
      {/* Organic Animated Infographic Modal */}
      <AnimatePresence>
        {selectedInfographic && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm"
              onClick={closeInfographicModal}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                layoutId={`card-${selectedInfographic.id}`}
                className="relative w-full max-w-5xl max-h-[90vh] bg-[#0b1221] text-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Elegant Action Buttons */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-[130]">
                  <a 
                    href={selectedInfographic.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
                    title="Abrir en pantalla completa / Descargar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">open_in_new</span>
                  </a>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      closeInfographicModal();
                    }}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
                    aria-label="Cerrar infographic"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
                  </button>
                </div>
                
                {/* Scrollable document area */}
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    src={selectedInfographic.src} 
                    alt="Infografía" 
                    className="w-full h-auto rounded-xl shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {selectedInfographic?.id === 'ansiedad' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre ansiedad
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a ordenar lo que sientes sin etiquetarte ni exigirte tenerlo todo resuelto.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {ANSIEDAD_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openAnsiedadFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenAnsiedadFaqIndex(openAnsiedadFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openAnsiedadFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openAnsiedadFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'estres' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre estrés
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a ordenar la presión diaria, el estrés laboral y el cansancio acumulado.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {ESTRES_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openEstresFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenEstresFaqIndex(openEstresFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openEstresFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openEstresFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'insomnio' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre insomnio
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a ordenar el descanso, la activación nocturna y las preocupaciones que no se apagan.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {INSOMNIO_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openInsomnioFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenInsomnioFaqIndex(openInsomnioFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openInsomnioFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openInsomnioFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'procrastinacion' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre procrastinación
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para entender por qué cuesta arrancar, cómo gestionar la parálisis y empezar poco a poco.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {PROCRASTINACION_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openProcrastinacionFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenProcrastinacionFaqIndex(openProcrastinacionFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openProcrastinacionFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openProcrastinacionFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'rumiacion' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre pensar demasiado y rumiación mental
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a reconocer el bucle mental, ordenar los pensamientos repetitivos y volver al presente.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {RUMIACION_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openRumiacionFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRumiacionFaqIndex(openRumiacionFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openRumiacionFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openRumiacionFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'gestion-emocional' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre gestión emocional
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a reconocer, regular y comprender lo que sientes sin dejar que tus emociones decidan por ti.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {GESTION_EMOCIONAL_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openGestionEmocionalFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenGestionEmocionalFaqIndex(openGestionEmocionalFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openGestionEmocionalFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openGestionEmocionalFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInfographic?.id === 'alimentacion-emocional' && (
                    <div className="mt-10 rounded-[2rem] bg-black/25 text-white shadow-2xl overflow-hidden border border-white/10">
                      <div className="p-6 md:p-8 border-b border-white/10">
                        <h2 className="font-headline text-2xl md:text-3xl italic">
                          Preguntas frecuentes sobre alimentación emocional
                        </h2>
                        <p className="text-white/60 mt-2 font-light">
                          Respuestas claras para empezar a distinguir hambre física, hambre emocional, ansiedad y relación con la comida sin juzgarte.
                        </p>
                      </div>

                      <div className="divide-y divide-white/10">
                        {ALIMENTACION_EMOCIONAL_FAQS.map((item, index) => (
                          <div key={item.question}>
                            <button
                              type="button"
                              aria-expanded={openAlimentacionEmocionalFaqIndex === index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenAlimentacionEmocionalFaqIndex(openAlimentacionEmocionalFaqIndex === index ? null : index);
                              }}
                              className="w-full text-left px-6 md:px-8 py-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
                            >
                              <h3 className="font-headline text-lg md:text-xl text-white">
                                {item.question}
                              </h3>
                              <span className="material-symbols-outlined text-white/70">
                                {openAlimentacionEmocionalFaqIndex === index ? "remove" : "add"}
                              </span>
                            </button>

                            {openAlimentacionEmocionalFaqIndex === index && (
                              <div className="px-6 md:px-8 pb-8 text-white/78 font-body leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Post-Login Transition Modal */}
      <AnimatePresence>
        {showPostLoginModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
              onClick={() => setShowPostLoginModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-surface p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-outline-variant/20"
              >
                <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                </div>
                <h3 className="font-headline text-3xl text-primary mb-4">¡Te damos la bienvenida!</h3>
                <p className="text-on-surface-variant text-lg font-light mb-10 leading-relaxed">
                  Has accedido correctamente a tu espacio seguro. ¿Deseas realizar tu consulta gratuita ahora o prefieres seguir navegando?
                </p>
                <div className="flex flex-col gap-4">
                  <button onClick={() => navigate('/session')} className="w-full bg-primary text-on-primary py-4 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container hover:text-on-primary-container transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Realizar ahora la Consulta Gratuita
                  </button>
                  <button onClick={() => setShowPostLoginModal(false)} className="w-full bg-surface-container-lowest text-primary py-4 rounded-full font-headline text-lg border border-outline-variant/30 hover:bg-surface-container-low transition-all">
                    Seguir navegando por la web
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <NextStepsModal 
        isOpen={isNextStepsModalOpen}
        onClose={() => setIsNextStepsModalOpen(false)}
        user={user}
        hasDoneConsultation={hasDoneConsultation}
        emailValue={contactEmail || user?.email || ""}
        phoneValue={phoneValue}
      />
    </div>
  );
}
