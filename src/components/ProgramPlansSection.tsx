import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProgramPlansSectionProps {
  selectedPlan?: "basico" | "intermedio" | "completo" | null;
}

export default function ProgramPlansSection({ selectedPlan }: ProgramPlansSectionProps) {
  const navigate = useNavigate();
  const [selectedPlanImage, setSelectedPlanImage] = useState<string | null>(null);

  const getHighlightClass = (plan: "basico" | "intermedio" | "completo") => {
    if (!selectedPlan) return "";
    if (selectedPlan === plan) {
      return "ring-4 ring-primary ring-offset-4 ring-offset-surface";
    }
    return "opacity-75 scale-95";
  };

  return (
    <>
      <section className="w-full space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <h2 className="font-headline text-3xl md:text-4xl text-primary">El camino hacia la transformación</h2>
          <p className="font-body tracking-wide text-lg text-on-surface-variant">
            Selecciona la estructura que mejor se adapte a tu necesidad de profundidad y acompañamiento en este proceso.
          </p>
        </div>
        
        <div className="w-full bg-[#162839] rounded-3xl py-8 px-6 md:px-12 flex items-center justify-center shadow-xl mb-8">
          <h3 className="font-headline text-[44.6px] text-white tracking-wide text-center leading-tight">Descubre nuestros planes de ayuda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Básico */}
          <div className={`bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative overflow-hidden group ${getHighlightClass("basico")}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">spa</span>
            </div>
            <div className="mb-8 relative z-10">
              <button 
                onClick={() => setSelectedPlanImage('/images/infografia_basico.jpg')}
                className="inline-flex items-center text-[14px] font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-[33.6px] text-primary mb-2">Plan Básico</h3>
              <p className="font-body text-on-surface-variant text-[14px] h-12">Práctico para empezar a ordenar tu malestar y aplicar herramientas en el día a día.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="space-y-3 text-on-surface">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[32px] text-[#5fab5f] shrink-0">calendar_month</span>
                  <div>
                    <p className="font-label text-[15.72px]">3 sesiones terapéuticas personales</p>
                    <p className="text-sm text-on-surface-variant/80">1 sesión al mes</p>
                  </div>
                </div>
                <div className="pl-11 space-y-2 text-sm text-on-surface-variant">
                  <p>+ 1 sesión adicional de gestión emocional</p>
                  <p>+ Acceso al Método Gestión de Emociones</p>
                  <p className="font-bold text-primary">Total: 4 sesiones + recursos prácticos y personalizados</p>
                </div>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[15px] font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">550€</span>
                </div>
                <p className="text-[15px] text-on-surface-variant/80 italic font-body">O a plazos: Reserva 90€ + 3 cuotas de 170€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=basico')}
              className="w-full py-4 rounded-xl text-primary border border-primary/20 hover:bg-surface-container-low transition-colors font-label font-bold mt-auto relative z-10 text-[16.72px]"
            >
              Agendar y pagar reserva
            </button>
          </div>

          {/* Plan Intermedio */}
          <div className={`bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative overflow-hidden group ${getHighlightClass("intermedio")}`}>
            <div className="absolute inset-0 border-2 border-primary/10 rounded-3xl pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">mediation</span>
            </div>
            <div className="mb-8 relative z-10">
              <button 
                onClick={() => setSelectedPlanImage('/images/infografia_intermedio.jpg')}
                className="inline-flex items-center text-[14px] font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-[33.6px] text-primary mb-2">Plan Intermedio</h3>
              <p className="font-body text-on-surface-variant text-[14px] h-12">Un acompañamiento más constante para sostener el proceso, integrar avances y entrenar nuevas respuestas emocionales.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="space-y-3 text-on-surface">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[32px] text-[#6bad6b] shrink-0">calendar_month</span>
                  <div>
                    <p className="font-label text-[15.72px]">6 sesiones terapéuticas personales</p>
                    <p className="text-sm text-on-surface-variant/80">1 sesión cada 15 días</p>
                  </div>
                </div>
                <div className="pl-11 space-y-2 text-sm text-on-surface-variant">
                  <p>+ 3 sesiones adicionales de gestión emocional</p>
                  <p>+ Acceso al Método Gestión de Emociones</p>
                  <p className="font-bold text-primary">Total: 9 sesiones + recursos prácticos y personalizados</p>
                </div>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[15px] font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">1.700€</span>
                </div>
                <p className="text-[15px] text-on-surface-variant/80 italic font-body">O a plazos: Reserva 290€ + 3 cuotas de 570€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=intermedio')}
              className="w-full py-4 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-opacity font-label font-bold mt-auto relative z-10 text-[16.72px]"
            >
              Agendar y pagar reserva
            </button>
          </div>

          {/* Plan Completo */}
          <div className={`bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative overflow-hidden group ${getHighlightClass("completo")}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">diamond</span>
            </div>
            <div className="mb-8 relative z-10">
              <button 
                onClick={() => setSelectedPlanImage('/images/infografia_completo.jpg')}
                className="inline-flex items-center text-[14px] font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-[34.6px] text-primary mb-2">Plan Completo</h3>
              <p className="font-body text-on-surface-variant text-[15px] h-12">El proceso más profundo e intensivo, pensado para trabajar desde la raíz y consolidar cambios duraderos.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="space-y-3 text-on-surface">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[32px] text-[#6db560] shrink-0">calendar_month</span>
                  <div>
                    <p className="font-label text-[15.72px]">12 sesiones terapéuticas personales</p>
                    <p className="text-sm text-on-surface-variant/80">1 sesión semanal</p>
                  </div>
                </div>
                <div className="pl-11 space-y-2 text-sm text-on-surface-variant">
                  <p>+ 4 sesiones adicionales de gestión emocional</p>
                  <p>+ Acceso completo al Método Gestión de Emociones</p>
                  <p className="font-bold text-primary">Total: 16 sesiones + recursos prácticos y personalizados</p>
                </div>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[15px] font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">2.200€</span>
                </div>
                <p className="text-[15px] text-on-surface-variant/80 italic font-body">O a plazos: Reserva 400€ + 3 cuotas de 700€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=completo')}
              className="w-full py-4 rounded-xl text-white transition-all duration-300 font-label font-bold mt-auto relative z-10 text-[17.72px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #162839 0%, #31566f 45%, #b39150 100%)' }}
            >
              Agendar y pagar reserva
            </button>
          </div>
        </div>
      </section>

      {/* Plan Details Modal */}
      {selectedPlanImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#191c1c]/80 backdrop-blur-sm" 
          onClick={() => setSelectedPlanImage(null)}
        >
          <div 
            className="relative w-full max-w-6xl max-h-[90vh] bg-[#11181f] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-50" 
            onClick={e => e.stopPropagation()}
          >
            {/* Elegant Action Buttons */}
            <div className="p-4 pb-0 flex justify-center md:justify-end gap-3 md:p-0 md:absolute md:top-8 md:right-8 z-[130] shrink-0">
              <a 
                href={selectedPlanImage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
                title="Abrir en pantalla completa / Descargar"
              >
                <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">open_in_new</span>
              </a>
              <button 
                onClick={() => setSelectedPlanImage(null)}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-sm group"
              >
                <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
              </button>
            </div>
            
            {/* Scrollable document area */}
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar flex flex-col">
              <img 
                src={selectedPlanImage} 
                alt="Detalle del plan" 
                className="w-full h-auto rounded-xl shadow-sm object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const msg = document.createElement('div');
                  msg.className = 'p-12 text-center text-white/70 font-label text-white';
                  msg.innerText = 'Infografía pendiente de incorporar.';
                  e.currentTarget.parentElement?.appendChild(msg);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
