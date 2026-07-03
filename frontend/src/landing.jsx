import React, { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, Send, Flower, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeaturesSection from './featuresSection';
import OrnamentDivider from './components/OrnamentDivider.jsx';
import { motion } from 'framer-motion';

const GeetaGPTLanding = () => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);

  const pageVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const support = () => {
    window.location.href = 'mailto:hihu2005ag@gmail.com?subject=Geeta GPT - Inquiry&body=Hi, I would like to know more about...';
  };

  const demoMessages = [
    {
      type: 'user',
      text: "How can I find peace in life?",
      delay: 1200
    },
    {
      type: 'krishna',
      text: "विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः।\nनिर्ममो निरहंकारः स शांतिमधिगच्छति॥\n\nOne who abandons all desires and moves about without longing, without the sense of 'mine' or ego, attains peace.",
      delay: 2600
    },
    {
      type: 'user',
      text: "Why should I not fear challenges?",
      delay: 1800
    },
    {
      type: 'krishna',
      text: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ।\nततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि॥\n\nTreat pleasure and pain, gain and loss, victory and defeat the same, and then engage in your duty.",
      delay: 2600
    }
  ];

  // Play the demo conversation once. Uses a cancel flag so StrictMode's
  // double-invocation in dev doesn't produce interleaved / duplicated bubbles.
  useEffect(() => {
    let cancelled = false;
    const play = async () => {
      setChatMessages([]);
      for (let i = 0; i < demoMessages.length; i++) {
        await new Promise((r) => setTimeout(r, demoMessages[i].delay));
        if (cancelled) return;
        setChatMessages((prev) => [...prev, demoMessages[i]]);
      }
    };
    play();
    return () => { cancelled = true; };
  }, []);

  const handleStartNow = () => navigate('/signup');
  const handleLogin = () => navigate('/login');

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <div className="geeta-gpt-landing force-dark">
        {/* Ambient background */}
        <div className="landing-ambient" aria-hidden="true">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="dot-grid"></div>
        </div>

        {/* Top navigation */}
        <header className="landing-nav">
          <div className="nav-inner">
            <div className="nav-brand">
              <span className="brand-mark">॥ ॐ ॥</span>
              <span className="brand-name">Geeta<span className="brand-accent">GPT</span></span>
            </div>
            <div className="nav-actions">
              <button className="nav-login" onClick={handleLogin}>Sign in</button>
              <button className="nav-cta" onClick={handleStartNow}>
                Begin <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="cta-container hero-grid">
            {/* Left Content */}
            <div className="hero-left-content">
              <div className="hero-eyebrow">
                <Sparkles size={14} className="eyebrow-icon" />
                <span>Ancient wisdom · Modern conversation</span>
              </div>

              <h1 className="hero-title">
                <span className="hero-title-line">Timeless guidance</span>
                <span className="hero-title-line hero-title-muted">from the</span>
                <span className="hero-title-gradient">Bhagavad Gita</span>
              </h1>

              <p className="hero-description">
                A quiet space to ask, reflect, and receive verse-backed wisdom —
                whenever life feels loud.
              </p>

              <div className="hero-buttons">
                <button onClick={handleStartNow} className="btn-hero-primary">
                  Begin your journey
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
                <button onClick={handleLogin} className="btn-hero-ghost">
                  I have an account
                </button>
              </div>

              <div className="hero-trust">
                <div className="trust-item">
                  <span className="trust-num">700+</span>
                  <span className="trust-label">Verses</span>
                </div>
                <span className="trust-divider" />
                <div className="trust-item">
                  <span className="trust-num">24/7</span>
                  <span className="trust-label">Guidance</span>
                </div>
                <span className="trust-divider" />
                <div className="trust-item">
                  <span className="trust-num">3</span>
                  <span className="trust-label">Languages</span>
                </div>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="phone-mockup-container">
              <div className="phone-glow" />
              <div className="phone-mockup">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="chat-header">
                    <div className="chat-avatar">
                      <Flower className="chat-avatar-icon" />
                    </div>
                    <div>
                      <h3 className="chat-name">Krishna</h3>
                      <p className="chat-status">
                        <span className="status-dot" />
                        Your spiritual guide
                      </p>
                    </div>
                  </div>
                  <div className="chat-messages-display custom-scrollbar">
                    <div className="chat-message chat-message-krishna">
                      <div className="chat-bubble chat-bubble-krishna">
                        <p className="shloka-text">Welcome, dear seeker. How may I guide you today?</p>
                      </div>
                    </div>
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`chat-message ${message.type === 'user' ? 'chat-message-user' : 'chat-message-krishna'} animate-fade-in-custom`}
                      >
                        <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-krishna'}`}>
                          {message.type === 'krishna' && (
                            <p className="shloka-header">
                              {message.text.split('\n\n')[0]}
                            </p>
                          )}
                          <p className="shloka-text">
                            {message.type === 'krishna' ? message.text.split('\n\n')[1] : message.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-area">
                    <div className="chat-input-wrapper">
                      <input
                        type="text"
                        placeholder="Ask Krishna for guidance..."
                        disabled
                        className="chat-input-field"
                      />
                      <button disabled className="chat-input-send-btn">
                        <Send className="send-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section divider */}
        <div className="section-divider" aria-hidden="true">
          <span>॥ श्रीकृष्णार्पणमस्तु ॥</span>
        </div>

        {/* Features Grid */}
        <FeaturesSection />

        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <OrnamentDivider variant="mandala" size={40} />
        </div>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-container cta-inner">
            <div className="cta-om">॥ ॐ ॥</div>
            <h2 className="cta-title">Begin your spiritual journey</h2>
            <p className="cta-description">
              Thousands have already turned to the Gita for clarity, purpose, and peace.
              Take the first step — it's free.
            </p>

            <div className="cta-content">
              <button onClick={handleStartNow} className="btn-hero-primary">
                Embark now
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>

              <div className="inquiry-form-wrapper">
                <p className="inquiry-text">Have questions?</p>
                <button onClick={support} type="button" className="inquiry-link-btn">
                  Send us an email →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="cta-container footer-inner">
            <div>
              <span className="brand-mark">॥ ॐ ॥</span>
              <span className="brand-name" style={{ marginLeft: '8px' }}>
                Geeta<span className="brand-accent">GPT</span>
              </span>
            </div>
            <p className="footer-tag">Made with reverence · श्रीकृष्णार्पणमस्तु</p>
          </div>
        </footer>

        <style jsx>{`
          html { box-sizing: border-box; }
          *, *::before, *::after { box-sizing: inherit; }

          /* ============================================================
             Root
             ============================================================ */
          .geeta-gpt-landing {
            position: relative;
            min-height: 100vh;
            width: 100%;
            color: var(--text-body);
            background: var(--grad-bg);
            overflow-x: hidden;
            font-family: var(--font-body);
          }

          /* ============================================================
             Ambient background — floating orbs + dot grid
             ============================================================ */
          .landing-ambient {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }
          .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(90px);
            opacity: 0.5;
            animation: orbFloat 26s ease-in-out infinite;
          }
          .orb-1 { width: 520px; height: 520px; top: -140px; left: -140px;
            background: radial-gradient(circle, var(--saffron) 0%, transparent 65%); opacity: 0.4; }
          .orb-2 { width: 460px; height: 460px; top: 30%; right: -160px;
            background: radial-gradient(circle, var(--lotus-deep) 0%, transparent 65%);
            animation-delay: -10s; opacity: 0.4; }
          .orb-3 { width: 380px; height: 380px; bottom: -160px; left: 30%;
            background: radial-gradient(circle, var(--gold) 0%, transparent 65%);
            animation-delay: -16s; opacity: 0.3; }
          @keyframes orbFloat {
            0%, 100% { transform: translate(0,0) scale(1); }
            33%      { transform: translate(30px,-20px) scale(1.05); }
            66%      { transform: translate(-25px,25px) scale(0.97); }
          }
          .dot-grid {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(circle, rgba(245,200,120,0.05) 1px, transparent 1px);
            background-size: 34px 34px;
            mask-image: radial-gradient(ellipse at center, black 15%, transparent 80%);
          }

          /* ============================================================
             Nav
             ============================================================ */
          .landing-nav {
            position: sticky;
            top: 0;
            z-index: 50;
            padding: 18px 0;
            background: rgba(10, 6, 22, 0.55);
            backdrop-filter: blur(20px) saturate(140%);
            -webkit-backdrop-filter: blur(20px) saturate(140%);
            border-bottom: 1px solid var(--border-subtle);
          }
          .nav-inner {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .nav-brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
          }
          .brand-mark {
            font-family: var(--font-display);
            font-size: 18px;
            color: var(--gold);
            letter-spacing: 0.15em;
            text-shadow: 0 0 12px var(--amber-glow);
          }
          .brand-name {
            font-family: var(--font-display);
            font-weight: 600;
            font-size: 20px;
            color: var(--text-primary);
            letter-spacing: 0.02em;
          }
          .brand-accent {
            background: var(--grad-gold);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .nav-actions { display: inline-flex; gap: 10px; align-items: center; }
          .nav-login {
            background: transparent;
            border: none;
            color: var(--text-body);
            font-size: 14.5px;
            font-weight: 500;
            padding: 8px 14px;
            cursor: pointer;
            border-radius: var(--r-full);
            transition: color var(--dur-fast) var(--ease-out);
            letter-spacing: var(--tracking-wide);
          }
          .nav-login:hover { color: var(--gold-bright); }
          .nav-cta {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--grad-gold);
            color: #1a0f00;
            font-size: 13.5px;
            font-weight: 600;
            padding: 9px 18px;
            border: 1px solid rgba(255,220,150,0.4);
            border-radius: var(--r-full);
            cursor: pointer;
            box-shadow: var(--shadow-sm), var(--glow-gold);
            transition: transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out);
          }
          .nav-cta:hover { transform: translateY(-1px); filter: brightness(1.05); }

          /* ============================================================
             Hero
             ============================================================ */
          .hero-section {
            position: relative;
            z-index: 2;
            padding: 90px 0 60px;
          }
          .cta-container {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 32px;
          }
          .hero-grid {
            display: grid;
            grid-template-columns: 1.15fr 1fr;
            gap: 80px;
            align-items: center;
          }
          .hero-left-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
            text-align: left;
          }
          .hero-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 7px 16px;
            width: fit-content;
            border-radius: var(--r-full);
            border: 1px solid var(--border-soft);
            background: rgba(245,200,120,0.06);
            color: var(--gold-bright);
            font-size: 13px;
            font-weight: 500;
            letter-spacing: var(--tracking-wide);
          }
          .eyebrow-icon { color: var(--gold); }

          .hero-title {
            font-family: var(--font-display);
            font-size: clamp(40px, 5.2vw, 64px);
            font-weight: 500;
            line-height: 1.08;
            letter-spacing: var(--tracking-tight);
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .hero-title-line {
            display: block;
            color: #FBF1DE;
            text-shadow: 0 2px 24px rgba(0,0,0,0.4);
          }
          .hero-title-muted {
            color: rgba(251, 241, 222, 0.75);
            font-style: italic;
            font-size: 0.62em;
            letter-spacing: 0.03em;
            font-weight: 400;
          }
          .hero-title-gradient {
            display: block;
            background: linear-gradient(135deg, #FFE4A8 0%, #F5C97A 45%, #E6B85C 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 22px rgba(245, 166, 35, 0.22));
            font-weight: 600;
          }

          .hero-description {
            font-size: 18px;
            line-height: 1.7;
            color: var(--text-body);
            max-width: 500px;
            margin: 0;
            font-weight: 400;
          }
          .hero-buttons {
            display: inline-flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 8px;
          }
          .btn-hero-primary {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 15px 28px;
            font-family: var(--font-body);
            font-size: 15px;
            font-weight: 600;
            letter-spacing: var(--tracking-wide);
            color: #1a0f00;
            background: var(--grad-gold);
            border: 1px solid rgba(255,220,150,0.45);
            border-radius: var(--r-full);
            cursor: pointer;
            overflow: hidden;
            box-shadow: var(--shadow-md), var(--glow-gold), inset 0 1px 0 rgba(255,255,255,0.45);
            transition: transform var(--dur-fast) var(--ease-out),
                        box-shadow var(--dur-med) var(--ease-out),
                        filter var(--dur-fast) var(--ease-out);
          }
          .btn-hero-primary::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
            transform: translateX(-100%);
            transition: transform 800ms var(--ease-out);
          }
          .btn-hero-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg), var(--glow-gold-strong), inset 0 1px 0 rgba(255,255,255,0.55);
            filter: brightness(1.06);
          }
          .btn-hero-primary:hover::before { transform: translateX(100%); }
          .btn-hero-primary:active { transform: translateY(0); }

          .btn-hero-ghost {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 24px;
            font-family: var(--font-body);
            font-size: 14.5px;
            font-weight: 500;
            letter-spacing: var(--tracking-wide);
            color: var(--text-body);
            background: transparent;
            border: 1px solid var(--border-soft);
            border-radius: var(--r-full);
            cursor: pointer;
            transition: all var(--dur-fast) var(--ease-out);
          }
          .btn-hero-ghost:hover {
            color: var(--gold-bright);
            border-color: var(--border-strong);
            background: rgba(245,200,120,0.04);
          }

          .hero-trust {
            display: inline-flex;
            align-items: center;
            gap: 28px;
            margin-top: 36px;
            padding: 18px 28px;
            width: fit-content;
            border: 1px solid var(--border-soft);
            border-radius: var(--r-lg);
            background: rgba(255,255,255,0.025);
          }
          .trust-item { display: flex; flex-direction: column; gap: 4px; }
          .trust-num {
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 600;
            color: var(--gold-bright);
            line-height: 1;
          }
          .trust-label {
            font-size: 11.5px;
            color: var(--text-secondary);
            letter-spacing: var(--tracking-wider);
            text-transform: uppercase;
            font-weight: 500;
          }
          .trust-divider {
            width: 1px;
            height: 36px;
            background: var(--border-soft);
          }

          /* ============================================================
             Phone mockup
             ============================================================ */
          .phone-mockup-container {
            position: relative;
            display: flex;
            justify-content: center;
            perspective: 1400px;
          }
          .phone-glow {
            position: absolute;
            width: 500px;
            height: 500px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(245,166,35,0.28) 0%, transparent 60%);
            filter: blur(40px);
            z-index: 0;
            animation: pulseGlow 6s ease-in-out infinite;
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1); }
            50%      { opacity: 1;   transform: translate(-50%,-50%) scale(1.08); }
          }
          .phone-mockup {
            position: relative;
            z-index: 2;
            width: 320px;
            height: 640px;
            background: linear-gradient(160deg, #221535 0%, #120a24 60%, #0a0715 100%);
            border-radius: 42px;
            padding: 10px;
            border: 1px solid var(--border-soft);
            box-shadow:
              0 40px 100px rgba(0,0,0,0.7),
              0 0 60px rgba(245,166,35,0.15),
              inset 0 1px 0 rgba(255,255,255,0.08);
            transform: rotate(-3deg) rotateY(-8deg) rotateX(2deg);
            transition: transform 800ms var(--ease-out);
          }
          .phone-mockup:hover {
            transform: rotate(0deg) rotateY(0deg) rotateX(0deg) translateY(-6px);
          }
          .phone-notch {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 110px;
            height: 26px;
            background: #050308;
            border-radius: 0 0 14px 14px;
            z-index: 3;
          }
          .phone-screen {
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #1a1029 0%, #120a24 100%);
            border-radius: 34px;
            padding: 36px 16px 14px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          .chat-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border-subtle);
          }
          .chat-avatar {
            width: 40px; height: 40px;
            background: var(--grad-gold);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: var(--glow-gold);
            border: 1px solid rgba(255,220,150,0.5);
            flex-shrink: 0;
          }
          .chat-avatar-icon {
            width: 20px; height: 20px;
            color: #1a0f00;
          }
          .chat-name {
            font-family: var(--font-display);
            font-weight: 600;
            font-size: 16px;
            color: var(--text-primary);
            margin: 0;
          }
          .chat-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--text-muted);
            margin: 2px 0 0;
          }
          .status-dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: var(--success);
            box-shadow: 0 0 8px var(--success);
          }
          .chat-messages-display {
            flex: 1;
            overflow-y: auto;
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding-right: 4px;
          }
          .chat-message { display: flex; }
          .chat-message-user { justify-content: flex-end; }
          .chat-message-krishna { justify-content: flex-start; }
          .chat-bubble {
            max-width: 82%;
            padding: 10px 14px;
            border-radius: 16px;
            font-size: 12.5px;
            line-height: 1.55;
          }
          .chat-bubble-user {
            background: linear-gradient(135deg, rgba(245,166,35,0.28), rgba(198,120,24,0.18));
            border: 1px solid rgba(245,200,120,0.28);
            color: var(--text-primary);
            border-bottom-right-radius: 6px;
          }
          .chat-bubble-krishna {
            background: rgba(255,255,255,0.045);
            border: 1px solid var(--border-subtle);
            color: var(--text-body);
            border-bottom-left-radius: 6px;
          }
          .shloka-header {
            font-family: var(--font-display);
            color: var(--gold-bright);
            font-weight: 500;
            font-size: 12px;
            margin: 0 0 6px;
            padding-bottom: 6px;
            border-bottom: 1px solid var(--border-subtle);
            white-space: pre-line;
          }
          .shloka-text {
            font-size: 12px;
            line-height: 1.55;
            white-space: pre-line;
            margin: 0;
          }
          .chat-input-area {
            padding-top: 10px;
            border-top: 1px solid var(--border-subtle);
          }
          .chat-input-wrapper { display: flex; gap: 6px; }
          .chat-input-field {
            flex: 1;
            padding: 9px 12px;
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            background: rgba(10,6,22,0.5);
            color: var(--text-faint);
            font-size: 11.5px;
            outline: none;
          }
          .chat-input-field::placeholder { color: var(--text-faint); }
          .chat-input-send-btn {
            padding: 8px 12px;
            background: var(--grad-gold);
            color: #1a0f00;
            border: none;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--glow-gold);
          }
          .send-icon { width: 14px; height: 14px; }

          /* ============================================================
             Section divider (Sanskrit)
             ============================================================ */
          .section-divider {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            padding: 60px 32px 20px;
            color: var(--text-muted);
            font-family: var(--font-display);
            font-size: 17px;
            letter-spacing: var(--tracking-wide);
          }
          .section-divider::before,
          .section-divider::after {
            content: '';
            flex: 1;
            max-width: 240px;
            height: 1px;
            background: var(--grad-divider);
          }
          .section-divider span { color: var(--gold-bright); }

          /* ============================================================
             CTA
             ============================================================ */
          .cta-section {
            position: relative;
            z-index: 2;
            padding: 100px 0 120px;
            text-align: center;
          }
          .cta-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            max-width: 720px;
            padding: 64px 48px;
            background: var(--grad-glass);
            backdrop-filter: blur(30px) saturate(140%);
            -webkit-backdrop-filter: blur(30px) saturate(140%);
            border: 1px solid var(--border-soft);
            border-radius: var(--r-2xl);
            box-shadow: var(--shadow-xl), var(--glow-gold);
            position: relative;
            overflow: hidden;
          }
          .cta-inner::before {
            content: '';
            position: absolute;
            top: 0;
            left: 15%;
            right: 15%;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
          }
          .cta-om {
            font-family: var(--font-display);
            font-size: 32px;
            color: var(--gold);
            text-shadow: 0 0 24px var(--amber-glow);
            letter-spacing: 0.15em;
            margin-bottom: 4px;
          }
          .cta-title {
            font-family: var(--font-display);
            font-size: clamp(32px, 4.2vw, 46px);
            font-weight: 500;
            color: #FBF1DE;
            letter-spacing: var(--tracking-tight);
            margin: 0;
            line-height: 1.15;
          }
          .cta-description {
            color: var(--text-body);
            font-size: 17px;
            line-height: 1.7;
            max-width: 520px;
            margin: 0;
          }
          .cta-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
            margin-top: 12px;
          }
          .inquiry-form-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
          }
          .inquiry-text {
            color: var(--text-secondary);
            font-size: 14px;
            margin: 0;
          }
          .inquiry-link-btn {
            background: none;
            border: none;
            padding: 0;
            color: var(--gold-bright);
            cursor: pointer;
            font-size: 14.5px;
            font-weight: 500;
            transition: color var(--dur-fast) var(--ease-out);
          }
          .inquiry-link-btn:hover { color: var(--gold); }

          /* ============================================================
             Footer
             ============================================================ */
          .landing-footer {
            position: relative;
            z-index: 2;
            padding: 32px 0 40px;
            border-top: 1px solid var(--border-subtle);
          }
          .footer-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
          }
          .footer-tag {
            color: var(--text-secondary);
            font-size: 13.5px;
            letter-spacing: var(--tracking-wide);
            margin: 0;
          }

          /* ============================================================
             Animations & scrollbar
             ============================================================ */
          @keyframes fade-in-custom {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-custom {
            animation: fade-in-custom 0.6s var(--ease-out) forwards;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--border-soft);
            border-radius: 999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

          /* ============================================================
             Responsive
             ============================================================ */
          @media (max-width: 960px) {
            .hero-grid {
              grid-template-columns: 1fr;
              gap: 60px;
              text-align: center;
            }
            .hero-left-content { align-items: center; text-align: center; }
            .hero-title { align-items: center; }
            .hero-description { margin: 0 auto; }
            .hero-eyebrow { margin: 0 auto; }
            .hero-buttons { justify-content: center; }
            .hero-trust { margin: 32px auto 0; }
          }

          @media (max-width: 640px) {
            .cta-container { padding: 0 20px; }
            .hero-section { padding: 60px 0 40px; }
            .hero-buttons { flex-direction: column; width: 100%; }
            .btn-hero-primary, .btn-hero-ghost {
              width: 100%;
              justify-content: center;
            }
            .phone-mockup {
              width: 280px;
              height: 560px;
              transform: rotate(0deg);
            }
            .hero-trust {
              gap: 16px;
              padding: 12px 18px;
            }
            .trust-num { font-size: 18px; }
            .cta-inner { padding: 40px 24px; }
            .nav-inner { padding: 0 20px; }
            .nav-login { display: none; }
            .section-divider::before, .section-divider::after { max-width: 60px; }
          }

          @media (max-width: 400px) {
            .hero-title { font-size: 32px; }
            .brand-mark { display: none; }
          }
        `}</style>
      </div>
    </motion.div>
  );
};

export default GeetaGPTLanding;
