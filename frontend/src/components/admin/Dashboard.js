import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBillWave,
  FaPlus,
  FaChartLine,
} from 'react-icons/fa';
import { FaUserClock } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import StatsCard from '../common/StatsCard';
import Loader from '../common/Loader';
import studentService from '../../services/studentService';
import feesService from '../../services/feesService';
import courseService from '../../services/courseService';
import facultyService from '../../services/facultyService';
import userService from '../../services/userService';
import './Dashboard.css';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: { total: 0, byDepartment: [] },
    faculty: { total: 0 },
    courses: { total: 0 },
    fees: { total: 0, paid: 0, due: 0 },
    pendingUsers: 0,
  });

  

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
  
      const [studentStats, feeStats, coursesData, facultyData, pendingData] = await Promise.all([
        studentService.getStudentStats(),
        feesService.getFeeStats(),
        courseService.getAllCourses({ limit: 1 }),
        facultyService.getAllFaculty({ limit: 1 }),
        userService.getPendingUsers({ limit: 1 }), // Add this
      ]);
  
      setStats({
        students: {
          total: studentStats.data?.totalStudents || 0,
          byDepartment: studentStats.data?.departmentWise || [],
        },
        faculty: {
          total: facultyData.pagination?.totalRecords || 0,
        },
        courses: {
          total: coursesData.pagination?.totalRecords || 0,
        },
        fees: {
          total: feeStats.data?.overall?.totalAmount || 0,
          paid: feeStats.data?.overall?.paidAmount || 0,
          due: feeStats.data?.overall?.dueAmount || 0,
        },
        pendingUsers: pendingData.pagination?.totalRecords || 0, // Add this
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome back! Here's what's happening with your college."
        actions={
          <Link to="/students/new" className="btn btn-primary">
            <FaPlus /> Quick Add Student
          </Link>
        }
      />

      <div className="stats-grid">
        <StatsCard
          title="Total Students"
          value={stats.students.total}
          icon={FaUserGraduate}
          color="primary"
        />
        <StatsCard
          title="Faculty Members"
          value={stats.faculty.total}
          icon={FaChalkboardTeacher}
          color="success"
        />
        <StatsCard
          title="Active Courses"
          value={stats.courses.total}
          icon={FaBook}
          color="info"
        />
        <StatsCard
          title="Fees Due"
          value={`₹${stats.fees.due.toLocaleString('en-IN')}`}
          icon={FaMoneyBillWave}
          color="warning"
        />
        {/* pending users card  */}
        
        {stats.pendingUsers > 0 && (
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingUsers}
            icon={FaUserClock}
            color="warning"
          />
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaChartLine /> Department-wise Distribution
            </h3>
          </div>
          <div className="department-stats">
            {stats.students.byDepartment.length > 0 ? (
              stats.students.byDepartment.map((dept) => (
                <div key={dept._id} className="department-item">
                  <div className="department-info">
                    <span className="department-name">{dept._id}</span>
                    <span className="department-count">{dept.count} students</span>
                  </div>
                  <div className="department-bar">
                    <div
                      className="department-bar-fill"
                      style={{
                        width: `${(dept.count / stats.students.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No department data available</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaMoneyBillWave /> Fee Collection Summary
            </h3>
          </div>
          <div className="fee-summary">
            <div className="fee-item">
              <span className="fee-label">Total Amount</span>
              <span className="fee-value">
                ₹{stats.fees.total.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="fee-item success">
              <span className="fee-label">Collected</span>
              <span className="fee-value">
                ₹{stats.fees.paid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="fee-item warning">
              <span className="fee-label">Pending</span>
              <span className="fee-value">
                ₹{stats.fees.due.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="fee-progress">
              <div className="fee-progress-bar">
                <div
                  className="fee-progress-fill"
                  style={{
                    width: `${
                      stats.fees.total > 0
                        ? (stats.fees.paid / stats.fees.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="fee-percentage">
                {stats.fees.total > 0
                  ? ((stats.fees.paid / stats.fees.total) * 100).toFixed(1)
                  : 0}
                % collected
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions">
          <Link to="/pending-users" className="quick-action-btn">
            <FaUserClock />
            <span>Pending Users</span>
          </Link>
            <Link to="/students/new" className="quick-action-btn">
              <FaUserGraduate />
              <span>Add Student</span>
            </Link>
            <Link to="/faculty/new" className="quick-action-btn">
              <FaChalkboardTeacher />
              <span>Add Faculty</span>
            </Link>
            <Link to="/courses/new" className="quick-action-btn">
              <FaBook />
              <span>Create Course</span>
            </Link>
            <Link to="/fees/new" className="quick-action-btn">
              <FaMoneyBillWave />
              <span>Record Fee</span>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;