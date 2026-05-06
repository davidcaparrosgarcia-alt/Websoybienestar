import fs from 'fs';

let content = fs.readFileSync('src/pages/Resources.tsx', 'utf8');

const stateOriginal = `  const [showBreathingText, setShowBreathingText] = useState(false);
  const breathingTimer = useRef<NodeJS.Timeout | null>(null);

  const [showGestionsTextBg, setShowGestionsTextBg] = useState(false);
  const gestionTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (type: 'breathing' | 'gestion') => {
    const timer = setTimeout(() => {
      if (type === 'breathing') setShowBreathingText(true);
      if (type === 'gestion') setShowGestionsTextBg(true);
    }, 400); // 400ms para pulsación prolongada
    if (type === 'breathing') breathingTimer.current = timer;
    if (type === 'gestion') gestionTimer.current = timer;
  };

  const handlePointerUp = (type: 'breathing' | 'gestion') => {
    if (type === 'breathing' && breathingTimer.current) clearTimeout(breathingTimer.current);
    if (type === 'gestion' && gestionTimer.current) clearTimeout(gestionTimer.current);
  };`;

const stateNew = `  const [showBreathingText, setShowBreathingText] = useState(false);
  const breathingTimer = useRef<NodeJS.Timeout | null>(null);

  const [showGestionsTextBg, setShowGestionsTextBg] = useState(false);
  const gestionTimer = useRef<NodeJS.Timeout | null>(null);

  const [showGoalsText, setShowGoalsText] = useState(false);
  const goalsTimer = useRef<NodeJS.Timeout | null>(null);

  const [showGratitudeText, setShowGratitudeText] = useState(false);
  const gratitudeTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (type: 'breathing' | 'gestion' | 'goals' | 'gratitude') => {
    const timer = setTimeout(() => {
      if (type === 'breathing') setShowBreathingText(true);
      if (type === 'gestion') setShowGestionsTextBg(true);
      if (type === 'goals') setShowGoalsText(true);
      if (type === 'gratitude') setShowGratitudeText(true);
    }, 400); // 400ms para pulsación prolongada
    if (type === 'breathing') breathingTimer.current = timer;
    if (type === 'gestion') gestionTimer.current = timer;
    if (type === 'goals') goalsTimer.current = timer;
    if (type === 'gratitude') gratitudeTimer.current = timer;
  };

  const handlePointerUp = (type: 'breathing' | 'gestion' | 'goals' | 'gratitude') => {
    if (type === 'breathing' && breathingTimer.current) clearTimeout(breathingTimer.current);
    if (type === 'gestion' && gestionTimer.current) clearTimeout(gestionTimer.current);
    if (type === 'goals' && goalsTimer.current) clearTimeout(goalsTimer.current);
    if (type === 'gratitude' && gratitudeTimer.current) clearTimeout(gratitudeTimer.current);
  };`;

content = content.replace(stateOriginal, stateNew);

const gratitudeOriginal = `          {/* Diario de Gratitud */}
          <div className="md:col-span-4 group cursor-pointer flex flex-col" onClick={() => navigate('/emotion-diary')}>
            <div className="relative overflow-hidden aspect-[4/5] rounded-2xl mb-6">
              <img alt="Diario de Gratitud" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUuDrDPE8hGGe2nuQ6qyG5gvfpgu8Wu1ycLuXQ6MLgehZ7k9PXOHJ7flYxBAxKvivv1qsYPbAYaQQ-PCV3OGwSI8celpHqBwLLBI8iRMZLf7BoTVIAM-sIft0MJo_gY-n6fIkf5cTsqmOzsc-uPy3e7CPK_kQwKGURPMZMgsk9Xn2dn6gZ-i4WLzQqttT1i8oW2bvVfUtHpDMV1EGQE8FfC1KMUJTjCpTOZ95Xk3Ga8--e_zCCXHh57MT6pyN-TiZcxOA9ebVnTNmX" />
              <div className="absolute inset-0 bg-primary/10"></div>
            </div>
            <h3 className="font-headline text-2xl text-primary mb-2 italic">Diario de Gratitud</h3>
            <p className="text-on-surface-variant text-sm font-light leading-relaxed">Un espacio para anclar lo positivo y reconocer la abundancia en lo sutil.</p>
          </div>

          {/* Spacer Row with Text (Editorial feel) */}
          <div className="hidden md:block md:col-span-3"></div>
          <div className="md:col-span-9 py-12">`;

