import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

interface EmocionarioProgress {
  moduloActual: string;
  pantallaActual: number;
  ejercicioActual: number;
  intentosActuales: number;
  modulo0Completado: boolean;
  fundamentosDesbloqueados: boolean;
  puzzlePieces: Record<string, number[]>;
  puzzleCompleted: Record<string, boolean>;
}

const defaultProgress: EmocionarioProgress = {
  moduloActual: "Módulo 0 — El Despertar del Arquitecto",
  pantallaActual: 0,
  ejercicioActual: 0,
  intentosActuales: 0,
  modulo0Completado: false,
  fundamentosDesbloqueados: false,
  puzzlePieces: { "modulo-0": [] },
  puzzleCompleted: {}
};

const MODULO_0_CONTENT = [
  {
    titulo: "La Revelación",
    nivel: "0.1",
    texto: "La mayoría de los adultos nunca recibieron educación formal sobre sus emociones en la infancia. Si a veces sientes que el estrés te supera, debes saber algo importante: la falta de control no es un defecto tuyo, es simplemente una estructura incompleta. A esto lo llamamos el Analfabetismo Emocional Heredado.",
    ejercicios: [
      {
        pregunta: "Cuando una situación te desborda por completo, ¿cuál suele ser tu respuesta automática más frecuente?",
        respuestas: [
          "Salto a la defensiva o intento controlarlo todo.",
          "Me desconecto, miro para otro lado o huyo.",
          "Me quedo paralizado y bloqueado."
        ],
        check: (idx: number, intentos: number) => ({
          correct: true,
          msg: "¡Exacto! Esa es una respuesta de supervivencia completamente normal. Tu cerebro hizo lo que pudo con las herramientas que tenía. Hoy empezamos a actualizar ese sistema operativo para lograr un nuevo alfabetismo emocional adquirido y a no dejar que sean las emociones quienes nos dominen."
        })
      },
      {
        pregunta: "Si de pequeños no nos enseñaron a gestionar la frustración, ¿qué es lo más normal que nos ocurra de adultos ante un problema grave?",
        respuestas: [
          "Que lo resolvamos siempre con calma absoluta.",
          "Que reaccionemos de forma automática para defendernos, sin pensarlo.",
          "Que nuestro cerebro se apague y dejemos de sentir."
        ],
        check: (idx: number, intentos: number) => {
          if (idx === 1) return { correct: true, msg: "¡Eso es! Saltan nuestras defensas automáticas. Pero eso está a punto de cambiar." };
          if (intentos === 0) return { correct: false, msg: "Piénsalo un poco más. Si nos faltan las herramientas, nuestro cuerpo busca protegerse de forma instintiva. Inténtalo de nuevo." };
          return { correct: false, showCorrect: true, msg: "La respuesta correcta es la segunda. Al no tener ese alfabetismo emocional, saltan nuestras defensas automáticas. ¡Pero eso lo vamos a cambiar!" };
        }
      }
    ]
  },
  {
    titulo: "El Paradigma",
    nivel: "0.2",
    texto: "Hasta ahora, probablemente has intentado ser fuerte como un Muro de Ladrillos: aguantando la presión, tragándote lo que sientes hasta acabar rompiéndote. Aquí vamos a construir un Enrejado Vivo: una estructura firme pero flexible, capaz de adaptarse y crecer con los golpes de la vida.",
    ejercicios: [
      {
        pregunta: "¿Qué frase crees que diría una persona que funciona como un Muro de Ladrillos?",
        respuestas: [
          "\"No debería sentirme así, tengo que aguantar y que nadie me vea mal.\"",
          "\"Siento mucha presión ahora mismo, voy a respirar un poco.\"",
          "\"Es normal sentir miedo en esta situación.\""
        ],
        check: (idx: number, intentos: number) => {
          if (idx === 0) return { correct: true, msg: "¡Muy bien! Esa necesidad de aguantarlo todo es la clásica trampa del muro rígido." };
          if (intentos === 0) return { correct: false, msg: "Recuerda que el muro es rígido y oculta lo que siente bajo una apariencia de dureza. Dale una vuelta y elige otra opción." };
          return { correct: false, showCorrect: true, msg: "La correcta es la primera. Esa necesidad rígida de aguantar todo es lo que nos hace quebrar bajo presión. Las otras opciones muestran flexibilidad." };
        }
      },
      {
        pregunta: "Ahora busca la opción del Enrejado Vivo. ¿Qué harías si quieres ser flexible y aprender a calmarte a ti mismo?",
        respuestas: [
          "Evitar pensar en el problema y ponerme a ver la televisión.",
          "Notar la tensión en mi cuerpo, observarla sin juzgarla y decidir qué hacer.",
          "Enfadarte contigo mismo por estar nervioso otra vez."
        ],
        check: (idx: number, intentos: number) => {
          if (idx === 1) return { correct: true, msg: "¡Brillante! Esa es la clave para reconstruirnos: observar sin juzgar nos da verdadera flexibilidad." };
          if (intentos === 0) return { correct: false, msg: "El enrejado no huye del problema ni se ataca a sí mismo; aprende a convivir con la carga para adaptarse. Inténtalo de nuevo." };
          return { correct: false, showCorrect: true, msg: "La respuesta correcta es la segunda. Observar lo que sentimos sin machacarnos es lo que nos permite aprender y no rompernos." };
        }
      }
    ]
  },
  {
    titulo: "Tu Mapa de Ruta",
    nivel: "0.3",
    texto: "El viaje que vas a empezar ocurre tanto en tu cuerpo como en tu mente. Vas a ser el arquitecto de tu propia recuperación. Vamos a seguir un orden claro, desde los cimientos hasta el tejado.",
    ejercicios: []
  },
  {
    titulo: "El Puzle Final",
    nivel: "0.4",
    texto: "Has reunido todas las piezas. Dirígete al panel de puzle de la derecha para ordenarlas y completar el módulo.",
    ejercicios: []
  }
];

