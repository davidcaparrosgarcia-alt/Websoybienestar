import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import fondoFaro from "../assets/images/fondo-faro.jpg";
import fondoZen from "../assets/images/fondo-zen.jpg";
import infoAnsiedad from "../assets/images/info-ansiedad.jpg";
import infoEstres from "../assets/images/info-estres.jpg";
import infoInsomnio from "../assets/images/info-insomnio.jpg";
import infoProcrastinacion from "../assets/images/info-procrastinacion.jpg";
import infoRumiacion from "../assets/images/info-rumiacion.jpg";
import infoEmociones from "../assets/images/info-emociones.jpg";
import infoAlimentacion from "../assets/images/info-alimentacion.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [loginError, setLoginError] = useState("");
  const [selectedInfographic, setSelectedInfographic] = useState<{ id: string, src: string } | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftForm, setGiftForm] = useState({ fullName: '', email: '', whatsapp: '' });

  const handleProtectedAction = async (action: () => void) => {
    if (user) {
      action();
    } else {
      const success = await signInWithGoogle();
      if (success) {
        action();
      } else {
        setLoginError("Debes iniciar sesión para continuar");
        setTimeout(() => setLoginError(""), 3000);
      }
    }
  };
  
  const handleGiftFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Gift form submitted:", giftForm);
    alert("Gracias. Aquí iría la integración para el envío del material.");
    setShowGiftModal(false);
    setGiftForm({ fullName: '', email: '', whatsapp: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <section
        className="relative w-full h-[88vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/fondo-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-primary/15 to-black/40"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/soft-wallpaper.png')] opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"
        ></motion.div>
        <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3 }}>
            <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl text-white text-shadow-lg mb-8 leading-[0.9] tracking-wide">
              ReprogrÁmate
            </h1>
            <div className="w-32 h-[2px] bg-white/60 mx-auto mb-8"></div>
            <p className="font-body text-xl md:text-2xl lg:text-3xl text-white/95 max-w-4xl mx-auto font-light leading-relaxed tracking-wide">
              Un puente hacia la calma, la claridad y el reencuentro contigo mismo
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <button
                onClick={() => handleProtectedAction(() => navigate('/questionnaire'))}
                className="group bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-full font-body text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                <span className="flex items-center gap-3">
                  Comenzar tu viaje
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </span>
              </button>
              <Link
                to="/about"
                className="border-2 border-white/40 hover:border-white/70 text-white px-10 py-4 rounded-full font-body text-lg font-medium transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
              >
                Nuestro método
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="material-symbols-outlined text-primary/40 text-8xl mb-8 block">self_improvement</span>
            <h2 className="font-headline text-5xl md:text-6xl lg:text-7xl text-primary mb-8 leading-tight">
              Un camino de transformación serena
            </h2>
            <div className="w-24 h-[1px] bg-primary/30 mx-auto mb-8"></div>
            <p className="font-body text-2xl md:text-3xl text-on-surface-variant max-w-5xl mx-auto font-light leading-relaxed">
              Soy Bienestar es un espacio seguro donde la tecnología y la conciencia se unen para acompañarte a liberar las cargas
              que hoy sostienes y reconectar con tu esencia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* QUIENES SOMOS SECTION */}
      <section className="py-24 bg-background relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="relative">
                <img
                  alt="Peaceful woman in nature"
                  className="w-full h-[600px] object-cover rounded-[3rem] shadow-2xl"
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop"
                />
                <div className="absolute -bottom-8 -right-8 bg-primary text-primary-foreground p-8 rounded-[2rem] shadow-xl max-w-xs">
                  <span className="material-symbols-outlined text-4xl mb-4 block">favorite</span>
                  <p className="font-body text-lg font-light leading-relaxed">
                    Ciencia, conciencia y compasión al servicio de tu bienestar
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h2 className="font-headline text-5xl md:text-6xl text-primary mb-8 leading-tight">¿Quiénes somos?</h2>
              <div className="w-20 h-[1px] bg-primary/30 mb-8"></div>
              <div className="space-y-8">
                <p className="font-body text-xl text-on-surface-variant font-light leading-relaxed">
                  En Soy Bienestar, creemos que cada experiencia de malestar puede transformarse en una puerta hacia una vida más plena y consciente.
                </p>
                <p className="font-body text-xl text-on-surface-variant font-light leading-relaxed">
                  Nuestra misión es guiarte, mediante tecnología de vanguardia y sensibilidad humana, para comprender y sanar las raíces más profundas de tu ansiedad, estrés, rumiación o bloqueo emocional.
                </p>
                <p className="font-body text-xl text-on-surface-variant font-light leading-relaxed">
                  No ofrecemos respuestas genéricas: diseñamos un mapa único hacia tu equilibrio interior.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONSULTA PERSONALIZADA */}
      <section className="py-32 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="relative w-full h-[550px] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-outline-variant/10">
            <img
              alt="Lighthouse landscape"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              src={fondoFaro}
            />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-primary text-6xl mb-6">light_mode</span>
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-primary mb-6 drop-shadow-sm">Un faro en la niebla</h2>
              <h3 className="font-headline text-2xl md:text-3xl text-primary/90 mb-8 italic font-light">Tu Puente hacia el Bienestar</h3>
              <div className="w-24 h-[2px] bg-primary/60 mb-8"></div>
              <p className="font-body text-lg md:text-xl lg:text-2xl text-primary/95 max-w-4xl leading-relaxed font-light mb-12">
                Una consulta personalizada de 60 minutos para que explores lo que te está ocurriendo, identifiques posibles raíces y traces un mapa sereno con herramientas de calma profunda.
              </p>
              <button
                onClick={() => handleProtectedAction(() => navigate('/questionnaire'))}
                className="group bg-primary/90 hover:bg-primary text-primary-foreground px-10 py-4 rounded-full font-body text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg backdrop-blur-sm"
              >
                <span className="flex items-center gap-3">
                  Comenzar ahora
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CUESTIONES TRATABLES SECTION */}
      <section className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="material-symbols-outlined text-primary/40 text-7xl mb-6 block">psychology</span>
            <h2 className="font-headline text-5xl md:text-6xl text-primary mb-8">Acompañamiento para posibles bloqueos emocionales</h2>
            <div className="w-20 h-[1px] bg-primary/30 mx-auto mb-8"></div>
            <p className="font-body text-2xl text-on-surface-variant max-w-4xl mx-auto font-light leading-relaxed">
              Cada experiencia es única. Estos son algunos de los territorios donde podemos ayudarte a encontrar claridad, alivio y dirección.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <motion.div
              layoutId="card-ansiedad"
              onClick={() => setSelectedInfographic({ id: 'ansiedad', src: infoAnsiedad })}
              className="cursor-pointer md:col-span-8 zen-light-gray rounded-[2.5rem] p-12 flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-shadow duration-500 group text-primary relative"
            >
              <div>
                <span className="material-symbols-outlined text-7xl text-primary/80 mb-10 transition-transform group-hover:scale-110">air</span>
                <h3 className="font-headline text-4xl md:text-5xl mb-8">Ansiedad</h3>
                <p className="font-body text-on-surface-variant max-w-2xl font-light text-2xl leading-relaxed">
                  Ese ruido constante que no te deja descansar. Te ayudamos a encontrar el silencio en medio de la tormenta con herramientas de calma profunda.
                </p>
              </div>
              <div className="mt-10 border-b-2 border-primary/30 pb-2 inline-block self-start font-body text-sm uppercase tracking-[0.2em] font-bold hover:border-primary transition-colors">
                Recuperar la calma
              </div>
            </motion.div>

            <motion.div
              layoutId="card-estres"
              onClick={() => setSelectedInfographic({ id: 'estres', src: infoEstres })}
              className="cursor-pointer md:col-span-4 zen-taupe p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-shadow duration-500 group text-white relative"
            >
              <div>
                <span className="material-symbols-outlined text-6xl mb-8 text-white/90 transition-transform group-hover:scale-110">speed</span>
                <h3 className="font-headline text-4xl mb-6">Estrés</h3>
                <p className="font-body text-white/90 font-light text-xl leading-relaxed">
                  Cuando el mundo pesa demasiado. Estrategias prácticas para soltar lastre y reenfocar tu energía vital.
                </p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-white transition-colors">
                Soltar carga
              </div>
            </motion.div>

            <motion.div
              layoutId="card-insomnio"
              onClick={() => setSelectedInfographic({ id: 'insomnio', src: infoInsomnio })}
              className="cursor-pointer md:col-span-4 zen-sand p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-shadow duration-500 group text-white relative"
            >
              <div>
                <span className="material-symbols-outlined text-6xl text-white/90 mb-8 transition-transform group-hover:scale-110">bedtime</span>
                <h3 className="font-headline text-4xl mb-6">Insomnio</h3>
                <p className="font-body text-white/90 font-light text-xl leading-relaxed">
                  Recupera el descanso sagrado. Higiene del sueño y regulación somática para noches de paz real.
                </p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-white transition-colors">
                Dulce descanso
              </div>
            </motion.div>

            <motion.div
              layoutId="card-procrastinacion"
              onClick={() => setSelectedInfographic({ id: 'procrastinacion', src: infoProcrastinacion })}
              className="cursor-pointer md:col-span-8 zen-mist p-12 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-shadow duration-500 group text-white relative"
            >
              <div>
                <span className="material-symbols-outlined text-7xl text-white/90 mb-10 transition-transform group-hover:scale-110">schedule</span>
                <h3 className="font-headline text-4xl md:text-5xl mb-8">Procrastinación</h3>
                <p className="font-body text-white/80 max-w-2xl font-light text-2xl leading-relaxed">
                  Supera la parálisis del análisis. Construimos puentes entre tus intenciones y tus acciones diarias con suavidad.
                </p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-sm uppercase tracking-[0.2em] font-bold hover:border-white transition-colors">
                Activar el cambio
              </div>
            </motion.div>

            <motion.div
              layoutId="card-rumiacion"
              onClick={() => setSelectedInfographic({ id: 'rumiacion', src: infoRumiacion })}
              className="cursor-pointer md:col-span-8 zen-azure-fog p-12 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-shadow duration-500 group text-white relative"
            >
              <div>
                <span className="material-symbols-outlined text-7xl text-white/90 mb-10 transition-transform group-hover:scale-110">all_inclusive</span>
                <h3 className="font-headline text-4xl md:text-5xl mb-8">Rumiación</h3>
                <p className="font-body text-white/80 max-w-2xl font-light text-2xl leading-relaxed">
                  Rompe el ciclo de pensamientos circulares. Técnicas cognitivas avanzadas para salir de la trampa mental y recuperar la presencia.
                </p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-sm uppercase tracking-[0.2em] font-bold hover:border-white transition-colors">
                Liberar la mente
              </div>
            </motion.div>

            <motion.div
              layoutId="card-emociones"
              onClick={() => setSelectedInfographic({ id: 'emociones', src: infoEmociones })}
              className="cursor-pointer md:col-span-4 zen-stone p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-shadow duration-500 group text-white relative"
            >
              <div>
                <span className="material-symbols-outlined text-6xl text-white/90 mb-8 transition-transform group-hover:scale-110">psychology_alt</span>
                <h3 className="font-headline text-4xl mb-6">Gestión Emocional</h3>
                <p className="font-body text-white/90 font-light text-xl leading-relaxed">
                  Aprende a navegar tus emociones sin que ellas te gobiernen. Inteligencia emocional aplicada a tu día a día.
                </p>
              </div>
              <div className="mt-10 border-b-2 border-white/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-white transition-colors">
                Equilibrio interno
              </div>
            </motion.div>

            <motion.div
              layoutId="card-alimentacion"
              onClick={() => setSelectedInfographic({ id: 'alimentacion', src: infoAlimentacion })}
              className="cursor-pointer md:col-span-4 zen-light-gray p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[480px] shadow-xl hover:shadow-2xl transition-shadow duration-500 group text-primary relative"
            >
              <div>
                <span className="material-symbols-outlined text-6xl text-primary/80 mb-8 transition-transform group-hover:scale-110">restaurant</span>
                <h3 className="font-headline text-4xl mb-6">Alimentación Emocional</h3>
                <p className="font-body text-on-surface-variant font-light text-xl leading-relaxed">
                  Construye una relación más consciente con la comida, desde el autocuidado y no desde la culpa o el control.
                </p>
              </div>
              <div className="mt-10 border-b-2 border-primary/30 pb-2 inline-block self-start font-body text-xs uppercase tracking-[0.2em] font-bold hover:border-primary transition-colors">
                Nutrir el vínculo
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PUNTO DE PARTIDA SECTION */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <span className="material-symbols-outlined text-primary/40 text-6xl mb-6 block">explore</span>
              <h2 className="font-headline text-5xl md:text-6xl text-primary mb-8">Descubre qué hay detrás del síntoma</h2>
              <div className="w-20 h-[1px] bg-primary/30 mb-8"></div>
              <p className="font-body text-xl text-on-surface-variant font-light leading-relaxed mb-8">
                Nuestra consulta no se centra únicamente en el síntoma visible, sino en la raíz del malestar. Juntos trazaremos un mapa para comprender qué está sosteniendo hoy tu ansiedad, insomnio, procrastinación, estrés o sensación de vacío.
              </p>
              <button
                onClick={() => handleProtectedAction(() => navigate('/questionnaire'))}
                className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-body text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <span className="flex items-center gap-3">
                  Empezar ahora
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </span>
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
              <div className="relative">
                <img alt="Person meditating in tranquil setting" className="w-full h-[500px] object-cover rounded-[3rem] shadow-2xl" src={fondoZen} />
                <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-3xl">spa</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 bg-background">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-primary to-primary/90 rounded-[3rem] p-16 shadow-2xl"
          >
            <span className="material-symbols-outlined text-primary-foreground/80 text-7xl mb-8 block">auto_awesome</span>
            <h2 className="font-headline text-5xl md:text-6xl text-primary-foreground mb-8 leading-tight">Tu bienestar no tiene por qué esperar</h2>
            <div className="w-24 h-[1px] bg-primary-foreground/30 mx-auto mb-8"></div>
            <p className="font-body text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto font-light leading-relaxed mb-12">
              Da el primer paso hacia una versión más serena, clara y libre de ti mismo. Estamos aquí para acompañarte.
            </p>
            <button
              onClick={() => handleProtectedAction(() => navigate('/questionnaire'))}
              className="group bg-white text-primary px-10 py-4 rounded-full font-body text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <span className="flex items-center gap-3">
                Comenzar ahora
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
            </button>
          </motion.div>
        </div>
      </section>
      
      {loginError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-6 py-3 rounded-full shadow-lg z-50">
          {loginError}
        </div>
      )}

      <AnimatePresence>
        {selectedInfographic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInfographic(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              layoutId={`card-${selectedInfographic.id}`}
              className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedInfographic.src} alt={`Infografía sobre ${selectedInfographic.id}`} className="w-full h-auto object-contain rounded-2xl" />
              <button
                onClick={() => setSelectedInfographic(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/75 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGiftModal(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF7F2] max-w-6xl w-full grid md:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[95vh] overflow-y-auto"
            >
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="font-headline text-3xl md:text-5xl text-[#334b68] mb-5">Un regalo para tu calma</h2>
                <p className="font-body text-[#61758A] text-lg leading-relaxed mb-10">
                  Como agradecimiento por tu honestidad en este proceso, queremos entregarte un kit de herramientas personalizado.
                </p>
                <div className="space-y-8">
                  {[
                    { icon: 'self_improvement', title: 'Meditaciones Guiadas', text: 'Sesiones de audio enfocadas en reducir la ansiedad según tu perfil.' },
                    { icon: 'fitness_center', title: 'Guía de Ejercicios', text: 'Protocolos somáticos para regular tu sistema nervioso.' },
                    { icon: 'verified_user', title: 'Tu Espacio Seguro', text: 'Tus datos son un vínculo sagrado de confianza.' }
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#ddebed] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#334b68]">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-headline text-3xl text-[#334b68]">{item.title}</h3>
                        <p className="font-body text-[#61758A] text-lg leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 md:p-12 border-l border-black/5 flex flex-col justify-center">
                <button
                  onClick={() => setShowGiftModal(false)}
                  className="absolute top-6 right-6 text-[#61758A] hover:text-[#334b68] transition-colors flex items-center gap-2 text-base font-body"
                >
                  <span className="material-symbols-outlined">close</span>
                  Cerrar
                </button>
                <h3 className="font-headline text-3xl md:text-4xl text-[#334b68] mb-2">Finaliza tu sesión de claridad</h3>
                <p className="font-body text-[#61758A] text-lg mb-8">
                  Por favor, facilítanos la vía para enviarte tu material personalizado.
                </p>
                <form className="space-y-6" onSubmit={handleGiftFormSubmit}>
                  <div>
                    <label className="block text-sm font-body font-bold tracking-[0.1em] uppercase text-[#334b68] mb-3">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej. Martina García"
                      value={giftForm.fullName}
                      onChange={(e) => setGiftForm({ ...giftForm, fullName: e.target.value })}
                      className="w-full border border-black/10 bg-[#F6F6F6] rounded-none px-4 py-4 font-body text-lg text-[#334b68] focus:outline-none focus:ring-2 focus:ring-[#334b68] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-body font-bold tracking-[0.1em] uppercase text-[#334b68] mb-3">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="martina@ejemplo.com"
                      value={giftForm.email}
                      onChange={(e) => setGiftForm({ ...giftForm, email: e.target.value })}
                      className="w-full border border-black/10 bg-[#F6F6F6] rounded-none px-4 py-4 font-body text-lg text-[#334b68] focus:outline-none focus:ring-2 focus:ring-[#334b68] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-body font-bold tracking-[0.1em] uppercase text-[#334b68] mb-3">WhatsApp (Opcional)</label>
                    <div className="flex gap-4">
                      <span className="w-16 border border-black/10 bg-[#F6F6F6] rounded-none px-4 py-4 font-body text-lg text-[#334b68] flex items-center justify-center">
                        +34
                      </span>
                      <input
                        type="tel"
                        placeholder="600 000 000"
                        value={giftForm.whatsapp}
                        onChange={(e) => setGiftForm({ ...giftForm, whatsapp: e.target.value })}
                        className="w-full border border-black/10 bg-[#F6F6F6] rounded-none px-4 py-4 font-body text-lg text-[#334b68] focus:outline-none focus:ring-2 focus:ring-[#334b68] transition-all"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#334b68] hover:bg-[#2a3d56] text-white font-headline text-2xl py-5 rounded-2xl transition-colors shadow-lg mt-4">
                    Recibir mis guías personalizadas
                  </button>
                </form>
                <p className="font-body text-xs text-[#61758A] mt-6 text-center">
                  Tus datos están protegidos por cifrado de extremo a extremo.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
