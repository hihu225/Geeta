/**
 * OrnamentDivider — sacred SVG flourish for section breaks.
 * Variants: 'lotus' (default), 'mandala', 'line'.
 * Size controls the height; the SVG scales width to viewport container.
 */
const OrnamentDivider = ({ variant = "lotus", size = 28, style, className }) => {
  const common = {
    width: "100%",
    height: size,
    display: "block",
    margin: "1.5rem auto",
    ...style,
  };

  if (variant === "line") {
    return (
      <svg viewBox="0 0 400 20" preserveAspectRatio="none" style={common} className={className} aria-hidden="true">
        <defs>
          <linearGradient id="odLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--gold)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="10" x2="400" y2="10" stroke="url(#odLine)" strokeWidth="1" />
      </svg>
    );
  }

  if (variant === "mandala") {
    return (
      <svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet" style={common} className={className} aria-hidden="true">
        <defs>
          <linearGradient id="odMandalaLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
            <stop offset="35%" stopColor="var(--gold)" stopOpacity="0.55" />
            <stop offset="65%" stopColor="var(--gold)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="20" x2="160" y2="20" stroke="url(#odMandalaLine)" strokeWidth="1" />
        <line x1="240" y1="20" x2="400" y2="20" stroke="url(#odMandalaLine)" strokeWidth="1" />
        <g transform="translate(200 20)" stroke="var(--gold)" strokeWidth="1.1" fill="none">
          <circle r="9" opacity="0.85" />
          <circle r="4" opacity="0.7" />
          <g opacity="0.6">
            <line x1="-14" y1="0" x2="-11" y2="0" />
            <line x1="11" y1="0" x2="14" y2="0" />
            <line x1="0" y1="-14" x2="0" y2="-11" />
            <line x1="0" y1="11" x2="0" y2="14" />
          </g>
          <circle r="1.5" fill="var(--gold-bright)" stroke="none" />
        </g>
      </svg>
    );
  }

  // Default: lotus flourish
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet" style={common} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="odFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
          <stop offset="40%" stopColor="var(--gold)" stopOpacity="0.55" />
          <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="20" x2="150" y2="20" stroke="url(#odFade)" strokeWidth="1" />
      <line x1="250" y1="20" x2="400" y2="20" stroke="url(#odFade)" strokeWidth="1" />
      {/* Lotus at center */}
      <g transform="translate(200 20)" fill="none" stroke="var(--gold)" strokeWidth="1.1">
        <path d="M 0 -12 Q 5 -4 0 4 Q -5 -4 0 -12 Z" opacity="0.9" />
        <path d="M 0 -12 Q 5 -4 0 4 Q -5 -4 0 -12 Z" opacity="0.7" transform="rotate(60)" />
        <path d="M 0 -12 Q 5 -4 0 4 Q -5 -4 0 -12 Z" opacity="0.7" transform="rotate(-60)" />
        <path d="M 0 -12 Q 5 -4 0 4 Q -5 -4 0 -12 Z" opacity="0.5" transform="rotate(120)" />
        <path d="M 0 -12 Q 5 -4 0 4 Q -5 -4 0 -12 Z" opacity="0.5" transform="rotate(-120)" />
        <circle r="2" fill="var(--gold-bright)" stroke="none" />
      </g>
    </svg>
  );
};

export default OrnamentDivider;
