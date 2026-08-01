import { useEffect } from 'react';

const SITE_URL = "https://soybienestar.es";
const DEFAULT_IMAGE_PATH = "/images/inicio-horizontal.jpg";
const DEFAULT_IMAGE_ALT = "SoyBienestar, plataforma online de bienestar emocional";

type SEOProps = {
  title: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  imagePath?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

function toAbsoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${SITE_URL}${normalizedPath}`;
}

function setMetaByName(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export default function SEO({
  title,
  description,
  canonicalPath,
  noIndex = false,
  imagePath = DEFAULT_IMAGE_PATH,
  imageAlt = DEFAULT_IMAGE_ALT,
  type = "website",
}: SEOProps) {
  useEffect(() => {
    // 1. Update document.title
    document.title = title;

    // 2. Create or update <meta name="description">
    if (description) {
      setMetaByName("description", description);
    }

    // URL calculation
    let fullUrl = "";
    if (canonicalPath) {
      const normalizedPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
      fullUrl = `${SITE_URL}${normalizedPath}`;
    } else {
      const pathname = window.location.pathname;
      const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
      fullUrl = `${SITE_URL}${normalizedPathname}`;
    }

    // 3. Create or update <link rel="canonical">
    if (canonicalPath) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', fullUrl);
    }

    // 4. Create or update <meta name="robots">
    setMetaByName("robots", noIndex ? "noindex, follow" : "index, follow");

    // 5. Open Graph tags
    const absoluteImageUrl = toAbsoluteUrl(imagePath);

    setMetaByProperty("og:site_name", "SoyBienestar");
    setMetaByProperty("og:locale", "es_ES");
    setMetaByProperty("og:type", type);
    setMetaByProperty("og:title", title);
    if (description) {
      setMetaByProperty("og:description", description);
    }
    setMetaByProperty("og:url", fullUrl);
    setMetaByProperty("og:image", absoluteImageUrl);
    setMetaByProperty("og:image:alt", imageAlt);

    // 6. Twitter Card tags
    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:title", title);
    if (description) {
      setMetaByName("twitter:description", description);
    }
    setMetaByName("twitter:image", absoluteImageUrl);
    setMetaByName("twitter:image:alt", imageAlt);
  }, [title, description, canonicalPath, noIndex, imagePath, imageAlt, type]);

  return null;
}

