import fs from "fs";

let content = fs.readFileSync("api/index.ts", "utf8");

const oldCode = `    copyIfPresent(profileData, 'emotionalSignals');
    copyIfPresent(profileData, 'reportFeedback');
    copyIfPresent(profileData, 'latestReportFeedbackAgrees');
    copyIfPresent(profileData, 'latestReportFeedbackLabel');
    copyIfPresent(profileData, 'latestReportFeedbackAt');`;

const newCode = `    copyIfPresent(profileData, 'emotionalSignals');
    copyIfPresent(profileData, 'reportFeedback');
    copyIfPresent(profileData, 'latestReportFeedbackAgrees');
    copyIfPresent(profileData, 'latestReportFeedbackLabel');
    copyIfPresent(profileData, 'latestReportFeedbackComment');
    copyIfPresent(profileData, 'latestReportFeedbackAt');
    copyIfPresent(profileData, 'latestVisibleOrientationReport');
    copyIfPresent(profileData, 'latestInternalTherapistReport');`;

content = content.replace(oldCode, newCode);

const oldCode2 = `    copyIfPresent(userData, 'latestReportFeedbackLabel');
    copyIfPresent(userData, 'latestReportFeedbackAt');`;
const newCode2 = `    copyIfPresent(userData, 'latestReportFeedbackLabel');
    copyIfPresent(userData, 'latestReportFeedbackComment');
    copyIfPresent(userData, 'latestReportFeedbackAt');
    copyIfPresent(userData, 'latestVisibleOrientationReport');
    copyIfPresent(userData, 'latestInternalTherapistReport');`;

content = content.replace(oldCode2, newCode2);

fs.writeFileSync("api/index.ts", content);
console.log("Updated API payload ctx");
