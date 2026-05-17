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
          <h3 className="font-headline text-2xl md:text-3xl text-white tracking-wide text-center">Descubre nuestros planes de ayuda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Básico */}
          <div className={`bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative overflow-hidden group ${getHighlightClass("basico")}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">spa</span>
            </div>
            <div className="mb-8 relative z-10">
              <button 
                onClick={() => setSelectedPlanImage('/images/fondo_basico.jpg')}
                className="inline-flex items-center text-xs font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-3xl text-primary mb-2">Plan Básico</h3>
              <p className="font-body text-on-surface-variant text-sm h-12">Estrés práctico del día a día.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="flex items-center space-x-3 text-on-surface">
                <span className="material-symbols-outlined text-primary/60">calendar_month</span>
                <span className="font-label">1 sesión al mes (3 total)</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">550€</span>
                </div>
                <p className="text-xs text-on-surface-variant/80 italic font-body">O a plazos: Reserva 90€ + 3 cuotas de 170€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=basico')}
              className="w-full py-4 rounded-xl text-primary border border-primary/20 hover:bg-surface-container-low transition-colors font-label font-bold mt-auto relative z-10"
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
                onClick={() => setSelectedPlanImage('/images/fondo_inermedio.jpg')}
                className="inline-flex items-center text-xs font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-3xl text-primary mb-2">Plan Intermedio</h3>
              <p className="font-body text-on-surface-variant text-sm h-12">Pensamientos circulares, procrastinación.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="flex items-center space-x-3 text-on-surface">
                <span className="material-symbols-outlined text-primary/60">calendar_month</span>
                <span className="font-label">1 sesión/15 días (6 total)</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">1.700€</span>
                </div>
                <p className="text-xs text-on-surface-variant/80 italic font-body">O a plazos: Reserva 290€ + 3 cuotas de 570€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=intermedio')}
              className="w-full py-4 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-opacity font-label font-bold mt-auto relative z-10"
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
                onClick={() => setSelectedPlanImage('/images/fondo_completo.jpg')}
                className="inline-flex items-center text-xs font-bold tracking-wide uppercase text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5 mb-4 group/btn"
              >
                  ¿En qué consiste?
                  <span className="material-symbols-outlined text-[14px] ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <h3 className="font-headline text-3xl text-primary mb-2">Plan Completo</h3>
              <p className="font-body text-on-surface-variant text-sm h-12">Ansiedad profunda, heridas del pasado.</p>
            </div>
            <div className="flex-grow space-y-6 mb-8 relative z-10">
              <div className="flex items-center space-x-3 text-on-surface">
                <span className="material-symbols-outlined text-primary/60">calendar_month</span>
                <span className="font-label">1 sesión/semana (12 total)</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-label text-on-surface-variant">Pago Único</span>
                  <span className="text-3xl font-headline text-primary">2.200€</span>
                </div>
                <p className="text-xs text-on-surface-variant/80 italic font-body">O a plazos: Reserva 400€ + 3 cuotas de 700€</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sesion-validacion?plan=completo')}
              className="w-full py-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-label font-bold mt-auto relative z-10"
              style={{ background: 'linear-gradient(135deg, var(--color-primary, #162839) 0%, var(--color-primary-container, #2c3e50) 100%)', color: 'white' }}
            >
              Agendar y pagar reserva
            </button>
          </div>
        </div>
      </section>

      {/* Plan Details Modal */}
      {selectedPlanImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191c1c]/60 backdrop-blur-sm" 
          onClick={() => setSelectedPlanImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-surface rounded-[2rem] overflow-hidden shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPlanImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#191c1c]/30 hover:bg-[#191c1c]/50 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="relative w-full overflow-y-auto max-h-[85vh]">
              <img 
                src={selectedPlanImage} 
                alt="Detalle del plan" 
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const msg = document.createElement('div');
                  msg.className = 'p-12 text-center text-on-surface-variant font-label';
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
