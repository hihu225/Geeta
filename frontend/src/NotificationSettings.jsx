import React, { useState, useEffect, useContext } from 'react';
import { Bell, Clock, Globe, Book, CheckCircle, XCircle, ArrowLeft, Sunrise, Moon, Star, Heart, ChevronDown, ChevronUp, Info, Sparkles, ArrowRight, Sun } from 'lucide-react';
import { backend_url } from './utils/backend';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FCMToken from './FCMToken';
import { UserContext } from "./UserContext.jsx";
import { ThemeContext } from './ThemeContext.jsx';

// Auth is applied globally in Layout.jsx via axios.defaults.headers.common["Authorization"],
// so components no longer need to read the token themselves.
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    time: "09:00",
    timezone: "Asia/Kolkata",
    language: "english",
    quoteType: "random",
  });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getISTGreeting = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = istTime.getUTCHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const timezones = [
    { value: "Asia/Kolkata", label: "India (IST)", flag: "🇮🇳" },
    { value: "America/New_York", label: "New York (EST)", flag: "🇺🇸" },
    { value: "Europe/London", label: "London (GMT)", flag: "🇬🇧" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)", flag: "🇯🇵" },
    { value: "Australia/Sydney", label: "Sydney (AEDT)", flag: "🇦🇺" },
  ];

  const languages = [
    {
      value: "english",
      label: "English",
      icon: "🇬🇧",
      sample: "You have the right to perform your actions, but you are not entitled to the fruits of those actions.",
      description: "Classic translations with deep meaning"
    },
    {
      value: "hindi",
      label: "हिंदी",
      icon: "🇮🇳",
      sample: "तुम्हारा अधिकार केवल कर्म करने में है, फलों में कभी नहीं।",
      description: "Heart language with cultural context"
    },
    {
      value: "sanskrit",
      label: "संस्कृत",
      icon: "🕉️",
      sample: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
      description: "Original divine verses in their pure form"
    },
  ];

  const quoteTypes = [
    {
      value: "random",
      label: "Divine Surprise",
      description: "Let Krishna choose the perfect verse for your soul",
      icon: <Star className="ns-icon" />,
      benefits: ["Unexpected wisdom", "Serendipitous guidance", "Fresh perspectives daily"]
    },
    {
      value: "sequential",
      label: "Sacred Journey",
      description: "Walk through the Gita systematically, verse by verse",
      icon: <Sunrise className="ns-icon" />,
      benefits: ["Complete understanding", "Structured learning", "Progressive wisdom"]
    },
    {
      value: "themed",
      label: "Life Guidance",
      description: "Receive wisdom tailored to life's daily challenges",
      icon: <Heart className="ns-icon" />,
      benefits: ["Practical wisdom", "Relevant guidance", "Contextual support"]
    },
  ];

  useEffect(() => {
    fetchPreferences();
    FCMToken();
    setTimeout(() => setIsInitialLoad(false), 1000);
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/notifications/preferences`);
      const data = response.data;
      if (data.success) {
        const preferences = {
          enabled: data.preferences.dailyQuotes?.enabled || false,
          time: data.preferences.dailyQuotes?.time || '09:00',
          timezone: data.preferences.dailyQuotes?.timezone || 'Asia/Kolkata',
          language: data.preferences.preferences?.language || 'english',
          quoteType: data.preferences.preferences?.quoteType || 'random'
        };
        setSettings(preferences);
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setMessage("Failed to load settings. Please refresh the page.");
      setMessageType("error");
    }
  };

  const updatePreferences = async (newSettings) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${backend_url}/api/notifications/preferences`,
        newSettings
      );
      const data = response.data;
      if (data.success) {
        setMessage("🙏 Settings updated successfully! Krishna's wisdom will reach you as configured.");
        setMessageType("success");
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        localStorage.setItem('notificationPreferences', JSON.stringify(updatedSettings));
      } else {
        setMessage("Failed to update settings. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error updating settings. Please check your connection.");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleToggle = () => {
    const newEnabled = !settings.enabled;
    updatePreferences({ enabled: newEnabled });
    if (newEnabled) {
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 4000);
    }
  };

  const handleTimeChange = (time) => {
    updatePreferences({ time });
  };

  const handleChange = (field, value) => {
    updatePreferences({ [field]: value });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getTimeGreeting = () => {
    if (!settings.time) return { icon: <Clock className="ns-icon" />, text: "Set Time", description: "Choose when to receive wisdom." };
    const hour = parseInt(settings.time.split(':')[0]);
    if (hour < 6) return {
      icon: <Moon className="ns-icon" />,
      text: "Midnight Meditation",
      description: "Perfect for deep contemplation and inner peace"
    };
    if (hour < 12) return {
      icon: <Sunrise className="ns-icon" />,
      text: "Morning Prayers",
      description: "Start your day with divine wisdom and clarity"
    };
    if (hour < 18) return {
      icon: <Sun className="ns-icon" />,
      text: "Afternoon Reflection",
      description: "Midday guidance for life's decisions"
    };
    return {
      icon: <Moon className="ns-icon" />,
      text: "Evening Contemplation",
      description: "End your day with spiritual reflection"
    };
  };

  const timeGreeting = getTimeGreeting();
  const currentLanguage = languages.find(lang => lang.value === settings.language);
  const currentQuoteType = quoteTypes.find(type => type.value === settings.quoteType);

  return (
    <div className="ns-page">
      <div className="ns-bg-elements">
        <div className="ns-orb ns-orb-1"></div>
        <div className="ns-orb ns-orb-2"></div>
        <div className="ns-orb ns-orb-3"></div>
        <div className="ns-om">🕉️</div>
        <div className="ns-lotus">🪷</div>
      </div>

      <div className="ns-content">
        <div className="ns-header">
          <div className="ns-back-wrap">
            <button onClick={handleBack} className="ns-back-btn">
              <ArrowLeft size={16} />
              Back to Settings
            </button>
          </div>

          <div className="ns-bell-badge">
            <Bell className="ns-bell-badge-icon" />
          </div>

          <h1 className="ns-title">Daily Divine Wisdom</h1>
        </div>

        <div className="ns-greeting-card glass-card">
          <p className="ns-greeting-text">
            {getISTGreeting()},{" "}
            {(user?.email?.endsWith("@example.com"))
              ? "spiritual seeker"
              : (user?.name || "seeker of wisdom")}
            ! 🙏
          </p>
          <p className="ns-sanskrit">यदा यदा हि धर्मस्य ग्लानिर्भवति भारत</p>
          <p className="ns-translation">"Whenever dharma declines, I manifest myself"</p>
        </div>

        {showPreview && (
          <div className="ns-preview animate-fade-in-up">
            <div className="ns-preview-card">
              <div className="ns-preview-icon">
                <Sparkles className="ns-icon" />
              </div>
              <div>
                <p className="ns-preview-title">Notification Preview</p>
                <p className="ns-preview-text">You'll receive your daily wisdom like this!</p>
              </div>
            </div>
          </div>
        )}

        <div className="ns-settings-card glass-card">
          <div className="ns-settings-header">
            <div className="ns-settings-header-content">
              <div className="ns-settings-header-icon">
                <Bell className="ns-settings-header-bell" />
              </div>
              <div>
                <h2 className="ns-settings-title">Sacred Notifications</h2>
                <p className="ns-settings-subtitle">Receive Krishna's teachings daily</p>
              </div>
            </div>
            <div className="ns-status">
              <p className="ns-status-label">Status</p>
              <p className="ns-status-value">
                {settings.enabled ? "🟢 Active" : "⚪ Inactive"}
              </p>
            </div>
          </div>

          <div className="ns-body">
            {message && (
              <div
                key={message}
                className={`ns-message ${messageType === "success" ? "ns-message-success" : "ns-message-error"}`}
              >
                <div className="ns-message-icon">
                  {messageType === "success" ? (
                    <CheckCircle className="ns-icon animate-pop-in" />
                  ) : (
                    <XCircle className="ns-icon animate-pop-in" />
                  )}
                </div>
                <span className="ns-message-text">{message}</span>
              </div>
            )}

            <div className="ns-sections">
              <div className="ns-section ns-toggle-section">
                <div className="ns-toggle-content">
                  <div className={`ns-toggle-icon-wrap ${settings.enabled ? 'is-active' : ''}`}>
                    <Bell className="ns-toggle-bell" />
                  </div>
                  <div>
                    <h3 className="ns-setting-title">Daily Gita Wisdom</h3>
                    <p className="ns-setting-desc">Let Krishna's eternal wisdom guide your day</p>
                    {settings.enabled && (
                      <div className="ns-status-active">
                        <div className="ns-status-dot"></div>
                        <span className="ns-status-active-text">Active • Next delivery at {settings.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className={`ns-switch ${settings.enabled ? "is-active" : ""} ${loading ? "is-loading" : ""}`}
                  aria-label="Toggle notifications"
                >
                  <span className={`ns-switch-thumb ${settings.enabled ? "is-active" : ""}`}></span>
                </button>
              </div>

              {settings.enabled && (
                <div className="ns-enabled-container animate-fade-in">
                  <div className="ns-info-box">
                    <Info className="ns-icon" />
                    <span>Your personalized wisdom will be delivered in <strong>{currentLanguage?.label}</strong> via <strong>{currentQuoteType?.label}</strong> method</span>
                  </div>

                  <div className="ns-section">
                    <div className="ns-section-label">
                      <div className="ns-section-icon">{timeGreeting.icon}</div>
                      <div className="ns-section-label-text">
                        <span className="ns-section-label-title">{timeGreeting.text}</span>
                        <p className="ns-section-label-desc">{timeGreeting.description}</p>
                      </div>
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
                        className="ns-expand-btn"
                        aria-label="Expand time info"
                      >
                        {expandedSection === 'time' ? <ChevronUp className="ns-icon" /> : <ChevronDown className="ns-icon" />}
                      </button>
                    </div>
                    <div className="ns-input-wrap">
                      <input
                        type="time"
                        value={settings.time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="ns-input"
                      />
                      <Clock className="ns-input-icon" />
                    </div>
                    {expandedSection === 'time' && (
                      <div className="ns-expanded animate-fade-in">
                        <h4 className="ns-expanded-title">✨ Perfect Times for Spiritual Nourishment</h4>
                        <div className="ns-grid-2">
                          <div className="ns-grid-item"><Sunrise className="ns-icon" /><span><strong>5-7 AM:</strong> Morning meditation</span></div>
                          <div className="ns-grid-item"><Star className="ns-icon" /><span><strong>12-2 PM:</strong> Midday reflection</span></div>
                          <div className="ns-grid-item"><Moon className="ns-icon" /><span><strong>6-8 PM:</strong> Evening contemplation</span></div>
                          <div className="ns-grid-item"><Heart className="ns-icon" /><span><strong>9-10 PM:</strong> Bedtime peace</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ns-section">
                    <div className="ns-section-label">
                      <div className="ns-section-icon"><Globe className="ns-icon" /></div>
                      <span className="ns-section-label-title">Your Sacred Time Zone</span>
                    </div>
                    <div className="ns-input-wrap">
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleChange("timezone", e.target.value)}
                        className="ns-input ns-select"
                      >
                        {timezones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.flag} {tz.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="ns-input-icon" />
                    </div>
                  </div>

                  <div className="ns-section">
                    <label className="ns-section-label">
                      <div className="ns-section-icon"><Book className="ns-icon" /></div>
                      <span className="ns-section-label-title">Sacred Language</span>
                    </label>
                    <div className="ns-lang-grid">
                      {languages.map((lang) => (
                        <label
                          key={lang.value}
                          className={`ns-lang-option ${settings.language === lang.value ? "is-selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="language"
                            value={lang.value}
                            checked={settings.language === lang.value}
                            onChange={(e) => handleChange("language", e.target.value)}
                            className="ns-sr-only"
                          />
                          <div className="ns-lang-content">
                            <span className="ns-lang-icon">{lang.icon}</span>
                            <div className="ns-lang-details">
                              <div className="ns-lang-name-row">
                                <span className="ns-lang-name">{lang.label}</span>
                                {settings.language === lang.value && (<CheckCircle className="ns-icon ns-check" />)}
                              </div>
                              <p className="ns-lang-desc">{lang.description}</p>
                            </div>
                          </div>
                          <div className="ns-lang-sample">
                            <p className="ns-lang-sample-text">"{lang.sample}"</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ns-section">
                    <label className="ns-section-label-title">Choose Your Spiritual Path</label>
                    <div className="ns-quote-grid">
                      {quoteTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`ns-quote-option ${settings.quoteType === type.value ? "is-selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="quoteType"
                            value={type.value}
                            checked={settings.quoteType === type.value}
                            onChange={(e) => handleChange("quoteType", e.target.value)}
                            className="ns-sr-only"
                          />
                          <div className="ns-quote-content">
                            <div className="ns-quote-icon-wrap">
                              {type.icon}
                            </div>
                            <div className="ns-quote-details">
                              <div className="ns-quote-name-row">
                                <h4 className="ns-quote-name">{type.label}</h4>
                                {settings.quoteType === type.value && (
                                  <div className="ns-quote-selected-indicator">
                                    <CheckCircle className="ns-icon ns-check" />
                                    <span className="ns-quote-selected-text">Selected</span>
                                  </div>
                                )}
                              </div>
                              <p className="ns-quote-desc">{type.description}</p>
                              <div className="ns-quote-benefits">
                                <p className="ns-quote-benefits-title">Benefits:</p>
                                {type.benefits.map((benefit, index) => (
                                  <div key={index} className="ns-quote-benefit">
                                    <ArrowRight className="ns-icon" />
                                    <span>{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {settings.quoteType === type.value && (
                            <div className="ns-quote-dot"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ns-footer">
            <div className="ns-footer-content">
              <div className="ns-footer-om-wrap">
                <span className="ns-footer-om">🕉️</span>
              </div>
              <div className="ns-footer-text">
                <p className="ns-footer-sanskrit">"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"</p>
                <p className="ns-footer-translation">
                  You have the right to perform your actions, but never to the fruits of action
                </p>
              </div>
            </div>
            {settings.enabled && (
              <div className="ns-footer-info animate-fade-in">
                <p className="ns-footer-info-text">
                  🙏 Your next divine message will arrive at <strong>{settings.time}</strong> in <strong>{currentLanguage?.label}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ns-page {
          min-height: 100vh;
          width: 100%;
          background: var(--grad-bg);
          padding: 2rem 1.25rem;
          position: relative;
          overflow-x: hidden;
          font-family: var(--font-body);
          color: var(--text-body);
          box-sizing: border-box;
        }

        .ns-bg-elements {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .ns-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: ns-drift 60s infinite linear alternate;
        }
        .ns-orb-1 {
          width: 340px; height: 340px;
          top: 5%; left: 8%;
          background: radial-gradient(circle, var(--saffron) 0%, transparent 70%);
        }
        .ns-orb-2 {
          width: 280px; height: 280px;
          top: 55%; right: 6%;
          background: radial-gradient(circle, var(--gold) 0%, transparent 70%);
          animation-delay: -20s;
        }
        .ns-orb-3 {
          width: 220px; height: 220px;
          top: 30%; left: 45%;
          background: radial-gradient(circle, var(--lotus) 0%, transparent 70%);
          animation-delay: -40s;
          opacity: 0.22;
        }
        @keyframes ns-drift {
          from { transform: translate(-8vw, -8vh) scale(0.9); }
          to   { transform: translate(8vw, 8vh) scale(1.15); }
        }
        .ns-om, .ns-lotus {
          position: absolute;
          opacity: 0.12;
          font-size: 5rem;
          filter: drop-shadow(0 0 24px rgba(245, 166, 35, 0.35));
        }
        .ns-om { top: 2.5rem; right: 2.5rem; animation: ns-pulse 4.5s infinite ease-in-out; }
        .ns-lotus { bottom: 4rem; left: 2rem; animation: ns-float 5.5s infinite ease-in-out; }
        @keyframes ns-pulse { 0%,100% { opacity: 0.12; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.05); } }
        @keyframes ns-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .ns-content {
          max-width: 52rem;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Header */
        .ns-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .ns-back-wrap { align-self: flex-start; }
        .ns-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-glass);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-full);
          padding: 10px 18px;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-body);
          transition: all var(--dur-fast) var(--ease-out);
          margin-top: 4px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .ns-back-btn:hover {
          color: var(--gold-bright);
          border-color: var(--border-strong);
          background: var(--bg-glass-hover);
          transform: translateY(-1px);
          box-shadow: var(--glow-gold);
        }

        .ns-bell-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: var(--grad-gold);
          border-radius: var(--r-full);
          box-shadow: var(--shadow-md), var(--glow-gold-strong), inset 0 1px 0 rgba(255,255,255,0.4);
          border: 1px solid rgba(255, 220, 150, 0.4);
        }
        .ns-bell-badge-icon {
          width: 2rem;
          height: 2rem;
          color: #1a0f00;
        }

        .ns-title {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 600;
          letter-spacing: var(--tracking-tight);
          background: var(--grad-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0.25rem 0 0;
          line-height: 1.1;
        }

        /* Greeting */
        .ns-greeting-card {
          padding: 1.75rem 2rem;
          margin-bottom: 1.5rem;
          text-align: center;
          transition: transform var(--dur-med) var(--ease-out), border-color var(--dur-med) var(--ease-out), box-shadow var(--dur-med) var(--ease-out);
        }
        .ns-greeting-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-lg), var(--glow-gold);
        }
        .ns-greeting-text {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }
        .ns-sanskrit {
          font-family: var(--font-display);
          color: var(--gold-bright);
          font-size: 1.2rem;
          margin: 0.5rem 0;
          font-style: italic;
        }
        .ns-translation {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Preview */
        .ns-preview { margin-bottom: 1.5rem; }
        .ns-preview-card {
          background: var(--grad-glass);
          backdrop-filter: blur(28px) saturate(140%);
          -webkit-backdrop-filter: blur(28px) saturate(140%);
          border: 1px solid var(--border-strong);
          border-radius: var(--r-xl);
          padding: 1rem 1.25rem;
          color: var(--text-primary);
          box-shadow: var(--shadow-md), var(--glow-gold);
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }
        .ns-preview-icon {
          padding: 0.6rem;
          background: var(--grad-gold);
          border-radius: var(--r-full);
          color: #1a0f00;
          display: flex;
        }
        .ns-preview-title { font-weight: 600; margin: 0; color: var(--text-primary); }
        .ns-preview-text { font-size: 0.875rem; color: var(--text-secondary); margin: 2px 0 0; }

        /* Settings card */
        .ns-settings-card {
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .ns-settings-header {
          padding: 1.75rem 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-bottom: 1px solid var(--border-soft);
          background: linear-gradient(135deg, rgba(245,201,122,0.08), rgba(198,120,24,0.04));
        }
        .ns-settings-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ns-settings-header-icon {
          padding: 0.85rem;
          background: var(--grad-gold);
          border-radius: var(--r-full);
          box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.35);
          display: flex;
        }
        .ns-settings-header-bell {
          width: 1.75rem;
          height: 1.75rem;
          color: #1a0f00;
        }
        .ns-settings-title {
          font-family: var(--font-display);
          font-size: 1.9rem;
          font-weight: 600;
          margin: 0 0 0.15rem 0;
          color: var(--text-primary);
          letter-spacing: var(--tracking-tight);
        }
        .ns-settings-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }
        .ns-status { text-align: left; }
        .ns-status-label {
          color: var(--text-muted);
          font-size: 0.8rem;
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .ns-status-value {
          color: var(--gold-bright);
          font-weight: 600;
          font-size: 1.05rem;
          margin: 0;
        }

        .ns-body { padding: 2rem; }

        /* Messages */
        .ns-message {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          border-radius: var(--r-lg);
          border: 1px solid;
          animation: ns-fade-in 0.4s var(--ease-out);
        }
        .ns-message-success {
          background: var(--success-soft);
          border-color: var(--success);
          color: var(--success);
        }
        .ns-message-error {
          background: var(--error-soft);
          border-color: var(--error);
          color: var(--error);
        }
        .ns-message-icon {
          padding: 0.4rem;
          border-radius: var(--r-full);
          background: rgba(255,255,255,0.06);
          display: flex;
        }
        .ns-message-text {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .ns-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Section */
        .ns-section {
          position: relative;
          padding: 1.5rem;
          background: var(--bg-glass);
          border-radius: var(--r-xl);
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform var(--dur-med) var(--ease-out), border-color var(--dur-med) var(--ease-out), box-shadow var(--dur-med) var(--ease-out);
        }
        .ns-section:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-md), var(--glow-gold);
        }
        .ns-toggle-section {
          flex-direction: column;
          gap: 1.25rem;
        }
        .ns-toggle-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex: 1;
        }
        .ns-toggle-icon-wrap {
          padding: 0.9rem;
          border-radius: var(--r-lg);
          background: var(--bg-glass);
          border: 1px solid var(--border-soft);
          transition: all var(--dur-med) var(--ease-out);
          display: flex;
          flex-shrink: 0;
        }
        .ns-toggle-icon-wrap.is-active {
          background: var(--grad-gold);
          border-color: transparent;
          box-shadow: var(--glow-gold);
        }
        .ns-toggle-bell {
          width: 1.75rem;
          height: 1.75rem;
          color: var(--gold-bright);
          transition: color var(--dur-med) var(--ease-out);
        }
        .ns-toggle-icon-wrap.is-active .ns-toggle-bell { color: #1a0f00; }

        .ns-setting-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }
        .ns-setting-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin: 0;
        }
        .ns-status-active {
          margin-top: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        .ns-status-dot {
          width: 0.5rem;
          height: 0.5rem;
          background: var(--success);
          border-radius: 50%;
          animation: ns-blink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .ns-status-active-text {
          color: var(--success);
          font-weight: 500;
        }
        @keyframes ns-blink { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

        /* Switch */
        .ns-switch {
          position: relative;
          display: inline-flex;
          height: 32px;
          width: 60px;
          align-items: center;
          border-radius: var(--r-full);
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--border-soft);
          transition: all var(--dur-med) var(--ease-out);
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
        }
        .ns-switch:hover:not(:disabled) {
          border-color: var(--border-strong);
        }
        .ns-switch.is-active {
          background: var(--grad-gold);
          border-color: transparent;
          box-shadow: var(--glow-gold);
        }
        .ns-switch.is-loading {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ns-switch-thumb {
          display: inline-block;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: var(--text-primary);
          transform: translateX(4px);
          transition: transform var(--dur-med) var(--ease-out), background var(--dur-med) var(--ease-out);
          box-shadow: var(--shadow-sm);
        }
        .ns-switch-thumb.is-active {
          background: #1a0f00;
          transform: translateX(32px);
        }

        .ns-enabled-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .ns-info-box {
          padding: 0.9rem 1.1rem;
          background: rgba(245, 200, 120, 0.06);
          border-radius: var(--r-md);
          border: 1px solid var(--border-soft);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .ns-info-box strong { color: var(--gold-bright); font-weight: 600; }

        /* Section label */
        .ns-section-label {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .ns-section-icon {
          padding: 0.65rem;
          border-radius: var(--r-full);
          background: var(--bg-glass);
          border: 1px solid var(--border-soft);
          color: var(--gold-bright);
          display: flex;
        }
        .ns-section-label-text { flex: 1; }
        .ns-section-label-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
        }
        .ns-section-label-desc {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }

        .ns-expand-btn {
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--border-soft);
          border-radius: var(--r-full);
          transition: all var(--dur-fast) var(--ease-out);
          cursor: pointer;
          color: var(--gold-bright);
          display: flex;
        }
        .ns-expand-btn:hover {
          background: var(--bg-glass-hover);
          border-color: var(--border-strong);
        }

        /* Inputs */
        .ns-input-wrap {
          position: relative;
          width: 100%;
        }
        .ns-input {
          width: 100%;
          padding: 0.95rem 3rem 0.95rem 1.1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          border: 1px solid var(--border-soft);
          border-radius: var(--r-md);
          background: var(--bg-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: var(--text-primary);
          transition: all var(--dur-fast) var(--ease-out);
          appearance: none;
          box-sizing: border-box;
        }
        .ns-input:hover {
          border-color: var(--border-strong);
        }
        .ns-input:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.18);
        }
        .ns-select { cursor: pointer; }
        .ns-select option {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        input.ns-input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(6) hue-rotate(340deg);
          cursor: pointer;
          opacity: 0.7;
        }
        .ns-input-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gold-bright);
          width: 1.15rem;
          height: 1.15rem;
          pointer-events: none;
        }

        .ns-expanded {
          background: rgba(245, 200, 120, 0.05);
          padding: 1.25rem;
          border-radius: var(--r-md);
          border: 1px solid var(--border-soft);
        }
        .ns-expanded-title {
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--gold-bright);
          margin: 0 0 0.85rem 0;
          font-size: 1.05rem;
        }
        .ns-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .ns-grid-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ns-grid-item .ns-icon { color: var(--gold-bright); }

        /* Language options */
        .ns-lang-grid, .ns-quote-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }
        .ns-lang-option {
          display: flex;
          flex-direction: column;
          padding: 1.15rem;
          border: 1px solid var(--border-soft);
          border-radius: var(--r-lg);
          cursor: pointer;
          transition: all var(--dur-med) var(--ease-out);
          background: var(--bg-glass);
        }
        .ns-lang-option:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-md), var(--glow-gold);
        }
        .ns-lang-option.is-selected {
          border-color: var(--gold);
          background: rgba(245, 200, 120, 0.08);
          box-shadow: var(--shadow-md), var(--glow-gold);
        }
        .ns-lang-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.65rem;
        }
        .ns-lang-icon { font-size: 1.75rem; }
        .ns-lang-details { flex: 1; }
        .ns-lang-name-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ns-lang-name {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .ns-check { color: var(--gold-bright); }
        .ns-lang-desc {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: 2px 0 0 0;
        }
        .ns-lang-sample {
          background: rgba(255,255,255,0.03);
          padding: 0.85rem 1rem;
          border-radius: var(--r-md);
          border: 1px solid var(--border-subtle);
          margin-top: 0.4rem;
        }
        .ns-lang-sample-text {
          font-family: var(--font-display);
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
          margin: 0;
        }

        /* Quote type */
        .ns-quote-option {
          position: relative;
          padding: 1.5rem;
          border: 1px solid var(--border-soft);
          border-radius: var(--r-xl);
          cursor: pointer;
          transition: all var(--dur-med) var(--ease-out);
          background: var(--bg-glass);
        }
        .ns-quote-option:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-md), var(--glow-gold);
        }
        .ns-quote-option.is-selected {
          border-color: var(--gold);
          background: rgba(245, 200, 120, 0.08);
          box-shadow: var(--shadow-lg), var(--glow-gold-strong);
        }
        .ns-quote-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .ns-quote-icon-wrap {
          padding: 0.85rem;
          border-radius: var(--r-md);
          background: var(--bg-glass);
          border: 1px solid var(--border-soft);
          color: var(--gold-bright);
          transition: all var(--dur-med) var(--ease-out);
          display: flex;
        }
        .ns-quote-option.is-selected .ns-quote-icon-wrap {
          background: var(--grad-gold);
          color: #1a0f00;
          border-color: transparent;
        }
        .ns-quote-details { flex: 1; }
        .ns-quote-name-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.5rem;
        }
        .ns-quote-name {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .ns-quote-selected-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .ns-quote-selected-text {
          font-size: 0.8rem;
          color: var(--gold-bright);
          font-weight: 500;
        }
        .ns-quote-desc {
          color: var(--text-secondary);
          line-height: 1.55;
          font-size: 0.95rem;
          margin: 0 0 0.85rem 0;
        }
        .ns-quote-benefits {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .ns-quote-benefits-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--gold-bright);
          margin: 0 0 0.35rem 0;
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
        }
        .ns-quote-benefit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .ns-quote-benefit .ns-icon { color: var(--gold); width: 0.9rem; height: 0.9rem; }
        .ns-quote-dot {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 0.85rem;
          height: 0.85rem;
          background: var(--grad-gold);
          border-radius: 50%;
          box-shadow: var(--glow-gold);
        }

        /* Footer */
        .ns-footer {
          padding: 1.75rem 2rem;
          border-top: 1px solid var(--border-soft);
          background: linear-gradient(135deg, rgba(245,201,122,0.04), rgba(255,255,255,0.015));
          text-align: center;
        }
        .ns-footer-content {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }
        .ns-footer-om-wrap {
          width: 2.75rem;
          height: 2.75rem;
          background: var(--grad-gold);
          border-radius: var(--r-full);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--glow-gold);
        }
        .ns-footer-om { color: #1a0f00; font-size: 1.1rem; }
        .ns-footer-sanskrit {
          font-family: var(--font-display);
          color: var(--gold-bright);
          font-weight: 500;
          font-size: 1.1rem;
          font-style: italic;
          margin: 0;
        }
        .ns-footer-translation {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 4px 0 0 0;
        }
        .ns-footer-info {
          background: var(--bg-glass);
          padding: 0.9rem 1.1rem;
          border-radius: var(--r-md);
          border: 1px solid var(--border-soft);
        }
        .ns-footer-info-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .ns-footer-info-text strong { color: var(--gold-bright); font-weight: 600; }

        /* Helpers */
        .ns-icon { width: 1.15rem; height: 1.15rem; }
        .ns-sr-only {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Animations */
        @keyframes ns-fade-in { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: ns-fade-in 0.4s var(--ease-out); }
        @keyframes ns-fade-in-up { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in-up { animation: ns-fade-in-up 0.6s var(--ease-out); }
        @keyframes ns-pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: ns-pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        /* Responsive */
        @media (min-width: 640px) {
          .ns-header { flex-direction: column; }
          .ns-settings-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .ns-status { text-align: right; }
          .ns-toggle-section {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .ns-grid-2 { grid-template-columns: 1fr 1fr; }
          .ns-lang-content { flex-direction: row; }
          .ns-quote-content { flex-direction: row; align-items: flex-start; }
          .ns-footer-content { flex-direction: row; }
        }

        @media (max-width: 480px) {
          .ns-page { padding: 1rem 0.75rem; }
          .ns-body, .ns-settings-header, .ns-footer { padding: 1.25rem; }
          .ns-section { padding: 1.1rem; }
          .ns-title { font-size: 2.1rem; }
          .ns-settings-title { font-size: 1.5rem; }
          .ns-setting-title { font-size: 1.2rem; }
          .ns-om { font-size: 3rem; top: 0.75rem; right: 0.75rem; }
          .ns-lotus { font-size: 2.75rem; bottom: 1.5rem; left: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings;
