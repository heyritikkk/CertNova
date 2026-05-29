import React, { useState } from 'react';
import './PricingModulePicker.css';

const MODULES_DATA = [
  { path: 'Web App Security', title: 'Attacker Mindset and Recon', subs: 6, labs: 1, price: '₹49' },
  { path: 'Web App Security', title: 'How the Web Works', subs: 5, labs: 1, price: 'Free' },
  { path: 'Web App Security', title: 'OWASP Top 10 In Depth', subs: 11, labs: 2, price: '₹49' },
  { path: 'Web App Security', title: 'Burp Suite Mastery', subs: 10, labs: 2, price: '₹49' },
  { path: 'Web App Security', title: 'Bug Bounty Launchpad', subs: 8, labs: 1, price: '₹49' },
  
  { path: 'AppSec Engineering', title: 'What is AppSec', subs: 5, labs: 1, price: 'Free' },
  { path: 'AppSec Engineering', title: 'Secure SDLC and Threat Modelling', subs: 8, labs: 1, price: '₹49' },
  { path: 'AppSec Engineering', title: 'API Security Deep Dive', subs: 12, labs: 2, price: '₹49' },
  { path: 'AppSec Engineering', title: 'DevSecOps Pipeline', subs: 10, labs: 2, price: '₹49' },
  { path: 'AppSec Engineering', title: 'Cloud Security and Tools', subs: 9, labs: 2, price: '₹49' },

  { path: 'Ethical Hacking', title: 'What is Ethical Hacking', subs: 5, labs: 1, price: 'Free' },
  { path: 'Ethical Hacking', title: 'Networking for Hackers', subs: 9, labs: 2, price: '₹49' },
  { path: 'Ethical Hacking', title: 'System Exploitation', subs: 11, labs: 3, price: '₹49' },
  { path: 'Ethical Hacking', title: 'Active Directory Attacks', subs: 9, labs: 2, price: '₹49' },
  { path: 'Ethical Hacking', title: 'Pentest Report Writing', subs: 7, labs: 1, price: '₹49' },
  
  { path: 'Cloud Security', title: 'Cloud Security Fundamentals', subs: 7, labs: 1, price: '₹49' },
];

const PATHS = ['All paths', 'Web App Security', 'AppSec Engineering', 'Ethical Hacking', 'Cloud Security', 'SOC Analyst'];

const PricingModulePicker = () => {
  const [activeTab, setActiveTab] = useState('All paths');

  const filteredModules = activeTab === 'All paths' 
    ? MODULES_DATA 
    : MODULES_DATA.filter(m => m.path === activeTab);

  return (
    <section className="pricing-module-section">
      <div className="module-picker-header">
        <span className="eyebrow">Or buy individual modules at ₹49 each</span>
        <p>Not ready to commit to a full path? Pick the exact modules you want. Each module includes all lessons, labs and a module certificate.</p>
      </div>

      <div className="module-tabs">
        {PATHS.map(path => (
          <button 
            key={path} 
            className={`module-tab ${activeTab === path ? 'active' : ''}`}
            onClick={() => setActiveTab(path)}
          >
            {path !== 'All paths' && <span className={`tab-dot ${path.replace(/\s+/g, '-').toLowerCase()}`}></span>}
            {path}
          </button>
        ))}
      </div>

      <div className="module-grid">
        {filteredModules.map((mod, idx) => (
          <div className="module-card" key={idx}>
            <h4 className="mod-title">
              {mod.title} {mod.price === 'Free' && <span className="mod-free-badge">Free</span>}
            </h4>
            <div className="mod-meta">
              <span>{mod.subs} sub-lessons</span>
              <span>{mod.labs} labs</span>
            </div>
            <div className="mod-price">{mod.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingModulePicker;
