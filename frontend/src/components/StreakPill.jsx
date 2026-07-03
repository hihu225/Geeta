import { useEffect, useState } from "react";

/**
 * StreakPill — non-guilty daily practice counter.
 * Persists to localStorage. Increments on any visit that happens a new calendar day.
 * Shows current streak; a longest-ever streak is tracked internally.
 */
const STORAGE_KEY = "geeta_streak_v1";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dayDiff = (a, b) => {
  const ad = new Date(a + "T00:00:00");
  const bd = new Date(b + "T00:00:00");
  return Math.round((bd - ad) / (1000 * 60 * 60 * 24));
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s && typeof s.current === "number" && typeof s.lastVisit === "string") return s;
  } catch {}
  return null;
};

const StreakPill = ({ style }) => {
  const [state, setState] = useState({ current: 0, longest: 0, lastVisit: null });

  useEffect(() => {
    const today = todayISO();
    const existing = loadState();
    let next;
    if (!existing) {
      next = { current: 1, longest: 1, lastVisit: today };
    } else if (existing.lastVisit === today) {
      next = existing;
    } else {
      const gap = dayDiff(existing.lastVisit, today);
      const current = gap === 1 ? existing.current + 1 : 1;
      const longest = Math.max(existing.longest || 0, current);
      next = { current, longest, lastVisit: today };
    }
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  if (state.current <= 0) return null;

  const flame = state.current >= 7 ? "🔥" : "🪔";

  return (
    <div
      title={`${state.current}-day practice streak · longest ${state.longest}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        background: "var(--grad-glass)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--r-full)",
        color: "var(--gold-bright)",
        fontSize: "0.85rem",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        letterSpacing: "0.3px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "var(--shadow-sm), var(--glow-gold)",
        userSelect: "none",
        ...style,
      }}
    >
      <span style={{ fontSize: "1rem" }}>{flame}</span>
      <span>{state.current} day{state.current === 1 ? "" : "s"}</span>
    </div>
  );
};

export default StreakPill;
