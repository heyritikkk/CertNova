import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Users, Star, Clock, ShieldCheck } from 'lucide-react';
import './Pricing.css';

const Pricing = ({ hideHeader = false }) => {
  return (
    <section className={`pricing-section ${hideHeader ? 'no-header' : ''}`} id="pricing">
      
      {!hideHeader && (
        <div className="pricing-main-header">
          <span className="pricing-chip">Pricing</span>
          <h2>Pick a plan that scales with you</h2>
          <p>Start small, move fast, and upgrade only when your learning path grows.</p>
        </div>
      )}

      <div className="pricing-metrics-row">
        <div className="pricing-metric">
          <div className="metric-icon"><Users size={20} className="text-primary" /></div>
          <div className="metric-data">
            <h4>4,200+</h4>
            <p>Students enrolled</p>
          </div>
        </div>
        <div className="pricing-metric">
          <div className="metric-icon"><Star size={20} style={{ color: '#eab308' }} fill="#eab308" /></div>
          <div className="metric-data">
            <h4>4.8 / 5</h4>
            <p>Average rating</p>
          </div>
        </div>
        <div className="pricing-metric">
          <div className="metric-icon"><Clock size={20} className="text-primary" /></div>
          <div className="metric-data">
            <h4>Lifetime</h4>
            <p>Access after purchase</p>
          </div>
        </div>
        <div className="pricing-metric">
          <div className="metric-icon"><ShieldCheck size={20} className="text-primary" /></div>
          <div className="metric-data">
            <h4>7-day</h4>
            <p>Refund guarantee</p>
          </div>
        </div>
      </div>

      <div className="pricing-cards three-tier">
        {/* Starter Tier */}
        <div className="pricing-card">
          <div className="pricing-card-top">
            <span className="pricing-tier-name">Starter</span>
            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">49</span>
              <span className="period">one-time</span>
            </div>
            <p className="pricing-desc">Buy individual modules — perfect if you want to try one topic before committing to a full path.</p>
            
          </div>
          <div className="pricing-features">
            <div className="feature"><Check size={16} className="check-icon" /> ₹49 per module</div>
            <div className="feature"><Check size={16} className="check-icon" /> All lessons and sub-lessons</div>
            <div className="feature"><Check size={16} className="check-icon" /> TryHackMe lab access</div>
            <div className="feature"><Check size={16} className="check-icon" /> Quiz after every lesson</div>
            <div className="feature"><Check size={16} className="check-icon" /> Module certificate</div>
            <div className="feature disabled"><Check size={16} className="check-icon" /> Path certificate</div>
            <div className="feature disabled"><Check size={16} className="check-icon" /> Discord community</div>
            <div className="feature disabled"><Check size={16} className="check-icon" /> Interview prep kit</div>
          </div>
          <div className="pricing-action-bottom">
            <p className="helper-text">Browse modules below ↓</p>
            <p className="sub-helper">No commitment, add modules anytime</p>
          </div>
        </div>

        {/* Pro Path Tier */}
        <div className="pricing-card popular">
          <div className="popular-badge">✨ Most popular</div>
          <div className="pricing-card-top">
            <span className="pricing-tier-name" style={{ color: 'var(--brand-accent-deep)' }}>⚡ Pro Path + Interview Kit</span>
            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">199</span>
              <span className="period">one-time</span>
            </div>
            <p className="pricing-strike">₹995</p>
            <p className="pricing-save">Save ₹96 vs buying modules individually</p>
            <p className="pricing-desc" style={{ marginTop: '0.8rem' }}>One complete path — all 5 modules, all labs, path certificate, plus the Interview Prep Kit. The most popular choice.</p>
          </div>
          <div className="pricing-features">
            <div className="feature"><Check size={16} className="check-icon" /> All 5 modules in your chosen path</div>
            <div className="feature"><Check size={16} className="check-icon" /> All TryHackMe labs</div>
            <div className="feature"><Check size={16} className="check-icon" /> Quiz after every lesson</div>
            <div className="feature"><Check size={16} className="check-icon" /> Path certificate (LinkedIn shareable)</div>
            <div className="feature"><Check size={16} className="check-icon" /> Interview Prep Kit included</div>
            <div className="feature"><Check size={16} className="check-icon" /> Lifetime access</div>
            <div className="feature disabled"><Check size={16} className="check-icon" /> Discord community</div>
          </div>
          <div className="pricing-action-bottom">
            <Link to="/login" className="pricing-btn primary full-width">Choose a path</Link>
            <p className="sub-helper">7-day money back guarantee</p>
          </div>
        </div>

        {/* All Access Tier */}
        <div className="pricing-card">
          <div className="pricing-card-top">
            <span className="pricing-tier-name">♡ All Access</span>
            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">999</span>
              <span className="period">one-time</span>
            </div>
            <p className="pricing-strike">₹9,487</p>
            <p className="pricing-save">Save ₹4,488 — all 10 paths for the price of 5</p>
            <p className="pricing-desc" style={{ marginTop: '0.8rem' }}>Every path, every module, every lab. Plus Discord, live Q&A, interview kit and future paths free forever.</p>
          </div>
          <div className="pricing-features">
            <div className="feature"><Check size={16} className="check-icon" /> All 10 paths unlocked instantly</div>
            <div className="feature"><Check size={16} className="check-icon" /> 50+ modules, 180+ sub-lessons</div>
            <div className="feature"><Check size={16} className="check-icon" /> All labs + lab tests</div>
            <div className="feature"><Check size={16} className="check-icon" /> All path certificates</div>
            <div className="feature"><Check size={16} className="check-icon" /> Interview Prep Kit included</div>
            <div className="feature"><Check size={16} className="check-icon" /> Private Discord community</div>
            <div className="feature"><Check size={16} className="check-icon" /> Monthly live Q&A session</div>
            <div className="feature"><Check size={16} className="check-icon" /> Resume review (1 session)</div>
          </div>
          <div className="pricing-action-bottom">
            <Link to="/login" className="pricing-btn dark full-width">Get All Access</Link>
            <p className="sub-helper">Future paths added free forever</p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Pricing;
