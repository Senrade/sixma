"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";

const STORAGE_KEY = "veritas-theme";

export function ThemeToggle() {
  const { t } = useI18n();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let initialDark = false;

      try {
        initialDark = window.localStorage.getItem(STORAGE_KEY) === "dark";
      } catch {
        // Light mode remains the default when storage is unavailable.
      }

      setDark(initialDark);
      document.documentElement.classList.toggle("dark", initialDark);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextDark ? "dark" : "light");
    } catch {
      // The current page can still switch themes without persistent storage.
    }
  };

  return (
    <Button tone="ghost" className="min-h-9 px-2.5" onClick={toggleTheme} aria-pressed={dark}>
      {dark ? t("theme.light") : t("theme.dark")}
    </Button>
  );
}
