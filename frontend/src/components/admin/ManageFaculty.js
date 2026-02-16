import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaFilter,
} from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import facultyService from '../../services/facultyService';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { DEPARTMENTS, DESIGNATIONS, FACULTY_STATUS } from '../../utils/constants';
import './ManageFaculty.css';

const ManageFaculty = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    designation: '',
    status: 'active',
    page: 1,
    limit: 10,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, [filters]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await facultyService.getAllFaculty(filters);
      setFaculty(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch faculty');
      console.error('Fetch faculty error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleDelete = async (id) => {
    try {
      await facultyService.deleteFaculty(id);
      toast.success('Faculty deleted successfully');
      setShowDeleteModal(false);
      setSelectedFaculty(null);
      fetchFaculty();
    } catch (error) {
      toast.error(error.message || 'Failed to delete faculty');
    }
  };

  const openDeleteModal = (faculty) => {
    setSelectedFaculty(faculty);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedFaculty(null);
  };

  if (loading && faculty.length === 0) {
    return <Loader message="Loading faculty..." />;
  }

  return (
    <div className="manage-faculty">
      <PageHeader
        title="Manage Faculty"
        subtitle={`Total: ${pagination.totalRecords} faculty members`}
        actions={
          <Link to="/faculty/new" className="btn btn-primary">
            <FaPlus /> Add New Faculty
          </Link>
        }
      />

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label className="filter-label">
              <FaSearch /> Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by name, code, or specialization..."
              className="form-control"
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">
              <FaFilter /> Department
            </label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Designation</label>
            <select
              name="designation"
              value={filters.designation}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Designations</option>
              {DESIGNATIONS.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              {FACULTY_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Table */}
      {faculty.length > 0 ? (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Faculty Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <strong>{member.facultyCode}</strong>
                    </td>
                    <td>
                      {member.firstName} {member.lastName}
                    </td>
                    <td>{member.department}</td>
                    <td>{member.designation}</td>
                    <td>{member.specialization}</td>
                    <td>{member.experience} years</td>
                    <td>{member.contactNumber}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/faculty/${member._id}`)}
                          className="btn-icon"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/${member._id}/edit`)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(member)}
                          className="btn-icon danger"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          title="No Faculty Found"
          message="No faculty members match your current filters."
          action={
            <Link to="/faculty/new" className="btn btn-primary">
              <FaPlus /> Add First Faculty
            </Link>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete faculty member{' '}
                <strong>
                  {selectedFaculty?.firstName} {selectedFaculty?.lastName}
                </strong>{' '}
                ({selectedFaculty?.facultyCode})?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeDeleteModal} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedFaculty._id)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaculty;