import * as fs from "fs";
import * as path from "path";

const seoData: Record<string, any> = {
  "Ansiedad.tsx": { title: "Ansiedad: síntomas, causas y cómo recuperar la calma | SoyBienestar", description: "Descubre cómo controlar la ansiedad, cuáles son sus síntomas, qué hacer cuando aparece y cuándo puede ayudarte una orientación online inicial.", canonicalPath: "/ansiedad", noIndex: false },
  "Estres.tsx": { title: "Estrés y agotamiento mental: síntomas y cómo aliviarlo | SoyBienestar", description: "Aprende a reconocer el estrés, el agotamiento mental y la ansiedad en el trabajo, y descubre recursos para recuperar calma y claridad.", canonicalPath: "/estres", noIndex: false },
  "Insomnio.tsx": { title: "Insomnio: causas y qué hacer cuando no puedes dormir | SoyBienestar", description: "Descubre por qué no puedes dormir, cómo combatir el insomnio, cómo dormir con ansiedad y qué recursos pueden ayudarte a descansar mejor.", canonicalPath: "/insomnio", noIndex: false },
  "Procrastinacion.tsx": { title: "Procrastinación: por qué procrastinas y cómo dejarlo | SoyBienestar", description: "Aprende cómo dejar de procrastinar, por qué pospones tareas y qué relación puede tener la procrastinación con ansiedad, bloqueo o perfeccionismo.", canonicalPath: "/procrastinacion", noIndex: false },
  "RumiacionMental.tsx": { title: "Rumiación mental: cómo dejar de pensar tanto | SoyBienestar", description: "Si no puedes dejar de pensar o darle vueltas a todo, descubre qué es la rumiación mental y cómo empezar a calmar el bucle de pensamientos.", canonicalPath: "/pensar-demasiado-rumiacion", noIndex: false },
  "GestionEmocional.tsx": { title: "Gestión emocional: cómo controlar y regular tus emociones | SoyBienestar", description: "Aprende a comprender, regular y acompañar tus emociones sin reprimirlas, con recursos de bienestar emocional y orientación online inicial.", canonicalPath: "/gestion-emocional", noIndex: false },
  "Privacy.tsx": { title: "Política de privacidad | SoyBienestar", description: "Consulta cómo SoyBienestar.es trata y protege tus datos personales dentro de sus servicios digitales de bienestar emocional.", canonicalPath: "/privacy", noIndex: false },
  "Terms.tsx": { title: "Aviso legal y términos de uso | SoyBienestar", description: "Consulta los términos de uso, condiciones legales y responsabilidades asociadas al uso de SoyBienestar.es.", canonicalPath: "/terms", noIndex: false },
  "Cookies.tsx": { title: "Política de cookies | SoyBienestar", description: "Consulta la política de cookies de SoyBienestar.es y cómo se utilizan en la experiencia de navegación.", canonicalPath: "/cookies", noIndex: false },
  "AnxietyManagement.tsx": { title: "Válvula de presión interna | SoyBienestar", description: "Herramienta interactiva de SoyBienestar.es para explorar señales de presión emocional y ansiedad.", canonicalPath: "/anxiety", noIndex: true },
  "Session.tsx": { title: "Consulta inicial online | SoyBienestar", description: "Espacio privado de consulta inicial online para ordenar tu situación emocional dentro de SoyBienestar.es.", canonicalPath: "/session", noIndex: true },
  "SessionEnded.tsx": { title: "Consulta finalizada | SoyBienestar", description: "Pantalla privada de cierre de consulta inicial en SoyBienestar.es.", canonicalPath: "/session-ended", noIndex: true },
  "Report.tsx": { title: "Tu primera lectura de claridad | SoyBienestar", description: "Informe privado generado tras la consulta inicial de SoyBienestar.es.", canonicalPath: "/report", noIndex: true },
  "DossierEspejo.tsx": { title: "Dossier Espejo personalizado | SoyBienestar", description: "Acceso privado al Dossier Espejo personalizado de SoyBienestar.es.", canonicalPath: "/dossier-espejo", noIndex: true },
  "SesionValidacion.tsx": { title: "Sesión de validación | SoyBienestar", description: "Página privada para continuar el proceso de acompañamiento en SoyBienestar.es.", canonicalPath: "/sesion-validacion", noIndex: true },
  "EmotionDiary.tsx": { title: "Diario emocional privado | SoyBienestar", description: "Herramienta privada de diario emocional dentro de SoyBienestar.es.", canonicalPath: "/emotion-diary", noIndex: true },
  "WeeklyGoals.tsx": { title: "Propósitos semanales privados | SoyBienestar", description: "Herramienta privada para organizar propósitos semanales dentro de SoyBienestar.es.", canonicalPath: "/weekly-goals", noIndex: true },
  "Login.tsx": { title: "Acceso privado | SoyBienestar", description: "Página de acceso privado a SoyBienestar.es.", canonicalPath: "/login", noIndex: true }
};

for (const [file, seo] of Object.entries(seoData)) {
  const filePath = path.resolve("src/pages", file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf-8");

  if (content.includes("<SEO")) {
    console.log(`Skipping ${file} - SEO already added`);
    continue;
  }

  // Find the exact line index for `return (` inside the default export component
  const lines = content.split("\n");
  const compRegex = new RegExp(`export default function ${file.replace('.tsx', '')}`);
  
  let compStarted = false;
  let returnLineIndex = -1;
  let foundSEO = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/export default function/)) compStarted = true;
    if (compStarted && lines[i].trim().startsWith("return (")) {
      returnLineIndex = i;
      break;
    }
  }

  if (returnLineIndex !== -1) {
    const seoTag = [
      `      <SEO`,
      `        title="${seo.title}"`,
      `        description="${seo.description}"`,
      `        canonicalPath="${seo.canonicalPath}"`,
      `        noIndex={${seo.noIndex}}`,
      `      />`
    ].join('\n');
    
    // Check if we need <>
    lines[returnLineIndex] = `  return (\n    <>\n${seoTag}`;
    
    // Find the last ); to close </>
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === ");") {
        lines[i] = "    </>\n  );";
        break;
      }
    }
  }

  // Remove the old useEffect for title
  content = lines.join("\n");
  
  // also add importing
  if (!content.includes('import SEO from "../components/SEO";')) {
    const importLines = content.split('\n').filter(l => l.startsWith('import '));
    if (importLines.length > 0) {
      const lastImport = importLines[importLines.length - 1];
      content = content.replace(lastImport, lastImport + '\nimport SEO from "../components/SEO";');
    } else {
      content = 'import SEO from "../components/SEO";\n' + content;
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Successfully added SEO to ${file}`);
}
