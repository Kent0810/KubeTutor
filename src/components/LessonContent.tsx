"use client";

import { useMemo, useState } from "react";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "section-header"; text: string }
  | { type: "code"; lines: string[] }
  | { type: "list"; items: string[] }
  | { type: "labeled-code"; label: string; lines: string[] }
  | { type: "labeled-list"; label: string; items: string[] };

interface LessonContentProps {
  content: string;
  trackColor: string;
}

function isIndentedLine(line: string): boolean {
  return /^ {2,}/.test(line);
}

function isListLine(line: string): boolean {
  return /^[-•]\s+/.test(line.trimStart());
}

function trimCodeIndent(line: string): string {
  return line.replace(/^ {2}/, "");
}

function parseLessonContent(content: string): Block[] {
  const normalized = content.replace(/\r\n/g, "\n");
  const rawBlocks = normalized.split("\n\n").filter((block) => block.trim().length > 0);

  return rawBlocks.map((rawBlock) => {
    const lines = rawBlock.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    const firstLine = lines[0]?.trim() ?? "";
    const remainingLines = lines.slice(1);
    const nonEmptyRemainingLines = remainingLines.filter((line) => line.trim().length > 0);

    if (nonEmptyLines.length > 0 && nonEmptyLines.every((line) => isIndentedLine(line))) {
      return {
        type: "code",
        lines: lines.map(trimCodeIndent),
      } satisfies Block;
    }

    if (nonEmptyLines.length > 0 && nonEmptyLines.every((line) => isListLine(line))) {
      return {
        type: "list",
        items: nonEmptyLines,
      } satisfies Block;
    }

    if (
      firstLine.endsWith(":") &&
      nonEmptyRemainingLines.length > 0 &&
      nonEmptyRemainingLines.every((line) => isIndentedLine(line))
    ) {
      return {
        type: "labeled-code",
        label: firstLine,
        lines: remainingLines.map(trimCodeIndent),
      } satisfies Block;
    }

    if (
      firstLine.endsWith(":") &&
      nonEmptyRemainingLines.length > 0 &&
      nonEmptyRemainingLines.every((line) => isListLine(line))
    ) {
      return {
        type: "labeled-list",
        label: firstLine,
        items: nonEmptyRemainingLines,
      } satisfies Block;
    }

    if (nonEmptyLines.length === 1 && firstLine.length < 60 && /[:?]$/.test(firstLine)) {
      return {
        type: "section-header",
        text: firstLine,
      } satisfies Block;
    }

    return {
      type: "paragraph",
      text: rawBlock.trim(),
    } satisfies Block;
  });
}

function CodeBlock({ label, lines, trackColor }: { label?: string; lines: string[]; trackColor: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        {label ? (
          <span
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold text-white"
            style={{ borderColor: trackColor }}
          >
            {label.replace(/:$/, "")}
          </span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Code</span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-7 text-slate-100">
        <code>{lines.join("\n")}</code>
      </pre>
    </div>
  );
}

function BulletList({ items, trackColor }: { items: string[]; trackColor: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base leading-7 text-slate-700">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: trackColor }}
          />
          <span>{item.replace(/^[-•]\s+/, "")}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LessonContent({ content, trackColor }: LessonContentProps) {
  const blocks = useMemo(() => parseLessonContent(content), [content]);

  if (blocks.length === 0) {
    return <p className="text-base leading-8 text-slate-500">Lesson content is coming soon.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "section-header":
            return (
              <h3
                key={`${block.type}-${index}`}
                className="mb-3 mt-8 flex items-center gap-2 text-lg font-bold text-slate-900 first:mt-0"
              >
                <span className="h-5 w-1 rounded-full" style={{ backgroundColor: trackColor }} />
                {block.text.replace(/:$/, "")}
              </h3>
            );
          case "paragraph":
            return (
              <p key={`${block.type}-${index}`} className="text-base leading-8 whitespace-pre-line text-slate-700">
                {block.text}
              </p>
            );
          case "code":
            return <CodeBlock key={`${block.type}-${index}`} lines={block.lines} trackColor={trackColor} />;
          case "labeled-code":
            return (
              <CodeBlock
                key={`${block.type}-${index}`}
                label={block.label}
                lines={block.lines}
                trackColor={trackColor}
              />
            );
          case "list":
            return <BulletList key={`${block.type}-${index}`} items={block.items} trackColor={trackColor} />;
          case "labeled-list":
            return (
              <div key={`${block.type}-${index}`} className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {block.label.replace(/:$/, "")}
                </p>
                <BulletList items={block.items} trackColor={trackColor} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
