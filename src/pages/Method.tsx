import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Method() {
  const navigate = useNavigate();
  const [selectedInfographic, setSelectedInfographic] = useState<{ id: string, src: string } | null>(null);

  return (
    <div className="flex-1 w-full">
      {/* Hero Section: The Bridge Metaphor */}
      <section className="relative min-h-[60vh] flex items-center pt-8 pb-16 px-12 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 z-10">
            <span className="font-label text-secondary font-semibold tracking-widest uppercase text-xs mb-6 block">Nuestra Esencia</span>
            <h1 className="text-6xl md:text-7xl font-headline text-primary leading-[1.1] mb-8">Cruzando el puente hacia la <span className="italic">claridad</span>.</h1>
            <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed mb-10">
              Entendemos la ansiedad no como un muro, sino como una niebla. Nuestro método utiliza la metáfora del puente: una estructura firme que te permite caminar desde la confusión hacia un horizonte despejado.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/method-details')} className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label font-medium flex items-center gap-3 hover:shadow-2xl transition-all shadow-lg shadow-primary/10">
                Explorar Metodología
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            {/* Video Presentation Placeholder */}
            <div className="relative group aspect-video rounded-2xl overflow-hidden bg-surface-container-highest shadow-2xl">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" alt="cinematic shot of a modern architectural wooden bridge disappearing into a soft morning mist at dawn with golden sunlight flares" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUFJR7osyxltbHn-vme3ZQ_zZ04pLZcrC7EzB6qZzBrLG0pIGgOrMmBWeVmixUbAq-5Ow65REc1i-TtiXPPTPjCickPpT7SF2BUkWCmazttPfMjU_CkCsrmk2B9Kn8yQizkIM8vLZo6czJR_OpsQdxYTkJy2hFRNSXbiRyeZLFMLtb2DBk4ySloPCYFaDARaA87RaVSLCvrstFYERL-tBiYJBqZ0Lc_q2p6BhJ2OcMnSfpVW52BkcOhnibSLT-f3PxkUmm192V5A76"/>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-24 h-24 rounded-full bg-surface/70 backdrop-blur-md border border-white/30 flex items-center justify-center text-primary transition-all group-hover:scale-110">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-surface/70 backdrop-blur-md rounded-xl border border-white/20">
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-tighter">Video Presentación: Nuestro Proceso</p>
              </div>
            </div>
            {/* Decorative Light Beam */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary-container/30 blur-[100px] rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* Treatments Bento Grid */}
      <section className="py-24 px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-headline text-primary mb-4 italic">Áreas de Especialización</h2>
              <p className="text-lg text-on-surface-variant">Un enfoque integral para navegar los diferentes estados de la niebla emocional.</p>
            </div>
            <a className="font-label text-secondary font-bold flex items-center gap-2 border-b-2 border-secondary/20 pb-1 hover:border-secondary transition-all" href="#">Ver todos los tratamientos</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-surface dark:bg-[#d1e7e4] p-10 rounded-2xl flex flex-col justify-between h-[400px] hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="hidden dark:block pointer-events-none absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay"></div>
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-4xl mb-6 inline-block group-hover:scale-[1.3] transition-transform duration-500 origin-left">waves</span>
                  <h3 className="text-2xl font-headline text-primary dark:text-[#2c3e50] mb-4 transition-colors">Gestión de Ansiedad</h3>
                  <p className="text-on-surface-variant dark:text-[#43474c] leading-relaxed transition-colors">Técnicas de anclaje para calmar las tormentas internas y recuperar el control del presente.</p>
                </div>
                <div className="w-fit">
                  <button onClick={() => navigate('/anxiety')} className="font-label text-sm font-semibold flex items-center gap-2 text-on-surface-variant dark:text-[#2c3e50] group-hover:text-primary dark:group-hover:text-[#1a252f] transition-all duration-500 group-hover:scale-[1.8] origin-left text-left">
                    LEER MÁS <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Card 2 (Highlight/Dark) */}
            <div className="group bg-primary-container p-10 rounded-2xl flex flex-col justify-between h-[400px] relative overflow-hidden hover:-translate-y-3 hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <span className="material-symbols-outlined text-8xl text-secondary-fixed group-hover:scale-110 transition-transform duration-500">light_mode</span>
              </div>
              <div className="z-10">
                <span className="material-symbols-outlined text-secondary-container text-4xl mb-6 inline-block group-hover:scale-[1.3] transition-transform duration-500 origin-left">psychology</span>
                <h3 className="text-2xl font-headline text-white mb-4">Terapia Cognitiva</h3>
                <p className="text-on-primary-container leading-relaxed">Reestructurando los patrones de pensamiento que alimentan la incertidumbre.</p>
              </div>
              <div className="w-fit z-10">
                <button onClick={() => setSelectedInfographic({ id: 'terapia_cognitiva', src: '/images/info-terapia-cognitiva.jpg' })} className="font-label text-sm font-semibold flex items-center gap-2 text-secondary-fixed hover:opacity-80 transition-all duration-500 group-hover:scale-[1.8] origin-left">
                  DETALLES DEL MÉTODO <span className="material-symbols-outlined text-lg">open_in_new</span>
                </button>
              </div>
            </div>
            {/* Card 3 */}
            <div className="group bg-surface dark:bg-[#d1e7e4] p-10 rounded-2xl flex flex-col justify-between h-[400px] hover:-translate-y-3 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="hidden dark:block pointer-events-none absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay"></div>
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-4xl mb-6 inline-block group-hover:scale-[1.3] transition-transform duration-500 origin-left">self_improvement</span>
                  <h3 className="text-2xl font-headline text-primary dark:text-[#2c3e50] mb-4 transition-colors">Acompañamiento Zen</h3>
                  <p className="text-on-surface-variant dark:text-[#43474c] leading-relaxed transition-colors">Espacios de silencio y reflexión guiada para conectar con tu centro interior.</p>
                </div>
                <div className="w-fit">
                  <button onClick={() => navigate('/zen')} className="font-label text-sm font-semibold flex items-center gap-2 text-on-surface-variant dark:text-[#2c3e50] group-hover:text-primary dark:group-hover:text-[#1a252f] transition-all duration-500 group-hover:scale-[1.8] origin-left text-left">
                    SABER MÁS <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Experience Section */}
      <section className="py-24 px-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-secondary-container/40 via-surface to-surface"></div>
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-[#1e293b] backdrop-blur-md border border-white/10 p-12 md:p-24 rounded-[2rem] text-center max-w-5xl mx-auto shadow-sm">
            <div className="text-3xl md:text-4xl font-headline font-light tracking-widest text-primary-fixed-dim/70 mb-12 uppercase">ReprogrÁmate</div>
            <h2 className="text-4xl md:text-5xl font-headline text-white mb-8 italic">¿Conoces a alguien perdido en la niebla?</h2>
            <p className="text-xl text-[#c4d7ec] mb-12 max-w-3xl mx-auto leading-relaxed font-body">
              Aunque no seas nuestro paciente hoy, tu recomendación puede ser el faro que alguien más necesita encontrar. Ayúdanos a llevar claridad y calma a quienes más lo necesitan. Comparte esta arquitectura del bienestar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'ReprogrÁmate',
                      text: 'Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un terapeuta de IA, con una conclusión gratuita y máxima privacidad.',
                      url: window.location.origin
                    }).catch(console.error);
                  } else {
                    alert('La función de compartir no está soportada en este navegador, pero puedes copiar este enlace: ' + window.location.origin);
                  }
                }}
                className="flex items-center gap-3 px-10 py-4 rounded-full bg-[#2c3e50] hover:bg-[#42617c] transition-all text-white font-label font-medium shadow-lg shadow-black/20"
              >
                <span className="material-symbols-outlined text-xl">share</span>
                Compartir Experiencia
              </button>
              <div className="flex items-center gap-6">
                <a 
                  className="flex items-center gap-2 text-[#b5c8df] hover:text-white transition-colors font-label text-sm uppercase tracking-widest" 
                  href={`https://wa.me/?text=${encodeURIComponent("Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un terapeuta de IA, con una conclusión gratuita y máxima privacidad. ¡Pruébalo aquí: " + window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.197 1.441 4.934 1.442 5.333 0 9.673-4.34 9.676-9.674.002-5.332-4.338-9.674-9.671-9.675-2.585-.001-5.015 1.007-6.843 2.837-1.828 1.83-2.834 4.26-2.835 6.844-.001 1.705.469 3.376 1.36 4.827l-1.055 3.854 3.954-1.035zm12.188-4.63c-.334-.167-1.974-.974-2.279-1.084-.303-.11-.524-.167-.745.167-.221.334-.856 1.084-1.05 1.308-.194.223-.389.25-.723.084-.333-.167-1.408-.52-2.681-1.656-.991-.884-1.659-1.976-1.853-2.31-.194-.334-.021-.514.146-.68.15-.15.334-.389.501-.584.166-.194.222-.333.333-.556.111-.223.056-.417-.028-.584-.084-.167-.745-1.794-1.021-2.459-.269-.646-.543-.558-.745-.568-.192-.01-.413-.012-.634-.012-.221 0-.579.083-.883.417-.304.334-1.162 1.14-1.162 2.783 0 1.643 1.198 3.226 1.365 3.449.167.222 2.358 3.599 5.712 5.048.798.344 1.42.55 1.905.706.802.255 1.533.219 2.11.134.643-.095 1.974-.807 2.251-1.587.277-.779.277-1.447.194-1.586-.083-.14-.304-.223-.637-.39z"></path></svg>
                  WhatsApp
                </a>
                <a 
                  className="flex items-center gap-2 text-[#b5c8df] hover:text-white transition-colors font-label text-sm uppercase tracking-widest" 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Te recomiendo probar esta web. Ofrece una sesión gratuita con un terapeuta de IA y máxima privacidad.")}&url=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"></path></svg>
                  Twitter / X
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact and Network */}
      <section className="py-24 px-12" id="contacto">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-headline text-primary mb-8 italic">Conecta con Nosotros</h2>
            <p className="text-on-surface-variant mb-10 leading-relaxed">
              Explora nuestros recursos gratuitos en redes sociales o contáctanos de forma privada para una primera aproximación sin compromiso.
            </p>
            <div className="space-y-6">
              <a className="flex items-center gap-4 group" href="#">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">video_library</span>
                </div>
                <div>
                  <h4 className="font-label font-bold text-primary">YouTube</h4>
                  <p className="text-xs text-on-surface-variant">Guías de meditación y charlas.</p>
                </div>
              </a>
              <a className="flex items-center gap-4 group" href="#">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
                <div>
                  <h4 className="font-label font-bold text-primary">Instagram</h4>
                  <p className="text-xs text-on-surface-variant">Dosis diarias de calma visual.</p>
                </div>
              </a>
              {/* Discrete WhatsApp Button */}
              <div className="pt-6">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent("Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un terapeuta de IA, con una conclusión gratuita y máxima privacidad. ¡Pruébalo aquí: " + window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white px-8 py-3 rounded-full font-label font-semibold inline-flex items-center gap-3 shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.197 1.441 4.934 1.442 5.333 0 9.673-4.34 9.676-9.674.002-5.332-4.338-9.674-9.671-9.675-2.585-.001-5.015 1.007-6.843 2.837-1.828 1.83-2.834 4.26-2.835 6.844-.001 1.705.469 3.376 1.36 4.827l-1.055 3.854 3.954-1.035zm12.188-4.63c-.334-.167-1.974-.974-2.279-1.084-.303-.11-.524-.167-.745.167-.221.334-.856 1.084-1.05 1.308-.194.223-.389.25-.723.084-.333-.167-1.408-.52-2.681-1.656-.991-.884-1.659-1.976-1.853-2.31-.194-.334-.021-.514.146-.68.15-.15.334-.389.501-.584.166-.194.222-.333.333-.556.111-.223.056-.417-.028-.584-.084-.167-.745-1.794-1.021-2.459-.269-.646-.543-.558-.745-.568-.192-.01-.413-.012-.634-.012-.221 0-.579.083-.883.417-.304.334-1.162 1.14-1.162 2.783 0 1.643 1.198 3.226 1.365 3.449.167.222 2.358 3.599 5.712 5.048.798.344 1.42.55 1.905.706.802.255 1.533.219 2.11.134.643-.095 1.974-.807 2.251-1.587.277-.779.277-1.447.194-1.586-.083-.14-.304-.223-.637-.39z"></path></svg>
                  Consulta por WhatsApp
                </a>
              </div>
            </div>
          </div>
          <div className="bg-surface-container rounded-3xl p-12">
            <h3 className="text-xl font-headline text-primary mb-8 italic">Canales Oficiales</h3>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">alternate_email</span>
                <div>
                  <p className="text-xs font-label uppercase text-on-surface-variant tracking-wider mb-1">Email</p>
                  <p className="text-lg font-label font-medium">contacto@SoyBienestar.es</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">phone_iphone</span>
                <div>
                  <p className="text-xs font-label uppercase text-on-surface-variant tracking-wider mb-1">Teléfono</p>
                  <p className="text-lg font-label font-medium">+34</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">public</span>
                <div>
                  <p className="text-xs font-label uppercase text-on-surface-variant tracking-wider mb-1">Web Oficial</p>
                  <p className="text-lg font-label font-medium">www.SoyBienestar.es</p>
                </div>
              </div>
              <div className="pt-4 mt-8 border-t border-outline-variant/30">
                <div className="flex items-center gap-2 text-on-surface-variant italic">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="text-sm">Respuesta habitual en menos de 24h</span>
                </div>
              </div>
            </div>
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
                layoutId={'card-' + selectedInfographic.id}
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
                    alt="Infografía Detalle" 
                    className="w-full h-auto rounded-xl shadow-sm"
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
