import React from 'react';
import { Check, X } from 'lucide-react';
import './PricingDetailedCompare.css';

const PricingDetailedCompare = () => {
  const features = [
    { name: 'Modules access', starter: '1 Module', pro: 'Full path (5 modules)', all: 'All 10 paths' },
    { name: 'TryHackMe labs', starter: true, pro: true, all: true },
    { name: 'Lesson quizzes', starter: true, pro: true, all: true },
    { name: 'Lab verification test', starter: false, pro: true, all: true },
    { name: 'Module certificate', starter: true, pro: true, all: true },
    { name: 'Path certificate', starter: false, pro: true, all: true },
    { name: 'Interview Prep Kit', starter: false, pro: true, all: true },
    { name: 'Private Discord', starter: false, pro: false, all: true },
    { name: 'Monthly live Q&A', starter: false, pro: false, all: true },
    { name: 'Code in 4 languages', starter: true, pro: true, all: true },
  ];

  const renderCheck = (value) => {
    if (typeof value === 'string') return <span className="text-val">{value}</span>;
    if (value === true) return <Check size={20} className="check-icon" />;
    return <X size={20} className="cross-icon" />;
  };

  return (
    <section className="pricing-compare-section">
      <div className="compare-header">
        <h2>Compare plans in detail</h2>
        <p>Every plan includes lifetime access and a certificate on completion.</p>
      </div>

      <div className="compare-table-container">
        <div className="compare-table">
          <div className="compare-row compare-head">
            <div className="compare-cell feature-name">Feature</div>
            <div className="compare-cell plan-name">
              Starter
              <br /><span className="plan-price">₹49/module</span>
            </div>
            <div className="compare-cell plan-name">
              <div className="pro-pill header">
                Pro Path
                <br /><span className="plan-price">₹199/path</span>
              </div>
            </div>
            <div className="compare-cell plan-name">
              All Access
              <br /><span className="plan-price">₹999</span>
            </div>
          </div>

          {features.map((feature, idx) => (
            <div className="compare-row" key={idx}>
              <div className="compare-cell feature-name">{feature.name}</div>
              <div className="compare-cell">{renderCheck(feature.starter)}</div>
              <div className="compare-cell pro">
                <div className="pro-pill">{renderCheck(feature.pro)}</div>
              </div>
              <div className="compare-cell">{renderCheck(feature.all)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingDetailedCompare;
