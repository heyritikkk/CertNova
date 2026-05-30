import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <section className="how-section">
      <div className="how-header">
        <span className="how-chip">HOW IT WORKS</span>
        <h2>Get Started In Minutes</h2>
        <p>A simple path to begin your Security+ journey with CertNova.</p>
      </div>

      <div className="how-steps">
        <div className="how-body">
          <div className="how-step-marker">1</div>
          <div className="how-left">
            <div className="how-copy">
              <h3>Sign Up &amp; Start Security+</h3>
              <div className="how-copy-lines">
                <span className="how-copy-line">
                  Access a complete Security+ learning path with clear module progression,
                </span>
                <span className="how-copy-line">
                  practical labs, and targeted exam preparation.
                </span>
              </div>
              <div className="how-copy-benefits how-copy-benefits--tight">
                <ul className="how-benefits-list">
                  <li>
                    <span className="how-benefit-icon" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    <span className="how-benefit-text">Personalized learning path</span>
                  </li>
                  <li>
                    <span className="how-benefit-icon" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    <span className="how-benefit-text">Full access to labs and mock tests</span>
                  </li>
                  <li>
                    <span className="how-benefit-icon" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    <span className="how-benefit-text">Clear progress and exam-readiness tracking</span>
                  </li>
                </ul>
              </div>
            </div>
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
            <div className="how-copy">
              <h3>Choose Your Learning Modules</h3>
              <div className="how-copy-lines">
                <span className="how-copy-line">
                  Access a complete Security+ learning path with clear module progression,
                </span>
                <span className="how-copy-line">
                  practical labs, and targeted exam preparation.
                </span>
              </div>
              <ul className="how-two-col-list how-benefits-list how-benefits-list--grid">
                <li>
                  <span className="how-benefit-icon" aria-hidden="true">
                    <CheckCircle2 size={18} strokeWidth={2.25} />
                  </span>
                  <span className="how-benefit-text">Threat Management</span>
                </li>
                <li>
                  <span className="how-benefit-icon" aria-hidden="true">
                    <CheckCircle2 size={18} strokeWidth={2.25} />
                  </span>
                  <span className="how-benefit-text">Network Security</span>
                </li>
                <li>
                  <span className="how-benefit-icon" aria-hidden="true">
                    <CheckCircle2 size={18} strokeWidth={2.25} />
                  </span>
                  <span className="how-benefit-text">Identity and Access</span>
                </li>
                <li>
                  <span className="how-benefit-icon" aria-hidden="true">
                    <CheckCircle2 size={18} strokeWidth={2.25} />
                  </span>
                  <span className="how-benefit-text">Security Operations</span>
                </li>
                <li>
                  <span className="how-benefit-icon" aria-hidden="true">
                    <CheckCircle2 size={18} strokeWidth={2.25} />
                  </span>
                  <span className="how-benefit-text">Vulnerability Labs</span>
                </li>
                <li>
                  <span className="how-benefit-icon" aria-hidden="true">
                    <CheckCircle2 size={18} strokeWidth={2.25} />
                  </span>
                  <span className="how-benefit-text">Exam Practice Sets</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="how-body how-body-step-two">
          <div className="how-step-marker">3</div>
          <div className="how-left">
            <div className="how-copy">
              <h3>Integrate &amp; Scale</h3>
              <p className="how-copy-lead">
                Start smoothly and scale your Security+ preparation plan as your learning pace increases.
              </p>
              <div className="how-copy-benefits">
                <p className="how-copy-label">Scale your prep with confidence</p>
                <ul className="how-two-col-list how-benefits-list how-benefits-list--grid">
                  <li>
                    <span className="how-benefit-icon" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    <span className="how-benefit-text">Real-time progress monitoring</span>
                  </li>
                  <li>
                    <span className="how-benefit-icon" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    <span className="how-benefit-text">Adaptive practice intensity</span>
                  </li>
                  <li>
                    <span className="how-benefit-icon" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    <span className="how-benefit-text">Upgrade plans in one click</span>
                  </li>
                  <li>
                    <span className="how-benefit-icon" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    <span className="how-benefit-text">No interruption while scaling</span>
                  </li>
                </ul>
              </div>
            </div>
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
