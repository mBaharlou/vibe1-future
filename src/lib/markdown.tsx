import type { ReactNode } from "react";

// A small Markdown subset for the chat's AI replies, rendered to React elements (never HTML
// strings, so nothing in a reply can inject markup): paragraphs, line breaks, bullet and numbered
// lists, headings (shown bold), fenced code, `code`, **bold**, *italic* / _italic_ and
// [links](https://…) (http, https and mailto only).

const SAFE_URL = /^(https?:|mailto:)/i;
const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*|_[^_\n]+_)|(\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}-${n++}`;
    const [whole, code, bold, italic, link] = m;
    if (code) out.push(<code key={k} className="rounded bg-black/[0.06] px-1 py-px font-mono text-[0.9em]">{code.slice(1, -1)}</code>);
    else if (bold) out.push(<strong key={k}>{inline(bold.slice(2, -2), k)}</strong>);
    else if (italic) out.push(<em key={k}>{inline(italic.slice(1, -1), k)}</em>);
    else if (link) {
      const label = link.slice(1, link.indexOf("]("));
      const href = link.slice(link.indexOf("](") + 2, -1);
      out.push(
        SAFE_URL.test(href) ? (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#2d6280]">
            {label}
          </a>
        ) : (
          label
        ),
      );
    } else out.push(whole);
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const withBreaks = (lines: string[], key: string) =>
  lines.flatMap((line, i) => (i ? [<br key={`${key}-br${i}`} />, ...inline(line, `${key}-${i}`)] : inline(line, `${key}-${i}`)));

export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.trimStart().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key} dir="ltr" className="overflow-x-auto rounded-lg bg-black/[0.06] p-2 font-mono text-[0.85em]">
          {code.join("\n")}
        </pre>,
      );
      continue;
    }
    const bullet = /^\s*[-*•]\s+/;
    const numbered = /^\s*\d+[.)]\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const marker = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) items.push(lines[i++].replace(marker, ""));
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={key} className={`${ordered ? "list-decimal" : "list-disc"} space-y-0.5 ps-5`}>
          {items.map((item, n) => (
            <li key={n}>{inline(item, `${key}-${n}`)}</li>
          ))}
        </List>,
      );
      continue;
    }
    const heading = /^\s*#{1,6}\s+/;
    if (heading.test(line)) {
      blocks.push(<p key={key} className="font-semibold">{inline(line.replace(heading, ""), key)}</p>);
      i++;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !bullet.test(lines[i]) && !numbered.test(lines[i]) && !heading.test(lines[i]) && !lines[i].trimStart().startsWith("```")) {
      para.push(lines[i++]);
    }
    blocks.push(<p key={key}>{withBreaks(para, key)}</p>);
  }
  return <div className="space-y-2">{blocks}</div>;
}
