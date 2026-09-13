export const PERSONAL_SUPPORT_GUIDANCE =
  "Lo que cuentas parece necesitar algo más personal que una respuesta general. Esta guía no hace terapia ni puede valorar tu situación en profundidad, pero SoyBienestar ofrece una consulta guiada gratuita de aproximadamente 15 minutos en la que puedes explicar con tus palabras lo que te ocurre. Si decides continuar el recorrido que corresponda, podrás profundizar con el Cuestionario Espejo y llegar a un Dossier Espejo personalizado, gratuito y sin compromiso.";

const EXPLICIT_THERAPY_PATTERNS: readonly RegExp[] = [
  /\b(hazme terapia|quiero que me hagas terapia|puedes hacerme terapia)\b/,
  /\b(se|actua como)\b.{0,15}\b(mi )?(psicologo|psicologa|terapeuta)\b/,
  /\b(puedes ser|quiero que seas)\b.{0,15}\b(mi )?(psicologo|psicologa|terapeuta)\b/,
];

const FIRST_PERSON_PATTERNS: readonly RegExp[] = [
  /\b(me siento|me encuentro|siento que|estoy|tengo|llevo|me pasa|no puedo|me cuesta|no paro|necesito ayuda)\b/,
  /\b(mi pareja|mi familia|mi jefe|mis companeros|mis amigos|mi trabajo|en el trabajo|en casa)\b/,
];

const STRONG_PERSONAL_PATTERNS: readonly RegExp[] = [
  /\b(me siento|me encuentro|estoy)\b.{0,30}\b(sol[oa]|aislad[oa])\b/,
  /\bsoledad\b/,
  /\b(deprimid[oa]s?|depresion)\b/,
  /\b(me siento|estoy)\b.{0,30}\b(vaci[oa]|sin ganas|sin ilusion)\b/,
  /\b(no tengo ganas de nada|no me apetece nada|me cuesta levantarme|no tengo ganas de salir)\b/,
  /\b(todos|nadie)\b.{0,40}\b(me odia(?:n)?|me quiere(?:n)?|me entiende(?:n)?|me soporta(?:n)?)\b/,
  /\b(no le importo a nadie|a nadie le importo)\b/,
  /\b(me rechazan|me ignoran|me excluyen|me hacen el vacio)\b/,
  /\b(me siento|estoy)\b.{0,25}\b(rechazad[oa]|ignorad[oa]|excluid[oa])\b/,
  /\b(siento que|me siento)\b.{0,35}\b(no encajo|no importo|sobro|soy una carga)\b/,
  /\b(mi pareja me ha dejado|me ha dejado mi pareja|ruptura|separacion)\b/,
  /\b(me han despedido|he perdido el trabajo)\b/,
  /\b(duelo|ha muerto|he perdido a alguien)\b/,
  /\b(no valgo para nada|soy un fracaso|me siento inutil)\b/,
  /\b(no se que hacer con mi vida)\b/,
  /\b(mi jefe|mis companeros)\b.{0,40}\b(me humilla|me humillan|me acosa|me acosan|se rien de mi)\b/,
  /\b(mi pareja|mi familia|mis amigos)\b.{0,45}\b(me ignora|me ignoran|no me entiende|no me entienden|me rechaza|me rechazan|me trata mal|me tratan mal)\b/,
  /\b(estoy pasando|paso por)\b.{0,25}\b(una epoca (?:muy )?(?:mala|dificil)|un momento dificil|una mala epoca)\b/,
  /\b(lloro mucho|no paro de llorar|estoy llorando)\b/,
];

const COMMON_GUIDE_SYMPTOM_PATTERNS: readonly RegExp[] = [
  /\b(ansiedad|ataques? de ansiedad)\b/,
  /\b(estres|estresad[oa]|sobrecarga)\b/,
  /\b(insomnio|no puedo dormir|me cuesta dormir|duermo mal)\b/,
  /\b(rumiacion|no paro de pensar|darle vueltas)\b/,
  /\b(comer por ansiedad|como por ansiedad|hambre emocional)\b/,
];

const PERSONAL_NARRATIVE_PATTERNS: readonly RegExp[] = [
  /\b(angustia|angustiad[oa]|agobiad[oa]|desbordad[oa])\b/,
  /\b(me siento|estoy)\b.{0,20}\b(fatal|muy mal|perdid[oa]|bloquead[oa])\b/,
  /\b(no puedo concentrarme|me cuesta concentrarme)\b/,
  /\b(no quiero salir|me estoy aislando|me he aislado)\b/,
  /\b(no consigo funcionar|no puedo con el dia a dia|no puedo con el dia)\b/,
  /\b(no se como seguir)\b/,
];

const PERSONAL_HELP_PATTERNS: readonly RegExp[] = [
  /\b(que puedo hacer|que hago|no se que hacer)\b/,
  /\b(ayudame|necesito ayuda|aconsejame|que me recomiendas)\b/,
  /\b(como salgo de esto|como puedo sentirme mejor|como lo manejo|como manejarlo)\b/,
];

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function countMatches(text: string, patterns: readonly RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

export function isPersonalSupportSeekingText(text: string): boolean {
  const value = fold(text);
  if (matchesAny(value, EXPLICIT_THERAPY_PATTERNS)) return true;
  if (!matchesAny(value, FIRST_PERSON_PATTERNS)) return false;

  if (countMatches(value, STRONG_PERSONAL_PATTERNS) >= 1) return true;

  const commonSymptoms = countMatches(value, COMMON_GUIDE_SYMPTOM_PATTERNS);
  if (commonSymptoms >= 2) return true;

  const personalNarrative = countMatches(value, PERSONAL_NARRATIVE_PATTERNS);
  const asksForHelp = matchesAny(value, PERSONAL_HELP_PATTERNS);
  return personalNarrative >= 2 || (personalNarrative >= 1 && asksForHelp);
}
