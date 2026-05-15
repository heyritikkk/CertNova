import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <section className="how-section">
      <div className="how-header">
        <span className="how-chip">How It Works</span>
        <h2>Get Started In Minutes</h2>
        <p>A simple path to begin your Security+ journey with CertNova.</p>
      </div>

      <div className="how-steps">
        <div className="how-body">
          <div className="how-step-marker">1</div>
          <div className="how-left">
            <h3>Sign Up &amp; Start Your Security+ Plan</h3>
            <p>
              Create your account, choose your plan, and access structured lessons and practical labs without setup
              delays.
            </p>
            <p className="how-subtitle">After signup, you will get:</p>
            <ul>
              <li>
                <CheckCircle2 size={16} /> Personalized learning path
              </li>
              <li>
                <CheckCircle2 size={16} /> Full access to labs and mock tests
              </li>
              <li>
                <CheckCircle2 size={16} /> Clear progress and exam-readiness tracking
              </li>
            </ul>
          </div>

          <div className="how-right">
            <div className="how-card">
              <div className="how-profile">
                <div className="how-avatar">CM</div>
                <div>
                  <h4>CertNova Member</h4>
                  <p>Security+ Candidate</p>
                </div>
              </div>

              <div className="how-panel">
                <h5>YOUR LEARNING ACCESS</h5>
                <div className="how-item">
                  <div>
                    <strong>Structured Lessons</strong>
                    <span>Modules unlocked instantly</span>
                  </div>
                  <em className="active">Active</em>
                </div>
                <div className="how-item">
                  <div>
                    <strong>Practice Labs + Mock Tests</strong>
                    <span>Hands-on and exam simulation</span>
                  </div>
                  <em className="dev">Ready</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="how-body how-body-step-two">
          <div className="how-step-marker">2</div>
          <div className="how-left">
            <div className="how-code-card">
              <div className="how-code-top">fetch_user.ts</div>
              <pre>{`const lesson = await certnova.learning.get('security-plus');
console.log(lesson.progress);

{
  "module": "Threat Management",
  "status": "active",
  "score": 82
}`}</pre>
            </div>
          </div>

          <div className="how-right how-right-text">
            <h3>Choose Your Learning Modules</h3>
            <p>
              Access a complete Security+ learning path with clear module progression, practical labs, and targeted
              exam preparation.
            </p>
            <ul className="how-two-col-list">
              <li>
                <CheckCircle2 size={16} /> Threat Management
              </li>
              <li>
                <CheckCircle2 size={16} /> Network Security
              </li>
              <li>
                <CheckCircle2 size={16} /> Identity and Access
              </li>
              <li>
                <CheckCircle2 size={16} /> Security Operations
              </li>
              <li>
                <CheckCircle2 size={16} /> Vulnerability Labs
              </li>
              <li>
                <CheckCircle2 size={16} /> Exam Practice Sets
              </li>
            </ul>
          </div>
        </div>

        <div className="how-body how-body-step-two">
          <div className="how-step-marker">3</div>
          <div className="how-left">
            <h3>Integrate &amp; Scale</h3>
            <p>
              Start smoothly and scale your Security+ preparation plan as your learning pace increases.
            </p>
            <p className="how-subtitle">Scale your prep with confidence:</p>
            <ul className="how-two-col-list">
              <li>
                <CheckCircle2 size={16} /> Real-time progress monitoring
              </li>
              <li>
                <CheckCircle2 size={16} /> Adaptive practice intensity
              </li>
              <li>
                <CheckCircle2 size={16} /> Upgrade plans in one click
              </li>
              <li>
                <CheckCircle2 size={16} /> No interruption while scaling
              </li>
            </ul>
          </div>

          <div className="how-right">
            <div className="how-card">
              <div className="how-profile">
                <div className="how-avatar">UL</div>
                <div>
                  <h4>Usage Insights</h4>
                  <p>Real-time Monitoring</p>
                </div>
              </div>

              <div className="how-panel">
                <h5>CURRENT PERIOD</h5>
                <div className="how-item">
                  <div>
                    <strong>Completed Modules</strong>
                    <span>18 / 20</span>
                  </div>
                  <em className="dev">90% Done</em>
                </div>
                <div className="how-item">
                  <div>
                    <strong>Mock Test Accuracy</strong>
                    <span>82% average score</span>
                  </div>
                  <em className="active">On Track</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
