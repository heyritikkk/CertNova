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
import AdminDashboard from './admin/AdminDashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Pricing from './components/Pricing';
import PricingPage from './pages/PricingPage';
import Payment from './pages/Payment';
import './App.css';

const Layout = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const hideCta = /\/learn\/?$/.test(location.pathname);

  return (
    <>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <main className="main-content">
        <Outlet />
      </main>
      {!hideCta && <CtaBanner />}
      <Footer />
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  return isAuthenticated ? children : <Navigate to="/admin-login" replace />;
};

const UserProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('userAuth') === 'true';
  if (isAuthenticated) return children;
  const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
};

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('themeMode', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
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
            <Route path="payment/:slug" element={<Payment />} />
            <Route
              path="courses/:slug/learn"
              element={
                <UserProtectedRoute>
                  <CourseLearn />
                </UserProtectedRoute>
              }
            />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="customers" element={<Customers />} />
            <Route path="partners" element={<Partners />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
