# Agent Readiness — Handoff técnico

Este documento existe para que cualquier chat/agente pueda continuar el proyecto sin depender del historial de conversación.

## Repositorio
- SoyBienestar: `davidcaparrosgarcia-alt/Websoybienestar`
- `main` debe permanecer sin cambios hasta terminar todas las fases.
- `main` de referencia y verificado tras Fase 7A: `51f31968af83174c93873195baab50bcdb9480ba`

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

### Fase 7A — masked coarse-state transport
- Rama: `feat/agent-readiness-phase7a-masked-transport`
- Base exacta: `9240f44b5795074e5aaad45f4ed9cec8bf02e77e`
- SHA final auditado: `ba183616efff994dc04964f2c406dc96db8ce1f2`
- Estado: PASS / congelada como transporte mínimo. NO está conectado todavía a `InternalGuide` ni a `Layout`.

#### Objetivo
Permitir que una futura capa del agente obtenga únicamente las señales gruesas que necesita la Fase 6 sin descargar los documentos completos de `users/{uid}` y `userProfiles/{uid}` en la frontera del agente y sin modificar procesos existentes de SoyBienestar.

#### Implementación
Se añadió exclusivamente un servicio nuevo dedicado al transporte:
- `src/services/agentCoarseStateTransport.ts`

Y sus pruebas:
- `tests/agentUserStateTransport.test.ts`

El transporte usa la sesión Firebase ya existente solo para identificar al usuario autenticado y obtener temporalmente su Firebase ID token. Ese token:
- no se devuelve al agente;
- no se guarda;
- no se imprime en consola;
- no se incluye en URLs;
- se usa únicamente como `Authorization: Bearer ...` para la llamada REST autenticada.

La petición REST usa `DocumentMask` / `mask.fieldPaths` para pedir únicamente estos campos:

`users/{uid}`:
- `hasDoneConsultation`
- `questionnaireStatus`
- `questionnaireRequestStatus`
- `dossierAvailableAt`

`userProfiles/{uid}`:
- `questionnaireStatus`
- `questionnaireRequestStatus`
- `dossierAvailableAt`

No pide ni interpreta:
- `latestDossier`
- `latestDossierInternalContext`
- respuestas del cuestionario
- conclusiones
- códigos/PIN
- patient IDs
- nombre, email, teléfono, edad o sexo
- resúmenes clínicos
- documentos completos

El transporte convierte inmediatamente `dossierAvailableAt` en una señal booleana `dossierEvidence` y devuelve solo el contrato grueso esperado por Fase 6.

#### Frontera de seguridad importante
Firestore Security Rules continúan autorizando la lectura a nivel de documento y NO son un control de lectura por campo. La máscara REST se usa aquí como minimización del contenido devuelto al transporte del agente, no como sustituto de las reglas de seguridad.

Las reglas actuales siguen siendo la autoridad: el usuario autenticado solo puede leer sus propios documentos porque `request.auth.uid == userId`. No se modificaron `firestore.rules`.

La función de producción toma el usuario de `auth.currentUser`; no recibe un UID arbitrario desde la IA o desde texto del usuario. En pruebas existe una variante inyectable, pero incluso una combinación UID/token que no pertenezca al mismo usuario queda rechazada por las reglas de propietario de Firestore.

#### Fallos y degradación
- Si `userProfiles/{uid}` no existe: se trata como documento vacío.
- Si hay 401/403, error de red, respuesta inválida o cualquier fallo del transporte: devuelve `null` y el agente deberá degradar a comportamiento sin contexto.
- No hay escrituras.
- No usa Firestore SDK para leer documentos (`getDoc`, `setDoc`, `updateDoc`, etc.).
- No registra errores que puedan incluir token o contenido privado.

#### Compatibilidad con la política existente
El transporte no decide qué significa cada estado. Solo devuelve señales gruesas.

La Fase 6 sigue siendo quien llama a `resolveQuestionnaireUiState`, por lo que:
- `reset_required` sigue mandando sobre dossier;
- cuestionario activo sigue siendo cuestionario activo;
- dossier disponible sigue recomendando la puerta del dossier;
- no se ha creado un segundo motor de estados.

#### No conexión deliberada
Fase 7A NO modifica ni importa el transporte desde:
- `Layout.tsx`
- `InternalGuide.tsx`
- páginas de consulta
- páginas de dossier
- componentes de solicitud de cuestionario

Por tanto, esta fase no altera ningún comportamiento visible de la web actual.

#### Validación Fase 7A
En Preview de Vercel se añadió temporalmente un runner que ejecutó todos los `*.test.ts` existentes y después se retiró completamente.

Resultado:
- 219 tests
- 219 PASS
- 0 FAIL
- `npm run lint`: PASS
- `npm run build`: PASS
- Preview de validación: READY
- Preview del SHA final limpio `ba18361...`: READY

El runner temporal y el `buildCommand` temporal NO existen en el SHA final.

#### Diff neto Fase 7A respecto a Fase 6
Únicamente dos archivos nuevos:
- `src/services/agentCoarseStateTransport.ts`
- `tests/agentUserStateTransport.test.ts`

No se modificó ningún archivo existente de runtime de SoyBienestar.

## Siguiente fase recomendada
Fase 7B: conectar de forma controlada el transporte de Fase 7A con la política pura de Fase 6 y, solo después, decidir cómo usa `InternalGuide` el `recommendedProcessActionId`.

Condiciones para Fase 7B:
1. partir exactamente del SHA `ba183616efff994dc04964f2c406dc96db8ce1f2`;
2. no reutilizar ni modificar el estado cargado por `Layout.tsx`;
3. no modificar Firebase Rules, backend, webhooks, consulta, cuestionario o dossier;
4. mantener la IA fuera del transporte: Gemini no debe recibir UID, token ni estas señales salvo que una fase futura lo justifique y se audite expresamente;
5. si el transporte falla, la guía determinista debe seguir funcionando exactamente como antes;
6. cualquier necesidad de tocar una pieza compartida de la web = ALERTA ROJA antes del cambio;
7. antes de conectar visualmente nada, añadir pruebas que demuestren que la recomendación solo cambia la orientación del agente y nunca la autorización ni el estado real del usuario.

## Arquitectura que NO debe romperse

`free text -> safety gate -> AI classifier -> closed actionId -> human confirmation -> Capability Core -> App Executor -> controlled navigation`

Además:
- WebMCP es solo un adapter del Core.
- Arrival Context es solo UX y nunca autorización.
- `ProtectedRoute` sigue siendo autoridad para auth.
- Cuestionario/Dossier/consulta privada no exponen contenido al agente.
- `sb.open_emotional_course` sigue UNAVAILABLE hasta implementar el entitlement definitivo.
- El coarse state solo puede orientar; nunca autorizar ni sustituir las puertas protegidas actuales.

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

> Lee `docs/agent-readiness/HANDOFF.md` en la rama `docs/agent-readiness-handoff` y audita después el SHA congelado de Fase 7A `ba183616efff994dc04964f2c406dc96db8ce1f2` en `feat/agent-readiness-phase7a-masked-transport`. Diseña Fase 7B sin tocar `main` ni ninguna pieza compartida de la web sin declarar antes ALERTA ROJA.

El código real de GitHub manda sobre cualquier resumen.
