import fs from "fs";

let content = fs.readFileSync("src/pages/Report.tsx", "utf8");

const oldButton1 = `                    onClick={() => {
                      if (!hasConsultation) {
                        navigate("/session");
                      } else if (hasConsultation && !questionnaireRequested && !questionnaireCompleted) {
                        setIsNextStepsModalOpen(true);
                      } else if (questionnaireCompleted && !dossierAvailable) {
                        // Deshabilitado visualmente, sin navegación
                      } else if (dossierAvailable) {
                        alert("El acceso al dossier se activará en la siguiente fase.");
                      }
                    }}`;

const newButton1 = `                    onClick={() => {
                      if (!hasConsultation) {
                        navigate("/session");
                      } else if (hasConsultation && !questionnaireCompleted) {
                        setIsNextStepsModalOpen(true);
                      } else if (questionnaireCompleted && !dossierAvailable) {
                        // Deshabilitado visualmente, sin navegación
                      } else if (dossierAvailable) {
                        alert("El acceso al dossier se activará en la siguiente fase.");
                      }
                    }}`;

content = content.replace(oldButton1, newButton1);

const oldButton2 = `                    {!hasConsultation && "Realizar consulta gratuita"}
                    {hasConsultation && !questionnaireRequested && !questionnaireCompleted && "Solicitar Cuestionario Espejo"}
                    {questionnaireCompleted && !dossierAvailable && "Dossier en preparación"}
                    {dossierAvailable && "Acceder al dossier"}`;

const newButton2 = `                    {!hasConsultation && "Realizar consulta gratuita"}
                    {hasConsultation && !questionnaireCompleted && "Solicitar Cuestionario Espejo"}
                    {questionnaireCompleted && !dossierAvailable && "Dossier en preparación"}
                    {dossierAvailable && "Acceder al dossier"}`;

content = content.replace(oldButton2, newButton2);

fs.writeFileSync("src/pages/Report.tsx", content);
console.log("Updated report button state");
