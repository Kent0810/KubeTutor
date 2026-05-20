"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type FontSize = "sm" | "md" | "lg";

interface SettingsState {
  theme: Theme;
  fontSize: FontSize;
  reduceMotion: boolean;
  settingsOpen: boolean;
  setTheme: (v: Theme) => void;
  setFontSize: (v: FontSize) => void;
  setReduceMotion: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`kubetutor:${key}`);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(`kubetutor:${key}`, JSON.stringify(value));
  } catch {}
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeRaw] = useState<Theme>("light");
  const [fontSize, setFontSizeRaw] = useState<FontSize>("md");
  const [reduceMotion, setReduceMotionRaw] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    setThemeRaw(load<Theme>("theme", "light"));
    setFontSizeRaw(load<FontSize>("fontSize", "md"));
    setReduceMotionRaw(load<boolean>("reduceMotion", false));
    setMounted(true);
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    save("theme", theme);
  }, [theme, mounted]);

  // Apply font size data attribute
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-font-size", fontSize);
    save("fontSize", fontSize);
  }, [fontSize, mounted]);

  // Apply reduce-motion data attribute
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (reduceMotion) html.setAttribute("data-reduce-motion", "true");
    else html.removeAttribute("data-reduce-motion");
    save("reduceMotion", reduceMotion);
  }, [reduceMotion, mounted]);

  const setTheme = (v: Theme) => setThemeRaw(v);
  const setFontSize = (v: FontSize) => setFontSizeRaw(v);
  const setReduceMotion = (v: boolean) => setReduceMotionRaw(v);

  return (
    <SettingsContext.Provider
      value={{ theme, fontSize, reduceMotion, settingsOpen, setTheme, setFontSize, setReduceMotion, setSettingsOpen }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
