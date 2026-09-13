# Agent Readiness — Handoff técnico

Este documento existe para que cualquier chat/agente pueda continuar el proyecto sin depender del historial de conversación.

## Repositorio
- SoyBienestar: `davidcaparrosgarcia-alt/Websoybienestar`
- `main` debe permanecer sin cambios hasta terminar las fases y realizar la auditoría integral final.
- `main` de referencia y verificado tras Fase 7C: `51f31968af83174c93873195baab50bcdb9480ba`

## Regla de trabajo
Cada checkpoint parte del SHA auditado anterior, se desarrolla en una rama separada, se audita en GitHub/Vercel y NO se integra en `main` hasta auditoría integral final.

Si una mejora del agente exige modificar una pieza compartida por la web actual, detenerse antes de tocarla: se considera ALERTA ROJA y requiere auditoría previa de dependencias, flujos y regresiones.

### Cadencia desde Fase 7C
Las primeras fases se dividieron de forma muy granular para fijar con seguridad las fronteras de privacidad, transporte, autorización y ejecución. Esas fronteras ya están definidas.

A partir de Fase 7C, evitar microfases innecesarias. Agrupar cambios contiguos que sean exclusivamente del agente y compartan el mismo nivel de riesgo en checkpoints mayores:
- una auditoría al inicio;
- un lote de implementación coherente;
- una validación completa al final;
- un único congelado del checkpoint.

Solo detener el lote antes de tiempo si aparece una ALERTA ROJA, una dependencia compartida no prevista o una regresión real.

## Fases cerradas

### Fase 1 — Capability Core
- Rama: `feat/agent-capability-core-phase1`
- SHA auditado: `6ec384017276cfbd0fc27c0c42721c0c246e665f`
- Estado: PASS definitivo.

### Fase 2 — App Executor + Arrival Context
- Rama: `feat/agent-readiness-phase2`
- SHA auditado: `3adfcf7d0bd68ee5a70b8b6717d7d2fe6f8e3b1d`
- Estado: PASS definitivo.

### Fase 3 — WebMCP experimental adapter
- Rama: `feat/agent-readiness-phase3-webmcp`
- SHA auditado: `7c5df3be6abf683570ad64c09cf4951ae4560b71`
- Estado: PASS definitivo.

### Fase 4 — Internal deterministic guide
- Rama: `feat/agent-readiness-phase4-internal-guide`
- SHA auditado: `6bed165f8d39f89c1134d93ff00ac9f7817e4266`
- Estado: PASS / congelada.

### Fase 5 — AI interpreter + safety gate
- Rama: `feat/agent-readiness-phase5-ai-interpreter`
- SHA auditado: `8ca40d1e9b84cf7816e37d2db220de4cb3f5fb37`
- Estado: PASS / congelada.
- La IA es opcional: si falla, la guía determinista sigue funcionando.
- Gemini solo clasifica a uno de los 20 `actionId` cerrados o `none`.
- No navega ni ejecuta acciones directamente; requiere clic humano en “Abrir”.

### Fase 6 — coarse authenticated state policy
- Rama: `feat/agent-readiness-phase6-coarse-state`
- Base exacta: `8ca40d1e9b84cf7816e37d2db220de4cb3f5fb37`
- SHA final auditado: `9240f44b5795074e5aaad45f4ed9cec8bf02e77e`
- Estado: PASS / congelada como capa de política privacy-safe.

La capa pura `src/agent/userState.ts` acepta únicamente señales gruesas de consulta/cuestionario/dossier y devuelve únicamente `hasDoneConsultation`, `questionnaireStage` y `recommendedProcessActionId`.

Reutiliza `resolveQuestionnaireUiState` sin modificar la política existente. `reset_required` manda sobre dossier. Usa solo el `hasDoneConsultation` canónico. La primera versión con lectura completa Firestore fue eliminada antes del cierre.

Validación: 211/211 tests, lint PASS, build PASS, Preview READY.

### Fase 7A — masked coarse-state transport
- Rama: `feat/agent-readiness-phase7a-masked-transport`
- Base exacta: `9240f44b5795074e5aaad45f4ed9cec8bf02e77e`
- SHA final auditado: `ba183616efff994dc04964f2c406dc96db8ce1f2`
- Estado: PASS / congelada.

