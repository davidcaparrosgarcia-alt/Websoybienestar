import { Link } from "react-router-dom";

export default function Method() {
  const handleShare = async () => {
    const shareData = {
      title: 'ReprogrÁmate - Nuestro Método',
      text: 'Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un terapeuta de IA, con una conclusión gratuita y máxima privacidad.',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + " ¡Pruébalo aquí: " + shareData.url)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero: Professional Presentation with Large Logo Integration */}
      <section className="relative w-full aspect-[21/9] min-h-[600px] overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img alt="Professional therapy environment" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyQXx5lJRIFmDG5S9_7U3EYycNLlzqz0C1QdV2Tj6Ngbwvkc4Re3Pek8xzpi9hAwOCNj2t-SMAsFP8VnSvK0T2559YeF-zvcjSJ6Ygkojli2uX4wxxBr_Rv8E8NTYguRrbsURCiRbS-wJHDxlrCFe5LqLKBILRCaRUk-OU-gD0wTCr4ZBrzkJi37f8u6n23C7WcWeyUR1nUqyq3gxsGYByoJRMhiAtGAENdQ00usnlu2UBAJyrq2MwS5K1C5wKE4h9GsYs8vzVTKS9"/>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center">
          <div className="space-y-4">
            <h1 className="font-headline text-white text-5xl md:text-7xl font-light tracking-tight">Nuestro Método</h1>
            <p className="text-white/90 text-xl font-light italic font-headline">Un viaje desde el dato hacia la calma.</p>
          </div>
          <div className="mt-12 w-20 h-20 rounded-full border border-white/40 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform bg-white/5">
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </div>
        </div>
      </section>

      {/* Intro Content */}
      <section className="px-8 md:px-24 py-24 flex flex-col lg:flex-row items-center gap-20 max-w-screen-2xl mx-auto">
        <div className="lg:w-1/2 flex justify-center lg:justify-start">
          <div className="relative group">
            <div className="absolute bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all -inset-8"></div>
            <img alt="SoyBienestar.es Logo Detail" className="relative h-80 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQgPvWSRGFdd3hmSBVhcWCcrYCrvpahiIKXp5bbqXldg7q5QDR5v45SPnd_zIYKvtUM7gnhbkfp51gYMBOy9733BjPA9i0ImYQpeSDGyqYia7tNIhnBgx_Nf_5nr1u3yzIz5McFKiumoiZXlUqGgJZzN627u1C9bPPL4USJKNwas-swGGEMoiAa0JQrauQdAlWCdz9wKosxOFtuFcyoIYdJNJ-bKMJOtGmHfVV_kg_vC9sGE_OmUUwy_Gr84RiVzsCCBZ-jcrRPeE2"/>
          </div>
        </div>
        <div className="lg:w-1/2 space-y-8">
          <h2 className="font-headline text-4xl md:text-5xl text-primary italic leading-tight">La arquitectura del bienestar moderno.</h2>
          <p className="text-on-surface-variant leading-relaxed text-xl font-light">
            <span className="font-bold text-primary">SoyBienestar.es ReprogrÁmate</span> no es solo una plataforma; es un refugio diseñado para equilibrar la precisión de la inteligencia artificial con la profundidad irreemplazable de la escucha humana.
          </p>
          <div className="h-px w-24 bg-secondary/30"></div>
        </div>
      </section>

      {/* The Method: IA + Humano Grid */}
      <section className="px-8 md:px-24 py-24 bg-surface-container-low rounded-[3rem] mx-8 mb-24 max-w-screen-2xl xl:mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
          {/* Phase 1 */}
          <div className="bg-surface-container-lowest p-12 rounded-[2.5rem] border border-outline-variant/10 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>analytics</span>
              </div>
              <h3 className="font-headline text-3xl text-primary mb-6">Fase 1: Claridad Algorítmica</h3>
              <p className="text-lg text-on-surface-variant leading-relaxed font-light">
                Nuestra IA analiza patrones de lenguaje y estados emocionales para proporcionar un mapa inicial de su paisaje interior, eliminando el ruido y detectando lo esencial.
              </p>
            </div>
          </div>
          {/* Phase 2 */}
          <div className="bg-primary p-12 rounded-[2.5rem] shadow-2xl flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500 text-white">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-on-primary-container text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>auto_awesome</span>
              </div>
              <h3 className="font-headline text-3xl mb-6 text-white">Fase 2: Conexión Humana</h3>
              <p className="text-lg text-on-primary-container leading-relaxed font-light text-white/90">
                Donde la IA termina, comienza el terapeuta. Un guía experto recibe su "mapa" para profundizar en la empatía, la intuición y el acompañamiento real que solo otra alma puede ofrecer.
              </p>
            </div>
          </div>
        </div>
        <div className="relative py-12 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
          <div className="relative bg-surface-container-low px-8 font-headline italic text-primary text-xl tracking-widest uppercase">El Puente</div>
        </div>
      </section>

      {/* Symbolic Imagery: El Faro */}
      <section className="px-8 md:px-24 mb-32 max-w-screen-2xl mx-auto w-full">
        <div className="relative w-full min-h-[500px] rounded-[3rem] overflow-hidden flex items-center justify-center text-center p-12 shadow-inner">
          <img alt="Serene lighthouse in the mist" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7zzoyzjJf6oT05aMgHXBc3ezEwfzBdpbxANUbwmPP3QbrrzRUUHURAhiJKyIpjk0cgpZB2HprJBAKwCSP9xL7BW5OpBVIydAhKjS83LcFmLTjyGebIz6pm-XqsWRdf-ynaK_wVPPuvGrdLYLIIvmtgH6zPvNw9J9b2rw681zHOeIDTii6mnrQYWzD8cghDiyLHHtlw2e3pc8hCyOc9TG2wpGCBoeq7IKNqN_noIKieNdZSZyac0HqVizdtPrT7Z1JDR_bySa_Udwi"/>
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px]"></div>
          <div className="relative z-10 max-w-2xl space-y-8">
            <span className="material-symbols-outlined text-7xl text-primary" style={{ fontVariationSettings: "'wght' 200" }}>temple_buddhist</span>
            <h3 className="font-headline text-5xl italic text-primary">El Faro en la Niebla</h3>
            <p className="text-xl font-light text-on-surface-variant leading-relaxed">
              No pretendemos curar con fórmulas, sino iluminar el camino para que usted mismo encuentre su centro.
            </p>
            <div className="cenefa-decorative pt-4">
              <div className="cenefa-line"></div>
              <span className="material-symbols-outlined text-primary text-xl">flare</span>
              <div className="cenefa-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Channels & Action */}
      <section className="px-8 md:px-24 mb-32 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center max-w-screen-2xl mx-auto">
        <div className="space-y-6">
          <h4 className="font-sans text-xs uppercase tracking-[0.4em] text-outline mb-12">Canales de Acompañamiento</h4>
          <div className="space-y-4">
            <a 
              className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" 
              href={`https://wa.me/?text=${encodeURIComponent("Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un terapeuta de IA, con una conclusión gratuita y máxima privacidad. ¡Pruébalo aquí: " + window.location.origin)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-secondary text-3xl">chat</span>
                <div>
                  <p className="font-headline text-xl text-primary">Consultas Discretas</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">Vía WhatsApp</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" href="#">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-secondary text-3xl">photo_camera</span>
                <div>
                  <p className="font-headline text-xl text-primary">Inspiración Diaria</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">Instagram</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-xl hover:-translate-x-1 transition-all group" href="#">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-secondary text-3xl">smart_display</span>
                <div>
                  <p className="font-headline text-xl text-primary">Sesiones de Claridad</p>
                  <p className="text-sm text-on-surface-variant font-light uppercase tracking-widest mt-1">YouTube</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
          </div>
        </div>
        <div className="bg-primary p-16 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 opacity-10">
            <img alt="texture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNm2HLjqWbCmeIQ8CL4M7kRUrRaLJ3rJned_WLrEtgJWunyIhBaQYl2KQGy26WkLNaUyXUNifaFltAmoRY4PPxIOUnEithCUKe611JWkfeU-ums-vc0mf2Z6hyPFW_nW8CnGt_nTBzXY3jIefolNjxMNsTGoNq1MsTrbsh6AyPizoejtDbL0byUjeQbfkMT4woWyD5XWh7W89K19IZ-2G_XLTi0SbuP2pbT45MUlGC3UfYm9Vo9qXeNnN95IOabEVVAjhv9NvuFLEm"/>
          </div>
          <div className="relative z-10 space-y-8 w-full max-w-md">
            <img alt="SoyBienestar.es Logo White" className="h-24 w-auto mx-auto brightness-0 invert opacity-40 mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQgPvWSRGFdd3hmSBVhcWCcrYCrvpahiIKXp5bbqXldg7q5QDR5v45SPnd_zIYKvtUM7gnhbkfp51gYMBOy9733BjPA9i0ImYQpeSDGyqYia7tNIhnBgx_Nf_5nr1u3yzIz5McFKiumoiZXlUqGgJZzN627u1C9bPPL4USJKNwas-swGGEMoiAa0JQrauQdAlWCdz9wKosxOFtuFcyoIYdJNJ-bKMJOtGmHfVV_kg_vC9sGE_OmUUwy_Gr84RiVzsCCBZ-jcrRPeE2"/>
            <h2 className="font-headline text-3xl text-white italic font-light">¿Listo para comenzar su propio viaje?</h2>
            <button 
              onClick={handleShare}
              className="w-full py-6 bg-white text-primary rounded-full font-headline italic tracking-wide text-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              Compartir este Santuario
            </button>
            <p className="text-[11px] text-white/60 uppercase tracking-[0.4em] font-medium">Compasión • Tecnología • Silencio</p>
          </div>
        </div>
      </section>
    </div>
  );
}
