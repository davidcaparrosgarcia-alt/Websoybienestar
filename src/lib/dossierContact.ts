const DOSSIER_CONTACT_PHONE = "34622852799";

export function buildDossierContactMessage(displayName?: string | null) {
  const firstName = displayName?.trim().split(/\s+/)[0] || "";
  const greeting = firstName ? `Hola, soy ${firstName}.` : "Hola.";
  return `${greeting} He revisado mi Dossier Espejo en SoyBienestar y me queda una duda concreta antes de decidir el siguiente paso:`;
}

export function buildDossierContactUrl(displayName?: string | null) {
  return `https://wa.me/${DOSSIER_CONTACT_PHONE}?text=${encodeURIComponent(buildDossierContactMessage(displayName))}`;
}
