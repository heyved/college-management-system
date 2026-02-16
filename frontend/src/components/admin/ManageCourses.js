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
  FaUserGraduate,
} from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import courseService from '../../services/courseService';
import { getStatusBadgeClass } from '../../utils/helpers';
import { DEPARTMENTS, COURSE_TYPES, COURSE_STATUS } from '../../utils/constants';
import './ManageCourses.css';

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    semester: '',
    courseType: '',
    status: 'active',
    page: 1,
    limit: 10,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses(filters);
      setCourses(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch courses');
      console.error('Fetch courses error:', error);
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
      await courseService.deleteCourse(id);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedCourse(null);
  };

  if (loading && courses.length === 0) {
    return <Loader message="Loading courses..." />;
  }

  return (
    <div className="manage-courses">
      <PageHeader
        title="Manage Courses"
        subtitle={`Total: ${pagination.totalRecords} courses`}
        actions={
          <Link to="/courses/new" className="btn btn-primary">
            <FaPlus /> Add New Course
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
              placeholder="Search by name or code..."
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
            <label className="filter-label">Course Type</label>
            <select
              name="courseType"
              value={filters.courseType}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Types</option>
              {COURSE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
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
              {COURSE_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      {courses.length > 0 ? (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Type</th>
                  <th>Faculty</th>
                  <th>Enrollment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.courseCode}</strong>
                    </td>
                    <td>{course.courseName}</td>
                    <td>{course.department}</td>
                    <td>{course.semester}</td>
                    <td>{course.credits}</td>
                    <td>
                      <span className="badge badge-info">{course.courseType}</span>
                    </td>
                    <td>
                      {course.faculty
                        ? `${course.faculty.firstName} ${course.faculty.lastName}`
                        : 'Not Assigned'}
                    </td>
                    <td>
                      <span className="enrollment-info">
                        <FaUserGraduate /> {course.enrolledStudents?.length || 0}/
                        {course.maxStudents}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(course.status)}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/courses/${course._id}`)}
                          className="btn-icon"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => navigate(`/courses/${course._id}/edit`)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(course)}
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
          title="No Courses Found"
          message="No courses match your current filters."
          action={
            <Link to="/courses/new" className="btn btn-primary">
              <FaPlus /> Add First Course
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
                Are you sure you want to delete course{' '}
                <strong>{selectedCourse?.courseName}</strong> (
                {selectedCourse?.courseCode})?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeDeleteModal} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedCourse._id)}
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

export default ManageCourses;