const SORT_PIECES = [
  { id: 0, label: "El Cuerpo", desc: "Sentir la emoción físicamente." },
  { id: 2, label: "La Acción", desc: "Usar esa información para actuar mejor." },
  { id: 1, label: "La Mente", desc: "Ponerle nombre a lo que siento." },
];

const Modulo0Panel = ({ progress, updateProgress }: { progress: EmocionarioProgress, updateProgress: (u: Partial<EmocionarioProgress>) => void }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [errorSlot, setErrorSlot] = useState<number | null>(null);

  useEffect(() => {
    setFeedback(null);
    setShowContinue(false);
    setSlots([null, null, null]);
    setSelectedPiece(null);
    setErrorSlot(null);
  }, [progress.pantallaActual, progress.ejercicioActual]);

  if (progress.modulo0Completado) {
    return (
      <div className="mt-4 p-8 bg-surface-container-lowest rounded-[2rem] border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-4 text-center">
        <span className="material-symbols-outlined text-4xl text-primary mb-4">task_alt</span>
        <h4 className="font-headline text-2xl md:text-3xl text-primary mb-4">El Despertar del Arquitecto Completado</h4>
        <p className="text-on-surface-variant text-lg md:text-xl font-light leading-relaxed">
          ¡Cimientos listos! Recuerda siempre esta regla de oro: el cuerpo siempre nota la emoción mucho antes de que la mente la entienda.
        </p>
      </div>
    );
  }

  const p = MODULO_0_CONTENT[progress.pantallaActual];
  const isSort = p.titulo === "Tu Mapa de Ruta";
  const ex = isSort ? null : p.ejercicios[progress.ejercicioActual];

  const handleAnswer = (idx: number) => {
    if (showContinue || isSort || !ex) return;
    const res = ex.check(idx, progress.intentosActuales);
    setFeedback(res.msg);
    if (res.correct || (res as any).showCorrect) {
      // Logic for adding pieces
      let pieceId = -1;
      if (progress.pantallaActual === 0 && progress.ejercicioActual === 0) pieceId = 0;
      if (progress.pantallaActual === 0 && progress.ejercicioActual === 1) pieceId = 1;
      if (progress.pantallaActual === 1 && progress.ejercicioActual === 0) pieceId = 2;
      if (progress.pantallaActual === 1 && progress.ejercicioActual === 1) pieceId = 3;
      
      const currentPieces = (progress.puzzlePieces && progress.puzzlePieces["modulo-0"]) ? progress.puzzlePieces["modulo-0"] : [];
      if (pieceId !== -1 && !currentPieces.includes(pieceId)) {
        updateProgress({
          puzzlePieces: {
            ...progress.puzzlePieces,
            "modulo-0": [...currentPieces, pieceId]
          }
        });
        // Override msg to tell them they got a piece
        setFeedback(res.msg + " ¡Has conseguido una pieza del puzle! Mira en el panel derecho.");
      }

      setShowContinue(true);
    } else {
      updateProgress({ intentosActuales: progress.intentosActuales + 1 });
    }
  };

  const handleSlotClick = (slotIdx: number) => {
    if (selectedPiece === null) return;
    if (selectedPiece === slotIdx) {
      const newSlots = [...slots];
      newSlots[slotIdx] = selectedPiece;
      setSlots(newSlots);
      setSelectedPiece(null);
      if (newSlots.every(s => s !== null)) {
        setFeedback("¡Cimientos listos! Has conseguido la última pieza del puzle. Ahora resuélvelo en el panel derecho.");
        setShowContinue(true);
        const currentPieces = (progress.puzzlePieces && progress.puzzlePieces["modulo-0"]) ? progress.puzzlePieces["modulo-0"] : [];
        if (!currentPieces.includes(4)) {
            updateProgress({
             puzzlePieces: {
               ...progress.puzzlePieces,
               "modulo-0": [...currentPieces, 4]
             }
            });
        }
      }
    } else {
      setErrorSlot(slotIdx);
      setTimeout(() => setErrorSlot(null), 1000);
      setSelectedPiece(null);
    }
  };

  const handleContinue = () => {
    if (isSort) {
      updateProgress({
        pantallaActual: progress.pantallaActual + 1,
        ejercicioActual: 0,
        intentosActuales: 0
      });
    } else if (progress.ejercicioActual + 1 < p.ejercicios.length) {
      updateProgress({
        ejercicioActual: progress.ejercicioActual + 1,
        intentosActuales: 0
      });
    } else {
      updateProgress({
        pantallaActual: progress.pantallaActual + 1,
        ejercicioActual: 0,
        intentosActuales: 0
      });
    }
  };

  return (
    <div className="mt-4 p-6 md:p-10 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 shadow-sm animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
        <h4 className="font-headline text-2xl md:text-3xl text-primary">{p.titulo}</h4>
        <div className="text-secondary tracking-widest uppercase font-bold text-xs inline-block">Nivel {p.nivel}</div>
      </div>
      <p className="text-on-surface-variant text-lg md:text-xl font-light leading-relaxed mb-10">
        {p.texto}
      </p>

      {isSort ? (
        <div className="animate-in fade-in duration-500 delay-150">
          <p className="text-xl md:text-2xl text-primary mb-8 font-light">
            Instrucción: Ordena los 3 pasos fundamentales que vamos a entrenar. Toca las piezas para ponerlas en el orden correcto. Si aciertas la posición, la casilla se pondrá en verde. Si la posición es incorrecta, se pondrá en rojo. No podrás avanzar hasta que todo esté en verde.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h5 className="font-bold tracking-widest uppercase text-xs text-on-surface-variant/50 mb-4">Piezas por clasificar</h5>
              {SORT_PIECES.map(piece => {
                if (slots.includes(piece.id)) return <div key={piece.id} className="h-[76px] md:h-[72px]"></div>;
                return (
                  <button 
                    key={piece.id}
                    onClick={() => { if (!showContinue) setSelectedPiece(piece.id); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all min-h-[76px] md:min-h-[72px] ${selectedPiece === piece.id ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-outline-variant/20 bg-surface text-on-surface hover:border-primary/30'}`}
                  >
                    <span className="font-medium text-lg">{piece.label}</span> — <span className="font-light">{piece.desc}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-4">
              <h5 className="font-bold tracking-widest uppercase text-xs text-on-surface-variant/50 mb-4">Tu orden</h5>
              {[0, 1, 2].map(slotIdx => {
                const filled = slots[slotIdx] !== null;
                const isError = errorSlot === slotIdx;
                let c = "";
                if (filled) c = "bg-[#dcedc8] dark:bg-[#33691e]/30 border-[#4caf50] text-[#2e7d32] dark:text-[#aed581]";
                else if (isError) c = "bg-[#ffcdd2] dark:bg-[#d32f2f]/30 border-[#f44336]";
                else if (selectedPiece !== null) c = "bg-primary/5 border-primary border-dashed hover:bg-primary/10 cursor-pointer shadow-inner";
                else c = "bg-surface-container border-outline-variant/30 border-dashed text-on-surface-variant/50";
                
                return (
                  <div 
                    key={slotIdx}
                    onClick={() => { if (!filled) handleSlotClick(slotIdx); }}
                    className={`w-full min-h-[76px] md:min-h-[72px] flex items-center p-4 rounded-xl border-2 transition-all ${c}`}
                  >
                    {filled && (
                       <span>
                         <span className="font-medium text-lg">{SORT_PIECES.find(p => p.id === slots[slotIdx])?.label}</span> — <span className="font-light">{SORT_PIECES.find(p => p.id === slots[slotIdx])?.desc}</span>
                       </span>
                    )}
                    {!filled && <span className="font-light text-sm tracking-wide">Posición {slotIdx + 1}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : p.titulo === "El Puzle Final" ? (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center py-10">
           <span className="material-symbols-outlined text-5xl text-primary mb-6 animate-pulse">extension</span>
           <p className="text-xl md:text-2xl text-on-surface-variant font-light">
             Resuelve el puzle en el panel de la derecha para completar este nivel.
           </p>
        </div>
      ) : (
        <div key={progress.ejercicioActual} className="animate-in fade-in slide-in-from-right-8 duration-500">
          <p className="text-xl md:text-2xl text-primary font-medium leading-relaxed mb-6">
            {ex?.pregunta}
          </p>
          <div className="space-y-3 mb-8">
            {ex?.respuestas?.map((r, idx) => (
              <button 
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showContinue}
                className="w-full text-left p-5 md:p-6 rounded-2xl border border-outline-variant/20 bg-surface-container hover:bg-surface-container-high transition-all text-lg md:text-xl font-light disabled:opacity-70 disabled:cursor-default"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {feedback && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 md:p-8 bg-surface-container-high rounded-2xl border-l-4 border-primary mb-8">
          <p className="text-lg md:text-xl font-medium text-primary leading-relaxed">
            {feedback}
          </p>
        </div>
      )}
      
      {showContinue && (
        <button 
          onClick={handleContinue}
          className="w-full bg-primary text-white py-5 md:py-6 rounded-2xl text-lg md:text-xl font-bold tracking-wider hover:bg-secondary transition-colors shadow-lg"
        >
          Continuar
        </button>
      )}
    </div>
  );
};

const PuzzleProgressPanel = ({ selectedModule, progress, updateProgress }: { selectedModule: string | null, progress: EmocionarioProgress, updateProgress: (u: Partial<EmocionarioProgress>) => void }) => {
  if (!selectedModule) return null;

  const isModulo0 = selectedModule === "Módulo 0 — El Despertar del Arquitecto";
  const piecesCollected = (progress.puzzlePieces && progress.puzzlePieces["modulo-0"]) || [];
  const puzzleCompleted = (progress.puzzleCompleted && progress.puzzleCompleted["modulo-0"]) || false;

  const totalPieces = 5;
  const currentPiecesCount = isModulo0 ? piecesCollected.length : 0;
  
  const imageMap: Record<string, string> = {
    "Módulo 0 — El Despertar del Arquitecto": "/images/puzle_modulo_0.jpg",
    "I. Fundamentos y Diagnóstico": "/images/puzle_modulo_1.jpg",
    "II. Conciencia Somática": "/images/puzle_modulo_2.jpg",
    "III. Flexibilidad Cognitiva": "/images/puzle_modulo_3.jpg",
    "IV. Fortalezas de Carácter": "/images/puzle_modulo_4.jpg",
    "V. Integración y Acción Consciente": "/images/puzle_modulo_5.jpg",
    "Crisis, Pérdida y Salud": "/images/puzle_modulo_crisis.jpg",
    "Amor y Desamor": "/images/puzle_modulo_amor.jpg",
    "Trabajo y Finanzas": "/images/puzle_modulo_trabajo.jpg",
  };

  const puzzleImage = imageMap[selectedModule] || "/images/puzle_modulo_0.jpg";

  const [inResolution, setInResolution] = useState(false);
  const [puzzleSlots, setPuzzleSlots] = useState<(number | null)[]>(Array(totalPieces).fill(null));
  const [selectedPuzzlePiece, setSelectedPuzzlePiece] = useState<number | null>(null);

  useEffect(() => {
    if (currentPiecesCount === totalPieces && !puzzleCompleted && isModulo0) {
      setInResolution(true);
    } else {
      setInResolution(false);
    }
  }, [currentPiecesCount, puzzleCompleted, isModulo0, totalPieces]);

  const handlePuzzleSlotClick = (slotIdx: number) => {
    if (selectedPuzzlePiece === null) {
        if (puzzleSlots[slotIdx] !== null) {
            const newSlots = [...puzzleSlots];
            newSlots[slotIdx] = null;
            setPuzzleSlots(newSlots);
        }
        return;
    }
    
    const newSlots = [...puzzleSlots];
    const prevIdx = newSlots.findIndex(p => p === selectedPuzzlePiece);
    if (prevIdx !== -1) {
        newSlots[prevIdx] = null;
    }
    
    newSlots[slotIdx] = selectedPuzzlePiece;
    setPuzzleSlots(newSlots);
    setSelectedPuzzlePiece(null);

    if (newSlots.every((s, i) => s === i)) {
      updateProgress({
        puzzleCompleted: {
          ...progress.puzzleCompleted,
          "modulo-0": true
        },
        modulo0Completado: true,
        fundamentosDesbloqueados: true
      });
      setInResolution(false);
    }
  };

  return (
    <div className="w-full h-full p-8 md:p-10 bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/20 shadow-xl overflow-hidden relative flex flex-col min-h-[500px]">
      <div className="absolute inset-0 bg-transparent"></div>
      
      <div className="relative z-10 flex-grow flex flex-col items-center">
        <h3 className="font-headline text-2xl md:text-3xl text-primary mb-2 text-center">Puzle del módulo</h3>
        <p className="text-sm font-bold tracking-widest uppercase text-on-surface-variant/70 mb-8 text-center">{selectedModule}</p>
        
        {puzzleCompleted ? (
           <div className="flex flex-col items-center my-auto animate-in fade-in zoom-in duration-700">
              <span className="material-symbols-outlined text-green-500 text-6xl mb-6">task_alt</span>
              <h4 className="font-headline text-2xl text-center mb-6">Módulo Completado</h4>
              
              <div className="w-full max-w-[280px] aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
                 <img src={puzzleImage} alt="Puzzle completed" className="w-full h-full object-cover relative z-10" />
              </div>
           </div>
        ) : inResolution ? (
           <div className="w-full flex-grow flex flex-col items-center animate-in fade-in duration-500">
               <p className="font-medium text-center text-primary mb-6 text-lg">Ordena el puzle para completar el módulo.</p>
               
               <div className="w-full bg-surface-container-high/50 rounded-2xl p-4 mb-8 shadow-inner border border-outline-variant/10">
                   <p className="text-xs uppercase tracking-widest font-bold text-center mb-4 text-on-surface-variant/50">Piezas Disponibles</p>
                   <div className="flex flex-wrap justify-center gap-2 md:gap-4 min-h-[80px]">
                       {piecesCollected.filter(p => !puzzleSlots.includes(p)).map(p => (
                           <div 
                             key={`pool-${p}`}
                             onClick={() => setSelectedPuzzlePiece(p === selectedPuzzlePiece ? null : p)}
                             className={`w-14 h-14 md:w-20 md:h-20 rounded-lg cursor-pointer transition-all border-2 flex items-center justify-center text-white font-bold drop-shadow-md ${selectedPuzzlePiece === p ? 'border-primary ring-4 ring-primary/30 scale-110 shadow-xl' : 'border-outline-variant/50 hover:border-primary/80'}`}
                             style={{
                               backgroundImage: `url(${puzzleImage})`,
                               backgroundColor: "rgba(0,0,0,0.3)", // slight tint if image misses
                               backgroundBlendMode: "overlay",
                               backgroundSize: "500% 100%",
                               backgroundPosition: `${(p / 4) * 100}% 0%`
                             }}
                           >
                            <span className="opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-full w-6 h-6 flex items-center justify-center">{p+1}</span>
                           </div>
                       ))}
                       {piecesCollected.filter(p => !puzzleSlots.includes(p)).length === 0 && (
                           <span className="text-sm text-on-surface-variant/50 font-light py-4">Has colocado todas las piezas.</span>
                       )}
                   </div>
               </div>
               
               <div className="w-full mt-auto mb-auto">
                   <p className="text-xs uppercase tracking-widest font-bold text-center mb-4 text-on-surface-variant/50">Puzle Final</p>
                   {/* Aspect video container for 5 pieces */}
                   <div className="w-full max-w-[400px] mx-auto flex">
                       {Array.from({length: totalPieces}).map((_, i) => (
                           <div 
                             key={`slot-${i}`}
                             onClick={() => handlePuzzleSlotClick(i)}
                             className={`flex-1 aspect-[1/5] md:aspect-[3/10] border text-transparent ${puzzleSlots[i] !== null ? 'border-transparent' : (selectedPuzzlePiece !== null ? 'border-primary/50 border-dashed bg-primary/5 cursor-pointer hover:bg-primary/20' : 'border-outline-variant/30 border-dashed')} transition-all flex items-center justify-center`}
                           >
                               {puzzleSlots[i] !== null && (
                                   <div 
                                      className="w-full h-full border border-white/20 select-none shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                                      style={{
                                        backgroundImage: `url(${puzzleImage})`,
                                        backgroundSize: "500% 100%",
                                        backgroundPosition: `${(puzzleSlots[i]! / 4) * 100}% 0%`
                                      }}
                                   />
                               )}
                           </div>
                       ))}
                   </div>
               </div>
           </div>
        ) : (
           <div className="w-full flex-grow flex flex-col items-center justify-center -mt-6">
             <div className="text-center mb-10">
               <span className="text-base font-bold bg-surface-container-high px-5 py-2.5 rounded-full shadow-sm text-on-surface-variant">
                 Piezas conseguidas: {currentPiecesCount} / {totalPieces}
               </span>
             </div>
             
             <div className="w-full max-w-[320px] aspect-video rounded-2xl bg-surface-container-high/30 border-2 border-dashed border-outline-variant/20 relative overflow-visible flex flex-wrap justify-center content-center p-6 shadow-inner">
                 <div className="absolute inset-0 opacity-10 blur-sm mix-blend-luminosity rounded-2xl overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
                     <img src={puzzleImage} alt="" className="w-full h-full object-cover" />
                 </div>
                 
                 <div className="relative z-10 w-full h-full">
                     {piecesCollected.map((p, idx) => {
                         const positions = [
                             { top: '10%', left: '10%' },
                             { top: '50%', left: '70%' },
                             { top: '20%', left: '40%' },
                             { top: '60%', left: '10%' },
                             { top: '30%', left: '80%' }
                         ];
                         return (
                             <div 
                                key={idx}
                                className="absolute w-[20%] h-full rounded shadow-xl border border-white/20 animate-in zoom-in"
                                style={{
                                   backgroundImage: `url(${puzzleImage})`,
                                   backgroundSize: "500% 100%",
                                   backgroundPosition: `${(p / 4) * 100}% 0%`,
                                   top: positions[p]?.top || '50%',
                                   left: positions[p]?.left || '50%',
                                   transform: `translate(-50%, -50%) rotate(${Math.sin(p * 100) * 20}deg) scale(1.1)`,
                                }}
                             />
                         );
                     })}
                 </div>
                 
                 {currentPiecesCount === 0 && (
                     <p className="absolute inset-0 flex items-center justify-center text-on-surface-variant/40 text-sm font-light italic text-center p-4">Actitud activa: completa los ejercicios para ganar piezas.</p>
                 )}
                 {!isModulo0 && (
                     <p className="absolute bottom-4 left-0 right-0 text-on-surface-variant/40 text-xs font-light text-center z-20">Este módulo aún no tiene piezas desbloqueables.</p>
                 )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default function Emocionario() {
  const navigate = useNavigate();
  const [accessGranted, setAccessGranted] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [progress, setProgress] = useState<EmocionarioProgress>(defaultProgress);

  useEffect(() => {
    // Check if access was granted via sessionStorage
    if (sessionStorage.getItem('emocionarioAccess') === 'true') {
      setAccessGranted(true);
    }
    
    // Load progress
    const saved = localStorage.getItem("emocionarioProgress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress({
          ...defaultProgress,
          ...parsed,
          puzzlePieces: parsed.puzzlePieces || { "modulo-0": [] },
          puzzleCompleted: parsed.puzzleCompleted || {}
        });
      } catch(e) {}
    }
  }, []);

  const updateProgress = (updates: Partial<EmocionarioProgress>) => {
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);
    localStorage.setItem("emocionarioProgress", JSON.stringify(newProgress));
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 pt-32">
        <SEO 
          title="Acceso Privado | Emocionario" 
          description="Contenido exclusivo de aprendizaje emocional."
          noIndex={true}
        />
        <div className="max-w-md w-full bg-surface-container-lowest p-10 md:p-12 rounded-3xl border border-outline-variant/10 shadow-2xl text-center">
          <span className="material-symbols-outlined text-5xl md:text-6xl text-primary mb-6">lock</span>
          <h1 className="font-headline text-3xl md:text-4xl text-primary mb-4">Acceso privado</h1>
          <p className="text-on-surface-variant text-lg font-light mb-8">
            Para acceder a esta sección debes validarte desde tus herramientas o contactar con el soporte.
          </p>
          <button 
            onClick={() => navigate('/herramientas')}
            className="w-full bg-primary text-white py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-secondary transition-colors"
          >
            Volver a herramientas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-24 font-sans">
      <SEO 
        title="Emocionario | Aprendizaje de gestión emocional" 
        description="Entorno privado de aprendizaje emocional con módulos de estudio y una futura experiencia de aprendizaje para entrenar gestión de emociones."
        noIndex={true}
      />
      
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Header */}
        <header className="mb-24 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-headline text-5xl md:text-6xl text-primary mb-6">Aprender a reconocer, ordenar y entrenar tus emociones paso a paso.</h1>
          <p className="text-on-surface-variant text-lg font-light leading-relaxed">
            Este espacio reúne el método de gestión emocional y un futuro recorrido de aprendizaje para practicarlo. Primero comprendes los módulos; después entrenas con ejercicios, preguntas y pequeños desafíos.
          </p>
        </header>

        {/* Sección: Material de Estudio */}
        <section className="mb-32">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-4xl md:text-5xl text-primary mb-4">Material de estudio</h2>
            <p className="text-on-surface-variant text-lg lg:text-xl font-light">
              Las bases del método de gestión de emociones organizadas por módulos.
            </p>
          </div>

          {/* Fila base del método */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            {/* Texto Explicativo */}
            <div className="order-1 lg:order-1">
              <h3 className="font-headline text-3xl md:text-4xl text-primary mb-6">Método Gestión de Emociones</h3>
              <p className="text-on-surface-variant text-lg font-light leading-relaxed mb-6">
                Este dosier reúne las bases del aprendizaje emocional en cinco módulos progresivos. La propuesta funciona como una escalera práctica: primero observas lo que ocurre dentro, después aprendes a detener la reacción automática, ordenas tus pensamientos, activas tus recursos personales y finalmente aplicas lo aprendido a situaciones reales.
              </p>
              <p className="text-on-surface-variant text-lg font-light leading-relaxed opacity-80">
                El objetivo no es dejar de sentir, sino dejar de vivir controlado por lo que sientes. Cada módulo traduce la gestión emocional en acciones, ejercicios y pequeñas decisiones entrenables.
              </p>
            </div>
            
            {/* Tarjeta Método */}
            <div 
              className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-surface-container-highest border border-outline-variant/10 shadow-xl min-h-[400px] w-full cursor-pointer transition-all hover:shadow-2xl order-2 lg:order-2"
              onClick={() => window.open('/images/gestion-emocional.pdf', '_blank', 'noopener,noreferrer')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_metodo_gestion_emociones.jpg" alt="Método Gestión de Emociones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center text-white text-center">
                <div className="transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0 w-full flex flex-col items-center">
                  <div className="bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md max-w-lg w-full">
                    <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl mb-8">
                      Abre el dosier base del método y recorre la escalera de aprendizaje emocional.
                    </p>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open('/images/gestion-emocional.pdf', '_blank', 'noopener,noreferrer'); 
                      }} 
                      className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Ver documento <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_1.jpg" alt="Módulo I" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className="absolute bottom-8 left-8 md:bottom-auto md:left-auto font-headline text-2xl text-white drop-shadow-md transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">Módulo I</h4>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                    Mapea tu estado interno y descubre tus primeras señales de autocontrol.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-primary tracking-widest uppercase font-bold text-xs mb-3">Módulo I</p>
              <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">Fundamentos y Diagnóstico</h3>
              <p className="text-on-surface-variant text-lg font-light leading-relaxed">
                Aprenderás a ubicar tu punto de partida: cómo se expresa tu malestar, qué señales corporales aparecen y qué patrones se repiten antes de perder el control. Es el mapa inicial para dejar de funcionar a ciegas.
              </p>
            </div>
          </div>

          {/* Módulo 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 lg:text-right">
            <div className="order-1 lg:order-1 lg:pl-12">
              <p className="text-primary tracking-widest uppercase font-bold text-xs mb-3">Módulo II</p>
              <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">Conciencia Somática</h3>
              <p className="text-on-surface-variant text-lg font-light leading-relaxed">
                Este módulo entrena la capacidad de escuchar el cuerpo antes de reaccionar. La pausa, la respiración y la observación física se convierten en una puerta de entrada para regular la intensidad emocional.
              </p>
            </div>
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_2.jpg" alt="Módulo II" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className="absolute bottom-8 left-8 md:bottom-auto md:left-auto font-headline text-2xl text-white drop-shadow-md transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">Módulo II</h4>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                    Entrena la pausa corporal antes de que la emoción tome el mando.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_3.jpg" alt="Módulo III" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className="absolute bottom-8 left-8 md:bottom-auto md:left-auto font-headline text-2xl text-white drop-shadow-md transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">Módulo III</h4>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                    Aprende a tomar distancia de pensamientos rígidos y bucles mentales.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-primary tracking-widest uppercase font-bold text-xs mb-3">Módulo III</p>
              <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">Flexibilidad Cognitiva</h3>
              <p className="text-on-surface-variant text-lg font-light leading-relaxed">
                Trabaja la relación con los pensamientos. No se trata de discutir con la mente, sino de aprender a separarte de frases internas rígidas, etiquetas y bucles que aumentan el sufrimiento.
              </p>
            </div>
          </div>

          {/* Módulo 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 lg:text-right">
            <div className="order-1 lg:order-1 lg:pl-12">
              <p className="text-primary tracking-widest uppercase font-bold text-xs mb-3">Módulo IV</p>
              <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">Fortalezas de Carácter</h3>
              <p className="text-on-surface-variant text-lg font-light leading-relaxed">
                Identifica los recursos personales que ya existen en ti: valores, capacidades, hábitos útiles y formas sanas de responder. El objetivo es construir desde lo que sí sostiene, no solo desde lo que duele.
              </p>
            </div>
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_4.jpg" alt="Módulo IV" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className="absolute bottom-8 left-8 md:bottom-auto md:left-auto font-headline text-2xl text-white drop-shadow-md transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">Módulo IV</h4>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                    Reconoce tus recursos internos y conviértelos en herramientas activas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_5.jpg" alt="Módulo V" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className="absolute bottom-8 left-8 md:bottom-auto md:left-auto font-headline text-2xl text-white drop-shadow-md transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">Módulo V</h4>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                    Convierte lo aprendido en decisiones, límites y acciones concretas.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-primary tracking-widest uppercase font-bold text-xs mb-3">Módulo V</p>
              <h3 className="font-headline text-3xl md:text-4xl text-primary mb-4">Integración y Acción Consciente</h3>
              <p className="text-on-surface-variant text-lg font-light leading-relaxed">
                Cierra la escalera de aprendizaje llevando lo practicado a decisiones reales. Aquí se transforma la comprensión emocional en acciones concretas, límites, elecciones y nuevas formas de responder.
              </p>
            </div>
          </div>

          {/* Especialidades */}
          <div className="my-16 border-t border-outline-variant/10 max-w-4xl mx-auto"></div>
          
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl text-primary mb-4">Módulos de Especialidad (Gestión de Crisis)</h2>
            <p className="text-on-surface-variant text-lg font-light">
              Aplicaciones específicas del método para momentos vitales de mayor carga emocional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {/* Especialidad 1 */}
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container border border-outline-variant/10 shadow-lg min-h-[380px] w-full transition-all hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_crisis.jpg" alt="Crisis, Pérdida y Salud" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="absolute bottom-8 left-0 right-0 md:bottom-auto md:left-auto md:right-auto flex flex-col items-center justify-center transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">
                  <span className="material-symbols-outlined text-4xl mb-3 drop-shadow-md">healing</span>
                  <h4 className="font-headline text-2xl drop-shadow-md">Crisis, Pérdida y Salud</h4>
                </div>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-xl md:text-2xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    Protocolos de estabilización emocional y narrativa de trauma para momentos de pérdida, enfermedad, miedo o ruptura del equilibrio personal.
                  </p>
                </div>
              </div>
            </div>
            {/* Especialidad 2 */}
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container border border-outline-variant/10 shadow-lg min-h-[380px] w-full transition-all hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_amor.jpg" alt="Amor y Desamor" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="absolute bottom-8 left-0 right-0 md:bottom-auto md:left-auto md:right-auto flex flex-col items-center justify-center transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">
                  <span className="material-symbols-outlined text-4xl mb-3 drop-shadow-md">favorite</span>
                  <h4 className="font-headline text-2xl drop-shadow-md">Amor y Desamor</h4>
                </div>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-xl md:text-2xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    Trabajo con el Adulto Saludable para comprender heridas afectivas, dependencia emocional, ruptura, apego y reconstrucción interna.
                  </p>
                </div>
              </div>
            </div>
            {/* Especialidad 3 */}
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container border border-outline-variant/10 shadow-lg min-h-[380px] w-full transition-all hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_trabajo.jpg" alt="Trabajo y Finanzas" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500 md:group-hover:backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="absolute bottom-8 left-0 right-0 md:bottom-auto md:left-auto md:right-auto flex flex-col items-center justify-center transition-all duration-500 md:group-hover:opacity-0 md:group-hover:translate-y-4">
                  <span className="material-symbols-outlined text-4xl mb-3 drop-shadow-md">work</span>
                  <h4 className="font-headline text-2xl drop-shadow-md">Trabajo y Finanzas</h4>
                </div>
                <div className="w-full transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-3 md:group-hover:translate-y-0">
                  <p className="font-headline text-xl md:text-2xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    Ejercicios para alinear decisiones, límites y acciones con valores personales cuando el estrés laboral, la incertidumbre económica o la presión externa desordenan el sistema emocional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emocionario gamificado */}
        <section className="pt-24 border-t border-outline-variant/10">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-4xl md:text-5xl text-primary mb-4">Emocionario</h2>
            <p className="text-on-surface-variant text-lg lg:text-xl font-light">
              Un divertido recorrido para aprender a dominar tus emociones practicando.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Columna Izquierda: Índice */}
            <div className="flex flex-col">
              <h3 className="font-headline text-2xl md:text-3xl text-primary mb-8">
                Selecciona un módulo para iniciar tu aventura emocional.
              </h3>

              {/* Bloque Módulo 0 */}
              <div className="mb-10">
                <button 
                  onClick={() => setSelectedModule("Módulo 0 — El Despertar del Arquitecto")}
                  className={`w-full text-left px-6 py-4 rounded-2xl border transition-all ${selectedModule === "Módulo 0 — El Despertar del Arquitecto" ? 'bg-white text-[#162839] border-primary shadow-lg scale-[1.02] dark:bg-white dark:text-[#162839] dark:border-white' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/30'} font-light text-lg`}
                >
                  Módulo 0 — El Despertar del Arquitecto
                </button>
                {selectedModule === "Módulo 0 — El Despertar del Arquitecto" && (
                  <Modulo0Panel progress={progress} updateProgress={updateProgress} />
                )}
              </div>
              
              {/* Bloque 1: El Viaje Interior */}
              <div className="mb-10">
                <h4 className="font-headline text-xl text-primary mb-4">El Viaje Interior (Fundamentos)</h4>
                <ul className="space-y-3">
                  {[
                    "I. Fundamentos y Diagnóstico",
                    "II. Conciencia Somática",
                    "III. Flexibilidad Cognitiva",
                    "IV. Fortalezas de Carácter",
                    "V. Integración y Acción Consciente"
                  ].map((modulo, idx) => {
                    const isLocked = !progress.fundamentosDesbloqueados; 
                    return (
                      <li key={idx}>
                        <button 
                          onClick={() => setSelectedModule(modulo)}
                          className={`w-full text-left px-6 py-4 rounded-2xl border transition-all ${selectedModule === modulo ? 'bg-white text-[#162839] border-primary shadow-lg scale-[1.02] dark:bg-white dark:text-[#162839] dark:border-white' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/30'} font-light text-lg ${isLocked ? 'opacity-70' : ''}`}
                        >
                          {modulo}
                        </button>
                        {selectedModule === modulo && (
                          <div className="mt-4 p-8 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 shadow-sm animate-in fade-in slide-in-from-top-4">
                            {isLocked ? (
                              <div className="text-center text-on-surface-variant flex flex-col items-center">
                                <span className="material-symbols-outlined text-3xl mb-3">lock</span>
                                <p className="font-light text-lg">
                                  Completa primero El Despertar del Arquitecto para desbloquear el viaje interior.
                                </p>
                              </div>
                            ) : (
                              <p className="text-on-surface-variant font-light text-center italic">
                                Aquí se desplegarán preguntas, explicaciones y respuestas del módulo seleccionado.
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Bloque 2: Módulos Especiales */}
              <div className="mb-10 flex-grow">
                <h4 className="font-headline text-xl text-primary mb-4">Módulos Especiales (Gestión de Crisis)</h4>
                {(() => {
                  const fundamentosCompletados = false;
                  
                  if (!fundamentosCompletados) {
                    return (
                      <div className="p-6 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 flex flex-col items-center justify-center text-center text-on-surface-variant opacity-80 h-full min-h-[140px]">
                        <span className="material-symbols-outlined text-3xl mb-3">lock</span>
                        <p className="font-light">
                          Completa primero los cinco módulos de El Viaje Interior para desbloquear las herramientas de gestión de crisis.
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <ul className="space-y-3">
                      {[
                        "Crisis, Pérdida y Salud",
                        "Amor y Desamor",
                        "Trabajo y Finanzas"
                      ].map((modulo, idx) => (
                        <li key={idx}>
                          <button 
                            onClick={() => setSelectedModule(modulo)}
                            className={`w-full text-left px-6 py-4 rounded-2xl border transition-all ${selectedModule === modulo ? 'bg-white text-[#162839] border-primary shadow-lg scale-[1.02] dark:bg-white dark:text-[#162839] dark:border-white' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/30'} font-light text-lg`}
                          >
                            {modulo}
                          </button>
                          {selectedModule === modulo && (
                            <div className="mt-4 p-8 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 shadow-sm animate-in fade-in slide-in-from-top-4">
                              <p className="text-on-surface-variant font-light text-center italic">
                                Aquí se desplegarán preguntas, explicaciones y respuestas del módulo seleccionado.
                              </p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>

            {/* Columna Derecha: Panel Puzle Emocionario */}
            <div className="flex justify-center items-stretch h-full min-h-[500px]">
              <PuzzleProgressPanel selectedModule={selectedModule} progress={progress} updateProgress={updateProgress} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
