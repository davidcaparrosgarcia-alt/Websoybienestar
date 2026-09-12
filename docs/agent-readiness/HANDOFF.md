# Agent Readiness — Handoff técnico

Este documento existe para que cualquier chat/agente pueda continuar el proyecto sin depender del historial de conversación.

## Repositorio
- SoyBienestar: `davidcaparrosgarcia-alt/Websoybienestar`
- `main` debe permanecer sin cambios hasta terminar todas las fases.
- `main` de referencia: `51f31968af83174c93873195baab50bcdb9480ba`

## Regla de trabajo
Cada fase parte del SHA auditado de la fase anterior, se desarrolla en una rama nueva, se audita en GitHub/Vercel y NO se integra en `main` hasta auditoría integral final.

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
- SHA auditado actual: `8ca40d1e9b84cf7816e37d2db220de4cb3f5fb37`
- Estado: implementación terminada, Preview Vercel READY, build PASS.
- La IA es opcional: si falla, la guía determinista de Fase 4 sigue funcionando.
- Gemini solo clasifica a uno de los 20 `actionId` cerrados o `none`.
- No navega ni ejecuta acciones directamente; requiere clic humano en “Abrir”.

## Fase actual — Fase 6: coarse authenticated state

### Rama
`feat/agent-readiness-phase6-coarse-state`

### SHA actual de rama al crear este handoff
`a408f22cf01069307798eced68095b94964a7a04`

### Base exacta
`8ca40d1e9b84cf7816e37d2db220de4cb3f5fb37`

### Objetivo
Añadir una lectura mínima, de solo lectura y sin contenido sensible, para poder orientar el “Tu proceso” de la guía según el estado real del usuario autenticado, reutilizando la política canónica de cuestionario existente.

### Implementación actual
Archivos netos añadidos respecto a Fase 5:
- `src/agent/userState.ts`
- `src/agent/adapters/firestoreUserState.ts`
- `tests/agentUserState.test.ts`

`userState.ts`:
- reutiliza `resolveQuestionnaireUiState` de `api/questionnaireWebhookPolicy.ts`;
- expone solo estado grueso:
  - `hasDoneConsultation`
  - `questionnaireStage`: `not_started | active | reset_required | dossier_ready`
  - `recommendedProcessActionId`: `process_free_consultation | process_questionnaire | process_dossier`
- respeta prioridad `reset_required` sobre dossier.
- no expone respuestas, dossier, claves, PIN, IDs, contacto, edad, sexo ni contenido clínico.

`firestoreUserState.ts`:
- lector puro de `users/{uid}` y `userProfiles/{uid}`;
- solo `getDoc`;
- NO usa `getOrMigrateUserProfile` porque esa función escribe/migra;
- no escribe en Firestore.

`tests/agentUserState.test.ts`:
- cubre consulta no realizada, consulta realizada, cuestionario activo, dossier listo, reset_required, ausencia de datos sensibles y lectura pura sin writes.

### Importante: intento de validación temporal
Se intentó ejecutar toda la batería mediante un `buildCommand` temporal en `vercel.json`, pero Vercel rechazó esa configuración porque `buildCommand` superaba 256 caracteres. Esa prueba NO llegó a ejecutar el código.

Después se sustituyó por un script temporal y finalmente se eliminó todo el instrumental temporal. El SHA actual `a408f22...` ya no contiene ese validador temporal.

El Preview anterior del SHA `d0a5a60d9ad685dc2e51a4f64866a6b0563c2804`, que ya contenía los 3 archivos netos de Fase 6, terminó READY y `npm run build` pasó correctamente.

### Estado de Fase 6
NO está cerrada todavía.
Falta:
1. auditoría final del código neto de Fase 6 en GitHub;
2. decidir si conectar ya este coarse state a `InternalGuide` o dejarlo como capa preparada para la siguiente fase;
3. ejecutar/confirmar la batería específica `tests/agentUserState.test.ts` y, si es posible, regresión completa;
4. congelar un SHA final de Fase 6 solo cuando lo anterior esté verificado.

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

## Cómo continuar en un chat nuevo
Indicación mínima al nuevo chat:

> Lee `docs/agent-readiness/HANDOFF.md` en la rama `docs/agent-readiness-handoff` y audita después la rama `feat/agent-readiness-phase6-coarse-state`. Continúa desde el punto exacto descrito, sin tocar `main`.

El código real de GitHub manda sobre cualquier resumen.