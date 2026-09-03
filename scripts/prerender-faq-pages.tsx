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
import {
  RESOURCES_EDITORIAL,
  RESOURCES_SEO,
  buildResourcesBreadcrumbSchema,
  buildResourcesServiceSchema,
} from "../src/data/resourcesSeo";

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

type SeoMetaConfig = Pick<FaqSeoConfig, "title" | "description" | "canonicalPath">;

function buildSeoHead(config: SeoMetaConfig, structuredData: ReadonlyArray<{id: string; data: unknown}> = []): string {
  const canonicalUrl = `https://soybienestar.es${config.canonicalPath}`;
  const scripts = structuredData.map(({id, data}) =>
    `<script id="${id}" type="application/ld+json">${jsonForHtml(data)}</script>`,
  ).join("\n    ");

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
    ${scripts}
  `;
}

function buildFaqHead(config: FaqSeoConfig, faqs: ReadonlyArray<FaqEntry>): string {
  return buildSeoHead(config, [
    {id: config.breadcrumbSchemaId, data: buildBreadcrumbSchema(config)},
    {id: config.faqSchemaId, data: buildFaqSchema(faqs)},
  ]);
}

function buildResourcesEditorialMarkup(): string {
  return renderToStaticMarkup(
    <main className="pt-2 md:pt-16 pb-24 max-w-screen-xl mx-auto px-6 lg:px-8">
      <h1 className="sr-only">Herramientas para calmar la ansiedad, el estrés y la mente</h1>
      <section aria-labelledby="resources-editorial-title" className="mt-16 md:mt-24 max-w-5xl mx-auto">
        <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-low/60 p-8 md:p-12">
          <h2 id="resources-editorial-title" className="font-headline text-3xl md:text-4xl text-primary mb-5">
            {RESOURCES_EDITORIAL.introduction.title}
          </h2>
          {RESOURCES_EDITORIAL.introduction.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-on-surface-variant text-base md:text-lg font-light leading-relaxed mb-5 last:mb-0">
              {paragraph}
            </p>
          ))}
          <div className="mt-10 space-y-10">
            {RESOURCES_EDITORIAL.sections.map((section) => (
              <article key={section.title}>
                <h3 className="font-headline text-2xl md:text-3xl text-primary mb-3">{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-on-surface-variant text-base md:text-lg font-light leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
                {"listLabel" in section && section.listLabel && section.items && (
                  <>
                    <p className="text-on-surface-variant text-base font-medium mt-5 mb-2">{section.listLabel}</p>
                    <ul className="list-disc pl-6 space-y-1 text-on-surface-variant text-base md:text-lg font-light leading-relaxed">
                      {section.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </>
                )}
                {"groups" in section && section.groups && (
                  <div className="mt-5 space-y-4">
                    {section.groups.map((group) => (
                      <div key={group.label}>
                        <p className="text-on-surface-variant text-base font-medium mb-2">{group.label}</p>
                        <ul className="list-disc pl-6 space-y-1 text-on-surface-variant text-base md:text-lg font-light leading-relaxed">
                          {group.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {"notes" in section && section.notes && section.notes.map((note) => (
                  <p key={note} className="text-on-surface-variant text-base md:text-lg font-light leading-relaxed mt-4">{note}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>,
  );
}

function buildStaticDocument(template: string, pageMarkup: string, head: string): string {
  return template
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/\s*<meta\s+[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gs, "")
    .replace(/\s*<link rel="canonical"[^>]*>/g, "")
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${pageMarkup}</div>`);
}

async function prerender(entry: PrerenderEntry, template: string): Promise<void> {
  const pageMarkup = renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/${entry.route}`]}>
      <entry.component />
    </MemoryRouter>,
  );
  const html = buildStaticDocument(template, pageMarkup, buildFaqHead(entry.config, entry.faqs));
  const outputPath = path.join(process.cwd(), "dist", entry.route, "index.html");
  await mkdir(path.dirname(outputPath), {recursive: true});
  await writeFile(outputPath, html, "utf8");
}

const template = await readFile(path.join(process.cwd(), "dist", "index.html"), "utf8");
for (const entry of entries) {
  await prerender(entry, template);
}

const resourcesHead = buildSeoHead(RESOURCES_SEO, [
  {id: "breadcrumb-schema-herramientas", data: buildResourcesBreadcrumbSchema()},
  {id: "resources-service-schema", data: buildResourcesServiceSchema()},
]);
const resourcesMarkup = buildResourcesEditorialMarkup();
const resourcesHtml = buildStaticDocument(template, resourcesMarkup, resourcesHead);
const resourcesOutputPath = path.join(process.cwd(), "dist", "herramientas", "index.html");
await mkdir(path.dirname(resourcesOutputPath), {recursive: true});
await writeFile(resourcesOutputPath, resourcesHtml, "utf8");

console.log(`Prerendered ${entries.length} FAQ routes and /herramientas.`);
