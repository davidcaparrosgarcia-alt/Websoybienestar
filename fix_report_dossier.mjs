import fs from "fs";

let content = fs.readFileSync("src/pages/Report.tsx", "utf8");

// 1. Add useState
if (!content.includes("const [showDossierText, setShowDossierText] = useState(false);")) {
  content = content.replace(
    "const [isPlaying, setIsPlaying] = useState(false);",
    "const [isPlaying, setIsPlaying] = useState(false);\n  const [showDossierText, setShowDossierText] = useState(false);"
  );
}

// 2. Replace Dossier Card
const oldCard = `            {/* Dossier Card */}
            <div 
              className="md:col-span-6 p-8 rounded-[2rem] border border-outline-variant/10 group flex flex-col relative overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: "url('/images/fondo_dosier.jpg')" }}
            >
              <div className="absolute inset-0 bg-white/85 dark:bg-[#162839]/85 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-3xl font-headline font-bold text-primary dark:text-[#2c3e50] mb-4">Dossier Espejo personalizado</h4>
                  <p className="text-on-surface-variant dark:text-[#43474c] font-label text-base">
                    {!questionnaireCompleted && "Completa primero los pasos previos para desbloquear tu dossier personalizado."}
                    {questionnaireCompleted && !dossierAvailable && "Tu dossier se está preparando. En cuanto esté disponible, podrás acceder desde aquí."}
                    {dossierAvailable && !dossierViewed && "Tu dossier ya está disponible. Accede con tu clave personal para consultarlo."}
                    {dossierViewed && "Tu dossier ya ha sido desbloqueado. Puedes volver a consultarlo cuando lo necesites."}
                  </p>
                </div>
                
                <div className="mt-8">
                  <button 
                    onClick={() => {
                      if (!hasConsultation) {
                        navigate("/session");
                      } else if (hasConsultation && !questionnaireCompleted) {
                        setIsNextStepsModalOpen(true);
                      } else if (questionnaireCompleted && !dossierAvailable) {
                        // Deshabilitado visualmente, sin navegación
                      } else if (dossierAvailable) {
                        navigate("/dossier-espejo");
                      }
                    }}`;

const newCard = `            {/* Dossier Card */}
            <div 
              className="md:col-span-6 p-8 rounded-[2rem] border border-outline-variant/10 group flex flex-col relative overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: "url('/images/fondo_dosier.jpg')" }}
              onClick={() => {
                if (window.matchMedia('(hover: none)').matches) {
                  setShowDossierText(prev => !prev);
                }
              }}
              onMouseLeave={() => setShowDossierText(false)}
            >
              <div className="absolute inset-0 bg-white/40 dark:bg-[#162839]/50 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className={\`transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 \${showDossierText ? 'opacity-100' : 'opacity-0'}\`}>
                  <div className="bg-black/40 backdrop-blur-md px-6 py-5 border border-white/10 rounded-2xl shadow-xl">
                    <h4 className="text-3xl font-headline font-bold text-white mb-4">Dossier Espejo personalizado</h4>
                    <p className="text-white/90 font-label text-lg md:text-xl">
                      {!questionnaireCompleted && "Completa primero los pasos previos para desbloquear tu dossier personalizado."}
                      {questionnaireCompleted && !dossierAvailable && "Tu dossier se está preparando. En cuanto esté disponible, podrás acceder desde aquí."}
                      {dossierAvailable && !dossierViewed && "Tu dossier ya está disponible. Accede con tu clave personal para consultarlo."}
                      {dossierViewed && "Tu dossier ya ha sido desbloqueado. Puedes volver a consultarlo cuando lo necesites."}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasConsultation) {
                        navigate("/session");
                      } else if (hasConsultation && !questionnaireCompleted) {
                        setIsNextStepsModalOpen(true);
                      } else if (questionnaireCompleted && !dossierAvailable) {
                        // Deshabilitado visualmente, sin navegación
                      } else if (dossierAvailable) {
                        navigate("/dossier-espejo");
                      }
                    }}`;

content = content.replace(oldCard, newCard);

fs.writeFileSync("src/pages/Report.tsx", content);
console.log("Updated report dossier card UI");
