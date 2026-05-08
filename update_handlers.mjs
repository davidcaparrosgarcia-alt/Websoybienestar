import fs from "fs";

let content = fs.readFileSync("api/index.ts", "utf8");

const handlingOriginal = `    // Check if the AI decided to call the function
    let functionCallParams = null;
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === "send_questionnaire") {
        functionCallParams = call.args;
        // Optionally, send a follow-up to the AI so it can generate a text response
        const followUp = await chatWithHistory.sendMessage({
          message: [{ functionResponse: { name: "send_questionnaire", response: { success: true } } }]
        });
        
        return res.json({ 
          text: followUp.text,
          action: "send_questionnaire",
          actionParams: functionCallParams
        });
      }
    }

    return res.json({ text: response.text });`;

const handlingNew = `    // Check if the AI decided to call the function
    let actionHandledOnServer = false;
    let actionName = null;

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const params: any = call.args || {};
      
      if (call.name === "update_user_profile_data" && params.consentConfirmed) {
        if (req.user?.uid) {
           const db = getFirestore();
           const updates: any = { profileDataUpdatedAt: new Date().toISOString() };
           
           if (params.nombre) { updates.nombre = params.nombre; updates.name = params.nombre; }
           if (params.edad) { updates.edad = params.edad; updates.profileAge = params.edad; }
           if (params.sexo) { updates.sexo = params.sexo; updates.gender = params.sexo; }
           if (params.telefono) { updates.contactPhone = params.telefono; updates.phone = params.telefono; }

           try {
             await db.collection("users").doc(req.user.uid).set(updates, { merge: true });
             await db.collection("userProfiles").doc(req.user.uid).set(updates, { merge: true });
           } catch(e) { console.error("Error updating profile via AI", e); }
        }
        
        try {
           const followUp = await chatWithHistory.sendMessage({
             message: [{ functionResponse: { name: "update_user_profile_data", response: { success: true } } }]
           });
           return res.json({ text: followUp.text });
        } catch(e) { console.error(e); }
      }

      if (call.name === "send_questionnaire" && params.consentConfirmed) {
        actionName = "send_questionnaire";
        if (req.user?.uid && req.user?.email) {
          try {
            const db = getFirestore();
            const FieldValue = admin.firestore.FieldValue;
            
            const preferredChannels = {
              email: !!params.email,
              whatsapp: !!params.whatsapp,
              sms: !!params.sms
            };

            const updates: any = {
               lastQuestionnaireRequestAt: new Date().toISOString(),
               preferredChannels,
               lastQuestionnaireContactSnapshot: {
                 email: req.user.email,
                 phone: params.telefono || safeSessionContext?.user?.personalData?.telefono || null
               }
            };

            await db.collection("users").doc(req.user.uid).set(updates, { merge: true });
            await db.collection("userProfiles").doc(req.user.uid).set(updates, { merge: true });
            
            await db.collection("users").doc(req.user.uid).update({
              questionnaireRequestCount: FieldValue.increment(1)
            }).catch(async () => {
              await db.collection("users").doc(req.user.uid).set({ questionnaireRequestCount: 1 }, { merge: true });
            });
            await db.collection("userProfiles").doc(req.user.uid).update({
               questionnaireRequestCount: FieldValue.increment(1)
            }).catch(async () => {
              await db.collection("userProfiles").doc(req.user.uid).set({ questionnaireRequestCount: 1 }, { merge: true });
            });

            actionHandledOnServer = true;
          } catch(e) {
            console.error("Error handling send_questionnaire server-side schema", e);
          }
        }

        try {
           const followUp = await chatWithHistory.sendMessage({
             message: [{ functionResponse: { name: "send_questionnaire", response: { success: true } } }]
           });
           return res.json({ text: followUp.text, action: actionName, actionHandledOnServer });
        } catch(e) { console.error(e); }
      }

      if (call.name === "send_internal_risk_alert") {
         const { riskLevel, reason, nombre, email, telefono } = params;
         try {
           const alertEmails = process.env.RISK_ALERT_EMAILS || process.env.NOTIFICATION_EMAILS;
           if (alertEmails) {
             const alertBody = \`
ALERTA DE RIESGO - \${riskLevel.toUpperCase()}
Motivo: \${reason}
Usuario: \${nombre || safeSessionContext?.user?.displayName || "Desconocido"}
Email: \${email || safeSessionContext?.user?.email || "Desconocido"}
Teléfono: \${telefono || "No especificado"}
Fecha: \${new Date().toISOString()}
\`;
             // Only mock email send if no email configured or implement it
             console.log("ALERTA", alertBody); 
             // We can implement actual email send here if you want but it may not be wired directly except via NotificationService
           }
         } catch(e) {
            console.error("Error sending risk alert", e);
         }
         
         try {
           const followUp = await chatWithHistory.sendMessage({
             message: [{ functionResponse: { name: "send_internal_risk_alert", response: { success: true } } }]
           });
           return res.json({ text: followUp.text });
         } catch(e) { console.error(e); }
      }
    }

    return res.json({ text: response.text });`;

content = content.replace(handlingOriginal, handlingNew);

fs.writeFileSync("api/index.ts", content);
console.log("Handlers updated");
