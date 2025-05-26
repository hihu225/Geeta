import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend_url } from './utils/backend';
import './hihu.css';

const ThemeNavigation = ({ onSelectTheme }) => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedThemeId, setSelectedThemeId] = useState(null); // <-- new state

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${backend_url}/api/themes`);
        console.log('Themes API response:', response.data);

        const themeList = Array.isArray(response.data) 
          ? response.data 
          : response.data.themes || [];

        setThemes(themeList);
      } catch (error) {
        console.error('Error fetching themes:', error);
        setError('Failed to load themes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const handleThemeSelect = (themeId) => {
    if (themeId !== selectedThemeId) {
      setSelectedThemeId(themeId); // Update current theme
      onSelectTheme(themeId);      // Notify parent
    }
  };

  const handleKeyPress = (event, themeId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeSelect(themeId);
    }
  };

  return (
      <div className="theme-navigation">
        <h3 className="theme-heading">Explore by Theme</h3>
        {loading ? (
          <div className="theme-loading">
            <div className="loading-spinner"></div>
            <span>Loading themes...</span>
          </div>
        ) : error ? (
          <div className="theme-error">
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : themes.length === 0 ? (
          <div className="theme-empty">
            <p>No themes available at the moment.</p>
          </div>
        ) : (
          <div className="theme-cards-container">
            {themes.map((theme) => (
              <div 
                key={theme._id} 
                className={`theme-card ${selectedThemeId === theme._id ? 'selected' : ''}`}
                onClick={() => handleThemeSelect(theme._id)}
                onKeyPress={(e) => handleKeyPress(e, theme._id)}
                tabIndex={0}
                role="button"
                aria-label={`Explore ${theme.name} theme`}
              >
                <h4>{theme.name}</h4>
                <p className="theme-tags">
                  {theme.tags && theme.tags.length > 0 
                    ? theme.tags.slice(0, 3).join(', ')
                    : 'Spiritual guidance'
                  }
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

export default ThemeNavigation;
