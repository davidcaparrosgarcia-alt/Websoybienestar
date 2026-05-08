import fs from "fs";

let content = fs.readFileSync("src/pages/Report.tsx", "utf8");

const logicInsert = `
  const hasConsultation = !!userData?.hasDoneConsultation;
  const questionnaireRequested = !!userData?.lastQuestionnaireRequestAt || !!userData?.latestQuestionnaireRequest;
  const questionnaireCompleted = !!userData?.hasDoneCuestionario || userData?.questionnaireStatus === "completed" || userData?.questionnaireStatus === "concluded" || userData?.questionnaireStatus === "finalized";
  const dossierAvailable = !!userData?.dossierAvailableAt || !!userData?.latestDossier;
  const dossierViewed = !!userData?.dossierViewedAt;

  let activeNextStep = "consulta";
  if (!hasConsultation) activeNextStep = "consulta";
  else if (hasConsultation && !questionnaireRequested && !questionnaireCompleted) activeNextStep = "cuestionario";
  else if (questionnaireCompleted && !dossierAvailable) activeNextStep = "dossier";
  else if (dossierAvailable && !dossierViewed) activeNextStep = "dossier";
  else if (dossierViewed) activeNextStep = "validacion";

  if (isAuthorized === null || isLoading) {`;

content = content.replace("  if (isAuthorized === null || isLoading) {", logicInsert);


const cardOld = `{/* Meditation Placeholder */}
            <div className="md:col-span-6 bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 group">
              <div className="flex items-start justify-between mb-12">
                <div>
                  <h4 className="text-2xl font-headline font-bold text-primary mb-2">Meditación: "La Niebla Mental"</h4>
                  <p className="text-on-surface-variant font-label">Ejercicio guiado • 5 minutos</p>
                </div>
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-primary hover:bg-primary-container hover:scale-105 transition-all flex items-center justify-center text-white dark:!text-[#162839] cursor-pointer shadow-md">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden cursor-pointer" onClick={togglePlay}>
                <img className={\`w-full h-full object-cover transition-transform duration-700 \${isPlaying ? 'scale-105 opacity-80' : 'group-hover:scale-105'}\`} alt="Minimalist mountain landscape with soft clouds and ethereal morning light, zen meditation aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFUALo3f7B6x6NjOC9HNYr2mjq7WSHLlC4tyP2TEl2c6cZo1BoPjNHGWbz4NpOMu26F0IliuGEjJ4d1YtYqEQov3BoiQwsadBxCx1e1JkwZU4oQnT3IWFzcq2f-Sg44FA8f-1CTMJOvGpqWXtns16uOOr-qn3Z3-LjZAMds5UpORSdLBYKnPeibhnnMY3iy3AVfib0fMzCf8jwY4fMrYbyjaLWta-pTxJZ-PLm2qAmJFe_ngOlzX5vi9_1uwIw10MpNegmpvpTp0hs"/>
                <div className={\`absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity \${isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}\`}>
                  <span className="text-white font-label font-bold uppercase tracking-widest">Reproducir ahora</span>
                </div>
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-1 items-center justify-center h-12">
                      <div className="w-1.5 h-1/3 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '0ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-2/3 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '200ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-full bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '400ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-1/2 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '600ms', animationDuration: '800ms' }}></div>
                      <div className="w-1.5 h-1/4 bg-white rounded-full animate-pulse object-center" style={{ animationDelay: '800ms', animationDuration: '800ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              <audio 
                ref={audioRef} 
                src="/audios/meditacion_guiada_breve/meditacion_guiada_breve.m4a" 
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
              />
            </div>`;

const cardNew = `{/* Dossier Card */}
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
                      } else if (hasConsultation && !questionnaireRequested && !questionnaireCompleted) {
                        setIsNextStepsModalOpen(true);
                      } else if (questionnaireCompleted && !dossierAvailable) {
                        // Deshabilitado visualmente, sin navegación
                      } else if (dossierAvailable) {
                        alert("El acceso al dossier se activará en la siguiente fase.");
                      }
                    }}
                    disabled={questionnaireCompleted && !dossierAvailable}
                    className={\`px-8 py-3 rounded-full font-label font-bold text-sm transition-all focus:outline-none flex w-fit \${
                      (questionnaireCompleted && !dossierAvailable) 
                        ? 'bg-outline-variant/20 dark:bg-outline-variant/40 text-on-surface-variant dark:text-[#43474c] cursor-not-allowed opacity-70' 
                        : 'bg-primary text-on-primary hover:bg-primary-container hover:text-primary shadow-md hover:scale-105 cursor-pointer'
                    }\`}
                  >
                    {!hasConsultation && "Realizar consulta gratuita"}
                    {hasConsultation && !questionnaireRequested && !questionnaireCompleted && "Solicitar Cuestionario Espejo"}
                    {questionnaireCompleted && !dossierAvailable && "Dossier en preparación"}
                    {dossierAvailable && "Acceder al dossier"}
                  </button>
                </div>
              </div>
            </div>`;

content = content.replace(cardOld, cardNew);

