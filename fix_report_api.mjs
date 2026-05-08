import fs from "fs";

let content = fs.readFileSync("api/index.ts", "utf8");

const oldPromptBlock = `    const prompt = \`
      A continuación se presenta la transcripción de una consulta guiada preliminar entre una persona y un asistente inicial.
      Como coach de bienestar empático, evalúa si la sesión aporta información relevante sobre la situación expresada (vacías o mero ruido no valen).
      
      Necesito que generes:
      1. Un resumen clínico ("clinicalSummary") que se guardará internamente para el terapeuta (análisis objetivo, 3ª persona).
      2. Un mensaje empático dirigido al usuario ("userEmpatheticMessage" escrito en 2ª persona, como un amigo) que:
        - Resuma la conversación validando lo que el usuario ha expresado.
        - Le comunique que NO es ningún diagnóstico ni el dossier definitivo, sino un resumen de esta primera etapa (la consulta).
        - Le informe que esto se trasladará al terapeuta.
        - Le recuerde que el segundo paso es realizar el "Cuestionario Espejo". Tras hacerlo, recibirá su Dossier Personal con la conclusión del terapeuta de forma gratuita y sin presiones, y tendrá acceso liberado a recursos como meditaciones o el diario de gratitud.
      
      Genera un resumen compacto que integre la nueva información con el historial pasado.
      
      Historial pasado:
      \${accumulatedSummary || "No hay historial."}

      Transcripción Actual:
      \${conversationText}

      EL RESULTADO DEBE SER EXCLUSIVAMENTE UN OBJETO JSON con esta estructura exacta (sin bloques markdown JSON):
      {
        "validConclusion": boolean,
        "clinicalSummary": "Resumen interno para el terapeuta",
        "userEmpatheticMessage": "Mensaje empático y directo al usuario descrito arriba",
        "newAccumulatedSummary": "Resumen integrado",
        "needsUrgentSupport": boolean,
        "urgentSupportMessage": "mensaje muy delicado, empático y orientado a buscar ayuda inmediata si needsUrgentSupport es true, si es false dejar vacío"
      }
    \`;`;

const newPromptBlock = `    const prompt = \`
      A continuación se presenta la transcripción de una consulta guiada preliminar entre una persona y un asistente inicial.
      Como profesional experto, evalúa si la sesión aporta información relevante.
      
      Necesito que generes:
      1. Un informe visible para el usuario ("visibleOrientationReport"). Emplea un tono empático, elegante, humano y comprensivo. NO debe parecer clínico, ni diagnóstico, ni comercial.
      2. Un informe interno para los terapeutas ("internalTherapistReport"). Objetivo, resumido, sin inventar datos.
      
      Además de estos dos, mantén un mensaje corto compasivo en "userEmpatheticMessage", y los demás valores legacy.

      REGLA CRÍTICA PARA EL INFORME VISIBLE:
      NUNCA uses palabras como "prediagnóstico", "diagnóstico", "evaluación clínica", "trastorno", o "necesitas terapia".
      Si el usuario no ha expresado elementos de riesgo o clínicos graves, mantenlo suave.

      Historial pasado:
      \${accumulatedSummary || "No hay historial."}

      Transcripción Actual:
      \${conversationText}

      EL RESULTADO DEBE SER EXCLUSIVAMENTE UN OBJETO JSON con esta estructura exacta (sin bloques markdown JSON):
      {
        "validConclusion": boolean,
        "userEmpatheticMessage": "Mensaje corto amable de fallback",
        "clinicalSummary": "Resumen básico fallback",
        "newAccumulatedSummary": "Resumen analítico integrado",
        "needsUrgentSupport": boolean,
        "urgentSupportMessage": "mensaje delicado para buscar ayuda inmediata si needsUrgentSupport es true",
        "visibleOrientationReport": {
          "titulo": "Tu primera lectura de claridad",
          "subtitulo": "Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo.",
          "lo_que_parece_pesar_mas": "Párrafo empático",
          "impacto_en_tu_dia_a_dia": "Párrafo sobre cómo afecta a su día a día",
          "lo_que_podria_necesitar_tu_momento_actual": "Sugerencias suaves",
          "lo_que_esta_conversacion_ha_permitido_ver": "Lo que habéis ordenado juntos",
          "siguiente_paso": "El Cuestionario Espejo",
          "pregunta_validacion": "¿Sientes que refleja cómo te encuentras?",
          "opciones_validacion": ["Totalmente", "No del todo"],
          "nota_seguridad": "Este resumen no sustituye una valoración profesional ni constituye un diagnóstico."
        },
        "internalTherapistReport": {
          "datos_basicos": { "nombre": "", "edad": "", "email": "", "telefono": "", "canal_preferido_cuestionario": "", "estado_cuestionario_espejo": "" },
          "motivo_principal": "",
          "estado_emocional_predominante": { "expresado_por_usuario": [], "inferido_por_conversacion": [] },
          "duracion_y_evolucion": "",
          "impacto_funcional": { "sueno": "", "energia": "", "trabajo_estudios": "", "relaciones": "", "cuerpo": "", "alimentacion": "", "concentracion": "", "rutinas": "", "capacidad_disfrute": "", "evitacion": "" },
          "contexto_y_posibles_desencadenantes": "",
          "recursos_y_afrontamiento": "",
          "expectativas_usuario": "",
          "senales_de_riesgo": { "riesgo_detectado": false, "descripcion": "", "accion_recomendada": "" },
          "nivel_orientativo_intensidad": "bajo | medio | alto | riesgo",
          "hipotesis_de_trabajo_no_diagnostica": "",
          "informacion_faltante_relevante": [],
          "recomendacion_prudente_siguiente_paso": "",
          "validacion_usuario_informe_visible": { "respuesta": "", "comentario_adicional": "" },
          "observaciones_estilo_comunicacion": [],
          "resumen_para_derivacion": ""
        }
      }
    \`;`;

content = content.replace(oldPromptBlock, newPromptBlock);
content = content.replace("config: { maxOutputTokens: 1200 }", "config: { maxOutputTokens: 3500 }");

fs.writeFileSync("api/index.ts", content);
console.log("Updated api");
