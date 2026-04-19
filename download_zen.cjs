const fs = require('fs');
const { execSync } = require('child_process');

// The google LH3 URL from earlier
const url = "https://lh3.googleusercontent.com/aida/ADBb0ug__gzFpMAP32jNUgacgTdng9Qh1YVlenLhh1vdJ4ioW346SlZokMGonAM1LIizE9xRg5GySe2CqTzSNGz0TaDwrNqlI8FRUMcg-NL7uOE9XXbCbhb4BtqvUPIhxNQSvV6OkB6fkGFo78MZiahX20UFkNeQwxHUHkwsgUf0bf07ewa8dEAed_yM4m1SuqlVvkTCIFq67epGOAsqbiiiKLON9P6v_3JAHt6ra4CE2KBHxL4eOpBMrgdd2-rq";
const dest = "public/zen-bg.jpg";

try {
    console.log("Downloading image...");
    execSync(`curl -sL "${url}" -o "${dest}"`);
    console.log("File downloaded. Size:", fs.statSync(dest).size, "bytes.");
} catch (e) {
    console.error("Failed:", e);
}
