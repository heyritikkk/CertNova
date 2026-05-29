import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './PricingFAQ.css';

const FAQ_DATA = [
  { q: 'Can I buy just one module and try it?', a: 'Yes! You can purchase any individual module for ₹49 under the Starter plan.' },
  { q: 'What is the refund policy?', a: 'We offer a 7-day no-questions-asked refund guarantee on all purchases if you have completed less than 30% of the course.' },
  { q: 'Is there a student discount?', a: 'Yes, we offer a 20% discount for students with a valid university email address. Contact our support to claim it.' },
  { q: 'Can I upgrade later, for example from Pro to All Access?', a: 'Absolutely. You can upgrade your plan at any time and we will prorate the cost of your previous purchases.' },
  { q: 'Do I need TryHackMe premium for the labs?', a: 'No, all our integrated TryHackMe labs are accessible with a free TryHackMe account. We cover the infrastructure costs.' },
];

const PricingFAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    if (openIdx === idx) {
      setOpenIdx(null);
    } else {
      setOpenIdx(idx);
    }
  };

  return (
    <section className="pricing-faq-section">
      <div className="faq-grid">
        <div className="faq-left">
          <span className="faq-eyebrow">FAQ</span>
          <h2 className="faq-title">Got Questions?<br/>We've the Answers</h2>
          <p className="faq-subtitle">Everything you need to know about learning with CertNova and preparing for the CompTIA Security+ exam.</p>
          <button className="faq-ask-btn">Ask Your Question</button>
        </div>
        
        <div className="faq-right">
          <div className="faq-list">
            {FAQ_DATA.map((item, idx) => (
              <div className={`faq-item ${openIdx === idx ? 'open' : ''}`} key={idx}>
                <button className="faq-question" onClick={() => toggle(idx)}>
                  {item.q}
                  <ChevronDown size={18} className="faq-icon" />
                </button>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
