import React from 'react';
import { FaInbox } from 'react-icons/fa';
import './EmptyState.css';

const EmptyState = ({ 
  icon: Icon = FaInbox, 
  title = 'No data found', 
  message = 'There is no data to display at the moment.',
  action 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;