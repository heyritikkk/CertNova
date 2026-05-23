import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Award, Download, Linkedin, Twitter, Facebook, MessageCircle, Link2, Check } from 'lucide-react';
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

export default function Certificate() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certId] = useState(generateCertId);
  const [saved, setSaved] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/courses/${slug}`)
      .then((r) => r.json())
      .then((d) => { setCourse(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (course && !saved) {
      saveCertificateToServer(certId, course);
      setSaved(true);
    }
  }, [course, certId, saved]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Certificate of Completion</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Georgia', serif; }
        .cert-print { width: 900px; padding: 50px; text-align: center; border: 8px solid #f48b60; }
        .cert-print h1 { font-size: 2.5rem; color: #0f172a; margin-bottom: 0.5rem; }
        .cert-print .sub { font-size: 1.1rem; color: #64748b; margin-bottom: 2rem; }
        .cert-print .name { font-size: 2rem; color: #f48b60; font-weight: 700; margin: 1.5rem 0; }
        .cert-print .course-name { font-size: 1.5rem; color: #0f172a; font-weight: 600; margin: 1rem 0; }
        .cert-print .details { color: #64748b; font-size: 0.95rem; margin-top: 2rem; }
        .cert-print .cert-id { color: #94a3b8; font-size: 0.8rem; margin-top: 1.5rem; }
      </style></head><body>
        <div class="cert-print">
          <h1>Certificate of Completion</h1>
          <p class="sub">This is proudly presented to</p>
          <div class="name">${getUserName()}</div>
          <p class="sub">for successfully completing the course</p>
          <div class="course-name">${course?.title || slug}</div>
          <div class="details">Completed on ${getCompletionDate(course?.id)}</div>
          <div class="cert-id">Certificate ID: ${certId}</div>
        </div>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
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
    { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(courseUrl)}&summary=${encodeURIComponent(shareText)}` },
    { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(courseUrl)}` },
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(courseUrl)}` },
    { name: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + courseUrl)}` },
  ];

  return (
    <div className="cert-page">
      <div className="cert-container">
        <div className="cert-actions">
          <button type="button" className="cert-print-btn" onClick={handlePrint}>
            <Download size={16} /> Download PDF
          </button>
        </div>

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
