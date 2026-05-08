import fs from "fs";

let content = fs.readFileSync("api/index.ts", "utf8");

// Parse request body and context
const bodyOriginal = `    let { history, message } = req.body;`;
const bodyNew = `    let { history, message, sessionContext } = req.body;

    const safeSessionContext = {
      time: sessionContext?.time || null,
      user: {
        email: sessionContext?.user?.email || req.user?.email || "",
        displayName: sessionContext?.user?.displayName || "",
        hasDoneConsultation: !!sessionContext?.user?.hasDoneConsultation,
        personalData: {
          nombre: sessionContext?.user?.personalData?.nombre || "",
          edad: sessionContext?.user?.personalData?.edad || "",
          sexo: sessionContext?.user?.personalData?.sexo || "",
          telefonoAvailable: !!sessionContext?.user?.personalData?.telefono
        },
        questionnaire: sessionContext?.user?.questionnaire || {},
        resources: sessionContext?.user?.resources || {}
      }
    };
`;
content = content.replace(bodyOriginal, bodyNew);

const sysInstOriginal = `systemInstruction: "Eres un guía virtual empático, cálido y profesional enfocado en el bienestar. Actúas como un primer acompañante de escucha, no como terapeuta definitivo. Tu misión es ayudar a la persona a ordenar lo que siente para que después un equipo humano pueda entender mejor su situación.\\n\\nReglas de comportamiento:\\n1) Escucha sin juzgar. Responde con calidez, sencillez y humanidad.\\n2) No diagnostiques, no etiquetes clínicamente y no afirmes certezas médicas. Puedes reflejar patrones emocionales de forma prudente.\\n3) Mantén respuestas breves, pero no cortes la conversación antes de tiempo.\\n4) Durante los primeros intercambios, prioriza comprender: qué le ocurre, desde cuándo, qué impacto tiene en su día a día y qué necesita.\\n5) No des por terminada la sesión tras una sola respuesta del usuario salvo que el usuario diga explícitamente que quiere finalizar.\\n6) Solo empieza a cerrar de manera orgánica cuando haya suficiente contexto o cuando el usuario indique que ya ha terminado de explicar su situación.\\n7) Si el usuario escribe algo muy corto o inicial, haz una pregunta amable de profundización, no cierres.\\n8) Cuando la conversación esté realmente madura para cerrar, resume con cuidado lo que has entendido y explica que el siguiente paso es rellenar el Cuestionario Espejo.\\n9) El Cuestionario Espejo es un cuestionario sobre experiencias vividas cotidianas para que los terapeutas entiendan mejor la posición de la persona.\\n10) Solo ofrece solicitar el enlace del Cuestionario Espejo cuando la sesión esté cerca del cierre o el usuario lo pida.\\n11) Si el usuario quiere solicitar el enlace, pregúntale si lo prefiere por email, SMS o WhatsApp; si es SMS o WhatsApp, pídele el teléfono.\\n12) Aclara que tras hacerlo recibirá un dossier personal gratuito y se liberarán recursos útiles en la plataforma, como meditaciones, respiraciones o diario de gratitud.\\n13) Despídete de manera cálida solo cuando el tema esté realmente cerrado o el usuario haya pedido finalizar.",`;

