import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LighthouseBeamFrame from "../components/LighthouseBeamFrame";
import PressureValve from "../components/PressureValve";

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
  let zoneColor = "text-[#22c55e]";
  let zoneText = "Estado de Calma o Estrés Leve";
  let analysisText = "Capacidad de procesamiento óptima. La carga neuroemocional se encuentra dentro de un margen seguro y sostenible. Mantenimiento correcto de tu energía.";
  
  if (pressureDegrees >= 131) {
    zoneColor = "text-[#ef4444]";
    zoneText = "Crisis de Angustia / Burnout Agudo";
    analysisText = "Cuando el hashrate de tus pensamientos sube tanto que no genera bloques de solución, sino que solo consume energía, ocurre el bloqueo funcional. El gasto innecesario de energía ha saturado el sistema, validando tu sufrimiento de forma empírica. Necesitas intervención y descompresión urgente.";
  } else if (pressureDegrees >= 81) {
    zoneColor = "text-[#f97316]";
    zoneText = "Ansiedad Clínica / Estrés Crónico";
    analysisText = "Tu sistema está drenando energía rápidamente sin llegar a un consenso interno sano. La acumulación sintomática está consumiendo tus recursos como un bucle infinito, elevando inminentemente el riesgo de agotamiento funcional.";
  } else if (pressureDegrees >= 41) {
    zoneColor = "text-[#eab308]";
    zoneText = "Estrés Moderado";
    analysisText = "El sistema empieza a drenar energía. Está procesando eventos en segundo plano de forma constante. Cuidado con no optimizar o soltar estas pesadas cargas a tiempo, pues se acumularán como estrés crónico.";
  }

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

      {/* Section 2.5: Pressure Valve Analysis */}
      <section className="py-24 relative overflow-hidden border-t border-b border-[#8b6b4a]/20" style={{ backgroundColor: '#0d131a' }}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 md:px-12">
          
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl md:text-5xl text-[#d4af37] italic tracking-wide">Radar de Presión Interna</h2>
            <p className="text-white/60 text-lg mt-4 font-light max-w-2xl mx-auto">Selecciona tus síntomas activos en el panel superior para calcular el estado de saturación de tu sistema neuroemocional.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Left: Interactive Analysis */}
            <div className="bg-[#16202a] border border-[#8b6b4a]/30 p-8 md:p-10 rounded-2xl shadow-2xl relative h-full flex flex-col justify-center">
              <div className="absolute -top-4 left-8 bg-[#0d131a] px-4 py-1 text-[#d4af37] font-body text-sm tracking-widest border border-[#8b6b4a]/30 rounded uppercase">ANÁLISIS DE TELEMETRÍA</div>
              <p className="text-white/80 font-body text-lg leading-relaxed font-light">
                {selectedSymptoms.length === 0 ? "El radar está a la espera. Señala los indicadores para realizar el escáner de carga emocional de tu sistema central." : analysisText}
              </p>
            </div>

            {/* Center: The Valve */}
            <div className="flex justify-center my-8 lg:my-0 scale-110">
              <PressureValve degrees={pressureDegrees} />
            </div>

            {/* Right: Zone Status */}
            <div className="bg-[#16202a] border border-[#8b6b4a]/30 p-8 md:p-10 rounded-2xl shadow-2xl relative h-full flex flex-col justify-center">
              <div className="absolute -top-4 right-8 bg-[#0d131a] px-4 py-1 text-[#d4af37] font-body text-sm tracking-widest border border-[#8b6b4a]/30 rounded uppercase">ESTADO DE SITUACIÓN</div>
              <div className="flex flex-col items-center text-center">
                <span className={`material-symbols-outlined text-6xl mb-6 ${zoneColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {pressureDegrees >= 131 ? 'warning' : pressureDegrees >= 81 ? 'notifications_active' : pressureDegrees >= 41 ? 'info' : 'check_circle'}
                </span>
                <h3 className={`font-headline text-3xl mb-3 ${zoneColor}`}>{selectedSymptoms.length === 0 ? 'Modo Espera' : zoneText}</h3>
                <p className="text-white/40 text-sm font-mono mt-6 tracking-widest">
                  PRESIÓN CALCULADA: {pressureDegrees.toFixed(0)} PSI
                </p>
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
