import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import feesService from '../../services/feesService';
import { formatCurrency, getStatusBadgeClass } from '../../utils/helpers';
import { FEE_STATUS } from '../../utils/constants';

const ManageFees = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    status: '',
    semester: '',
    page: 1,
    limit: 10,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  useEffect(() => {
    fetchFees();
  }, [filters]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feesService.getAllFees(filters);
      setFees(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch fees');
      console.error('Fetch fees error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleDelete = async (id) => {
    try {
      await feesService.deleteFee(id);
      toast.success('Fee record deleted successfully');
      setShowDeleteModal(false);
      setSelectedFee(null);
      fetchFees();
    } catch (error) {
      toast.error(error.message || 'Failed to delete fee record');
    }
  };

  const openDeleteModal = (fee) => {
    setSelectedFee(fee);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedFee(null);
  };

  if (loading && fees.length === 0) {
    return <Loader message="Loading fees..." />;
  }

  return (
    <div className="manage-fees">
      <PageHeader
        title="Manage Fees"
        subtitle={`Total: ${pagination.totalRecords} records`}
        actions={
          <Link to="/fees/new" className="btn btn-primary">
            <FaPlus /> Add Fee Record
          </Link>
        }
      />

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label className="filter-label">
              <FaFilter /> Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Status</option>
              {FEE_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Semester</label>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      {fees.length > 0 ? (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Academic Year</th>
                  <th>Semester</th>
                  <th>Fee Type</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Due Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee._id}>
                    <td>
                      <div>
                        <strong>
                          {fee.student?.firstName} {fee.student?.lastName}
                        </strong>
                        <br />
                        <small>{fee.student?.studentCode}</small>
                      </div>
                    </td>
                    <td>{fee.academicYear}</td>
                    <td>{fee.semester}</td>
                    <td>
                      <span className="badge badge-info">{fee.feeType}</span>
                    </td>
                    <td>{formatCurrency(fee.totalAmount)}</td>
                    <td className="text-success">
                      <strong>{formatCurrency(fee.paidAmount)}</strong>
                    </td>
                    <td className="text-danger">
                      <strong>{formatCurrency(fee.dueAmount)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(fee.status)}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/fees/${fee._id}/payment`)}
                          className="btn-icon success"
                          title="Add Payment"
                          disabled={fee.status === 'paid'}
                        >
                          <FaMoneyBillWave />
                        </button>
                        <button
                          onClick={() => navigate(`/fees/${fee._id}/edit`)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(fee)}
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
          title="No Fee Records Found"
          message="No fee records match your current filters."
          action={
            <Link to="/fees/new" className="btn btn-primary">
              <FaPlus /> Add First Fee Record
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
              <p>Are you sure you want to delete this fee record?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeDeleteModal} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedFee._id)}
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

export default ManageFees;