import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationCircle } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <FaExclamationCircle />
        </div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Go Back
          </button>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;