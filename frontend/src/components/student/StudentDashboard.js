import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FaBook,
  FaClipboardList,
  FaMoneyBillWave,
  FaGraduationCap,
  FaChartLine,
} from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import StatsCard from '../common/StatsCard';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import marksService from '../../services/marksService';
import feesService from '../../services/feesService';
import { formatCurrency, getGradeBadgeClass } from '../../utils/helpers';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    recentMarks: [],
    feesSummary: null,
    performance: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!user?.studentId) {
        toast.error('Student profile not found');
        return;
      }

      const [marksResponse, feesResponse, reportResponse] = await Promise.all([
        marksService.getMarksByStudent(user.studentId),
        feesService.getFeesByStudent(user.studentId),
        marksService.getStudentReport(user.studentId),
      ]);

      // Get recent marks (last 5)
      const allMarks = Object.values(marksResponse.data.marks || {}).flat();
      const recentMarks = allMarks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setDashboardData({
        courses: user.profile?.courses || [],
        recentMarks,
        feesSummary: feesResponse.data.summary,
        performance: reportResponse.data.overall,
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

  const { courses, recentMarks, feesSummary, performance } = dashboardData;

  return (
    <div className="dashboard">
      <PageHeader
        title={`Welcome, ${user?.profile?.firstName || 'Student'}!`}
        subtitle={`${user?.profile?.department || ''} - Semester ${
          user?.profile?.currentSemester || ''
        }`}
      />

      <div className="stats-grid">
        <StatsCard
          title="Enrolled Courses"
          value={courses.length}
          icon={FaBook}
          color="primary"
        />
        <StatsCard
          title="Overall Percentage"
          value={`${performance?.percentage || 0}%`}
          icon={FaGraduationCap}
          color="success"
        />
        <StatsCard
          title="Total Subjects"
          value={performance?.totalSubjects || 0}
          icon={FaClipboardList}
          color="info"
        />
        <StatsCard
          title="Fees Due"
          value={formatCurrency(feesSummary?.dueAmount || 0)}
          icon={FaMoneyBillWave}
          color={feesSummary?.dueAmount > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList /> Recent Marks
            </h3>
            <Link to="/my-marks" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>
          <div className="marks-list">
            {recentMarks.length > 0 ? (
              recentMarks.map((mark) => (
                <div key={mark._id} className="mark-item">
                  <div className="mark-info">
                    <h4 className="mark-course">
                      {mark.course?.courseName || 'Unknown Course'}
                    </h4>
                    <p className="mark-type">{mark.examType}</p>
                  </div>
                  <div className="mark-score">
                    <span className="marks-obtained">
                      {mark.marksObtained}/{mark.totalMarks}
                    </span>
                    <span className={`badge ${getGradeBadgeClass(mark.grade)}`}>
                      {mark.grade}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={FaClipboardList}
                title="No Marks Available"
                message="Your marks will appear here once they are published."
              />
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaChartLine /> Academic Performance
            </h3>
          </div>
          {performance ? (
            <div className="performance-summary">
              <div className="performance-item">
                <span className="performance-label">Total Marks</span>
                <span className="performance-value">
                  {performance.obtainedMarks} / {performance.totalMarks}
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Percentage</span>
                <span className="performance-value large">
                  {performance.percentage}%
                </span>
              </div>
              <div className="performance-progress">
                <div className="performance-progress-bar">
                  <div
                    className="performance-progress-fill"
                    style={{ width: `${performance.percentage}%` }}
                  ></div>
                </div>
              </div>
              <Link to="/my-marks" className="btn btn-primary btn-block mt-3">
                View Detailed Report
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={FaChartLine}
              title="No Performance Data"
              message="Your performance data will be available once marks are published."
            />
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaMoneyBillWave /> Fee Status
            </h3>
          </div>
          {feesSummary ? (
            <div className="fee-summary">
              <div className="fee-item">
                <span className="fee-label">Total Amount</span>
                <span className="fee-value">
                  {formatCurrency(feesSummary.totalAmount)}
                </span>
              </div>
              <div className="fee-item success">
                <span className="fee-label">Paid</span>
                <span className="fee-value">
                  {formatCurrency(feesSummary.paidAmount)}
                </span>
              </div>
              <div className="fee-item warning">
                <span className="fee-label">Due</span>
                <span className="fee-value">
                  {formatCurrency(feesSummary.dueAmount)}
                </span>
              </div>
              <div className="fee-progress">
                <div className="fee-progress-bar">
                  <div
                    className="fee-progress-fill"
                    style={{
                      width: `${
                        feesSummary.totalAmount > 0
                          ? (feesSummary.paidAmount / feesSummary.totalAmount) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <Link to="/my-fees" className="btn btn-outline btn-block mt-3">
                View Fee Details
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={FaMoneyBillWave}
              title="No Fee Records"
              message="Your fee information will appear here."
            />
          )}
        </div>

        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3 className="card-title">Quick Links</h3>
          </div>
          <div className="quick-actions vertical">
            <Link to="/my-courses" className="quick-action-btn">
              <FaBook />
              <span>My Courses</span>
            </Link>
            <Link to="/my-marks" className="quick-action-btn">
              <FaClipboardList />
              <span>View Marks</span>
            </Link>
            <Link to="/my-fees" className="quick-action-btn">
              <FaMoneyBillWave />
              <span>Fee Details</span>
            </Link>
            <Link to="/profile" className="quick-action-btn">
              <FaGraduationCap />
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;