import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaGraduationCap,
  FaEdit,
  FaArrowLeft,
} from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import studentService from '../../services/studentService';
import { formatDate, calculateAge, getStatusBadgeClass } from '../../utils/helpers';
import './StudentDetail.css';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudentById(id);
      setStudent(response.data);
    } catch (error) {
      toast.error('Failed to fetch student details');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading student details..." />;
  }

  if (!student) {
    return null;
  }

  return (
    <div className="student-detail-container">
      <PageHeader
        title="Student Details"
        subtitle={`${student.firstName} ${student.lastName} - ${student.studentCode}`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button onClick={() => navigate('/students')} className="btn btn-secondary">
              <FaArrowLeft /> Back to List
            </button>
            <Link to={`/students/${student._id}/edit`} className="btn btn-primary">
              <FaEdit /> Edit Student
            </Link>
          </div>
        }
      />

      <div className="student-detail-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2 className="profile-name">
                {student.firstName} {student.lastName}
              </h2>
              <p className="profile-code">{student.studentCode}</p>
              <span className={`badge ${getStatusBadgeClass(student.status)}`}>
                {student.status}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <FaEnvelope className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{student.userId?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item">
              <FaPhone className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Contact</span>
                <span className="detail-value">{student.contactNumber}</span>
              </div>
            </div>

            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">
                  {formatDate(student.dateOfBirth)} ({calculateAge(student.dateOfBirth)} years)
                </span>
              </div>
            </div>

            {student.address && (
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {student.address.street && `${student.address.street}, `}
                    {student.address.city && `${student.address.city}, `}
                    {student.address.state && `${student.address.state} `}
                    {student.address.zipCode}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Academic Information */}
        <div className="card info-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaGraduationCap /> Academic Information
            </h3>
          </div>
          <div className="info-content">
            <div className="info-item">
              <span className="info-label">Department</span>
              <span className="info-value">{student.department}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Semester</span>
              <span className="info-value">{student.currentSemester}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Admission Year</span>
              <span className="info-value">{student.admissionYear}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Enrollment Date</span>
              <span className="info-value">{formatDate(student.enrollmentDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Blood Group</span>
              <span className="info-value">{student.bloodGroup || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">
                {student.gender?.charAt(0).toUpperCase() + student.gender?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="card info-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaUser /> Guardian Information
            </h3>
          </div>
          <div className="info-content">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{student.guardianName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Contact</span>
              <span className="info-value">{student.guardianContact}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Relation</span>
              <span className="info-value">
                {student.guardianRelation?.charAt(0).toUpperCase() +
                  student.guardianRelation?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        {student.courses && student.courses.length > 0 && (
          <div className="card info-card full-width">
            <div className="card-header">
              <h3 className="card-title">Enrolled Courses</h3>
            </div>
            <div className="courses-list">
              {student.courses.map((course) => (
                <div key={course._id} className="course-badge">
                  {course.courseCode} - {course.courseName}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;