/**
 * REGLA DE ARQUITECTURA PARA FUTUROS EJERCICIOS
 * (Optimización de Coste y Privacidad de Datos)
 * 
 * Todo ejercicio futuro debe cumplir estrictamente con este patrón:
 * 
 * 1. ALMACENAMIENTO MÍNIMO: Guardar solo lo mínimo operativo en la colección del ejercicio (ej. `users/{uid}/{exerciseCollection}`).
 * 2. TRANSFORMACIÓN: Procesar los datos crudos o textos generados por el usuario convirtiéndolos en conclusiones compactas.
 * 3. FUSIÓN AL PERFIL GLOBAL: Toda conclusión útil debe fusionarse con el resumen global del usuario (`userProfiles/{profileId}`).
 * 4. EPHEMERAL TEXT (Efímero): No guardar texto crudo o transcripciones más tiempo del estrictamente necesario para la UX del día.
 * 5. LIMPIEZA POR INACTIVIDAD: Eliminar el historial operativo completamente tras una inactividad prolongada del usuario (ej. 90 días), 
 *    conservando únicamente la identidad mínima y la memoria resumida en `userProfiles`.
 * 
 * REGLA DE FUSIÓN DE RESÚMENES (Prompt exigido para la IA):
 * “Fusiona la nueva conclusión con el resumen global previo del usuario. No repitas hallazgos ya presentes salvo para reforzarlos o matizarlos. Devuelve un único resumen acumulado, compacto, útil para personalizar futuras propuestas y sin redundancias.”
 */

export const EPHEMERAL_TEXT_DAYS = 1;
export const INACTIVITY_WIPE_DAYS = 90;
