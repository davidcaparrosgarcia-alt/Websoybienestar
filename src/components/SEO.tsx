import { useEffect } from 'react';

type SEOProps = {
  title: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
};

export default function SEO({ title, description, canonicalPath, noIndex }: SEOProps) {
  useEffect(() => {
    // 1. Update document.title
    document.title = title;

    // 2. Create or update <meta name="description">
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // 3. Create or update <link rel="canonical">
    if (canonicalPath) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      const fullUrl = `https://soybienestar.es${canonicalPath}`;
      canonical.setAttribute('href', fullUrl);
    }

    // 4. Create or update <meta name="robots">
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', noIndex ? 'noindex, follow' : 'index, follow');
  }, [title, description, canonicalPath, noIndex]);

  return null;
}
