import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Award, Download, Link2, Check, AlertTriangle,
} from 'lucide-react';
import { generateCertificate } from '../lib/generateCertificate';
import './Certificate.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function generateCertId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'CN-';
  for (let i = 0; i < 10; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getCompletionDate(courseId) {
  try {
    const raw = localStorage.getItem(`certnova-course-certificate-${courseId}`);
    if (raw) return JSON.parse(raw).date;
  } catch {}
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  return date;
}

function getUserName() {
  try {
    const email = localStorage.getItem('userEmail') || 'learner@certnova.com';
    return email.split('@')[0];
  } catch {
    return 'Learner';
  }
}

function getUserEmail() {
  return localStorage.getItem('userEmail') || 'learner@certnova.com';
}

function saveCertificateToServer(certId, course) {
  const payload = {
    id: certId,
    course_slug: course.slug,
    course_title: course.title,
    user_email: getUserEmail(),
    user_name: getUserName(),
    completed_at: getCompletionDate(course.id),
  };
  fetch(`${API}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

/**
 * Check if the user has completed all lessons.
 * Returns { complete: boolean, total: number, done: number }
 */
function checkCourseCompletion(course) {
  if (!course?.id) return { complete: false, total: 0, done: 0 };

  try {
    const raw = localStorage.getItem(`certnova-lesson-progress-${course.id}`);
    const completedIds = new Set(JSON.parse(raw || '[]'));

    // Parse content blocks to count visible lessons
    let blocks = [];
    try {
      blocks = JSON.parse(course.content_blocks_json || '[]');
    } catch {
      blocks = course.content_blocks || [];
    }

    const visible = blocks.filter((b) => {
      if (b.hidden) return false;
      const sec = b.sectionTitle?.trim();
      const nav = b.navTitle?.trim();
      const isParent = b.type === 'markdown' && sec && nav && sec === nav;
      return !isParent;
    });

    const total = visible.length;
    const done = visible.filter((b) => completedIds.has(b.id)).length;

    return { complete: total > 0 && done >= total, total, done };
  } catch {
    return { complete: false, total: 0, done: 0 };
  }
}

export default function Certificate() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certId] = useState(generateCertId);
  const [saved, setSaved] = useState(false);
  const [certPreview, setCertPreview] = useState(null);
  const certRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/courses/${slug}`)
      .then((r) => r.json())
      .then((d) => { setCourse(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const completion = course ? checkCourseCompletion(course) : { complete: false, total: 0, done: 0 };

  useEffect(() => {
    if (course && !saved && completion.complete) {
      saveCertificateToServer(certId, course);
      setSaved(true);
    }
  }, [course, certId, saved, completion.complete]);

  // Generate preview once course is loaded + complete
  useEffect(() => {
    if (course && completion.complete) {
      const dataUrl = generateCertificate({
        userName: getUserName(),
        courseTitle: course.title,
        completionDate: getCompletionDate(course.id),
        certId,
        instructorName: course.instructor_name || 'CertNova Team',
      });
      setCertPreview(dataUrl);
    }
  }, [course, completion.complete, certId]);

  const handleDownload = () => {
    if (!certPreview) return;
    const link = document.createElement('a');
    link.download = `CertNova-Certificate-${slug}.png`;
    link.href = certPreview;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="cert-page">
        <div className="cert-loading">Loading…</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cert-page">
        <div className="cert-error">
          <h2>Course not found</h2>
          <Link to="/courses">Browse courses</Link>
        </div>
      </div>
    );
  }

  /* ── COMPLETION GUARD ── */
  if (!completion.complete) {
    const pct = completion.total > 0 ? Math.round((completion.done / completion.total) * 100) : 0;
    return (
      <div className="cert-page">
        <div className="cert-guard">
          <div className="cert-guard__icon">
            <AlertTriangle size={48} />
          </div>
          <h1>Course Not Yet Completed</h1>
          <p>
            You need to complete <strong>all lessons and quizzes</strong> to earn your certificate.
          </p>

          <div className="cert-guard__progress">
            <div className="cert-guard__bar">
              <div className="cert-guard__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="cert-guard__stats">
              {completion.done} / {completion.total} lessons ({pct}%)
            </span>
          </div>

          <Link to={`/courses/${slug}/learn`} className="cert-guard__btn">
            ← Continue Learning
          </Link>
        </div>
      </div>
    );
  }

  /* ── CERTIFICATE VIEW ── */
  const userName = getUserName();
  const completionDate = getCompletionDate(course.id);
  const courseUrl = `${window.location.origin}/courses/${slug}`;
  const certUrl = `${window.location.origin}/verify-certificate?id=${certId}`;
  const shareText = `I just completed "${course.title}" on CertNova! 🎉`;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLinks = [
    { name: 'LinkedIn', icon: Link2, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(courseUrl)}&summary=${encodeURIComponent(shareText)}` },
    { name: 'Twitter', icon: Link2, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(courseUrl)}` },
    { name: 'Facebook', icon: Link2, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(courseUrl)}` },
    { name: 'WhatsApp', icon: Link2, url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + courseUrl)}` },
  ];

  return (
    <div className="cert-page">
      <div className="cert-container">
        <div className="cert-actions">
          <button type="button" className="cert-print-btn" onClick={handleDownload}>
            <Download size={16} /> Download Certificate
          </button>
        </div>

        {/* Canvas-rendered certificate preview */}
        {certPreview ? (
          <div className="cert-canvas-preview" ref={certRef}>
            <img
              src={certPreview}
              alt={`Certificate of Completion — ${course.title}`}
              className="cert-canvas-img"
            />
          </div>
        ) : (
          <div className="cert-card" ref={certRef}>
            <div className="cert-badge">
              <Award size={48} />
            </div>

            <h1 className="cert-title">Certificate of Completion</h1>
            <p className="cert-sub">This is proudly presented to</p>

            <div className="cert-name">{userName}</div>

            <p className="cert-sub">for successfully completing the course</p>
            <div className="cert-course-name">{course.title}</div>

            <div className="cert-footer">
              <div className="cert-footer-item">
                <span className="cert-footer-label">Completion Date</span>
                <span className="cert-footer-value">{completionDate}</span>
              </div>
              <div className="cert-footer-divider" />
              <div className="cert-footer-item">
                <span className="cert-footer-label">Certificate ID</span>
                <span className="cert-footer-value">{certId}</span>
              </div>
            </div>

            <div className="cert-check">
              <CheckCircle2 size={20} /> Verified & Authentic
            </div>

            <p className="cert-verify-note">
              Verify this certificate at{' '}
              <Link to="/verify-certificate">CertNova /verify-certificate</Link>
            </p>
          </div>
        )}

        <div className="cert-share">
          <p className="cert-share-label">Share your achievement</p>
          <div className="cert-share-icons">
            {shareLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-share-link"
                title={`Share on ${s.name}`}
              >
                <s.icon size={20} />
              </a>
            ))}
            <button
              type="button"
              className={`cert-share-link cert-share-link--copy${copied ? ' is-copied' : ''}`}
              onClick={handleCopyLink}
              title="Copy certificate link"
            >
              {copied ? <Check size={20} /> : <Link2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
