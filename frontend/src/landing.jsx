import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, MessageCircle, Mic, Bell, Send, Flower } from 'lucide-react';
import { toast } from 'react-toastify';
import FeaturesSection from './featuresSection';
import {motion} from 'framer-motion';
const GeetaGPTLanding = () => {
   const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [email, setEmail] = useState('');
  const pageVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
  const support = () => {
    window.location.href = 'mailto:hihu2005ag@gmail.com?subject=Geeta GPT - Inquiry&body=Hi, I would like to know more about...';
  };
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
    text: "How can I find peace in life?",
    delay: 1000
  },
  {
    type: 'krishna',
    text: "विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः।\nनिर्ममो निरहंकारः स शांतिमधिगच्छति॥\n\n\"One who abandons all desires and moves about without longing, without the sense of 'mine' or ego, attains peace.\" Let go of attachments and ego — that is the path to inner peace.",
    delay: 2500
  },
  {
    type: 'user',
    text: "Why should I not fear challenges?",
    delay: 1000
  },
  {
    type: 'krishna',
    text: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ।\nततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि॥\n\n\"Treat pleasure and pain, gain and loss, victory and defeat the same, and then engage in your duty. In this way, you will not incur sin.\" Face challenges with balance — rise above fear by focusing on your duty, not the outcome.",
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

  const handleStartNow = () => {
    window.location.href = '/signup';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
    <div className="geeta-gpt-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className=".cta-container">
          
            {/* Left Content */}
            <div className="hero-left-content">
              <div className="hero-tagline">
                <Flower className="flower-icon animate-pulse-custom" />
                <span className="hero-tagline-text">Spiritual Guidance Chatbot</span>
              </div>
<iframe src="/custom-page.html" style={{ width: '100%', height: '100vh', border: 'none' }} />
<div className="hero-content-wrapper">

<h1 className="hero-title">
  Your Personal
  <span className="hero-title-gradient">Krishna Guide</span>
</h1>
              <p className="hero-description">
                Where ancient wisdom meets modern technology.<br/>
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
                        placeholder="Ask Krishna for guidance... (Demo here)"
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
      <FeaturesSection/>


      {/* Interactive Chat Demo */}
      <section className="chat-demo-section">
        <div className=".cta-container">
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
          <p className="section-description2">
  Seek more in our app — join us now and start your journey.
  <br />
  <span className="spiritual-line">श्रीकृष्णः सदा सहायते।</span>
</p>

        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
  <div className="cta-container">
    <h2 className="cta-title">Begin Your Spiritual Journey</h2>
    <p className="cta-description">
      Join thousands who have found peace and purpose through eternal wisdom
    </p>

    <div className="cta-content">
      <button onClick={handleStartNow} className="btn btn-cta">
        Embark Now
      </button>

      <div className="inquiry-form-wrapper">
  <p className="inquiry-text">Have questions? Send us an inquiry</p>
  <button onClick={support} type="button" className="inquiry-link-btn">
    Email Us
  </button>
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
  .section-description2 {
  font-size: 1.125rem; /* text-lg */
  color: #4a5568; /* gray-600 */
  text-align: center;
  margin-top: 4rem; /* mt-4 */
}
.spiritual-line {
  font-style: italic;
  color: #fb923c; /* spiritual orange */
  font-weight: 500;
  display: block;
  margin-top: 0.5rem;
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
  padding: 0 2rem; 
}

.hero-left-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem; /* space-y-8 */
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
  font-size: 1rem; /* text-sm */
  font-weight: 600; /* font-medium */
  letter-spacing: 0.05em; /* tracking-wider */
  text-transform: uppercase;
}

.hero-title {
  font-size: 2.5rem; /* text-5xl */
  font-weight: 800; /* font-extrabold */
  color:rgb(94, 96, 100); /* gray-900 */
  line-height: 1.25; /* leading-tight */
  margin-bottom: 1rem; /* space-y-4 */
  margin-top: 0; /* mt-0 */
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
  width: 100%;
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
  background: linear-gradient(135deg, #fff8e1, #fff5db);
  padding: 3rem 1rem;
  text-align: center;
}

.cta-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.cta-title {
  font-size: 2rem;
  font-weight: bold;
  color: #7c2d12;
  margin-bottom: 1rem;
}


.cta-description {
  color: #4b5563;
  margin-bottom: 2rem;
  font-size: 1.125rem;
}

.cta-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.btn-cta {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
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

.inquiry-link-btn {
  background: none;
  border: none;
  padding: 0;
  color: #fb923c;
  text-decoration: underline;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  outline: none; /* Removes the default focus outline */
  -webkit-tap-highlight-color: transparent; /* Removes tap highlight on mobile */
}
.inquiry-link-btn:hover {
  color: #f97316;
  text-decoration: none;
}
.inquiry-link-btn:focus {
  outline: none;
  box-shadow: none; /* Prevents any default focus ring */
}
.inquiry-link-btn:focus-visible {
  outline: 2px dashed #fb923c;
  outline-offset: 2px;
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
      padding: 1rem 1rem;
      }
      .cta-title {
        color: #1a202c; /* gray-900 */
        font-size: 1.5rem; /* text-2xl */
      }
        .hero-title {
          font-size: 1.875rem; /* text-4xl */
          line-height: 1.25; /* leading-tight */
        }
      `}</style>
    </div>
    </motion.div>
  );
};

export default GeetaGPTLanding;