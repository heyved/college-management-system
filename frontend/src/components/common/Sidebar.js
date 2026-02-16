import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserClock } from 'react-icons/fa';
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartBar,
  FaUser,
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { path: '/', icon: FaHome, label: 'Dashboard', exact: true },
    ];

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { path: '/pending-users', icon: FaUserClock, label: 'Pending Users' },
        { path: '/students', icon: FaUserGraduate, label: 'Students' },
        { path: '/faculty', icon: FaChalkboardTeacher, label: 'Faculty' },
        { path: '/courses', icon: FaBook, label: 'Courses' },
        { path: '/marks', icon: FaClipboardList, label: 'Marks' },
        { path: '/fees', icon: FaMoneyBillWave, label: 'Fees' },
        { path: '/reports', icon: FaChartBar, label: 'Reports' },
      ];
    }

    if (user?.role === 'faculty') {
      return [
        ...commonItems,
        { path: '/my-courses', icon: FaBook, label: 'My Courses' },
        { path: '/students', icon: FaUserGraduate, label: 'Students' },
        { path: '/enter-marks', icon: FaClipboardList, label: 'Enter Marks' },
        { path: '/profile', icon: FaUser, label: 'My Profile' },
      ];
    }

    if (user?.role === 'student') {
      return [
        ...commonItems,
        { path: '/my-courses', icon: FaBook, label: 'My Courses' },
        { path: '/my-marks', icon: FaClipboardList, label: 'My Marks' },
        { path: '/my-fees', icon: FaMoneyBillWave, label: 'My Fees' },
        { path: '/profile', icon: FaUser, label: 'My Profile' },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">
            <p>Version 1.0.0</p>
            <p className="copyright">© 2024 Hexaware</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;