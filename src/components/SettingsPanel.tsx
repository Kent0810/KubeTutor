"use client";

import { useEffect, useRef } from "react";
import { useSettings, type Theme, type FontSize } from "./SettingsContext";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 transition hover:border-blue-300 dark:hover:border-blue-500"
    >
      <div className="text-left">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

function FontSizePicker() {
  const { fontSize, setFontSize } = useSettings();
  const options: { value: FontSize; label: string; sample: string }[] = [
    { value: "sm", label: "Small", sample: "Aa" },
    { value: "md", label: "Medium", sample: "Aa" },
    { value: "lg", label: "Large",  sample: "Aa" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setFontSize(opt.value)}
          className={`flex flex-col items-center gap-1 rounded-2xl border py-3 text-center transition-all duration-150 ${
            fontSize === opt.value
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm ring-1 ring-blue-500/30"
              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-500"
          }`}
        >
          <span
            className={`font-bold text-slate-800 dark:text-slate-200 transition-all ${
              opt.value === "sm" ? "text-sm" : opt.value === "md" ? "text-base" : "text-xl"
            }`}
          >
            {opt.sample}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useSettings();
  return (
    <div className="grid grid-cols-2 gap-2">
      {(
        [
          {
            value: "light" as Theme,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ),
            label: "Light",
          },
          {
            value: "dark" as Theme,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ),
            label: "Dark",
          },
        ] as const
      ).map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-150 ${
            theme === opt.value
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/30"
              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500"
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, reduceMotion, setReduceMotion } = useSettings();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSettingsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, setSettingsOpen]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = settingsOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [settingsOpen]);

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="animate-slide-in-panel relative flex h-full w-full max-w-sm flex-col bg-white dark:bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Preferences</h2>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="modal-scroll flex-1 overflow-y-auto px-5 py-6 space-y-7">
          <Section title="Appearance">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Theme</p>
                <ThemePicker />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Font size</p>
                <FontSizePicker />
              </div>
            </div>
          </Section>

          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          <Section title="Accessibility">
            <Toggle
              checked={reduceMotion}
              onChange={setReduceMotion}
              label="Reduce motion"
              description="Disables animations and transitions throughout the app."
            />
          </Section>

          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          <Section title="About">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">🐳 KubeTutor</p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Structured, interactive learning paths for Docker and Kubernetes.
                Preferences are saved locally in your browser.
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
