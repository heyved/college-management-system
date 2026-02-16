import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaCalendarAlt, FaClipboardList, FaUserGraduate } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';

const ViewCourses = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Get courses directly from user profile (already loaded in AuthContext)
  const courses = user?.profile?.courses || [];

  useEffect(() => {
    // Just set loading to false since data is already in user object
    setLoading(false);
  }, []);

  if (loading) {
    return <Loader message="Loading your courses..." />;
  }

  return (
    <div className="view-courses">
      <PageHeader
        title="My Courses"
        subtitle={`You are enrolled in ${courses.length} course${courses.length !== 1 ? 's' : ''}`}
      />

      {courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-card-header">
                <div className="course-icon">
                  <FaBook />
                </div>
                <div className="course-code-badge">{course.courseCode}</div>
              </div>

              <div className="course-card-body">
                <h3 className="course-title">{course.courseName}</h3>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}

                <div className="course-meta-grid">
                  {course.enrolledStudents && (
                    <div className="meta-item">
                      <FaUserGraduate />
                      <span>{course.enrolledStudents.length} Students</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <FaCalendarAlt />
                    <span>Semester {course.semester}</span>
                  </div>
                  <div className="meta-item">
                    <FaClipboardList />
                    <span>{course.credits} Credits</span>
                  </div>
                  <div className="meta-item">
                    <span className="badge badge-info">{course.courseType}</span>
                  </div>
                </div>

                {course.faculty && (
                  <div className="course-faculty">
                    <strong>Faculty:</strong> {course.faculty.firstName}{' '}
                    {course.faculty.lastName}
                  </div>
                )}

                {course.schedule && course.schedule.days && course.schedule.days.length > 0 && (
                  <div className="course-schedule">
                    <strong>Schedule:</strong>
                    <p>
                      {course.schedule.days.join(', ')}
                      {course.schedule.startTime && course.schedule.endTime && (
                        <> • {course.schedule.startTime} - {course.schedule.endTime}</>
                      )}
                      {course.schedule.room && <> • {course.schedule.room}</>}
                    </p>
                  </div>
                )}
              </div>

              <div className="course-card-footer">
                <button className="btn btn-outline btn-sm" disabled>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FaBook}
          title="No Courses Enrolled"
          message="You are not enrolled in any courses yet. Please contact the administrator."
        />
      )}
    </div>
  );
};

export default ViewCourses;