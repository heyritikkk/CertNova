import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginCyberVisual from '../components/LoginCyberVisual';
import './Login.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true' && localStorage.getItem('adminToken')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.token) {
          throw new Error(data.error || 'Invalid admin ID or password. Please try again.');
        }
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      })
      .catch((err) => {
        setError(err.message || 'Login failed.');
      });
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-card">
          <div className="login-notice">
            Admin access: sign in with your dashboard credentials only.
          </div>

          <div className="login-header">
            <h1>Admin sign-in</h1>
            <p>Use your administrator account to edit courses and site content.</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="adminUserId">Admin ID</label>
              <input
                id="adminUserId"
                name="adminUserId"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">Password</label>
              <input
                id="adminPassword"
                name="adminPassword"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="login-submit-btn">
              Continue
            </button>
          </form>
        </section>

        <LoginCyberVisual />
      </div>
    </div>
  );
};

export default AdminLogin;
