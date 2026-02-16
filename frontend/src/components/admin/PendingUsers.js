import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaUserClock,
  FaCheck,
  FaTimes,
  FaSearch,
  FaUserPlus,
} from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import userService from '../../services/userService';
import { formatDate } from '../../utils/helpers';
import { DEPARTMENTS, GENDERS } from '../../utils/constants';
import './PendingUsers.css';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [approvalData, setApprovalData] = useState({
    role: 'student',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    department: '',
    currentSemester: 1,
    admissionYear: new Date().getFullYear(),
    // Faculty specific
    designation: '',
    qualification: '',
    specialization: '',
    experience: 0,
  });

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPendingUsers();
  }, [page]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getPendingUsers({ page, limit: 10 });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch pending users');
      console.error('Fetch pending users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (user) => {
    setSelectedUser(user);
    setApprovalData({
      role: 'student',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      contactNumber: '',
      department: '',
      currentSemester: 1,
      admissionYear: new Date().getFullYear(),
      designation: '',
      qualification: '',
      specialization: '',
      experience: 0,
    });
    setShowApproveModal(true);
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };

  const closeModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedUser(null);
  };

  const handleApprovalDataChange = (e) => {
    const { name, value } = e.target;
    setApprovalData({ ...approvalData, [name]: value });
  };

  const handleApprove = async () => {
    try {
      // Validate required fields
      if (!approvalData.firstName || !approvalData.lastName) {
        toast.error('First name and last name are required');
        return;
      }

      if (!approvalData.dateOfBirth || !approvalData.gender || !approvalData.contactNumber) {
        toast.error('Date of birth, gender, and contact number are required');
        return;
      }

      if (!approvalData.department) {
        toast.error('Department is required');
        return;
      }

      // Prepare profile data based on role
      const profileData = {
        firstName: approvalData.firstName,
        lastName: approvalData.lastName,
        dateOfBirth: approvalData.dateOfBirth,
        gender: approvalData.gender,
        contactNumber: approvalData.contactNumber,
        department: approvalData.department,
      };

      if (approvalData.role === 'student') {
        profileData.currentSemester = parseInt(approvalData.currentSemester);
        profileData.admissionYear = parseInt(approvalData.admissionYear);
        profileData.guardianName = approvalData.guardianName || 'To be updated';
        profileData.guardianContact = approvalData.guardianContact || '0000000000';
        profileData.guardianRelation = 'other';
      } else if (approvalData.role === 'faculty') {
        if (!approvalData.designation || !approvalData.qualification || !approvalData.specialization) {
          toast.error('Designation, qualification, and specialization are required for faculty');
          return;
        }
        profileData.designation = approvalData.designation;
        profileData.qualification = approvalData.qualification;
        profileData.specialization = approvalData.specialization;
        profileData.experience = parseInt(approvalData.experience);
        profileData.joiningDate = new Date();
        profileData.salary = 50000; // Default salary, can be updated later
      }

      await userService.approveUser(selectedUser._id, {
        role: approvalData.role,
        profileData,
      });

      toast.success(`User approved as ${approvalData.role} successfully`);
      closeModals();
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to approve user');
    }
  };

  const handleReject = async () => {
    try {
      await userService.rejectUser(selectedUser._id);
      toast.success('User registration rejected');
      closeModals();
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to reject user');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading && users.length === 0) {
    return <Loader message="Loading pending users..." />;
  }

  return (
    <div className="pending-users">
      <PageHeader
        title="Pending User Approvals"
        subtitle={`${pagination.totalRecords} user${
          pagination.totalRecords !== 1 ? 's' : ''
        } waiting for approval`}
      />

      {users.length > 0 ? (
        <>
          <div className="pending-users-grid">
            {users.map((user) => (
              <div key={user._id} className="pending-user-card">
                <div className="pending-user-header">
                  <div className="user-avatar">
                    <FaUserClock />
                  </div>
                  <div className="user-info">
                    <h3 className="user-email">{user.email}</h3>
                    <p className="user-date">
                      Registered: {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="pending-user-body">
                  <div className="user-detail">
                    <span className="detail-label">Status:</span>
                    <span className="badge badge-warning">Pending Approval</span>
                  </div>
                  <div className="user-detail">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="pending-user-actions">
                  <button
                    onClick={() => openApproveModal(user)}
                    className="btn btn-success btn-sm"
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(user)}
                    className="btn btn-danger btn-sm"
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={FaUserPlus}
          title="No Pending Users"
          message="There are no users waiting for approval at the moment."
        />
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedUser && (
        <div className="modal-backdrop" onClick={closeModals}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Approve User Registration</h3>
            </div>
            <div className="modal-body">
              <p className="modal-intro">
                Approve <strong>{selectedUser.email}</strong> and create their profile.
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Assign Role *</label>
                  <select
                    name="role"
                    value={approvalData.role}
                    onChange={handleApprovalDataChange}
                    className="form-control"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={approvalData.firstName}
                    onChange={handleApprovalDataChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={approvalData.lastName}
                    onChange={handleApprovalDataChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={approvalData.dateOfBirth}
                    onChange={handleApprovalDataChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    value={approvalData.gender}
                    onChange={handleApprovalDataChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map((gender) => (
                      <option key={gender.value} value={gender.value}>
                        {gender.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={approvalData.contactNumber}
                    onChange={handleApprovalDataChange}
                    className="form-control"
                    placeholder="10-digit number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    name="department"
                    value={approvalData.department}
                    onChange={handleApprovalDataChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student specific fields */}
                {approvalData.role === 'student' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Current Semester</label>
                      <input
                        type="number"
                        name="currentSemester"
                        value={approvalData.currentSemester}
                        onChange={handleApprovalDataChange}
                        className="form-control"
                        min="1"
                        max="8"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Admission Year</label>
                      <input
                        type="number"
                        name="admissionYear"
                        value={approvalData.admissionYear}
                        onChange={handleApprovalDataChange}
                        className="form-control"
                      />
                    </div>
                  </>
                )}

                {/* Faculty specific fields */}
                {approvalData.role === 'faculty' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Designation *</label>
                      <select
                        name="designation"
                        value={approvalData.designation}
                        onChange={handleApprovalDataChange}
                        className="form-control"
                        required
                      >
                        <option value="">Select Designation</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Qualification *</label>
                      <select
                        name="qualification"
                        value={approvalData.qualification}
                        onChange={handleApprovalDataChange}
                        className="form-control"
                        required
                      >
                        <option value="">Select Qualification</option>
                        <option value="PhD">PhD</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="M.E">M.E</option>
                        <option value="M.Sc">M.Sc</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={approvalData.specialization}
                        onChange={handleApprovalDataChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Experience (years)</label>
                      <input
                        type="number"
                        name="experience"
                        value={approvalData.experience}
                        onChange={handleApprovalDataChange}
                        className="form-control"
                        min="0"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModals} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleApprove} className="btn btn-success">
                <FaCheck /> Approve User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="modal-backdrop" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject User Registration</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to reject the registration for{' '}
                <strong>{selectedUser.email}</strong>?
              </p>
              <p className="warning-text">
                This will deactivate their account and they won't be able to login.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={closeModals} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleReject} className="btn btn-danger">
                <FaTimes /> Reject User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;