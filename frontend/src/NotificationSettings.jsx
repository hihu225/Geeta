import React, { useState, useEffect } from 'react';
import { Bell, Clock, Globe, Book, CheckCircle, XCircle } from 'lucide-react';
import {backend_url} from './utils/backend' ;
import {useNavigate} from 'react-router-dom' ;
import Cookies from 'js-cookie';
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    time: '09:00',
    timezone: 'Asia/Kolkata',
    language: 'english',
    quoteType: 'random'
  });
  const token = Cookies.get('token');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const timezones = [
    'Asia/Kolkata',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'sanskrit', label: 'Sanskrit' }
  ];

  const quoteTypes = [
    { value: 'random', label: 'Random Verse' },
    { value: 'sequential', label: 'Sequential Reading' },
    { value: 'themed', label: 'Daily Theme Based' }
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      if (!token) {
  // Redirect to login or show login prompt
  console.log('No token found');
  return;
}
      console.log(token)
      const response = await fetch(`${backend_url}/api/notifications/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings({
            enabled: data.preferences.dailyQuotes?.enabled || false,
            time: data.preferences.dailyQuotes?.time || '09:00',
            timezone: data.preferences.dailyQuotes?.timezone || 'Asia/Kolkata',
            language: data.preferences.preferences?.language || 'english',
            quoteType: data.preferences.preferences?.quoteType || 'random'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreferences = async (newSettings) => {
    setLoading(true);
    try {
      const response = await fetch(`${backend_url}/api/notifications/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Settings updated successfully!');
        setMessageType('success');
        setSettings(prev => ({ ...prev, ...newSettings }));
      } else {
        setMessage('Failed to update settings');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error updating settings');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
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

  const testNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backend_url}/api/notifications/send-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Test notification sent!');
        setMessageType('success');
      } else {
        setMessage('Failed to send test notification');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error sending test notification');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-800">Daily Bhagavad Gita Quotes</h2>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 mb-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {messageType === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-800">Enable Daily Quotes</h3>
            <p className="text-sm text-gray-600">Receive inspirational verses from Bhagavad Gita daily</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enabled ? 'bg-orange-600' : 'bg-gray-300'
            } ${loading ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.enabled && (
          <>
            {/* Time Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <Clock className="w-5 h-5" />
                Daily Notification Time
              </label>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Timezone Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <Globe className="w-5 h-5" />
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800">
                <Book className="w-5 h-5" />
                Language Preference
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Quote Type Selection */}
            <div className="space-y-2">
              <label className="font-semibold text-gray-800">Quote Type</label>
              <div className="grid grid-cols-1 gap-2">
                {quoteTypes.map(type => (
                  <label key={type.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="quoteType"
                      value={type.value}
                      checked={settings.quoteType === type.value}
                      onChange={(e) => handleChange('quoteType', e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">
                        {type.value === 'random' && 'Get a different verse each day'}
                        {type.value === 'sequential' && 'Read through the Gita systematically'}
                        {type.value === 'themed' && 'Verses relevant to daily life challenges'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Test Notification */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={testNotification}
                disabled={loading}
                className="w-full py-3 px-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Test Notification'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Daily quotes are generated using AI from authentic Bhagavad Gita verses</li>
          <li>• Notifications include verse reference, translation, and practical guidance</li>
          <li>• You can customize timing, language, and quote style preferences</li>
          <li>• Enable browser notifications to receive quotes even when the app is closed</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;