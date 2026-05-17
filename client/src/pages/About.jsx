import { Link } from 'react-router-dom';
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

const STATS = [
  { value: '1,200+', label: 'Active learners' },
  { value: '50+', label: 'Structured lessons' },
  { value: '10h+', label: 'Guided content' },
  { value: '4.7', label: 'Average rating' },
];

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

        <ul className="about-stats" aria-label="Platform highlights">
          {STATS.map((item) => (
            <li key={item.label} className="about-stat">
              <span className="about-stat__value">{item.value}</span>
              <span className="about-stat__label">{item.label}</span>
            </li>
          ))}
        </ul>

        <section className="about-block" aria-labelledby="about-mission-heading">
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
            <article className="about-card">
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
            <h2 id="about-approach-heading">A simple path from signup to exam-ready</h2>
            <p>
              We design courses as living syllabi: modules, lessons, and outcomes your team can update in
              admin, so learners always see the latest structure on the public site.
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
          <div className="about-approach__panel" aria-hidden>
            <p className="about-approach__panel-label">Your learning journey</p>
            <ol>
              <li>
                <strong>01</strong>
                <span>Create account & pick a track</span>
              </li>
              <li>
                <strong>02</strong>
                <span>Follow modules lesson by lesson</span>
              </li>
              <li>
                <strong>03</strong>
                <span>Review weak areas & practice</span>
              </li>
              <li>
                <strong>04</strong>
                <span>Schedule your Security+ exam</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="about-cta" aria-label="Get started">
          <h2>Ready to start learning?</h2>
          <p>Explore published courses or sign in to continue where you left off.</p>
          <div className="about-cta__actions">
            <Link to="/courses" className="about-cta-btn about-cta-btn--primary">
              View courses
            </Link>
            <Link to="/login" className="about-cta-btn about-cta-btn--ghost">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
