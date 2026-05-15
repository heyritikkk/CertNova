import React from 'react';
import { Shield, Fingerprint, Lock, CheckCircle, Clock } from 'lucide-react';
import './LayeredCards.css';

const LayeredCards = () => {
  return (
    <div className="layered-cards-container">
      {/* Back Left Card */}
      <div className="card back-left-card">
        <div className="card-icon-wrapper blue-bg">
          <Lock size={20} color="#F48B60" />
        </div>
        <div className="card-content">
          <h4 className="card-title">Network Defense</h4>
          <p className="card-desc">Master firewalls, VPNs, and secure network architectures.</p>
        </div>
        <button className="card-btn">Start Module</button>
      </div>

      {/* Back Right Card */}
      <div className="card back-right-card">
        <div className="card-icon-wrapper purple-bg">
          <Fingerprint size={20} color="#F48B60" />
        </div>
        <div className="card-content">
          <h4 className="card-title">Identity Access</h4>
          <p className="card-desc">Implement Zero Trust, IAM policies, and robust auth.</p>
        </div>
        <button className="card-btn">Start Module</button>
      </div>

      {/* Front Main Card */}
      <div className="card front-card">
        <div className="front-card-inner">
          <Shield size={48} className="shield-icon" strokeWidth={1.5} />
        </div>
        <div className="front-card-content">
          <h3 className="course-title">CompTIA Security+</h3>
          <p className="course-subtitle">Complete Certification Path</p>
          <div className="course-tags">
            <span className="tag"><CheckCircle size={14}/> Beginner</span>
            <span className="tag"><Clock size={14}/> 40 Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayeredCards;
