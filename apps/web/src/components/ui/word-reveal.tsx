import { Fragment } from 'react';
import { cn } from '@aerotech/ui/cn';

type Segment = { text: string; highlight: boolean };

/** Split a raw message that may contain <hl>…</hl> into highlighted/plain segments. */
function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /<hl>([\s\S]*?)<\/hl>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const full = match[0] ?? '';
    const inner = match[1] ?? '';
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }
    segments.push({ text: inner, highlight: true });
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlight: false });
  }
  return segments;
}

/**
 * Reveals a title word-by-word: each word rises + fades + un-blurs with a staggered delay.
 * Pure CSS (see `.word-rise` in globals.css) so it never depends on JS — the text is visible by
 * default and only hidden *during* its own animation (backwards fill). Words inside <hl>…</hl>
 * get `highlightClassName` (e.g. the shimmer) via a NESTED span, so the shimmer animation runs
 * independently of the rise animation. Pass the RAW message via `t.raw('title')`.
 */
export function WordReveal({
  text,
  className,
  highlightClassName,
  stagger = 65,
  startDelay = 0,
}: {
  text: string;
  className?: string;
  highlightClassName?: string;
  stagger?: number;
  startDelay?: number;
}) {
  const words: { word: string; highlight: boolean }[] = [];
  for (const segment of parseSegments(text)) {
    for (const part of segment.text.split(/\s+/)) {
      if (part.length > 0) words.push({ word: part, highlight: segment.highlight });
    }
  }

  return (
    <span className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word-rise" style={{ animationDelay: `${startDelay + i * stagger}ms` }}>
            {w.highlight && highlightClassName ? (
              <span className={cn('inline-block', highlightClassName)}>{w.word}</span>
            ) : (
              w.word
            )}
          </span>{' '}
        </Fragment>
      ))}
    </span>
  );
}
