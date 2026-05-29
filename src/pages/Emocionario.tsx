import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Emocionario() {
  const navigate = useNavigate();
  const [accessGranted, setAccessGranted] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  useEffect(() => {
    // Check if access was granted via sessionStorage
    if (sessionStorage.getItem('emocionarioAccess') === 'true') {
      setAccessGranted(true);
    }
  }, []);

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 pt-32">
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
    <div className="min-h-screen bg-surface pt-32 pb-24 font-sans">
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
              onClick={() => window.open('/images/gestion-emocional.pdf', '_blank', 'noopener,noreferrer')}
            >
              <div className="absolute inset-0 bg-surface-container-highest/20 placeholder-fallback"></div>
              {/* Nota: si en el futuro existe 'fondo_metodo.jpg', se puede usar una etiqueta img aquí */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-500"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-end text-white">
                <div className="transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <p className="text-white/90 text-xl md:text-2xl font-light leading-relaxed max-w-sm">
                    Abre el dosier base del método y recorre la escalera de aprendizaje emocional.
                  </p>
                  {/* Enlace al PDF. */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      window.open('/images/gestion-emocional.pdf', '_blank', 'noopener,noreferrer'); 
                    }} 
                    className="mt-8 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Ver documento <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1">
              <div className="absolute inset-0 bg-primary/5"></div>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                <h4 className="font-headline text-2xl mb-2">Módulo I</h4>
                <div className="transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <p className="text-white/90 text-xl md:text-2xl font-light">
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
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-2">
              <div className="absolute inset-0 bg-primary/5"></div>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white lg:items-start text-left">
                <h4 className="font-headline text-2xl mb-2">Módulo II</h4>
                <div className="transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <p className="text-white/90 text-xl md:text-2xl font-light">
                    Entrena la pausa corporal antes de que la emoción tome el mando.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1">
              <div className="absolute inset-0 bg-primary/5"></div>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                <h4 className="font-headline text-2xl mb-2">Módulo III</h4>
                <div className="transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <p className="text-white/90 text-xl md:text-2xl font-light">
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
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-2">
              <div className="absolute inset-0 bg-primary/5"></div>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white lg:items-start text-left">
                <h4 className="font-headline text-2xl mb-2">Módulo IV</h4>
                <div className="transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <p className="text-white/90 text-xl md:text-2xl font-light">
                    Reconoce tus recursos internos y conviértelos en herramientas activas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <div className="relative group overflow-hidden rounded-[2rem] bg-surface-container-highest border border-outline-variant/10 shadow-lg min-h-[300px] w-full transition-all hover:shadow-xl order-2 lg:order-1">
              <div className="absolute inset-0 bg-primary/5"></div>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                <h4 className="font-headline text-2xl mb-2">Módulo V</h4>
                <div className="transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <p className="text-white/90 text-xl md:text-2xl font-light">
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
            <div className="bg-surface-container hover:bg-surface-container-high transition-colors p-8 rounded-[2rem] border border-outline-variant/10 text-center flex flex-col">
              <span className="material-symbols-outlined text-4xl text-primary mb-4 mx-auto">healing</span>
              <h4 className="font-headline text-2xl text-primary mb-4">Crisis, Pérdida y Salud</h4>
              <p className="text-on-surface-variant font-light text-base leading-relaxed flex-grow">
                Protocolos de estabilización emocional y narrativa de trauma para momentos de pérdida, enfermedad, miedo o ruptura del equilibrio personal.
              </p>
            </div>
            {/* Especialidad 2 */}
            <div className="bg-surface-container hover:bg-surface-container-high transition-colors p-8 rounded-[2rem] border border-outline-variant/10 text-center flex flex-col">
              <span className="material-symbols-outlined text-4xl text-primary mb-4 mx-auto">favorite</span>
              <h4 className="font-headline text-2xl text-primary mb-4">Amor y Desamor</h4>
              <p className="text-on-surface-variant font-light text-base leading-relaxed flex-grow">
                Trabajo con el Adulto Saludable para comprender heridas afectivas, dependencia emocional, ruptura, apego y reconstrucción interna.
              </p>
            </div>
            {/* Especialidad 3 */}
            <div className="bg-surface-container hover:bg-surface-container-high transition-colors p-8 rounded-[2rem] border border-outline-variant/10 text-center flex flex-col">
              <span className="material-symbols-outlined text-4xl text-primary mb-4 mx-auto">work</span>
              <h4 className="font-headline text-2xl text-primary mb-4">Trabajo y Finanzas</h4>
              <p className="text-on-surface-variant font-light text-base leading-relaxed flex-grow">
                Ejercicios para alinear decisiones, límites y acciones con valores personales cuando el estrés laboral, la incertidumbre económica o la presión externa desordenan el sistema emocional.
              </p>
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
                  ].map((modulo, idx) => (
                    <li key={idx}>
                      <button 
                        onClick={() => setSelectedModule(modulo)}
                        className={`w-full text-left px-6 py-4 rounded-2xl border transition-all ${selectedModule === modulo ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/30'} font-light text-lg`}
                      >
                        {modulo}
                      </button>
                    </li>
                  ))}
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
                            className={`w-full text-left px-6 py-4 rounded-2xl border transition-all ${selectedModule === modulo ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/30'} font-light text-lg`}
                          >
                            {modulo}
                          </button>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>

              {selectedModule && (
                <div className="p-8 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 shadow-sm animate-in fade-in slide-in-from-top-4">
                  <p className="text-on-surface-variant font-light text-center italic">
                    Aquí se desplegarán preguntas, explicaciones y respuestas del módulo seleccionado.
                  </p>
                </div>
              )}
            </div>

            {/* Columna Derecha: Mockup Emocionario 9:16 */}
            <div className="flex justify-center items-center">
              {/* Contenedor del mockup estilo teléfono */}
              <div className="w-full max-w-[360px] aspect-[9/16] bg-[#f8f9fa] dark:bg-[#121212] rounded-[3rem] border-[12px] border-surface-container shadow-2xl overflow-hidden relative flex flex-col mx-auto">
                
                {/* Status bar (decorativa) */}
                <div className="h-7 w-full flex justify-between items-center px-6 mt-1 text-[10px] text-on-surface-variant/50 font-bold">
                  <span>9:41</span>
                  <div className="flex gap-1 items-center">
                    <span className="material-symbols-outlined text-[12px]">signal_cellular_4_bar</span>
                    <span className="material-symbols-outlined text-[12px]">wifi</span>
                    <span className="material-symbols-outlined text-[12px]">battery_full</span>
                  </div>
                </div>

                {/* Cabecera del juego */}
                <div className="px-6 py-4 pb-6 bg-primary text-white shadow-md relative z-10 text-center">
                  <h3 className="font-bold uppercase tracking-widest text-[10px] opacity-80 mb-1">Progreso</h3>
                  <h2 className="font-headline text-lg leading-snug">
                    {selectedModule || "Elige un Módulo"}
                  </h2>
                </div>

                {/* Zona de scroll del recorrido */}
                <div className="flex-1 overflow-y-auto relative p-6 flex flex-col items-center justify-start bg-surface-container-lowest" style={{ scrollbarWidth: 'none' }}>
                  
                  <h4 className="text-primary font-bold tracking-widest uppercase text-xs mb-8">Isla 1</h4>
                  
                  {/* Nodo Camino completado */}
                  <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg relative z-10 ring-4 ring-secondary/30 mb-8">
                    <span className="material-symbols-outlined text-2xl font-bold">check</span>
                  </div>
                  {/* Línea conexión */}
                  <div className="w-2 h-10 bg-secondary/50 -mt-10 mb-2 relative z-0 left-[-20px] rounded-full"></div>

                  <div className="text-center mb-2">
                    <span className="bg-white dark:bg-black/50 text-[10px] font-bold px-3 py-1 rounded-full text-on-surface shadow-md">Lección 1</span>
                  </div>
                  {/* Nodo Camino actual */}
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-xl relative z-10 ring-4 ring-primary/20 mb-8 hover:scale-105 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-4xl pl-1">play_arrow</span>
                  </div>

                  {/* Línea conexión bloqueada */}
                  <div className="w-2 h-14 bg-outline-variant/20 -mt-10 mb-2 relative z-0 right-[-15px] rounded-full"></div>

                  {/* Nodo Camino bloqueado */}
                  <div className="w-14 h-14 rounded-full bg-surface-container-highest text-on-surface-variant/50 flex items-center justify-center shadow-inner relative z-10 mb-12">
                     <span className="material-symbols-outlined text-xl">lock</span>
                  </div>

                  <h4 className="text-on-surface-variant font-bold tracking-widest uppercase text-[10px] mb-8">Próximamente</h4>

                  {/* Mascota emocional placeholder */}
                  <div className="mt-8 pt-8 w-full border-t border-outline-variant/10">
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-surface-container to-surface-container-lowest border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-4 text-center">
                       <span className="material-symbols-outlined text-4xl text-primary/30 mb-2">pets</span>
                       <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider leading-relaxed">Mascota emocional<br/>pendiente</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
