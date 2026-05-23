import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Target,
  Eye,
  Shield,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import './About.css';

// Each stat: numeric end value, optional prefix/suffix, and label
const STATS = [
  { end: 1200, suffix: '+', label: 'Active learners' },
  { end: 50,   suffix: '+', label: 'Structured lessons' },
  { end: 10,   suffix: 'h+', label: 'Guided content' },
  { end: 4.7,  suffix: '',  label: 'Average rating', decimals: 1 },
];

/** Counts from 0 to `end` over `duration` ms, starting when `active` is true */
function useCountUp(end, duration = 1800, active = false, decimals = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, end, duration, decimals]);
  return count;
}

function AnimatedStat({ stat }) {
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const count = useCountUp(stat.end, 1800, active, stat.decimals ?? 0);
  const display = stat.decimals ? count.toFixed(stat.decimals) : Math.round(count).toLocaleString();
  return (
    <li ref={ref} className="about-stat">
      <span className="about-stat__value">{display}{stat.suffix}</span>
      <span className="about-stat__label">{stat.label}</span>
    </li>
  );
}

const VALUES = [
  {
    icon: Shield,
    title: 'Exam-first focus',
    text: 'Every module maps to Security+ objectives so you study what actually appears on the test.',
  },
  {
    icon: BookOpen,
    title: 'Learn by doing',
    text: 'Short lessons, checkpoints, and labs keep concepts practical, not just theory on slides.',
  },
  {
    icon: Users,
    title: 'Built for self-starters',
    text: 'Clear paths and progress tracking help you stay consistent without a classroom schedule.',
  },
  {
    icon: Award,
    title: 'Quality over hype',
    text: 'We ship content when it is ready, structured, reviewed, and useful for real exam prep.',
  },
];

const APPROACH = [
  'Structured syllabus aligned to CompTIA Security+ domains',
  'Bite-sized lessons you can finish between work or classes',
  'Progress tracking so you know what to review next',
  'Free and paid tracks as your team publishes new courses',
];

const About = () => {
  return (
    <div className="about-page">
      <div className="about-inner">
        <header className="about-hero">
          <span className="about-eyebrow">About CertNova</span>
          <h1>Focused Security+ exam preparation</h1>
          <p>
            CertNova helps learners prepare for the CompTIA Security+ exam with structured courses,
            practical lessons, and a clear path from first login to exam day.
          </p>
        </header>

        <section className="about-highlights" aria-labelledby="about-mission-heading">
          <ul className="about-stats" aria-label="Platform highlights">
            {STATS.map((item) => (
              <AnimatedStat key={item.label} stat={item} />
            ))}
          </ul>
          <div className="about-duo">
            <article className="about-card about-card--accent">
              <div className="about-card__icon" aria-hidden>
                <Target size={22} />
              </div>
              <h2 id="about-mission-heading">Our mission</h2>
              <p>
                Make professional cybersecurity certification accessible through clear, modern learning
                experiences without overwhelming dashboards or outdated materials.
              </p>
            </article>
            <article className="about-card about-card--vision">
              <div className="about-card__icon" aria-hidden>
                <Eye size={22} />
              </div>
              <h2>Our vision</h2>
              <p>
                A platform where anyone can build real security skills, track readiness, and walk into the
                exam with confidence, starting with Security+ and growing from there.
              </p>
            </article>
          </div>
        </section>

        <section className="about-block" aria-labelledby="about-values-heading">
          <div className="about-section-head">
            <span className="about-eyebrow">What we stand for</span>
            <h2 id="about-values-heading">Values that shape every course</h2>
          </div>
          <div className="about-values">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="about-value">
                <div className="about-value__icon" aria-hidden>
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-block about-approach" aria-labelledby="about-approach-heading">
          <div className="about-approach__copy">
            <span className="about-eyebrow">How we teach</span>
            <h2 id="about-approach-heading">From signup to exam-ready</h2>
            <p>
              Living syllabi your team updates in admin—learners always see the latest modules and lessons
              on the site.
            </p>
            <ul className="about-approach__list">
              {APPROACH.map((line) => (
                <li key={line}>
                  <CheckCircle2 size={18} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <Link to="/courses" className="about-cta-btn">
              Browse courses <ArrowRight size={18} />
            </Link>
          </div>
          <div className="about-approach__panel" aria-label="Your learning journey">
            <p className="about-approach__panel-label">Your learning journey</p>
            <div className="about-timeline">
              <div className="about-timeline-item">
                <div className="about-timeline-node">1</div>
                <div className="about-timeline-content">
                  <strong>Create account & pick a track</strong>
                  <p>Choose the course that fits your current skill level.</p>
                </div>
              </div>
              <div className="about-timeline-item">
                <div className="about-timeline-node">2</div>
                <div className="about-timeline-content">
                  <strong>Follow modules lesson by lesson</strong>
                  <p>Engage with dynamic content, checkpoints, and labs.</p>
                </div>
              </div>
              <div className="about-timeline-item">
                <div className="about-timeline-node">3</div>
                <div className="about-timeline-content">
                  <strong>Review weak areas & practice</strong>
                  <p>Track your progress and revisit tough topics.</p>
                </div>
              </div>
              <div className="about-timeline-item">
                <div className="about-timeline-node">4</div>
                <div className="about-timeline-content">
                  <strong>Schedule your Security+ exam</strong>
                  <p>Walk in with confidence and secure your certification.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-block about-team" aria-labelledby="about-team-heading">
          <div className="about-section-head">
            <span className="about-eyebrow">The faces behind CertNova</span>
            <h2 id="about-team-heading">Built by experts, for future experts</h2>
          </div>
          <div className="about-team-grid">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="about-team-member glass-card">
                <div className="about-team-avatar">
                  {/* Placeholder for actual image */}
                  <div className="about-team-avatar-placeholder" />
                </div>
                <h3>Team Member {member}</h3>
                <p className="about-team-role">Cybersecurity Instructor</p>
                <p className="about-team-bio">
                  Passionate about transforming complex networking topics into bite-sized, digestible lessons.
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