const checklistOld = `<div className="space-y-6">
                
                {/* 1. Consulta Gratuita */}
                <div className="flex gap-4">
                  <div className={\`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center \${userData?.hasDoneConsultation ? 'border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10' : 'border-outline-variant dark:border-[#2c3e50]/30'}\`}>
                    {userData?.hasDoneConsultation && <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">check</span>}
                  </div>
                  <div>
                    <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Consulta Gratuita</p>
                    <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Su primer acercamiento con la herramienta ha sido completado.</p>
                  </div>
                </div>

                {/* 2. Cuestionario Espejo */}
                {userData?.hasDoneCuestionario ? (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10">
                      <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">check</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Cuestionario Espejo</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Profundice en las raíces de la niebla detectada con nuestro test avanzado.</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsNextStepsModalOpen(true)}
                    className="flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 cursor-pointer transition-all group shadow-sm hover:shadow-md mb-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">Cuestionario Espejo</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Profundice en las raíces de la niebla detectada con nuestro test avanzado. <span className="font-medium text-primary dark:text-[#2c3e50]">Solicitar ahora</span></p>
                    </div>
                  </div>
                )}

                {/* 3. Descarga de Guía */}
                <div className="flex gap-4">
                  <div className={\`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center \${userData?.hasDownloadedGuide ? 'border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10' : 'border-outline-variant dark:border-[#2c3e50]/30'}\`}>
                    {userData?.hasDownloadedGuide && <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">check</span>}
                  </div>
                  <div>
                    <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Descarga de Guía</p>
                    <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Obtendrás tu dosier completo y personalizado con nuestro análisis y recomendaciones.</p>
                  </div>
                </div>

                {/* 4. Sesión de Validación */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 border-2 border-outline-variant dark:border-[#2c3e50]/30 rounded-md flex items-center justify-center"></div>
                  <div>
                    <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Sesión de Validación</p>
                    <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light mb-2">Resérvese un encuentro individual con un especialista para validar estos hallazgos.</p>
                    <button className="text-secondary dark:text-[#2c3e50] text-sm font-label font-bold underline">Agendar ahora</button>
                  </div>
                </div>

              </div>`;

const checklistNew = `<div className="space-y-6">
                
                {/* 1. Consulta Gratuita */}
                {activeNextStep === 'consulta' ? (
                  <div 
                    onClick={() => navigate("/session")}
                    className="flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 cursor-pointer transition-all group shadow-sm hover:shadow-md mb-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">Consulta Gratuita</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Su primer acercamiento con la herramienta ha sido completado. <span className="font-medium text-primary dark:text-[#2c3e50]">Realizar ahora</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className={\`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center \${hasConsultation ? 'border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10' : 'border-outline-variant dark:border-[#2c3e50]/30'}\`}>
                      {hasConsultation && <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">check</span>}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Consulta Gratuita</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Su primer acercamiento con la herramienta ha sido completado.</p>
                    </div>
                  </div>
                )}

                {/* 2. Cuestionario Espejo */}
                {activeNextStep === 'cuestionario' ? (
                  <div 
                    onClick={() => setIsNextStepsModalOpen(true)}
                    className="flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 cursor-pointer transition-all group shadow-sm hover:shadow-md mb-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">Cuestionario Espejo</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Profundice en las raíces de la niebla detectada con nuestro test avanzado. <span className="font-medium text-primary dark:text-[#2c3e50]">Solicitar ahora</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className={\`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center \${(questionnaireRequested || questionnaireCompleted) ? 'border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10' : 'border-outline-variant dark:border-[#2c3e50]/30'}\`}>
                      {(questionnaireRequested || questionnaireCompleted) && <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">check</span>}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Cuestionario Espejo</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Profundice en las raíces de la niebla detectada con nuestro test avanzado.</p>
                    </div>
                  </div>
                )}

                {/* 3. Dossier Espejo personalizado */}
                {activeNextStep === 'dossier' ? (
                  <div 
                    onClick={() => {
                        if (dossierAvailable) {
                            alert("El acceso al dossier se activará en la siguiente fase.");
                        }
                    }}
                    className={\`flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 transition-all group shadow-sm hover:shadow-md mb-2 \${dossierAvailable ? 'cursor-pointer' : 'cursor-default opacity-80'}\`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">Dossier Espejo personalizado</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Obtendrás tu dosier completo y personalizado con nuestro análisis y recomendaciones. <span className="font-medium text-primary dark:text-[#2c3e50]">{dossierAvailable ? 'Acceder ahora' : 'En preparación'}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className={\`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center \${dossierAvailable ? 'border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10' : 'border-outline-variant dark:border-[#2c3e50]/30'}\`}>
                      {dossierAvailable && <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">check</span>}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Dossier Espejo personalizado</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">Obtendrás tu dosier completo y personalizado con nuestro análisis y recomendaciones.</p>
                    </div>
                  </div>
                )}

                {/* 4. Sesión de Validación */}
                {activeNextStep === 'validacion' ? (
                  <div 
                    onClick={() => { alert("Esta funcionalidad estará disponible pronto."); }}
                    className="flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 cursor-pointer transition-all group shadow-sm hover:shadow-md mb-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">Sesión de Validación</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light mb-2">Resérvese un encuentro individual con un especialista para validar estos hallazgos. <span className="font-medium text-primary dark:text-[#2c3e50]">Agendar ahora</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className={\`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center \${(dossierViewed /* assuming validacion comes after dossierViewed */) ? 'border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10' : 'border-outline-variant dark:border-[#2c3e50]/30'}\`}>
                      {dossierViewed && <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">check</span>}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">Sesión de Validación</p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light mb-2">Resérvese un encuentro individual con un especialista para validar estos hallazgos.</p>
                    </div>
                  </div>
                )}

              </div>`;

content = content.replace(checklistOld, checklistNew);

fs.writeFileSync("src/pages/Report.tsx", content);
console.log("Updated report next steps");
