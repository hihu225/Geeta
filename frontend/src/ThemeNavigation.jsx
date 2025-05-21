// Add this component to your App.jsx or create a new ThemeNavigation.jsx file

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ThemeNavigation = ({ onSelectTheme }) => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchThemes = async () => {
    try {
      const response = await axios.get('/api/themes');
      console.log('Themes API response:', response.data);
      
      // Adjust here based on actual shape of response.data
      const themeList = Array.isArray(response.data) 
        ? response.data 
        : response.data.themes || [];

      setThemes(themeList);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchThemes();
}, []);


  return (
    <div className="theme-navigation">
      <h3 className="theme-heading">Explore by Theme</h3>
      {loading ? (
        <div className="theme-loading">Loading themes...</div>
      ) : (
        <div className="theme-cards-container">
          {themes.map((theme) => (
            <div 
              key={theme._id} 
              className="theme-card"
              onClick={() => onSelectTheme(theme.name)}
            >
              <h4>{theme.name}</h4>
              <p className="theme-tags">
                {theme.tags.slice(0, 3).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeNavigation;