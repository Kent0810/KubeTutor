"use client";

import { SettingsProvider } from "./SettingsContext";
import SettingsPanel from "./SettingsPanel";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      {children}
      <SettingsPanel />
    </SettingsProvider>
  );
}
