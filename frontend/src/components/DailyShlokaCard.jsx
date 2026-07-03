import { useMemo } from "react";
import AnimatedShloka from "./AnimatedShloka.jsx";
import OrnamentDivider from "./OrnamentDivider.jsx";

/**
 * DailyShlokaCard — curated verse card that rotates daily.
 * Deterministic per-day pick, no backend needed.
 */
const SHLOKAS = [
  {
    verse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    translation: "You have the right to work only, but never to its fruits.",
    ref: "Bhagavad Gita 2.47",
    reflection: "What action can you take today without attachment to outcome?",
  },
  {
    verse: "योगः कर्मसु कौशलम्।",
    translation: "Yoga is skillfulness in action.",
    ref: "Bhagavad Gita 2.50",
    reflection: "Where can you bring more presence and craft into your work?",
  },
  {
    verse: "समत्वं योग उच्यते।",
    translation: "Equanimity is called yoga.",
    ref: "Bhagavad Gita 2.48",
    reflection: "How steady is your mind between praise and criticism?",
  },
  {
    verse: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।",
    translation: "Lift yourself by your own self — do not degrade yourself.",
    ref: "Bhagavad Gita 6.5",
    reflection: "What one kind thing can you offer yourself today?",
  },
  {
    verse: "श्रद्धावान् लभते ज्ञानम्।",
    translation: "The one with faith attains wisdom.",
    ref: "Bhagavad Gita 4.39",
    reflection: "What are you approaching with fear that would open with trust?",
  },
  {
    verse: "मन एव मनुष्याणां कारणं बन्धमोक्षयोः।",
    translation: "The mind alone is the cause of bondage and liberation.",
    ref: "Amritabindu Upanishad 2 (echoed in Gita)",
    reflection: "Which thought, released, would free you most?",
  },
  {
    verse: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।",
    translation: "Whenever dharma declines, I manifest myself.",
    ref: "Bhagavad Gita 4.7",
    reflection: "Where is truth quietly asking to return in your life?",
  },
  {
    verse: "अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते।",
    translation: "By practice and detachment, the mind is mastered.",
    ref: "Bhagavad Gita 6.35",
    reflection: "What small daily practice would compound over a year?",
  },
];

const dayIndex = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const DailyShlokaCard = ({ onAsk, style }) => {
  const shloka = useMemo(() => SHLOKAS[dayIndex() % SHLOKAS.length], []);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: "640px",
        margin: "1.5rem auto 2rem",
        padding: "1.75rem 1.75rem 1.5rem",
        background: "var(--grad-glass)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-md), var(--glow-gold)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Subtle top glow */}
      <div style={{
        position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)",
        width: "220px", height: "80px",
        background: "radial-gradient(ellipse, var(--amber-glow) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        fontSize: "11px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "var(--gold)",
        textAlign: "center",
        marginBottom: "8px",
        fontWeight: 600,
      }}>
        ॐ · Verse of the Day
      </div>

      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.6rem",
        color: "var(--gold-bright)",
        textAlign: "center",
        margin: "12px 0 8px",
        lineHeight: 1.4,
        fontWeight: 600,
      }}>
        <AnimatedShloka text={shloka.verse} wordDelay={110} />
      </h3>

      <p style={{
        fontStyle: "italic",
        color: "var(--text-body)",
        textAlign: "center",
        margin: "6px 0 4px",
        fontSize: "1.02rem",
        lineHeight: 1.55,
      }}>
        "{shloka.translation}"
      </p>

      <p style={{
        fontSize: "0.85rem",
        color: "var(--text-muted)",
        textAlign: "center",
        letterSpacing: "0.06em",
        margin: "8px 0 0",
      }}>
        — {shloka.ref}
      </p>

      <OrnamentDivider variant="line" size={16} style={{ margin: "1rem auto 0.75rem", maxWidth: "260px" }} />

      <div style={{
        color: "var(--text-secondary)",
        textAlign: "center",
        fontSize: "0.95rem",
        lineHeight: 1.55,
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
      }}>
        {shloka.reflection}
      </div>

      {onAsk && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <button
            onClick={() => onAsk(shloka.reflection)}
            style={{
              background: "var(--grad-gold)",
              color: "#1a0f00",
              border: "1px solid rgba(255,220,150,0.4)",
              borderRadius: "var(--r-full)",
              padding: "0.55rem 1.4rem",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.9rem",
              letterSpacing: "0.3px",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm), var(--glow-gold)",
              transition: "all 0.2s var(--ease-out)",
            }}
          >
            Ask Krishna about this
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyShlokaCard;
