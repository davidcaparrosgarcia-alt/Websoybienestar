const fs = require("fs");
const path = require("path");

const componentsWithSubreturns = [
  "Session.tsx", "Login.tsx", "Report.tsx", "DossierEspejo.tsx", "SesionValidacion.tsx", "EmotionDiary.tsx", "WeeklyGoals.tsx", "AnxietyManagement.tsx"
];

for (const file of componentsWithSubreturns) {
  const filePath = path.resolve("src/pages", file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf8");

  // If there's an existing <SEO ... /> we need to extract it to `const seo = (<SEO.../>);`
  const seoMatch = content.match(/<SEO[\s\S]*?\/>/);
  if (!seoMatch) continue;

  const seoStr = seoMatch[0];

  // We are going to:
  // 1. Find the main component function definition to inject `const seo = (...)` right inside
  // 2. Replace all `return (` with:
  //    return (
  //      <>
  //        {seo}

  // To prevent multiple replacements if it already has {seo}, we check first
  if (content.includes("const seo = (")) {
    console.log(`Skipping ${file} - seo const already exists`);
    continue;
  }

  const lines = content.split('\n');
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

  content = lines.join('\n');
  
  // Strip ALL original <SEO/> first
  content = content.replace(/<SEO[\s\S]*?\/>/g, '{seo}');
  
  // The problem is that returns might NOT be wrapped in `<>`!
  // To be safe, any `return (...);` that isn't `return null;` or simple types might need `<></>`
  // Or simpler: We know the original code had `return (`. 
  // Let's replace:
  // return (
  //   <div
  // with
  // return (
  //   <>
  //     {seo}
  //     <div
  
  // Wait, I can just replace `return \(\n\s*<[A-Za-z]+([^\)]+)\);` but there can be nested elements.
  // Actually, we can use Babel or TS compiler... or I can just carefully replace `return \(` inside the component
  // Or since I only need to patch specific files, we can just look for `return (` and `)` manually but Regex might be hard.
  // Instead: `content = content.replace(/return \(\s*<((?!>)(?!\{seo\})[a-zA-Z]+)/g, 'return (\n    <>\n      {seo}\n      <$1');`
  
}
