"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const currentTheme = theme ?? "system";

  const cycleTheme = () => {
    if (currentTheme === "light") setTheme("dark");
    else if (currentTheme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={cycleTheme}
        title={mounted ? `Theme: ${currentTheme}` : "Theme"}
        disabled={!mounted}
        className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:shadow-xl"
      >
        {!mounted && (
          <Monitor className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
        )}
        {mounted && currentTheme === "light" && (
          <Sun className="h-5 w-5 text-amber-500 transition-transform group-hover:rotate-12" />
        )}
        {mounted && currentTheme === "dark" && (
          <Moon className="h-5 w-5 text-blue-400 transition-transform group-hover:-rotate-12" />
        )}
        {mounted && currentTheme === "system" && (
          <Monitor className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
        )}
      </button>
    </div>
  );
}
