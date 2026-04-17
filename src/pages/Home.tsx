import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle } from "../firebase";

export default function Home() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [loginError, setLoginError] = useState("");

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/session");
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      if (!user) {
        await signInWithGoogle();
      }
      navigate("/session");
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("Error al iniciar sesión. Por favor, permite las ventanas emergentes.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center mb-32">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img alt="misty forest path at dawn" className="w-full h-full object-cover opacity-60 grayscale-[20%]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7zzoyzjJf6oT05aMgHXBc3ezEwfzBdpbxANUbwmPP3QbrrzRUUHURAhiJKyIpjk0cgpZB2HprJBAKwCSP9xL7BW5OpBVIydAhKjS83LcFmLTjyGebIz6pm-XqsWRdf-ynaK_wVPPuvGrdLYLIIvmtgH6zPvNw9J9b2rw681zHOeIDTii6mnrQYWzD8cghDiyLHHtlw2e3pc8hCyOc9TG2wpGCBoeq7IKNqN_noIKieNdZSZyac0HqVizdtPrT7Z1JDR_bySa_Udwi"/>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left: Logo and Title Group */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
              <img alt="Logo" className="h-48 md:h-56 w-auto object-contain mb-6 drop-shadow-sm opacity-80" src="/logo.png" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://placehold.co/400x400/f9f9f8/2c3e50?text=Logo"; }}/>
              <h2 className="font-headline text-3xl md:text-4xl text-primary tracking-tight font-medium">ReprogrÁmate <span className="italic font-light">SoyBienestar.es</span></h2>
            </div>
            {/* Right: Headline and Sub-text */}
            <div className="max-w-2xl text-center lg:text-left">
              <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-primary leading-tight mb-8">
                Diseñando el camino hacia tu <br/><span className="italic font-light">equilibrio interior.</span>
              </h1>
              <p className="font-body text-2xl text-on-surface-variant leading-relaxed font-light italic mb-8">
                Tu viaje de regreso al centro comienza aquí.
              </p>
            </div>
          </div>
          {/* Floating Quote Overlay Style */}
          <div className="mt-20 lg:mt-32 max-w-lg hidden lg:block">
            <p className="font-headline text-3xl text-primary/80 italic font-light tracking-wide drop-shadow-sm border-l-4 border-primary/20 pl-6 py-2">
              "Un espacio donde ser escuchado sin juicios"
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
          <div>
            <h2 className="font-headline text-3xl text-primary mb-6">Un regalo para tu calma</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 font-light">
              Como agradecimiento por tu honestidad en este proceso, queremos entregarte un kit de herramientas personalizado.
            </p>
          </div>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary">self_improvement</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Meditaciones Guiadas</h3>
                <p className="text-on-surface-variant text-sm font-light">Sesiones de audio enfocadas en reducir la ansiedad según tu perfil.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary">description</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Guía de Ejercicios</h3>
                <p className="text-on-surface-variant text-sm font-light">Protocolos somáticos para regular tu sistema nervioso.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary">verified_user</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Tu Espacio Seguro</h3>
                <p className="text-on-surface-variant text-sm font-light">Tus datos son un vínculo sagrado de confianza.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: The Form */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-sm border border-outline-variant/10">
            <div className="mb-10">
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 bg-white border border-outline-variant/30 py-4 rounded-full shadow-sm hover:shadow-md hover:bg-surface-container-lowest transition-all duration-300 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-primary font-headline text-lg tracking-wide">{user ? "Continuar Sesión" : "Acceso automático vía Google"}</span>
              </button>
              <div className="relative flex py-8 items-center">
                <div className="flex-grow border-t border-outline-variant/20"></div>
                <span className="flex-shrink mx-4 text-on-surface-variant/40 text-xs uppercase tracking-[0.3em] font-bold">o completa manualmente</span>
                <div className="flex-grow border-t border-outline-variant/20"></div>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="font-headline text-2xl text-primary mb-2">Comienza tu Sesión de Claridad</h2>
              <p className="text-on-surface-variant font-light">Por favor, facilítanos la vía para enviarte tu material personalizado.</p>
            </div>
            <form className="space-y-8" onSubmit={handleStartSession}>
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Nombre Completo</label>
                <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="Ej. Martina García" type="text"/>
              </div>
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Correo Electrónico</label>
                <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="martina@ejemplo.com" type="email"/>
              </div>
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">WhatsApp (Opcional)</label>
                <div className="flex gap-4">
                  <span className="bg-surface-container-low border-b-2 border-outline/30 py-3 px-4 text-on-surface-variant">+34</span>
                  <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="600 000 000" type="tel"/>
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container transition-all duration-300 active:scale-[0.98]">
                  Recibir mis guías personalizadas
                </button>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant/60 justify-center">
                <span className="material-symbols-outlined text-sm">lock</span>
                <p className="text-[10px] uppercase tracking-tighter">Tus datos están protegidos por cifrado de extremo a extremo.</p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Section: Un faro en la niebla */}
      <section className="relative w-full mb-40 overflow-visible">
        <div className="cenefa-decorative mb-16">
          <div className="cenefa-line left"></div>
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>flare</span>
          <div className="cenefa-line right"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8">
          <div className="relative w-full h-[550px] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-outline-variant/10">
            <img alt="Lighthouse landscape" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida/ADBb0ugYeq9c3sSuRsWDLqHWlOtp3jUDX_v0O9otVkNt0zJhMEMXtwTYYzCEZlXrexLFbqec80Vgy3Bn-YB9UMqXHaFwB41KE0wS2bhLhzLMlzicKs-TEso_FL7Qx2W_ikWI2KFW9Wd5KPZmUk7vkPWx3pa1nRnvFfIqshI5gmIG4Nhl90UbVUD-jxURBVrmbaqKh0EM0AoKf9fpGkIya1uXbpkuTdoqEgTwg8SRaCO5F0SEo268pj4YPAtdBgfbTDge7vsyrTxQmcWMKyI"/>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-primary text-6xl mb-6">light_mode</span>
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-primary mb-6 drop-shadow-sm">Un faro en la niebla</h2>
              <h3 className="font-headline text-2xl md:text-3xl text-primary/90 mb-8 italic font-light">Tu Puente hacia el Bienestar</h3>
              <p className="font-body text-xl text-primary max-w-2xl leading-relaxed font-light mb-10">
                Te guiamos a través de la niebla hacia un puerto seguro. Nuestra metodología combina estructura y sensibilidad para que recuperes el mando de tu vida.
              </p>
              <button onClick={() => navigate('/session')} className="bg-primary text-on-primary px-12 py-5 rounded-full font-headline text-xl tracking-wide shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1 relative z-20 overflow-hidden group">
                <span className="relative z-10">Comenzar Sesión de Claridad</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
        <div className="cenefa-decorative mt-16">
          <div className="cenefa-line left"></div>
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>flare</span>
          <div className="cenefa-line right"></div>
        </div>
      </section>

      {/* The Hybrid Approach */}
      <section className="py-32 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl">
              <img alt="serene lake water" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByyJgogocVjCPOxXQxHKNXYzp-G1FGJ_nU9Hce-Po8bcUcktmIrkSn5fwur3EnfxCYpIPyHXbYQMvRBAUzDTtT0h2nMm-tgTsgcjAWsr-Eau2mGYQGX60D5nnXeP-ICYZ31LRmhWL_AiorwNazJrDD0Nl2RuVZinFwHjGWa9v7tbI5uSCbXfXFKRzKCVshA98Or_KHuCaIoMdzHWnn3HTpmVuUIsHVU_09hna3wfAY1n93-W2tUyqCVXdnV7MIFn7iDiSe4xMlimqQ"/>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="space-y-12">
              <div>
                <h2 className="font-headline text-4xl md:text-5xl text-primary mb-6">Un enfoque híbrido para el alma moderna</h2>
                <p className="font-body text-xl text-on-surface-variant leading-relaxed font-light">
                  Fusionamos la precisión de la tecnología con la profundidad de la empatía humana.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">neurology</span>
                  <h3 className="font-headline text-2xl text-primary">IA que escucha</h3>
                  <p className="font-body text-on-surface-variant font-light text-lg">Un espacio disponible 24/7 para desahogarte sin juicios, donde nuestra tecnología ofrece herramientas inmediatas.</p>
                </div>
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">volunteer_activism</span>
                  <h3 className="font-headline text-2xl text-primary">Humano que valida</h3>
                  <p className="font-body text-on-surface-variant font-light text-lg">Expertos en salud mental supervisan y validan cada paso de tu proceso terapéutico.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Symptoms Section: Reconociendo tus batallas */}
      <section className="py-32 px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-headline text-5xl md:text-6xl text-primary mb-8">Reconociendo tus batallas</h2>
            <p className="font-body text-on-surface-variant text-xl max-w-3xl mx-auto font-light leading-relaxed">Ponemos nombre a lo que sientes para empezar a sanar. No son solo síntomas, es tu historia pidiendo atención desde un lugar de compasión.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 zen-light-gray rounded-[2.5rem] p-12 flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-all duration-500 group text-primary">
              <div>
                <span className="material-symbols-outlined text-7xl text-primary/80 mb-10 transition-transform group-hover:scale-110">air</span>
                <h3 className="font-headline text-4xl md:text-5xl mb-8">Ansiedad</h3>
                <p className="font-body text-on-surface-variant max-w-2xl font-light text-2xl leading-relaxed">Ese ruido constante que no te deja descansar. Te ayudamos a encontrar el silencio en medio de la tormenta con herramientas de calma profunda.</p>
              </div>
              <div className="mt-10 border-b-2 border-primary/30 pb-2 inline-block self-start font-body text-sm uppercase tracking-[0.2em] font-bold hover:border-primary transition-colors cursor-pointer">Recuperar la calma</div>
            </div>
            <div className="md:col-span-4 zen-taupe p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-all duration-500 group text-white">
              <div>
                <span className="material-symbols-outlined text-6xl mb-8 text-white/90 transition-transform group-hover:scale-110">speed</span>
                <h3 className="font-headline text-4xl mb-6">Estrés</h3>
                <p className="font-body text-white/90 font-light text-xl leading-relaxed">Cuando el mundo pesa demasiado. Estrategias prácticas para soltar lastre y reenfocar tu energía vital.</p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-white transition-colors cursor-pointer">Soltar carga</div>
            </div>
            <div className="md:col-span-4 zen-sand p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-all duration-500 group text-white">
              <div>
                <span className="material-symbols-outlined text-6xl text-white/90 mb-8 transition-transform group-hover:scale-110">bedtime</span>
                <h3 className="font-headline text-4xl mb-6">Insomnio</h3>
                <p className="font-body text-white/90 font-light text-xl leading-relaxed">Recupera el descanso sagrado. Higiene del sueño y regulación somática para noches de paz real.</p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-white transition-colors cursor-pointer">Dulce descanso</div>
            </div>
            <div className="md:col-span-8 zen-mist p-12 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-all duration-500 group text-white">
              <div>
                <span className="material-symbols-outlined text-7xl text-white/90 mb-10 transition-transform group-hover:scale-110">schedule</span>
                <h3 className="font-headline text-4xl md:text-5xl mb-8">Procrastinación</h3>
                <p className="font-body text-white/80 max-w-2xl font-light text-2xl leading-relaxed">Supera la parálisis del análisis. Construimos puentes entre tus intenciones y tus acciones diarias con suavidad.</p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-sm uppercase tracking-[0.2em] font-bold hover:border-white transition-colors cursor-pointer">Activar el cambio</div>
            </div>
            <div className="md:col-span-8 zen-azure-fog p-12 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-all duration-500 group text-white">
              <div>
                <span className="material-symbols-outlined text-7xl text-white/90 mb-10 transition-transform group-hover:scale-110">all_inclusive</span>
                <h3 className="font-headline text-4xl md:text-5xl mb-8">Rumiación</h3>
                <p className="font-body text-white/80 max-w-2xl font-light text-2xl leading-relaxed">Rompe el ciclo de pensamientos circulares. Técnicas cognitivas avanzadas para salir de la trampa mental y recuperar la presencia.</p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-sm uppercase tracking-[0.2em] font-bold hover:border-white transition-colors cursor-pointer">Liberar la mente</div>
            </div>
            <div className="md:col-span-4 zen-stone p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-all duration-500 group text-white">
              <div>
                <span className="material-symbols-outlined text-6xl text-white/90 mb-8 transition-transform group-hover:scale-110">psychology_alt</span>
                <h3 className="font-headline text-4xl mb-6">Gestión Emocional</h3>
                <p className="font-body text-white/90 font-light text-xl leading-relaxed">Aprende a navegar tus emociones sin que ellas te gobiernen. Inteligencia emocional aplicada a tu día a día.</p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-white transition-colors cursor-pointer">Equilibrio interno</div>
            </div>
            <div className="md:col-span-4 zen-light-gray p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-all duration-500 group text-primary">
              <div>
                <span className="material-symbols-outlined text-6xl text-primary/80 mb-8 transition-transform group-hover:scale-110">restaurant</span>
                <h3 className="font-headline text-4xl mb-6">Alimentación</h3>
                <p className="font-body text-on-surface-variant font-light text-xl leading-relaxed">Sana tu relación con el cuerpo y la comida desde un enfoque consciente y sin culpas.</p>
              </div>
              <div className="mt-10 border-b-2 border-primary/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-primary transition-colors cursor-pointer">Nutrir el alma</div>
            </div>
            <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden group min-h-[480px] shadow-xl">
              <img alt="soft morning sunlight" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNm2HLjqWbCmeIQ8CL4M7kRUrRaLJ3rJned_WLrEtgJWunyIhBaQYl2KQGy26WkLNaUyXUNifaFltAmoRY4PPxIOUnEithCUKe611JWkfeU-ums-vc0mf2Z6hyPFW_nW8CnGt_nTBzXY3jIefolNjxMNsTGoNq1MsTrbsh6AyPizoejtDbL0byUjeQbfkMT4woWyD5XWh7W89K19IZ-2G_XLTi0SbuP2pbT45MUlGC3UfYm9Vo9qXeNnN95IOabEVVAjhv9NvuFLEm"/>
              <div className="absolute inset-0 bg-primary/70 backdrop-blur-[2px]"></div>
              <div className="relative h-full p-12 flex flex-col justify-end text-on-primary">
                <h3 className="font-headline text-4xl md:text-5xl mb-6">Sesiones de Claridad</h3>
                <p className="font-body opacity-90 font-light text-2xl mb-10 leading-relaxed max-w-xl">Tu primer encuentro hacia la luz. Un espacio dedicado exclusivamente a ti.</p>
                <div onClick={() => navigate('/session')} className="bg-surface text-primary px-10 py-5 rounded-full self-start font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95">Reservar ahora</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance Banner */}
      <section className="max-w-7xl mx-auto px-8 mt-12 mb-32">
        <div className="bg-surface-container-low p-16 rounded-[2.5rem] text-center border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] scale-150">
            <span className="material-symbols-outlined text-[300px] text-primary">security</span>
          </div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-5xl text-secondary mb-6">shield_with_heart</span>
            <h3 className="font-headline text-3xl text-primary mb-6">Un Compromiso de Confidencialidad</h3>
            <p className="max-w-3xl mx-auto text-on-surface-variant leading-relaxed font-light text-lg">
              Entendemos que compartir tu información es un acto de vulnerabilidad. En Arquitectura del Bienestar, tratamos cada dato bajo los más estrictos estándares éticos y de privacidad europeos. Tu seguridad es la base de nuestra terapia.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
