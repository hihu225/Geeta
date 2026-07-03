import React from 'react';
import {
  BookOpen,
  Compass,
  Mic,
  Bell,
  ScrollText,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Daily Divine Shlokas',
    description:
      'Handpicked Bhagavad Gita verses delivered each morning to inspire clarity, peace, and focus.',
    accent: 'gold',
  },
  {
    icon: Compass,
    title: 'Theme-based Guidance',
    description:
      'Ask on karma, purpose, emotions, or success — receive verse-backed answers tailored to your intent.',
    accent: 'lotus',
  },
  {
    icon: Mic,
    title: 'Voice Conversations',
    description:
      'Speak your queries aloud and let Krishna reply with spiritual guidance — hands-free and intuitive.',
    accent: 'gold',
  },
  {
    icon: Bell,
    title: 'Mindful Reminders',
    description:
      'Personalised shloka alerts and gentle mindfulness nudges to stay rooted through the day.',
    accent: 'lotus',
  },
  {
    icon: ScrollText,
    title: 'Shloka · Meaning · Translation',
    description:
      'Every reply pairs the original Sanskrit shloka with Hindi and English meanings alongside spiritual interpretation.',
    accent: 'gold',
  },
  {
    icon: Sparkles,
    title: 'Guest Mode',
    description:
      'Try the app without signing up — ask questions, explore features, and experience guidance risk-free.',
    accent: 'lotus',
  },
];

const FeaturesSection = () => {
  return (
    <section className="features-section-container">
      <div className="content-wrapper">
        <div className="section-header">
          <div className="section-eyebrow">
            <Sparkles size={14} />
            <span>Sacred features</span>
          </div>
          <h2 className="section-title">
            Wisdom of the Gita, meet <span className="title-accent">modern grace</span>
          </h2>
          <p className="section-subheading">
            Every feature is crafted to hold you in stillness while ancient verses speak to today's questions.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={`feature-card accent-${feature.accent}`}>
                <div className="feature-icon-wrap">
                  <div className="icon-glow" />
                  <Icon className="feature-icon" size={22} strokeWidth={1.75} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="card-shine" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .features-section-container {
          position: relative;
          z-index: 2;
          padding: 80px 0 100px;
          background: transparent;
        }

        .content-wrapper {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ---------------- Header ---------------- */
        .section-header {
          text-align: center;
          margin-bottom: 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: var(--r-full);
          border: 1px solid var(--border-soft);
          background: rgba(245, 200, 120, 0.06);
          color: var(--gold-bright);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 4.2vw, 48px);
          font-weight: 500;
          line-height: 1.18;
          letter-spacing: var(--tracking-tight);
          color: #FBF1DE;
          margin: 0;
          max-width: 740px;
        }
        .title-accent {
          background: linear-gradient(135deg, #FFE4A8 0%, #F5C97A 50%, #E6B85C 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-style: italic;
          font-weight: 600;
        }
        .section-subheading {
          color: var(--text-body);
          font-size: 17px;
          line-height: 1.7;
          max-width: 580px;
          margin: 0;
        }

        /* ---------------- Grid ---------------- */
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .feature-card {
          position: relative;
          padding: 36px 30px;
          background: var(--grad-glass);
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-xl);
          overflow: hidden;
          transition: transform var(--dur-med) var(--ease-out),
                      border-color var(--dur-med) var(--ease-out),
                      box-shadow var(--dur-med) var(--ease-out);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
          opacity: 0.5;
          transition: opacity var(--dur-med) var(--ease-out);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-lg), var(--glow-gold);
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover .card-shine { transform: translateX(180%); }
        .feature-card:hover .icon-glow { opacity: 0.7; transform: scale(1.15); }

        .card-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent 20%, rgba(245, 200, 120, 0.08) 50%, transparent 80%);
          transform: translateX(-120%);
          transition: transform 1000ms var(--ease-out);
          pointer-events: none;
        }

        /* ---------------- Icon ---------------- */
        .feature-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          margin-bottom: 20px;
          border-radius: var(--r-md);
          background: rgba(245, 200, 120, 0.06);
          border: 1px solid var(--border-soft);
        }
        .icon-glow {
          position: absolute;
          inset: -8px;
          border-radius: var(--r-lg);
          background: radial-gradient(circle, rgba(245, 166, 35, 0.4) 0%, transparent 70%);
          filter: blur(16px);
          opacity: 0.4;
          transition: opacity var(--dur-med) var(--ease-out),
                      transform var(--dur-med) var(--ease-out);
          z-index: 0;
        }
        .feature-icon {
          position: relative;
          z-index: 1;
          color: var(--gold-bright);
        }
        .accent-lotus .feature-icon-wrap {
          background: rgba(200, 158, 235, 0.06);
          border-color: rgba(200, 158, 235, 0.18);
        }
        .accent-lotus .icon-glow {
          background: radial-gradient(circle, rgba(200, 158, 235, 0.45) 0%, transparent 70%);
        }
        .accent-lotus .feature-icon { color: var(--lotus); }

        /* ---------------- Text ---------------- */
        .feature-title {
          font-family: var(--font-display);
          font-size: 23px;
          font-weight: 600;
          color: #FBF1DE;
          margin: 0 0 12px;
          letter-spacing: var(--tracking-tight);
          line-height: 1.25;
        }
        .feature-description {
          color: var(--text-body);
          font-size: 15px;
          line-height: 1.7;
          margin: 0;
        }

        /* ---------------- Responsive ---------------- */
        @media (max-width: 960px) {
          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .features-section-container { padding: 60px 0 80px; }
          .content-wrapper { padding: 0 20px; }
          .feature-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .feature-card { padding: 26px 22px; }
          .feature-title { font-size: 20px; }
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;
