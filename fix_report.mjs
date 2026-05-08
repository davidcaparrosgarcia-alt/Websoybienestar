import fs from "fs";

let text = fs.readFileSync("src/pages/Report.tsx", "utf8");

text = text.replace(
    "1. Consulta Gratuita",
    "1. Consulta Gratuita"
);

// A) Consulta Gratuita
// active already changed via prompt 1 but wait, let me check the regex again
text = text.replace(
    "Empieza por la Consulta Gratuita para preparar tu primera lectura orientativa.",
    "Empieza por la Consulta Gratuita para contarnos qué te ocurre y preparar tu primera lectura orientativa."
);

text = text.replace(
    "Su primer acercamiento con la herramienta ha sido completado.",
    "Has completado tu primera consulta y ya contamos con una base inicial para orientarte mejor."
);

// B) Cuestionario Espejo
text = text.replace(
    "Profundice en las raíces de la niebla detectada con nuestro test avanzado. <span",
    "El siguiente paso es solicitar el Cuestionario Espejo para completar tu primera lectura con experiencias concretas de tu día a día. <span"
);

text = text.replace(
    "Profundice en las raíces de la niebla detectada con nuestro test avanzado.</p>",
    "El Cuestionario Espejo ayuda a completar tu primera lectura con situaciones cotidianas para que el equipo humano tenga más contexto.</p>"
);

// C) Dossier Espejo
text = text.replace(
    "Obtendrás tu dosier completo y personalizado con nuestro análisis y recomendaciones. <span",
    "Tu Dossier Espejo reunirá la información de tu consulta y del cuestionario para ofrecerte una lectura más completa y personalizada. <span"
);

text = text.replace(
    "Obtendrás tu dosier completo y personalizado con nuestro análisis y recomendaciones.</p>",
    "Cuando esté disponible, tu Dossier Espejo reunirá la información de tu consulta y del cuestionario en una lectura más completa y personalizada.</p>"
);

// D) Sesión de Validación
text = text.replace(
    "Resérvese un encuentro individual con un especialista para validar estos hallazgos. <span",
    "Cuando hayas revisado tu dossier, podrás valorar una sesión humana para resolver dudas y decidir si quieres continuar con acompañamiento personalizado. <span"
);

text = text.replace(
    "Resérvese un encuentro individual con un especialista para validar estos hallazgos.</p>",
    "Después del dossier, podrás valorar una sesión humana para resolver dudas y decidir si quieres continuar con acompañamiento personalizado.</p>"
);

// 2. /report — Ajustar pregunta de validación del informe
const oldFeedbackText = "<p className=\"font-body text-on-surface-variant text-sm text-center sm:text-left\">\\n" +
"                  {(report as any)?.pregunta_validacion || 'Recuerda: Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo. ¿Sientes que refleja cómo te encuentras?'}\\n" +
"                </p>";

const newFeedbackText = "<div className=\"font-body text-on-surface-variant text-sm text-center sm:text-left flex-1\">\\n" +
"                  <p>{(report as any)?.pregunta_validacion || 'Recuerda: Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo.'}</p>\\n" +
"                  <p className=\"font-medium text-primary mt-1\">¿Sientes que refleja cómo te encuentras?</p>\\n" +
"                </div>";

if (text.includes(oldFeedbackText)) {
    text = text.replace(oldFeedbackText, newFeedbackText);
} else {
    // fallback if extra spaces
    text = text.replace(
        "{(report as any)?.pregunta_validacion || 'Recuerda: Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo. ¿Sientes que refleja cómo te encuentras?'}",
        "{(report as any)?.pregunta_validacion?.replace(' ¿Sientes que refleja cómo te encuentras?', '') || 'Recuerda: Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo.'}</p><p className=\"font-medium text-primary mt-1\">¿Sientes que refleja cómo te encuentras?</p>"
    );
    // actually, let's just make it simple using regex
}

const oldBtns = "<div className=\"flex items-center gap-3 shrink-0\">";
const newBtns = "<div className=\"flex items-center gap-3 shrink-0 whitespace-nowrap\">";
text = text.replace(oldBtns, newBtns);

fs.writeFileSync("src/pages/Report.tsx", text);
console.log("Report updated.");
