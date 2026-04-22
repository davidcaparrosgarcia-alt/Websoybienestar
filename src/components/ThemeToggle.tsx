import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preferences
    const isDarkMode = localStorage.getItem("theme") === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-white/10 transition-colors text-white"
      aria-label="Toggle Dark Mode"
    >
      <span className="material-symbols-outlined text-xl transition-all duration-300">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
