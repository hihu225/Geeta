import React, { useState, useEffect,useContext } from 'react';
import { Bell, Clock, Globe, Book, CheckCircle, XCircle,ArrowLeft, Sunrise, Moon, Star, Heart, ChevronDown, ChevronUp, Info, Sparkles, ArrowRight, Sun } from 'lucide-react';
import { backend_url } from './utils/backend'; // Assuming backend_url is correctly imported
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used
import Cookies from 'js-cookie'; // Assuming js-cookie is used
import axios from 'axios'; // Assuming axios is used
import FCMToken from './FCMToken'; // Assuming FCMToken component exists
import {UserContext} from "./UserContext.jsx";
const NotificationSettings = () => {
  // State for notification settings
  const [settings, setSettings] = useState({
    enabled: false,
    time: "09:00",
    timezone: "Asia/Kolkata",
    language: "english",
    quoteType: "random",
  });
  const { user } = useContext(UserContext);
  // Authentication token and navigation
  const token = Cookies.get("token");
  const navigate = useNavigate();

  // UI state for loading, messages, expanded sections, and preview
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [expandedSection, setExpandedSection] = useState(null); // Controls collapsible sections
  const [showPreview, setShowPreview] = useState(false); // Controls notification preview visibility
  const [isInitialLoad, setIsInitialLoad] = useState(true); // For initial loading animation

  // Dynamic IST greeting based on current time
  const getISTGreeting = () => {
    const now = new Date();
    // Adjusting to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = istTime.getUTCHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  // Predefined timezones for selection
  const timezones = [
    { value: "Asia/Kolkata", label: "India (IST)", flag: "🇮🇳" },
    { value: "America/New_York", label: "New York (EST)", flag: "🇺🇸" },
    { value: "Europe/London", label: "London (GMT)", flag: "🇬🇧" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)", flag: "🇯🇵" },
    { value: "Australia/Sydney", label: "Sydney (AEDT)", flag: "🇦🇺" },
  ];

  // Predefined languages for selection
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

  // Predefined quote types for selection
  const quoteTypes = [
    {
      value: "random",
      label: "Divine Surprise",
      description: "Let Krishna choose the perfect verse for your soul",
      icon: <Star className="icon" />,
      color: "gradient-amber-orange",
      benefits: ["Unexpected wisdom", "Serendipitous guidance", "Fresh perspectives daily"]
    },
    {
      value: "sequential",
      label: "Sacred Journey",
      description: "Walk through the Gita systematically, verse by verse",
      icon: <Sunrise className="icon" />,
      color: "gradient-blue-indigo",
      benefits: ["Complete understanding", "Structured learning", "Progressive wisdom"]
    },
    {
      value: "themed",
      label: "Life Guidance",
      description: "Receive wisdom tailored to life's daily challenges",
      icon: <Heart className="icon" />,
      color: "gradient-rose-pink",
      benefits: ["Practical wisdom", "Relevant guidance", "Contextual support"]
    },
  ];

  // Effect hook to fetch preferences on component mount
  useEffect(() => {
    fetchPreferences();
    // Assuming FCMToken is a function that initializes FCM
    FCMToken(); 
    setTimeout(() => setIsInitialLoad(false), 1000);
  }, []);

  // Function to fetch user preferences from the backend
  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/notifications/preferences`);
      const data = response.data;
      if (data.success) {
        setSettings({
          enabled: data.preferences.dailyQuotes?.enabled || false,
          time: data.preferences.dailyQuotes?.time || '09:00',
          timezone: data.preferences.dailyQuotes?.timezone || 'Asia/Kolkata',
          language: data.preferences.preferences?.language || 'english',
          quoteType: data.preferences.preferences?.quoteType || 'random'
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setMessage("Failed to load settings. Please refresh the page.");
      setMessageType("error");
    }
  };

  // Function to update user preferences on the backend
  const updatePreferences = async (newSettings) => {
    setLoading(true);
    // Add a key to message to ensure re-render for animation
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
        setSettings((prev) => ({ ...prev, ...newSettings }));
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

  // Handler for the enable/disable toggle switch
  const handleToggle = () => {
    const newEnabled = !settings.enabled;
    updatePreferences({ enabled: newEnabled });
    if (newEnabled) {
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 4000);
    }
  };

  // Handler for time input change
  const handleTimeChange = (time) => {
    updatePreferences({ time });
  };

  // Generic handler for other setting changes
  const handleChange = (field, value) => {
    updatePreferences({ [field]: value });
  };
  const handleBack = () => {
    navigate(-1);
  };
  // Determines the greeting and icon based on the selected notification time
  const getTimeGreeting = () => {
    if (!settings.time) return { icon: <Clock className="icon" />, text: "Set Time", color: "text-gray-600", description: "Choose when to receive wisdom."};
    const hour = parseInt(settings.time.split(':')[0]);
    if (hour < 6) return {
      icon: <Moon className="icon" />,
      text: "Midnight Meditation",
      color: "text-indigo-600",
      description: "Perfect for deep contemplation and inner peace"
    };
    if (hour < 12) return {
      icon: <Sunrise className="icon" />,
      text: "Morning Prayers",
      color: "text-amber-600",
      description: "Start your day with divine wisdom and clarity"
    };
    if (hour < 18) return {
      icon: <Sun className="icon" />,
      text: "Afternoon Reflection",
      color: "text-blue-600",
      description: "Midday guidance for life's decisions"
    };
    return {
      icon: <Moon className="icon" />,
      text: "Evening Contemplation",
      color: "text-purple-600",
      description: "End your day with spiritual reflection"
    };
  };

  const timeGreeting = getTimeGreeting();
  const currentLanguage = languages.find(lang => lang.value === settings.language);
  const currentQuoteType = quoteTypes.find(type => type.value === settings.quoteType);

  return (
    <div className="page-container">
      {/* Enhanced Background Elements */}
      <div className="background-elements">
        {/* Ethereal Flow Elements */}
        <div className="ethereal-bg-element bg-orange-300" style={{ width: '300px', height: '300px', top: '5%', left: '10%', animationDelay: '0s' }}></div>
        <div className="ethereal-bg-element bg-amber-300" style={{ width: '250px', height: '250px', top: '60%', left: '80%', animationDelay: '5s', animationDuration: '70s' }}></div>
        <div className="ethereal-bg-element bg-red-200" style={{ width: '200px', height: '200px', top: '30%', left: '50%', animationDelay: '10s', animationDuration: '80s' }}></div>

        {/* Spiritual Symbols */}
        <div className="spiritual-symbol om-symbol">🕉️</div>
        <div className="spiritual-symbol lotus-symbol">🪷</div>
        <div className="spiritual-symbol spinning-circle"></div>
        <div className="radial-gradient-overlay"></div>
      </div>

      <div className="content-wrapper">
        <div className="header-section">
  <div className="back-btn-wrapper">
    <button onClick={handleBack} className="back-button">
      <ArrowLeft size={16} />
      Back to Settings
    </button>
  </div>

  <div className="bell-icon-container">
    <Bell className="bell-icon" />
  </div>

  <h1 className="main-title">Daily Divine Wisdom</h1>
</div>

        <div className="greeting-card">
          <p className="greeting-text">
             {getISTGreeting()}, {user?.name || "seeker of wisdom"}! 🙏
          </p>
          <p className="sanskrit-quote">
            यदा यदा हि धर्मस्य ग्लानिर्भवति भारत
          </p>
          <p className="quote-translation">
            "Whenever dharma declines, I manifest myself"
          </p>
        </div>

        {showPreview && (
          <div className="notification-preview-container animate-fade-in-up">
            <div className="notification-preview-card">
              <div className="notification-preview-icon">
                <Sparkles className="icon" />
              </div>
              <div>
                <p className="notification-preview-title">Notification Preview</p>
                <p className="notification-preview-text">You'll receive your daily wisdom like this!</p>
              </div>
            </div>
          </div>
        )}

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-header-content">
              <div className="settings-card-icon-wrapper">
                <Bell className="settings-card-bell-icon" />
              </div>
              <div>
                <h2 className="settings-card-title">Sacred Notifications</h2>
                <p className="settings-card-subtitle">Receive Krishna's teachings daily</p>
              </div>
            </div>
            <div className="settings-status">
              <p className="settings-status-label">Status</p>
              <p className="settings-status-value">
                {settings.enabled ? "🟢 Active" : "⚪ Inactive"}
              </p>
            </div>
          </div>

          <div className="settings-body">
            {message && (
              <div
                key={message} // Add key to re-trigger animation on message change
                className={`message-box ${messageType === "success" ? "message-success" : "message-error"}`}
              >
                <div className={`message-icon-wrapper ${messageType === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
                  {messageType === "success" ? (
                    <CheckCircle className="icon animate-pop-in text-emerald-600" />
                  ) : (
                    <XCircle className="icon animate-pop-in text-red-600" />
                  )}
                </div>
                <span className="message-text">{message}</span>
              </div>
            )}

            <div className="settings-sections-wrapper">
              <div className="setting-section notification-toggle-section">
                <div className="notification-toggle-content">
                  <div className={`toggle-icon-wrapper ${settings.enabled ? 'bg-orange-100 shadow-lg' : 'bg-gray-100'}`}>
                    <Bell className={`toggle-bell-icon ${settings.enabled ? 'text-orange-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="setting-title">Daily Gita Wisdom</h3>
                    <p className="setting-description">
                      Let Krishna's eternal wisdom guide your day
                    </p>
                    {settings.enabled && (
                      <div className="toggle-status-active">
                        <div className="status-dot animate-pulse"></div>
                        <span className="status-text">Active • Next delivery at {settings.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className={`toggle-switch ${settings.enabled ? "toggle-switch-active animate-breathing-glow" : "toggle-switch-inactive"} ${loading ? "toggle-switch-loading" : ""}`}
                >
                  <span
                    className={`toggle-handle ${settings.enabled ? "toggle-handle-active" : "toggle-handle-inactive"}`}
                  >
                    {settings.enabled ? (
                      <CheckCircle className="toggle-handle-icon text-green-600" />
                    ) : (
                      <XCircle className="toggle-handle-icon text-gray-400" />
                    )}
                  </span>
                </button>
              </div>

              {settings.enabled && (
                <div className="enabled-settings-container animate-fade-in">
                  <div className="info-text-box">
                    <Info className="info-icon" />
                    <span>Your personalized wisdom will be delivered in <strong>{currentLanguage?.label}</strong> via <strong>{currentQuoteType?.label}</strong> method</span>
                  </div>

                  <div className="setting-section">
                    <div className="setting-label-group">
                      <div className={`setting-icon-circle ${timeGreeting.color}`}>
                        {timeGreeting.icon}
                      </div>
                      <div>
                        <span className="setting-label-text">{timeGreeting.text}</span>
                        <p className="setting-label-description">{timeGreeting.description}</p>
                      </div>
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
                        className="expand-button"
                      >
                        {expandedSection === 'time' ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
                      </button>
                    </div>
                    <div className="input-with-icon">
                      <input
                        type="time"
                        value={settings.time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="time-input"
                      />
                      <Clock className="input-icon" />
                    </div>
                    {expandedSection === 'time' && (
                      <div className="expanded-content animate-fade-in">
                        <h4 className="expanded-content-title">✨ Perfect Times for Spiritual Nourishment</h4>
                        <div className="grid-2-col">
                          <div className="grid-item"><Sunrise className="icon text-amber-600" /><span><strong>5-7 AM:</strong> Morning meditation</span></div>
                          <div className="grid-item"><Star className="icon text-blue-600" /><span><strong>12-2 PM:</strong> Midday reflection</span></div>
                          <div className="grid-item"><Moon className="icon text-purple-600" /><span><strong>6-8 PM:</strong> Evening contemplation</span></div>
                          <div className="grid-item"><Heart className="icon text-rose-600" /><span><strong>9-10 PM:</strong> Bedtime peace</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="setting-section">
                    <div className="setting-label-group">
                      <div className="setting-icon-circle gradient-blue-indigo">
                        <Globe className="icon text-blue-600" />
                      </div>
                      <span className="setting-label-text">Your Sacred Time Zone</span>
                    </div>
                    <div className="input-with-icon">
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleChange("timezone", e.target.value)}
                        className="select-input"
                      >
                        {timezones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.flag} {tz.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="input-icon" />
                    </div>
                  </div>

                  <div className="setting-section">
                    <label className="setting-label-group">
                      <div className="setting-icon-circle gradient-green-emerald">
                        <Book className="icon text-green-600" />
                      </div>
                      <span className="setting-label-text">Sacred Language</span>
                    </label>
                    <div className="language-options-grid">
                      {languages.map((lang) => (
                        <label
                          key={lang.value}
                          className={`language-option ${settings.language === lang.value ? "language-option-selected" : ""}`}
                        >
                          <input type="radio" name="language" value={lang.value} checked={settings.language === lang.value} onChange={(e) => handleChange("language", e.target.value)} className="sr-only"/>
                          <div className="language-option-content">
                            <span className="language-icon">{lang.icon}</span>
                            <div className="language-details">
                              <div className="language-name-row">
                                <span className="language-name">{lang.label}</span>
                                {settings.language === lang.value && (<CheckCircle className="icon text-green-600" />)}
                              </div>
                              <p className="language-description">{lang.description}</p>
                            </div>
                          </div>
                          <div className="language-sample-box">
                            <p className="language-sample-text">"{lang.sample}"</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="setting-section">
                    <label className="setting-label-text">Choose Your Spiritual Path</label>
                    <div className="quote-type-options-grid">
                      {quoteTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`quote-type-option ${type.color} ${settings.quoteType === type.value ? "quote-type-option-selected" : ""}`}
                        >
                          <input type="radio" name="quoteType" value={type.value} checked={settings.quoteType === type.value} onChange={(e) => handleChange("quoteType", e.target.value)} className="sr-only" />
                          <div className="quote-type-content">
                            <div className={`quote-type-icon-wrapper ${ settings.quoteType === type.value ? 'bg-white shadow-xl' : 'bg-gray-100 group-hover-bg-white group-hover-shadow-lg' }`}>
                              {type.icon}
                            </div>
                            <div className="quote-type-details">
                              <div className="quote-type-name-row">
                                <h4 className="quote-type-name">{type.label}</h4>
                                {settings.quoteType === type.value && (
                                  <div className="quote-type-selected-indicator">
                                    <CheckCircle className="icon text-green-600" />
                                    <span className="quote-type-selected-text">Selected</span>
                                  </div>
                                )}
                              </div>
                              <p className="quote-type-description">{type.description}</p>
                              <div className="quote-type-benefits">
                                <p className="quote-type-benefits-title">Benefits:</p>
                                {type.benefits.map((benefit, index) => (
                                  <div key={index} className="quote-type-benefit-item">
                                    <ArrowRight className="icon text-gray-400" />
                                    <span>{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {settings.quoteType === type.value && (
                            <div className="quote-type-selected-dot"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="footer-section">
            <div className="footer-content">
              <div className="footer-om-symbol-wrapper">
                <span className="footer-om-symbol">🕉️</span>
              </div>
              <div className="footer-quote-text">
                <p className="footer-sanskrit-quote">
                  "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
                </p>
                <p className="footer-quote-translation">
                  You have the right to perform your actions, but never to the fruits of action
                </p>
              </div>
            </div>
            {settings.enabled && (
              <div className="footer-info-box animate-fade-in">
                <p className="footer-info-text">
                  🙏 Your next divine message will arrive at <strong>{settings.time}</strong> in <strong>{currentLanguage?.label}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* Base Styles */
    .page-container {
      min-height: 100vh;
      background: linear-gradient(to bottom right, #FFF8E1, #FFFBEB, #FFFDEB); /* from-saffron-50 via-orange-50 to-amber-50 */
      padding: 1rem; /* p-4 */
      position: relative;
      overflow-x: hidden; /* Important for preventing horizontal overflow */
      font-family: 'Inter', sans-serif;
      color: #374151; /* Default text color, similar to gray-700 */
    }
    .back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: lightslategrey;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: black;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  width: fit-content;
  margin-left: 0;
  margin-right: auto;
}
.back-btn-wrapper {
  align-self: flex-start; /* overrides parent align-items: center */
}


    /* Ethereal Background Elements */
    .background-elements {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .ethereal-bg-element {
      position: absolute;
      border-radius: 50%;
      opacity: 0.03; /* Very subtle */
      animation: ethereal-drift 60s infinite linear alternate;
      filter: blur(60px); /* Heavy blur for softness */
      will-change: transform; /* Performance hint */
    }
    .ethereal-bg-element.bg-orange-300 { background-color: #FDBA74; }
    .ethereal-bg-element.bg-amber-300 { background-color: #FCD34D; }
    .ethereal-bg-element.bg-red-200 { background-color: #FECACA; }

    @keyframes ethereal-drift {
      from { transform: translateX(-15vw) translateY(-15vh) rotate(0deg) scale(0.8); }
      to { transform: translateX(15vw) translateY(15vh) rotate(180deg) scale(1.2); }
    }

    .spiritual-symbol {
      position: absolute;
      opacity: 0.2;
      font-size: 6rem; /* text-8xl for om, text-6xl for lotus */
    }
    .om-symbol {
      top: 2.5rem; /* top-10 */
      right: 2.5rem; /* right-10 */
      color: #FEE2B2; /* orange-200 */
      animation: gentle-pulse 4.5s infinite ease-in-out;
    }
    .lotus-symbol {
      bottom: 5rem; /* bottom-20 */
      left: 2.5rem; /* left-10 */
      color: #FDE68A; /* amber-200 */
      animation: soft-float 5.5s infinite ease-in-out;
    }
    .spinning-circle {
      position: absolute;
      top: 50%; /* top-1/2 */
      left: 25%; /* left-1/4 */
      width: 8rem; /* w-32 */
      height: 8rem; /* h-32 */
      border: 1px solid #FEE2B2; /* border-orange-200 */
      opacity: 0.2;
      border-radius: 50%;
      animation: spin 25s linear infinite;
    }
    .radial-gradient-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(255,165,0,0.08) 0%, rgba(255,165,0,0) 70%);
      opacity: 0.1;
    }

    /* Content Wrapper */
    .content-wrapper {
      max-width: 48rem; /* max-w-3xl */
      margin: 0 auto; /* mx-auto */
      position: relative;
      z-index: 10;
    }

    /* Header Section */
    .header-section {
      text-align: center;
      margin-bottom: 2rem; /* mb-8 */
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: center;
      gap: 1rem; /* space-y-4 */
    }
    .bell-icon-container {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem; /* gap-3 */
      margin-bottom: 1rem; /* mb-4 */
      padding: 0.75rem; /* p-3 */
      background: linear-gradient(to right, #F97316, #EF4444); /* from-orange-500 to-red-500 */
      border-radius: 9999px; /* rounded-full */
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
    }
    .bell-icon {
      width: 2rem; /* w-8 */
      height: 2rem; /* h-8 */
      color: white;
    }
    .main-title {
      font-size: 3rem; /* text-5xl */
      font-weight: 700; /* font-bold */
      background: linear-gradient(to right, #EF4444, #F97316, #D97706); /* from-orange-600 via-red-500 to-yellow-600 */
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(255, 165, 0, 0.3);
    }

    /* Greeting Card */
    .greeting-card {
      background-color: rgba(255, 255, 255, 0.7); /* bg-white/70 */
      backdrop-filter: blur(8px); /* backdrop-blur-sm */
      border-radius: 1rem; /* rounded-2xl */
      padding: 1.5rem; /* p-6 */
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
      border: 1px solid #FFEDD5; /* border-orange-100 */
      transform: scale(1);
      transition: transform 0.5s ease-out;
    }
    .greeting-card:hover {
      transform: scale(1.01);
    }
    .greeting-text {
      font-size: 1.5rem; /* text-2xl */
      color: #374151; /* text-gray-700 */
      font-weight: 600; /* font-semibold */
      margin-bottom: 0.5rem; /* mb-2 */
    }
    .sanskrit-quote {
      color: #4B5563; /* text-gray-600 */
      font-size: 1.125rem; /* text-lg */
      margin-bottom: 0.5rem; /* mb-2 */
    }
    .quote-translation {
      font-size: 0.875rem; /* text-sm */
      color: #6B7280; /* text-gray-500 */
    }

    /* Notification Preview */
    .notification-preview-container {
      margin-bottom: 1.5rem; /* mb-6 */
      transform: translateY(0); /* Initial state for animation */
    }
    .notification-preview-card {
      background: linear-gradient(to right, #22C55E, #10B981); /* from-green-500 to-emerald-500 */
      color: white;
      padding: 1rem; /* p-4 */
      border-radius: 1rem; /* rounded-2xl */
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); /* shadow-2xl */
      border: 2px solid #6EE7B7; /* border-2 border-green-300 */
      display: flex;
      align-items: center;
      gap: 0.75rem; /* gap-3 */
    }
    .notification-preview-icon {
      padding: 0.5rem; /* p-2 */
      background-color: rgba(255, 255, 255, 0.2); /* bg-white/20 */
      border-radius: 9999px; /* rounded-full */
    }
    .notification-preview-title {
      font-weight: 600; /* font-semibold */
    }
    .notification-preview-text {
      font-size: 0.875rem; /* text-sm */
      opacity: 0.9;
    }

    /* Settings Card */
    .settings-card {
      background-color: rgba(255, 255, 255, 0.9); /* bg-white/90 */
      backdrop-filter: blur(8px); /* backdrop-blur-sm */
      border-radius: 1.5rem; /* rounded-3xl */
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); /* shadow-2xl */
      border: 1px solid #FFEDD5; /* border-orange-100 */
      overflow: hidden;
    }
    .settings-card-header {
      background: linear-gradient(to right, #F97316, #EF4444, #FACC15); /* from-orange-500 via-red-500 to-yellow-500 */
      padding: 2rem; /* p-8 */
      color: white;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem; /* gap-4 */
    }
    .settings-card-header::before { /* Absolute inset elements */
      content: '';
      position: absolute;
      inset: 0;
      background-color: rgba(0,0,0,0.1); /* bg-black/10 */
    }
    .settings-card-header::after { /* Absolute inset elements */
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent); /* from-transparent via-white/5 to-transparent */
    }
    .settings-card-header-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem; /* gap-4 */
    }
    .settings-card-icon-wrapper {
      padding: 0.75rem; /* p-3 */
      background-color: rgba(255, 255, 255, 0.2); /* bg-white/20 */
      border-radius: 9999px; /* rounded-full */
      backdrop-filter: blur(8px); /* backdrop-blur-sm */
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
    }
    .settings-card-bell-icon {
      width: 2rem; /* w-8 */
      height: 2rem; /* h-8 */
    }
    .settings-card-title {
      font-size: 1.875rem; /* text-3xl */
      font-weight: 700; /* font-bold */
      margin-bottom: 0.25rem; /* mb-1 */
    }
    .settings-card-subtitle {
      color: #FFEDD5; /* text-orange-100 */
      font-size: 1.125rem; /* text-lg */
    }
    .settings-status {
      text-align: center; /* Default to center for small screens */
      position: relative; /* Ensure it's above pseudo-elements */
    }
    .settings-status-label {
      color: #FFEDD5; /* text-orange-100 */
      font-size: 0.875rem; /* text-sm */
    }
    .settings-status-value {
      color: white;
      font-weight: 700; /* font-bold */
      font-size: 1.125rem; /* text-lg */
    }

    /* Settings Body */
    .settings-body {
      padding: 2rem; /* p-8 */
    }
    .message-box {
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: center;
      gap: 0.75rem; /* gap-3 */
      padding: 1.5rem; /* p-6 */
      margin-bottom: 2rem; /* mb-8 */
      border-radius: 1rem; /* rounded-2xl */
      transition: all 0.5s ease;
      transform: scale(1.02);
      border-width: 2px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); /* shadow-xl */
    }
    .message-success {
      background: linear-gradient(to right, #F0FDF4, #ECFDF5); /* from-emerald-50 to-green-50 */
      color: #065F46; /* text-emerald-800 */
      border-color: #D1FAE5; /* border-emerald-200 */
      box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04); /* shadow-xl shadow-emerald-100 */
    }
    .message-error {
      background: linear-gradient(to right, #FEF2F2, #FFF1F2); /* from-red-50 to-rose-50 */
      color: #991B1B; /* text-red-800 */
      border-color: #FEE2E2; /* border-red-200 */
      box-shadow: 0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04); /* shadow-xl shadow-red-100 */
    }
    .message-icon-wrapper {
      padding: 0.5rem; /* p-2 */
      border-radius: 9999px; /* rounded-full */
    }
    .message-text {
      font-weight: 500; /* font-medium */
      font-size: 1.125rem; /* text-lg */
      text-align: center; /* Center text in message box on mobile */
    }

    .settings-sections-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2rem; /* space-y-8 */
    }

    /* Individual Setting Section */
    .setting-section {
      position: relative;
      padding: 2rem; /* p-8 */
      background: linear-gradient(to right, #FFF8E1, #FFFBEB, #FFFDEB); /* from-orange-50 via-amber-50 to-yellow-50 */
      border-radius: 1.5rem; /* rounded-3xl */
      border: 2px solid #FFEDD5; /* border-2 border-orange-100 */
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
      display: flex;
      flex-direction: column;
      gap: 1.5rem; /* space-y-6 */
    }
    .notification-toggle-section {
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: flex-start; /* Align start when stacked */
      justify-content: space-between;
      gap: 1rem; /* gap-4 */
    }
    .notification-toggle-content {
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: flex-start; /* Align start when stacked */
      gap: 1.5rem; /* gap-6 */
    }
    .toggle-icon-wrapper {
      padding: 1rem; /* p-4 */
      border-radius: 1rem; /* rounded-2xl */
      transition: all 0.3s ease;
    }
    .toggle-bell-icon {
      width: 2rem; /* w-8 */
      height: 2rem; /* h-8 */
      transition: color 0.3s ease;
    }
    .toggle-icon-wrapper.bg-orange-100 { background-color: #FFEDD5; }
    .toggle-icon-wrapper.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
    .toggle-icon-wrapper.bg-gray-100 { background-color: #F3F4F6; }
    .toggle-bell-icon.text-orange-600 { color: #FB923C; }
    .toggle-bell-icon.text-gray-400 { color: #9CA3AF; }

    .setting-title {
      font-size: 1.5rem; /* text-2xl */
      font-weight: 700; /* font-bold */
      color: #1F2937; /* text-gray-800 */
      margin-bottom: 0.5rem; /* mb-2 */
    }
    .setting-description {
      color: #4B5563; /* text-gray-600 */
      font-size: 1.125rem; /* text-lg */
    }
    .toggle-status-active {
      margin-top: 0.75rem; /* mt-3 */
      display: flex;
      align-items: center;
      gap: 0.5rem; /* gap-2 */
      font-size: 0.875rem; /* text-sm */
    }
    .status-dot {
      width: 0.5rem; /* w-2 */
      height: 0.5rem; /* h-2 */
      background-color: #22C55E; /* bg-green-500 */
      border-radius: 9999px; /* rounded-full */
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .status-text {
      color: #047857; /* text-green-700 */
      font-weight: 500; /* font-medium */
    }

    .toggle-switch {
      position: relative;
      display: inline-flex;
      height: 3rem; /* h-12 */
      width: 5rem; /* w-20 */
      align-items: center;
      border-radius: 9999px; /* rounded-full */
      transition: all 0.3s ease;
      transform: scale(1);
      outline: none;
      cursor: pointer;
    }
    .toggle-switch:hover {
      transform: scale(1.1);
    }
    .toggle-switch:focus-visible {
      box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.7); /* focus-visible:ring-4 focus-visible:ring-orange-300/70 */
    }
    .toggle-switch-active {
      background: linear-gradient(to right, #F97316, #EF4444); /* from-orange-500 to-red-500 */
      animation: breathing-glow 2.5s infinite ease-in-out;
    }
    .toggle-switch-inactive {
      background-color: #D1D5DB; /* bg-gray-300 */
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); /* shadow-md */
    }
    .toggle-switch-loading {
      opacity: 0.5;
      cursor: not-allowed;
      animation: pulse-slow 2s infinite;
    }
    .toggle-handle {
      display: inline-block;
      height: 2rem; /* h-8 */
      width: 2rem; /* w-8 */
      border-radius: 9999px; /* rounded-full */
      background-color: white;
      transition: transform 0.3s ease-out;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .toggle-handle-active {
      transform: translateX(2.5rem); /* translate-x-10 */
    }
    .toggle-handle-inactive {
      transform: translateX(0.5rem); /* translate-x-2 */
    }
    .toggle-handle-icon {
      width: 1rem; /* w-4 */
      height: 1rem; /* h-4 */
      margin: 0.5rem; /* m-2 */
    }

    .enabled-settings-container {
      display: flex;
      flex-direction: column;
      gap: 2rem; /* space-y-8 */
    }

    .info-text-box {
      margin-top: 1.5rem; /* mt-6 */
      padding: 1rem; /* p-4 */
      background-color: rgba(255, 255, 255, 0.6); /* bg-white/60 */
      border-radius: 0.75rem; /* rounded-xl */
      border: 1px solid #FFEDD5; /* border-orange-200 */
      display: flex;
      align-items: center;
      gap: 0.5rem; /* gap-2 */
      font-size: 0.875rem; /* text-sm */
      color: #4B5563; /* text-gray-600 */
    }
    .info-icon {
      width: 1rem; /* w-4 */
      height: 1rem; /* h-4 */
    }

    /* Time Picker Section */
    .setting-label-group {
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: flex-start; /* Align start when stacked */
      gap: 1rem; /* gap-4 */
      font-size: 1.25rem; /* text-xl */
      font-weight: 700; /* font-bold */
      color: #1F2937; /* text-gray-800 */
    }
    .setting-icon-circle {
      padding: 0.75rem; /* p-3 */
      border-radius: 9999px; /* rounded-full */
    }
    .setting-icon-circle.gradient-amber-orange { background: linear-gradient(to right, #FFEDD5, #FFF8E1); } /* from-amber-100 to-orange-100 */
    .setting-icon-circle.gradient-blue-indigo { background: linear-gradient(to right, #DBEAFE, #E0E7FF); } /* from-blue-100 to-indigo-100 */
    .setting-icon-circle.gradient-green-emerald { background: linear-gradient(to right, #DCFCE7, #D1FAE5); } /* from-green-100 to-emerald-100 */

    .setting-label-text {
      font-size: 1.25rem; /* text-xl */
      font-weight: 700; /* font-bold */
      color: #1F2937; /* text-gray-800 */
    }
    .setting-label-description {
      font-size: 0.875rem; /* text-sm */
      font-weight: 400; /* font-normal */
      color: #4B5563; /* text-gray-600 */
      margin-top: 0.25rem; /* mt-1 */
    }
    .expand-button {
      padding: 0.5rem; /* p-2 */
      background-color: transparent;
      border: none;
      border-radius: 9999px; /* rounded-full */
      transition: background-color 0.2s ease;
      cursor: pointer;
    }
    .expand-button:hover {
      background-color: #F3F4F6; /* hover:bg-gray-100 */
    }

    .input-with-icon {
      position: relative;
      width: 100%; /* Ensure full width on mobile */
      gap:0.75rem;
    }
    .time-input {
      width: 86%;
      padding: 2.1rem; /* p-6 */
      font-size: 1.25rem; /* text-xl */
      border: 2px solid #FFEDD5; /* border-2 border-orange-200 */
      border-radius: 1rem; /* rounded-2xl */
      background-color: rgba(255, 255, 255, 0.7); /* bg-white/70 */
      backdrop-filter: blur(8px); /* backdrop-blur-sm */
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
      transition: all 0.2s ease;
      appearance: none; /* Remove default arrow */
    }
    .time-input:focus {
      outline: none;
      box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.2); /* focus:ring-4 focus:ring-orange-100 */
      border-color: #FB923C; /* focus:border-orange-400 */
    }
    .input-icon {
      position: absolute;
      right: 1.5rem; /* right-6 */
      top: 50%;
      transform: translateY(-50%);
      color: #FB923C; /* text-orange-400 */
      width: 1.5rem; /* w-6 */
      height: 1.5rem; /* h-6 */
      pointer-events: none; /* Allow clicks to pass through to input */
    }

    .expanded-content {
      background-color: #FFFBEB; /* bg-amber-50 */
      padding: 1.5rem; /* p-6 */
      border-radius: 1rem; /* rounded-2xl */
      border: 2px solid #FCD34D; /* border-2 border-amber-200 */
    }
    .expanded-content-title {
      font-weight: 600; /* font-semibold */
      color: #FCD34D; /* text-amber-800 */
      margin-bottom: 0.75rem; /* mb-3 */
    }
    .grid-2-col {
      display: grid;
      grid-template-columns: 1fr; /* Default to single column */
      gap: 1rem; /* gap-4 */
      font-size: 0.875rem; /* text-sm */
    }
    .grid-item {
      display: flex;
      align-items: center;
      gap: 0.5rem; /* gap-2 */
    }

    /* Timezone Select */
    .select-input {
      width: 100%;
      padding: 1.5rem; /* p-6 */
      font-size: 1.125rem; /* text-lg */
      border: 2px solid #BFDBFE; /* border-2 border-blue-200 */
      border-radius: 1rem; /* rounded-2xl */
      background-color: rgba(255, 255, 255, 0.7); /* bg-white/70 */
      backdrop-filter: blur(8px); /* backdrop-blur-sm */
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
      transition: all 0.2s ease;
      appearance: none; /* Remove default arrow */
      padding-right: 3rem; /* Make space for custom arrow */
    }
    .select-input:focus {
      outline: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); /* focus:ring-4 focus:ring-blue-100 */
      border-color: #3B82F6; /* focus:border-blue-400 */
    }

    /* Language Options */
    .language-options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem; /* gap-4 */
    }
    .language-option {
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      padding: 1.5rem; /* p-6 */
      border-width: 2px;
      border-radius: 1rem; /* rounded-2xl */
      cursor: pointer;
      transition: all 0.3s ease;
      transform: scale(1);
    }
    .language-option:hover {
      transform: scale(1.02);
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); /* hover:shadow-xl */
    }
    .language-option-selected {
      border-color: #34D399; /* border-green-400 */
      background: linear-gradient(to right, #F0FDF4, #ECFDF5); /* from-green-50 to-emerald-50 */
      box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04); /* shadow-xl shadow-green-100 */
      transform: scale(1.02);
    }
    .language-option:not(.language-option-selected) {
      border-color: #E5E7EB; /* border-gray-200 */
      background-color: rgba(255, 255, 255, 0.6); /* bg-white/60 */
    }
    .language-option:not(.language-option-selected):hover {
      border-color: #9EE6B4; /* hover:border-green-200 */
      background-color: #F0FDF4; /* hover:bg-green-50 */
    }
    .language-option-content {
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: center; /* Center items when stacked */
      gap: 1rem; /* gap-4 */
      margin-bottom: 0.75rem; /* mb-3 */
      text-align: center; /* Center text */
    }
    .language-icon {
      font-size: 1.875rem; /* text-3xl */
    }
    .language-details {
      flex: 1;
    }
    .language-name-row {
      display: flex;
      flex-direction: column; /* Stack name and description */
      align-items: center; /* Center when stacked */
      gap: 0.5rem; /* gap-2 */
    }
    .language-name {
      font-size: 1.25rem; /* text-xl */
      font-weight: 700; /* font-bold */
    }
    .language-description {
      color: #4B5563; /* text-gray-600 */
      font-size: 0.875rem; /* text-sm */
    }
    .language-sample-box {
      background-color: rgba(255, 255, 255, 0.8); /* bg-white/80 */
      padding: 1rem; /* p-4 */
      border-radius: 0.75rem; /* rounded-xl */
      border: 1px solid #E5E7EB; /* border-gray-200 */
      margin-top: 0.5rem; /* mt-2 */
    }
    .language-sample-text {
      font-size: 0.875rem; /* text-sm */
      color: #374151; /* text-gray-700 */
      font-style: italic;
    }

    /* Quote Type Options */
    .quote-type-options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem; /* gap-6 */
    }
    .quote-type-option {
      position: relative;
      padding: 2rem; /* p-8 */
      border-width: 2px;
      border-radius: 1.5rem; /* rounded-3xl */
      cursor: pointer;
      transition: all 0.3s ease;
      transform: scale(1);
    }
    .quote-type-option:hover {
      transform: scale(1.02);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); /* hover:shadow-2xl */
    }
    .quote-type-option-selected {
      border-opacity: 0.5;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); /* shadow-2xl */
      transform: scale(1.02);
    }
    .quote-type-option:not(.quote-type-option-selected) {
      border-color: #E5E7EB; /* border-gray-200 */
      background-color: rgba(255, 255, 255, 0.6); /* bg-white/60 */
    }
    .quote-type-option:not(.quote-type-option-selected):hover {
      background-color: #F9FAFB; /* hover:bg-gray-50 */
    }

    /* Quote Type Gradients */
    .quote-type-option.gradient-amber-orange { background: linear-gradient(to right, #FFFBEB, #FFF8E1); } /* from-amber-50 to-orange-50 */
    .quote-type-option.gradient-blue-indigo { background: linear-gradient(to right, #EFF6FF, #EEF2FF); } /* from-blue-50 to-indigo-50 */
    .quote-type-option.gradient-rose-pink { background: linear-gradient(to right, #FFF1F2, #FDF2F8); } /* from-rose-50 to-pink-50 */

    .quote-type-content {
      display: flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: center; /* Center items when stacked */
      gap: 1.5rem; /* gap-6 */
      text-align: center; /* Center text */
    }
    .quote-type-icon-wrapper {
      padding: 1rem; /* p-4 */
      border-radius: 1rem; /* rounded-2xl */
      transition: all 0.3s ease;
    }
    .quote-type-icon-wrapper.bg-white { background-color: white; }
    .quote-type-icon-wrapper.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
    .quote-type-icon-wrapper.bg-gray-100 { background-color: #F3F4F6; }
    .quote-type-icon-wrapper.group-hover-bg-white:hover { background-color: white; }
    .quote-type-icon-wrapper.group-hover-shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }

    .quote-type-icon { /* For Lucide icons within quote type options */
      width: 1.25rem; /* w-5 */
      height: 1.25rem; /* h-5 */
      transition: transform 0.3s ease;
    }
    .quote-type-icon-wrapper:hover .quote-type-icon {
      transform: scale(1.1);
    }
    .quote-type-icon.text-amber-500 { color: #F59E0B; }
    .quote-type-icon.text-blue-500 { color: #3B82F6; }
    .quote-type-icon.text-rose-500 { color: #F43F5E; }

    .quote-type-details {
      flex: 1;
    }
    .quote-type-name-row {
      display: flex;
      flex-direction: column; /* Stack name and indicator */
      align-items: center; /* Center when stacked */
      gap: 0.75rem; /* gap-3 */
      margin-bottom: 0.75rem; /* mb-3 */
    }
    .quote-type-name {
      font-size: 1.5rem; /* text-2xl */
      font-weight: 700; /* font-bold */
      color: #1F2937; /* text-gray-800 */
    }
    .quote-type-selected-indicator {
      display: flex;
      align-items: center;
      gap: 0.25rem; /* gap-1 */
    }
    .quote-type-selected-text {
      font-size: 0.875rem; /* text-sm */
      color: #22C55E; /* text-green-600 */
      font-weight: 500; /* font-medium */
    }
    .quote-type-description {
      color: #374151; /* text-gray-700 */
      line-height: 1.625; /* leading-relaxed */
      font-size: 1.125rem; /* text-lg */
      margin-bottom: 1rem; /* mb-4 */
    }
    .quote-type-benefits {
      display: flex;
      flex-direction: column;
      gap: 0.5rem; /* space-y-2 */
    }
    .quote-type-benefits-title {
      font-size: 0.875rem; /* text-sm */
      font-weight: 600; /* font-semibold */
      color: #4B5563; /* text-gray-600 */
      margin-bottom: 0.5rem; /* mb-2 */
    }
    .quote-type-benefit-item {
      display: flex;
      align-items: center;
      gap: 0.5rem; /* gap-2 */
      font-size: 0.875rem; /* text-sm */
      color: #4B5563; /* text-gray-600 */
    }
    .quote-type-selected-dot {
      position: absolute;
      top: 1rem; /* top-4 */
      right: 1rem; /* right-4 */
      width: 1rem; /* w-4 */
      height: 1rem; /* h-4 */
      background: linear-gradient(to bottom right, #FACC15, #F97316); /* from-yellow-400 to-orange-500 */
      border-radius: 9999px; /* rounded-full */
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-lg */
    }

    /* Footer Section */
    .footer-section {
      background: linear-gradient(to right, #F9FAFB, #FFF8E1, #FFFBEB); /* from-gray-50 via-orange-50 to-amber-50 */
      padding: 2rem; /* p-8 */
      border-top: 1px solid #FFEDD5; /* border-t border-orange-100 */
      text-align: center;
    }
    .footer-content {
      display: inline-flex;
      flex-direction: column; /* Default to column for small screens */
      align-items: center;
      gap: 0.75rem; /* gap-3 */
      margin-bottom: 1rem; /* mb-4 */
    }
    .footer-om-symbol-wrapper {
      width: 3rem; /* w-12 */
      height: 3rem; /* h-12 */
      background: linear-gradient(to right, #FB923C, #EF4444); /* from-orange-400 to-red-400 */
      border-radius: 9999px; /* rounded-full */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .footer-om-symbol {
      color: white;
      font-size: 1.25rem; /* text-xl */
    }
    .footer-quote-text {
      text-align: center; /* Default to center for small screens */
    }
    .footer-sanskrit-quote {
      color: #374151; /* text-gray-700 */
      font-weight: 600; /* font-semibold */
      font-size: 1.125rem; /* text-lg */
      font-style: italic;
    }
    .footer-quote-translation {
      font-size: 0.875rem; /* text-sm */
      color: #6B7280; /* text-gray-500 */
    }
    .footer-info-box {
      background-color: rgba(255, 255, 255, 0.7); /* bg-white/70 */
      padding: 1rem; /* p-4 */
      border-radius: 0.75rem; /* rounded-xl */
      border: 1px solid #FFEDD5; /* border-orange-200 */
    }
    .footer-info-text {
      font-size: 0.875rem; /* text-sm */
      color: #4B5563; /* text-gray-600 */
    }

    /* General Utility Classes for Icons and SR-Only */
    .icon {
      width: 1.25rem; /* w-5 */
      height: 1.25rem; /* h-5 */
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    /* Keyframe Animations */
    @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.6s ease-out; }

    @keyframes fade-in-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }

    @keyframes pop-in {
      0% { transform: scale(0.5); opacity: 0; }
      70% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

    @keyframes gentle-pulse { /* For Om symbol */
      0%, 100% { opacity: 0.18; transform: scale(1); }
      50% { opacity: 0.25; transform: scale(1.03); }
    }
    .animate-gentle-pulse { animation: gentle-pulse 4.5s infinite ease-in-out; }

    @keyframes soft-float { /* For Lotus symbol */
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-7px); }
    }
    .animate-soft-float { animation: soft-float 5.5s infinite ease-in-out; }

    @keyframes pulse { /* Original pulse for status dot */
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

    @keyframes pulse-slow { /* For loading toggle */
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    .animate-pulse-slow { animation: pulse-slow 2s infinite; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 25s linear infinite; } /* Note: Chakra uses inline style for longer duration */

    @keyframes breathing-glow { /* For active toggle */
      0%, 100% { box-shadow: 0 0 15px 3px rgba(249, 115, 22, 0.4); } /* theme('colors.orange.500') equivalent */
      50% { box-shadow: 0 0 25px 8px rgba(249, 115, 22, 0.55); }
    }
    .animate-breathing-glow { animation: breathing-glow 2.5s infinite ease-in-out; }

    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: #fff8e1; border-radius: 10px; } /* Lighter amber/saffron */
    ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #fbbf24, #f59e0b); border-radius: 10px; border: 2px solid #fff8e1;} /* Amber gradient */
    ::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #f59e0b, #ea580c); } /* Darker amber/orange on hover */

    /* Responsive Design for screens wider than 640px */
    @media (min-width: 640px) { /* Equivalent to sm: breakpoint */
      .header-section {
        flex-direction: row;
        justify-content: center;
      }
      .settings-card-header {
        flex-direction: row;
        align-items: center;
      }
      .settings-status {
        text-align: right;
      }
      .notification-toggle-section {
        flex-direction: row;
        align-items: center;
      }
      .notification-toggle-content {
        flex-direction: row;
        align-items: center;
      }
      .setting-label-group {
        flex-direction: row;
        align-items: center;
        justify-content: space-between; /* Added for expand button alignment */
      }
      .language-option-content {
        flex-direction: row;
      }
      .quote-type-content {
        flex-direction: row;
      }
      .grid-2-col {
        grid-template-columns: 1fr 1fr;
      }
      .footer-content {
        flex-direction: row;
      }
      .footer-quote-text {
        text-align: left;
      }
    }

    /* ******************************************************************* */
    /* Mobile-specific styles for screens up to 480px wide */
    /* This will override any base styles that are too large for 480px */
    /* ******************************************************************* */
    @media (max-width: 480px) {
        .page-container {
            padding: 0.5rem; /* Reduce overall padding for very small screens */
        }

        /* Adjust font sizes for readability on small screens */
        .main-title {
            font-size: 2rem; /* Smaller main title */
        }
        .greeting-text {
            font-size: 1.125rem; /* Smaller greeting text */
        }
        .sanskrit-quote {
            font-size: 0.9rem;
        }
        .quote-translation {
            font-size: 0.75rem;
        }
        .settings-card-title {
            font-size: 1.5rem;
        }
        .settings-card-subtitle {
            font-size: 1rem;
        }
        .message-text {
            font-size: 1rem;
        }
        .setting-title {
            font-size: 1.25rem;
        }
        .setting-description {
            font-size: 0.875rem;
        }
        .setting-label-text {
            font-size: 1.125rem;
        }
        .language-name, .quote-type-name {
            font-size: 1.125rem; /* Ensure these are also smaller */
        }
        .quote-type-description {
            font-size: 0.9rem; /* Smaller body text for quote types */
        }
        .footer-sanskrit-quote {
            font-size: 1rem;
        }
        .footer-quote-translation {
            font-size: 0.75rem;
        }

        /* Adjust padding and spacing for compactness */
        .greeting-card,
        .settings-body,
        .setting-section,
        .language-option,
        .quote-type-option {
            padding: 1rem; /* Reduce padding on cards/sections */
        }
        .message-box {
            padding: 0.75rem; /* Even smaller padding for messages */
            gap: 0.5rem; /* Reduced gap */
        }
        .bell-icon-container, .settings-card-icon-wrapper, .toggle-icon-wrapper, .quote-type-icon-wrapper {
            padding: 0.5rem; /* Smaller padding around icons */
        }
        .bell-icon, .settings-card-bell-icon, .toggle-bell-icon {
            width: 1.5rem; /* Smaller icons */
            height: 1.5rem;
        }
        .footer-om-symbol-wrapper {
            width: 2.5rem; /* Smaller footer symbol */
            height: 2.5rem;
        }
        .footer-om-symbol {
            font-size: 1rem;
        }

        /* Re-position and scale background elements to prevent overflow */
        .om-symbol {
            font-size: 3rem; /* Much smaller */
            top: 0.5rem;
            right: 0.5rem;
        }
        .lotus-symbol {
            font-size: 2.5rem; /* Much smaller */
            bottom: 1rem;
            left: 0.5rem;
        }
        .spinning-circle {
            width: 4rem; /* Significantly smaller */
            height: 4rem;
            left: 5%;
            top: 75%; /* Adjust vertically to keep it in view */
            filter: blur(20px); /* Less blur for better performance on mobile */
        }
        .ethereal-bg-element {
            filter: blur(20px); /* Reduce blur intensity */
            opacity: 0.015; /* Even more subtle */
            animation-duration: 30s; /* Faster drift for dynamic feel */
        }

        /* Ensure elements stack correctly */
        .header-section,
        .settings-card-header,
        .notification-toggle-section,
        .notification-toggle-content,
        .setting-label-group,
        .language-option, /* Ensure full stacking */
        .language-option-content,
        .language-name-row,
        .quote-type-option, /* Ensure full stacking */
        .quote-type-content,
        .quote-type-name-row,
        .footer-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.5rem; /* Reduced gap for stacked items */
        }
        .settings-status {
            text-align: center;
        }
        .footer-quote-text {
            text-align: center;
        }
        .info-text-box {
            flex-direction: column; /* Stack icon and text */
            text-align: center;
            padding: 0.75rem;
        }
        .info-icon {
            margin-bottom: 0.25rem; /* Add some space when stacked */
        }

        /* Input fields and selects */
        .time-input, .select-input {
            padding: 1.4rem; /* Smaller padding */
            font-size: 0.9rem; /* Smaller font size */
        }
        .input-icon {
            right: 0.75rem; /* Adjust icon position */
            width: 1rem; /* Smaller icon */
            height: 1rem;
        }

        /* Grid adjustments (already correctly set to 1fr) */
        .grid-2-col, .language-options-grid, .quote-type-options-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Dark Mode Styles */
    @media (prefers-color-scheme: dark) {
      .page-container {
        background: linear-gradient(to bottom right, #111827, #1f2937, #374151); /* Darker, richer gradient */
        color: #f3f4f6; /* gray-100 */
      }
      .greeting-card {
        background-color: rgba(31, 41, 55, 0.7); /* gray-800/70 */
        border-color: rgba(251, 146, 60, 0.2); /* orange-100 equivalent */
      }
      .greeting-text { color: #f3f4f6; } /* gray-100 */
      .sanskrit-quote { color: #d1d5db; } /* gray-300 */
      .quote-translation { color: #9ca3af; } /* gray-400 */

      .settings-card {
        background-color: rgba(31, 41, 55, 0.9); /* gray-800/90 */
        border-color: rgba(251, 146, 60, 0.2);
      }
      .settings-card-header {
        background: linear-gradient(to right, #1f2937, #374151, #4b5563); /* Darker gradient */
      }
      .message-success {
        background: linear-gradient(to right, #065F46, #047857); /* Darker green */
        color: #D1FAE5; /* Light emerald */
        border-color: #10B981;
      }
      .message-error {
        background: linear-gradient(to right, #7F1D1D, #991B1B); /* Darker red */
        color: #FEE2E2; /* Light red */
        border-color: #F87171;
      }
      .message-icon-wrapper.bg-emerald-100 { background-color: rgba(16, 185, 129, 0.2); }
      .message-icon-wrapper.bg-red-100 { background-color: rgba(239, 68, 68, 0.2); }
      .text-emerald-600 { color: #6EE7B7; } /* Lighter emerald */
      .text-red-600 { color: #F87171; } /* Lighter red */

      .setting-section {
        background: linear-gradient(to right, #1f2937, #374151, #4b5563); /* Darker gray gradient */
        border-color: #4b5563; /* gray-600 */
      }
      .toggle-icon-wrapper.bg-orange-100 { background-color: rgba(251,146,60,0.1); } /* orange-500/10 */
      .toggle-icon-wrapper.bg-gray-100 { background-color: #1f2937; } /* gray-800 */
      .toggle-bell-icon.text-orange-600 { color: #fb923c; } /* orange-400 */
      .toggle-bell-icon.text-gray-400 { color: #6b7280; } /* gray-500 */
      .setting-title { color: #f3f4f6; } /* gray-100 */
      .setting-description { color: #9ca3af; } /* gray-400 */
      .status-text { color: #6EE7B7; } /* green-300 */

      .info-text-box {
        background-color: rgba(31, 41, 55, 0.6); /* gray-800/60 */
        border-color: rgba(251, 146, 60, 0.3);
        color: #9ca3af; /* gray-400 */
      }

      .setting-label-text { color: #f3f4f6; } /* gray-100 */
      .setting-label-description { color: #9ca3af; } /* gray-400 */
      .setting-icon-circle.gradient-amber-orange { background: linear-gradient(to right, #374151, #4b5563); }
      .setting-icon-circle.gradient-blue-indigo { background: linear-gradient(to right, #374151, #4b5563); }
      .setting-icon-circle.gradient-green-emerald { background: linear-gradient(to right, #374151, #4b5563); }
      .text-amber-600 { color: #FCD34D; } /* amber-300 */
      .text-blue-600 { color: #93C5FD; } /* blue-300 */
      .text-purple-600 { color: #C4B5FD; } /* purple-300 */
      .text-rose-600 { color: #FDA4AF; } /* rose-300 */

      .time-input, .select-input {
        background-color: rgba(31, 41, 55, 0.7); /* gray-800/70 */
        border-color: #4b5563; /* gray-600 */
        color: #f3f4f6; /* gray-100 */
      }
      .time-input:focus, .select-input:focus {
        border-color: #fb923c; /* orange-400 */
        box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.2);
      }
      .input-icon { color: #fb923c; } /* orange-400 */
      .expanded-content {
        background-color: #374151; /* gray-700 */
        border-color: #4b5563; /* gray-600 */
      }
      .expanded-content-title { color: #fcd34d; } /* amber-300 */
      .grid-item { color: #9ca3af; } /* gray-400 */

      .language-option {
        background-color: rgba(31, 41, 55, 0.6); /* gray-800/60 */
        border-color: #4b5563; /* gray-600 */
      }
      .language-option-selected {
        border-color: #10B981; /* emerald-500 */
        background: linear-gradient(to right, #065F46, #047857); /* Darker green */
        box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04);
      }
      .language-option:not(.language-option-selected):hover {
        border-color: #10B981; /* emerald-500 */
        background-color: #065F46; /* Darker green */
      }
      .language-name { color: #f3f4f6; } /* gray-100 */
      .language-description { color: #FFFACD; } /* gray-400 */
      .language-sample-box {
        background-color: rgba(31, 41, 55, 0.8); /* gray-800/80 */
        border-color: #4b5563; /* gray-600 */
      }
      .language-sample-text { color: #d1d5db; } /* gray-300 */

      .quote-type-option {
        background-color: rgba(31, 41, 55, 0.6); /* gray-800/60 */
        border-color: #4b5563; /* gray-600 */
      }
      .quote-type-option.gradient-amber-orange { background: linear-gradient(to right, #374151, #4b5563); }
      .quote-type-option.gradient-blue-indigo { background: linear-gradient(to right, #374151, #4b5563); }
      .quote-type-option.gradient-rose-pink { background: linear-gradient(to right, #374151, #4b5563); }
      .quote-type-option:not(.quote-type-option-selected):hover {
        background-color: #1f2937; /* gray-800 */
      }
      .quote-type-icon-wrapper.bg-white { background-color: #1f2937; } /* gray-800 */
      .quote-type-icon-wrapper.bg-gray-100 { background-color: #1f2937; } /* gray-800 */
      .quote-type-icon-wrapper.group-hover-bg-white:hover { background-color: #1f2937; }
      .quote-type-icon.text-amber-500 { color: #FCD34D; } /* amber-300 */
      .quote-type-icon.text-blue-500 { color: #93C5FD; } /* blue-300 */
      .quote-type-icon.text-rose-500 { color: #FDA4AF; } /* rose-300 */
      .quote-type-name { color: #f3f4f6; } /* gray-100 */
      .quote-type-description { color: #d1d5db; } /* gray-300 */
      .quote-type-benefits-title { color: #9ca3af; } /* gray-400 */
      .quote-type-benefit-item { color: #9ca3af; } /* gray-400 */
      .quote-type-selected-dot { background: linear-gradient(to bottom right, #FCD34D, #FB923C); } /* amber-300 to orange-400 */

      .footer-section {
        background: linear-gradient(to right, #1f2937, #374151, #4b5563); /* Darker gray gradient */
        border-color: #4b5563; /* gray-600 */
      }
      .footer-om-symbol-wrapper {
        background: linear-gradient(to right, #FB923C, #EF4444); /* orange-400 to red-400 */
      }
      .footer-sanskrit-quote { color: #d1d5db; } /* gray-300 */
      .footer-quote-translation { color: #9ca3af; } /* gray-400 */
      .footer-info-box {
        background-color: rgba(31, 41, 55, 0.7); /* gray-800/70 */
        border-color: rgba(251, 146, 60, 0.3);
      }
      .footer-info-text { color: #9ca3af; } /* gray-400 */
    }
`}</style>
    </div>
  );
}

export default NotificationSettings;