Se añadió `src/services/agentCoarseStateTransport.ts` y sus tests. El transporte usa sesión Firebase existente + REST Firestore con `DocumentMask` para recibir solo:

`users/{uid}`:
- `hasDoneConsultation`
- `questionnaireStatus`
- `questionnaireRequestStatus`
- `dossierAvailableAt`

`userProfiles/{uid}`:
- `questionnaireStatus`
- `questionnaireRequestStatus`
- `dossierAvailableAt`

No solicita dossier, respuestas, conclusiones, códigos/PIN, patient IDs, PII ni documentos completos. El Firebase ID token existe solo temporalmente dentro del transporte y no cruza hacia la capa de decisión ni Gemini. No se modificaron Firebase Rules, auth, backend, webhooks ni estructura de datos. Fallos de auth/red degradan a `null`.

Validación: 219/219 tests, lint PASS, build PASS, Preview final limpio READY.

### Fase 7B — process context composition
- Rama: `feat/agent-readiness-phase7b-process-context`
- Base exacta: `ba183616efff994dc04964f2c406dc96db8ce1f2`
- SHA final auditado: `33f4a0efa8caf29b01b7c8bcff349cdf607e0db9`
- Estado: PASS / congelada.

Se añadió `src/agent/processContext.ts` y sus tests. La cadena es:

`masked transport -> AgentCoarseUserStateSignals -> deriveAgentCoarseUserState -> AgentCoarseUserState`

La composición no recibe token, UID, documentos, PII, dossier, respuestas o conclusiones. Tampoco navega, ejecuta acciones ni llama a Gemini. Si falla el transporte devuelve `null`; `null` nunca autoriza nada. El kill switch `VITE_INTERNAL_GUIDE_CONTEXT_ENABLED=false` evita incluso la lectura.

Semántica verificada:
- sin consulta -> consulta gratuita;
- consulta completada -> cuestionario;
- cuestionario activo -> cuestionario;
- dossier disponible -> dossier;
- `reset_required` + dossier -> cuestionario.

Validación: 229/229 tests, lint PASS, build PASS, Preview final limpio READY.

### Fase 7C — process guidance in InternalGuide
- Rama: `feat/agent-readiness-phase7c-process-guidance`
- Base exacta: `33f4a0efa8caf29b01b7c8bcff349cdf607e0db9`
- SHA final auditado: `d532046eeedaa386e171a091c267dfd854c438f2`
- Estado: PASS / congelada.

#### Objetivo
Hacer visible la recomendación determinista de proceso únicamente dentro de la sección “Tu proceso” de la guía interna, sin convertirla en autorización, sin navegación automática y sin alterar los flujos reales de consulta, cuestionario o dossier.

#### Implementación
Runtime modificado:
- `src/agent/adapters/InternalGuide.tsx`

Tests:
- `tests/internalGuideProcessGuidance.test.ts` nuevo
- `tests/agentProcessContext.test.ts` ajustado para reflejar el montaje deliberado de Fase 7C sin perder el guard de que `Layout` no conoce el contexto.

Comportamiento:
- La lectura de contexto NO se hace al montar `Layout` ni al abrir simplemente la guía.
- Solo se solicita cuando el usuario entra explícitamente en “Tu proceso”.
- Las tres acciones existentes siguen visibles, en el mismo orden y clicables.
- La acción recomendada recibe únicamente una indicación visual discreta `Recomendado` y `aria-current="step"`.
- No hay autoejecución ni autonavegación.
- `handleAction()` sigue ejecutándose únicamente por clic humano.
- La recomendación no se envía a Gemini ni modifica el texto enviado al clasificador IA.
- `InternalGuide` no accede directamente a Firebase, Firestore, token ni red; llama exclusivamente a `readAgentProcessContext()`.
- Si no hay contexto o falla la lectura, desaparece la recomendación y se conserva el listado normal sin mensaje de error adicional.
- No se modificaron `Layout.tsx`, Firebase Rules, backend, webhooks, consulta, cuestionario ni dossier en Fase 7C.

