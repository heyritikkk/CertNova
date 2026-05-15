import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">CertNova</h2>
            <p className="footer-description">
              Built to simplify Security+ preparation through structured lessons, practical labs, mock exams, and real-world cybersecurity training designed to help students pass.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#download">Download</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="footer-column">
              <h4>Legal Terms</h4>
              <a href="#terms">Terms & Conditions</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <h1 className="footer-massive-text">CertNova</h1>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
