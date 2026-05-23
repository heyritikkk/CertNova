import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Smartphone, Building2, CheckCircle2, ArrowLeft } from 'lucide-react';
import QRModal from '../components/QRModal';
import './Payment.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Payment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState(null); // 'upi' | 'card' | 'netbanking'
  const [showQR, setShowQR] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/courses/${slug}`)
      .then((r) => r.json())
      .then((d) => { setCourse(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const price = Number(course?.price ?? 49.99);
  // Convert USD → INR (approx) for UPI display
  const inrAmount = (price * 83).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const handlePaid = () => {
    setShowQR(false);
    setPaid(true);
    // After 3s redirect to course learn page
    setTimeout(() => navigate(`/courses/${slug}/learn`), 3000);
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">Loading…</div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="payment-page">
        <div className="payment-success">
          <div className="payment-success__icon"><CheckCircle2 size={56} /></div>
          <h1>Payment Received! 🎉</h1>
          <p>Thank you! Your access to <strong>{course?.title}</strong> is being activated.</p>
          <p className="payment-success__sub">Redirecting you to your course…</p>
          <Link to={`/courses/${slug}/learn`} className="payment-success__btn">Go to Course →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {showQR && (
        <QRModal
          amount={`₹${inrAmount}`}
          courseTitle={course?.title}
          onClose={handlePaid}
        />
      )}

      <div className="payment-inner">
        {/* Back */}
        <Link to={`/courses/${slug}`} className="payment-back">
          <ArrowLeft size={16} /> Back to course
        </Link>

        <div className="payment-grid">
          {/* ── LEFT: Order Summary ── */}
          <div className="payment-summary">
            <h1 className="payment-title">Complete Your Order</h1>

            <div className="payment-course-card">
              <div className="payment-course-cover">
                <span className="payment-course-emoji">🔐</span>
              </div>
              <div className="payment-course-info">
                <span className="payment-course-tag">Security+</span>
                <h2>{course?.title || 'Security+ Course'}</h2>
                <p>{course?.description || 'Master the CompTIA Security+ exam with structured lessons and practice labs.'}</p>
                <ul className="payment-course-perks">
                  <li><CheckCircle2 size={14} /> Lifetime access</li>
                  <li><CheckCircle2 size={14} /> Certificate of completion</li>
                  <li><CheckCircle2 size={14} /> {course?.duration || '10h+'} content</li>
                </ul>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="payment-breakdown">
              <div className="payment-breakdown__row">
                <span>Course price</span>
                <span>${price.toFixed(2)}</span>
              </div>
              <div className="payment-breakdown__row">
                <span>Discount</span>
                <span className="payment-discount">-$0.00</span>
              </div>
              <div className="payment-breakdown__row payment-breakdown__total">
                <span>Total</span>
                <span>${price.toFixed(2)} <small>(≈ ₹{inrAmount})</small></span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="payment-trust">
              <span><ShieldCheck size={15} /> 30-Day Money Back</span>
              <span><Lock size={15} /> Secure Checkout</span>
            </div>
          </div>

          {/* ── RIGHT: Payment Methods ── */}
          <div className="payment-methods">
            <h2 className="payment-methods__title">Choose Payment Method</h2>

            <div className="payment-method-list">
              {/* UPI / QR */}
              <button
                className={`payment-method-card ${method === 'upi' ? 'is-selected' : ''}`}
                onClick={() => setMethod('upi')}
              >
                <div className="pmc-icon pmc-icon--upi">
                  <Smartphone size={22} />
                </div>
                <div className="pmc-body">
                  <strong>UPI / QR Code</strong>
                  <span>GPay, PhonePe, Paytm & more</span>
                </div>
                <div className="pmc-check" />
              </button>

              {/* Card */}
              <button
                className={`payment-method-card ${method === 'card' ? 'is-selected' : ''}`}
                onClick={() => setMethod('card')}
              >
                <div className="pmc-icon pmc-icon--card">
                  <CreditCard size={22} />
                </div>
                <div className="pmc-body">
                  <strong>Credit / Debit Card</strong>
                  <span>Visa, Mastercard, RuPay</span>
                </div>
                <div className="pmc-check" />
              </button>

              {/* Netbanking */}
              <button
                className={`payment-method-card ${method === 'net' ? 'is-selected' : ''}`}
                onClick={() => setMethod('net')}
              >
                <div className="pmc-icon pmc-icon--net">
                  <Building2 size={22} />
                </div>
                <div className="pmc-body">
                  <strong>Net Banking</strong>
                  <span>All major Indian banks</span>
                </div>
                <div className="pmc-check" />
              </button>
            </div>

            {/* Action area */}
            <div className="payment-action">
              {method === 'upi' && (
                <button className="payment-pay-btn" onClick={() => setShowQR(true)}>
                  Scan QR &amp; Pay ₹{inrAmount}
                </button>
              )}
              {method === 'card' && (
                <div className="payment-coming-soon">
                  <CreditCard size={28} />
                  <p>Card payments coming soon!</p>
                  <span>Use UPI for instant payment right now.</span>
                </div>
              )}
              {method === 'net' && (
                <div className="payment-coming-soon">
                  <Building2 size={28} />
                  <p>Net Banking coming soon!</p>
                  <span>Use UPI for instant payment right now.</span>
                </div>
              )}
              {!method && (
                <p className="payment-select-hint">← Select a payment method to continue</p>
              )}
            </div>

            <p className="payment-secure-note">
              <Lock size={12} /> All transactions are encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
