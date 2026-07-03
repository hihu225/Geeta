import { Link } from "react-router-dom";
import OrnamentDivider from "./OrnamentDivider.jsx";

const NotFound = () => (
  <div
    className="force-dark"
    style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    }}
  >
    {/* Ambient orbs */}
    <div style={{
      position: "absolute", top: "-140px", left: "-100px", width: "460px", height: "460px",
      background: "radial-gradient(circle, var(--saffron) 0%, transparent 65%)",
      filter: "blur(80px)", opacity: 0.45, pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", bottom: "-160px", right: "-80px", width: "400px", height: "400px",
      background: "radial-gradient(circle, var(--lotus-deep) 0%, transparent 65%)",
      filter: "blur(80px)", opacity: 0.45, pointerEvents: "none",
    }} />

    <div style={{
      fontFamily: "var(--font-display)",
      fontSize: "clamp(4rem, 12vw, 8rem)",
      color: "var(--gold-bright)",
      lineHeight: 1,
      textShadow: "0 4px 32px rgba(245, 166, 35, 0.35)",
      letterSpacing: "0.02em",
      zIndex: 1,
    }}>
      ॥ ॐ ॥
    </div>

    <h1 style={{
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2rem, 5vw, 3.4rem)",
      color: "var(--text-primary)",
      margin: "1.25rem 0 0.5rem",
      fontWeight: 600,
      letterSpacing: "-0.02em",
      zIndex: 1,
    }}>
      This path leads nowhere
    </h1>

    <p style={{
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: "clamp(1rem, 2vw, 1.25rem)",
      color: "var(--text-secondary)",
      maxWidth: "540px",
      lineHeight: 1.6,
      margin: "0.5rem 0 1rem",
      zIndex: 1,
    }}>
      "Even the wisest path-finder wanders sometimes.
      Let the compass of dharma guide you home."
    </p>

    <div style={{ maxWidth: "320px", width: "100%", zIndex: 1 }}>
      <OrnamentDivider variant="lotus" size={30} />
    </div>

    <Link
      to="/chat"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "1rem",
        padding: "13px 30px",
        background: "var(--grad-gold)",
        color: "#1a0f00",
        textDecoration: "none",
        borderRadius: "var(--r-full)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: "0.95rem",
        letterSpacing: "0.5px",
        border: "1px solid rgba(255,220,150,0.4)",
        boxShadow: "var(--shadow-md), var(--glow-gold)",
        zIndex: 1,
        transition: "transform 0.2s var(--ease-out), filter 0.2s var(--ease-out), box-shadow 0.3s var(--ease-out)",
      }}
      onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg), var(--glow-gold-strong)"; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-md), var(--glow-gold)"; }}
    >
      Return to Krishna →
    </Link>

    <div style={{
      marginTop: "2.5rem",
      fontSize: "12px",
      color: "var(--text-muted)",
      letterSpacing: "3px",
      textTransform: "uppercase",
      zIndex: 1,
    }}>
      Error 404 · The Sacred Path
    </div>
  </div>
);

export default NotFound;
