export type TrackTheme = {
  heroClass: string;
  badgeClass: string;
  mutedBadgeClass: string;
  buttonClass: string;
  icon: string;
  label: string;
  color: string;
};

export const TRACK_THEME = {
  "docker-foundations": {
    heroClass: "bg-gradient-to-r from-cyan-500 to-blue-600",
    color: "#2563EB",
    badgeClass: "bg-blue-100 text-blue-700",
    mutedBadgeClass: "bg-blue-50 text-blue-700",
    buttonClass: "bg-blue-600 text-white hover:bg-blue-700",
    icon: "🐳",
    label: "Docker",
  },
  "kubernetes-essentials": {
    heroClass: "bg-gradient-to-r from-violet-500 to-purple-700",
    color: "#7C3AED",
    badgeClass: "bg-violet-100 text-violet-700",
    mutedBadgeClass: "bg-violet-50 text-violet-700",
    buttonClass: "bg-violet-600 text-white hover:bg-violet-700",
    icon: "☸️",
    label: "Kubernetes",
  },
} as const satisfies Record<string, TrackTheme>;

export const DEFAULT_THEME: TrackTheme = {
  heroClass: "bg-gradient-to-r from-slate-600 to-slate-800",
  color: "#475569",
  badgeClass: "bg-slate-100 text-slate-700",
  mutedBadgeClass: "bg-slate-100 text-slate-700",
  buttonClass: "bg-slate-900 text-white hover:bg-slate-800",
  icon: "📚",
  label: "Course",
};

export function getTrackTheme(slug: string): TrackTheme {
  return TRACK_THEME[slug as keyof typeof TRACK_THEME] ?? DEFAULT_THEME;
}

export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export function totalLessons(
  modules: ReadonlyArray<{ lessons?: ReadonlyArray<unknown>; _count?: { lessons?: number } }>,
): number {
  return modules.reduce((sum, module) => sum + (module.lessons?.length ?? module._count?.lessons ?? 0), 0);
}
