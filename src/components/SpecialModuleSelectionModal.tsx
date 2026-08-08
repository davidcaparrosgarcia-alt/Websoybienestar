import React, { useState, useEffect } from "react";

export interface SpecialModuleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const SPECIAL_MODULES: SpecialModuleOption[] = [
  {
    id: "crisis-perdida-salud",
    title: "Crisis, pérdida y salud",
    description: "Protocolos de estabilización emocional y narrativa de trauma para momentos de pérdida, enfermedad, miedo o ruptura del equilibrio personal.",
    icon: "healing"
  },
  {
    id: "amor-desamor",
    title: "Amor y desamor",
    description: "Trabajo con el Adulto Saludable para comprender heridas afectivas, dependencia emocional, ruptura, apego y reconstrucción interna.",
    icon: "favorite"
  },
  {
    id: "trabajo-finanzas",
    title: "Trabajo y finanzas",
    description: "Ejercicios para alinear decisiones, límites y acciones con valores personales cuando el estrés laboral o económico desordenan el sistema.",
    icon: "work"
  }
];

export interface SpecialModuleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedModuleId: string) => void;
  initialSelection?: string;
}

export default function SpecialModuleSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  initialSelection = ""
}: SpecialModuleSelectionModalProps) {
  const [selectedId, setSelectedId] = useState<string>(initialSelection);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(initialSelection || "");
      setStep(1);
    }
  }, [isOpen, initialSelection]);

  if (!isOpen) return null;

  const selectedModuleObj = SPECIAL_MODULES.find((m) => m.id === selectedId);

  const handleNextStep = () => {
    if (selectedId) {
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const handleFinalConfirm = () => {
    if (selectedId) {
      onConfirm(selectedId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-md animate-in fade-in text-left">
      <div className="bg-surface-container-lowest w-full max-w-[min(94vw,580px)] max-h-[92dvh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col border border-outline-variant/10">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Cabecera */}
        <div className="px-6 pt-6 pb-4 md:px-8 md:pt-7 md:pb-5 border-b border-outline-variant/10 bg-primary-container text-on-primary pr-16">
          <span className="font-label text-xs uppercase tracking-widest text-white/70 font-semibold mb-1 block">
            Plan Intermedio
          </span>
          <h3 className="font-headline text-2xl md:text-3xl font-light text-white leading-tight">
            Elige tu módulo especializado
          </h3>
        </div>

        {/* Contenido */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 min-h-0">
          {step === 1 ? (
            /* PANTALLA 1: SELECCIÓN */
            <>
              <div className="space-y-2">
                <p className="text-on-surface-variant text-sm md:text-base font-light leading-relaxed">
                  Tu programa incluye uno de los tres módulos especializados.
                </p>
                <p className="text-on-surface-variant text-sm md:text-base font-light leading-relaxed">
                  Selecciona el módulo que quieres incorporar a tu itinerario.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {SPECIAL_MODULES.map((module) => {
                  const isSelected = selectedId === module.id;
                  return (
                    <div
                      key={module.id}
                      onClick={() => setSelectedId(module.id)}
                      className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                          : "bg-surface-container-low hover:bg-surface-container border-outline-variant/20"
                      }`}
                    >
                      <div className="pt-0.5 shrink-0 flex items-center justify-center">
                        <span
                          className={`material-symbols-outlined text-2xl ${
                            isSelected ? "text-primary" : "text-on-surface-variant/60"
                          }`}
                        >
                          {isSelected ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`material-symbols-outlined text-lg ${
                              isSelected ? "text-primary" : "text-on-surface-variant"
                            }`}
                          >
                            {module.icon}
                          </span>
                          <h4
                            className={`font-headline text-base md:text-lg ${
                              isSelected ? "text-primary font-medium" : "text-on-surface"
                            }`}
                          >
                            {module.title}
                          </h4>
                        </div>
                        <p className="text-xs md:text-sm text-on-surface-variant font-light leading-snug">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedId}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-on-primary font-label text-sm uppercase tracking-wider font-semibold shadow-md hover:bg-primary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
                >
                  Confirmar elección
                </button>
              </div>
            </>
          ) : (
            /* PANTALLA 2: CONFIRMACIÓN */
            <>
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">
                    {selectedModuleObj?.icon || "check_circle"}
                  </span>
                </div>

                <p className="text-on-surface-variant text-base font-light">
                  Has elegido:
                </p>

                <div className="p-5 bg-surface-container border border-primary/20 rounded-2xl">
                  <h4 className="font-headline text-xl md:text-2xl text-primary font-medium">
                    {selectedModuleObj?.title || selectedId}
                  </h4>
                </div>

                <p className="text-on-surface-variant text-sm md:text-base font-light leading-relaxed pt-2">
                  Esta elección quedará asociada a tu programa.
                </p>
              </div>

              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-outline-variant/30 text-on-surface hover:bg-surface-container transition-colors font-label text-sm uppercase tracking-wider font-medium"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-on-primary font-label text-sm uppercase tracking-wider font-semibold shadow-md hover:bg-primary-container transition-all"
                >
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
