import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import PageHeader from './PageHeader';
import Loader from './Loader';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaGraduationCap,
  FaIdCard,
} from 'react-icons/fa';
import { formatDate, calculateAge } from '../../utils/helpers';
import './Profile.css';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile data
    setLoading(authLoading);
  }, [authLoading]);

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="profile-error">
        <p>Unable to load profile. Please try logging in again.</p>
      </div>
    );
  }

  const profile = user.profile || {};
  const isStudent = user.role === 'student';
  const isFaculty = user.role === 'faculty';
  const isAdmin = user.role === 'admin';

  return (
    <div className="profile-container">
      <PageHeader title="My Profile" subtitle="View your account information" />

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2 className="profile-name">
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : user.email}
              </h2>
              <p className="profile-role">{user.role?.toUpperCase()}</p>
              {(isStudent || isFaculty) && profile.studentCode && (
                <p className="profile-id">
                  <FaIdCard /> {profile.studentCode || profile.facultyCode}
                </p>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <FaEnvelope className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            {profile.contactNumber && (
              <div className="detail-item">
                <FaPhone className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Contact</span>
                  <span className="detail-value">{profile.contactNumber}</span>
                </div>
              </div>
            )}

            {profile.dateOfBirth && (
              <div className="detail-item">
                <FaCalendarAlt className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-value">
                    {formatDate(profile.dateOfBirth)} ({calculateAge(profile.dateOfBirth)}{' '}
                    years)
                  </span>
                </div>
              </div>
            )}

            {profile.address && (
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {profile.address.street && `${profile.address.street}, `}
                    {profile.address.city && `${profile.address.city}, `}
                    {profile.address.state && `${profile.address.state} `}
                    {profile.address.zipCode}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student-specific Information */}
        {isStudent && (
          <div className="card info-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaGraduationCap /> Academic Information
              </h3>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{profile.department || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Semester</span>
                <span className="info-value">{profile.currentSemester || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Admission Year</span>
                <span className="info-value">{profile.admissionYear || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Enrollment Date</span>
                <span className="info-value">
                  {formatDate(profile.enrollmentDate) || 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Blood Group</span>
                <span className="info-value">{profile.bloodGroup || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Faculty-specific Information */}
        {isFaculty && (
          <div className="card info-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaBriefcase /> Professional Information
              </h3>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{profile.department || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Designation</span>
                <span className="info-value">{profile.designation || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Qualification</span>
                <span className="info-value">{profile.qualification || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Specialization</span>
                <span className="info-value">{profile.specialization || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Experience</span>
                <span className="info-value">
                  {profile.experience ? `${profile.experience} years` : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Joining Date</span>
                <span className="info-value">
                  {formatDate(profile.joiningDate) || 'N/A'}
                </span>
              </div>
              {profile.officeLocation && (
                <div className="info-item">
                  <span className="info-label">Office Location</span>
                  <span className="info-value">
                    {profile.officeLocation.building} - Room{' '}
                    {profile.officeLocation.roomNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guardian Information (for students) */}
        {isStudent && profile.guardianName && (
          <div className="card info-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaUser /> Guardian Information
              </h3>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{profile.guardianName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact</span>
                <span className="info-value">{profile.guardianContact}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Relation</span>
                <span className="info-value">
                  {profile.guardianRelation?.charAt(0).toUpperCase() +
                    profile.guardianRelation?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Admin Information */}
        {isAdmin && (
          <div className="card info-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaBriefcase /> Administrator Information
              </h3>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value">System Administrator</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login</span>
                <span className="info-value">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Status</span>
                <span className="info-value">
                  <span className="badge badge-success">Active</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;