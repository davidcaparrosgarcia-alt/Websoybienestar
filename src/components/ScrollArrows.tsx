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
    <>
      {/* Up Arrow */}
      <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${showUp ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <button 
          onClick={scrollToPrev}
          className="w-12 h-12 rounded-full bg-surface/40 backdrop-blur-md border border-outline-variant/20 flex items-center justify-center text-primary hover:bg-surface/80 hover:scale-110 transition-all shadow-sm"
          aria-label="Scroll Up"
        >
          <span className="material-symbols-outlined text-2xl">keyboard_arrow_up</span>
        </button>
      </div>

      {/* Down Arrow */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${showDown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <button 
          onClick={scrollToNext}
          className="w-12 h-12 rounded-full bg-surface/40 backdrop-blur-md border border-outline-variant/20 flex items-center justify-center text-primary hover:bg-surface/80 hover:scale-110 transition-all shadow-sm animate-bounce"
          aria-label="Scroll Down"
        >
          <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
        </button>
      </div>
    </>
  );
}
