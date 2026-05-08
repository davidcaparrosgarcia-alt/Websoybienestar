import fs from "fs";

let content = fs.readFileSync("src/pages/Session.tsx", "utf8");

const oldCodeUser = `          const updateDataUser = {
            hasDoneConsultation: true,
            lastUpdated: new Date().toISOString()
          };`;
const newCodeUser = `          const updateDataUser = {
            hasDoneConsultation: true,
            lastUpdated: new Date().toISOString(),
            latestVisibleOrientationReport: parsedData.visibleOrientationReport || null,
            latestInternalTherapistReport: parsedData.internalTherapistReport || null
          };`;

content = content.replace(oldCodeUser, newCodeUser);

const oldCodeProfile = `          const updateDataProfile = {
            globalUserSummary: parsedData.newAccumulatedSummary || accumulatedSummary,
            consultationConclusion: parsedData.clinicalSummary || "Resumen clínico generado (bypass de desarrollo)",
            latestUserEmpatheticMessage: parsedData.userEmpatheticMessage || "Mensaje para el usuario",
          };`;

const newCodeProfile = `          const updateDataProfile = {
            globalUserSummary: parsedData.newAccumulatedSummary || accumulatedSummary,
            consultationConclusion: parsedData.clinicalSummary || "Resumen clínico generado (bypass de desarrollo)",
            latestUserEmpatheticMessage: parsedData.userEmpatheticMessage || "Mensaje para el usuario",
            latestClinicalConclusion: parsedData.clinicalSummary || "",
            latestVisibleOrientationReport: parsedData.visibleOrientationReport || null,
            latestInternalTherapistReport: parsedData.internalTherapistReport || null
          };`;

content = content.replace(oldCodeProfile, newCodeProfile);

fs.writeFileSync("src/pages/Session.tsx", content);
console.log("Updated Session.tsx to save new report format");
