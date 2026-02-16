import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { FaBars } from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Navbar />
      
      <div className="layout-body">
        <Sidebar className={sidebarOpen ? 'open' : ''} />
        
        <main className="main-content">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
          
          <div className="content-wrapper">
            <Outlet />
          </div>
          
          <Footer />
        </main>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default Layout;