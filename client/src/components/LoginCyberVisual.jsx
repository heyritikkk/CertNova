import React, { useId } from 'react';

/**
 * Right-hand cyber graphic used on login-style pages.
 */
const LoginCyberVisual = () => {
  const uid = useId().replace(/:/g, '');
  const glowId = `cyberGlow-${uid}`;

  return (
    <section className="login-visual">
      <div className="visual-card cyber-portal" aria-hidden="true">
        <div className="cyber-stack">
          <svg className="cyber-arcs" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(244, 139, 96, 0.55)"
              strokeWidth="0.45"
              strokeDasharray="14 7 4 9 12 6"
              strokeLinecap="round"
              filter={`url(#${glowId})`}
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(255, 200, 180, 0.62)"
              strokeWidth="0.35"
              strokeDasharray="10 12 8 14"
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke="rgba(250, 128, 90, 0.5)"
              strokeWidth="0.5"
              strokeDasharray="18 10 6 10"
              strokeLinecap="round"
              filter={`url(#${glowId})`}
            />
            <circle
              cx="50"
              cy="50"
              r="26"
              fill="none"
              stroke="rgba(233, 212, 255, 0.62)"
              strokeWidth="0.3"
              strokeDasharray="6 14 6 14"
              strokeLinecap="round"
            />
          </svg>
          <div className="cyber-orb cyber-orb-left" />
          <div className="cyber-orb cyber-orb-right" />
          <div className="cyber-orb cyber-orb-small" />
          <div className="cyber-core">
            <div className="cyber-core-inner">
              <svg className="cyber-shield-lock" viewBox="0 0 100 100" aria-hidden>
                <path
                  d="M50 12 L78 24 L78 50 C78 68 64 84 50 90 C36 84 22 68 22 50 L22 24 Z"
                  fill="none"
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M42 44 L42 40 C42 33 45 28 50 28 C55 28 58 33 58 40 L58 44"
                  fill="none"
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="38"
                  y="44"
                  width="24"
                  height="22"
                  rx="3.5"
                  fill="none"
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth="2"
                />
                <circle cx="50" cy="54" r="2.8" fill="rgba(255,255,255,0.85)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="visual-copy">
        <h2>Core Cybersecurity Learning</h2>
        <p>
          Build and follow structured Security+ courses with labs, quizzes, and a clear roadmap to exam
          readiness, all in one place.
        </p>
      </div>
    </section>
  );
};

export default LoginCyberVisual;
