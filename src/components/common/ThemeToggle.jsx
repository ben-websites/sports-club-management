import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Sun / Moon switch used on the public website, the auth screens and every panel.
 * variant:
 *  - "panel"   → dark zinc chip used inside the dashboard shell
 *  - "overlay" → translucent chip for transparent headers sitting on imagery
 *  - "surface" → light chip for white / scrolled headers
 */
function ThemeToggle({ variant = "panel", className = "" }) {
  const { isLight, toggleTheme } = useTheme();

  const variants = {
    panel:
      "h-9 w-9 border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-orange-500 hover:text-white",
    overlay:
      "h-10 w-10 border border-white/25 bg-black/35 text-white backdrop-blur-md hover:border-orange-400 hover:text-orange-300",
    surface:
      "h-10 w-10 border border-[#dcd2df] bg-white text-[#18181b] hover:border-orange-500 hover:text-orange-600",
  };

  const label = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      aria-pressed={isLight}
      className={`inline-flex shrink-0 items-center justify-center rounded-none transition ${variants[variant] || variants.panel} ${className}`}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

export default ThemeToggle;
