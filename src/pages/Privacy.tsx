import { useState } from "react";
import SEO from "../components/SEO";

export default function Privacy() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText("info@soybienestar.es");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <>

      <SEO
        title="Política de privacidad | SoyBienestar"
        description="Consulta cómo SoyBienestar.es trata y protege tus datos personales dentro de sus servicios digitales de bienestar emocional."
        canonicalPath="/privacy"
        noIndex={false}
      />

    <div className="flex-1 bg-transparent w-full">
      {/* Hero Section: The Breathing Hero */}
      <section className="relative h-[614px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            alt="Interior of a quiet, warm library with floor-to-ceiling wooden bookshelves and soft ambient lighting illuminating leather-bound books and comfortable seating." 
            src="/images/fondo_privacidad.jpg"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/30 to-transparent"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8">
          <div className="max-w-2xl">
            <span className="text-on-primary/70 uppercase tracking-widest text-xs font-semibold mb-4 block">Compromiso Ético</span>
            <h1 className="font-headline text-5xl md:text-7xl text-on-primary leading-tight mb-6 italic">Tu intimidad es nuestra prioridad sagrada.</h1>
            <p className="text-on-primary/90 text-lg md:text-xl font-light leading-relaxed max-w-lg">
              En el Faro del Centro, entendemos que la vulnerabilidad requiere un refugio inquebrantable. Nuestra ética profesional no es solo un marco legal, es la esencia de nuestra práctica.
            </p>
          </div>
        </div>
      </section>

      {/* Ethics & IA Bridge Section (Bento Grid) */}
      <section className="py-24 bg-transparent px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Professional Ethics Card */}
            <div className="md:col-span-8 bg-surface-container-lowest p-12 rounded-xl shadow-sm border-b border-outline-variant/15">
              <div className="flex items-start gap-6 mb-8">
                <span className="material-symbols-outlined text-primary text-4xl">verified_user</span>
                <div>
                  <h2 className="font-headline text-3xl text-primary mb-4">Validación Profesional y Ética</h2>
                  <p className="text-on-surface-variant leading-relaxed text-lg mb-6">
                    Nuestra práctica se rige por criterios de confidencialidad, respeto y protección de datos. Cada interacción e información compartida se trata con confidencialidad, garantizando un espacio donde la palabra es libre y el registro es privado.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 border-t border-outline-variant/10 pt-12">
                <div>
                  <h4 className="font-headline text-xl text-primary mb-2">Confidencialidad</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Alto grado de protección de la confidencialidad de acuerdo con la normativa aplicable de protección de datos.</p>
                </div>
                <div>
                  <h4 className="font-headline text-xl text-primary mb-2">Revisión humana</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Protocolos de revisión ética orientados a asegurar la excelencia en el trato humano.</p>
                </div>
              </div>
            </div>

            {/* IA Bridge Card */}
            <div className="md:col-span-4 !bg-[#162839] p-10 rounded-xl !text-white flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-4xl mb-6 !text-[#cca969]" style={{ fontVariationSettings: "'wght' 300" }}>self_improvement</span>
                <h3 className="font-headline text-2xl mb-4 !text-white italic">El Puente de la IA</h3>
                <p className="!text-white/80 font-light leading-relaxed mb-6 text-sm">
                  SoyBienestar puede utilizar herramientas de inteligencia artificial como apoyo para ordenar la información que la persona decide compartir, generar resúmenes u orientaciones preliminares y facilitar la revisión posterior por el equipo humano.
                  <br /><br />
                  La inteligencia artificial no sustituye la valoración profesional ni adopta por sí sola decisiones con efectos jurídicos o equivalentes sobre la persona. Cuando el contenido compartido pueda incluir información sensible, su tratamiento se limita a las finalidades del servicio y a los proveedores tecnológicos necesarios para prestarlo, de acuerdo con esta Política de Privacidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Policy Content */}
      <section className="py-24 bg-transparent px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="font-headline text-4xl text-primary mb-8 border-l-4 border-primary pl-8">Transparencia en el Uso de Datos</h2>
            <div className="space-y-12 text-on-surface-variant">
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4 transition-colors">1. Responsable del tratamiento</h3>
                <p className="leading-relaxed">
                  El responsable del tratamiento de los datos personales es la titular de SoyBienestar, cuyos datos identificativos completos figuran en el Aviso Legal. Para cualquier cuestión relacionada con privacidad o protección de datos puedes contactar en info@soybienestar.es.
                </p>
              </div>
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4">2. Qué datos tratamos y para qué</h3>
                <p className="leading-relaxed">
                  Podemos tratar los datos identificativos y de contacto necesarios para crear y mantener tu cuenta, gestionar consultas, reservas y comunicaciones, así como la información que decidas facilitar durante la consulta guiada, el Cuestionario Espejo y el proceso de elaboración de tu Dossier.
                </p>
                <p className="leading-relaxed mt-4">
                  Esa información puede incluir datos sobre tu situación personal, emocional o de bienestar y, en determinados casos, información que pueda considerarse relativa a la salud. También podemos tratar datos técnicos necesarios para la seguridad, funcionamiento y medición agregada del uso de la plataforma.
                </p>
              </div>
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4">3. Base jurídica</h3>
                <p className="leading-relaxed">
                  Tratamos los datos necesarios para prestar los servicios solicitados, gestionar las relaciones precontractuales o contractuales y cumplir las obligaciones legales aplicables.
                </p>
                <p className="leading-relaxed mt-4">
                  Cuando la información que decidas facilitar pueda revelar datos relativos a tu salud o bienestar emocional y sea necesario tu consentimiento para su tratamiento, solicitaremos tu consentimiento explícito. Podrás retirarlo en cualquier momento, sin que ello afecte a la licitud del tratamiento realizado anteriormente.
                </p>
                <p className="leading-relaxed mt-4">
                  Determinados tratamientos técnicos necesarios para proteger la plataforma, prevenir usos abusivos o garantizar su seguridad podrán basarse en nuestro interés legítimo.
                </p>
              </div>
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4">4. Proveedores tecnológicos y comunicaciones</h3>
                <p className="leading-relaxed">
                  Para prestar el servicio utilizamos proveedores tecnológicos necesarios para el alojamiento de la plataforma, autenticación y almacenamiento de datos, procesamiento mediante inteligencia artificial, comunicaciones y gestión de pagos. Entre ellos pueden encontrarse proveedores como Google/Firebase, Google Gemini, Vercel y Stripe, según la funcionalidad utilizada.
                </p>
                <p className="leading-relaxed mt-4">
                  No vendemos datos personales ni los cedemos para publicidad de terceros. Cuando algún proveedor implique tratamiento internacional de datos, se aplicarán las garantías exigidas por la normativa de protección de datos que correspondan.
                </p>
              </div>
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4">5. Conservación</h3>
                <p className="leading-relaxed">
                  Los datos se conservarán mientras sean necesarios para mantener la cuenta, gestionar el proceso solicitado y prestar los servicios contratados. Posteriormente podrán mantenerse bloqueados durante los plazos necesarios para atender obligaciones legales o posibles responsabilidades y serán eliminados cuando dejen de resultar necesarios.
                </p>
                <p className="leading-relaxed mt-4">
                  Algunos datos técnicos o recursos temporales pueden tener periodos de conservación más breves cuando su función ya haya finalizado.
                </p>
              </div>
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4">6. Tus derechos</h3>
                <p className="leading-relaxed">
                  Puedes solicitar el acceso a tus datos, su rectificación o supresión, la limitación u oposición a determinados tratamientos y, cuando corresponda, su portabilidad. También puedes retirar en cualquier momento los consentimientos que hayas otorgado.
                </p>
                <p className="leading-relaxed mt-4">
                  Puedes ejercer estos derechos escribiendo a info@soybienestar.es. Si consideras que el tratamiento de tus datos no se ajusta a la normativa, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action Surface */}
          <div className="bg-surface-container-highest p-12 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h4 className="font-headline text-2xl text-primary mb-2">¿Tienes dudas sobre tus datos?</h4>
              <p className="text-on-surface-variant text-sm md:mb-0">Queremos que tengas claridad sobre cómo se cuida la información que compartes. Si deseas consultar, corregir o solicitar la eliminación de tus datos, puedes escribirnos y revisaremos tu caso con atención.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
              <div className="font-headline text-2xl text-primary text-center md:text-right w-full">info@soybienestar.es</div>
              <button 
                onClick={handleCopyEmail}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl hover:opacity-90 transition-opacity min-w-[200px]"
              >
                <span className="material-symbols-outlined">{copied ? "check" : "content_copy"}</span>
                {copied ? "Email copiado" : "Copiar email"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
      </>
  );
}
