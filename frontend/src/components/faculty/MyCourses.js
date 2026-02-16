import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBook, FaUserGraduate, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import courseService from '../../services/courseService';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses({ limit: 100 });
      
      // Filter courses assigned to this faculty
      const myCourses = response.data.filter(
        (course) => course.faculty?._id === user.facultyId
      );
      
      setCourses(myCourses);
    } catch (error) {
      toast.error('Failed to fetch courses');
      console.error('Fetch courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your courses..." />;
  }

  return (
    <div className="my-courses">
      <PageHeader
        title="My Courses"
        subtitle={`You are teaching ${courses.length} course${courses.length !== 1 ? 's' : ''}`}
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
                <p className="course-description">{course.description}</p>

                <div className="course-meta-grid">
                  <div className="meta-item">
                    <FaUserGraduate />
                    <span>{course.enrolledStudents?.length || 0} Students</span>
                  </div>
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
                <Link
                  to={`/courses/${course._id}`}
                  className="btn btn-outline btn-sm"
                >
                  View Details
                </Link>
                <Link
                  to={`/enter-marks?course=${course._id}`}
                  className="btn btn-primary btn-sm"
                >
                  Enter Marks
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FaBook}
          title="No Courses Assigned"
          message="You don't have any courses assigned yet. Contact the administrator for course assignments."
        />
      )}
    </div>
  );
};

export default MyCourses;