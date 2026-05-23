import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayeredCards from './LayeredCards';
import './Hero.css';

const HERO_TITLE = 'Turning&nbsp;Effort<br/>into Security+<br/>Success';
const HERO_SUBHEADING = 'Built to simplify Security+ preparation through structured lessons, practical labs, mock exams, and real-world cybersecurity training designed to help students pass.';

const HERO_SUBJECTS = [
  'Network Security',
  'Cryptography',
  'Threat Management',
  'Identity & Access',
  'Risk & Compliance',
  'Incident Response',
  'Secure Protocols',
  'Vulnerability Assessment',
  'Security Architecture',
  'Governance & Policies',
];

const Hero = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState({
    title: HERO_TITLE,
    description: HERO_SUBHEADING,
    button_text: 'Log In'
  });

  useEffect(() => {
    // Fetch content from our SQL backend
    fetch('http://localhost:5000/api/content')
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setContent({
            ...data,
            title: HERO_TITLE,
            description: HERO_SUBHEADING
          });
        }
      })
      .catch(err => console.error('Failed to fetch content:', err));
  }, []);

  return (
    <div className="hero-section">
      <div className="hero-container">
        
        {/* Left Content Area */}
        <div className="hero-content">
          <h1 
            className="hero-title"
            dangerouslySetInnerHTML={{ __html: content.title }}
          />
          <p className="hero-description">
            {content.description}
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="hero-btn secondary"
              onClick={() => navigate('/login')}
            >
              Start Learning
            </button>
            <button
              type="button"
              className="hero-btn primary"
              onClick={() => navigate('/courses')}
            >
              Browse courses
            </button>
          </div>
        </div>

        {/* Right Cards Area */}
        <div className="hero-visual">
          <LayeredCards />
        </div>
      </div>

      <div className="hero-subjects" aria-label="Security+ study topics">
        <div className="hero-subjects__viewport">
          <div className="hero-subjects__track">
            {[...HERO_SUBJECTS, ...HERO_SUBJECTS, ...HERO_SUBJECTS].map((subject, index) => (
              <span key={`${subject}-${index}`} className="hero-subjects__item">
                {subject}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
