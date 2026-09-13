import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  INTERNAL_GUIDE_SECTIONS,
  executeInternalGuideAction,
  isSoyBienestarInternalGuideEnabled,
  type InternalGuideSectionId,
} from "../internalGuide";
import {
  INTERNAL_GUIDE_AI_MAX_TEXT_LENGTH,
  interpretInternalGuideText,
  isSoyBienestarInternalGuideAiEnabled,
  type InternalGuideAIResult,
} from "../internalGuideAI";
import { readAgentProcessContext } from "../processContext";
import type { AgentCoarseUserState } from "../userState";

export default function InternalGuide() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<InternalGuideSectionId | null>(null);
  const [hasError, setHasError] = useState(false);
  const [query, setQuery] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiResult, setAiResult] = useState<InternalGuideAIResult | null>(null);
  const [processContext, setProcessContext] = useState<AgentCoarseUserState | null>(null);
  const interpretControllerRef = useRef<AbortController | null>(null);
  const enabled = isSoyBienestarInternalGuideEnabled();
  const aiEnabled = isSoyBienestarInternalGuideAiEnabled();

  useEffect(() => {
    return () => interpretControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!enabled || selectedSectionId !== "process") {
      setProcessContext(null);
      return;
    }

    let active = true;
    setProcessContext(null);

    void readAgentProcessContext()
      .then((context) => {
        if (active) setProcessContext(context);
      })
      .catch(() => {
        if (active) setProcessContext(null);
      });

    return () => {
      active = false;
    };
  }, [enabled, selectedSectionId]);

  if (!enabled) return null;

  const selectedSection =
    INTERNAL_GUIDE_SECTIONS.find((section) => section.id === selectedSectionId) ?? null;

  const resetInterpretation = () => {
    interpretControllerRef.current?.abort();
    interpretControllerRef.current = null;
    setQuery("");
    setIsInterpreting(false);
    setAiResult(null);
  };

  const closeGuide = () => {
    setIsOpen(false);
    setSelectedSectionId(null);
    setHasError(false);
    resetInterpretation();
  };

  const handleAction = (actionId: string) => {
    const result = executeInternalGuideAction(actionId, {
      navigate: (path) => navigate(path),
    });

    if (result.status === "NAVIGATED") {
      closeGuide();
      return;
    }

    setHasError(true);
  };

  const handleInterpret = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || isInterpreting) return;

    interpretControllerRef.current?.abort();
    const controller = new AbortController();
    interpretControllerRef.current = controller;
    setIsInterpreting(true);
    setAiResult(null);
    setHasError(false);

    const result = await interpretInternalGuideText(query, {
      signal: controller.signal,
    });

    if (controller.signal.aborted) return;
    setAiResult(result);
    setIsInterpreting(false);
    interpretControllerRef.current = null;
  };

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Cerrar guía de navegación" : "Abrir guía de navegación"}
        aria-expanded={isOpen}
        aria-controls="soybienestar-internal-guide"
        onClick={() => {
          if (isOpen) {
            closeGuide();
          } else {
            setIsOpen(true);
            setHasError(false);
          }
        }}
        className="fixed left-4 bottom-4 md:left-6 md:bottom-6 z-[80] h-12 px-4 rounded-full bg-[#2c3e50] text-white border border-white/15 shadow-xl hover:bg-[#34495e] transition-colors flex items-center gap-2 font-label text-sm"
      >
        <span className="material-symbols-outlined text-xl">travel_explore</span>
        <span className="hidden sm:inline">Guía</span>
      </button>

      {isOpen && (
        <aside
          id="soybienestar-internal-guide"
          role="dialog"
          aria-modal="false"
          aria-label="Guía de navegación de SoyBienestar"
          className="fixed left-4 right-4 bottom-20 md:left-6 md:right-auto md:bottom-20 z-[80] w-auto md:w-[380px] max-h-[calc(100vh-7rem)] rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 p-5 border-b border-outline-variant/15">
            <div>
              <p className="font-headline text-2xl text-primary">Guía de navegación</p>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                Elige qué quieres encontrar. La guía puede orientarte hacia recursos de SoyBienestar; no diagnostica ni sustituye atención profesional.
              </p>
            </div>
            <button
              type="button"
              onClick={closeGuide}
              aria-label="Cerrar guía"
              className="shrink-0 w-9 h-9 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="p-4 max-h-[min(60vh,520px)] overflow-y-auto">
            {selectedSection ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSectionId(null);
                    setHasError(false);
                  }}
                  className="mb-3 inline-flex items-center gap-2 text-sm text-primary hover:opacity-75 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Volver
                </button>

                <div className="mb-4">
                  <p className="font-headline text-xl text-primary">{selectedSection.title}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{selectedSection.description}</p>
                </div>

                <div className="space-y-2">
                  {selectedSection.actions.map((action) => {
                    const isRecommended =
                      selectedSection.id === "process" &&
                      processContext?.recommendedProcessActionId === action.id;

                    return (
                      <button
                        key={action.id}
                        type="button"
                        aria-current={isRecommended ? "step" : undefined}
                        onClick={() => handleAction(action.id)}
                        className={`w-full flex items-center justify-between gap-3 text-left rounded-2xl border px-4 py-3 text-on-surface hover:border-primary/30 hover:bg-surface-container transition-colors ${
                          isRecommended
                            ? "border-primary/40 bg-primary/5"
                            : "border-outline-variant/15 bg-surface-container-low"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{action.label}</span>
                          {isRecommended && (
                            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-primary">
                              Recomendado
                            </span>
                          )}
                        </span>
                        <span className="material-symbols-outlined text-lg text-primary/70">arrow_forward</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {aiEnabled && (
                  <form
                    onSubmit={handleInterpret}
                    className="mb-4 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4"
                  >
                    <label htmlFor="soybienestar-guide-query" className="block font-headline text-lg text-primary">
                      ¿Qué necesitas encontrar?
                    </label>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                      La orientación automática usa IA para clasificar solo este texto. No incluyas datos personales.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <input
                        id="soybienestar-guide-query"
                        type="text"
                        value={query}
                        maxLength={INTERNAL_GUIDE_AI_MAX_TEXT_LENGTH}
                        autoComplete="off"
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setAiResult(null);
                          setHasError(false);
                        }}
                        placeholder="Ej.: necesito desconectar antes de dormir"
                        className="min-w-0 flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                      />
                      <button
                        type="submit"
                        disabled={!query.trim() || isInterpreting}
                        className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {isInterpreting ? "Buscando…" : "Orientarme"}
                      </button>
                    </div>

                    {aiResult?.status === "suggestion" && (
                      <div className="mt-3 rounded-xl border border-primary/15 bg-surface-container-lowest p-3">
                        <p className="text-sm text-on-surface-variant">
                          Te puede encajar: <strong className="text-primary">{aiResult.action.label}</strong>
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAction(aiResult.action.id)}
                          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-75"
                        >
                          Abrir
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                      </div>
                    )}

                    {aiResult?.status === "no_match" && (
                      <p role="status" className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                        No encuentro una opción suficientemente clara. Puedes elegir una categoría debajo.
                      </p>
                    )}

                    {aiResult?.status === "safety_blocked" && (
                      <p role="alert" className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                        No voy a elegir una herramienta automáticamente con ese mensaje. Si hay peligro inmediato, contacta con emergencias de tu país o con una persona de confianza que pueda estar contigo.
                      </p>
                    )}

                    {(aiResult?.status === "temporarily_unavailable" || aiResult?.status === "invalid_input") && (
                      <p role="status" className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                        Ahora no puedo interpretar el texto. Puedes seguir usando las opciones de abajo.
                      </p>
                    )}
                  </form>
                )}

                <div className="space-y-2">
                  {INTERNAL_GUIDE_SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setSelectedSectionId(section.id);
                        setHasError(false);
                      }}
                      className="w-full flex items-center gap-4 text-left rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-4 hover:border-primary/30 hover:bg-surface-container transition-colors"
                    >
                      <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">{section.icon}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-headline text-lg text-primary">{section.title}</span>
                        <span className="block mt-1 text-xs leading-relaxed text-on-surface-variant">
                          {section.description}
                        </span>
                      </span>
                      <span className="material-symbols-outlined text-lg text-primary/60">chevron_right</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {hasError && (
              <p role="status" className="mt-4 text-sm text-on-surface-variant">
                No se pudo abrir ese destino.
              </p>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
