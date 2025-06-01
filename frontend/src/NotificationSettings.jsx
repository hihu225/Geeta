import React, { useState, useEffect } from 'react';
import { Bell, Clock, Globe, Book, CheckCircle, XCircle, Sunrise, Moon, Star, Heart, ChevronDown, ChevronUp, Info, Sparkles, ArrowRight } from 'lucide-react';
import { backend_url } from './utils/backend';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import FCMToken from './FCMToken';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    time: "09:00",
    timezone: "Asia/Kolkata",
    language: "english",
    quoteType: "random",
  });

  const token = Cookies.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Dynamic IST greeting
  const getISTGreeting = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = istTime.getHours();
    
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
      sample: "You have the right to perform your actions...",
      description: "Classic translations with deep meaning"
    },
    { 
      value: "hindi", 
      label: "हिंदी", 
      icon: "🇮🇳", 
      sample: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन...",
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
      icon: <Star className="w-5 h-5 text-amber-500" />,
      color: "from-amber-50 to-orange-50 border-amber-200",
      benefits: ["Unexpected wisdom", "Serendipitous guidance", "Fresh perspectives daily"]
    },
    { 
      value: "sequential", 
      label: "Sacred Journey", 
      description: "Walk through the Gita systematically, verse by verse",
      icon: <Sunrise className="w-5 h-5 text-blue-500" />,
      color: "from-blue-50 to-indigo-50 border-blue-200",
      benefits: ["Complete understanding", "Structured learning", "Progressive wisdom"]
    },
    { 
      value: "themed", 
      label: "Life Guidance", 
      description: "Receive wisdom tailored to life's daily challenges",
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      color: "from-rose-50 to-pink-50 border-rose-200",
      benefits: ["Practical wisdom", "Relevant guidance", "Contextual support"]
    },
  ];

  useEffect(() => {
    fetchPreferences();
    FCMToken();
    // Simulate initial load delay for better UX
    setTimeout(() => setIsInitialLoad(false), 1000);
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios(`${backend_url}/api/notifications/preferences`, {
        method: 'GET',
      });
      
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
    }
  };

  const updatePreferences = async (newSettings) => {
    setLoading(true);
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

  const handleToggle = () => {
    const newEnabled = !settings.enabled;
    updatePreferences({ enabled: newEnabled });
    
    // Show preview when enabling
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

  const getTimeGreeting = () => {
    const hour = parseInt(settings.time.split(':')[0]);
    if (hour < 6) return { 
      icon: <Moon className="w-5 h-5" />, 
      text: "Midnight Meditation", 
      color: "text-indigo-600",
      description: "Perfect for deep contemplation and inner peace"
    };
    if (hour < 12) return { 
      icon: <Sunrise className="w-5 h-5" />, 
      text: "Morning Prayers", 
      color: "text-amber-600",
      description: "Start your day with divine wisdom and clarity"
    };
    if (hour < 18) return { 
      icon: <Star className="w-5 h-5" />, 
      text: "Afternoon Reflection", 
      color: "text-blue-600",
      description: "Midday guidance for life's decisions"
    };
    return { 
      icon: <Moon className="w-5 h-5" />, 
      text: "Evening Contemplation", 
      color: "text-purple-600",
      description: "End your day with spiritual reflection"
    };
  };

  const timeGreeting = getTimeGreeting();
  const currentLanguage = languages.find(lang => lang.value === settings.language);
  const currentQuoteType = quoteTypes.find(type => type.value === settings.quoteType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-orange-50 to-amber-50 p-4 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 text-8xl text-orange-200 opacity-20 animate-pulse">🕉️</div>
        <div className="absolute bottom-20 left-10 text-6xl text-amber-200 opacity-15 animate-bounce">🪷</div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-orange-200 opacity-20 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
              Daily Divine Wisdom
            </h1>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
            <p className="text-2xl text-gray-700 font-semibold mb-2">
              {getISTGreeting()}, seeker of wisdom! 🙏
            </p>
            <p className="text-gray-600 text-lg mb-2">
              यदा यदा हि धर्मस्य ग्लानिर्भवति भारत
            </p>
            <p className="text-sm text-gray-500">
              "Whenever dharma declines, I manifest myself"
            </p>
          </div>
        </div>

        {/* Notification Preview */}
        {showPreview && (
          <div className="mb-6 transform animate-bounce">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-2xl border-2 border-green-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Notification Preview</p>
                  <p className="text-sm opacity-90">You'll receive your daily wisdom like this!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Settings Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm shadow-lg">
                  <Bell className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">Sacred Notifications</h2>
                  <p className="text-orange-100 text-lg">Receive Krishna's teachings daily</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-orange-100 text-sm">Status</p>
                <p className="text-white font-bold text-lg">
                  {settings.enabled ? "🟢 Active" : "⚪ Inactive"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Success/Error Message with Enhanced Design */}
            {message && (
              <div
                className={`flex items-center gap-3 p-6 mb-8 rounded-2xl transition-all duration-500 transform ${
                  messageType === "success"
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-2 border-emerald-200 shadow-xl shadow-emerald-100 scale-[1.02]"
                    : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-2 border-red-200 shadow-xl shadow-red-100 scale-[1.02]"
                }`}
              >
                <div className={`p-2 rounded-full ${messageType === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
                  {messageType === "success" ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <span className="font-medium text-lg">{message}</span>
              </div>
            )}

            <div className="space-y-8">
              {/* Enhanced Enable/Disable Toggle */}
              <div className="relative p-8 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-3xl border-2 border-orange-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${settings.enabled ? 'bg-orange-100 shadow-lg' : 'bg-gray-100'}`}>
                      <Bell className={`w-8 h-8 transition-colors duration-300 ${settings.enabled ? 'text-orange-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Daily Gita Wisdom</h3>
                      <p className="text-gray-600 text-lg">
                        Let Krishna's eternal wisdom guide your day
                      </p>
                      {settings.enabled && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-700 font-medium">Active • Next delivery at {settings.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative inline-flex h-12 w-20 items-center rounded-full transition-all duration-300 shadow-xl transform hover:scale-110 ${
                      settings.enabled 
                        ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-300" 
                        : "bg-gray-300 shadow-gray-300"
                    } ${loading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
                  >
                    <span
                      className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                        settings.enabled ? "translate-x-10" : "translate-x-2"
                      }`}
                    >
                      {settings.enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-600 m-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400 m-2" />
                      )}
                    </span>
                  </button>
                </div>
                
                {settings.enabled && (
                  <div className="mt-6 p-4 bg-white/60 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Info className="w-4 h-4" />
                      <span>Your personalized wisdom will be delivered in <strong>{currentLanguage?.label}</strong> via <strong>{currentQuoteType?.label}</strong> method</span>
                    </div>
                  </div>
                )}
              </div>

              {settings.enabled && (
                <div className="space-y-8 animate-fade-in">
                  {/* Enhanced Time Selection */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-4 text-xl font-bold text-gray-800">
                        <div className={`p-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 ${timeGreeting.color}`}>
                          {timeGreeting.icon}
                        </div>
                        <div>
                          <span>{timeGreeting.text}</span>
                          <p className="text-sm font-normal text-gray-600 mt-1">{timeGreeting.description}</p>
                        </div>
                      </label>
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {expandedSection === 'time' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="time"
                        value={settings.time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-full p-6 text-xl border-2 border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-lg"
                      />
                      <Clock className="absolute right-6 top-1/2 transform -translate-y-1/2 text-orange-400 w-6 h-6" />
                    </div>
                    
                    {expandedSection === 'time' && (
                      <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200 animate-fade-in">
                        <h4 className="font-semibold text-amber-800 mb-3">✨ Perfect Times for Spiritual Nourishment</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Sunrise className="w-4 h-4 text-amber-600" />
                            <span><strong>5-7 AM:</strong> Morning meditation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-blue-600" />
                            <span><strong>12-2 PM:</strong> Midday reflection</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-purple-600" />
                            <span><strong>6-8 PM:</strong> Evening contemplation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-600" />
                            <span><strong>9-10 PM:</strong> Bedtime peace</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Timezone Selection */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-4 text-xl font-bold text-gray-800">
                      <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      Your Sacred Time Zone
                    </label>
                    <div className="relative">
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleChange("timezone", e.target.value)}
                        className="w-full p-6 text-lg border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-lg appearance-none"
                      >
                        {timezones.map((tz) => (
                          <option key={tz.value} value={tz.value} className="py-3">
                            {tz.flag} {tz.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Enhanced Language Selection */}
                  <div className="space-y-6">
                    <label className="flex items-center gap-4 text-xl font-bold text-gray-800">
                      <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                        <Book className="w-6 h-6 text-green-600" />
                      </div>
                      Sacred Language
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      {languages.map((lang) => (
                        <label
                          key={lang.value}
                          className={`group flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                            settings.language === lang.value
                              ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl shadow-green-100 transform scale-[1.02]"
                              : "border-gray-200 bg-white/60 hover:border-green-200 hover:bg-green-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="language"
                            value={lang.value}
                            checked={settings.language === lang.value}
                            onChange={(e) => handleChange("language", e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-3xl">{lang.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">{lang.label}</span>
                                {settings.language === lang.value && (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{lang.description}</p>
                            </div>
                          </div>
                          <div className="bg-white/80 p-4 rounded-xl border border-gray-200 mt-2">
                            <p className="text-sm text-gray-700 italic">"{lang.sample}"</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Quote Type Selection */}
                  <div className="space-y-6">
                    <label className="text-xl font-bold text-gray-800">Choose Your Spiritual Path</label>
                    <div className="grid grid-cols-1 gap-6">
                      {quoteTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`group relative p-8 border-2 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                            settings.quoteType === type.value
                              ? `bg-gradient-to-r ${type.color} shadow-2xl transform scale-[1.02] border-opacity-50`
                              : "border-gray-200 bg-white/60 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="quoteType"
                            value={type.value}
                            checked={settings.quoteType === type.value}
                            onChange={(e) => handleChange("quoteType", e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-start gap-6">
                            <div className={`p-4 rounded-2xl transition-all duration-300 ${
                              settings.quoteType === type.value ? 'bg-white shadow-xl' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-lg'
                            }`}>
                              {type.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="text-2xl font-bold text-gray-800">{type.label}</h4>
                                {settings.quoteType === type.value && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-600 font-medium">Selected</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-700 leading-relaxed text-lg mb-4">{type.description}</p>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-600 mb-2">Benefits:</p>
                                {type.benefits.map((benefit, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span>{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {settings.quoteType === type.value && (
                            <div className="absolute top-4 right-4 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="bg-gradient-to-r from-gray-50 via-orange-50 to-amber-50 p-8 border-t border-orange-100">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🕉️</span>
                </div>
                <div className="text-left">
                  <p className="text-gray-700 font-semibold text-lg italic">
                    "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
                  </p>
                  <p className="text-sm text-gray-500">
                    You have the right to perform your actions, but never to the fruits of action
                  </p>
                </div>
              </div>
              
              {settings.enabled && (
                <div className="bg-white/70 p-4 rounded-xl border border-orange-200">
                  <p className="text-sm text-gray-600">
                    🙏 Your next divine message will arrive at <strong>{settings.time}</strong> in <strong>{currentLanguage?.label}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #fef3c7, #fed7aa);
          border-radius: 12px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #ea580c);
          border-radius: 12px;
          border: 2px solid #fef3c7;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #dc2626);
        }
        
        /* Enhanced focus states */
        input:focus, select:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition: all 0.2s ease-in-out;
        }
        
        /* Enhanced hover effects */
        .group:hover .group-hover\\:shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        /* Custom radio button animations */
        input[type="radio"]:checked + * {
          transform: scale(1.02);
        }
        
        /* Loading states */
        .loading {
          position: relative;
          overflow: hidden;
        }
        
        .loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        /* Mobile responsiveness improvements */
        @media (max-width: 768px) {
          .max-w-3xl {
            max-width: 100%;
            margin: 0 1rem;
          }
          
          .text-5xl {
            font-size: 2.5rem;
          }
          
          .text-3xl {
            font-size: 1.875rem;
          }
          
          .text-2xl {
            font-size: 1.5rem;
          }
          
          .p-8 {
            padding: 1.5rem;
          }
          
          .p-6 {
            padding: 1rem;
          }
          
          .gap-6 {
            gap: 1rem;
          }
          
          .gap-4 {
            gap: 0.75rem;
          }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .border-orange-100 {
            border-color: #000;
          }
          
          .text-gray-600 {
            color: #000;
          }
          
          .bg-gradient-to-r {
            background: #fff;
            color: #000;
          }
        }
        
        /* Dark mode preparation */
        @media (prefers-color-scheme: dark) {
          .bg-white\\/90 {
            background-color: rgba(31, 41, 55, 0.9);
          }
          
          .text-gray-800 {
            color: #f9fafb;
          }
          
          .text-gray-600 {
            color: #d1d5db;
          }
          
          .bg-white\\/70 {
            background-color: rgba(31, 41, 55, 0.7);
          }
        }
      `}
      </style>
    </div>
  );
}

export default NotificationSettings;