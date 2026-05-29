import { useEffect, useRef, useState } from 'react';
import { X, Copy, CheckCheck } from 'lucide-react';
import './QRModal.css';

const UPI_ID = 'certnova@upi';

export default function QRModal({ onClose, amount, courseTitle }) {
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="qrm-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="UPI Payment QR Code">
      <div className="qrm-panel">
        <button className="qrm-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

        <div className="qrm-header">
          <span className="qrm-eyebrow">Scan &amp; Pay</span>
          <h2>Pay via UPI</h2>
          <p>Scan the QR code using any UPI app - GPay, PhonePe, Paytm, etc.</p>
        </div>

        <div className="qrm-qr-wrap">
          <img src="/upi-qr.png" alt="CertNova UPI QR Code" className="qrm-qr-img" />
        </div>

        <div className="qrm-upi-row">
          <span className="qrm-upi-label">UPI ID</span>
          <code className="qrm-upi-id">{UPI_ID}</code>
          <button className="qrm-copy-btn" onClick={handleCopy} aria-label="Copy UPI ID">
            {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className="qrm-note">
          After payment, click the button below. Your course access will be activated within minutes.
        </p>

        <button className="qrm-paid-btn" onClick={onClose}>
          I've Completed the Payment
        </button>

        <p className="qrm-secure">🔒 Secured by UPI · 256-bit encrypted</p>
      </div>
    </div>
  );
}
