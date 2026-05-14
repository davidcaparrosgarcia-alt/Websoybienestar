import * as fs from "fs";
import * as path from "path";

const files = [
  "Ansiedad.tsx", "Estres.tsx", "Insomnio.tsx", 
  "Procrastinacion.tsx", "RumiacionMental.tsx", "GestionEmocional.tsx"
];

for (const file of files) {
  const filePath = path.resolve("src/pages", file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf-8");

  // Fix the block:
  // return (
  //   <>
  //     <SEO ... />
  //     document.getElementById(scriptId)?.remove();
  //   };
  // }, []);
  
  // Actually, I can just replace `return (\n    <>\n      <SEO[\s\S]*?/>\n      document\.getElementById`
  // with `return () => {\n      document.getElementById`
  const regex1 = /return \(\n    <>\n      <SEO[\s\S]*?\/>\n      document\.getElementById/g;
  content = content.replace(regex1, "return () => {\n      document.getElementById");

  const regex2 = /return \(\n    <>\n\n      <SEO[\s\S]*?\/>\n      document\.getElementById/g;
  content = content.replace(regex2, "return () => {\n      document.getElementById");

  // Fix the bottom where we replaced `);` with `</>\n  );`
  // We actually replaced the LAST `);` in the file.
  if (content.endsWith("    </>\n  );")) {
     content = content.replace("    </>\n  );", ");");
  } else if (content.endsWith("    </>\n  );\n")) {
     content = content.replace("    </>\n  );\n", ");\n");
  } else {
     // general replace at the end
     const endIdx = content.lastIndexOf("    </>\n  );");
     if (endIdx !== -1) {
         content = content.substring(0, endIdx) + ");" + content.substring(endIdx + "    </>\n  );".length);
     }
  }

  // Also those files now miss their title/meta effect but that's fine since we are going to add <SEO> properly!
  // Wait, I ran insert_seo.ts which ADDED a NEW <SEO> inside the real return( !
  // Let me double check Ansiedad.tsx: did my second script insert <SEO> at the correct place?
  
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned up ${file}`);
}