#### Validación Fase 7C
La primera ejecución detectó un único test histórico de Fase 7B que afirmaba que todavía no debía existir montaje en `InternalGuide`. Era una aserción deliberadamente válida para 7B pero obsoleta para el objetivo de 7C; no fue un fallo de runtime. Se actualizó ese guard para exigir ahora que el contexto esté montado solo en `InternalGuide` y nunca en `Layout`.

Resultado final:
- 235 tests
- 235 PASS
- 0 FAIL
- `npm run lint`: PASS
- `npm run build`: PASS
- Preview de validación: READY
- Preview final limpio del SHA `d532046...`: READY

El runner temporal y el `buildCommand` temporal se retiraron completamente antes del SHA final.

#### Diff neto Fase 7C respecto a Fase 7B
Solo:
- `src/agent/adapters/InternalGuide.tsx` modificado
- `tests/agentProcessContext.test.ts` modificado
- `tests/internalGuideProcessGuidance.test.ts` añadido

No quedaron cambios netos en `vercel.json` ni scripts temporales.

## Próximo checkpoint recomendado — cierre amplio de Agent Readiness
No crear una microfase 7D por cada detalle. El siguiente trabajo debe agrupar el cierre técnico del agente en un checkpoint mayor:

1. auditar acumulativamente todo el diff desde `main` hasta Fase 7C;
2. revisar específicamente los pocos archivos compartidos tocados por fases anteriores (`Layout.tsx`, `Resources.tsx`, `server.ts`, `vercel.json`) y sus dependencias antes de cualquier futura integración;
3. comprobar kill switches, degradación, navegación humana, privacidad, ausencia de ejecución R2/R3/R4 y compatibilidad móvil/escritorio;
4. identificar y resolver en el mismo lote únicamente los defectos agent-only que aparezcan;
5. ejecutar una única batería integral de tests + lint + build + Preview;
6. todavía NO tocar ni fusionar `main` hasta que esa auditoría integral dé PASS.

Si durante ese checkpoint aparece la necesidad de cambiar lógica compartida real de SoyBienestar, detener el lote y declarar ALERTA ROJA antes del cambio.

## Arquitectura que NO debe romperse

`free text -> safety gate -> AI classifier -> closed actionId -> human confirmation -> Capability Core -> App Executor -> controlled navigation`

Además:
- WebMCP es solo un adapter del Core.
- Arrival Context es solo UX y nunca autorización.
- `ProtectedRoute` sigue siendo autoridad para auth.
- Cuestionario/Dossier/consulta privada no exponen contenido al agente.
- `sb.open_emotional_course` sigue UNAVAILABLE hasta implementar el entitlement definitivo.
- El coarse state solo orienta; nunca autoriza ni sustituye puertas protegidas.

## Prohibiciones
- No tocar `main` hasta auditoría integral final.
- No duplicar lógica del cuestionario; reutilizar `resolveQuestionnaireUiState`.
- No leer dossier, respuestas, conclusiones, PIN/códigos, Firestore docs completos, tokens ni PII desde la capa de decisión del agente.
- El token solo puede existir transitoriamente dentro del transporte autenticado y nunca cruzar al agente/IA.
- No usar `getOrMigrateUserProfile` para el estado del agente porque escribe.
- No modificar Cuestionario Espejo desde estas fases.
- No convertir el agente en un segundo motor de estados.
- No permitir que la IA navegue directamente.
- No modificar Firebase Rules, auth, webhooks o flujos actuales para beneficiar al agente sin ALERTA ROJA y auditoría previa.

## Cómo continuar en un chat nuevo
Indicación mínima al nuevo chat:

> Lee `docs/agent-readiness/HANDOFF.md` en la rama `docs/agent-readiness-handoff` y audita después el SHA congelado de Fase 7C `d532046eeedaa386e171a091c267dfd854c438f2` en `feat/agent-readiness-phase7c-process-guidance`. Continúa con el checkpoint amplio de cierre de Agent Readiness sin tocar `main`; cualquier cambio necesario en lógica compartida real de SoyBienestar es ALERTA ROJA y debe auditarse antes.

El código real de GitHub manda sobre cualquier resumen.
