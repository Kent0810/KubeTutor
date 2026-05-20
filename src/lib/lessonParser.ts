export type CalloutKind = "note" | "tip" | "warning" | "important" | "try" | "example";

export type LessonBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "section-header"; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lines: string[]; lang?: string; label?: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "labeled-list"; label: string; items: string[]; ordered: boolean }
  | { type: "callout"; kind: CalloutKind; title?: string; lines: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type LessonOutline = { id: string; text: string; level: 2 | 3 }[];

const CALLOUT_PATTERN = /^>\s*(note|tip|warning|important|try it|try|example)\s*:?\s*(.*)$/i;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "section"
  );
}

function isIndentedLine(line: string): boolean {
  return /^ {2,}/.test(line) || /^\t/.test(line);
}

function isBulletLine(line: string): boolean {
  return /^[-•]\s+/.test(line.trimStart());
}

function isOrderedLine(line: string): boolean {
  return /^\d+\.\s+/.test(line.trimStart());
}

function trimCodeIndent(line: string): string {
  return line.replace(/^ {2}/, "").replace(/^\t/, "");
}

function detectLang(lines: string[], explicit?: string): string | undefined {
  if (explicit) return explicit.toLowerCase();
  const joined = lines.join("\n");
  const first = lines.find((l) => l.trim().length > 0)?.trim() ?? "";
  if (
    /^\$\s/.test(first) ||
    /^(sudo|docker|kubectl|helm|curl|brew|apt|dnf|npm|yarn|pnpm|git|wsl|mkdir|cd|ls|rm|cp|mv|cat|chmod|chown|systemctl|export|echo|nc|wget)\b/.test(
      first
    )
  ) {
    return "shell";
  }
  if (
    /^(FROM|RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|ENV|ARG|LABEL|USER|EXPOSE|HEALTHCHECK|STOPSIGNAL|VOLUME|ONBUILD|SHELL)\b/.test(
      first
    )
  ) {
    return "dockerfile";
  }
  if (/^(apiVersion|kind):/m.test(joined)) return "yaml";
  if (/^\s*\{[\s\S]*\}\s*$/m.test(joined.trim()) && /["{][^"]*":/.test(joined)) return "json";
  if (/^(function|const|let|var|import|export|return|if|for|while|class)\b/.test(first))
    return "javascript";
  if (/^(def|import|from|class|print|if __name__)\b/.test(first)) return "python";
  if (/^(package|func|var|import)\b/.test(first)) return "go";
  return undefined;
}

function parseCalloutKind(raw: string): CalloutKind {
  const k = raw.toLowerCase().trim();
  if (k === "tip") return "tip";
  if (k === "warning") return "warning";
  if (k === "important") return "important";
  if (k === "try" || k === "try it") return "try";
  if (k === "example") return "example";
  return "note";
}

function parseTable(rawBlock: string): { headers: string[]; rows: string[][] } | null {
  const lines = rawBlock.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 2) return null;
  const splitRow = (row: string): string[] =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
  const headers = splitRow(lines[0]);
  const sepIdx = lines[1] && /^\s*\|?\s*:?-+/.test(lines[1].trim().replace(/^\|/, "")) ? 1 : -1;
  const bodyStart = sepIdx === 1 ? 2 : 1;
  const rows = lines.slice(bodyStart).map(splitRow);
  if (headers.length === 0) return null;
  return { headers, rows };
}

const HEADER_LINE_RE = /^[^-•>|`*\d\s][^\n:?]{0,79}[:?]\s*$/;

function splitInlineHeaders(rawBlock: string): string[] {
  // Promote inline markdown headings and short "Section:" lines that sit at
  // the top of a multi-line prose block into their own blocks. This makes
  // patterns like:
  //   What a Pod actually is:
  //   A Pod is a group of one or more...
  // render as <h3>What a Pod actually is</h3> followed by a paragraph.
  const lines = rawBlock.split("\n");
  if (lines.length < 2) return [rawBlock];
  const first = lines[0].trim();
  const isMdHeading = /^#{2,3}\s+\S/.test(first);
  const isShortHeader = HEADER_LINE_RE.test(first);
  if (!isMdHeading && !isShortHeader) return [rawBlock];
  // Don't split if the rest looks like it forms a uniform structure (list,
  // code, callout, table) — those have their own dedicated parsing branches.
  const rest = lines.slice(1);
  const restNonEmpty = rest.filter((l) => l.trim().length > 0);
  if (restNonEmpty.length === 0) return [rawBlock];
  const restIsList = restNonEmpty.every((l) => isBulletLine(l) || isOrderedLine(l));
  const restIsCode = restNonEmpty.every(isIndentedLine);
  const restIsCallout = restNonEmpty.every((l) => l.trimStart().startsWith(">"));
  const restIsTable = restNonEmpty.every((l) => l.trim().startsWith("|"));
  if (restIsList || restIsCode || restIsCallout || restIsTable) return [rawBlock];
  return [first, rest.join("\n").trim()].filter((s) => s.length > 0);
}

export function parseLessonContent(content: string): LessonBlock[] {
  const normalized = content.replace(/\r\n/g, "\n");
  const rawBlocks = normalized
    .split(/\n\s*\n/)
    .filter((b) => b.trim().length > 0)
    .flatMap(splitInlineHeaders);
  const seenIds = new Map<string, number>();

  const makeId = (text: string): string => {
    const base = slugify(text);
    const count = seenIds.get(base) ?? 0;
    seenIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  return rawBlocks.map((rawBlock): LessonBlock => {
    const lines = rawBlock.split("\n");
    const nonEmpty = lines.filter((l) => l.trim().length > 0);
    const firstLine = (lines[0] ?? "").trim();

    // Markdown heading
    const h2Match = firstLine.match(/^##\s+(.+?)\s*$/);
    const h3Match = firstLine.match(/^###\s+(.+?)\s*$/);
    if (nonEmpty.length === 1 && (h2Match || h3Match)) {
      const level: 2 | 3 = h2Match ? 2 : 3;
      const text = (h2Match?.[1] ?? h3Match?.[1] ?? firstLine).trim();
      return { type: "heading", level, text, id: makeId(text) };
    }

    // Callout: every non-empty line starts with `>`
    if (nonEmpty.length > 0 && nonEmpty.every((l) => l.trimStart().startsWith(">"))) {
      const stripped = nonEmpty.map((l) => l.trimStart().replace(/^>\s?/, ""));
      const firstCalloutMatch = stripped[0].match(CALLOUT_PATTERN.source.replace(/^\^>\\s\*/, "^"));
      // Try matching kind on the first line as "Tip: rest" or "Tip" alone
      const headMatch = stripped[0].match(
        /^(Note|Tip|Warning|Important|Try it|Try|Example)\s*:\s*(.*)$/i
      );
      let kind: CalloutKind = "note";
      let bodyLines = stripped;
      let title: string | undefined;
      if (headMatch) {
        kind = parseCalloutKind(headMatch[1]);
        const rest = headMatch[2].trim();
        bodyLines = rest.length > 0 ? [rest, ...stripped.slice(1)] : stripped.slice(1);
      } else if (firstCalloutMatch) {
        kind = parseCalloutKind(firstCalloutMatch[1]);
        title = firstCalloutMatch[2]?.trim() || undefined;
        bodyLines = stripped.slice(1);
      }
      return { type: "callout", kind, title, lines: bodyLines };
    }

    // Table
    if (nonEmpty.length >= 2 && nonEmpty.every((l) => l.trim().startsWith("|"))) {
      const table = parseTable(rawBlock);
      if (table) return { type: "table", headers: table.headers, rows: table.rows };
    }

    // Fenced code: ```lang ... ```
    if (firstLine.startsWith("```")) {
      const lang = firstLine.replace(/^```/, "").trim() || undefined;
      const body = lines.slice(1);
      const endIdx = body.findIndex((l) => l.trim().startsWith("```"));
      const codeLines = endIdx >= 0 ? body.slice(0, endIdx) : body;
      return { type: "code", lines: codeLines, lang: detectLang(codeLines, lang) };
    }

    // Indented code block
    if (nonEmpty.length > 0 && nonEmpty.every(isIndentedLine)) {
      const codeLines = lines.map(trimCodeIndent);
      return { type: "code", lines: codeLines, lang: detectLang(codeLines) };
    }

    // Pure bullet list
    if (nonEmpty.length > 0 && nonEmpty.every(isBulletLine)) {
      return { type: "list", items: nonEmpty, ordered: false };
    }
    // Pure ordered list
    if (nonEmpty.length > 0 && nonEmpty.every(isOrderedLine)) {
      return { type: "list", items: nonEmpty, ordered: true };
    }

    const remaining = lines.slice(1);
    const remainingNonEmpty = remaining.filter((l) => l.trim().length > 0);

    // Labeled code: "Label:" followed by indented lines
    if (
      firstLine.endsWith(":") &&
      remainingNonEmpty.length > 0 &&
      remainingNonEmpty.every(isIndentedLine)
    ) {
      const codeLines = remaining.map(trimCodeIndent);
      return {
        type: "code",
        label: firstLine.replace(/:$/, ""),
        lines: codeLines,
        lang: detectLang(codeLines),
      };
    }

    // Labeled bullet list
    if (
      firstLine.endsWith(":") &&
      remainingNonEmpty.length > 0 &&
      remainingNonEmpty.every(isBulletLine)
    ) {
      return {
        type: "labeled-list",
        label: firstLine.replace(/:$/, ""),
        items: remainingNonEmpty,
        ordered: false,
      };
    }
    // Labeled ordered list
    if (
      firstLine.endsWith(":") &&
      remainingNonEmpty.length > 0 &&
      remainingNonEmpty.every(isOrderedLine)
    ) {
      return {
        type: "labeled-list",
        label: firstLine.replace(/:$/, ""),
        items: remainingNonEmpty,
        ordered: true,
      };
    }

    // Short "Section header:" line on its own (legacy)
    if (nonEmpty.length === 1 && firstLine.length < 80 && /[:?]$/.test(firstLine)) {
      const text = firstLine.replace(/:$/, "");
      return { type: "section-header", text, id: makeId(text) };
    }

    return { type: "paragraph", text: rawBlock.trim() };
  });
}

export function extractOutline(blocks: LessonBlock[]): LessonOutline {
  return blocks
    .filter((b): b is Extract<LessonBlock, { type: "heading" }> => b.type === "heading")
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));
}
