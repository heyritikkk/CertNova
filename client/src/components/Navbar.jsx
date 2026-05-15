import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ theme, onToggleTheme }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>CertNova</h1>
          </Link>
        </div>

        {/* Links */}
        <div className="navbar-links">
          <NavLink to="/courses" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Courses <span className="nav-indicator"></span>
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Pricing <span className="nav-indicator"></span>
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Blog <span className="nav-indicator"></span>
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            About <span className="nav-indicator"></span>
          </NavLink>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="nav-theme-btn" onClick={onToggleTheme} type="button">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Link to="/login" className="nav-contact-btn">
            Start Learning
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
