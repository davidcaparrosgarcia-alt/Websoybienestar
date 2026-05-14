import * as fs from 'fs';
import * as path from 'path';

const files = [
  "Session.tsx", "Login.tsx", "SessionEnded.tsx", "Report.tsx", 
  "DossierEspejo.tsx", "SesionValidacion.tsx", "EmotionDiary.tsx", 
  "WeeklyGoals.tsx", "AnxietyManagement.tsx"
];

for (const file of files) {
  const filePath = path.resolve("src/pages", file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf8");

  // Extract <SEO /> tag
  const seoMatch = content.match(/<SEO[\s\S]*?\/>/);
  if (!seoMatch) continue;

  if (content.includes('const seo = (')) {
     console.log('Skipping ' + file + ' as it already has seo const');
     continue;
  }

  let seoStr = seoMatch[0];
  // Remove all explicit <SEO ... />
  let newContent = content.replace(/<SEO[\s\S]*?\/>/g, '');

  const lines = newContent.split('\n');
  const compRegex = new RegExp(`export default function [A-Za-z0-9_]+`);
  let compLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (compRegex.test(lines[i])) {
      compLine = i;
      break;
    }
  }

  if (compLine !== -1) {
     lines[compLine] = lines[compLine] + `\n  const seo = (\n    ${seoStr.replace(/\n\s*/g, ' ')}\n  );\n`;
  }

  newContent = lines.join('\n');

  // Find all block returns (e.g., `return (\n    <div ...`) and wrap them.
  // We'll split the content by `return (` and see if the block looks like a view block.
  // Actually, we can use an AST or a very targeted regex:
  // We look for: return (\n  <div
  // And replace it, but we also need to close it with `</>\n  );`
  // An easier way: Use babel standalone or typescript compiler. This environment has TypeScript!
  
}
