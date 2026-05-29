import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, LayoutDashboard, TrendingUp, Trophy, Bookmark, Award, TerminalSquare, Settings, LogOut, ChevronRight, Play, BookOpen, User } from 'lucide-react';
import './Navbar.css';
import './ProfileDropdown.css';

const NAV_LINKS = [
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/courses', label: 'Courses' },
  { to: '/blog', label: 'Blog' },
  { to: '/pricing', label: 'Pricing' },
];

const Navbar = ({ theme, onToggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [userAuth, setUserAuth] = useState(false);
  const [userName, setUserName] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);

  const loadLastActivity = () => {
    try {
      const raw = localStorage.getItem('certnova-last-activity');
      if (raw) setLastActivity(JSON.parse(raw));
    } catch {}
  };

  useEffect(() => {
    loadLastActivity();
    window.addEventListener('lastActivityUpdated', loadLastActivity);
    return () => window.removeEventListener('lastActivityUpdated', loadLastActivity);
  }, []);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const lastScrollY = useRef(0);
  const isLearnPage = /\/learn\/?$/.test(location.pathname);

  useEffect(() => {
    setMenuOpen(false);
    setHidden(false);
    setUserAuth(localStorage.getItem('userAuth') === 'true');
    setUserName(localStorage.getItem('userName') || 'Learner');
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userName');
    setUserAuth(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* Hide navbar on scroll-down, show on scroll-up (learn pages only) */
  useEffect(() => {
    if (!isLearnPage) { setHidden(false); return; }

    const onScroll = (e) => {
      // Use custom event detail if it's from the lesson container, otherwise window.scrollY
      const y = e.type === 'lessonScroll' ? e.detail : window.scrollY;
      
      if (y > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('lessonScroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('lessonScroll', onScroll);
    };
  }, [isLearnPage]);

  // Sync hidden state to body class so other components can react
  useEffect(() => {
    if (hidden) {
      document.body.classList.add('navbar-hidden');
    } else {
      document.body.classList.remove('navbar-hidden');
    }
    return () => document.body.classList.remove('navbar-hidden');
  }, [hidden]);

  return (
    <nav className={`navbar${hidden ? ' navbar--hidden' : ''}`} aria-label="Main">
      <div className={`navbar-container${menuOpen ? ' is-menu-open' : ''}`}>
        <div className="navbar-row">
          <div className="navbar-logo">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <h1>CertNova</h1>
            </Link>
          </div>

          <div className="navbar-links navbar-links--desktop">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                {label} <span className="nav-indicator" />
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions navbar-actions--desktop">
            <button className="nav-theme-btn" onClick={onToggleTheme} type="button">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span className="nav-theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            {userAuth ? (
              <div className="nav-profile-container" ref={dropdownRef}>
                <button 
                  className="nav-contact-btn" 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="nav-user-name">{userName}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-user">
                        <span className="profile-dropdown-name">{userName}</span>
                        <span className="profile-dropdown-badge">Hero</span>
                      </div>
                      <Link to="/profile" className="profile-dropdown-edit" onClick={() => setIsProfileOpen(false)}>
                        Edit profile <ChevronRight size={14} />
                      </Link>
                    </div>

                    {lastActivity ? (
                      <div className="profile-dropdown-course-card">
                        <div className="course-card-header">
                          <h4>{lastActivity.courseTitle}</h4>
                        </div>
                        <p className="course-card-progress-text">{lastActivity.progressPercent}% Completed</p>
                        <div className="course-card-progress-bar">
                          <div className="course-card-progress-fill" style={{ width: `${lastActivity.progressPercent}%` }}></div>
                        </div>
                        <div className="course-card-footer" style={{ marginTop: '0.8rem' }}>
                          <Link to={`/courses/${lastActivity.courseSlug}/learn${lastActivity.lessonHash || ''}`} className="course-card-resume" onClick={() => setIsProfileOpen(false)}>
                            Resume Learning <Play size={12} fill="currentColor" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="profile-dropdown-course-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>No recent activity</p>
                        <Link to="/courses" onClick={() => setIsProfileOpen(false)} className="nav-contact-btn" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                          Browse Courses
                        </Link>
                      </div>
                    )}

                    <div className="profile-dropdown-links">
                      <Link to="/dashboard" onClick={() => setIsProfileOpen(false)}><LayoutDashboard size={18} /> Dashboard</Link>
                      <Link to="/dashboard" onClick={() => setIsProfileOpen(false)}><BookOpen size={18} /> My Lessons</Link>
                      <Link to="/progress" onClick={() => setIsProfileOpen(false)}><TrendingUp size={18} /> My Progress</Link>
                      <Link to="/bookmarks" onClick={() => setIsProfileOpen(false)}><Bookmark size={18} /> Bookmarks</Link>
                      <Link to="/my-certificates" onClick={() => setIsProfileOpen(false)}><Award size={18} /> Certificates</Link>
                    </div>

                    <div className="profile-dropdown-footer">
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)}><User size={18} /> Profile</Link>
                      <Link to="/billing" onClick={() => setIsProfileOpen(false)}><Settings size={18} /> Billing</Link>
                      <button className="profile-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/courses" className="nav-contact-btn">
                Start Learning
              </Link>
            )}
          </div>

          <div className="navbar-mobile-controls">
            <button
              type="button"
              className="nav-theme-btn nav-theme-btn--icon"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              className="navbar-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="navbar-mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          id="navbar-mobile-menu"
          className={`navbar-mobile-menu${menuOpen ? ' is-open' : ''}`}
        >
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item nav-item--mobile${isActive ? ' active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          {userAuth ? (
            <div className="nav-contact-btn nav-contact-btn--mobile" style={{ cursor: 'default' }}>
              <span className="nav-user-name">{userName}</span>
            </div>
          ) : (
            <Link
              to="/courses"
              className="nav-contact-btn nav-contact-btn--mobile"
              onClick={() => setMenuOpen(false)}
            >
              Start Learning
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
