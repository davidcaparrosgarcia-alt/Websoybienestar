import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

const Modulo0Panel = ({ progress, updateProgress, onPieceEarned, onAdvanceRequest, panelRef }: { progress: EmocionarioProgress, updateProgress: (u: Partial<EmocionarioProgress>) => void, onPieceEarned?: () => void, onAdvanceRequest?: () => void, panelRef?: React.RefObject<HTMLDivElement | null> }) => {
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
      <div ref={panelRef} className="mt-4 p-8 bg-surface-container-lowest rounded-[2rem] border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-4 text-center">
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
        setFeedback(res.msg + " ¡Has conseguido una pieza del puzle! Mira en el panel derecho o desliza hacia abajo.");
        if (onPieceEarned) onPieceEarned();
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
        setFeedback("¡Cimientos listos! Has conseguido las dos últimas piezas del puzle. Ahora ordénalo en el panel derecho o deslizando hacia abajo.");
        setShowContinue(true);
        const currentPieces = (progress.puzzlePieces && progress.puzzlePieces["modulo-0"]) ? progress.puzzlePieces["modulo-0"] : [];
        const newPieces = [...currentPieces];
        [4, 5].forEach((pId) => {
          if (!newPieces.includes(pId)) newPieces.push(pId);
        });
        if (newPieces.length > currentPieces.length) {
            updateProgress({
             puzzlePieces: {
               ...progress.puzzlePieces,
               "modulo-0": newPieces
             }
            });
            if (onPieceEarned) onPieceEarned();
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
    <div ref={panelRef} className="mt-4 p-6 md:p-10 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 shadow-sm animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
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
          className="w-full bg-primary text-on-primary py-5 md:py-6 rounded-2xl text-lg md:text-xl font-bold tracking-wider hover:bg-secondary transition-colors shadow-lg"
        >
          Continuar
        </button>
      )}
    </div>
  );
};

export interface PuzzlePieceDef {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  path: string;
}

export const MODULE_PUZZLE_CONFIG: Record<string, { moduleId: string, title: string, image: string, totalPieces: number, layoutKey: "5-special" | "6-grid" | "8-grid" | "10-grid" | "12-grid" }> = {
  "Módulo 0 — El Despertar del Arquitecto": {
    moduleId: "modulo-0",
    title: "Módulo 0",
    image: "/images/puzle_modulo_0.jpg",
    totalPieces: 6,
    layoutKey: "6-grid"
  },
  "I. Fundamentos y Diagnóstico": {
    moduleId: "modulo-1",
    title: "Módulo I",
    image: "/images/puzle_modulo_1.jpg",
    totalPieces: 8,
    layoutKey: "8-grid"
  },
  "II. Conciencia Somática": {
    moduleId: "modulo-2",
    title: "Módulo II",
    image: "/images/puzle_modulo_2.jpg",
    totalPieces: 8,
    layoutKey: "8-grid"
  },
  "III. Flexibilidad Cognitiva": {
    moduleId: "modulo-3",
    title: "Módulo III",
    image: "/images/puzle_modulo_3.jpg",
    totalPieces: 10,
    layoutKey: "10-grid"
  },
  "IV. Fortalezas de Carácter": {
    moduleId: "modulo-4",
    title: "Módulo IV",
    image: "/images/fondo_modulo_4.jpg",
    totalPieces: 10,
    layoutKey: "10-grid"
  },
  "V. Integración y Acción Consciente": {
    moduleId: "modulo-5",
    title: "Módulo V",
    image: "/images/fondo_modulo_5.jpg",
    totalPieces: 10,
    layoutKey: "10-grid"
  },
  "Crisis, Pérdida y Salud": {
    moduleId: "crisis",
    title: "Crisis, Pérdida y Salud",
    image: "/images/fondo_modulo_crisis.jpg",
    totalPieces: 12,
    layoutKey: "12-grid"
  },
  "Amor y Desamor": {
    moduleId: "amor",
    title: "Amor y Desamor",
    image: "/images/fondo_modulo_amor.jpg",
    totalPieces: 12,
    layoutKey: "12-grid"
  },
  "Trabajo y Finanzas": {
    moduleId: "trabajo",
    title: "Trabajo y Finanzas",
    image: "/images/fondo_modulo_trabajo.jpg",
    totalPieces: 12,
    layoutKey: "12-grid"
  }
};

