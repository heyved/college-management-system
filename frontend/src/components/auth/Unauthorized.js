import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <FaExclamationTriangle />
        </div>
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-message">
          You don't have permission to access this page.
        </p>
        <p className="unauthorized-submessage">
          If you believe this is an error, please contact your administrator.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;