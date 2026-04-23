import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LighthouseBeamFrame from "../components/LighthouseBeamFrame";

const SYMPTOMS = [
  { id: 1, icon: 'compress', title: 'Presión en el pecho', desc: 'Un peso invisible que parece restringir la entrada de aire y la expansión natural de la calma.', weight: 15 },
  { id: 2, icon: 'psychology', title: 'Rumiación persistente', desc: 'Pensamientos circulares que se repiten como un eco en una estancia vacía, sin encontrar salida.', weight: 22 },
  { id: 3, icon: 'waves', title: 'Inquietud interna', desc: 'Una marea que no termina de bajar; un estado de alerta constante sin un peligro aparente.', weight: 18 },
  { id: 4, icon: 'air', title: 'Falta de aire', desc: 'Esa sensación de asfixia que oprime el pecho, donde el aire parece no llegar, una respuesta física que limita tu libertad respiratoria en momentos de crisis.', weight: 15 },
  { id: 5, icon: 'motion_blur', title: 'Mareos y náuseas', desc: 'Una inestabilidad física que puede manifestarse como un malestar profundo en el equilibrio de su bienestar.', weight: 12 },
  { id: 6, icon: 'ac_unit', title: 'Sudor frío', desc: 'Una respuesta térmica súbita del cuerpo ante una amenaza invisible, enfriando la superficie de la piel.', weight: 10 },
  { id: 7, icon: 'monitor_heart', title: 'Palpitaciones', desc: 'El ritmo del corazón se acelera sin esfuerzo físico, recordándonos una urgencia que aún no comprendemos.', weight: 15 },
  { id: 8, icon: 'schedule', title: 'Procrastinación', desc: 'La parálisis ante la acción por miedo al resultado, postergando la vida por una seguridad ilusoria.', weight: 15 },
  { id: 9, icon: 'spa', title: 'Caída del pelo', desc: 'El registro físico del estrés prolongado, donde el cuerpo sacrifica lo externo para proteger el núcleo.', weight: 5 },
  { id: 10, icon: 'bedtime', title: 'Insomnio', desc: 'La dificultad para apagar la luz de la consciencia cuando el cuerpo más necesita el refugio del sueño.', weight: 20 },
  { id: 11, icon: 'fitness_center', title: 'Tensión muscular', desc: 'Hombros y mandíbula que guardan el registro de batallas que aún no han ocurrido.', weight: 10 },
  { id: 12, icon: 'blur_on', title: 'Sensación de irrealidad', desc: 'Sentir que el mundo se vuelve ajeno, como si se observara la vida a través de un cristal empañado.', weight: 25 }
];

function calcularPresion(sintomasIds: number[]) {
  let sumaBase = 0;
  const n = sintomasIds.length;
  
  sintomasIds.forEach(id => {
    const s = SYMPTOMS.find(x => x.id === id);
    if (s) sumaBase += s.weight;
  });

  let fc = 1.0;
  if (n >= 6) { fc = 2.0; }
  else if (n >= 3) { fc = 1.6; }

  let grados = Math.min(180, Math.round(sumaBase * fc));
  return grados;
}

