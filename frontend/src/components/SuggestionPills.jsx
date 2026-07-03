/**
 * SuggestionPills — friendly starter prompts for empty conversations.
 * Rotates deterministically per day so returning users see slightly different sets.
 */
const ALL_SUGGESTIONS = [
  "What is dharma in modern life?",
  "How do I let go of attachment?",
  "How to find my purpose?",
  "How do I deal with fear of failure?",
  "What does Krishna say about anger?",
  "How to stay calm under pressure?",
  "How to accept loss and grief?",
  "What is true happiness?",
  "How to overcome self-doubt?",
  "How do I forgive someone who hurt me?",
  "What does the Gita say about karma?",
  "How can I make hard decisions with clarity?",
];

const dayIndex = () => {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / (1000 * 60 * 60 * 24));
};

const pickFour = () => {
  const offset = dayIndex() % ALL_SUGGESTIONS.length;
  const rotated = [...ALL_SUGGESTIONS.slice(offset), ...ALL_SUGGESTIONS.slice(0, offset)];
  return rotated.slice(0, 4);
};

const SuggestionPills = ({ onPick, style }) => {
  const picks = pickFour();
  return (
    <div style={{ maxWidth: "640px", margin: "1.5rem auto 2rem", textAlign: "center", ...style }}>
      <div style={{
        fontSize: "12px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "var(--gold)",
        fontWeight: 600,
        marginBottom: "0.85rem",
      }}>
        Start with a question
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
      }}>
        {picks.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            style={{
              background: "var(--grad-glass)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-full)",
              padding: "9px 18px",
              fontSize: "0.9rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "var(--shadow-sm)",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "var(--gold-bright)";
              e.currentTarget.style.borderColor = "var(--gold)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPills;
