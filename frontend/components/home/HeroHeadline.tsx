import type { CSSProperties } from "react";

/**
 * Hero H1 revealed word by word (CSS .hero-word, 40 ms apart, rises 16 px). Screen readers get
 * the sentence once from the visually hidden copy; the animated words are aria-hidden.
 */
export function HeroHeadline({ text, className }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="hero-word" style={{ "--i": index } as CSSProperties}>
              {word}
            </span>
            {index < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </h1>
  );
}
