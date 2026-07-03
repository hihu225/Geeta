import { useEffect, useState } from "react";

/**
 * AnimatedShloka — reveals a Sanskrit verse word-by-word with a soft gold shimmer.
 * Falls back to instant render if prefers-reduced-motion.
 */
const AnimatedShloka = ({ text, style, className, wordDelay = 90 }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  const words = (text || "").split(/(\s+)/); // keep whitespace tokens

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setVisibleCount(words.length);
      return;
    }

    setVisibleCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setVisibleCount((c) => Math.min(c + 1, words.length));
      if (i >= words.length) window.clearInterval(id);
    }, wordDelay);

    return () => window.clearInterval(id);
  }, [text, wordDelay, words.length]);

  return (
    <span style={style} className={className}>
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          style={{
            display: /\s/.test(w) ? "inline" : "inline-block",
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(6px)",
            filter: i < visibleCount ? "blur(0px)" : "blur(4px)",
            transition:
              "opacity 380ms cubic-bezier(0.16,1,0.3,1), transform 380ms cubic-bezier(0.16,1,0.3,1), filter 380ms cubic-bezier(0.16,1,0.3,1)",
            willChange: "opacity, transform, filter",
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
};

export default AnimatedShloka;
