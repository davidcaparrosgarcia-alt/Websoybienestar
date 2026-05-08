import fs from "fs";
let content = fs.readFileSync("src/pages/Report.tsx", "utf8");
content = content.replace(
  "Recuerda: Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo. ¿Sientes que refleja cómo te encuentras?",
  "{(report as any)?.pregunta_validacion || 'Recuerda: Esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo. ¿Sientes que refleja cómo te encuentras?'}"
);
fs.writeFileSync("src/pages/Report.tsx", content);
