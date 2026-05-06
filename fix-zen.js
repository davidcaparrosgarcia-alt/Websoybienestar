import fs from 'fs';

let content = fs.readFileSync('src/pages/Zen.tsx', 'utf8');

// Copiar hooks/types

const fogCode = `type FogTrailPoint = {
  id: number;
  x: number;
  y: number;
  createdAt: number;
  rx: number;
  ry: number;
  rotation: number;
};`;

if (!content.includes('type FogTrailPoint')) {
  content = content.replace('export default function Zen() {', fogCode + '\n\nexport default function Zen() {');
}

// Variables

const variablesOld = `  const [fogPosition, setFogPosition] = useState({ x: 50, y: 50 });
  const [isFogActive, setIsFogActive] = useState(false);

  const handleHeroFogMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setFogPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };`;

const variablesNew = `  const [fogTrail, setFogTrail] = useState<FogTrailPoint[]>([]);
  const [fogTick, setFogTick] = useState(() => Date.now());
  const lastFogPointAt = useRef(0);
  const fogPointId = useRef(0);

  const FOG_LIFE_MS = 1900;
  const FOG_ADD_INTERVAL_MS = 70;
  const MAX_FOG_TRAIL_POINTS = 22;

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setFogTick(now);
      setFogTrail((prev) => prev.filter((point) => now - point.createdAt < FOG_LIFE_MS));
    }, 80);

    return () => window.clearInterval(interval);
  }, []);

  const handleHeroFogMove = (event: MouseEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastFogPointAt.current < FOG_ADD_INTERVAL_MS) {
      return;
    }
    lastFogPointAt.current = now;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const safeX = Math.max(0, Math.min(100, x));
    const safeY = Math.max(0, Math.min(100, y));

    const point: FogTrailPoint = {
      id: fogPointId.current++,
      x: safeX,
      y: safeY,
      createdAt: now,
      rx: 8 + Math.random() * 4,
      ry: 5.5 + Math.random() * 3,
      rotation: Math.random() * 180,
    };

    setFogTrail((prev) => [...prev.slice(-MAX_FOG_TRAIL_POINTS + 1), point]);
  };`;

content = content.replace(variablesOld, variablesNew);

// Desplazar ventana
content = content.replace(
  'className="md:w-3/5 bg-white/40 dark:bg-[#162839]/60 backdrop-blur-md px-5 py-4 md:px-7 md:py-5 rounded-2xl shadow-xl"',
  'className="md:w-3/5 bg-white/40 dark:bg-[#162839]/60 backdrop-blur-md px-5 py-4 md:px-7 md:py-5 rounded-2xl shadow-xl transform translate-y-[80%] md:translate-y-full"'
);

// Borrar el onMouseEnter/Leave
content = content.replace(
  '        onMouseEnter={() => setIsFogActive(true)}\n        onMouseMove={handleHeroFogMove}\n        onMouseLeave={() => setIsFogActive(false)}',
  '        onMouseMove={handleHeroFogMove}'
);


// Editar el mask
const maskOld = `          <div
            className="absolute inset-0 pointer-events-none bg-[#f1f5f9]/20 dark:bg-[#2c3e50]/40 backdrop-blur-[2px] transition-all duration-700 ease-out"
            style={{
              WebkitMaskImage: isFogActive
                ? \`radial-gradient(ellipse 150px 115px at \${fogPosition.x}% \${fogPosition.y}%, transparent 0px, transparent 58px, rgba(0,0,0,0.18) 105px, rgba(0,0,0,0.72) 165px, black 245px)\`
                : \`linear-gradient(black, black)\`,
              maskImage: isFogActive
                ? \`radial-gradient(ellipse 150px 115px at \${fogPosition.x}% \${fogPosition.y}%, transparent 0px, transparent 58px, rgba(0,0,0,0.18) 105px, rgba(0,0,0,0.72) 165px, black 245px)\`
                : \`linear-gradient(black, black)\`,
            }}
          ></div>`;

const maskNew = `          <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
            <defs>
              <radialGradient id="zen-hole-grad">
                <stop offset="25%" stopColor="black" stopOpacity="1" />
                <stop offset="100%" stopColor="black" stopOpacity="0" />
              </radialGradient>
              <mask id="zen-fog-cover-mask" maskContentUnits="objectBoundingBox">
                <rect width="1" height="1" fill="white" />
                {fogTrail.map((point) => {
                  const progress = Math.min(1, Math.max(0, (fogTick - point.createdAt) / 1900));
                  const delayedProgress = Math.max(0, (progress - 0.18) / 0.82);
                  const opacity = Math.max(0, 0.92 * (1 - delayedProgress));

                  return (
                    <ellipse
                      key={point.id}
                      cx={point.x / 100}
                      cy={point.y / 100}
                      rx={point.rx / 100}
                      ry={point.ry / 100}
                      fill="url(#zen-hole-grad)"
                      opacity={opacity}
                      transform={\`rotate(\${point.rotation} \${point.x / 100} \${point.y / 100})\`}
                    />
                  );
                })}
              </mask>
            </defs>
          </svg>
          <div
            className="absolute inset-0 pointer-events-none bg-[#f1f5f9]/20 dark:bg-[#2c3e50]/40 backdrop-blur-[2px] transition-opacity duration-700 ease-out"
            style={{
              WebkitMaskImage: 'url(#zen-fog-cover-mask)',
              maskImage: 'url(#zen-fog-cover-mask)',
            }}
          ></div>`;

content = content.replace(maskOld, maskNew);

fs.writeFileSync('src/pages/Zen.tsx', content);
console.log("Exitoso");
