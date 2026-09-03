import {readFile, writeFile, mkdir} from "node:fs/promises";
import path from "node:path";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {MemoryRouter} from "react-router-dom";
import Ansiedad from "../src/pages/Ansiedad";
import Estres from "../src/pages/Estres";
import Insomnio from "../src/pages/Insomnio";
import Procrastinacion from "../src/pages/Procrastinacion";
import RumiacionMental from "../src/pages/RumiacionMental";
import GestionEmocional from "../src/pages/GestionEmocional";
import AlimentacionEmocional from "../src/pages/AlimentacionEmocional";
import {
  ALIMENTACION_EMOCIONAL_FAQS,
  ANSIEDAD_FAQS,
  ESTRES_FAQS,
  GESTION_EMOCIONAL_FAQS,
  INSOMNIO_FAQS,
  PROCRASTINACION_FAQS,
  RUMIACION_FAQS,
} from "../src/data/symptomFaqs";
import {
  FAQ_SEO,
  buildBreadcrumbSchema,
  buildFaqSchema,
  type FaqSeoConfig,
} from "../src/data/faqSeo";

type FaqEntry = {question: string; answer: string};
type PrerenderEntry = {
  route: string;
  component: React.ComponentType;
  config: FaqSeoConfig;
  faqs: ReadonlyArray<FaqEntry>;
};

const entries: ReadonlyArray<PrerenderEntry> = [
  {route: "ansiedad", component: Ansiedad, config: FAQ_SEO.ansiedad, faqs: ANSIEDAD_FAQS},
  {route: "estres", component: Estres, config: FAQ_SEO.estres, faqs: ESTRES_FAQS},
  {route: "insomnio", component: Insomnio, config: FAQ_SEO.insomnio, faqs: INSOMNIO_FAQS},
  {route: "procrastinacion", component: Procrastinacion, config: FAQ_SEO.procrastinacion, faqs: PROCRASTINACION_FAQS},
  {route: "pensar-demasiado-rumiacion", component: RumiacionMental, config: FAQ_SEO.rumiacion, faqs: RUMIACION_FAQS},
  {route: "gestion-emocional", component: GestionEmocional, config: FAQ_SEO.gestionEmocional, faqs: GESTION_EMOCIONAL_FAQS},
  {route: "alimentacion-emocional", component: AlimentacionEmocional, config: FAQ_SEO.alimentacionEmocional, faqs: ALIMENTACION_EMOCIONAL_FAQS},
];

function jsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildHead(config: FaqSeoConfig, faqs: ReadonlyArray<FaqEntry>): string {
  const canonicalUrl = `https://soybienestar.es${config.canonicalPath}`;
  const breadcrumbJson = jsonForHtml(buildBreadcrumbSchema(config));
  const faqJson = jsonForHtml(buildFaqSchema(faqs));

  return `
    <title>${config.title}</title>
    <meta name="description" content="${config.description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:site_name" content="SoyBienestar" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${config.title}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="https://soybienestar.es/images/inicio-horizontal.jpg" />
    <meta property="og:image:alt" content="SoyBienestar, plataforma online de bienestar emocional" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${config.title}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="https://soybienestar.es/images/inicio-horizontal.jpg" />
    <meta name="twitter:image:alt" content="SoyBienestar, plataforma online de bienestar emocional" />
    <script id="${config.breadcrumbSchemaId}" type="application/ld+json">${breadcrumbJson}</script>
    <script id="${config.faqSchemaId}" type="application/ld+json">${faqJson}</script>
  `;
}

async function prerender(entry: PrerenderEntry, template: string): Promise<void> {
  const pageMarkup = renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/${entry.route}`]}>
      <entry.component />
    </MemoryRouter>,
  );
  const html = template
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/\s*<meta\s+[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gs, "")
    .replace(/\s*<link rel="canonical"[^>]*>/g, "")
    .replace("</head>", `${buildHead(entry.config, entry.faqs)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${pageMarkup}</div>`);
  const outputPath = path.join(process.cwd(), "dist", entry.route, "index.html");
  await mkdir(path.dirname(outputPath), {recursive: true});
  await writeFile(outputPath, html, "utf8");
}

const template = await readFile(path.join(process.cwd(), "dist", "index.html"), "utf8");
for (const entry of entries) {
  await prerender(entry, template);
}
console.log(`Prerendered ${entries.length} FAQ routes.`);
