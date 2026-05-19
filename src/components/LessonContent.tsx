"use client";

import { useMemo, useState, type ReactNode } from "react";
import { parseLessonContent, type LessonBlock, type CalloutKind } from "@/lib/lessonParser";

interface LessonContentProps {
  content: string;
  trackColor: string;
}

const CALLOUT_STYLES: Record<
  CalloutKind,
  { wrapper: string; iconBg: string; icon: string; label: string; title: string }
> = {
  note: {
    wrapper: "border-sky-200 bg-sky-50",
    iconBg: "bg-sky-500",
    icon: "ℹ",
    label: "Note",
    title: "text-sky-900",
  },
  tip: {
    wrapper: "border-emerald-200 bg-emerald-50",
    iconBg: "bg-emerald-500",
    icon: "💡",
    label: "Tip",
    title: "text-emerald-900",
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50",
    iconBg: "bg-amber-500",
    icon: "⚠",
    label: "Warning",
    title: "text-amber-900",
  },
  important: {
    wrapper: "border-rose-200 bg-rose-50",
    iconBg: "bg-rose-500",
    icon: "❗",
    label: "Important",
    title: "text-rose-900",
  },
  try: {
    wrapper: "border-violet-200 bg-violet-50",
    iconBg: "bg-violet-500",
    icon: "🧪",
    label: "Try it",
    title: "text-violet-900",
  },
  example: {
    wrapper: "border-slate-200 bg-slate-50",
    iconBg: "bg-slate-700",
    icon: "▶",
    label: "Example",
    title: "text-slate-900",
  },
};

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Tokenize for `code`, **bold**, *italic*, naked URLs
  const tokens: ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(https?:\/\/[^\s)]+)/g;
  let lastIndex = 0;
  let idx = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const [whole, code, bold, italic, url] = match;
    const key = `${keyPrefix}-${idx++}`;
    if (code) {
      tokens.push(
        <code
          key={key}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800"
        >
          {code.slice(1, -1)}
        </code>,
      );
    } else if (bold) {
      tokens.push(
        <strong key={key} className="font-semibold text-slate-900">
          {bold.slice(2, -2)}
        </strong>,
      );
    } else if (italic) {
      tokens.push(
        <em key={key} className="italic">
          {italic.slice(1, -1)}
        </em>,
      );
    } else if (url) {
      tokens.push(
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-600 underline-offset-2 hover:underline"
        >
          {url}
        </a>,
      );
    } else {
      tokens.push(whole);
    }
    lastIndex = match.index + whole.length;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

function CodeBlock({
  label,
  lines,
  lang,
  trackColor,
}: {
  label?: string;
  lines: string[];
  lang?: string;
  trackColor: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = lines.join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const langLabel = lang ? lang.toUpperCase() : "CODE";

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-md">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </span>
          {label ? (
            <span
              className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white"
              style={{ borderColor: trackColor }}
            >
              {label}
            </span>
          ) : null}
          <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {langLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-white/15"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-6 text-slate-100">
        <code>{text}</code>
      </pre>
    </div>
  );
}

function BulletList({
  items,
  trackColor,
  ordered,
}: {
  items: string[];
  trackColor: string;
  ordered: boolean;
}) {
  if (ordered) {
    return (
      <ol className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-700">
            <span
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: trackColor }}
            >
              {i + 1}
            </span>
            <span>{renderInline(item.replace(/^\d+\.\s+/, ""), `oli-${i}`)}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-700">
          <span
            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: trackColor }}
          />
          <span>{renderInline(item.replace(/^[-•]\s+/, ""), `uli-${i}`)}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({
  kind,
  title,
  lines,
}: {
  kind: CalloutKind;
  title?: string;
  lines: string[];
}) {
  const style = CALLOUT_STYLES[kind];
  const body = lines.join("\n").trim();
  return (
    <div className={`flex gap-4 rounded-2xl border ${style.wrapper} p-5`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow ${style.iconBg}`}
        aria-hidden
      >
        <span className="text-base">{style.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${style.title}`}>
          {style.label}
          {title ? <span className="ml-2 normal-case tracking-normal opacity-80">— {title}</span> : null}
        </p>
        <p className="mt-1.5 whitespace-pre-line text-[15px] leading-7 text-slate-700">
          {renderInline(body, `cal-${kind}`)}
        </p>
      </div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3">
                  {renderInline(h, `th-${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 text-slate-700">
                    {renderInline(cell, `td-${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderBlock(block: LessonBlock, index: number, trackColor: string): ReactNode {
  const key = `b-${index}`;
  switch (block.type) {
    case "heading": {
      const isH2 = block.level === 2;
      return (
        <div key={key} id={block.id} className="scroll-mt-24">
          {isH2 ? (
            <h2 className="mb-4 mt-10 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 first:mt-0">
              <span
                className="inline-block h-7 w-1.5 rounded-full"
                style={{ backgroundColor: trackColor }}
              />
              {block.text}
            </h2>
          ) : (
            <h3 className="mb-3 mt-8 text-lg font-bold text-slate-900 first:mt-0">
              {block.text}
            </h3>
          )}
        </div>
      );
    }
    case "section-header":
      return (
        <h3
          key={key}
          id={block.id}
          className="mb-3 mt-8 flex items-center gap-2 text-lg font-bold text-slate-900 scroll-mt-24 first:mt-0"
        >
          <span className="h-5 w-1 rounded-full" style={{ backgroundColor: trackColor }} />
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p key={key} className="whitespace-pre-line text-[15px] leading-8 text-slate-700">
          {renderInline(block.text, key)}
        </p>
      );
    case "code":
      return (
        <CodeBlock
          key={key}
          label={block.label}
          lines={block.lines}
          lang={block.lang}
          trackColor={trackColor}
        />
      );
    case "list":
      return <BulletList key={key} items={block.items} trackColor={trackColor} ordered={block.ordered} />;
    case "labeled-list":
      return (
        <div key={key} className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {block.label}
          </p>
          <BulletList items={block.items} trackColor={trackColor} ordered={block.ordered} />
        </div>
      );
    case "callout":
      return <Callout key={key} kind={block.kind} title={block.title} lines={block.lines} />;
    case "table":
      return <Table key={key} headers={block.headers} rows={block.rows} />;
    default:
      return null;
  }
}

export default function LessonContent({ content, trackColor }: LessonContentProps) {
  const blocks = useMemo(() => parseLessonContent(content), [content]);
  if (blocks.length === 0) {
    return <p className="text-base leading-8 text-slate-500">Lesson content is coming soon.</p>;
  }
  return <div className="space-y-6">{blocks.map((block, i) => renderBlock(block, i, trackColor))}</div>;
}
