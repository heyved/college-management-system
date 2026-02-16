import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-content">
        <div className="stats-info">
          <p className="stats-title">{title}</p>
          <h3 className="stats-value">{value}</h3>
          {trend && (
            <span className={`stats-trend ${trend.type}`}>
              {trend.value} {trend.label}
            </span>
          )}
        </div>
        
        {Icon && (
          <div className="stats-icon">
            <Icon />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;