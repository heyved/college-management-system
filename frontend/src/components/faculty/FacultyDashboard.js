import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FaBook,
  FaUserGraduate,
  FaClipboardList,
  FaCalendarAlt,
} from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import StatsCard from '../common/StatsCard';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import courseService from '../../services/courseService';
import marksService from '../../services/marksService';
import { formatDate } from '../../utils/helpers';
import './Dashboard.css';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingMarks: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!user?.facultyId) {
        toast.error('Faculty profile not found');
        return;
      }

      // Fetch all courses to filter by faculty
      const coursesResponse = await courseService.getAllCourses({ limit: 100 });
      
      // Filter courses assigned to this faculty
      const myCourses = coursesResponse.data.filter(
        (course) => course.faculty?._id === user.facultyId
      );

      setCourses(myCourses);

      // Calculate total students
      const totalStudents = myCourses.reduce(
        (sum, course) => sum + (course.enrolledStudents?.length || 0),
        0
      );

      setStats({
        totalCourses: myCourses.length,
        totalStudents,
        pendingMarks: 0, // This would need actual implementation
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
        title={`Welcome, ${user?.profile?.firstName || 'Faculty'}!`}
        subtitle="Manage your courses and student performance"
      />

      <div className="stats-grid">
        <StatsCard
          title="My Courses"
          value={stats.totalCourses}
          icon={FaBook}
          color="primary"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={FaUserGraduate}
          color="success"
        />
        <StatsCard
          title="Pending Evaluations"
          value={stats.pendingMarks}
          icon={FaClipboardList}
          color="warning"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h3 className="card-title">
              <FaBook /> My Courses
            </h3>
            <Link to="/my-courses" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>
          <div className="courses-list">
            {courses.length > 0 ? (
              courses.slice(0, 5).map((course) => (
                <div key={course._id} className="course-item">
                  <div className="course-info">
                    <h4 className="course-name">{course.courseName}</h4>
                    <p className="course-code">{course.courseCode}</p>
                  </div>
                  <div className="course-meta">
                    <span className="course-students">
                      <FaUserGraduate />{' '}
                      {course.enrolledStudents?.length || 0} students
                    </span>
                    <span className="course-semester">
                      Semester {course.semester}
                    </span>
                  </div>
                  <div className="course-actions">
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </Link>
                    <Link
                      to={`/enter-marks?course=${course._id}`}
                      className="btn btn-sm btn-primary"
                    >
                      Enter Marks
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={FaBook}
                title="No Courses Assigned"
                message="You don't have any courses assigned yet. Contact the administrator."
              />
            )}
          </div>
        </div>

        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions vertical">
            <Link to="/my-courses" className="quick-action-btn">
              <FaBook />
              <span>View My Courses</span>
            </Link>
            <Link to="/students" className="quick-action-btn">
              <FaUserGraduate />
              <span>View Students</span>
            </Link>
            <Link to="/enter-marks" className="quick-action-btn">
              <FaClipboardList />
              <span>Enter Marks</span>
            </Link>
            <Link to="/profile" className="quick-action-btn">
              <FaCalendarAlt />
              <span>My Schedule</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;