export default function AnxietyManagement() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);

  const toggleSymptom = (id: number) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const pressureDegrees = calcularPresion(selectedSymptoms);
  
  // Zone determination
  let zoneColor = "text-[#4f6260]"; 
  let zoneGradient = "from-[#d1e7e4] to-[#b6cbc8]";
  let iconName = "check_circle";
  let gradientId = "gradCalm";

  let zoneText = "Estado de Calma o Estrés Leve";
  let analysisText = "Capacidad de procesamiento óptima. La carga neuroemocional se encuentra dentro de un margen seguro y sostenible. Mantenimiento correcto de tu energía.";
  let riskIndex = "BAJO";
  let tolerance = "ALTA";

  if (pressureDegrees >= 131) {
    zoneColor = "text-[#991b1b]";
    zoneGradient = "from-[#fca5a5] to-[#7f1d1d]";
    iconName = "warning";
    gradientId = "gradCritical";
    zoneText = "Crisis de Angustia / Burnout Agudo";
    analysisText = "Cuando el hashrate de tus pensamientos sube tanto que no genera bloques de solución, sino que solo consume energía, ocurre el bloqueo funcional. El gasto innecesario de energía ha saturado el sistema, validando tu sufrimiento de forma empírica. Necesitas intervención y descompresión urgente.";
    riskIndex = "CRÍTICO";
    tolerance = "MÍNIMA";
  } else if (pressureDegrees >= 106) {
    zoneColor = "text-[#ef4444]";
    zoneGradient = "from-[#fcd3d3] to-[#f87171]";
    iconName = "error";
    gradientId = "gradSevere";
    zoneText = "Ansiedad Severa / Pre-bloqueo";
    analysisText = "Tu sistema está reportando sobrecarga severa. Estás empezando a perder resiliencia frente a nuevos estímulos y el riesgo de un ataque de pánico o bloqueo funcional está escalando drásticamente.";
    riskIndex = "MUY ALTO";
    tolerance = "BAJA";
  } else if (pressureDegrees >= 81) {
    zoneColor = "text-[#f97316]";
    zoneGradient = "from-[#fed7aa] to-[#fdba74]";
    iconName = "notifications_active";
    gradientId = "gradHigh";
    zoneText = "Ansiedad Clínica / Estrés Crónico";
    analysisText = "Tu sistema está drenando energía rápidamente sin llegar a un consenso interno sano. La acumulación sintomática está consumiendo tus recursos como un bucle infinito, elevando inminentemente el riesgo de agotamiento funcional.";
    riskIndex = "ALTO";
    tolerance = "MEDIA-BAJA";
  } else if (pressureDegrees >= 41) {
    zoneColor = "text-[#eab308]";
    zoneGradient = "from-[#fef08a] to-[#fde047]";
    iconName = "info";
    gradientId = "gradModerate";
    zoneText = "Estrés Moderado";
    analysisText = "El sistema empieza a drenar energía. Está procesando eventos en segundo plano de forma constante. Cuidado con no optimizar o soltar estas pesadas cargas a tiempo, pues se acumularán como estrés crónico.";
    riskIndex = "MEDIO";
    tolerance = "MEDIA";
  }

  if (selectedSymptoms.length === 0) {
    analysisText = "El radar está a la espera. Señala los indicadores para realizar el escáner de carga emocional de tu sistema central.";
    zoneText = "Modo Espera";
    zoneColor = "text-[#4f6260]";
    zoneGradient = "from-[#d1e7e4] to-[#b6cbc8]";
    iconName = "query_stats";
    gradientId = "gradInactive";
    riskIndex = "--";
    tolerance = "--";
  }

  const ARC_LENGTH = 216.77; // 270 degrees
  const CIRCUMFERENCE = 289.03; // Full circle
  const strokeDashoffsetValue = selectedSymptoms.length === 0 
    ? CIRCUMFERENCE 
    : CIRCUMFERENCE - (Math.min(pressureDegrees, 180) / 180) * ARC_LENGTH;

  return (
    <div className="flex-1 bg-surface w-full font-body text-on-surface">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#c4d7ec]">
        <div className="absolute inset-0 z-0">
          <img alt="Dense atmospheric fog in a quiet forest at dawn" className="w-full h-full object-cover opacity-60 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnnB7Ri9_5dSaSdsK_BkgG4rziV6DZIoGpkJ3zMhRngUFRR_7T7tCPOiTzIGMzRSFUltxwbdc8kEcpgU4ypflTyI5keY0OVeOow8oLCAzpzkDn5QBy4xAh2I3yf5aLWOeOj2vnWEwaQjkAED7T02OhL9OJz9QDy9hMVDx_bLCL7uGZaxwRwvw1Ix3azBczHI9jblyTPtzArdwkhSWxnTMUbtetuxh7_5aTCEgKSdGuOg1PtUF2BZbApoAFT98ID2wIzdkUP0sI7UaO"/>
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c3e50]/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-12 w-full">
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-7xl text-white leading-relaxed tracking-tight italic mb-8 drop-shadow-lg">
              ¿Sientes que la niebla te impide avanzar?
            </h1>
            <p className="text-[#c4d7ec] text-xl md:text-2xl font-light tracking-wide max-w-xl drop-shadow-md">
              Entendiendo la arquitectura de tu paz interior.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Symptoms */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto px-12">
          <div className="mb-20 text-center md:text-left">
            <h2 className="font-headline text-4xl text-primary mb-4">Reconociendo la señal:</h2>
            <p className="text-xl text-on-surface-variant italic">Escucha lo que tu cuerpo intenta comunicar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
            {SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom.id);
              return (
                <div 
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`relative flex flex-col gap-6 p-8 rounded-xl cursor-pointer transition-all duration-500 border ${
                    isSelected 
                      ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10 dark:bg-primary/[0.02] dark:border-primary/30 dark:shadow-none' 
                      : 'bg-surface-container-lowest border-transparent hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`material-symbols-outlined text-4xl transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-primary-fixed-dim'}`}>
                      {symptom.icon}
                    </span>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-primary border-primary dark:bg-primary/80 dark:border-primary' : 'border-outline-variant'}`}>
                      {isSelected && <span className="material-symbols-outlined text-white dark:text-[#0b1221] text-sm font-bold">check</span>}
                    </div>
                  </div>
                  <h3 className={`font-headline text-2xl transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-primary'}`}>{symptom.title}</h3>
                  <p className="text-on-surface-variant font-light leading-relaxed">{symptom.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Barometer Section */}
      <section className="py-24 bg-surface-container-low border-t border-b border-black/5 relative overflow-hidden">
        {/* Subtle background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-fixed/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-screen-2xl mx-auto px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl text-primary mb-4 tracking-tight">Radar de Presión Interna</h2>
            <p className="text-lg text-on-surface-variant font-light max-w-2xl mx-auto">
              Monitoreo en tiempo real de su carga neuroemocional. Los indicadores reflejan la tensión acumulada y la capacidad de procesamiento actual de su sistema.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center max-w-7xl mx-auto">
            {/* Left Card: Análisis de Telemetría */}
            <div className="lg:w-[25%] bg-white/90 backdrop-blur-xl border border-primary/10 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col self-start">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#b5c8df] to-[#d1e4fb]"></div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-lg" style={{ color: '#162839', fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                <h3 className="font-headline text-xs font-bold uppercase tracking-widest" style={{ color: '#162839' }}>Análisis de Telemetría</h3>
              </div>
              <p className="font-body text-sm font-light leading-relaxed mb-4 flex-1" style={{ color: '#334155' }}>
                <strong className="font-medium block mb-1" style={{ color: '#162839' }}>
                  {selectedSymptoms.length === 0 ? "Sistema inactivo." : "Estudio cognitivo procesado."}
                </strong>
                {analysisText}
              </p>
              <div className="flex justify-between items-center text-[10px] font-mono border-t border-black/5 pt-3" style={{ color: '#64748b' }}>
                <span>ID: {selectedSymptoms.length > 0 ? "RX-ACT" : "RX-78"}</span>
                <span>STATUS: {selectedSymptoms.length > 0 ? "LIVE" : "IDLE"}</span>
              </div>
            </div>

            {/* Center: New Valve Image Projection Area */}
            <div className="lg:w-[50%] flex flex-col items-center justify-center relative py-8">
              <div className="relative w-full max-w-[640px] aspect-[1.6/1]">
                {/* Background Image */}
                <img 
                  src="/images/valvula-presion.png" 
                  alt="Válvula de presión profesional" 
                  className="w-full h-full object-contain"
                />

                {/* PROJECTION OVERLAY OVER THE IMAGE DIAL */}
                {/* All positions are calculated relative to the image container */}
                {/* The dial center is roughly at 30.5% left, 50% top */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  
                  {/* Digital Meter & Text (Centered in the dial) */}
                  <div className="absolute top-[48%] left-[29.5%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5 transition-colors duration-500 drop-shadow-md" style={{ color: selectedSymptoms.length > 0 ? (pressureDegrees >= 131 ? '#ff4d4d' : pressureDegrees >= 106 ? '#ff6b6b' : pressureDegrees >= 81 ? '#ff9f43' : pressureDegrees >= 41 ? '#feca57' : '#54a0ff') : '#ffffff' }}>Presión</span>
                    <div className="flex items-start">
                      <span className="font-headline text-4xl leading-none tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{pressureDegrees}</span>
                      <span className="text-white text-base font-medium ml-0.5 mt-0.5 drop-shadow-md">°</span>
                    </div>
                    <span className="text-[8px] text-white/50 font-mono mt-1 tracking-widest uppercase">Calc_psi</span>
                  </div>

                  {/* Pressure Arc (SVG) - Sized to match the image dial inner screen */}
                  <div className="absolute top-[48%] left-[29.5%] -translate-x-1/2 -translate-y-1/2 w-[70.5%] h-[70.5%] md:w-[71%] md:h-[71%]">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="pGradCalm" x1="0%" x2="100%">
                          <stop offset="0%" stopColor="#81a4ce" stopOpacity="0.2"></stop>
                          <stop offset="100%" stopColor="#81a4ce" stopOpacity="1"></stop>
                        </linearGradient>
                        <linearGradient id="pGradMod" x1="0%" x2="100%">
                          <stop offset="0%" stopColor="#eab308" stopOpacity="0.2"></stop>
                          <stop offset="100%" stopColor="#eab308" stopOpacity="1"></stop>
                        </linearGradient>
                        <linearGradient id="pGradHigh" x1="0%" x2="100%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.2"></stop>
                          <stop offset="100%" stopColor="#f97316" stopOpacity="1"></stop>
                        </linearGradient>
                        <linearGradient id="pGradSevere" x1="0%" x2="100%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"></stop>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="1"></stop>
                        </linearGradient>
                        <linearGradient id="pGradCrit" x1="0%" x2="100%">
                          <stop offset="0%" stopColor="#991b1b" stopOpacity="0.2"></stop>
                          <stop offset="100%" stopColor="#991b1b" stopOpacity="1"></stop>
                        </linearGradient>
                      </defs>
                      <circle 
                        cx="50" cy="50" fill="none" r="41" 
                        stroke="rgba(255,255,255,0.05)" strokeWidth="4" 
                        strokeDasharray="193 257.6" 
                        transform="rotate(135 50 50)"></circle>
                      <circle 
                        className="transition-all duration-1000 ease-out" 
                        cx="50" cy="50" fill="none" r="41" 
                        stroke={`url(#p${gradientId.charAt(0).toUpperCase() + gradientId.slice(1)})`} 
                        strokeDasharray="257.6 257.6" 
                        strokeDashoffset={257.6 - (pressureDegrees / 180) * 193}
                        strokeLinecap="round" 
                        strokeWidth="5"
                        transform="rotate(135 50 50)"></circle>
                    </svg>
                  </div>

                  {/* 0 and 180 Labels (Floating, White, position synced with start/end of arc) */}
                  <span className="absolute font-headline text-base font-bold text-white/40 z-20" style={{ left: '5%', top: '85%' }}>0</span>
                  <span className="absolute font-headline text-base font-bold text-white/40 z-20" style={{ left: '54%', top: '85%' }}>180</span>
                </div>
              </div>
            </div>

            {/* Right Card: Estado de Situación (Narrower and Taller) */}
            <div className="lg:w-[25%] bg-white/90 backdrop-blur-xl border border-primary/10 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col min-h-[460px]">
              <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${zoneGradient}`}></div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-lg" style={{ color: pressureDegrees >= 131 ? '#991b1b' : pressureDegrees >= 106 ? '#ef4444' : pressureDegrees >= 81 ? '#f97316' : pressureDegrees >= 41 ? '#eab308' : '#4f6260', fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
                <h3 className="font-headline text-xs font-bold uppercase tracking-widest" style={{ color: '#162839' }}>Estado de Situación</h3>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h4 className="text-xl font-headline mb-2 leading-tight" style={{ color: pressureDegrees >= 131 ? '#991b1b' : pressureDegrees >= 106 ? '#ef4444' : pressureDegrees >= 81 ? '#f97316' : pressureDegrees >= 41 ? '#eab308' : '#4f6260' }}>{zoneText}</h4>
                <p className="font-body text-sm font-light leading-relaxed text-slate-700 mb-6">
                  {selectedSymptoms.length === 0 
                  ? "Analizando... seleccione sus marcadores de incomodidad arriba."
                  : "Las fluctuaciones detectadas corresponden al sumatorio iterativo de los síntomas seleccionados en el sistema."}
                </p>
                
                <div className="mt-auto space-y-4">
                  <div className="p-4 bg-black/5 rounded-xl border border-black/5">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Índice de Riesgo</p>
                    <p className="text-lg font-headline text-slate-900">{riskIndex}</p>
                  </div>
                  <div className="p-4 bg-black/5 rounded-xl border border-black/5">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Tolerancia</p>
                    <p className="text-lg font-headline text-slate-900">{tolerance}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono border-t border-black/5 pt-3 mt-4" style={{ color: '#64748b' }}>
                <span>PROCESO: ACTIVO</span>
                <span>DATA: ENCR</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Section 1: Restructured 'La naturaleza del ruido' */}
      <section className="relative py-48 overflow-hidden bg-[#2c3e50]">
        <div className="absolute inset-0 z-0">
          <img alt="A path lost in thick fog with ethereal light" className="w-full h-full object-cover opacity-30 blur-sm scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtL5pbugnZtI7y7kA6u94AMwx1UOLEtjgIvSEHB_SDrv1TUSkFnx_lm34dIAPqsY6B9BLKf3RLkwpO3xMlbMptJQV3DK974c25wgawr2BinFvuXiluqVRLFxRVAqHEFhdFCio528VckhE64vvoGkLswWK8UDURAHwhYu-aVPJyQHwJ8aRGz5XyX9dqIDfLRcUNwohqgjMobaHKfSalPT0LRYK8ZjcG-ZkhCYfb38CwVKqLJa7g4o97ZgI-W1Wp86VCE3IAQhl2o9ZF"/>
          <div className="absolute inset-0 bg-[#2c3e50]/40"></div>
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-12 text-center">
          <h2 className="font-headline text-3xl text-primary-fixed-dim mb-12 italic uppercase tracking-widest">La naturaleza del ruido</h2>
          <div className="max-w-4xl mx-auto">
            <p className="font-headline text-2xl md:text-3xl lg:text-4xl text-white leading-[1.6] md:leading-[1.6] font-light italic">
              La ansiedad no es tu enemiga, sino una brújula interior que ha perdido su norte. Es tu instinto primitivo gritando que no estás a salvo, convirtiendo tu entorno en un lugar hostil aunque racionalmente sepas que no hay peligro. El ruido excesivo es el eco de esa brújula rompiéndose, indicando un peligro invisible que tu cuerpo intenta desesperadamente evitar. Nuestro objetivo es que esa aguja deje de dar vueltas sin sentido y recupere su centro, su paz interior.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The Solution */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto px-12">
          <LighthouseBeamFrame
            className="relative rounded-3xl min-h-[600px] flex items-center shadow-xl group"
            background={
              <>
                <img alt="Distant minimalist lighthouse beacon shining through sea mist" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="/images/fondo-faro.jpg"/>
                <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
              </>
            }
          >
            <div className="relative z-10 p-12 md:p-24 max-w-2xl">
              <h2 className="font-headline text-4xl md:text-5xl text-white mb-8 italic">Un faro en la niebla.</h2>
              <p className="text-slate-100 text-lg md:text-xl font-light leading-relaxed mb-12">No es posible navegar sin saber dónde se encuentra uno exactamente. Nuestro método actúa como un radar emocional: localizamos su estado actual para poder ofrecerle un rescate preciso. En ReprogrÁmate todo comienza con la ubicación de tu posición exacta.</p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button onClick={() => navigate('/session')} className="px-8 py-5 bg-[#2c3e50] text-white font-bold rounded-full text-lg hover:bg-[#42617c] transition-all duration-300">
                  Iniciar Consulta Gratuita
                </button>
                <button onClick={() => navigate('/method')} className="px-8 py-5 border border-white/30 text-white font-medium rounded-full text-lg hover:bg-white/10 transition-all duration-300">
                  Regresar
                </button>
              </div>
            </div>
          </LighthouseBeamFrame>
        </div>
      </section>

    </div>
  );
}
