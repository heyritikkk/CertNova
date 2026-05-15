import React from 'react';
import { Quote } from 'lucide-react';
import './Testimonials.css';

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <span className="testimonials-chip">Testimonials</span>
        <h2>See what our learners say about CertNova</h2>
        <p>
          Students and working professionals trust CertNova to build practical Security+ skills and exam confidence.
        </p>
      </div>

      <div className="testimonial-card">
        <div className="testimonial-left">
          <Quote size={42} className="quote-mark" />
          <p className="testimonial-text">
            CertNova made Security+ preparation finally feel structured. The labs were practical, the mock tests were
            exam-focused, and I improved faster than I expected.
          </p>
          <p className="testimonial-author">Aarav Mehta / Security+ Learner</p>
        </div>

        <div className="testimonial-right">
          <div className="testimonial-avatar">AM</div>
          <h4>Aarav Mehta</h4>
          <p>Junior SOC Analyst</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
