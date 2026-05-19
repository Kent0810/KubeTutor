"use client";

import { useEffect, useState } from "react";
import type { LessonOutline } from "@/lib/lessonParser";

export default function LessonToc({
  outline,
  trackColor,
}: {
  outline: LessonOutline;
  trackColor: string;
}) {
  const [activeId, setActiveId] = useState<string>(outline[0]?.id ?? "");

  useEffect(() => {
    if (outline.length === 0) return;
    const els = outline
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [outline]);

  if (outline.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-slate-200">
        {outline.map((h) => {
          const isActive = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block border-l-2 py-1.5 transition ${
                  h.level === 3 ? "pl-6 text-[13px]" : "pl-4"
                } ${
                  isActive
                    ? "border-transparent font-semibold"
                    : "-ml-px border-transparent text-slate-500 hover:text-slate-900"
                }`}
                style={
                  isActive
                    ? { borderColor: trackColor, color: trackColor, marginLeft: "-1px" }
                    : undefined
                }
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
