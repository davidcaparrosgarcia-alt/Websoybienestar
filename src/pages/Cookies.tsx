import React, { useEffect } from 'react';

export default function Cookies() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 bg-surface min-h-screen text-on-surface pb-24">
      {/* Header */}
      <section className="bg-primary pt-32 pb-24 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img alt="texture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNm2HLjqWbCmeIQ8CL4M7kRUrRaLJ3rJned_WLrEtgJWunyIhBaQYl2KQGy26WkLNaUyXUNifaFltAmoRY4PPxIOUnEithCUKe611JWkfeU-ums-vc0mf2Z6hyPFW_nW8CnGt_nTBzXY3jIefolNjxMNsTGoNq1MsTrbsh6AyPizoejtDbL0byUjeQbfkMT4woWyD5XWh7W89K19IZ-2G_XLTi0SbuP2pbT45MUlGC3UfYm9Vo9qXeNnN95IOabEVVAjhv9NvuFLEm"/>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-primary mb-6 italic">Política de Cookies</h1>
          <p className="text-xl text-on-primary/80 font-light max-w-2xl mx-auto leading-relaxed">
            Transparencia y claridad sobre las tecnologías que utilizamos para que tu experiencia en nuestro refugio digital sea segura y funcional.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-surface-container-lowest p-8 md:p-16 rounded-[2rem] shadow-xl border border-outline-variant/20">
          <div className="prose prose-lg dark:prose-invert max-w-none text-on-surface-variant font-light leading-loose space-y-8">
            <p>
              SoyBienestar utiliza únicamente cookies o tecnologías similares necesarias para el funcionamiento básico de la web, la autenticación de usuarios, la seguridad de la sesión y la prestación de los servicios solicitados.
            </p>

            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 my-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary mt-1">shield</span>
                <p className="m-0 font-medium text-on-surface">Actualmente no utilizamos cookies publicitarias, de seguimiento comercial ni de remarketing.</p>
              </div>
            </div>

            <p>
              Estas tecnologías necesarias permiten, por ejemplo, mantener la sesión iniciada, proteger el acceso a las áreas privadas y recordar elementos imprescindibles para que la web funcione correctamente.
            </p>

            <p>
              Si en el futuro incorporamos herramientas de analítica, publicidad, medición no necesaria o seguimiento comercial, informaremos previamente al usuario y solicitaremos el consentimiento correspondiente cuando sea necesario.
            </p>

            <p>
              El usuario puede configurar o bloquear cookies desde los ajustes de su navegador, aunque el bloqueo de tecnologías necesarias podría afectar al funcionamiento de algunas partes de la web.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
