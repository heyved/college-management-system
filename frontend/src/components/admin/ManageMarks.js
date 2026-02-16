import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import marksService from '../../services/marksService';
import courseService from '../../services/courseService';
import { getGradeBadgeClass } from '../../utils/helpers';
import { EXAM_TYPES } from '../../utils/constants';

const ManageMarks = () => {
  const navigate = useNavigate();
  const [marks, setMarks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    course: '',
    semester: '',
    examType: '',
    page: 1,
    limit: 10,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMark, setSelectedMark] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchMarks();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAllCourses({ limit: 100, status: 'active' });
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const response = await marksService.getAllMarks(filters);
      setMarks(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch marks');
      console.error('Fetch marks error:', error);
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
      await marksService.deleteMarks(id);
      toast.success('Marks deleted successfully');
      setShowDeleteModal(false);
      setSelectedMark(null);
      fetchMarks();
    } catch (error) {
      toast.error(error.message || 'Failed to delete marks');
    }
  };

  const handlePublish = async (id) => {
    try {
      await marksService.publishMarks(id);
      toast.success('Marks published successfully');
      fetchMarks();
    } catch (error) {
      toast.error(error.message || 'Failed to publish marks');
    }
  };

  const openDeleteModal = (mark) => {
    setSelectedMark(mark);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedMark(null);
  };

  if (loading && marks.length === 0) {
    return <Loader message="Loading marks..." />;
  }

  return (
    <div className="manage-marks">
      <PageHeader
        title="Manage Marks"
        subtitle={`Total: ${pagination.totalRecords} records`}
        actions={
          <Link to="/marks/new" className="btn btn-primary">
            <FaPlus /> Enter Marks
          </Link>
        }
      />

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label className="filter-label">
              <FaFilter /> Course
            </label>
            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} - {course.courseName}
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

          <div className="filter-item">
            <label className="filter-label">Exam Type</label>
            <select
              name="examType"
              value={filters.examType}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Types</option>
              {EXAM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      {marks.length > 0 ? (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark) => (
                  <tr key={mark._id}>
                    <td>
                      <div>
                        <strong>
                          {mark.student?.firstName} {mark.student?.lastName}
                        </strong>
                        <br />
                        <small>{mark.student?.studentCode}</small>
                      </div>
                    </td>
                    <td>{mark.course?.courseName}</td>
                    <td>{mark.semester}</td>
                    <td>
                      <span className="badge badge-info">{mark.examType}</span>
                    </td>
                    <td>
                      <strong>
                        {mark.marksObtained}/{mark.totalMarks}
                      </strong>
                    </td>
                    <td>{mark.percentage?.toFixed(2)}%</td>
                    <td>
                      <span className={`badge ${getGradeBadgeClass(mark.grade)}`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td>
                      {mark.isPublished ? (
                        <span className="badge badge-success">Published</span>
                      ) : (
                        <span className="badge badge-warning">Draft</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!mark.isPublished && (
                          <button
                            onClick={() => handlePublish(mark._id)}
                            className="btn-icon success"
                            title="Publish"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/marks/${mark._id}/edit`)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(mark)}
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
          title="No Marks Found"
          message="No marks records match your current filters."
          action={
            <Link to="/marks/new" className="btn btn-primary">
              <FaPlus /> Enter First Marks
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
              <p>Are you sure you want to delete this marks record?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeDeleteModal} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedMark._id)}
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

export default ManageMarks;