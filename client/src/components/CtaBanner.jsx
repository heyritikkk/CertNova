import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TerminalSquare } from 'lucide-react';
import './CtaBanner.css';

const CtaBanner = () => {
  return (
    <section className="cta-banner-section">
      <div className="cta-banner">
        <div className="cta-float-icon left">
          <TerminalSquare size={28} />
        </div>
        <div className="cta-float-icon right">
          <ShieldCheck size={28} />
        </div>

        <h2>
          Start Preparing for
          <br />
          Security+ with CertNova
        </h2>
        <p>
          Learn with structured lessons, practical labs, and mock exams designed to help you pass with confidence.
        </p>
        <Link to="/login" className="cta-main-btn">
          Start Learning Today
          <span className="cta-btn-icon">
            <ArrowRight size={18} />
          </span>
        </Link>
      </div>
    </section>
  );
};

export default CtaBanner;
