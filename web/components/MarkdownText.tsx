import { Fragment } from "react";

// Inline-only markdown: bold, italic, inline code, line breaks. Chat replies
// are short sports-radio-style messages — no need for a full markdown engine.
const TOKEN_RE = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;

function renderLine(line: string, lineKey: string) {
  const parts = line.split(TOKEN_RE).filter((p) => p.length > 0);
  return parts.map((part, i) => {
    const key = `${lineKey}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={key} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^__[^_]+__$/.test(part)) {
      return (
        <strong key={key} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code key={key} className="px-1 py-0.5 rounded bg-black/20 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (/^_[^_]+_$/.test(part)) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {renderLine(line, String(i))}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}
