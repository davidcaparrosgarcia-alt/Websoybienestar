# Agent Readiness — Handoff técnico

Este documento existe para que cualquier chat/agente pueda continuar el proyecto sin depender del historial de conversación.

## Repositorio
- SoyBienestar: `davidcaparrosgarcia-alt/Websoybienestar`
- `main` debe permanecer sin cambios hasta terminar todas las fases.
- `main` de referencia y verificado tras Fase 7B: `51f31968af83174c93873195baab50bcdb9480ba`

## Regla de trabajo
Cada fase parte del SHA auditado de la fase anterior, se desarrolla en una rama nueva, se audita en GitHub/Vercel y NO se integra en `main` hasta auditoría integral final.

Si una mejora del agente exige modificar una pieza compartida por la web actual, detenerse antes de tocarla: se considera ALERTA ROJA y requiere auditoría previa de dependencias, flujos y regresiones.

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
- La IA es opcional: si falla, la guía determinista de Fase 4 sigue funcionando.
- Gemini solo clasifica a uno de los 20 `actionId` cerrados o `none`.
- No navega ni ejecuta acciones directamente; requiere clic humano en “Abrir”.

### Fase 6 — coarse authenticated state policy
- Rama: `feat/agent-readiness-phase6-coarse-state`
- Base exacta: `8ca40d1e9b84cf7816e37d2db220de4cb3f5fb37`
- SHA final auditado: `9240f44b5795074e5aaad45f4ed9cec8bf02e77e`
- Estado: PASS / congelada como capa de política privacy-safe.

#### Qué quedó finalmente
La Fase 6 conserva una capa pura del agente en `src/agent/userState.ts` y sus pruebas.

Acepta únicamente señales gruesas:
- `hasDoneConsultation`
- estado de cuestionario de usuario/perfil
- evidencia booleana de dossier

Devuelve únicamente:
- `hasDoneConsultation`
- `questionnaireStage`: `not_started | active | reset_required | dossier_ready`
- `recommendedProcessActionId`: `process_free_consultation | process_questionnaire | process_dossier`

Reutiliza `resolveQuestionnaireUiState` de `api/questionnaireWebhookPolicy.ts` sin modificar esa política. `reset_required` manda sobre cualquier evidencia de dossier.

El agente usa solo la señal canónica `hasDoneConsultation` y no interpreta alias alternativos.

La primera versión de esta fase incluía un reader Firestore completo; fue eliminado antes del cierre. La capa final no hace `getDoc`, no usa `fetch`, no recibe documentos completos y no usa `getOrMigrateUserProfile`.

#### Validación Fase 6
- 211 tests
- 211 PASS
- 0 FAIL
- `npm run lint`: PASS
- `npm run build`: PASS
- Preview final: READY

### Fase 7A — masked coarse-state transport
- Rama: `feat/agent-readiness-phase7a-masked-transport`
- Base exacta: `9240f44b5795074e5aaad45f4ed9cec8bf02e77e`
- SHA final auditado: `ba183616efff994dc04964f2c406dc96db8ce1f2`
- Estado: PASS / congelada como transporte mínimo. NO conectado a `InternalGuide` ni a `Layout`.

#### Objetivo e implementación
Se añadió:
- `src/services/agentCoarseStateTransport.ts`
- `tests/agentUserStateTransport.test.ts`

El transporte utiliza la sesión Firebase existente para autenticar una lectura REST de Firestore con `DocumentMask` / `mask.fieldPaths`.

Campos permitidos en `users/{uid}`:
- `hasDoneConsultation`
- `questionnaireStatus`
- `questionnaireRequestStatus`
- `dossierAvailableAt`

Campos permitidos en `userProfiles/{uid}`:
- `questionnaireStatus`
- `questionnaireRequestStatus`
- `dossierAvailableAt`

No pide ni interpreta dossier, contexto interno, respuestas, conclusiones, códigos/PIN, patient IDs, PII ni documentos completos.

El Firebase ID token existe solo temporalmente dentro del transporte, no se guarda, no se imprime y no cruza hacia la capa de decisión del agente ni hacia Gemini.

Firestore Security Rules continúan siendo la autoridad de acceso. No se modificaron reglas, auth, backend, webhooks ni estructura de datos.

Si falta el perfil se trata como vacío. Si falla auth/red/respuesta, devuelve `null` y la guía deberá degradar al comportamiento sin contexto.

#### Validación Fase 7A
- 219 tests
- 219 PASS
- 0 FAIL
- `npm run lint`: PASS
- `npm run build`: PASS
- Preview final limpio: READY

#### Diff neto Fase 7A
Solo dos archivos nuevos:
- `src/services/agentCoarseStateTransport.ts`
- `tests/agentUserStateTransport.test.ts`

No se modificó ningún archivo existente de runtime de SoyBienestar.

