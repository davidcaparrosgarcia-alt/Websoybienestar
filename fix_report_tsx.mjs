import fs from "fs";

let content = fs.readFileSync("src/pages/Report.tsx", "utf8");

const oldReportState = `  const [report, setReport] = useState<string | null>(null);`;
const newReportState = `  const [report, setReport] = useState<any>(null);`;
content = content.replace(oldReportState, newReportState);

const oldSetReport = `          if (profile.latestUserEmpatheticMessage) {
            setReport(profile.latestUserEmpatheticMessage);
          } else if (profile.latestClinicalConclusion) {
            setReport(profile.latestClinicalConclusion);
          } else {`;
const newSetReport = `          if (profile.latestVisibleOrientationReport) {
            setReport(profile.latestVisibleOrientationReport);
          } else if (profile.latestUserEmpatheticMessage) {
            setReport(profile.latestUserEmpatheticMessage);
          } else if (profile.latestClinicalConclusion) {
            setReport(profile.latestClinicalConclusion);
          } else {`;
content = content.replace(oldSetReport, newSetReport);

const oldReportData = `        if (reportData) {
          // Passed from SessionEnded -> Session
          setReport(reportData);
        } else if (user) {`;

const newReportData = `        if (reportData) {
          // Passed from SessionEnded -> Session
          if (reportData.visibleOrientationReport) {
            setReport(reportData.visibleOrientationReport);
          } else if (reportData.userEmpatheticMessage) {
            setReport(reportData.userEmpatheticMessage);
          } else {
            setReport(reportData);
          }
        } else if (user) {`;
content = content.replace(oldReportData, newReportData);

content = content.replace(`          reportExcerpt: (report || "").slice(0, 1200),`, `          reportExcerpt: (typeof report === 'string' ? report : JSON.stringify(report)).slice(0, 1200),`);


const oldClear = `    const cleanupPayload = {
      latestUserEmpatheticMessage: deleteField(),
      latestClinicalConclusion: deleteField(),
      globalUserSummary: deleteField(),`;
const newClear = `    const cleanupPayload = {
      latestVisibleOrientationReport: deleteField(),
      latestInternalTherapistReport: deleteField(),
      latestUserEmpatheticMessage: deleteField(),
      latestClinicalConclusion: deleteField(),
      latestReportFeedbackComment: deleteField(),
      globalUserSummary: deleteField(),`;
content = content.replace(oldClear, newClear);

const oldFeedbackGiven = `                {!feedbackGiven ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => handleFeedback(true)} className="px-5 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-label font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">thumb_up</span> Totalmente
                    </button>
                    <button onClick={() => handleFeedback(false)} className="px-5 py-2 rounded-full border border-on-surface-variant text-on-surface-variant hover:bg-on-surface-variant hover:text-white transition-colors text-sm font-label font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">thumb_down</span> No del todo
                    </button>
                  </div>
                ) : (
                  <div className="text-secondary font-bold text-sm bg-secondary/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Gracias por tu retroalimentación. {reportFeedback?.label === 'totalmente' ? 'Has indicado que el informe te representa.' : (reportFeedback?.label === 'no_del_todo' ? 'Has indicado que el informe no te representa del todo.' : '')}
                  </div>
                )}`;
const newFeedbackGiven = `                {!feedbackGiven ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => handleFeedback(true)} className="px-5 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-label font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">thumb_up</span> Totalmente
                      </button>
                      <button onClick={() => setReportFeedback(prev => ({ agrees: false, label: "no_del_todo", showCommentBox: true }) as any)} className="px-5 py-2 rounded-full border border-on-surface-variant text-on-surface-variant hover:bg-on-surface-variant hover:text-white transition-colors text-sm font-label font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">thumb_down</span> No del todo
                      </button>
                    </div>
                    {(reportFeedback as any)?.showCommentBox && (
                      <div className="mt-2 text-sm flex flex-col gap-2">
                         <p className="text-on-surface-variant font-medium">¿Qué parte no encaja o qué crees que falta?</p>
                         <textarea id="feedbackCommentBox" rows={2} className="w-full text-on-surface border border-outline-variant rounded-md p-2 bg-transparent focus:outline-none focus:border-primary"></textarea>
                         <button onClick={() => {
                           const comment = (document.getElementById("feedbackCommentBox") as HTMLTextAreaElement).value;
                           handleFeedback(false, comment);
                         }} className="self-end px-4 py-1 bg-primary text-on-primary rounded-full font-label font-bold text-xs hover:bg-primary-container hover:text-primary transition-colors">Guardar</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-secondary font-bold text-sm bg-secondary/10 px-4 py-2 rounded-[24px] flex flex-col gap-1 items-start">
                    <div className="flex gap-2 items-center">
                       <span className="material-symbols-outlined text-sm">check_circle</span>
                       {reportFeedback?.label === 'totalmente' ? 'Gracias. Esa validación nos ayuda a saber que esta primera lectura está bien orientada. El siguiente paso permitirá profundizar con más precisión.' : 'Gracias por indicarlo. Es importante que esta primera lectura se acerque lo máximo posible a tu vivencia.'}
                    </div>
                  </div>
                )}`;

