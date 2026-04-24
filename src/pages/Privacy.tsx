import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="flex-1 bg-transparent w-full">
      {/* Hero Section: The Breathing Hero */}
      <section className="relative h-[614px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            alt="Interior of a quiet, warm library with floor-to-ceiling wooden bookshelves and soft ambient lighting illuminating leather-bound books and comfortable seating." 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5hi-pim59R9cW-YqUQUwB5IHssaqNzIcyC4vWvGU2BuewHVvGi7xENSJPdXL8yVD7ZyPxEKgI8-LoRPci77EyQTEFj8xnnfJTmgF_rQPr_eEhYpoxIUiArRN0Q2Yu1lSn3h7afwamrLPUwr468JgsTyj3WfVX0Tuh_9ExGJeRyeBt8MXqF6SAS1h5uFpXmpxxGFhhMJs-wEWtg5xDVqm4RjN4mictDtS6-_BcQPMiuD_1ZxITaJc6W9sMrqNSrlmPeyLzzKztcW2p"
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent"></div>
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
                    Nuestra práctica se rige por los más estrictos estándares del Consejo General de la Psicología de España. Cada interacción, dato y silencio está protegido por el secreto profesional, garantizando un espacio donde la palabra es libre y el registro es privado.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 border-t border-outline-variant/10 pt-12">
                <div>
                  <h4 className="font-headline text-xl text-primary mb-2">Secreto Profesional</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Protección absoluta de la confidencialidad de acuerdo con la Ley Orgánica de Protección de Datos.</p>
                </div>
                <div>
                  <h4 className="font-headline text-xl text-primary mb-2">Supervisión Clínica</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Protocolos de revisión ética constantes para asegurar la excelencia en el trato humano.</p>
                </div>
              </div>
            </div>

            {/* IA Bridge & Consent Card */}
            <div className="md:col-span-4 !bg-[#162839] p-10 rounded-xl !text-white flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-4xl mb-6 !text-[#cca969]">neurology</span>
                <h3 className="font-headline text-2xl mb-4 !text-white italic">El Puente de la IA</h3>
                <p className="!text-white/80 font-light leading-relaxed mb-6">
                  Utilizamos inteligencia artificial como un puente hacia la claridad emocional, nunca como un sustituto del alma humana. Sus datos son anonimizados y procesados bajo cifrado de grado militar.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 !bg-white/10 p-4 rounded-lg">
                  <span className="material-symbols-outlined text-xl !text-[#cca969]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm !text-white">Consentimiento de Procesamiento</span>
                </div>
                <button className="w-full !bg-[#cca969] !text-[#162839] py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                  Validar Consentimiento
                </button>
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
                <h3 className="font-headline text-2xl text-primary mb-4 transition-colors">1. Recolección de Intenciones</h3>
                <p className="leading-relaxed">
                  Solo recopilamos la información estrictamente necesaria para su proceso de acompañamiento. Esto incluye datos identificativos básicos y el historial de sesiones necesario para mantener la continuidad de su "camino de claridad". No vendemos, ni cederemos jamás su información a terceros con fines comerciales.
                </p>
              </div>
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4">2. Seguridad de Grado Hospitalario</h3>
                <p className="leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso no autorizado, la pérdida accidental o la destrucción. Nuestros servidores están ubicados en la Unión Europea, cumpliendo íntegramente con el RGPD.
                </p>
              </div>
              <div className="group">
                <h3 className="font-headline text-2xl text-primary mb-4">3. Sus Derechos</h3>
                <p className="leading-relaxed">
                  Usted mantiene el control total. Puede ejercer sus derechos de acceso, rectificación, supresión ("derecho al olvido"), limitación del tratamiento y portabilidad en cualquier momento a través de nuestro canal de contacto directo.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action Surface */}
          <div className="bg-surface-container-highest p-12 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h4 className="font-headline text-2xl text-primary mb-2">¿Desea una copia detallada?</h4>
              <p className="text-on-surface-variant text-sm">Descargue nuestro código de ética completo en PDF para una lectura pausada y profunda.</p>
            </div>
            <button className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">download</span>
              Descargar Protocolo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
