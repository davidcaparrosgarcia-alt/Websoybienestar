import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type ProcessStepsPanelProps = {
  progressStep: number;
  onConsultaClick: () => void;
  onCuestionarioClick: () => void;
  onDossierClick: () => void;
  className?: string;
};

export default function ProcessStepsPanel({ progressStep, onConsultaClick, onCuestionarioClick, onDossierClick, className = "" }: ProcessStepsPanelProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <>
      <section className={`w-full ${className}`}>
        <div 
          className="w-full max-w-screen-2xl mx-auto px-8 md:px-24 py-12 bg-surface-container-low rounded-[3rem] relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/images/fondo_privacidad.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/50 dark:bg-[#11181f]/45 pointer-events-none"></div>
          <div className="relative z-10 py-8 flex flex-col items-center justify-center space-y-10 w-full">
            <div className="relative w-full flex flex-col items-center justify-center space-y-6">
              <div className="absolute inset-0 flex items-center top-3 h-0"><div className="w-full border-t border-outline-variant/20"></div></div>
              <h2 className="relative px-8 font-headline italic text-primary text-xl tracking-widest uppercase text-center bg-white/60 dark:bg-[#11181f]/60 backdrop-blur-sm rounded-full py-2">
                ¿Cómo trabajamos?
              </h2>
              <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="relative px-6 py-2 border border-primary/30 rounded-full font-headline text-primary bg-white/80 dark:bg-surface-container/80 backdrop-blur-md hover:bg-white dark:hover:bg-surface-container-high transition-colors shadow-sm flex items-center gap-2 mt-4"
              >
                Conoce la respuesta
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
              </button>
            </div>
            
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <button
                onClick={progressStep === 1 ? onConsultaClick : undefined}
                className={`w-full py-4 rounded-xl font-label font-medium transition-all ${
                  progressStep > 1 
                    ? 'opacity-20 bg-surface-container text-on-surface-variant cursor-not-allowed' 
                    : progressStep === 1 
                      ? 'bg-primary dark:bg-[#d1e7e4] text-white dark:text-[#2c3e50] shadow-md hover:opacity-90 cursor-pointer' 
                      : 'opacity-50 bg-surface-container text-on-surface-variant cursor-not-allowed'
                }`}
              >
                Consulta Gratuita
              </button>
              <button
                disabled={progressStep !== 2}
                onClick={progressStep === 2 ? onCuestionarioClick : undefined}
                className={`w-full py-4 rounded-xl font-label font-medium transition-all ${
                  progressStep > 2 
                    ? 'opacity-20 bg-surface-container text-on-surface-variant cursor-not-allowed'
                    : progressStep === 2
                      ? 'bg-primary dark:bg-[#d1e7e4] text-white dark:text-[#2c3e50] shadow-md hover:opacity-90 cursor-pointer'
                      : 'opacity-50 bg-surface-container text-on-surface-variant cursor-not-allowed hover:bg-transparent border border-outline-variant/20'
                }`}
              >
                Cuestionario Espejo
              </button>
              <button
                disabled={progressStep !== 3}
                onClick={progressStep === 3 ? onDossierClick : undefined}
                className={`w-full py-4 rounded-xl font-label font-medium transition-all ${
                  progressStep === 3
                    ? 'bg-primary dark:bg-[#d1e7e4] text-white dark:text-[#2c3e50] shadow-md hover:opacity-90 cursor-pointer'
                    : 'opacity-50 bg-surface-container text-on-surface-variant cursor-not-allowed hover:bg-transparent border border-outline-variant/20'
                }`}
              >
                Dosier Personalizado
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <div className="absolute top-6 right-6">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsVideoModalOpen(false); }}
                className="text-white hover:text-white/80"
              >
                <span className="material-symbols-outlined text-4xl">close</span>
              </button>
            </div>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full overflow-hidden rounded-2xl aspect-[9/16] max-h-[86vh] max-w-sm mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <video 
                className="w-full h-full object-contain bg-black"
                controls 
                playsInline
                controlsList="nodownload"
              >
                <source src="/videos/conoce-la-respuesta.mp4" type="video/mp4" />
                Tu navegador no soporta la etiqueta de vídeo.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
