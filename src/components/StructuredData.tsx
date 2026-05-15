import { useEffect } from 'react';

type StructuredDataProps = {
  id: string;
  data: unknown;
};

export default function StructuredData({ id, data }: StructuredDataProps) {
  useEffect(() => {
    let script = document.getElementById(id) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(data);

    return () => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [id, data]);

  return null;
}
