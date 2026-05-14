const fs = require('fs');

let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const imports = `import {
  ANSIEDAD_FAQS,
  ESTRES_FAQS,
  INSOMNIO_FAQS,
  PROCRASTINACION_FAQS,
  RUMIACION_FAQS,
  GESTION_EMOCIONAL_FAQS,
  ALIMENTACION_EMOCIONAL_FAQS,
} from "../data/symptomFaqs";`;
const lastImportIdx = homeContent.lastIndexOf('import ');
const insertionPoint = homeContent.indexOf('\n', lastImportIdx) + 1;
homeContent = homeContent.slice(0, insertionPoint) + imports + '\n' + homeContent.slice(insertionPoint);
fs.writeFileSync('src/pages/Home.tsx', homeContent);

const toUpdate = [
  { file: 'Ansiedad.tsx', name: 'ANSIEDAD_FAQS' },
  { file: 'Estres.tsx', name: 'ESTRES_FAQS' },
  { file: 'Insomnio.tsx', name: 'INSOMNIO_FAQS' },
  { file: 'Procrastinacion.tsx', name: 'PROCRASTINACION_FAQS' },
  { file: 'RumiacionMental.tsx', name: 'RUMIACION_FAQS' },
  { file: 'GestionEmocional.tsx', name: 'GESTION_EMOCIONAL_FAQS' },
  { file: 'AlimentacionEmocional.tsx', name: 'ALIMENTACION_EMOCIONAL_FAQS' },
];

for (const { file, name } of toUpdate) {
  let content = fs.readFileSync('src/pages/' + file, 'utf8');
  content = content.replace(new RegExp("import\\s*{\\s*" + name + "\\s*}\\s*from\\s*['\"]\\./Home['\"];?"), `import { ${name} } from "../data/symptomFaqs";`);
  fs.writeFileSync('src/pages/' + file, content);
}