### Fase 7B — process context composition
- Rama: `feat/agent-readiness-phase7b-process-context`
- Base exacta: `ba183616efff994dc04964f2c406dc96db8ce1f2`
- SHA final auditado: `33f4a0efa8caf29b01b7c8bcff349cdf607e0db9`
- Estado: PASS / congelada. El transporte y la política ya están compuestos, pero todavía NO están montados en `InternalGuide` ni en `Layout`.

#### Objetivo
Unir de forma controlada el transporte privacy-safe de Fase 7A con la política pura de Fase 6 para obtener un contexto de proceso cerrado y determinista sin introducir comportamiento visible todavía.

#### Implementación
Se añadió exclusivamente:
- `src/agent/processContext.ts`
- `tests/agentProcessContext.test.ts`

`readAgentProcessContext()` hace únicamente esta cadena:

`masked transport -> AgentCoarseUserStateSignals -> deriveAgentCoarseUserState -> AgentCoarseUserState`

El resultado posible sigue limitado a:
- `hasDoneConsultation`
- `questionnaireStage`
- `recommendedProcessActionId`

La capa de composición no recibe ni conoce token, UID, documentos Firestore, PII, dossier, respuestas o conclusiones. Tampoco navega, ejecuta acciones ni llama a Gemini.

#### Degradación y kill switch
- Si el transporte devuelve `null`, `readAgentProcessContext()` devuelve `null`.
- `null` significa “sin contexto disponible”, nunca autorización ni estado alternativo.
- Si `VITE_INTERNAL_GUIDE_CONTEXT_ENABLED === "false"`, el transporte ni siquiera se ejecuta.
- La guía determinista actual debe seguir funcionando exactamente como antes cuando no exista contexto.

#### Semántica verificada
- Sin consulta completada -> `process_free_consultation`.
- Consulta completada -> `process_questionnaire`.
- Cuestionario activo -> `process_questionnaire`.
- Dossier disponible -> `process_dossier`.
- `reset_required` + dossier -> `process_questionnaire`; reset sigue ganando.

La semántica sigue viniendo de Fase 6 y de `resolveQuestionnaireUiState`; Fase 7B no crea un segundo motor de estados.

#### No conexión deliberada
Fase 7B NO modifica ni importa `readAgentProcessContext()` desde:
- `Layout.tsx`
- `InternalGuide.tsx`
- consulta
- dossier
- solicitud de cuestionario
- backend
- Firebase Rules
- webhooks

Por tanto, todavía no cambia nada visible ni funcional para el usuario de la web actual.

#### Validación Fase 7B
Se añadió temporalmente un runner de validación en Preview y se retiró completamente antes del SHA final.

Resultado:
- 229 tests
- 229 PASS
- 0 FAIL
- `npm run lint`: PASS
- `npm run build`: PASS
- Preview de validación: READY
- Preview final limpio `33f4a0e...`: READY

El runner temporal y el `buildCommand` temporal NO existen en el SHA final.

#### Diff neto Fase 7B respecto a Fase 7A
Únicamente dos archivos nuevos:
- `src/agent/processContext.ts`
- `tests/agentProcessContext.test.ts`

No se modificó ningún archivo existente de runtime de SoyBienestar.

## Siguiente fase recomendada
Fase 7C: estudiar y, si pasa auditoría previa, conectar el `recommendedProcessActionId` únicamente a la orientación de la sección “Tu proceso” de `InternalGuide`.

Condiciones para Fase 7C:
1. partir exactamente del SHA `33f4a0efa8caf29b01b7c8bcff349cdf607e0db9`;
2. antes de modificar `InternalGuide.tsx`, auditar cómo se presentan actualmente sus tres acciones de proceso y sus pruebas;
3. el coarse state solo puede destacar/recomendar una acción; nunca ocultar puertas válidas, autorizar acceso ni saltarse `ProtectedRoute`;
4. no ejecutar automáticamente la recomendación;
5. mantener clic humano antes de cualquier navegación;
6. no enviar el coarse state a Gemini; la recomendación debe ser determinista;
7. si el transporte falla o está desactivado, `InternalGuide` debe conservar exactamente el comportamiento visual y funcional actual;
8. no modificar `Layout`, Firebase Rules, backend, webhooks, consulta, cuestionario o dossier;
9. cualquier necesidad de tocar una pieza compartida de la web = ALERTA ROJA antes del cambio.

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

> Lee `docs/agent-readiness/HANDOFF.md` en la rama `docs/agent-readiness-handoff` y audita después el SHA congelado de Fase 7B `33f4a0efa8caf29b01b7c8bcff349cdf607e0db9` en `feat/agent-readiness-phase7b-process-context`. Diseña Fase 7C sin tocar `main` ni ninguna pieza compartida de la web sin declarar antes ALERTA ROJA.

El código real de GitHub manda sobre cualquier resumen.