function generateInterlockingPuzzlePieces(cols: number, rows: number): PuzzlePieceDef[] {
  const BOARD_W = 200;
  const BOARD_H = 300;
  const w = BOARD_W / cols;
  const h = BOARD_H / rows;
  const pieces: PuzzlePieceDef[] = [];
  
  const hEdges: number[][] = []; 
  const vEdges: number[][] = [];
  
  for (let r = 0; r <= rows; r++) {
    hEdges.push([]);
    for (let c = 0; c < cols; c++) hEdges[r].push(((r * 13 + c * 17) % 2 === 0) ? 1 : -1);
  }
  for (let r = 0; r < rows; r++) {
    vEdges.push([]);
    for (let c = 0; c <= cols; c++) vEdges[r].push(((r * 19 + c * 23) % 2 === 0) ? 1 : -1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      const x = c * w;
      const y = r * h;
      
      const TAB_W = w * 0.18;
      const TAB_H = h * 0.18;
      
      let path = `M ${x} ${y}`;
      
      // Top edge
      if (r === 0) {
        path += ` L ${x + w} ${y}`;
      } else {
        const sign = hEdges[r][c];
        path += ` L ${x + w/2 - TAB_W} ${y}`;
        path += ` C ${x + w/2 - TAB_W} ${y + sign*TAB_H}, ${x + w/2 + TAB_W} ${y + sign*TAB_H}, ${x + w/2 + TAB_W} ${y}`;
        path += ` L ${x + w} ${y}`;
      }
      
      // Right edge
      if (c === cols - 1) {
        path += ` L ${x + w} ${y + h}`;
      } else {
        const sign = vEdges[r][c + 1];
        path += ` L ${x + w} ${y + h/2 - TAB_H}`;
        path += ` C ${x + w + sign*TAB_W} ${y + h/2 - TAB_H}, ${x + w + sign*TAB_W} ${y + h/2 + TAB_H}, ${x + w} ${y + h/2 + TAB_H}`;
        path += ` L ${x + w} ${y + h}`;
      }
      
      // Bottom edge
      if (r === rows - 1) {
        path += ` L ${x} ${y + h}`;
      } else {
        const sign = hEdges[r + 1][c];
        path += ` L ${x + w/2 + TAB_W} ${y + h}`;
        path += ` C ${x + w/2 + TAB_W} ${y + h + sign*TAB_H}, ${x + w/2 - TAB_W} ${y + h + sign*TAB_H}, ${x + w/2 - TAB_W} ${y + h}`;
        path += ` L ${x} ${y + h}`;
      }
      
      // Left edge
      if (c === 0) {
        path += ` L ${x} ${y}`;
      } else {
        const sign = vEdges[r][c];
        path += ` L ${x} ${y + h/2 + TAB_H}`;
        path += ` C ${x + sign*TAB_W} ${y + h/2 + TAB_H}, ${x + sign*TAB_W} ${y + h/2 - TAB_H}, ${x} ${y + h/2 - TAB_H}`;
        path += ` L ${x} ${y}`;
      }
      
      path += " Z";
      pieces.push({ id, x, y, w, h, path });
    }
  }
  return pieces;
}

export const PUZZLE_LAYOUTS: Record<string, PuzzlePieceDef[]> = {
  "6-grid": generateInterlockingPuzzlePieces(2, 3),
  "8-grid": generateInterlockingPuzzlePieces(2, 4),
  "10-grid": generateInterlockingPuzzlePieces(2, 5),
  "12-grid": generateInterlockingPuzzlePieces(3, 4)
};

