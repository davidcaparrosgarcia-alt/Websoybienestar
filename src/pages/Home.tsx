import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import RippleWindow from "../components/RippleWindow";
import LighthouseBeamFrame from "../components/LighthouseBeamFrame";
import SymptomCard from "../components/SymptomCard";

export default function Home() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [loginError, setLoginError] = useState("");
  const [selectedInfographic, setSelectedInfographic] = useState<{ id: string, src: string } | null>(null);

  // States for the new logged-in panel
  const [phone, setPhone] = useState("");
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [channels, setChannels] = useState({ whatsapp: false, sms: false, telegram: false });
  const [validationError, setValidationError] = useState("");
  
  // New States requested
  const [showPostLoginModal, setShowPostLoginModal] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [contactEmail, setContactEmail] = useState("");

  // Sync email when user loads
  useEffect(() => {
    if (user?.email && !contactEmail) {
      setContactEmail(user.email);
    }
  }, [user]);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/session");
  };

  const handleContinueLogged = (e: React.FormEvent) => {
    e.preventDefault();
    if (wantsAlerts && !channels.whatsapp && !channels.sms && !channels.telegram) {
      setValidationError("Selecciona al menos un canal si deseas recibir alertas.");
      return;
    }
    setValidationError("");
    // Save to local view state 
    setProfileSaved(true);
    setIsEditingProfile(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      if (!user) {
        await signInWithGoogle();
      }
      setShowPostLoginModal(true);
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("Error al iniciar sesión. Por favor, permite las ventanas emergentes.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full mb-20 md:mb-32">
        <div className="relative w-full">
          {/* Desktop/Horizontal Image */}
          <img 
            alt="Soy Bienestar - Hero Desktop" 
            className="hidden md:block w-full h-auto object-contain object-top" 
            src="/images/inicio-horizontal.jpg"
            referrerPolicy="no-referrer"
          />
          {/* Mobile/Vertical Image */}
          <img 
            alt="Soy Bienestar - Hero Mobile" 
            className="block md:hidden w-full h-auto object-contain object-top" 
            src="/images/inicio-movil.jpg"
            referrerPolicy="no-referrer"
          />
          {/* Gradiente sutil inferior para asegurar la legibilidad de la frase */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Floating Quote Overlay Style */}
          <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 max-w-lg z-10 w-[calc(100%-2.5rem)]">
            <p className="font-headline text-2xl md:text-3xl lg:text-4xl text-primary/90 italic font-light tracking-wide drop-shadow-md border-l-4 border-primary/40 pl-4 md:pl-6 py-2">
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
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">self_improvement</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Meditaciones Guiadas</h3>
                <p className="text-on-surface-variant text-sm font-light">Sesiones de audio enfocadas en reducir la ansiedad según tu perfil.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">description</span>
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary mb-1">Guía de Ejercicios</h3>
                <p className="text-on-surface-variant text-sm font-light">Protocolos somáticos para regular tu sistema nervioso.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">verified_user</span>
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
            {!user ? (
              <>
                <div className="mb-10">
                  <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 bg-primary text-on-primary border border-transparent py-4 rounded-full shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-300 group dark:bg-primary dark:text-on-primary">
                    <div className="bg-white rounded-full p-1 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                    </div>
                    <span className="font-headline text-lg tracking-wide">Acceso automático vía Google</span>
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
                    <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="Ej. Martina García" type="text" required />
                  </div>
                  <div className="group">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Correo Electrónico</label>
                    <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" placeholder="martina@ejemplo.com" type="email" required />
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
                    <p className="text-xs uppercase tracking-wide opacity-90">Tus datos están protegidos por cifrado de extremo a extremo.</p>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-headline text-3xl text-primary mb-4">Acceso a recursos y cuestionario espejo</h2>
                  <p className="text-on-surface-variant text-lg font-light mb-4 leading-relaxed">
                    Si deseas recibir enlaces directos a recursos y al cuestionario espejo, puedes añadir también tu teléfono para que podamos enviártelos por WhatsApp.
                  </p>
                  <div className="bg-surface-variant/30 p-4 rounded-xl border border-outline-variant/20 mb-8">
                    <div className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">info</span>
                      <p className="text-sm text-on-surface-variant font-light">
                        <strong className="font-semibold text-primary">El camino a tu bienestar:</strong>
                        <br/>
                        Al finalizar esta sesión gratuita desbloquearás tus primeras herramientas.
                        Completando el cuestionario espejo accederás a tu <strong>dosier personalizado</strong> y otros recursos exclusivos.
                        Todo el material que desbloquees será tuyo de por vida.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant/60 mt-4 leading-relaxed mb-8">
                    Tu teléfono solo se utilizará para el envío de enlaces y recursos solicitados por ti. Nunca se usará con fines publicitarios ni se cederá a terceros.
                  </p>
                </div>

                {profileSaved && !isEditingProfile ? (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <p className="text-primary font-medium mt-0.5">Tus preferencias han sido guardadas con éxito.</p>
                    </div>

                    {!wantsAlerts && (
                      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 transition-all hover:border-primary/40 cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center p-1">
                            <div className="w-5 h-5 border-2 border-outline rounded-md"></div>
                          </div>
                          <div>
                            <span className="text-primary font-medium block">Deseo recibir también alertas sobre nuevos recursos o eventos de SoyBienestar.es</span>
                            <span className="text-xs text-on-surface-variant/60 mt-1 block">Puedes activar las alertas modificando tus datos.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                       <button onClick={() => setIsEditingProfile(true)} className="w-full bg-surface-container-low border border-primary/20 text-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-surface-container-high transition-all duration-300">
                         Modificar datos
                       </button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-8 animate-in fade-in duration-500" onSubmit={handleContinueLogged}>
                    
                    {isEditingProfile && (
                      <div className="group border border-primary/10 bg-primary/5 p-6 rounded-2xl mb-6">
                        <h4 className="font-headline text-xl text-primary mb-4">Cambiar Login (Correo)</h4>
                        <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Email de Contacto</label>
                        <input 
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" 
                          placeholder="tu@email.com"
                          type="email"
                        />
                        <p className="text-xs text-on-surface-variant/70 mt-2">Al cambiar tu correo principal conservarás tus avances, recursos y contraseñas.</p>
                      </div>
                    )}

                    <div className="group">
                      <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 font-semibold">Añadir WhatsApp (Opcional)</label>
                      <div className="flex gap-4">
                        <span className="bg-surface-container-low border-b-2 border-outline/30 py-3 px-4 text-on-surface-variant">+34</span>
                        <input 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-surface-container-low border-0 border-b-2 border-outline/30 focus:ring-0 focus:border-primary transition-all duration-300 py-3 text-lg font-light" 
                          placeholder="600 000 000" 
                          type="tel"
                        />
                      </div>
                    </div>

                    {/* Alerts Block */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 mt-8">
                      <label className="flex items-start gap-4 cursor-pointer group mb-1">
                        <div className="relative flex items-center justify-center p-1">
                          <input 
                            type="checkbox" 
                            checked={wantsAlerts}
                            onChange={(e) => setWantsAlerts(e.target.checked)}
                            className="peer sr-only" 
                          />
                          <div className="w-5 h-5 border-2 border-outline rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                          <span className="material-symbols-outlined absolute text-white text-sm opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none">check</span>
                        </div>
                        <span className="text-primary font-medium">Deseo recibir también alertas sobre nuevos recursos o eventos de SoyBienestar.es</span>
                      </label>

                      <AnimatePresence>
                        {wantsAlerts && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-11 pt-4 pb-2 space-y-3">
                              <p className="text-xs text-on-surface-variant mb-3 uppercase tracking-wider font-semibold">Selecciona los canales:</p>
                              
                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.whatsapp}
                                    onChange={(e) => setChannels({...channels, whatsapp: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">WhatsApp</span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.sms}
                                    onChange={(e) => setChannels({...channels, sms: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">SMS</span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={channels.telegram}
                                    onChange={(e) => setChannels({...channels, telegram: e.target.checked})}
                                    className="peer sr-only" 
                                  />
                                  <div className="w-4 h-4 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                                  <span className="material-symbols-outlined absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 font-bold pointer-events-none">check</span>
                                </div>
                                <span className="text-on-surface-variant text-sm">Telegram</span>
                              </label>

                              {validationError && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} 
                                  className="flex items-center gap-2 text-error text-sm mt-3 bg-error/10 p-2 rounded"
                                >
                                  <span className="material-symbols-outlined text-base">error</span>
                                  {validationError}
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="pt-6">
                      <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container transition-all duration-300 active:scale-[0.98]">
                        {isEditingProfile ? "Guardar Cambios" : "Validar y Continuar Sesión"}
                      </button>
                      
                      {isEditingProfile && (
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="w-full text-on-surface-variant font-medium mt-4 pt-2 pb-2 hover:text-primary transition-colors">
                           Cancelar edición
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-on-surface-variant/60 justify-center">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <p className="text-xs uppercase tracking-wide opacity-90">Tus datos están protegidos por cifrado de extremo a extremo.</p>
                    </div>
                  </form>
                )}
              </>
            )}
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
          <LighthouseBeamFrame
            className="relative w-full h-[550px] rounded-[2.5rem] shadow-2xl border border-outline-variant/10 group"
            background={
              <>
                <img
                  alt="Lighthouse landscape"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  src="/images/fondo-faro.jpg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
              </>
            }
          >
            <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-primary text-6xl mb-6">light_mode</span>
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-primary mb-6 drop-shadow-sm">Un faro en la niebla</h2>
              <h3 className="font-headline text-2xl md:text-3xl text-primary/90 mb-8 italic font-light">Tu Puente hacia el Bienestar</h3>
              <p className="font-body text-xl text-primary max-w-2xl leading-relaxed font-light mb-10">
                Te guiamos a través de la niebla hacia un puerto seguro. Nuestra metodología combina estructura y sensibilidad para que recuperes el mando de tu vida.
              </p>
              <button onClick={() => navigate('/session')} className="bg-primary text-on-primary px-12 py-5 rounded-full font-headline text-xl tracking-wide shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1 relative z-20 overflow-hidden text-group">
                <span className="relative z-10">Comenzar Sesión de Claridad</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </LighthouseBeamFrame>
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
            <RippleWindow className="rounded-[2rem] shadow-2xl aspect-[4/5]">
              <img alt="serene lake water" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByyJgogocVjCPOxXQxHKNXYzp-G1FGJ_nU9Hce-Po8bcUcktmIrkSn5fwur3EnfxCYpIPyHXbYQMvRBAUzDTtT0h2nMm-tgTsgcjAWsr-Eau2mGYQGX60D5nnXeP-ICYZ31LRmhWL_AiorwNazJrDD0Nl2RuVZinFwHjGWa9v7tbI5uSCbXfXFKRzKCVshA98Or_KHuCaIoMdzHWnn3HTpmVuUIsHVU_09hna3wfAY1n93-W2tUyqCVXdnV7MIFn7iDiSe4xMlimqQ"/>
            </RippleWindow>
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
            <SymptomCard
              id="ansiedad"
              title="Ansiedad"
              description="Ese ruido constante que no te deja descansar. Te ayudamos a encontrar el silencio en medio de la tormenta con herramientas de calma profunda."
              actionText="Recuperar la calma"
              icon="air"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-light-gray"
              isDarkText={true}
              onClick={() => setSelectedInfographic({ id: 'ansiedad', src: '/images/info-ansiedad.jpg'})}
            />
            
            <SymptomCard
              id="estres"
              title="Estrés"
              description="Cuando el mundo pesa demasiado. Estrategias prácticas para soltar lastre y reenfocar tu energía vital."
              actionText="Soltar carga"
              icon="speed"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-taupe"
              onClick={() => setSelectedInfographic({ id: 'estres', src: '/images/info-estres.jpg'})}
            />

            <SymptomCard
              id="insomnio"
              title="Insomnio"
              description="Recupera el descanso sagrado. Higiene del sueño y regulación somática para noches de paz real."
              actionText="Dulce descanso"
              icon="bedtime"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-sand"
              onClick={() => setSelectedInfographic({ id: 'insomnio', src: '/images/info-insomnio.jpg'})}
            />

            <SymptomCard
              id="procrastinacion"
              title="Procrastinación"
              description="Supera la parálisis del análisis. Construimos puentes entre tus intenciones y tus acciones diarias con suavidad."
              actionText="Activar el cambio"
              icon="schedule"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-mist"
              onClick={() => setSelectedInfographic({ id: 'procrastinacion', src: '/images/info-procrastinacion.jpg'})}
            />

            <SymptomCard
              id="rumiacion"
              title="Rumiación"
              description="Rompe el ciclo de pensamientos circulares. Técnicas cognitivas avanzadas para salir de la trampa mental y recuperar la presencia."
              actionText="Liberar la mente"
              icon="all_inclusive"
              colSpanClass="md:col-span-8"
              bgColorClass="zen-azure-fog"
              onClick={() => setSelectedInfographic({ id: 'rumiacion', src: '/images/info-rumiacion.jpg'})}
            />

            <SymptomCard
              id="emociones"
              title="Gestión Emocional"
              description="Aprende a navegar tus emociones sin que ellas te gobiernen. Inteligencia emocional aplicada a tu día a día."
              actionText="Equilibrio interno"
              icon="psychology_alt"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-stone"
              onClick={() => setSelectedInfographic({ id: 'emociones', src: '/images/info-emociones.jpg'})}
            />

            <SymptomCard
              id="alimentacion"
              title="Alimentación"
              description="Sana tu relación con el cuerpo y la comida desde un enfoque consciente y sin culpas."
              actionText="Nutrir el alma"
              icon="restaurant"
              colSpanClass="md:col-span-4"
              bgColorClass="zen-light-gray"
              isDarkText={true}
              onClick={() => setSelectedInfographic({ id: 'alimentacion', src: '/images/info-alimentacion.jpg'})}
            />

            <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden group min-h-[380px] shadow-xl">
              <img alt="soft morning sunlight" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNm2HLjqWbCmeIQ8CL4M7kRUrRaLJ3rJned_WLrEtgJWunyIhBaQYl2KQGy26WkLNaUyXUNifaFltAmoRY4PPxIOUnEithCUKe611JWkfeU-ums-vc0mf2Z6hyPFW_nW8CnGt_nTBzXY3jIefolNjxMNsTGoNq1MsTrbsh6AyPizoejtDbL0byUjeQbfkMT4woWyD5XWh7W89K19IZ-2G_XLTi0SbuP2pbT45MUlGC3UfYm9Vo9qXeNnN95IOabEVVAjhv9NvuFLEm"/>
              <div className="absolute inset-0 bg-primary/70 backdrop-blur-[2px]"></div>
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-end text-on-primary">
                <h3 className="font-headline text-4xl md:text-5xl mb-6">Sesiones de Claridad</h3>
                <p className="font-body opacity-90 font-light text-2xl mb-10 leading-relaxed max-w-xl">Tu primer encuentro hacia la luz. Un espacio dedicado exclusivamente a ti.</p>
                <div onClick={() => navigate('/session')} className="bg-surface text-primary px-10 py-5 rounded-full self-start font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all cursor-pointer shadow-lg active:scale-95">Reservar ahora</div>
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
      {/* Organic Animated Infographic Modal */}
      <AnimatePresence>
        {selectedInfographic && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm"
              onClick={() => setSelectedInfographic(null)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                layoutId={`card-${selectedInfographic.id}`}
                className="relative w-full max-w-5xl max-h-[90vh] bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Elegant Action Buttons */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-[130]">
                  <a 
                    href={selectedInfographic.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur border border-outline-variant/30 hover:bg-surface text-primary flex items-center justify-center transition-all duration-300 shadow-sm group"
                    title="Abrir en pantalla completa / Descargar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">open_in_new</span>
                  </a>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInfographic(null);
                    }}
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur border border-outline-variant/30 hover:bg-surface text-primary flex items-center justify-center transition-all duration-300 shadow-sm group"
                    aria-label="Cerrar infographic"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
                  </button>
                </div>
                
                {/* Scrollable document area */}
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    src={selectedInfographic.src} 
                    alt="Infografía" 
                    className="w-full h-auto rounded-xl shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Post-Login Transition Modal */}
      <AnimatePresence>
        {showPostLoginModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
              onClick={() => setShowPostLoginModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-surface p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-outline-variant/20"
              >
                <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                </div>
                <h3 className="font-headline text-3xl text-primary mb-4">¡Te damos la bienvenida!</h3>
                <p className="text-on-surface-variant text-lg font-light mb-10 leading-relaxed">
                  Has accedido correctamente a tu espacio seguro. ¿Deseas realizar tu consulta gratuita ahora o prefieres seguir navegando?
                </p>
                <div className="flex flex-col gap-4">
                  <button onClick={() => navigate('/session')} className="w-full bg-primary text-on-primary py-4 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container hover:text-on-primary-container transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Realizar ahora la Consulta Gratuita
                  </button>
                  <button onClick={() => setShowPostLoginModal(false)} className="w-full bg-surface-container-lowest text-primary py-4 rounded-full font-headline text-lg border border-outline-variant/30 hover:bg-surface-container-low transition-all">
                    Seguir navegando por la web
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
