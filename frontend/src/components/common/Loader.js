import React from 'react';
import './Loader.css';

const Loader = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loader;