content = content.replace(oldFeedbackGiven, newFeedbackGiven);

const oldHandleFeedback = `  const handleFeedback = async (agrees: boolean) => {
    const label = agrees ? "totalmente" : "no_del_todo";
    setReportFeedback({ agrees, label });
    setFeedbackGiven(true);

    if (!user) return;

    try {
      const feedbackPayload = {
        reportFeedback: {
          agrees,
          label,
          reportExcerpt: (typeof report === 'string' ? report : JSON.stringify(report)).slice(0, 1200),
          reportFeedbackAt: serverTimestamp()
        },
        latestReportFeedbackAgrees: agrees,
        latestReportFeedbackLabel: label,
        latestReportFeedbackAt: serverTimestamp()
      };`;

const newHandleFeedback = `  const handleFeedback = async (agrees: boolean, comment?: string) => {
    const label = agrees ? "totalmente" : "no_del_todo";
    setReportFeedback({ agrees, label } as any);
    setFeedbackGiven(true);

    if (!user) return;

    try {
      const feedbackPayload = {
        reportFeedback: {
          agrees,
          label,
          comment: comment || "",
          reportExcerpt: (typeof report === 'string' ? report : JSON.stringify(report)).slice(0, 1200),
          reportFeedbackAt: serverTimestamp()
        },
        latestReportFeedbackAgrees: agrees,
        latestReportFeedbackLabel: label,
        latestReportFeedbackComment: comment || "",
        latestReportFeedbackAt: serverTimestamp()
      };`;
content = content.replace(oldHandleFeedback, newHandleFeedback);


const reportDisplayOld = `            {/* Main AI Report Markdown Rendering */}
            <div className="md:col-span-12 bg-surface-container p-10 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 prose prose-slate max-w-none text-on-surface">
                <Markdown>{report || ""}</Markdown>
              </div>`;

const reportDisplayNew = `            {/* Main AI Report Markdown Rendering */}
            <div className="md:col-span-12 bg-surface-container p-10 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 prose prose-slate max-w-none text-on-surface">
                {typeof report === "string" ? (
                  <Markdown>{report}</Markdown>
                ) : (
                  <div className="space-y-6">
                    {(report as any)?.titulo && <h3 className="font-headline text-3xl font-bold text-primary mb-2">{(report as any).titulo}</h3>}
                    {(report as any)?.subtitulo && <p className="text-on-surface-variant italic mb-6">{(report as any).subtitulo}</p>}
                    
                    {(report as any)?.lo_que_parece_pesar_mas && (
                       <div className="mb-4 text-on-surface">
                         <h4 className="font-headline font-bold text-xl text-secondary mb-2">Lo que parece estar pesando más</h4>
                         <p className="leading-relaxed">{(report as any).lo_que_parece_pesar_mas}</p>
                       </div>
                    )}
                    
                    {(report as any)?.impacto_en_tu_dia_a_dia && (
                       <div className="mb-4 text-on-surface">
                         <h4 className="font-headline font-bold text-xl text-secondary mb-2">Cómo está tocando tu día a día</h4>
                         <p className="leading-relaxed">{(report as any).impacto_en_tu_dia_a_dia}</p>
                       </div>
                    )}
                    
                    {(report as any)?.lo_que_podria_necesitar_tu_momento_actual && (
                       <div className="mb-4 text-on-surface">
                         <h4 className="font-headline font-bold text-xl text-secondary mb-2">Lo que tu momento actual parece necesitar</h4>
                         <p className="leading-relaxed">{(report as any).lo_que_podria_necesitar_tu_momento_actual}</p>
                       </div>
                    )}
                    
                    {(report as any)?.lo_que_esta_conversacion_ha_permitido_ver && (
                       <div className="mb-4 text-on-surface">
                         <h4 className="font-headline font-bold text-xl text-secondary mb-2">Lo que ya hemos podido ordenar juntos</h4>
                         <p className="leading-relaxed">{(report as any).lo_que_esta_conversacion_ha_permitido_ver}</p>
                       </div>
                    )}
                    
                    {(report as any)?.siguiente_paso && (
                       <div className="mb-4 text-on-surface">
                         <h4 className="font-headline font-bold text-xl text-secondary mb-2">El siguiente paso, sin empezar desde cero</h4>
                         <p className="leading-relaxed">{(report as any).siguiente_paso}</p>
                       </div>
                    )}
                  </div>
                )}
              </div>`;

content = content.replace(reportDisplayOld, reportDisplayNew);

fs.writeFileSync("src/pages/Report.tsx", content);
console.log("Updated Report.tsx logic");
