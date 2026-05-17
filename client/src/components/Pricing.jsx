import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import './Pricing.css';

const Pricing = ({ hideHeader = false }) => {
  return (
    <section className={`pricing-section${hideHeader ? ' pricing-section--no-header' : ''}`} id="pricing">
      {!hideHeader && (
        <div className="pricing-header">
          <h2>
            Pick a plan that <span>scales with you</span>
          </h2>
          <p>Start small, move fast, and upgrade only when your workflow grows.</p>
        </div>
      )}

      <div className="pricing-cards">
        <div className="pricing-card">
          <div className="pricing-card-top">
            <h3>Launch</h3>
            <div className="price">
              <span className="amount">$0</span>
              <span className="period">/mo</span>
            </div>
            <p className="pricing-desc">Perfect for solo builders testing ideas and shipping their first workflows.</p>
            <Link to="/login" className="pricing-btn secondary">Get Started Free</Link>
          </div>
          <div className="pricing-features">
            <div className="feature"><Check size={18} className="check-icon" /> 3 active projects</div>
            <div className="feature"><Check size={18} className="check-icon" /> Team notes and comments</div>
            <div className="feature"><Check size={18} className="check-icon" /> Basic automation templates</div>
            <div className="feature"><Check size={18} className="check-icon" /> Web and desktop access</div>
          </div>
        </div>

        <div className="pricing-card popular">
          <div className="pricing-card-top">
            <div className="card-header-flex">
              <h3>Scale</h3>
              <span className="badge">Best Value</span>
            </div>
            <div className="price">
              <span className="amount">$24</span>
              <span className="period">/mo</span>
            </div>
            <p className="pricing-desc">Built for growing teams that need faster delivery, deeper control, and premium support.</p>
            <Link to="/login" className="pricing-btn primary">Start 14-Day Trial</Link>
          </div>
          <div className="pricing-features">
            <div className="feature"><Check size={18} className="check-icon" /> Unlimited projects and members</div>
            <div className="feature"><Check size={18} className="check-icon" /> Advanced workflow automation</div>
            <div className="feature"><Check size={18} className="check-icon" /> Custom role permissions</div>
            <div className="feature"><Check size={18} className="check-icon" /> Priority email and chat support</div>
            <div className="feature"><Check size={18} className="check-icon" /> Usage analytics and export tools</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
