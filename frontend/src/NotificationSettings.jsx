import React, { useState, useEffect } from 'react';
import { Bell, Clock, Globe, Book, CheckCircle, XCircle, Sunrise, Moon, Star, Heart } from 'lucide-react';
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

  const timezones = [
    "Asia/Kolkata",
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  const languages = [
    { value: "english", label: "English", icon: "🇬🇧" },
    { value: "hindi", label: "हिंदी", icon: "🇮🇳" },
    { value: "sanskrit", label: "संस्कृत", icon: "🕉️" },
  ];

  const quoteTypes = [
    { 
      value: "random", 
      label: "Random Wisdom", 
      description: "Divine verses chosen by Krishna's grace",
      icon: <Star className="w-5 h-5 text-amber-500" />,
      color: "from-amber-50 to-orange-50 border-amber-200"
    },
    { 
      value: "sequential", 
      label: "Sacred Journey", 
      description: "Walk the path of Gita systematically",
      icon: <Sunrise className="w-5 h-5 text-blue-500" />,
      color: "from-blue-50 to-indigo-50 border-blue-200"
    },
    { 
      value: "themed", 
      label: "Life's Dharma", 
      description: "Wisdom for your daily challenges",
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      color: "from-rose-50 to-pink-50 border-rose-200"
    },
  ];

  useEffect(() => {
    fetchPreferences();
    FCMToken();
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
        setMessage("Settings updated successfully!");
        setMessageType("success");
        setSettings((prev) => ({ ...prev, ...newSettings }));
      } else {
        setMessage("Failed to update settings");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error updating settings");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleToggle = () => {
    const newEnabled = !settings.enabled;
    updatePreferences({ enabled: newEnabled });
  };

  const handleTimeChange = (time) => {
    updatePreferences({ time });
  };

  const handleChange = (field, value) => {
    updatePreferences({ [field]: value });
  };

  const getTimeGreeting = () => {
    const hour = parseInt(settings.time.split(':')[0]);
    if (hour < 6) return { icon: <Moon className="w-5 h-5" />, text: "Midnight Meditation", color: "text-indigo-600" };
    if (hour < 12) return { icon: <Sunrise className="w-5 h-5" />, text: "Morning Prayers", color: "text-amber-600" };
    if (hour < 18) return { icon: <Star className="w-5 h-5" />, text: "Afternoon Reflection", color: "text-blue-600" };
    return { icon: <Moon className="w-5 h-5" />, text: "Evening Contemplation", color: "text-purple-600" };
  };

  const timeGreeting = getTimeGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-orange-50 to-amber-50 p-4">
      {/* Decorative Om Symbol */}
      <div className="absolute top-4 right-4 text-6xl text-orange-200 opacity-30">🕉️</div>
      
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent mb-2">
            Daily Divine Wisdom
          </h1>
          <p className="text-gray-600 text-lg">
            यदा यदा हि धर्मस्य ग्लानिर्भवति भारत
          </p>
          <p className="text-sm text-gray-500 mt-1">
            "Whenever dharma declines, I manifest myself"
          </p>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sacred Notifications</h2>
                <p className="text-orange-100">Receive Krishna's teachings daily</p>
              </div>
            </div>
            {/* Decorative pattern */}
            <div className="absolute -right-8 -top-8 w-24 h-24 border-4 border-white/20 rounded-full"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 border-2 border-white/20 rounded-full"></div>
          </div>

          <div className="p-6">
            {/* Success/Error Message */}
            {message && (
              <div
                className={`flex items-center gap-2 p-4 mb-6 rounded-xl transition-all duration-300 ${
                  messageType === "success"
                    ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-200 shadow-lg shadow-emerald-100"
                    : "bg-red-50 text-red-800 border-2 border-red-200 shadow-lg shadow-red-100"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            )}

            <div className="space-y-8">
              {/* Enable/Disable Toggle with Enhanced Design */}
              <div className="relative p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-100 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Bell className={`w-6 h-6 ${settings.enabled ? 'text-orange-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Daily Gita Wisdom</h3>
                      <p className="text-gray-600">
                        Let Krishna's eternal wisdom guide your day
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 shadow-lg ${
                      settings.enabled 
                        ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-200" 
                        : "bg-gray-300 shadow-gray-200"
                    } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                        settings.enabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {settings.enabled && (
                <div className="space-y-6 animate-fade-in">
                  {/* Time Selection with Enhanced Design */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-lg font-bold text-gray-800">
                      <div className={`p-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 ${timeGreeting.color}`}>
                        {timeGreeting.icon}
                      </div>
                      <span>{timeGreeting.text}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={settings.time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-full p-4 text-lg border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      />
                      <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-500 ml-2">
                      Choose the perfect time for daily spiritual nourishment
                    </p>
                  </div>

                  {/* Timezone Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-lg font-bold text-gray-800">
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      Your Sacred Time Zone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleChange("timezone", e.target.value)}
                      className="w-full p-4 text-lg border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz} className="py-2">
                          {tz.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Selection with Icons */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-lg font-bold text-gray-800">
                      <div className="p-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                        <Book className="w-5 h-5 text-green-600" />
                      </div>
                      Sacred Language
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {languages.map((lang) => (
                        <label
                          key={lang.value}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            settings.language === lang.value
                              ? "border-green-400 bg-green-50 shadow-lg shadow-green-100"
                              : "border-gray-200 bg-white/50 hover:border-green-200 hover:bg-green-50"
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
                          <span className="text-2xl">{lang.icon}</span>
                          <span className="text-lg font-medium">{lang.label}</span>
                          {settings.language === lang.value && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quote Type Selection with Enhanced Cards */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-gray-800">Choose Your Spiritual Path</label>
                    <div className="grid grid-cols-1 gap-4">
                      {quoteTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`group relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                            settings.quoteType === type.value
                              ? `bg-gradient-to-r ${type.color} shadow-lg transform scale-[1.02]`
                              : "border-gray-200 bg-white/50 hover:bg-gray-50"
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
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full transition-all duration-200 ${
                              settings.quoteType === type.value ? 'bg-white shadow-lg' : 'bg-gray-100 group-hover:bg-white'
                            }`}>
                              {type.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-bold text-gray-800">{type.label}</h4>
                                {settings.quoteType === type.value && (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <p className="text-gray-600 leading-relaxed">{type.description}</p>
                            </div>
                          </div>
                          {/* Decorative corner */}
                          {settings.quoteType === type.value && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Quote */}
          <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-6 border-t border-orange-100">
            <div className="text-center">
              <p className="text-gray-600 italic mb-2">
                "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
              </p>
              <p className="text-sm text-gray-500">
                You have the right to perform your actions, but never to the fruits of action
              </p>
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
          animation: fade-in 0.5s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #ea580c);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #dc2626);
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings;