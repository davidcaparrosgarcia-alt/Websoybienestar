import { useEffect, useState } from "react";

export default function ScrollArrows() {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show UP arrow if we are scrolled down a bit
      setShowUp(scrollY > 100);

      // Show DOWN arrow if we are not at the bottom
      setShowDown(scrollY + windowHeight < documentHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSections = () => {
    return Array.from(document.querySelectorAll("section"));
  };

  const scrollToNext = () => {
    const sections = getSections();
    const scrollY = window.scrollY;
    
    for (const section of sections) {
      if (section.offsetTop > scrollY + 10) {
        window.scrollTo({ top: section.offsetTop, behavior: "smooth" });
        break;
      }
    }
  };

  const scrollToPrev = () => {
    const sections = getSections();
    const scrollY = window.scrollY;
    
    // Iterate backwards
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.offsetTop < scrollY - 10) {
        window.scrollTo({ top: section.offsetTop, behavior: "smooth" });
        break;
      }
    }
  };

  return (
    <div className="fixed right-6 bottom-12 flex flex-col gap-3 z-40">
      {/* Up Arrow */}
      <div 
        className={`transition-all duration-500 origin-bottom ${showUp ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}
      >
        <button 
          onClick={scrollToPrev}
          className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur-md border border-outline-variant/30 flex items-center justify-center text-primary/80 hover:text-primary hover:bg-surface hover:scale-105 hover:shadow-lg transition-all shadow-md group"
          aria-label="Scroll Up"
        >
          <span className="material-symbols-outlined text-2xl group-hover:-translate-y-1 transition-transform">arrow_upward</span>
        </button>
      </div>

      {/* Down Arrow */}
      <div 
        className={`transition-all duration-500 origin-top ${showDown ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'}`}
      >
        <button 
          onClick={scrollToNext}
          className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur-md border border-outline-variant/30 flex items-center justify-center text-primary/80 hover:text-primary hover:bg-surface hover:scale-105 hover:shadow-lg transition-all shadow-md group"
          aria-label="Scroll Down"
        >
          <span className="material-symbols-outlined text-2xl group-hover:translate-y-1 transition-transform">arrow_downward</span>
        </button>
      </div>
    </div>
  );
}
