import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginCyberVisual from '../components/LoginCyberVisual';
import './Login.css';

const DEMO_EMAIL = 'learner@certnova.com';
const DEMO_PASSWORD = 'password';

function safeRedirect(path) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/courses';
  return path;
}

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectTo = safeRedirect(redirectParam);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('userAuth') === 'true' && redirectParam) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, redirectParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please try again.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      localStorage.setItem('userAuth', 'true');
      localStorage.setItem('userName', email ? email.split('@')[0] : 'Learner');
      localStorage.setItem('userEmail', email ? email.trim().toLowerCase() : '');
      navigate(redirectTo, { replace: true });
      return;
    }

    if (normalized === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD) {
      localStorage.setItem('userAuth', 'true');
      localStorage.setItem('userName', 'Learner');
      localStorage.setItem('userEmail', DEMO_EMAIL.toLowerCase());
      navigate(redirectTo, { replace: true });
      return;
    }

    setError('Invalid email or password. Please try again.');
  };

  const handleOAuthLogin = (provider) => {
    localStorage.setItem('userAuth', 'true');
    localStorage.setItem('userName', 'User');
    localStorage.setItem('userEmail', `${provider}-user@certnova.com`);
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-card">

          <div className="login-header">
            <h1>{isRegistering ? 'Create your account' : 'Sign in to CertNova'}</h1>
            <p>{isRegistering ? 'Get started with your learning journey' : 'Welcome back! Please sign in to continue'}</p>
          </div>

          <div className="login-oauth">
            <button type="button" className="oauth-btn" onClick={() => handleOAuthLogin('google')}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="oauth-btn" onClick={() => handleOAuthLogin('linkedin')}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>

          <div className="login-divider">
            <span>Or continue with email</span>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {isRegistering && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            )}

            <button type="submit" className="login-submit-btn">
              {isRegistering ? 'Sign Up' : 'Continue'}
            </button>
          </form>

          <div className="login-footer-links">
            <p className="login-new-hint">
              {isRegistering ? (
                <>Already have an account?{' '}
                  <span className="login-new-link" onClick={() => { setIsRegistering(false); setError(''); }}>
                    Sign in
                  </span>
                </>
              ) : (
                <>New user?{' '}
                  <span className="login-new-link" onClick={() => { setIsRegistering(true); setError(''); }}>
                    Sign in first
                  </span>
                </>
              )}
            </p>
          </div>
        </section>

        <LoginCyberVisual />
      </div>
    </div>
  );
};

export default Login;
