import fs from "fs";

let content = fs.readFileSync("src/pages/Session.tsx", "utf8");

const sessionReplyOriginal = `      const response = await api.sessionReply(chatHistory.slice(0, -1), inputContent);`;

const sessionReplyNew = `      const getSessionPhase = () => {
        if (timeLeft > 10 * 60) return "inicio";
        if (timeLeft > 4 * 60) return "desarrollo";
        return "cierre";
      };

      const buildSessionContextForAI = () => ({
        time: {
          timeLeftSeconds: timeLeft,
          elapsedSeconds: 15 * 60 - timeLeft,
          sessionPhase: getSessionPhase(),
          hasTimerStarted: hasStartedGuidedSession
        },
        user: sessionUserContext || null
      });

      const response = await api.sessionReply(
        chatHistory.slice(0, -1),
        inputContent,
        buildSessionContextForAI()
      );`;

content = content.replace(sessionReplyOriginal, sessionReplyNew);

// Double send prevention
const responseActionOriginal = `      // Handle actions
      if (response.action === "send_questionnaire") {
        setUrgentMessage("Enviando cuestionario a tu correo...");`;

const responseActionNew = `      // Handle actions
      if (response.action === "send_questionnaire") {
        if (response.actionHandledOnServer) {
          setUrgentMessage("Tu solicitud ha sido procesada. Recibirás el cuestionario en breve.");
        } else {
          setUrgentMessage("Enviando cuestionario a tu correo...");`;

content = content.replace(responseActionOriginal, responseActionNew);

const afterWaitOriginal = `          await new Promise(r => setTimeout(r, 2000));
          setUrgentMessage(null);
        } catch (e) {`;

const afterWaitNew = `          await new Promise(r => setTimeout(r, 2000));
          setUrgentMessage(null);
        } catch (e) {`;

const ifActionOriginal = `        try {
          await api.requestQuestionnaire();
          await new Promise(r => setTimeout(r, 2000));
          setUrgentMessage(null);
        } catch (e) {
          console.error("Failed to send questionnaire", e);
          setUrgentMessage("Hubo un problema al enviar el cuestionario. Por favor, inténtalo de nuevo.");
          setTimeout(() => setUrgentMessage(null), 3000);
        }
      }`;

const ifActionNew = `        if (!response.actionHandledOnServer) {
          try {
            await api.requestQuestionnaire();
            await new Promise(r => setTimeout(r, 2000));
            setUrgentMessage(null);
          } catch (e) {
            console.error("Failed to send questionnaire", e);
            setUrgentMessage("Hubo un problema al enviar el cuestionario. Por favor, inténtalo de nuevo.");
            setTimeout(() => setUrgentMessage(null), 3000);
          }
        } else {
            await new Promise(r => setTimeout(r, 2000));
            setUrgentMessage(null);
        }
      }`;

content = content.replace(ifActionOriginal, ifActionNew);

fs.writeFileSync("src/pages/Session.tsx", content);
console.log("Updated sessionReply payload and action handler");
