import { Moon, Sun } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className="p-2 rounded-full text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer flex items-center justify-center shrink-0"
    >
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
