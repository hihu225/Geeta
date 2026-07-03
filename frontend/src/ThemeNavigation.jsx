import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend_url } from './utils/backend';
import './hihu.css';

const ThemeNavigation = ({ onSelectTheme }) => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchThemes = async ({ refresh = false } = {}) => {
    try {
      if (refresh) setRefreshing(true); else setLoading(true);
      setError(null);
      const url = `${backend_url}/api/themes${refresh ? '?refresh=true' : ''}`;
      const response = await axios.get(url);
      const themeList = Array.isArray(response.data)
        ? response.data
        : response.data.themes || [];
      setThemes(themeList);
    } catch (err) {
      console.error('Error fetching themes:', err);
      setError('Failed to load themes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleThemeSelect = (themeId) => {
    onSelectTheme(themeId);
  };

  const handleKeyPress = (event, themeId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeSelect(themeId);
    }
  };

  return (
      <div className="theme-navigation">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 className="theme-heading" style={{ margin: 0 }}>Explore by Theme</h3>
          <button
            onClick={() => fetchThemes({ refresh: true })}
            disabled={refreshing || loading}
            title="Regenerate themes based on your recent conversations"
            style={{
              background: 'transparent',
              color: 'var(--gold-bright)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-full)',
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.3px',
              cursor: refreshing ? 'wait' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
              fontFamily: 'var(--font-body)',
            }}
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
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
                className="theme-card"
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