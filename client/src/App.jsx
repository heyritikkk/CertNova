import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CtaBanner from './components/CtaBanner';
import About from './pages/About';
import Blog from './pages/Blog';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseLearn from './pages/CourseLearn';
import Home from './pages/Home';
import Customers from './pages/Customers';
import Partners from './pages/Partners';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import AdminDashboard from './admin/AdminDashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Pricing from './components/Pricing';
import PricingPage from './pages/PricingPage';
import Payment from './pages/Payment';
import Certificate from './pages/Certificate';
import VerifyCertificate from './pages/VerifyCertificate';
import MyCertificates from './pages/MyCertificates';
import Dashboard from './pages/Dashboard';
import RoadmapPage from './pages/RoadmapPage';
import './App.css';

function safeGetStorage(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode / blocked storage).
  }
}

const Layout = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const hideCta =
    /\/learn\/?$/.test(location.pathname) ||
    location.pathname.includes('/certificate/') ||
    location.pathname === '/dashboard' ||
    location.pathname === '/profile';

  return (
    <>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <main className="main-content">
        <Outlet />
      </main>
      {!hideCta && <CtaBanner />}
      {!hideCta && <Footer />}
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    safeGetStorage('adminAuth') === 'true' &&
    Boolean(safeGetStorage('adminToken'));
  return isAuthenticated ? children : <Navigate to="/admin-login" replace />;
};

const UserProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = safeGetStorage('userAuth') === 'true';
  if (isAuthenticated) return children;
  const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
};

function getVisitorId() {
  let id = localStorage.getItem('certnova_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('certnova_visitor_id', id);
  }
  return id;
}

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const visitorId = getVisitorId();
    const email = localStorage.getItem('userEmail') || '';
    const name = localStorage.getItem('userName') || '';

    let rawReferrer = document.referrer;
    let referrer = 'Direct';
    if (rawReferrer && !rawReferrer.includes(window.location.hostname)) {
      if (rawReferrer.includes('google.com')) referrer = 'Google';
      else if (rawReferrer.includes('linkedin.com')) referrer = 'LinkedIn';
      else if (rawReferrer.includes('github.com')) referrer = 'GitHub';
      else if (rawReferrer.includes('twitter.com') || rawReferrer.includes('x.com')) referrer = 'Twitter';
      else {
        try {
          referrer = new URL(rawReferrer).hostname;
        } catch {
          referrer = rawReferrer;
        }
      }
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        email,
        name,
        referrer,
        path: location.pathname,
        action: 'visit'
      })
    }).catch(err => console.error('Analytics tracking failed:', err));
  }, [location.pathname]);

  return null;
};

function App() {
  const [theme, setTheme] = useState(() => safeGetStorage('themeMode', 'light') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    safeSetStorage('themeMode', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnalyticsTracker />
      <div className="app-container">
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/" element={<Layout theme={theme} onToggleTheme={handleToggleTheme} />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:slug" element={<CourseDetail />} />
            <Route path="payment/:slug" element={
              <UserProtectedRoute>
                <Payment />
              </UserProtectedRoute>
            } />
            <Route path="certificate/:slug" element={
              <UserProtectedRoute>
                <Certificate />
              </UserProtectedRoute>
            } />
            <Route path="verify-certificate" element={<VerifyCertificate />} />
            <Route path="my-certificates" element={
              <UserProtectedRoute>
                <MyCertificates />
              </UserProtectedRoute>
            } />
            <Route path="dashboard" element={
              <UserProtectedRoute>
                <Dashboard />
              </UserProtectedRoute>
            } />
            <Route path="progress" element={
              <UserProtectedRoute>
                <Dashboard />
              </UserProtectedRoute>
            } />
            <Route path="profile" element={
              <UserProtectedRoute>
                <Dashboard />
              </UserProtectedRoute>
            } />
            <Route
              path="courses/:slug/learn"
              element={
                <UserProtectedRoute>
                  <CourseLearn />
                </UserProtectedRoute>
              }
            />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="customers" element={<Customers />} />
            <Route path="partners" element={<Partners />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
