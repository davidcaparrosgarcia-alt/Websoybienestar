import fs from "fs";

let content = fs.readFileSync("api/index.ts", "utf8");

const helpers = `
const ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePersonalAccessCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ACCESS_CODE_CHARS[Math.floor(Math.random() * ACCESS_CODE_CHARS.length)];
  }
  return code;
}

async function getOrCreatePersonalAccessCode(db: FirebaseFirestore.Firestore, uid: string, email: string, userData: any, profileData: any) {
  if (userData?.personalAccessCode || profileData?.personalAccessCode) {
    return userData?.personalAccessCode || profileData?.personalAccessCode;
  }

  const accessCodesRef = db.collection('accessCodes');
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generatePersonalAccessCode(6);
    const codeDocRef = accessCodesRef.doc(code);
    
    try {
      await db.runTransaction(async (t) => {
        const doc = await t.get(codeDocRef);
        if (doc.exists) {
          throw new Error("CodeExists");
        }
        
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        
        t.set(codeDocRef, {
          uid,
          email,
          createdAt: timestamp
        });
        
        t.set(db.collection('users').doc(uid), {
          personalAccessCode: code,
          personalAccessCodeCreatedAt: timestamp
        }, { merge: true });
        
        t.set(db.collection('userProfiles').doc(uid), {
          personalAccessCode: code,
          personalAccessCodeCreatedAt: timestamp
        }, { merge: true });
      });
      return code;
    } catch (e: any) {
      if (e.message !== "CodeExists") {
        console.error("Error creating personal access code", e);
        return null;
      }
    }
  }
  return null;
}
`;

content = content.replace("app.post(\"/api/request-questionnaire\", requireAuth, async (req, res) => {", helpers + "\napp.post(\"/api/request-questionnaire\", requireAuth, async (req, res) => {");

const oldPayloadLogics1 = `    requestStep = "build_payload";
    const payload = {
      id: requestId,
      source: "soybienestar",
      sourcePath: "/zen",
      soybienestarUid: uid,
      nombre: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      displayName: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      email,
      telefono,
      edad: edad || null,
      sexo: sexo || null,
      preferredChannels,
      hasDoneConsultation: userData.hasDoneConsultation || false,
      status: "pending",
      createdAt,
      createdAtIso,
      processedAt: null,
      linkedPatientId: null,
      notes: "Solicitud del Cuestionario Espejo desde SoyBienestar",
      soybienestarContext
    };`;

const newPayloadLogics1 = `    requestStep = "get_access_code";
    const personalAccessCode = await getOrCreatePersonalAccessCode(db, uid, email, userData, profileData);
    if (personalAccessCode) {
      soybienestarContext.personalAccessCodeProvided = true;
      soybienestarContext.personalAccessCodeLength = personalAccessCode.length;
    }

    requestStep = "build_payload";
    const payload: any = {
      id: requestId,
      source: "soybienestar",
      sourcePath: "/zen",
      soybienestarUid: uid,
      nombre: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      displayName: userData.displayName || authEmail?.split('@')[0] || "Usuario",
      email,
      telefono,
      edad: edad || null,
      sexo: sexo || null,
      preferredChannels,
      hasDoneConsultation: userData.hasDoneConsultation || false,
      status: "pending",
      createdAt,
      createdAtIso,
      processedAt: null,
      linkedPatientId: null,
      notes: "Solicitud del Cuestionario Espejo desde SoyBienestar",
      soybienestarContext
    };
    
    if (personalAccessCode) {
      payload.proposedAccessCode = personalAccessCode;
    }`;

content = content.replace(oldPayloadLogics1, newPayloadLogics1);

const oldUpdates = `    requestStep = "update_user_request_metadata";
    await docRef.update({
      questionnaireRequestStatus: "pending",
      lastQuestionnaireRequestAt: timestamp,
      lastQuestionnaireRequestId: requestId,
      lastQuestionnaireContactSnapshot: contactSnapshot
    });`;

const newUpdates = `    requestStep = "update_user_request_metadata";
    const updateData: any = {
      questionnaireRequestStatus: "pending",
      questionnaireStatus: "requested",
      questionnaireRequestedAt: timestamp,
      lastQuestionnaireRequestAt: timestamp,
      lastQuestionnaireRequestId: requestId,
      lastQuestionnaireContactSnapshot: contactSnapshot
    };
    
    if (personalAccessCode) {
      updateData.questionnaireAccessCodeSharedAt = timestamp;
      updateData.lastQuestionnaireProposedAccessCode = personalAccessCode;
    }
    
    if (userData.dossierAvailableAt !== undefined) updateData.dossierAvailableAt = userData.dossierAvailableAt;
    if (userData.dossierViewedAt !== undefined) updateData.dossierViewedAt = userData.dossierViewedAt;
    
    if (!userData.linkedQuestionnairePatientId) {
      updateData.linkedQuestionnairePatientId = null;
    }

    await docRef.update(updateData);
    
    await profileRef.update({
      questionnaireStatus: "requested",
      ...(personalAccessCode ? { 
        questionnaireAccessCodeSharedAt: timestamp,
        lastQuestionnaireProposedAccessCode: personalAccessCode
      } : {})
    });`;

content = content.replace(oldUpdates, newUpdates);

fs.writeFileSync("api/index.ts", content);
console.log("Updated api");