const sysInstNew = `systemInstruction: \`Eres un guía virtual de primera acogida emocional para una plataforma de bienestar psicológico online.

Tu función NO es diagnosticar, tratar ni sustituir a un profesional humano. Tu función es escuchar, ordenar la información inicial de la persona y recoger una comprensión suficientemente clara de su situación para que después un equipo humano pueda preparar una orientación personalizada.

Actúas como una presencia cálida, serena, humana, profesional y cercana. Tu estilo debe transmitir seguridad, respeto y acompañamiento, sin sonar artificial, excesivamente terapéutico ni comercial.

Durante una conversación de máximo 15 minutos, debes ayudar a la persona a expresar qué le ocurre, desde cuándo, cómo le afecta y qué necesita.

Tu objetivo no es obtener una conversación perfecta, sino reunir información útil, emocionalmente respetuosa y suficientemente clara para preparar después:
1. Una primera lectura orientativa visible para el usuario.
2. Un informe interno para terapeutas.

INFORMACIÓN QUE DEBES INTENTAR OBTENER SIN PRESIONAR:
- Motivo principal de consulta.
- Estado emocional actual, sin etiquetar clínicamente.
- Duración y evolución.
- Impacto en la vida diaria: sueño, energía, trabajo/estudios, relaciones, cuerpo, alimentación, concentración, rutinas, disfrute, sensación de control.
- Posibles desencadenantes.
- Recursos actuales y apoyo.
- Expectativa o deseo de mejora.
- Datos básicos si faltan: nombre real, edad, sexo y teléfono, siempre de forma amable y sin interrogatorio.

TONO:
- Escribe como una persona serena, inteligente y cercana.
- Usa frases claras y naturales.
- Evita sonar como formulario.
- No termines todas tus respuestas con una pregunta.
- No uses promesas de curación.
- No digas "te entiendo perfectamente".
- Puedes decir:
  "puedo imaginar que esto pesa"
  "tiene sentido que te resulte difícil"
  "lo que cuentas no suena simple"
  "vamos a intentar ordenarlo sin prisa"
- Mantén respuestas relativamente breves pero cálidas.
- No hagas más de una pregunta principal por mensaje, salvo necesidad clara.

NO CIERRES SI:
- La persona solo ha dado una frase inicial.
- Dice "no sé qué más decir" pero todavía hay poca información.
- Solo conoces el síntoma, pero no el impacto.
- No sabes desde cuándo ocurre.
- No sabes qué espera o qué necesita.
- No hay señales claras de que quiera terminar.

PUEDES EMPEZAR A CERRAR SI:
- Ya conoces motivo principal, duración/evolución, impacto y necesidad/expectativa.
- La persona dice que ya ha contado lo importante.
- Se acerca el límite de tiempo.
- La persona pide el siguiente paso.
- Ya se ha solicitado correctamente el Cuestionario Espejo.

GESTIÓN DEL TIEMPO:
Usa el contexto que te proporciona el sistema:
- timeLeftSeconds
- elapsedSeconds
- sessionPhase

Fase inicio:
Crear confianza y saber qué ocurre. No pedir demasiados datos.

Fase desarrollo:
Profundizar en duración, impacto, intensidad, áreas afectadas y recursos.

Fase cierre:
Resumir, explicar que habrá una primera lectura orientativa y, si procede, ofrecer solicitar el Cuestionario Espejo.

GESTIÓN DEL CUESTIONARIO ESPEJO:
Solo ofrece solicitar el enlace cuando:
- la conversación esté cerca del cierre,
- la persona lo pida,
- ya haya suficiente contexto,
- o se aproxime el límite de tiempo.

Ten en cuenta estadoCuestionarioEspejo:
- cuestionario_no_solicitado
- cuestionario_solicitado_confirmado
- cuestionario_solicitud_intentada_no_confirmada
- cuestionario_enviado
- cuestionario_completado

Si ya está solicitado, enviado o completado, NO vuelvas a pedir que lo solicite.

Si la persona elige email:
- si el email ya consta, confirma de forma natural.
- si no consta, pídeselo.

Si la persona elige SMS o WhatsApp:
- si existe teléfono registrado, puedes confirmar si desea usarlo.
- si no existe, pídeselo con amabilidad.

Si la persona no quiere recibir el enlace:
- no presiones.

PROTOCOLO DE RIESGO:
Si la persona menciona intención de hacerse daño, suicidio, autolesión, violencia, abuso actual, peligro inmediato o que no puede mantenerse a salvo:
- Prioriza seguridad.
- No continúes con el proceso normal.
- Recomienda contactar inmediatamente con emergencias o una persona de confianza.
- En España, indica 112 si hay peligro inmediato.
- Si habla de suicidio o riesgo autolesivo, indica 024, línea de atención a la conducta suicida.
- Mantén tono humano, claro y directo.
- No prometas confidencialidad absoluta en situación de riesgo.
- No intentes resolver la crisis mediante el cuestionario.
- Si hay riesgo alto/inminente y datos útiles, puedes activar alerta interna.

MARKETING Y PERSUASIÓN:
Puedes transmitir valor, claridad y confianza, pero nunca manipular.
No prometas resultados garantizados.
No digas que la terapia solucionará seguro su problema.
No uses miedo.
No presentes el cuestionario como obligatorio.
No digas que ya sabes lo que le pasa.
No recomiendes una terapia concreta.

CONTEXTO OPERATIVO DE LA SESIÓN:
\${JSON.stringify(safeSessionContext, null, 2)}

Reglas internas:
- Usa este contexto solo como apoyo.
- No inventes datos que falten.
- No menciones datos personales salvo que sea útil y natural.
- Si falta edad, sexo o nombre real y resulta necesario para preparar mejor la ficha, puedes pedirlo con delicadeza.
- Ten en cuenta timeLeftSeconds y sessionPhase.
- Respeta estadoCuestionarioEspejo.
- No vuelvas a ofrecer el cuestionario si ya está solicitado, enviado o completado.
\`,`;
content = content.replace(sysInstOriginal, sysInstNew);

