import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle2, XCircle, Award } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import './VerifyCertificate.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [certId, setCertId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    const id = certId.trim();
    if (!id) { setError('Please enter a certificate ID'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/certificates/verify/${encodeURIComponent(id)}`);
      const data = await r.json();
      setResult(data);
    } catch {
      setError('Could not connect to server.');
    }
    setLoading(false);
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <PageHeader 
          eyebrow="Verification"
          title="Verify Certificate"
          subtitle="Enter a Certificate ID to verify its authenticity and completion details. Securely validate student credentials and achievements instantly."
        />

        <form onSubmit={handleVerify} className="verify-form">
          <div className="verify-input-group">
            <input
              type="text"
              className="verify-input"
              placeholder="Enter Certificate ID (e.g. CN-XXXXXXXXXX)"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
            />
            <button type="submit" className="verify-btn" disabled={loading}>
              <Search size={18} /> {loading ? 'Verifying…' : 'Verify'}
            </button>
          </div>
          {error && <p className="verify-error">{error}</p>}
        </form>

        {result && (
          <div className={`verify-result ${result.valid ? 'is-valid' : 'is-invalid'}`}>
            {result.valid ? (
              <>
                <div className="verify-result-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h2>Valid Certificate</h2>
                <div className="verify-details">
                  <div className="verify-detail-row">
                    <span>Certificate ID</span>
                    <strong>{result.certificate.id}</strong>
                  </div>
                  <div className="verify-detail-row">
                    <span>Recipient</span>
                    <strong>{result.certificate.user_name || result.certificate.user_email}</strong>
                  </div>
                  <div className="verify-detail-row">
                    <span>Course</span>
                    <strong>{result.certificate.course_title}</strong>
                  </div>
                  <div className="verify-detail-row">
                    <span>Completed</span>
                    <strong>{result.certificate.completed_at}</strong>
                  </div>
                  <div className="verify-detail-row">
                    <span>Issued</span>
                    <strong>{result.certificate.created_at}</strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="verify-result-icon">
                  <XCircle size={48} />
                </div>
                <h2>Certificate Not Found</h2>
                <p className="verify-result-sub">
                  No certificate matches this ID. Please check and try again.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
