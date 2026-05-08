import fs from "fs";

let content = fs.readFileSync("src/pages/Report.tsx", "utf8");

const oldLogic = `  let activeNextStep = "consulta";
  if (!hasConsultation) activeNextStep = "consulta";
  else if (hasConsultation && !questionnaireRequested && !questionnaireCompleted) activeNextStep = "cuestionario";
  else if (questionnaireCompleted && !dossierAvailable) activeNextStep = "dossier";
  else if (dossierAvailable && !dossierViewed) activeNextStep = "dossier";
  else if (dossierViewed) activeNextStep = "validacion";`;

const newLogic = `  let activeNextStep = "consulta";
  if (!hasConsultation) activeNextStep = "consulta";
  else if (hasConsultation && !questionnaireCompleted) activeNextStep = "cuestionario";
  else if (questionnaireCompleted && !dossierAvailable) activeNextStep = "dossier";
  else if (dossierAvailable && !dossierViewed) activeNextStep = "dossier";
  else if (dossierViewed) activeNextStep = "validacion";`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync("src/pages/Report.tsx", content);
console.log("Updated activeNextStep logic");
