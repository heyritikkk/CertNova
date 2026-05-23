import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import './MyCertificates.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getUserEmail() {
  return localStorage.getItem('userEmail') || 'learner@certnova.com';
}

export default function MyCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = getUserEmail();

  useEffect(() => {
    fetch(`${API}/api/certificates?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => { setCerts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [email]);

  return (
    <div className="mycerts-page">
      <div className="mycerts-container">
        <div className="mycerts-header">
          <Award size={36} className="mycerts-header-icon" />
          <h1>My Certificates</h1>
          <p>Signed in as <strong>{email}</strong></p>
        </div>

        {loading && <p className="mycerts-loading">Loading…</p>}

        {!loading && certs.length === 0 && (
          <div className="mycerts-empty">
            <ShieldCheck size={48} />
            <h2>No certificates yet</h2>
            <p>Complete a course to earn your first certificate.</p>
            <Link to="/courses" className="mycerts-browse-btn">Browse courses</Link>
          </div>
        )}

        {!loading && certs.length > 0 && (
          <div className="mycerts-list">
            {certs.map((cert) => (
              <div key={cert.id} className="mycerts-card">
                <div className="mycerts-card-left">
                  <Award size={32} className="mycerts-card-icon" />
                </div>
                <div className="mycerts-card-body">
                  <h3>{cert.course_title}</h3>
                  <div className="mycerts-card-meta">
                    <span>Completed: {cert.completed_at}</span>
                    <span className="mycerts-card-id">ID: {cert.id}</span>
                  </div>
                </div>
                <div className="mycerts-card-actions">
                  <Link to={`/certificate/${cert.course_slug}`} className="mycerts-view-btn">
                    <ExternalLink size={15} /> View
                  </Link>
                  <Link to={`/verify-certificate?id=${cert.id}`} className="mycerts-verify-btn">
                    <ShieldCheck size={15} /> Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
