import fs from 'fs';

let content = fs.readFileSync('api/index.ts', 'utf8');

const targetStr = `    copyIfPresent(userData, 'hasDoneConsultation');
    copyIfPresent(userData, 'processStage');
    copyIfPresent(profileData, 'globalUserSummary');
    copyIfPresent(profileData, 'accumulatedSummary');
    copyIfPresent(profileData, 'latestClinicalConclusion');
    copyIfPresent(profileData, 'consultationSummary');
    copyIfPresent(profileData, 'consultationConclusion');
    copyIfPresent(profileData, 'diaryProfile');
    copyIfPresent(profileData, 'weeklyGoalsSummary');
    copyIfPresent(profileData, 'gratitudeDiarySummary');
    copyIfPresent(profileData, 'mainThemes');
    copyIfPresent(profileData, 'emotionalSignals');`;

const newStr = `    copyIfPresent(userData, 'hasDoneConsultation');
    copyIfPresent(userData, 'processStage');
    copyIfPresent(userData, 'reportFeedback');
    copyIfPresent(userData, 'latestReportFeedbackAgrees');
    copyIfPresent(userData, 'latestReportFeedbackLabel');
    copyIfPresent(userData, 'latestReportFeedbackAt');
    copyIfPresent(profileData, 'globalUserSummary');
    copyIfPresent(profileData, 'accumulatedSummary');
    copyIfPresent(profileData, 'latestClinicalConclusion');
    copyIfPresent(profileData, 'consultationSummary');
    copyIfPresent(profileData, 'consultationConclusion');
    copyIfPresent(profileData, 'diaryProfile');
    copyIfPresent(profileData, 'weeklyGoalsSummary');
    copyIfPresent(profileData, 'gratitudeDiarySummary');
    copyIfPresent(profileData, 'mainThemes');
    copyIfPresent(profileData, 'emotionalSignals');
    copyIfPresent(profileData, 'reportFeedback');
    copyIfPresent(profileData, 'latestReportFeedbackAgrees');
    copyIfPresent(profileData, 'latestReportFeedbackLabel');
    copyIfPresent(profileData, 'latestReportFeedbackAt');`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('api/index.ts', content);
console.log('SUCCESS');