const gratitudeNew = `          {/* Diario de Gratitud */}
          <div 
             className="md:col-span-4 group cursor-pointer flex flex-col h-full" 
            onClick={() => {
              if (window.matchMedia('(hover: hover)').matches) navigate('/emotion-diary');
            }}
            onDoubleClick={() => navigate('/emotion-diary')}
            onPointerDown={() => handlePointerDown('gratitude')}
            onPointerUp={() => handlePointerUp('gratitude')}
            onPointerLeave={() => {
              handlePointerUp('gratitude');
              setShowGratitudeText(false);
            }}
            onContextMenu={(e) => {
               if (window.matchMedia('(hover: none)').matches) e.preventDefault();
            }}
          >
            <div className="relative overflow-hidden rounded-2xl flex-1 flex flex-col mb-4">
              <img alt="Diario de Gratitud" className="dynamic-color-img absolute inset-0 w-full h-full object-cover transition-all duration-1000 grayscale contrast-110 md:group-hover:scale-105 md:group-hover:grayscale-0 md:group-hover:contrast-100 active:grayscale-0 active:contrast-100" src="/images/fondo_diario.jpg" />
              <div className="absolute inset-0 bg-primary/40 mix-blend-multiply transition-opacity duration-1000 md:group-hover:opacity-60"></div>
              
              <div className="relative z-10 flex flex-col justify-end p-6 md:p-8 h-full pointer-events-none text-center">
                <div className={\`w-full transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 \${showGratitudeText ? 'opacity-100' : 'opacity-0'}\`}>
                  <p className="text-white bg-black/40 backdrop-blur-md px-6 py-4 border border-white/10 rounded-2xl shadow-xl font-light text-sm md:text-base inline-block">Tu espacio para anclar lo positivo y reconocer la abundancia en lo sutil.</p>
                </div>
              </div>
            </div>
            <h3 className="font-headline text-2xl text-primary italic mt-auto">Diario de Gratitud</h3>
          </div>

          {/* Spacer Row with Text (Editorial feel) */}
          <div className="hidden md:block md:col-span-3"></div>
          <div className="md:col-span-9 pt-6 pb-12">`;

content = content.replace(gratitudeOriginal, gratitudeNew);

const goalsOriginal = `          {/* Metas Semanales */}
          <div className="md:col-span-5 group cursor-pointer" onClick={() => navigate('/weekly-goals')}>
            <div className="bg-surface-container-low p-12 h-full flex flex-col justify-between rounded-2xl hover:bg-surface-container-highest transition-colors duration-500 border border-outline-variant/10">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-8">architecture</span>
                <h3 className="font-headline text-3xl text-primary mb-4">Metas Semanales</h3>
                <p className="text-on-surface-variant font-light leading-loose">Estructure sus intenciones con precisión arquitectónica. Defina objetivos que respiren y evolucionen con usted.</p>
              </div>
              <div className="mt-12 flex items-center gap-4 text-primary font-semibold tracking-widest text-xs uppercase group-hover:scale-105 transition-transform origin-left">
                <span>Configurar tablero</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>`;

const goalsNew = `          {/* Metas Semanales */}
          <div 
             className="md:col-span-5 group cursor-pointer" 
            onClick={() => {
              if (window.matchMedia('(hover: hover)').matches) navigate('/weekly-goals');
            }}
            onDoubleClick={() => navigate('/weekly-goals')}
            onPointerDown={() => handlePointerDown('goals')}
            onPointerUp={() => handlePointerUp('goals')}
            onPointerLeave={() => {
              handlePointerUp('goals');
              setShowGoalsText(false);
            }}
            onContextMenu={(e) => {
               if (window.matchMedia('(hover: none)').matches) e.preventDefault();
            }}
          >
            <div className="relative overflow-hidden h-full rounded-2xl border border-outline-variant/10 flex flex-col justify-between p-12 hover:shadow-lg transition-shadow duration-500">
              <img alt="Metas Semanales" className="dynamic-color-img absolute inset-0 w-full h-full object-cover transition-all duration-1000 grayscale contrast-110 md:group-hover:scale-105 md:group-hover:grayscale-0 md:group-hover:contrast-100 active:grayscale-0 active:contrast-100" src="/images/fondo_propositos.jpg" />
              <div className="absolute inset-0 bg-primary/40 mix-blend-multiply transition-opacity duration-1000 md:group-hover:opacity-60"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                <div>
                  <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">architecture</span>
                </div>
                
                <div className="flex flex-col gap-6 mt-12">
                  <div className={\`w-full transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 \${showGoalsText ? 'opacity-100' : 'opacity-0'}\`}>
                    <p className="text-white bg-black/40 backdrop-blur-md px-6 py-4 border border-white/10 rounded-2xl shadow-xl font-light text-base md:text-lg inline-block">Estructurar tus intenciones es el primer paso para hacerlas realidad. Define objetivos que respiran y evolucionan contigo.</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white font-semibold tracking-widest text-xs uppercase group-hover:scale-105 transition-transform origin-left drop-shadow-md">
                    <span>Configurar tablero</span>
                    <span className="material-symbols-outlined text-sm text-white">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>`;

content = content.replace(goalsOriginal, goalsNew);

fs.writeFileSync('src/pages/Resources.tsx', content);
