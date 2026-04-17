import { useNavigate } from "react-router-dom";

export default function AnxietyManagement() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-surface w-full font-body text-on-surface">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-primary-container">
        <div className="absolute inset-0 z-0">
          <img alt="Dense atmospheric fog in a quiet forest at dawn" className="w-full h-full object-cover opacity-60 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnnB7Ri9_5dSaSdsK_BkgG4rziV6DZIoGpkJ3zMhRngUFRR_7T7tCPOiTzIGMzRSFUltxwbdc8kEcpgU4ypflTyI5keY0OVeOow8oLCAzpzkDn5QBy4xAh2I3yf5aLWOeOj2vnWEwaQjkAED7T02OhL9OJz9QDy9hMVDx_bLCL7uGZaxwRwvw1Ix3azBczHI9jblyTPtzArdwkhSWxnTMUbtetuxh7_5aTCEgKSdGuOg1PtUF2BZbApoAFT98ID2wIzdkUP0sI7UaO"/>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-12 w-full">
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-7xl text-white leading-relaxed tracking-tight italic mb-8">
              ¿Sientes que la niebla te impide avanzar?
            </h1>
            <p className="text-on-primary-container text-xl md:text-2xl font-light tracking-wide max-w-xl">
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
            {/* Symptom 1 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">compress</span>
              <h3 className="font-headline text-2xl text-primary">Presión en el pecho</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Un peso invisible que parece restringir la entrada de aire y la expansión natural de la calma.</p>
            </div>
            {/* Symptom 2 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">psychology</span>
              <h3 className="font-headline text-2xl text-primary">Rumiación persistente</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Pensamientos circulares que se repiten como un eco en una estancia vacía, sin encontrar salida.</p>
            </div>
            {/* Symptom 3 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">waves</span>
              <h3 className="font-headline text-2xl text-primary">Inquietud interna</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Una marea que no termina de bajar; un estado de alerta constante sin un peligro aparente.</p>
            </div>
            {/* Symptom 4 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">air</span>
              <h3 className="font-headline text-2xl text-primary">Falta de aire</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Esa sensación de asfixia que oprime el pecho, donde el aire parece no llegar, una respuesta física que limita tu libertad respiratoria en momentos de crisis.</p>
            </div>
            {/* Symptom 5 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">motion_blur</span>
              <h3 className="font-headline text-2xl text-primary">Mareos y náuseas</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Una inestabilidad física que puede manifestarse como un malestar profundo en el equilibrio de su bienestar.</p>
            </div>
            {/* Symptom 6 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">ac_unit</span>
              <h3 className="font-headline text-2xl text-primary">Sudor frío</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Una respuesta térmica súbita del cuerpo ante una amenaza invisible, enfriando la superficie de la piel.</p>
            </div>
            {/* Symptom 7 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">monitor_heart</span>
              <h3 className="font-headline text-2xl text-primary">Palpitaciones</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">El ritmo del corazón se acelera sin esfuerzo físico, recordándonos una urgencia que aún no comprendemos.</p>
            </div>
            {/* Symptom 8 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">schedule</span>
              <h3 className="font-headline text-2xl text-primary">Procrastinación</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">La parálisis ante la acción por miedo al resultado, postergando la vida por una seguridad ilusoria.</p>
            </div>
            {/* Symptom 9 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">spa</span>
              <h3 className="font-headline text-2xl text-primary">Caída del pelo</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">El registro físico del estrés prolongado, donde el cuerpo sacrifica lo externo para proteger el núcleo.</p>
            </div>
            {/* Symptom 10 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">bedtime</span>
              <h3 className="font-headline text-2xl text-primary">Insomnio</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">La dificultad para apagar la luz de la consciencia cuando el cuerpo más necesita el refugio del sueño.</p>
            </div>
            {/* Symptom 11 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">fitness_center</span>
              <h3 className="font-headline text-2xl text-primary">Tensión muscular</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Hombros y mandíbula que guardan el registro de batallas que aún no han ocurrido.</p>
            </div>
            {/* Symptom 12 */}
            <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">blur_on</span>
              <h3 className="font-headline text-2xl text-primary">Sensación de irrealidad</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">Sentir que el mundo se vuelve ajeno, como si se observara la vida a través de un cristal empañado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Restructured 'La naturaleza del ruido' */}
      <section className="relative py-48 overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <img alt="A path lost in thick fog with ethereal light" className="w-full h-full object-cover opacity-30 blur-sm scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtL5pbugnZtI7y7kA6u94AMwx1UOLEtjgIvSEHB_SDrv1TUSkFnx_lm34dIAPqsY6B9BLKf3RLkwpO3xMlbMptJQV3DK974c25wgawr2BinFvuXiluqVRLFxRVAqHEFhdFCio528VckhE64vvoGkLswWK8UDURAHwhYu-aVPJyQHwJ8aRGz5XyX9dqIDfLRcUNwohqgjMobaHKfSalPT0LRYK8ZjcG-ZkhCYfb38CwVKqLJa7g4o97ZgI-W1Wp86VCE3IAQhl2o9ZF"/>
          <div className="absolute inset-0 bg-primary/40"></div>
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
      <section className="py-32 bg-surface">
        <div className="max-w-screen-2xl mx-auto px-12">
          <div className="relative rounded-3xl overflow-hidden min-h-[600px] flex items-center shadow-xl">
            <img alt="Distant minimalist lighthouse beacon shining through sea mist" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/ADBb0uiAvr-wXltXDThajClzoGhJAIF9bfYe5BhdHizmoNymngCnOjXsRND9vXbFc-i5t6w1xFo6fJJPa6cziNMES5ZBQbDFk41n0ofpoejAIF34tbOrAZJ5s4TuwMHN41Yw8qqLHLBI4Kp7DisIM5dB67wU0lvsjr5MNN4kaiwulBLSuOK8uWUrcuF-wFbyBlQWiaXrGikbmR3H0bJzfaAGqyyF6OCypegw-C3f_CrHYL3pvJ43hKmajxDar5dsjVe543J_sMnXu4w4rR4"/>
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
            <div className="relative z-10 p-12 md:p-24 max-w-2xl">
              <h2 className="font-headline text-4xl md:text-5xl text-white mb-8 italic">Un faro en la niebla.</h2>
              <p className="text-surface-container text-lg md:text-xl font-light leading-relaxed mb-12">No es posible navegar sin saber dónde se encuentra uno exactamente. Nuestro método actúa como un radar emocional: localizamos su estado actual para poder ofrecerle un rescate preciso. En ReprogrÁmate todo comienza con la ubicación de tu posición exacta.</p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button onClick={() => navigate('/session')} className="px-8 py-5 bg-white text-primary font-bold rounded-full text-lg hover:bg-surface-container-high transition-all duration-300">
                  Iniciar Consulta Gratuita con IA
                </button>
                <button onClick={() => navigate('/method')} className="px-8 py-5 border border-white/30 text-white font-medium rounded-full text-lg hover:bg-white/10 transition-all duration-300">
                  Regresar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
