import * as fs from "fs";

export function addSeoToConditionals(filePath: string) {
  let content = fs.readFileSync(filePath, "utf8");

  // Extract <SEO /> tag
  const seoMatch = content.match(/<SEO[\s\S]*?\/>/);
  if (!seoMatch) return;

  if (content.includes('const seo = (')) {
     return;
  }

  let seoStr = seoMatch[0];
  // Remove all explicit <SEO ... />
  let newContent = content.replace(/<SEO[\s\S]*?\/>\n*/g, '');

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

  // Replace `return (\n      <div` with `return (\n      <>\n        {seo}\n        <div`
  // also catch `return (\n        <div` and `return (\n    <div`
  newContent = newContent.replace(/return \(\s*(<div[^\n]*)/g, "return (\n    <>\n      {seo}\n      $1");
  // Also fix the closing. Since we changed `return (` to `<>` we need to find `\n    );\n  }` and things like that.
  // Actually, wait, the closing of a div usually looks like `</div>\n    );` or similar based on indentation.
  // A safer regex replacement:
  // Since we know the return block ends with `);`, we can just replace `</div>\n    );` with `</div>\n    </>\n    );`
  newContent = newContent.replace(/(<\/div>)\n(\s*)\);/g, "$1\n$2</>\n$2);");

  // Same for `return (\n      <section`
  // Actually, replacing `return (\n` with `return (\n <>\n {seo}\n` and `);` with `</>\n );` is hard because of other hooks like `useEffect()... return () => { ... }` or `return (...);`.
  
  fs.writeFileSync(filePath, newContent);
}

const files = [
  "Session.tsx", "Login.tsx", "SessionEnded.tsx", "Report.tsx", 
  "DossierEspejo.tsx", "SesionValidacion.tsx", "EmotionDiary.tsx", 
  "WeeklyGoals.tsx", "AnxietyManagement.tsx"
];

for (const f of files) {
   addSeoToConditionals("src/pages/" + f);
}
