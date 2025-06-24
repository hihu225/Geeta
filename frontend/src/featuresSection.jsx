import React, { useState, useEffect } from 'react';

const FeaturesSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const features = [
    {
      icon: '📿',
      title: 'Daily Divine Shlokas',
      description: 'Receive handpicked Bhagavad Gita verses every morning to inspire clarity, peace, and focus.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '🧭',
      title: 'Theme-Based Chat Guidance',
      description: 'Ask questions on karma, purpose, emotions, or success — and get verse-backed answers tailored to your intent.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '🎤',
      title: 'Voice Interaction',
      description: 'Speak your queries aloud and let Geeta GPT reply with spiritual guidance — hands-free and intuitive.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Stay connected with daily spiritual nudges, personalized shloka alerts, and mindfulness reminders.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      icon: '📜',
      title: 'Shloka + Meaning + Translation',
      description: 'Each reply includes the original shloka, its Hindi/English meaning, and spiritual interpretation.',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      icon: '🧪',
      title: 'Guest Mode (Demo Access)',
      description: 'Try the app without signing up — test features, ask questions, and experience the guidance risk-free.',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? features.length - 1 : prevSlide - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const autoSlide = setInterval(nextSlide, 4000);
    return () => clearInterval(autoSlide);
  }, [currentSlide]);

  return (
    <section className="features-section-container">
      {/* Animated background particles */}
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`}></div>
        ))}
      </div>
      
      <div className="content-wrapper">
        <div className="title-container">
          <h2 className="section-title">
            <span className="title-highlight">Sacred</span> Features
          </h2>
          <div className="title-underline"></div>
        </div>
        
        <p className="section-subheading">
          Discover the wisdom of the Gita through modern technology
        </p>

        <div className="carousel-wrapper">
          <div className="carousel-inner" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${index === currentSlide ? 'active' : ''}`}
                style={{
                  '--card-gradient': feature.gradient
                }}
              >
                <div className="card-background"></div>
                <div className="card-content">
                  <div className="feature-icon-container">
                    <div className="icon-glow"></div>
                    <div className="feature-icon">{feature.icon}</div>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <div className="card-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-dots">
          {features.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
              <span className="dot-inner"></span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features-section-container {
          background: linear-gradient(135deg, #fdf5e6 0%, #f4e4bc 50%, #fdf5e6 100%);
          padding: 4rem 1rem;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .background-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          background: rgba(128, 0, 0, 0.1);
          border-radius: 50%;
          animation: float 20s infinite linear;
        }

        .particle-0 { width: 8px; height: 8px; top: 10%; left: 10%; animation-delay: 0s; }
        .particle-1 { width: 12px; height: 12px; top: 20%; left: 80%; animation-delay: 2s; }
        .particle-2 { width: 6px; height: 6px; top: 80%; left: 20%; animation-delay: 4s; }
        .particle-3 { width: 10px; height: 10px; top: 60%; left: 90%; animation-delay: 6s; }
        .particle-4 { width: 14px; height: 14px; top: 30%; left: 60%; animation-delay: 8s; }
        .particle-5 { width: 8px; height: 8px; top: 70%; left: 70%; animation-delay: 10s; }
        .particle-6 { width: 12px; height: 12px; top: 90%; left: 40%; animation-delay: 12s; }
        .particle-7 { width: 6px; height: 6px; top: 40%; left: 30%; animation-delay: 14s; }
        .particle-8 { width: 10px; height: 10px; top: 15%; left: 50%; animation-delay: 16s; }
        .particle-9 { width: 8px; height: 8px; top: 85%; left: 60%; animation-delay: 18s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }

        .content-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
        }

        .title-container {
          margin-bottom: 2rem;
          position: relative;
        }

        .section-title {
          color: #800000;
          font-size: 3.5rem;
          margin-bottom: 1rem;
          font-weight: 800;
          text-shadow: 2px 2px 4px rgba(128, 0, 0, 0.2);
          position: relative;
          display: inline-block;
        }

        .title-highlight {
          background: linear-gradient(135deg, #800000, #cc0000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .title-underline {
          width: 100px;
          height: 4px;
          background: linear-gradient(90deg, #800000, #cc0000, #800000);
          margin: 0 auto;
          border-radius: 2px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50% { transform: scaleX(1.2); opacity: 0.8; }
        }

        .section-subheading {
          color: #694545;
          font-size: 1.3rem;
          margin-bottom: 3rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          font-weight: 400;
          line-height: 1.6;
        }

        .carousel-wrapper {
          position: relative;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .carousel-inner {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
          will-change: transform;
          width: 96%;
        }

        .feature-card {
          min-width: 96%;
          box-sizing: border-box;
          border-radius: 20px;
          padding: 3rem 2rem;
          margin: 0 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transform: scale(0.95);
          transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .feature-card.active {
          transform: scale(1);
        }

        .feature-card:hover {
          transform: scale(1.02) translateY(-8px);
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--card-gradient);
          opacity: 0.1;
          border-radius: 20px;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover .card-background {
          opacity: 0.15;
        }

        .card-content {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.95);
          padding: 2rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .feature-icon-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: var(--card-gradient);
          border-radius: 50%;
          opacity: 0.2;
          filter: blur(20px);
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }

        .feature-icon {
          font-size: 3.5rem;
          position: relative;
          z-index: 3;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .feature-title {
          color: #800000;
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          text-shadow: 1px 1px 2px rgba(128, 0, 0, 0.1);
          position: relative;
        }

        .feature-description {
          color: #333;
          font-size: 1.1rem;
          line-height: 1.7;
          font-weight: 400;
          text-align: center;
        }

        .card-shimmer {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          transform: rotate(45deg);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .carousel-dots {
          margin-top: 3rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .dot {
          height: 16px;
          width: 16px;
          background: rgba(128, 0, 0, 0.3);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .dot-inner {
          width: 8px;
          height: 8px;
          background: transparent;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: linear-gradient(135deg, #800000, #cc0000);
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(128, 0, 0, 0.4);
        }

        .dot.active .dot-inner {
          background: rgba(255, 255, 255, 0.8);
        }

        .dot:hover {
          transform: scale(1.1);
          background: rgba(128, 0, 0, 0.6);
        }

        /* Mobile-first design */
        @media (max-width: 480px) {
          .features-section-container {
            padding: 3rem 1rem;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .section-subheading {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .feature-card {
            padding: 2rem 1.5rem;
            margin: 0 0.5rem;
          }

          .card-content {
            padding: 1.5rem;
          }

          .feature-icon {
            font-size: 3rem;
          }

          .feature-title {
            font-size: 1.6rem;
          }

          .feature-description {
            font-size: 1rem;
          }

          .carousel-dots {
            gap: 0.7rem;
          }

          .dot {
            height: 14px;
            width: 14px;
          }

          .dot-inner {
            width: 6px;
            height: 6px;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;