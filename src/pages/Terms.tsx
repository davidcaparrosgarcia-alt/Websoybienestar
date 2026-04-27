import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
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
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-primary mb-6 italic">Aviso Legal y<br/> Términos de Uso</h1>
          <p className="text-xl text-on-primary/80 font-light max-w-2xl mx-auto leading-relaxed">
            Marco normativo y condiciones generales aplicables al uso de la plataforma SoyBienestar, con el máximo respeto por tu experiencia en nuestro espacio digital.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-surface-container-lowest p-8 md:p-16 rounded-[2rem] shadow-xl border border-outline-variant/20">
          <div className="prose prose-lg dark:prose-invert max-w-none text-on-surface-variant font-light leading-loose space-y-12">
            
            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">1. Objeto</h2>
              <p>
                El presente sitio web pone a disposición de los usuarios información, recursos digitales y herramientas relacionadas con el bienestar emocional, la consulta guiada inicial, el autoconocimiento y el acompañamiento humano dentro del método SoyBienestar.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">2. Condiciones de uso</h2>
              <p>
                Toda persona que acceda a este sitio web asume el papel de usuario y se compromete a utilizarlo de forma lícita, respetuosa y adecuada, sin dañar los sistemas, contenidos, derechos de terceros o el funcionamiento normal de la plataforma.
              </p>
              <p>
                El usuario se compromete a no utilizar los recursos, formularios, consultas guiadas, áreas privadas o materiales de SoyBienestar para fines ilícitos, abusivos, fraudulentos, lesivos o contrarios a la buena fe.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">3. Responsabilidad</h2>
              <p>
                El titular procura que la información ofrecida sea clara, útil y actualizada, si bien no garantiza la ausencia total de errores técnicos, interrupciones, fallos externos, indisponibilidades temporales o circunstancias de fuerza mayor que puedan afectar al acceso o funcionamiento del sitio.
              </p>
              <p>
                SoyBienestar puede incluir enlaces o referencias a contenidos de terceros. En ese caso, dichos contenidos serán responsabilidad de sus respectivos titulares, sin que SoyBienestar asuma responsabilidad directa sobre ellos.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">4. Propiedad intelectual e industrial</h2>
              <p>
                Los textos, diseños, imágenes, ilustraciones, recursos visuales, documentos, audios, materiales descargables, estructura, selección de contenidos y demás elementos propios de SoyBienestar han sido creados específicamente para este proyecto o cuentan con autorización de uso, quedando prohibida su reproducción, distribución, transformación, comunicación pública o explotación sin autorización previa y expresa.
              </p>
              <p>
                Determinados materiales creativos, visuales, gráficos, documentales y estructurales del proyecto han sido desarrollados por David Caparrós García para SoyBienestar, conservándose los derechos que correspondan conforme a la normativa de propiedad intelectual aplicable.
              </p>
              <p>
                Para cualquier comunicación relacionada con los contenidos, materiales o derechos de propiedad intelectual de SoyBienestar, puede contactarse a través de <a href="mailto:info@soybienestar.es" className="text-secondary font-medium hover:underline">info@soybienestar.es</a>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">5. Protección de datos</h2>
              <p>
                El tratamiento de los datos personales de los usuarios se regula en la <Link to="/privacy" className="text-secondary font-medium hover:underline">Política de privacidad</Link>, donde se informa sobre las finalidades, base jurídica, conservación, destinatarios y derechos de las personas usuarias.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">6. Identificación del titular</h2>
              <p>
                En cumplimiento de la normativa vigente de servicios de la sociedad de la información y de comercio electrónico, se facilitan a continuación los datos legales: el titular de este espacio es <strong>Maria Bàdenas Nicolás</strong> (NIF: <strong>47703980W</strong>), con domicilio en Calle Ferret, 1, 08150 Parets del Vallès, Barcelona.
              </p>
              <p>
                El nombre de dominio principal es <strong>SoyBienestar.es</strong>, y el punto de contacto a efectos legales y generales es el correo electrónico <a href="mailto:info@soybienestar.es" className="text-secondary font-medium hover:underline">info@soybienestar.es</a> y el teléfono <strong>622 85 27 99</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">7. Cookies</h2>
              <p>
                El uso de cookies o tecnologías similares se explica en la <Link to="/cookies" className="text-secondary font-medium hover:underline">Política de cookies</Link>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-primary font-bold">8. Ley aplicable y jurisdicción</h2>
              <p>
                Para la resolución de las controversias o cuestiones relacionadas con este sitio web o las actividades en él desarrolladas, será de aplicación la legislación española, sometiéndose las partes a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
