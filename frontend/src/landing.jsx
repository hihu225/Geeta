import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, MessageCircle, Mic, Bell, Send, Flower } from 'lucide-react';
import { toast } from 'react-toastify';
const GeetaGPTLanding = () => {
   const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: <BookOpen className="feature-icon" />,
      title: "Daily Shlokas",
      description: "Receive profound verses from the Bhagavad Gita every morning to guide your day with ancient wisdom."
    },
    {
      icon: <MessageCircle className="feature-icon" />,
      title: "Chat Themes",
      description: "Explore deep conversations about karma, dharma, purpose, and life's eternal questions with Krishna's guidance."
    },
    {
      icon: <Mic className="feature-icon" />,
      title: "Voice Conversations",
      description: "Speak with your spiritual guide and receive wisdom through natural voice interactions."
    },
    {
      icon: <Bell className="feature-icon" />,
      title: "Mindful Notifications",
      description: "Gentle reminders and inspirational messages to keep you connected to your spiritual journey."
    }
  ];

  const demoMessages = [
    {
      type: 'user',
      text: "What is my dharma?",
      delay: 1000
    },
    {
      type: 'krishna',
      text: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।\nस्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥\n\n\"Better is one's own dharma, though imperfectly performed, than the dharma of another well performed. Death in one's own dharma is better; the dharma of another is fraught with danger.\" Your dharma is your unique path - embrace your authentic nature and duties.",
      delay: 2500
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  // Chat demo animation
  useEffect(() => {
    const showMessages = async () => {
      // Clear messages before starting demo again for clean animation on re-render
      setChatMessages([]);
      for (let i = 0; i < demoMessages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, demoMessages[i].delay));
        setChatMessages(prev => [...prev, demoMessages[i]]);
      }
    };
    showMessages();
  }, []);

  const handleEmailSubmit = (e) => {
    toast.success("Email window opened. We'll get back to you soon!");
  window.location.href = 'mailto:hihu2005use@gmail.com?subject=Geeta GPT - Inquiry&body=Hi, I would like to know more about...';
  };

  const handleStartNow = () => {
    window.location.href = '/signup';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="geeta-gpt-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content-wrapper">
            {/* Left Content */}
            <div className="hero-left-content">
              <div className="hero-tagline">
                <Flower className="flower-icon animate-pulse-custom" />
                <span className="hero-tagline-text">Spiritual Guidance</span>
              </div>
              <h1 className="hero-title">
                Your Personal
                <span className="hero-title-gradient">
                  Krishna Guide
                </span>
              </h1>
              <p className="hero-description">
                Timeless Bhagavad Gita wisdom, whenever you seek it.
              </p>

              <div className="hero-buttons">
                <button
                  onClick={handleStartNow}
                  className="btn btn-primary"
                >
                  Start Your Journey
                </button>
                <button
                  onClick={handleLogin}
                  className="btn btn-secondary"
                >
                  Login
                </button>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="phone-mockup-container">
              <div className="phone-mockup">
                {/* Simulated Notch */}
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="chat-header">
                    <div className="chat-avatar">
                      <Flower className="chat-avatar-icon" />
                    </div>
                    <div>
                      <h3 className="chat-name">Krishna</h3>
                      <p className="chat-status">Your spiritual guide</p>
                    </div>
                  </div>
                  <div className="chat-messages-display custom-scrollbar">
                    {/* Initial message for context */}
                    <div className="chat-message chat-message-krishna initial-message">
                      <p>Welcome! How can I guide you today?</p>
                    </div>
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`chat-message ${message.type === 'user' ? 'chat-message-user' : 'chat-message-krishna'} animate-fade-in-custom`}
                        style={{ animationDelay: `${message.delay / 2}ms` }}
                      >
                        <div
                          className={`chat-bubble ${
                            message.type === 'user'
                              ? 'chat-bubble-user'
                              : 'chat-bubble-krishna'
                          }`}
                        >
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

                  {/* Disabled Input */}
                  <div className="chat-input-area">
                    <div className="chat-input-wrapper">
                      <input
                        type="text"
                        placeholder="Ask Krishna for guidance... (Demo mode)"
                        disabled
                        className="chat-input-field"
                      />
                      <button
                        disabled
                        className="chat-input-send-btn"
                      >
                        <Send className="send-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <div className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Sacred Features</h2>
          <p className="section-description">
            Discover the wisdom of the Gita through modern technology
          </p>
        </div>

        <div className="carousel-container">
          <div className="carousel-track-wrapper">
            <div 
              className="carousel-track"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {features.map((feature, index) => (
                <div key={index} className="carousel-slide">
                  <div className="feature-card">
                    <div className="feature-icon-container">
                      {feature.icon}
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prevSlide}
            className="nav-button nav-button-prev"
            aria-label="Previous feature"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={nextSlide}
            className="nav-button nav-button-next"
            aria-label="Next feature"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dot Indicators */}
          <div className="carousel-indicators">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Feature Grid for larger screens */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="grid-feature-card">
              <div className="grid-feature-icon-container">
                {feature.icon}
              </div>
              <h3 className="grid-feature-title">{feature.title}</h3>
              <p className="grid-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      </div>


      {/* Interactive Chat Demo */}
      <section className="chat-demo-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Experience Divine Conversations</h2>
            <p className="section-description">See how Krishna guides you through life's questions</p>
          </div>

          <div className="chat-demo-mockup">
            {/* Chat Header */}
            <div className="chat-header chat-demo-header">
              <div className="chat-avatar">
                <Flower className="chat-avatar-icon-alt" />
              </div>
              <div>
                <h3 className="chat-name chat-name-alt">Krishna</h3>
                <p className="chat-status chat-status-alt">Your eternal guide</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages-display chat-demo-messages custom-scrollbar">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${message.type === 'user' ? 'chat-message-user' : 'chat-message-krishna'} animate-fade-in-custom`}
                  style={{ animationDelay: `${message.delay / 2}ms` }}
                >
                  <div
                    className={`chat-bubble ${
                      message.type === 'user'
                        ? 'chat-bubble-user'
                        : 'chat-bubble-krishna'
                    }`}
                  >
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

            {/* Disabled Input */}
            <div className="chat-input-area chat-demo-input-area">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Ask Krishna for guidance... (Demo mode)"
                  disabled
                  className="chat-input-field chat-input-field-alt"
                />
                <button
                  disabled
                  className="chat-input-send-btn chat-input-send-btn-alt"
                >
                  <Send className="send-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Begin Your Spiritual Journey</h2>
          <p className="cta-description">Join thousands who have found peace and purpose through eternal wisdom</p>

          <div className="cta-content">
            <button
              onClick={handleStartNow}
              className="btn btn-cta"
            >
              Embark Now
            </button>

            <div className="inquiry-form-wrapper">
              <p className="inquiry-text">Have questions? Send us an inquiry</p>
              <form onSubmit={handleEmailSubmit} className="inquiry-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="inquiry-input"
                />
                <button
                  type="submit"
                  className="inquiry-submit-btn"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Add this to ensure consistent box model behavior */
        html {
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: inherit;
        }

        /* Overall HTML/Body for Laptop View */

/* Base Styles (apply to all unless overridden by media queries) */
.geeta-gpt-landing {
  min-height: 100vh;
  font-family: sans-serif;
  color: #1a202c; /* gray-900 */
  background: linear-gradient(to bottom right, #fffdf8, #fffdfa, #fff9f9); /* from-orange-50 via-amber-50 to-red-50 */
  overflow: hidden;
  width: 100vw;
}



.section-header {
  text-align: center;
  margin-bottom: 3rem; /* mb-12 */
}

.section-title {
  font-size: 2.25rem; /* text-3xl */
  font-weight: 700; /* font-bold */
  color: #1a202c; /* gray-900 */
  margin-bottom: 1rem; /* mb-4 */
}

.section-description {
  font-size: 1.125rem; /* text-lg */
  color: #4a5568; /* gray-600 */
}

/* --- Buttons --- */
.btn {
  padding: 1rem 2rem; /* px-8 py-4 */
  font-weight: 600; /* font-semibold */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
  transition: all 0.3s ease-in-out; /* transition-all duration-300 */
  outline: none; /* focus:outline-none */
  cursor: pointer;
}

.btn:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); /* hover:shadow-xl */
  transform: scale(1.05); /* transform hover:scale-105 */
}

