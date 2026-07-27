"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Primitives";

const STORAGE_KEY = "veritas-theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const initialDark =
        saved === "dark" ||
        (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(initialDark);
      document.documentElement.classList.toggle("dark", initialDark);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem(STORAGE_KEY, nextDark ? "dark" : "light");
  };

  return (
    <Button tone="ghost" className="min-h-9 px-2.5" onClick={toggleTheme} aria-pressed={dark}>
      {dark ? "Light" : "Dark"}
    </Button>
  );
}
