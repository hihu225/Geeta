// Add this component to your App.jsx or create a new ThemeDetails.jsx file

import React from 'react';

const ThemeDetails = ({ themeData, onClose }) => {
  if (!themeData) return null;
  
  const { name, description, verses, krishnaAdvice } = themeData;
  
  return (
    <div className="theme-details-container">
      <div className="theme-details-header">
        <h2>{name}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="theme-description">
        <p>{description}</p>
      </div>
      
      <div className="krishna-advice-container">
        <h3>Krishna's Advice</h3>
        <p style={{
          fontWeight:400,
        }}>{krishnaAdvice}</p>
      </div>
      
      <div className="theme-verses-container">
        <h3>Relevant Verses</h3>
        {verses.map((verse, index) => (
          <div key={index} className="verse-card">
            <div className="verse-header">
              <h4>Chapter {verse.chapter}, Verse {verse.verse}</h4>
            </div>
            
            <div className="shloka-container">
              <p className="shloka-sanskrit">{verse.shloka}</p>
              <p
                className="shloka-translation"
                style={{ fontWeight: 500 }}>
                {verse.translation}
              </p>

            </div>
            
            <div className="verse-explanation">
              <p>{verse.explanation}</p>
            </div>
            
            <div className="verse-relevance">
              <h5>Why this verse?</h5>
              <p style={{
                    fontWeight: 500,             
                    fontSize: '1.05rem',         
                    lineHeight: '1.6',           
                    color: 'white'       
                  }}>
              {verse.relevance}
              </p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeDetails;