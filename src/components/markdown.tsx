import { Fragment, type ReactNode } from "react";
import { slugify } from "@/lib/format";

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractHeadings(source: string): TocHeading[] {
  const blocks = source
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const headings: TocHeading[] = [];
  const used = new Set<string>();

  for (const b of blocks) {
    if (/^##\s+/.test(b)) {
      const text = b.replace(/^##\s+/, "").replace(/\*\*/g, "").trim();
      let id = slugify(text) || `muc-${headings.length + 1}`;
      if (used.has(id)) id = `${id}-${headings.length + 1}`;
      used.add(id);
      headings.push({ id, text, level: 2 });
    }
  }
  return headings;
}

function inline(text: string): ReactNode[] {
  // Support **bold**, *italic*, `code`, and [label](https://...)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
      return <em key={i}>{p.slice(1, -1)}</em>;
    }
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) {
      return (
        <code key={i} className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[0.88em] text-ink">
          {p.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(p);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function isTableBlock(lines: string[]): boolean {
  if (lines.length < 2) return false;
  return lines.every((l) => l.trim().startsWith("|") && l.trim().endsWith("|"));
}

function parseTableCells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

/** Rich, safe editorial markdown renderer (paragraphs, ##/### headings, bullet & numbered lists, links, blockquotes, comparison tables). */
export function Markdown({ source }: { source: string }) {
  const blocks = source
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const usedHeadingIds = new Set<string>();
  let h2Index = 0;

  return (
    <div className="article-body">
      {blocks.map((b, i) => {
        if (/^###\s/.test(b)) {
          const rawText = b.replace(/^###\s+/, "");
          const id = slugify(rawText) || `sub-${i}`;
          return (
            <h3 key={i} id={id} className="scroll-mt-24">
              {inline(rawText)}
            </h3>
          );
        }
        if (/^##\s/.test(b)) {
          const rawText = b.replace(/^##\s+/, "");
          const cleanText = rawText.replace(/\*\*/g, "").trim();
          let id = slugify(cleanText) || `muc-${h2Index + 1}`;
          if (usedHeadingIds.has(id)) id = `${id}-${h2Index + 1}`;
          usedHeadingIds.add(id);
          h2Index++;
          return (
            <h2 key={i} id={id} className="scroll-mt-24">
              {inline(rawText)}
            </h2>
          );
        }
        if (/^#\s/.test(b)) return null;

        const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);

        // Render Markdown comparison tables
        if (isTableBlock(lines)) {
          const parsedRows = lines.map(parseTableCells);
          const header = parsedRows[0] ?? [];
          const bodyRows = parsedRows
            .slice(1)
            .filter((cells) => !isSeparatorRow(cells) && cells.some((c) => c.length > 0));

          if (header.length > 0 && bodyRows.length > 0) {
            return (
              <div key={i} className="my-8 overflow-x-auto rounded-sm border border-rule bg-white shadow-xs">
                <table className="w-full border-collapse text-left font-sans text-[14.5px] leading-snug">
                  <thead>
                    <tr className="border-b-2 border-ink bg-paper-2 text-[12.5px] font-bold uppercase tracking-wider text-ink">
                      {header.map((h, hi) => (
                        <th key={hi} className="px-4 py-3.5 align-top">
                          {inline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((row, ri) => (
                      <tr key={ri} className={`border-b border-rule last:border-b-0 ${ri % 2 === 1 ? "bg-paper/60" : "bg-white"}`}>
                        {header.map((_, ci) => (
                          <td key={ci} className={`px-4 py-3.5 align-top ${ci === 0 ? "font-semibold text-ink" : "text-ink-2"}`}>
                            {inline(row[ci] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Render Blockquote
        if (lines.every((l) => /^>\s*/.test(l))) {
          const quoteText = lines.map((l) => l.replace(/^>\s*/, "")).join(" ");
          return (
            <blockquote key={i} className="my-7 border-l-[3px] border-accent bg-paper-2/60 px-6 py-4 font-serif text-[20px] italic leading-relaxed text-ink">
              {inline(quoteText)}
            </blockquote>
          );
        }

        // Render Bullet list
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        // Render Numbered list
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={i} className="my-5 list-decimal space-y-2.5 pl-6">
              {lines.map((l, j) => (
                <li key={j} className="pl-1">
                  {inline(l.replace(/^\s*\d+[.)]\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
