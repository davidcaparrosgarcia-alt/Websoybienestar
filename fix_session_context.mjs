import fs from "fs";

let content = fs.readFileSync("src/pages/Session.tsx", "utf8");

const statesOriginal = `  const [urgentMessage, setUrgentMessage] = useState<string | null>(null);`;
const statesNew = `  const [urgentMessage, setUrgentMessage] = useState<string | null>(null);
  const [sessionUserContext, setSessionUserContext] = useState<any>(null);`;
content = content.replace(statesOriginal, statesNew);

const checkAuthOriginal = `        try {
          const { userRef } = await getOrMigrateUserProfile(user.uid);
          const { getDoc } = await import("firebase/firestore");
          const userDoc = await getDoc(userRef);
          if (isMounted) {
            const isTestUser = user.email === "davidcaparrosgarcia@gmail.com";
            setHasDoneConsultation(isTestUser ? false : !!userDoc.data()?.hasDoneConsultation);
          }
        } catch (e) {`;

const checkAuthNew = `        try {
          const { userRef, profileRef } = await getOrMigrateUserProfile(user.uid);
          const { getDoc } = await import("firebase/firestore");
          const [userDoc, profileDoc] = await Promise.all([
            getDoc(userRef),
            getDoc(profileRef)
          ]);
          if (isMounted) {
            const isTestUser = user.email === "davidcaparrosgarcia@gmail.com";
            const userData = userDoc.data() || {};
            const profileData = profileDoc.data() || {};
            
            setHasDoneConsultation(isTestUser ? false : !!userData.hasDoneConsultation);
            
            const estadoCuestionarioEspejo = (() => {
              if (userData.questionnaireCompleted || profileData.questionnaireCompleted) return "cuestionario_completado";
              if (userData.questionnaireSent || profileData.questionnaireSent) return "cuestionario_enviado";
              if (userData.lastQuestionnaireRequestAt || profileData.lastQuestionnaireRequestAt) return "cuestionario_solicitado_confirmado";
              if (userData.lastQuestionnaireRequestAttemptAt || profileData.lastQuestionnaireRequestAttemptAt) return "cuestionario_solicitud_intentada_no_confirmada";
              return "cuestionario_no_solicitado";
            })();

            setSessionUserContext({
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || userData.displayName || profileData.displayName || "",
              hasDoneConsultation: !!userData.hasDoneConsultation,
              personalData: {
                nombre: userData.nombre || profileData.nombre || userData.name || profileData.name || "",
                edad: userData.edad || profileData.edad || userData.profileAge || profileData.profileAge || "",
                sexo: userData.sexo || profileData.sexo || userData.gender || profileData.gender || "",
                telefono: userData.contactPhone || profileData.contactPhone || userData.phone || profileData.phone || ""
              },
              questionnaire: {
                estadoCuestionarioEspejo,
                lastQuestionnaireRequestAt: userData.lastQuestionnaireRequestAt || profileData.lastQuestionnaireRequestAt || null,
                questionnaireRequestCount: userData.questionnaireRequestCount || profileData.questionnaireRequestCount || 0,
                preferredChannels: userData.preferredChannels || profileData.preferredChannels || null,
                lastQuestionnaireContactSnapshot: userData.lastQuestionnaireContactSnapshot || profileData.lastQuestionnaireContactSnapshot || null
              },
              resources: {
                gratitudeEntriesCount: userData.gratitudeEntriesCount || profileData.gratitudeEntriesCount || 0,
                lastGratitudeDate: userData.lastGratitudeDate || profileData.lastGratitudeDate || null,
                meditationsCompletedCount: userData.meditationsCompletedCount || profileData.meditationsCompletedCount || 0,
                lastMeditationId: userData.lastMeditationId || profileData.lastMeditationId || null,
                breathingExercisesCount: userData.breathingExercisesCount || profileData.breathingExercisesCount || 0,
                weeklyGoalsCount: userData.weeklyGoalsCount || profileData.weeklyGoalsCount || 0,
                hasWeeklyGoalsBoard: !!userData.hasWeeklyGoalsBoard || !!profileData.hasWeeklyGoalsBoard
              }
            });
            
            // Saludo dinamico
            const nombreSaludo = userData.nombre || profileData.nombre || userData.name || profileData.name;
            if (nombreSaludo) {
              setMessages(prev => {
                if (prev.length === 1 && prev[0].id === "1") {
                  return [{
                    id: "1",
                    role: "assistant",
                    content: \`Hola, \${nombreSaludo}. Me alegra que hayas llegado hasta aquí. Este es un espacio de primera escucha: puedes contarme con calma qué te preocupa o qué te gustaría ordenar, sin necesidad de explicarlo perfecto.\\n\\nNo voy a juzgarte ni a ponerte etiquetas. Mi papel es ayudarte a dar forma a lo que estás viviendo para que después el equipo humano pueda acompañarte mejor.\\n\\nPara empezar, cuéntame solo lo más importante: ¿qué te ha traído hoy hasta aquí?\`
                  }];
                }
                return prev;
              });
            } else {
              setMessages(prev => {
                if (prev.length === 1 && prev[0].id === "1") {
                  return [{
                    id: "1",
                    role: "assistant",
                    content: "Hola. Me alegra que hayas llegado hasta aquí. Este es un espacio de primera escucha: puedes contarme con calma qué te preocupa o qué te gustaría ordenar, sin necesidad de explicarlo perfecto.\\n\\nNo voy a juzgarte ni a ponerte etiquetas. Mi papel es ayudarte a dar forma a lo que estás viviendo para que después el equipo humano pueda acompañarte mejor.\\n\\nPara empezar, cuéntame solo lo más importante: ¿qué te ha traído hoy hasta aquí?"
                  }];
                }
                return prev;
              });
            }
          }
        } catch (e) {`;

content = content.replace(checkAuthOriginal, checkAuthNew);

fs.writeFileSync("src/pages/Session.tsx", content);
console.log("sessionUserContext updated");
