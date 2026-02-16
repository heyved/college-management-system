import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaKey, 
  FaBars, 
  FaTimes 
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const getProfileName = () => {
    if (user?.profile) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user?.email || 'User';
  };

  const getRoleBadgeClass = () => {
    const roleClasses = {
      admin: 'role-badge-admin',
      faculty: 'role-badge-faculty',
      student: 'role-badge-student',
    };
    return roleClasses[user?.role] || 'role-badge-default';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <span className="logo-hex">H</span>
          </div>
          <span className="brand-text">College Management System</span>
        </Link>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
          <div className="navbar-user" onClick={toggleDropdown}>
            <div className="user-avatar">
              <FaUserCircle />
            </div>
            <div className="user-info">
              <span className="user-name">{getProfileName()}</span>
              <span className={`user-role ${getRoleBadgeClass()}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link 
                to="/profile" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FaUserCircle /> My Profile
              </Link>
              <Link 
                to="/change-password" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FaKey /> Change Password
              </Link>
              <div className="dropdown-divider"></div>
              <button 
                onClick={handleLogout} 
                className="dropdown-item logout-btn"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;