const PuzzlePieceSvg = ({
  pieceId,
  puzzleImage,
  layoutPieces,
  size,
  className = "",
  onClick,
  selected = false
}: {
  pieceId: number,
  puzzleImage: string,
  layoutPieces: PuzzlePieceDef[],
  size: "reward" | "pool" | "slot",
  className?: string,
  onClick?: () => void,
  selected?: boolean
}) => {
  const piece = layoutPieces.find(p => p.id === pieceId) || layoutPieces[0];
  
  let wrapperClass = "";
  if (size === "reward") {
     wrapperClass = "w-[120px] md:w-[160px] aspect-[2/3]";
  } else if (size === "pool") {
     wrapperClass = "w-[80px] md:w-[100px] aspect-[2/3]";
  } else if (size === "slot") {
     wrapperClass = "w-full h-full absolute top-0 left-0";
  }

  return (
    <div 
      className={`relative transition-all duration-300 ${wrapperClass} ${className} ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${selected ? 'scale-[1.12] ring-4 ring-primary ring-offset-2 ring-offset-surface-container-lowest rounded-2xl shadow-xl z-20' : ''}`}
      onClick={onClick}
      style={size !== "slot" ? { filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.3))" } : {}}
    >
      <svg
        viewBox={`${piece.x} ${piece.y} ${piece.w} ${piece.h}`}
        className="w-full h-full drop-shadow-sm overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={`clip-${piece.id}-${size}`}>
            <path d={piece.path} />
          </clipPath>
        </defs>
        <image
          href={puzzleImage}
          x="0"
          y="0"
          width="200"
          height="300"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#clip-${piece.id}-${size})`}
        />
        <path
          d={piece.path}
          fill="transparent"
          stroke="currentColor"
          className="text-white/40"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

const AnimatedTitle = ({ text }: { text: string }) => (
  <span>
    {text.split("").map((char, i) => (
      <span
        key={i}
        className="inline-block animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
        style={{ animationDelay: `${i * 35}ms` }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </span>
);

const PuzzleProgressPanel = ({ selectedModule, progress, updateProgress, mobilePendingContinue, onMobileContinue }: { selectedModule: string | null, progress: EmocionarioProgress, updateProgress: (u: Partial<EmocionarioProgress>) => void, mobilePendingContinue?: boolean, onMobileContinue?: () => void }) => {
  if (!selectedModule) return null;

  const config = MODULE_PUZZLE_CONFIG[selectedModule];
  if (!config) {
    return (
      <div className="w-full flex flex-col h-full rounded-[2.5rem] bg-surface border border-outline-variant/10 shadow-lg p-6 md:p-8 flex-grow">
        <div className="w-full flex-grow flex items-center justify-center pb-20">
          <div className="text-center p-8 bg-surface-container/50 rounded-3xl border border-outline-variant/10 max-w-sm">
            <span className="material-symbols-outlined text-5xl text-primary/40 mb-4">extension</span>
            <p className="text-on-surface-variant text-lg font-light leading-relaxed">Este módulo no tiene un puzle configurado.</p>
          </div>
        </div>
      </div>
    );
  }

  const { moduleId, title, image: puzzleImage, totalPieces, layoutKey } = config;
  const layoutPieces = PUZZLE_LAYOUTS[layoutKey] || [];

  const piecesCollected = (progress.puzzlePieces && progress.puzzlePieces[moduleId]) || [];
  const puzzleCompleted = (progress.puzzleCompleted && progress.puzzleCompleted[moduleId]) || false;
  const currentPiecesCount = piecesCollected.length;

  const [inResolution, setInResolution] = useState(false);
  const [puzzleSlots, setPuzzleSlots] = useState<(number | null)[]>(Array(totalPieces).fill(null));
  const [selectedPuzzlePiece, setSelectedPuzzlePiece] = useState<number | null>(null);

  const completedPuzzleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (puzzleCompleted && window.matchMedia('(hover: none)').matches) {
      setTimeout(() => {
        if (completedPuzzleRef.current) {
          const y = completedPuzzleRef.current.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 150);
    }
  }, [puzzleCompleted]);

  useEffect(() => {
    if (currentPiecesCount === totalPieces && !puzzleCompleted) {
      setInResolution(true);
    } else {
      setInResolution(false);
    }
  }, [currentPiecesCount, puzzleCompleted, totalPieces]);

  // Reset slots when changing module
  useEffect(() => {
    setPuzzleSlots(Array(totalPieces).fill(null));
    setSelectedPuzzlePiece(null);
  }, [selectedModule, totalPieces]);

  const handlePuzzleSlotClick = (slotIdx: number) => {
    if (selectedPuzzlePiece === null) {
        if (puzzleSlots[slotIdx] !== null) {
            setSelectedPuzzlePiece(puzzleSlots[slotIdx]);
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

    // Dynamic completion check: piece IDs matched to slot IDs sequentially
    if (newSlots.every((s, i) => s === i)) {
      setTimeout(() => {
        updateProgress({
          puzzleCompleted: {
            ...progress.puzzleCompleted,
            [moduleId]: true
          },
          ...(moduleId === "modulo-0" ? { modulo0Completado: true, fundamentosDesbloqueados: true } : {})
        });
        setInResolution(false);
      }, 1200);
    }
  };

  return (
    <div className="w-full h-full p-8 md:p-10 bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/20 shadow-xl overflow-hidden relative flex flex-col min-h-[500px]">
      <div className="absolute inset-0 bg-transparent"></div>
      
      <div className="relative z-10 flex-grow flex flex-col items-center">
        
        {puzzleCompleted ? (
           <div ref={completedPuzzleRef} className="flex flex-col items-center my-auto animate-in fade-in zoom-in duration-700 w-full pt-8">
              <span className="material-symbols-outlined text-green-500 text-5xl mb-4">workspace_premium</span>
              <h4 className="font-headline text-2xl md:text-3xl text-center mb-2">
                 <AnimatedTitle text={`${title} Completado`} />
              </h4>
              <p className="text-on-surface-variant font-light mb-6 text-center text-lg">Has reconstruido la imagen del módulo.</p>
              
              <div className="w-full max-w-[520px] mx-auto aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/20 relative bg-surface-container-lowest">
                 <img src={puzzleImage} alt="Puzzle completed" className="w-full h-full object-contain relative z-10" />
              </div>

              {mobilePendingContinue && onMobileContinue && (
                  <div className="mt-8 md:hidden animate-in fade-in slide-in-from-bottom-4 z-50">
                    <button onClick={() => {
                      document.getElementById("module-button-modulo-1")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }} className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg text-lg">Siguiente módulo</button>
                  </div>
              )}
           </div>
        ) : inResolution ? (
           <div className="w-full flex-grow flex flex-col items-center animate-in fade-in duration-500">
               <p className="font-medium text-center text-primary mb-6 md:mb-8 text-lg md:text-xl">Ordena el puzle para completar el módulo.</p>
               
               <div className="w-full max-w-[420px] md:max-w-[480px] aspect-[2/3] mx-auto relative shadow-2xl bg-surface-container-highest/30 border border-outline-variant/10 rounded-[2rem] overflow-hidden mb-8 md:mb-12">
                   {layoutPieces.map((piece, i) => {
                       const pieceIdInSlot = puzzleSlots[i];
                       const hasAnyPiece = pieceIdInSlot !== null;
                       const BOARD_W = 200;
                       const BOARD_H = 300;
                       
                       return (
                           <div 
                             key={`slot-${i}`}
                             onClick={() => handlePuzzleSlotClick(i)}
                             className="absolute group z-10"
                             style={{
                                left: `${(piece.x / BOARD_W) * 100}%`,
                                top: `${(piece.y / BOARD_H) * 100}%`,
                                width: `${(piece.w / BOARD_W) * 100}%`,
                                height: `${(piece.h / BOARD_H) * 100}%`,
                             }}
                           >
                               {!hasAnyPiece && (
                                 <svg
                                   viewBox={`${piece.x} ${piece.y} ${piece.w} ${piece.h}`}
                                   className={`w-full h-full overflow-visible transition-all ${selectedPuzzlePiece !== null ? 'opacity-100 cursor-pointer pointer-events-auto' : 'opacity-60'}`}
                                   preserveAspectRatio="xMidYMid meet"
                                 >
                                   <path
                                     d={piece.path}
                                     fill={selectedPuzzlePiece !== null ? "rgba(var(--color-primary), 0.05)" : "transparent"}
                                     stroke="rgba(var(--color-outline-variant), 0.3)"
                                     strokeWidth="2"
                                     strokeDasharray="4 4"
                                     className="group-hover:fill-primary/20 transition-colors"
                                   />
                                 </svg>
                               )}
                               {hasAnyPiece && (
                                   <div 
                                     className={`w-full h-full absolute inset-0 transition-all duration-1000 ease-out ${puzzleSlots.every((s,idx) => s === idx) ? "scale-100 !translate-y-0 drop-shadow-sm" : "scale-[1.04] drop-shadow-xl -translate-y-1"}`}
                                     style={puzzleSlots.every((s,idx) => s === idx) ? { transitionDelay: `${i * 90}ms` } : {}}
                                   >
                                       <PuzzlePieceSvg 
                                          pieceId={pieceIdInSlot!} 
                                          puzzleImage={puzzleImage} 
                                          layoutPieces={layoutPieces}
                                          size="slot" 
                                          className="animate-in zoom-in"
                                       />
                                   </div>
                               )}
                           </div>
                       );
                   })}
               </div>
               
               <div className="w-full max-w-[500px] bg-surface-container-high/50 rounded-3xl p-6 md:p-8 shadow-inner border border-outline-variant/10 mt-auto">
                   <p className="text-xs uppercase tracking-widest font-bold text-center mb-6 text-on-surface-variant/70">Piezas Disponibles</p>
                   <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 min-h-[80px]">
                       {piecesCollected.filter(p => !puzzleSlots.includes(p)).map(p => (
                           <PuzzlePieceSvg 
                              key={`pool-${p}`}
                              pieceId={p}
                              puzzleImage={puzzleImage}
                              layoutPieces={layoutPieces}
                              size="pool"
                              selected={selectedPuzzlePiece === p}
                              onClick={() => setSelectedPuzzlePiece(p === selectedPuzzlePiece ? null : p)}
                           />
                       ))}
                       {piecesCollected.filter(p => !puzzleSlots.includes(p)).length === 0 && (
                           <span className="text-sm text-on-surface-variant/50 font-light py-4 flex items-center gap-2">
                               <span className="material-symbols-outlined">done_all</span> Has colocado todas las piezas.
                           </span>
                       )}
                   </div>
               </div>
           </div>
        ) : (
           <div className="w-full flex-grow flex flex-col items-center justify-start pt-4">
             <div className="text-center mb-10 md:mb-12">
               <span className="text-sm font-bold tracking-widest uppercase bg-surface-container-high px-6 py-3 rounded-full text-primary shadow-sm border border-outline-variant/10">
                 Piezas reunidas: {currentPiecesCount} / {totalPieces}
               </span>
             </div>
             
             {currentPiecesCount > 0 ? (
                 <div className="w-full flex flex-col items-center justify-center flex-grow relative pb-10">
                     <p className="text-lg md:text-xl font-headline text-primary mb-12 animate-in fade-in slide-in-from-top-4">¡Pieza conseguida!</p>
                     
                     <div className="relative flex items-center justify-center w-full max-w-[400px] min-h-[350px] md:min-h-[450px]">
                         {/* Pila de piezas anteriores (fondo) */}
                         {piecesCollected.slice(0, currentPiecesCount - 1).map((p, idx) => {
                             // Calcular posiciones de pila (apariencia de fotos desordenadas)
                             const isEven = idx % 2 === 0;
                             const rotate = isEven ? -8 + (idx * 3) : 8 - (idx * 3);
                             const xOffset = isEven ? -15 + (idx * 6) : 15 - (idx * 6);
                             const yOffset = -20 + (idx * 8);
                             
                             return (
                                 <div 
                                    key={`stack-${p}`}
                                    className="absolute transition-all duration-700 opacity-70 grayscale-[20%] blur-[0.5px]"
                                    style={{
                                        transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotate}deg) scale(0.9)`,
                                        zIndex: idx
                                    }}
                                 >
                                     <PuzzlePieceSvg 
                                        pieceId={p}
                                        puzzleImage={puzzleImage}
                                        layoutPieces={layoutPieces}
                                        size="reward"
                                     />
                                 </div>
                             );
                         })}
                         
                         {/* Pieza Principal (Recompensa Actual) */}
                         <div 
                            className="relative z-50 animate-in zoom-in slide-in-from-bottom-12 duration-700"
                         >
                             <PuzzlePieceSvg 
                                pieceId={piecesCollected[currentPiecesCount - 1]}
                                puzzleImage={puzzleImage}
                                layoutPieces={layoutPieces}
                                size="reward"
                             />
                             {/* Brillo de recompensa sutil */}
                             <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full -z-10 animate-pulse"></div>
                         </div>
                     </div>
                     
                     {mobilePendingContinue && onMobileContinue && (
                         <div className="mt-8 md:hidden animate-in fade-in slide-in-from-bottom-4 z-50">
                           <button onClick={onMobileContinue} className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg text-lg">Siguiente ejercicio</button>
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="w-full flex-grow flex items-center justify-center pb-20">
                     <div className="text-center p-8 bg-surface-container/50 rounded-3xl border border-outline-variant/10 max-w-sm">
                         <span className="material-symbols-outlined text-5xl text-primary/40 mb-4">extension</span>
                         {moduleId === "modulo-0" ? (
                             <p className="text-on-surface-variant text-lg font-light leading-relaxed">Completa un ejercicio para recibir tu primera pieza.</p>
                         ) : (
                             <p className="text-on-surface-variant text-lg font-light leading-relaxed">Este módulo no tiene piezas desbloqueables todavía.</p>
                         )}
                     </div>
                 </div>
             )}
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

  const [mobilePendingContinue, setMobilePendingContinue] = useState(false);
  const questionPanelRef = useRef<HTMLDivElement | null>(null);
  const puzzlePanelRef = useRef<HTMLDivElement | null>(null);
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
  const [activeMobileCard, setActiveMobileCard] = useState<string | null>(null);

  const [isTester, setIsTester] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('emocionarioAccess') === 'true') {
      setAccessGranted(true);
    }
    
    const loadLocal = () => {
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
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (user.email === "davidcaparrosgarcia@gmail.com") {
          setIsTester(true);
        }
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid, "emocionarioProgress", "data"));
          if (docSnap.exists()) {
            const data = docSnap.data();
            const loaded = {
              ...defaultProgress,
              ...data,
              puzzlePieces: data.puzzlePieces || { "modulo-0": [] },
              puzzleCompleted: data.puzzleCompleted || {}
            };
            setProgress(loaded as EmocionarioProgress);
            localStorage.setItem("emocionarioProgress", JSON.stringify(loaded));
          } else {
             loadLocal();
          }
        } catch (e) {
          console.error("Error loading progress from firestore", e);
          loadLocal();
        }
      } else {
        loadLocal();
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProgress = async (updates: Partial<EmocionarioProgress>) => {
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);
    localStorage.setItem("emocionarioProgress", JSON.stringify(newProgress));
    
    if (auth.currentUser) {
       try {
         await setDoc(doc(db, "users", auth.currentUser.uid, "emocionarioProgress", "data"), newProgress, { merge: true });
       } catch (e) {
         console.error("Error saving progress to firestore", e);
       }
    }
  };

  const triggerMobilePuzzleScroll = () => {
    if (isTouchDevice()) {
      setMobilePendingContinue(true);
      setTimeout(() => {
        puzzlePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  };

  const advanceLevel = () => {
    const p = MODULO_0_CONTENT[progress.pantallaActual];
    if (!p) return;
    const isSort = p.titulo === "Tu Mapa de Ruta";
    if (isSort) {
      updateProgress({
        pantallaActual: progress.pantallaActual + 1,
        ejercicioActual: 0,
        intentosActuales: 0
      });
    } else if (p.ejercicios && progress.ejercicioActual + 1 < p.ejercicios.length) {
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

  const handleMobileNextExercise = () => {
    setMobilePendingContinue(false);
    advanceLevel();
    setTimeout(() => {
      questionPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const getCardOverlayClasses = (id: string) => {
    return `absolute inset-0 transition-all duration-500 ${isTouchDevice() ? (activeMobileCard === id ? 'bg-black/45 backdrop-blur-sm' : 'bg-black/0') : 'bg-black/0 md:group-hover:bg-black/45 md:group-hover:backdrop-blur-sm'}`;
  };
  const getCardTitleClasses = (id: string, isSpecialty = false) => {
    if (isSpecialty) {
      return `absolute bottom-8 left-0 right-0 p-4 md:p-0 md:bottom-auto md:left-auto md:right-auto flex flex-col items-center justify-center transition-all duration-500 ${isTouchDevice() ? (activeMobileCard === id ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0') : 'md:group-hover:opacity-0 md:group-hover:translate-y-4'}`;
    }
    return `absolute bottom-8 left-8 md:bottom-auto md:left-auto font-headline text-2xl text-white drop-shadow-md transition-all duration-500 ${isTouchDevice() ? (activeMobileCard === id ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0') : 'md:group-hover:opacity-0 md:group-hover:translate-y-4'}`;
  };
  const getCardContentClasses = (id: string) => {
    return `w-full transition-all duration-500 flex flex-col items-center ${isTouchDevice() ? (activeMobileCard === id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none') : 'opacity-0 pointer-events-none md:pointer-events-auto md:group-hover:opacity-100 translate-y-3 md:group-hover:translate-y-0'}`;
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
              onClick={() => {
                if (isTouchDevice()) {
                  if (activeMobileCard === 'metodo') {
                     window.open('/images/gestion-emocional.pdf', '_blank', 'noopener,noreferrer');
                  } else {
                     setActiveMobileCard('metodo');
                  }
                } else {
                  window.open('/images/gestion-emocional.pdf', '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_metodo_gestion_emociones.jpg" alt="Método Gestión de Emociones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('metodo')}></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center text-white text-center">
                <div className={getCardContentClasses('metodo')}>
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
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1 cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'mod1' ? null : 'mod1'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_1.jpg" alt="Módulo I" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('mod1')}></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className={getCardTitleClasses('mod1')}>Módulo I</h4>
                <div className={getCardContentClasses('mod1')}>
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
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-2 cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'mod2' ? null : 'mod2'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_2.jpg" alt="Módulo II" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('mod2')}></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className={getCardTitleClasses('mod2')}>Módulo II</h4>
                <div className={getCardContentClasses('mod2')}>
                  <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                    Entrena la pausa corporal antes de que la emoción tome el mando.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1 cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'mod3' ? null : 'mod3'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_3.jpg" alt="Módulo III" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('mod3')}></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className={getCardTitleClasses('mod3')}>Módulo III</h4>
                <div className={getCardContentClasses('mod3')}>
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
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-2 cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'mod4' ? null : 'mod4'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_4.jpg" alt="Módulo IV" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('mod4')}></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className={getCardTitleClasses('mod4')}>Módulo IV</h4>
                <div className={getCardContentClasses('mod4')}>
                  <p className="font-headline text-2xl md:text-3xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                    Reconoce tus recursos internos y conviértelos en herramientas activas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1 cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'mod5' ? null : 'mod5'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_5.jpg" alt="Módulo V" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('mod5')}></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center items-center text-white text-center">
                <h4 className={getCardTitleClasses('mod5')}>Módulo V</h4>
                <div className={getCardContentClasses('mod5')}>
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
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container border border-outline-variant/10 shadow-lg min-h-[380px] w-full transition-all hover:shadow-xl cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'spec1' ? null : 'spec1'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_crisis.jpg" alt="Crisis, Pérdida y Salud" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('spec1')}></div>
              
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className={getCardTitleClasses('spec1', true)}>
                  <span className="material-symbols-outlined text-4xl mb-3 drop-shadow-md">healing</span>
                  <h4 className="font-headline text-2xl drop-shadow-md">Crisis, Pérdida y Salud</h4>
                </div>
                <div className={getCardContentClasses('spec1')}>
                  <p className="font-headline text-xl md:text-2xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    Protocolos de estabilización emocional y narrativa de trauma para momentos de pérdida, enfermedad, miedo o ruptura del equilibrio personal.
                  </p>
                </div>
              </div>
            </div>
            {/* Especialidad 2 */}
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container border border-outline-variant/10 shadow-lg min-h-[380px] w-full transition-all hover:shadow-xl cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'spec2' ? null : 'spec2'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_amor.jpg" alt="Amor y Desamor" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('spec2')}></div>
              
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className={getCardTitleClasses('spec2', true)}>
                  <span className="material-symbols-outlined text-4xl mb-3 drop-shadow-md">favorite</span>
                  <h4 className="font-headline text-2xl drop-shadow-md">Amor y Desamor</h4>
                </div>
                <div className={getCardContentClasses('spec2')}>
                  <p className="font-headline text-xl md:text-2xl leading-snug text-white drop-shadow-xl bg-black/35 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    Trabajo con el Adulto Saludable para comprender heridas afectivas, dependencia emocional, ruptura, apego y reconstrucción interna.
                  </p>
                </div>
              </div>
            </div>
            {/* Especialidad 3 */}
            <div 
              className="relative group overflow-hidden rounded-[2rem] bg-surface-container border border-outline-variant/10 shadow-lg min-h-[380px] w-full transition-all hover:shadow-xl cursor-pointer"
              onClick={() => { if (isTouchDevice()) setActiveMobileCard(activeMobileCard === 'spec3' ? null : 'spec3'); }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container-highest"></div>
              <img src="/images/fondo_modulo_trabajo.jpg" alt="Trabajo y Finanzas" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={getCardOverlayClasses('spec3')}></div>
              
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className={getCardTitleClasses('spec3', true)}>
                  <span className="material-symbols-outlined text-4xl mb-3 drop-shadow-md">work</span>
                  <h4 className="font-headline text-2xl drop-shadow-md">Trabajo y Finanzas</h4>
                </div>
                <div className={getCardContentClasses('spec3')}>
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
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedModule("Módulo 0 — El Despertar del Arquitecto")}
                    className={`flex-grow text-left px-6 py-4 rounded-2xl border transition-all ${selectedModule === "Módulo 0 — El Despertar del Arquitecto" ? 'bg-white text-[#162839] border-primary shadow-lg scale-[1.02] dark:bg-white dark:text-[#162839] dark:border-white' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/30'} font-light text-lg`}
                  >
                    Módulo 0 — El Despertar del Arquitecto
                  </button>
                  {isTester && (
                    <button
                      onClick={() => {
                        const confirmReset = window.confirm("¿Seguro que quieres borrar todo el progreso del Módulo 0 y el puzle?");
                        if (confirmReset) {
                          updateProgress({
                            pantallaActual: 0,
                            ejercicioActual: 0,
                            intentosActuales: 0,
                            modulo0Completado: false,
                            fundamentosDesbloqueados: false,
                            puzzlePieces: { ...progress.puzzlePieces, "modulo-0": [] },
                            puzzleCompleted: { ...progress.puzzleCompleted, "modulo-0": false }
                          });
                        }
                      }}
                      className="shrink-0 w-12 h-12 flex items-center justify-center bg-error/10 text-error rounded-full hover:bg-error hover:text-white transition-colors border border-error/30"
                      title="Resetear Módulo 0 (David)"
                    >
                      <span className="material-symbols-outlined">restart_alt</span>
                    </button>
                  )}
                </div>
                {selectedModule === "Módulo 0 — El Despertar del Arquitecto" && (
                  <Modulo0Panel progress={progress} updateProgress={updateProgress} onPieceEarned={triggerMobilePuzzleScroll} panelRef={questionPanelRef} />
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
                          id={modulo === "I. Fundamentos y Diagnóstico" ? "module-button-modulo-1" : undefined}
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
            <div ref={puzzlePanelRef} className="flex justify-center items-stretch h-full min-h-[500px]">
              <PuzzleProgressPanel 
                selectedModule={selectedModule} 
                progress={progress} 
                updateProgress={updateProgress} 
                mobilePendingContinue={mobilePendingContinue}
                onMobileContinue={handleMobileNextExercise}
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