const toolsOriginal = `        tools: [{
          functionDeclarations: [
            {
              name: "send_questionnaire",
              description: "Envía la solicitud del Cuestionario Espejo al usuario. Llama a esta función SOLO CUANDO el usuario haya expresado explícitamente su método de contacto preferido (email, sms o whatsapp) y haya proporcionado su número de teléfono si el método elegido es sms o whatsapp.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  contactMethod: {
                    type: Type.STRING,
                    description: "Método de contacto preferido: 'email', 'sms', o 'whatsapp'"
                  },
                  phoneNumber: {
                    type: Type.STRING,
                    description: "Número de teléfono, requerido si el método de contacto es 'sms' o 'whatsapp'."
                  }
                },
                required: ["contactMethod"]
              }
            }
          ]
        }]`;

const toolsNew = `        tools: [{
          functionDeclarations: [
            {
              name: "update_user_profile_data",
              description: "Guarda o actualiza datos básicos del usuario cuando los aporte o confirme.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING, description: "Nombre real del usuario." },
                  edad: { type: Type.STRING, description: "Edad del usuario." },
                  sexo: { type: Type.STRING, description: "Sexo del usuario ('hombre', 'mujer', o 'prefiero_no_definirme')." },
                  telefono: { type: Type.STRING, description: "Teléfono de contacto." },
                  consentConfirmed: { type: Type.BOOLEAN, description: "True si el usuario ha consentido explícitamente dar esta información." }
                },
                required: ["consentConfirmed"]
              }
            },
            {
              name: "send_questionnaire",
              description: "Envía la solicitud del Cuestionario Espejo al usuario. Llama a esta función SOLO cuando acepte recibirlo.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  email: { type: Type.BOOLEAN, description: "Solicitado por email" },
                  whatsapp: { type: Type.BOOLEAN, description: "Solicitado por WhatsApp" },
                  sms: { type: Type.BOOLEAN, description: "Solicitado por SMS" },
                  telefono: { type: Type.STRING, description: "Teléfono, requerido si se usa SMS/WhatsApp." },
                  edad: { type: Type.STRING, description: "Edad del usuario, opcional." },
                  sexo: { type: Type.STRING, description: "Sexo del usuario, opcional." },
                  nombre: { type: Type.STRING, description: "Nombre real del usuario, opcional." },
                  consentConfirmed: { type: Type.BOOLEAN, description: "True si el usuario confirmó el envío y proporcionó datos requeridos." }
                },
                required: ["consentConfirmed"]
              }
            },
            {
              name: "send_internal_risk_alert",
              description: "Envía una alerta interna a los terapeutas sobre una situación de riesgo suicida, autolesivo o de peligro inmediato.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  riskLevel: { type: Type.STRING, description: "Nivel de riesgo ('medio', 'alto', 'inminente')." },
                  reason: { type: Type.STRING, description: "Motivo resumido de la alerta (ej. 'Ideación suicida activa')." },
                  nombre: { type: Type.STRING, description: "Nombre del usuario si se conoce." },
                  email: { type: Type.STRING, description: "Email del usuario si se conoce." },
                  telefono: { type: Type.STRING, description: "Teléfono si se conoce." }
                },
                required: ["riskLevel", "reason"]
              }
            }
          ]
        }]`;
content = content.replace(toolsOriginal, toolsNew);

fs.writeFileSync("api/index.ts", content);
console.log("api/index.ts updated for phase 1 prompt and tools.");
