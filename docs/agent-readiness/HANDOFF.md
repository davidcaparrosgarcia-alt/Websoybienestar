# Agent Readiness — Handoff técnico

Este documento existe para que cualquier chat/agente pueda continuar el proyecto sin depender del historial de conversación.

## Repositorio
- SoyBienestar: `davidcaparrosgarcia-alt/Websoybienestar`
- `main` debe permanecer sin cambios hasta terminar todas las fases.
- `main` de referencia y verificado tras Fase 6: `51f31968af83174c93873195baab50bcdb9480ba`

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
- Estado: PASS / congelada como capa de política privacy-safe. La lectura/transporte y conexión visual se dejan para una fase posterior.

#### Qué quedó finalmente
La Fase 6 conserva únicamente una capa pura del agente en `src/agent/userState.ts` y sus pruebas.

La capa acepta exclusivamente señales gruesas:
- `hasDoneConsultation`
- estado de cuestionario de usuario/perfil
- evidencia booleana de dossier

Devuelve exclusivamente:
- `hasDoneConsultation`
- `questionnaireStage`: `not_started | active | reset_required | dossier_ready`
- `recommendedProcessActionId`: `process_free_consultation | process_questionnaire | process_dossier`

Reutiliza `resolveQuestionnaireUiState` de `api/questionnaireWebhookPolicy.ts`, sin modificar esa política existente. `reset_required` continúa mandando sobre cualquier evidencia de dossier.

#### Corrección de privacidad aplicada
El primer diseño incluía `src/agent/adapters/firestoreUserState.ts`, que hacía `getDoc()` sobre `users/{uid}` y `userProfiles/{uid}` completos y filtraba después. Se consideró demasiado permisivo para la frontera del agente.

Ese adapter fue ELIMINADO antes de cerrar la fase.

La capa del agente ya no importa Firebase/Firestore, no hace `getDoc`, no usa `fetch` y no recibe documentos completos. Tampoco usa `getOrMigrateUserProfile`.

No se implementó un nuevo backend ni se modificaron Firestore Rules, Firebase, autenticación o la estructura existente de datos.

#### Consulta realizada
El agente usa solo la señal canónica `hasDoneConsultation`. Se eliminaron de su interpretación los alias inventados `consultationCompleted` y `sessionCompleted` para evitar crear un segundo motor de estados.

#### Conexión a InternalGuide
NO se conectó todavía el coarse state a `InternalGuide`.

Decisión deliberada: primero se cerró la frontera privacy-safe. Una futura fase deberá diseñar cómo obtener esas señales gruesas sin entregar al agente documentos privados completos.

Si para obtenerlas fuera necesario cambiar Firebase Rules, documentos existentes, webhooks, consulta gratuita, cuestionario, dossier, auth u otra pieza compartida de SoyBienestar, detenerse y tratarlo como ALERTA ROJA antes de modificar nada.

#### Validación Fase 6
En Preview de Vercel se ejecutó una validación temporal y después se retiró completamente del árbol final.

Resultado sobre el contenido final funcional de la fase:
- 211 tests
- 211 PASS
- 0 FAIL
- `npm run lint`: PASS
- `npm run build`: PASS
- Preview de validación: READY
- Preview del SHA final limpio `9240f44...`: READY

El instrumental temporal de validación (`scripts/validate-agent-readiness.mjs` y `buildCommand` temporal) NO existe en el SHA final.

#### Diff neto Fase 6 respecto a Fase 5
Runtime añadido:
- `src/agent/userState.ts`

Tests:
- `tests/agentUserState.test.ts`
- ajustes de regresión de Fase 5 en `tests/agentGuideApi.test.ts`
- ajustes de regresión de Fase 5 en `tests/internalGuide.test.ts`

No hay adapter Firestore del agente en el diff final.

## Siguiente fase recomendada
Diseñar el transporte mínimo de señales gruesas hacia el agente SIN tocar todavía la lógica actual de la web.

Antes de implementar:
1. identificar de dónde puede obtenerse cada señal sin entregar documentos completos;
2. demostrar que no requiere cambiar ningún flujo actual;
3. si requiere modificar una pieza compartida, declarar ALERTA ROJA y auditar primero todas sus dependencias;
4. mantener la conexión a `InternalGuide` desactivada hasta que el transporte privacy-safe esté validado.

## Arquitectura que NO debe romperse

`free text -> safety gate -> AI classifier -> closed actionId -> human confirmation -> Capability Core -> App Executor -> controlled navigation`

Además:
- WebMCP es solo un adapter del Core.
- Arrival Context es solo UX y nunca autorización.
- `ProtectedRoute` sigue siendo autoridad para auth.
- Cuestionario/Dossier/consulta privada no exponen contenido al agente.
- `sb.open_emotional_course` sigue UNAVAILABLE hasta implementar el entitlement definitivo.

## Prohibiciones
- No tocar `main` hasta auditoría integral final.
- No duplicar lógica del cuestionario; reutilizar `resolveQuestionnaireUiState`.
- No leer dossier, respuestas, conclusiones, PIN/códigos, Firestore docs completos, tokens ni PII desde el agente.
- No usar `getOrMigrateUserProfile` para el estado del agente porque escribe.
- No modificar Cuestionario Espejo desde estas fases.
- No convertir el agente en un segundo motor de estados.
- No permitir que la IA navegue directamente.
- No modificar Firebase Rules, auth, webhooks o flujos actuales para beneficiar al agente sin ALERTA ROJA y auditoría previa.

## Cómo continuar en un chat nuevo
Indicación mínima al nuevo chat:

> Lee `docs/agent-readiness/HANDOFF.md` en la rama `docs/agent-readiness-handoff` y audita después el SHA congelado de Fase 6 `9240f44b5795074e5aaad45f4ed9cec8bf02e77e` en `feat/agent-readiness-phase6-coarse-state`. Diseña la siguiente fase sin tocar `main` ni ninguna pieza compartida de la web sin declarar antes ALERTA ROJA.

El código real de GitHub manda sobre cualquier resumen.
