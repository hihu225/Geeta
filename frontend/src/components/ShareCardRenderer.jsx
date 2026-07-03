import { forwardRef } from "react";

/**
 * ShareCardRenderer — renders a beautiful shareable card as a fixed 1080×1350 element.
 * Meant to be rendered off-screen and captured with html2canvas.
 * Uses inline styles (no CSS var deps) so it looks identical no matter the app theme.
 */
const ShareCardRenderer = forwardRef(({ chat }, ref) => {
  const {
    userMessage = "",
    botResponse = "",
    shloka = "",
    translation = "",
    chapter,
    verse,
  } = chat || {};

  const truncate = (s, n) => (s && s.length > n ? s.slice(0, n - 1).trim() + "…" : s || "");

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1350px",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(ellipse at 30% 20%, #1e1338 0%, #120a24 50%, #0a0715 100%)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: "#FBF1DE",
        padding: "80px 72px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ambient orbs */}
      <div style={{
        position: "absolute", top: "-120px", left: "-120px", width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(245,166,35,0.35) 0%, transparent 65%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-150px", right: "-100px", width: "440px", height: "440px",
        background: "radial-gradient(circle, rgba(142,92,199,0.28) 0%, transparent 65%)",
        filter: "blur(50px)", pointerEvents: "none",
      }} />

      {/* Header — Om + brand */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "42px", color: "#F5C97A", letterSpacing: "1px" }}>॥ ॐ ॥</div>
        <div style={{ fontSize: "20px", color: "rgba(251,241,222,0.6)", letterSpacing: "3px", textTransform: "uppercase" }}>Divine Wisdom</div>
      </div>

      {/* Question */}
      <div style={{ marginTop: "80px", zIndex: 2 }}>
        <div style={{ fontSize: "18px", color: "#E6B85C", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "18px", fontWeight: 500 }}>
          The Question
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "44px",
          lineHeight: 1.3,
          color: "#FFF3DA",
          fontWeight: 500,
          fontStyle: "italic",
        }}>
          "{truncate(userMessage, 140)}"
        </div>
      </div>

      {/* Ornament divider */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "56px 0 40px", zIndex: 2 }}>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(245,201,122,0.5), transparent)" }} />
        <div style={{ margin: "0 20px", color: "#F5C97A", fontSize: "22px" }}>❋</div>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(245,201,122,0.5), transparent)" }} />
      </div>

      {/* Krishna's response */}
      <div style={{ flex: 1, zIndex: 2 }}>
        <div style={{ fontSize: "18px", color: "#E6B85C", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "18px", fontWeight: 500 }}>
          Krishna's Guidance
        </div>
        <div style={{
          fontSize: "26px",
          lineHeight: 1.6,
          color: "rgba(251,241,222,0.94)",
          fontWeight: 400,
        }}>
          {truncate(botResponse, 380)}
        </div>
      </div>

      {/* Shloka footer */}
      {shloka && (
        <div style={{
          marginTop: "40px",
          padding: "28px 32px",
          background: "linear-gradient(135deg, rgba(245,201,122,0.08) 0%, rgba(245,201,122,0.02) 100%)",
          borderLeft: "4px solid #E6B85C",
          borderRadius: "18px",
          zIndex: 2,
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "30px",
            color: "#F5C97A",
            lineHeight: 1.5,
            marginBottom: "8px",
          }}>
            {truncate(shloka, 90)}
          </div>
          {translation && (
            <div style={{ fontSize: "18px", color: "rgba(251,241,222,0.78)", fontStyle: "italic", lineHeight: 1.5 }}>
              — {truncate(translation, 120)}
            </div>
          )}
          {chapter && verse && (
            <div style={{ fontSize: "16px", color: "rgba(251,241,222,0.55)", marginTop: "10px", letterSpacing: "1px" }}>
              Bhagavad Gita · Chapter {chapter}, Verse {verse}
            </div>
          )}
        </div>
      )}

      {/* Brand */}
      <div style={{
        marginTop: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(245,201,122,0.18)",
        paddingTop: "24px",
        zIndex: 2,
      }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#F5C97A", fontWeight: 600 }}>
          GeetaGPT
        </div>
        <div style={{ fontSize: "16px", color: "rgba(251,241,222,0.5)", letterSpacing: "2px" }}>
          geetagpt.app
        </div>
      </div>
    </div>
  );
});

ShareCardRenderer.displayName = "ShareCardRenderer";

export default ShareCardRenderer;