.btn:focus {
  box-shadow: 0 0 0 4px rgba(253, 230, 138, 0.5); /* focus:ring-4 focus:ring-amber-300 */
}

.btn-primary {
  background: linear-gradient(to right, #d97706, #dc2626); /* from-amber-600 to-red-600 */
  color: #fff; /* text-white */
}

.btn-secondary {
  border: 2px solid #d97706; /* border-2 border-amber-600 */
  color: #b45309; /* text-amber-700 */
  background-color: transparent;
}

.btn-secondary:hover {
  background-color: #fffdf8; /* hover:bg-amber-50 */
}

/* --- Hero Section --- */
.hero-section {
  position: relative;
  padding-top: 4rem; /* py-16 */
  padding-bottom: 4rem; /* py-16 */
}

.hero-content-wrapper {
  display: grid;
  gap: 3rem; /* gap-12 */
  align-items: center;
}

.hero-left-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem; /* space-y-8 */
}

.hero-tagline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* gap-2 */
  color: #b45309; /* text-amber-700 */
}

.flower-icon {
  width: 1.5rem; /* w-6 */
  height: 1.5rem; /* h-6 */
}

.animate-pulse-custom {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.hero-tagline-text {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  letter-spacing: 0.05em; /* tracking-wider */
  text-transform: uppercase;
}

.hero-title {
  font-size: 3rem; /* text-5xl */
  font-weight: 800; /* font-extrabold */
  color: #1a202c; /* gray-900 */
  line-height: 1.25; /* leading-tight */
  margin-bottom: 1rem; /* space-y-4 */
}

.hero-title-gradient {
  display: block;
  color: transparent;
  background-clip: text;
  background-image: linear-gradient(to right, #d97706, #dc2626); /* bg-gradient-to-r from-amber-600 to-red-600 */
}

.hero-description {
  font-size: 1.125rem; /* text-lg */
  color: #4a5568; /* gray-700 */
  line-height: 1.625; /* leading-relaxed */
  max-width: 28rem; /* max-w-xl */
  margin-left: auto; /* mx-auto */
  margin-right: auto; /* mx-auto */
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* gap-4 */
  justify-content: center;
}

/* --- Phone Mockup --- */
.phone-mockup-container {
  position: relative;
  display: flex;
  justify-content: center;
}

.phone-mockup {
  position: relative;
  width: 18rem; /* w-72 */
  height: 26.25rem; /* h-[420px] */
  background-color: #1a202c; /* bg-gray-900 */
  border-radius: 1.5rem; /* rounded-3xl */
  padding: 0.75rem; /* p-3 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
  transform: rotate(3deg); /* transform rotate-3 */
  transition: transform 0.5s ease-in-out; /* transition-transform duration-500 ease-in-out */
}

.phone-mockup:hover {
  transform: rotate(0deg); /* hover:rotate-0 */
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6rem; /* w-24 */
  height: 1.25rem; /* h-5 */
  background-color: #2d3748; /* bg-gray-800 */
  border-bottom-left-radius: 0.5rem; /* rounded-b-lg */
  border-bottom-right-radius: 0.5rem; /* rounded-b-lg */
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom right, #fffdf8, #fff9f9); /* from-amber-50 to-red-50 */
  border-radius: 1rem; /* rounded-2xl */
  padding: 1rem; /* p-4 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 */
  padding-bottom: 0.75rem; /* pb-3 */
  border-bottom: 1px solid #fbd38d; /* border-b border-amber-200 */
}

.chat-avatar {
  width: 2.5rem; /* w-10 */
  height: 2.5rem; /* h-10 */
  background: linear-gradient(to bottom right, #d97706, #dc2626); /* from-amber-600 to-red-600 */
  border-radius: 9999px; /* rounded-full */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
}

.chat-avatar-icon {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  color: #fff; /* text-white */
}

.chat-name {
  font-weight: 600; /* font-semibold */
  color: #1a202c; /* gray-900 */
}

.chat-status {
  font-size: 0.75rem; /* text-xs */
  color: #4a5568; /* gray-600 */
}

.chat-messages-display {
  flex: 1; /* flex-1 */
  overflow-y: auto;
  margin-top: 1rem; /* mt-4 */
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* space-y-3 */
}

/* Initial message styling for consistency */
.chat-message.initial-message {
  justify-content: flex-start;
}

.chat-message.initial-message .chat-bubble {
  background-color: #fff; /* bg-white */
  border-radius: 1rem; /* rounded-2xl */
  padding: 0.75rem; /* p-3 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
}

.chat-message.initial-message p {
  font-size: 0.875rem; /* text-sm */
  color: #2d3748; /* gray-800 */
}

.chat-message {
  display: flex;
}

.chat-message-user {
  justify-content: flex-end; /* justify-end */
}

.chat-message-krishna {
  justify-content: flex-start; /* justify-start */
}

.chat-bubble {
  max-width: 75%; /* max-w-[75%] */
  padding: 0.75rem 1rem; /* px-4 py-3 */
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
}

.chat-bubble-user {
  background-color: #fefcbf; /* bg-amber-100 */
  color: #2d3748; /* text-gray-800 */
}

.chat-bubble-krishna {
  background-color: #f7fafc; /* bg-gray-100 */
  color: #2d3748; /* text-gray-800 */
}

.shloka-header {
  color: #b45309; /* text-amber-700 */
  font-weight: 500; /* font-medium */
  font-size: 0.75rem; /* text-xs */
  margin-bottom: 0.5rem; /* mb-2 */
  border-bottom: 1px solid #fbd38d; /* border-b border-amber-200 */
  padding-bottom: 0.5rem; /* pb-2 */
}

.shloka-text {
  font-size: 0.875rem; /* text-sm */
  line-height: 1.625; /* leading-relaxed */
  white-space: pre-line;
}

.chat-input-area {
  padding-top: 1rem; /* pt-4 */
  border-top: 1px solid #e2e8f0; /* border-t border-gray-200 */
  background-color: transparent;
}

.chat-input-wrapper {
  display: flex;
  gap: 0.5rem; /* gap-2 */
}

.chat-input-field {
  flex: 1; /* flex-1 */
  padding: 0.75rem 1rem; /* px-4 py-3 */
  border: 1px solid #cbd5e0; /* border border-gray-300 */
  border-radius: 0.75rem; /* rounded-xl */
  background-color: #f7fafc; /* bg-gray-100 */
  color: #a0aec0; /* text-gray-500 */
  cursor: not-allowed;
  font-size: 0.875rem; /* text-sm */
}

.chat-input-field::placeholder {
  color: #a0aec0; /* text-gray-500 */
}

.chat-input-send-btn {
  padding: 0.75rem 1rem; /* px-4 py-3 */
  background-color: #cbd5e0; /* bg-gray-300 */
  color: #a0aec0; /* text-gray-500 */
  border-radius: 0.75rem; /* rounded-xl */
  cursor: not-allowed;
}

.send-icon {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
}

/* --- Features Carousel --- */
.features-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #fef7e0 0%, #fff8f0 100%);
          position: relative;
          overflow: hidden;
        }

        .features-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(251, 146, 60, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .container {
          width: 100%;
          margin: 0 auto;
          padding: 0 1rem;
          position: relative;
          z-index: 1;
          justify-content: center;
          align-items: center;
          display: flex;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #b45309, #d97706);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-description {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Carousel for mobile/tablet */
        .carousel-container {
          position: relative;
          display: block; 
        }

        .carousel-track-wrapper {
          overflow: hidden;
          border-radius: 1rem;
        }

        .carousel-track {
          display: flex;
          width: ${features.length * 90}%;
        }

        .carousel-slide {
          flex: 0 0 100%;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          max-width: 1200px; 
          min-height: 320px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .feature-icon-container {
          width: 4.5rem;
          height: 4.5rem;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          box-shadow: 0 10px 20px rgba(251, 191, 36, 0.3);
        }

        .feature-icon {
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #4b5563;
          line-height: 1.7;
          font-size: 1rem;
        }

        /* Navigation Buttons */
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 3rem;
          height: 3rem;
          background: white;
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .nav-button:hover {
          background: #fbbf24;
          color: white;
          border-color: #fbbf24;
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
        }

        .nav-button-prev {
          left: -1.5rem;
        }

        .nav-button-next {
          right: -1.5rem;
        }

        /* Indicators */
        .carousel-indicators {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          gap: 0.75rem;
        }

        .indicator-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          border: none;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator-dot.active {
          background: #f59e0b;
          transform: scale(1.2);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
        }

        /* Grid for larger screens */
        .features-grid {
          display: none; /* Hidden by default for smaller screens */
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .grid-feature-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .grid-feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .grid-feature-icon-container {
          width: 4.5rem;
          height: 4.5rem;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          box-shadow: 0 10px 20px rgba(251, 191, 36, 0.3);
        }

        .grid-feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 1rem;
        }

        .grid-feature-description {
          color: #4b5563;
          line-height: 1.7;
          font-size: 1rem;
        }


/* --- Interactive Chat Demo --- */
.chat-demo-section {
  padding-top: 4rem; /* py-16 */
  padding-bottom: 4rem; /* py-16 */
  background: linear-gradient(to bottom right, #fffdf8, #fff9f9); /* from-amber-50 to-red-50 */
}

.chat-demo-mockup {
  background-color: #fff; /* bg-white */
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
  overflow: hidden;
  max-width: 24rem; /* max-w-sm */
  margin-left: auto; /* mx-auto */
  margin-right: auto; /* mx-auto */
}

.chat-demo-header {
  background: linear-gradient(to right, #d97706, #dc2626); /* from-amber-600 to-red-600 */
  padding: 1rem; /* p-4 */
}

.chat-avatar-icon-alt {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  color: #d97706; /* text-amber-600 */
}

.chat-name-alt {
  color: #fff; /* text-white */
  font-size: 1.125rem; /* text-lg */
}

.chat-status-alt {
  color: #fefcbf; /* text-amber-100 */
  font-size: 0.875rem; /* text-sm */
}

.chat-demo-messages {
  padding: 1rem; /* p-4 */
  display: flex;
  flex-direction: column;
  gap: 1rem; /* space-y-4 */
  min-height: 24rem; /* min-h-96 */
  max-height: 31.25rem; /* max-h-[500px] */
}

.chat-demo-messages .chat-bubble {
  max-width: 80%; /* max-w-[80%] */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow */
}

.chat-demo-input-area {
  padding: 1rem; /* p-4 */
  border-top: 1px solid #e2e8f0; /* border-t border-gray-200 */
  background-color: #f7fafc; /* bg-gray-50 */
}

.chat-input-field-alt {
  background-color: #f7fafc; /* bg-gray-100 */
  color: #a0aec0; /* text-gray-500 */
}

.chat-input-send-btn-alt {
  background-color: #cbd5e0; /* bg-gray-300 */
  color: #a0aec0; /* text-gray-500 */
}

/* --- Call to Action --- */
.cta-section {
  padding-top: 4rem; /* py-16 */
  padding-bottom: 4rem; /* py-16 */
  background-color: #1a202c; /* bg-gray-900 */
}

.cta-section .container {
  text-align: center;
  max-width: 28rem; /* max-w-4xl */
}

.cta-title {
  font-size: 2.25rem; /* text-3xl */
  font-weight: 700; /* font-bold */
  color: #fff; /* text-white */
  margin-bottom: 1rem; /* mb-4 */
}

.cta-description {
  font-size: 1.125rem; /* text-lg */
  color: #a0aec0; /* gray-300 */
  margin-bottom: 2rem; /* mb-8 */
}

.cta-content {
  display: flex;
  flex-direction: column;
  gap: 2rem; /* space-y-8 */
}

.btn-cta {
  padding: 1rem 3rem; /* px-12 py-4 */
  font-size: 1.125rem; /* text-lg */
  background: linear-gradient(to right, #d97706, #dc2626); /* from-amber-600 to-red-600 */
  color: #fff; /* text-white */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
  transition: all 0.3s ease-in-out; /* transition-all duration-300 */
  cursor: pointer;
}

.btn-cta:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); /* hover:shadow-xl */
  transform: scale(1.05); /* hover:scale-105 */
}

.btn-cta:focus {
  box-shadow: 0 0 0 4px rgba(253, 230, 138, 0.5); /* focus:ring-4 focus:ring-amber-300 */
}

.inquiry-form-wrapper {
  max-width: 28rem; /* max-w-md */
  margin-left: auto; /* mx-auto */
  margin-right: auto; /* mx-auto */
}

.inquiry-text {
  color: #a0aec0; /* gray-400 */
  margin-bottom: 1rem; /* mb-4 */
}

.inquiry-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* gap-4 */
}

.inquiry-input {
  flex: 1; /* flex-1 */
  padding: 0.75rem 1rem; /* px-4 py-3 */
  border-radius: 0.75rem; /* rounded-xl */
  border: 1px solid #4a5568; /* border border-gray-600 */
  background-color: #2d3748; /* bg-gray-800 */
  color: #fff; /* text-white */
  font-size: 1rem;
  outline: none; /* focus:outline-none */
}

.inquiry-input::placeholder {
  color: #a0aec0; /* placeholder-gray-400 */
}

.inquiry-input:focus {
  box-shadow: 0 0 0 2px rgba(237, 137, 45, 0.5); /* focus:ring-2 focus:ring-amber-500 */
}

.inquiry-submit-btn {
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  background-color: #d97706; /* bg-amber-600 */
  color: #fff; /* text-white */
  border-radius: 0.75rem; /* rounded-xl */
  transition: background-color 0.3s ease-in-out; /* transition-colors duration-300 */
  outline: none; /* focus:outline-none */
  cursor: pointer;
}

.inquiry-submit-btn:hover {
  background-color: #b45309; /* hover:bg-amber-700 */
}

.inquiry-submit-btn:focus {
  box-shadow: 0 0 0 4px rgba(237, 137, 45, 0.5); /* focus:ring-4 focus:ring-amber-500 */
}

/* --- Animations --- */
@keyframes fade-in-custom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-custom {
  animation: fade-in-custom 0.6s ease-out forwards;
}

/* Custom scrollbar for chat demo */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d4a762; /* Amber shade */
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #c09152; /* Darker amber on hover */
}
@media (max-width: 480px) {
    .features-section {
      padding: 2rem 1rem; 
      width: 100%;
    }
  .feature-card {
    padding: 1rem;
    min-height: 280px; 
    max-width: 600px;
      }
    .container{
      width: 100%;
      padding: 0 1rem;
      }
      }
      `}</style>
    </div>
  );
};

export default GeetaGPTLanding;