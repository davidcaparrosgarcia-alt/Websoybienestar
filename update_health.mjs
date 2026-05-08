import fs from "fs";

let content = fs.readFileSync("api/index.ts", "utf8");

const healthOriginal = `app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    aiAvailable: !!ai,
    authAvailable: !!admin.apps.length,`;

const healthNew = `app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    aiAvailable: !!ai,
    authAvailable: !!admin.apps.length,
    riskAlertEmailsConfigured: !!process.env.RISK_ALERT_EMAILS || !!process.env.NOTIFICATION_EMAILS,`;

content = content.replace(healthOriginal, healthNew);

fs.writeFileSync("api/index.ts", content);
console.log("Health updated");
