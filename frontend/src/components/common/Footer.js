import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>College Management System</h4>
          <p>Powered by Hexaware Technologies</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/help">Help & Support</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@hexaware.com</p>
          <p>Phone: +91 80 1234 5678</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Hexaware Technologies. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;