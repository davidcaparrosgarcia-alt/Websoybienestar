import fs from 'fs';

let content = fs.readFileSync('src/pages/Report.tsx', 'utf8');

// 1. Inputs
content = content.replace(
  'import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";',
  'import { doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteField } from "firebase/firestore";'
);

// 2. State reportFeedback
const feedbackStateOld = `  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);

  const handleFeedback = (agrees: boolean) => {
    setFeedbackGiven(true);
    // You could also save this feedback to Firebase here if needed
  };`;

const feedbackStateNew = `  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [reportFeedback, setReportFeedback] = useState<{ agrees: boolean; label: "totalmente" | "no_del_todo" } | null>(null);

  const handleFeedback = async (agrees: boolean) => {
    const label = agrees ? "totalmente" : "no_del_todo";
    setReportFeedback({ agrees, label });
    setFeedbackGiven(true);

    if (!user) return;

    try {
      const feedbackPayload = {
        reportFeedback: {
          agrees,
          label,
          reportExcerpt: (report || "").slice(0, 1200),
          reportFeedbackAt: serverTimestamp()
        },
        latestReportFeedbackAgrees: agrees,
        latestReportFeedbackLabel: label,
        latestReportFeedbackAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), feedbackPayload, { merge: true });
      await setDoc(doc(db, "userProfiles", user.uid), feedbackPayload, { merge: true });
    } catch (error) {
      console.error("Error saving report feedback:", error);
    }
  };

  const handleClearTesterReport = async () => {
    if (user?.email !== "davidcaparrosgarcia@gmail.com") return;
    const confirmed = window.confirm("Esto limpiará solo el informe y feedback de prueba para repetir la consulta. ¿Continuar?");
    if (!confirmed) return;

    const cleanupPayload = {
      latestUserEmpatheticMessage: deleteField(),
      latestClinicalConclusion: deleteField(),
      globalUserSummary: deleteField(),
      latestReportFeedbackAgrees: deleteField(),
      latestReportFeedbackLabel: deleteField(),
      latestReportFeedbackAt: deleteField(),
      reportFeedback: deleteField(),
      hasDoneConsultation: deleteField()
    };

    await updateDoc(doc(db, "users", user.uid), cleanupPayload).catch(() => {});
    await updateDoc(doc(db, "userProfiles", user.uid), cleanupPayload).catch(() => {});

    navigate("/session");
  };`;

content = content.replace(feedbackStateOld, feedbackStateNew);


// 3. Modifying loadReportData to load feedback
const loadReportDataOld = `        if (reportData) {
          // Passed from SessionEnded -> Session
          setReport(reportData);
        } else if (user) {
          // Try loading from Firebase
          const { profileData } = await getOrMigrateUserProfile(user.uid);
          const profile = profileData as any;
          if (profile.latestUserEmpatheticMessage) {
            setReport(profile.latestUserEmpatheticMessage);
          } else if (profile.latestClinicalConclusion) {
            setReport(profile.latestClinicalConclusion);
          } else {`;
const loadReportDataNew = `        if (reportData) {
          // Passed from SessionEnded -> Session
          setReport(reportData);
        } else if (user) {
          // Try loading from Firebase
          const { profileData } = await getOrMigrateUserProfile(user.uid);
          const profile = profileData as any;
          
          if (profile.reportFeedback) {
             setReportFeedback({
               agrees: profile.reportFeedback.agrees,
               label: profile.reportFeedback.label
             });
             setFeedbackGiven(true);
          } else if (profile.latestReportFeedbackLabel) {
             setReportFeedback({
               agrees: profile.latestReportFeedbackAgrees,
               label: profile.latestReportFeedbackLabel
             });
             setFeedbackGiven(true);
          }

          if (profile.latestUserEmpatheticMessage) {
            setReport(profile.latestUserEmpatheticMessage);
          } else if (profile.latestClinicalConclusion) {
            setReport(profile.latestClinicalConclusion);
          } else {`;

content = content.replace(loadReportDataOld, loadReportDataNew);

// 4. Modifying UI feedback rendering
const feedbackUiOld = `                ) : (
                  <div className="text-secondary font-bold text-sm bg-secondary/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Gracias por tu retroalimentación
                  </div>
                )}
              </div>
            </div>`;
const feedbackUiNew = `                ) : (
                  <div className="text-secondary font-bold text-sm bg-secondary/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Gracias por tu retroalimentación. {reportFeedback?.label === 'totalmente' ? 'Has indicado que el informe te representa.' : (reportFeedback?.label === 'no_del_todo' ? 'Has indicado que el informe no te representa del todo.' : '')}
                  </div>
                )}
              </div>
              {user?.email === "davidcaparrosgarcia@gmail.com" && (
                <button onClick={handleClearTesterReport} className="absolute top-4 right-4 bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold hover:bg-error/20 transition-all z-20">
                  Limpiar informe de prueba
                </button>
              )}
            </div>`;
content = content.replace(feedbackUiOld, feedbackUiNew);

// 5. Change card rounded
content = content.replace(
  '<div className="md:col-span-6 bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 group">',
  '<div className="md:col-span-6 bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 group">'
);


fs.writeFileSync('src/pages/Report.tsx', content);
console.log('SUCCESS');
