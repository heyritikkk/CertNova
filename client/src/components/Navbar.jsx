import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/courses', label: 'Courses' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
];

const Navbar = ({ theme, onToggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <nav className="navbar" aria-label="Main">
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
            <Link to="/login" className="nav-contact-btn">
              Start Learning
            </Link>
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
          <Link
            to="/login"
            className="nav-contact-btn nav-contact-btn--mobile"
            onClick={() => setMenuOpen(false)}
          >
            Start Learning
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
